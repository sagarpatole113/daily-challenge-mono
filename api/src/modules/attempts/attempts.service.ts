import { z } from "zod";
import { db, FieldValue, Timestamp } from "../../config/firebase";
import { AppError } from "../../utils/AppError";
import {
  getDailyProgress,
  isTestUnlocked,
  markTestCompleted,
} from "../progress/progress.service";
import {
  calculateAccuracy,
  calculateScore,
  EXAM_CONFIG,
} from "@shared/index";
import type {
  AttemptResult,
  QuestionAnswerStatus,
  QuestionPublic,
  ReviewQuestionItem,
  TestAttempt,
} from "@shared/index";

export const saveAnswerSchema = z.object({
  questionId: z.string().min(1),
  selectedOptionId: z.string().nullable(),
  status: z.enum([
    "NOT_VISITED",
    "NOT_ANSWERED",
    "ANSWERED",
    "MARKED_FOR_REVIEW",
    "ANSWERED_AND_MARKED",
  ]),
});

const userRef = (userId: string) => db.collection("users").doc(userId);
const attemptsCol = (userId: string) => userRef(userId).collection("testAttempts");
const answersCol = (userId: string, attemptId: string) =>
  attemptsCol(userId).doc(attemptId).collection("answers");

// ---------------------------------------------------------------------------
// START TEST
// ---------------------------------------------------------------------------

export async function startTest(userId: string, dayId: string, testId: string) {
  const dayDoc = await db.collection("dailyTestBatches").doc(dayId).get();
  if (!dayDoc.exists) throw AppError.notFound("Day not found");

  const testDoc = await dayDoc.ref.collection("tests").doc(testId).get();
  if (!testDoc.exists) throw AppError.notFound("Test not found");
  const test = testDoc.data()!;

  // ---- SERVER-SIDE UNLOCK VALIDATION (never trust the client) ----
  const progress = await getDailyProgress(userId, dayId);
  if (!isTestUnlocked(test.testNumber, progress)) {
    throw AppError.forbidden(
      `Test ${test.testNumber} is locked. Complete test ${test.testNumber - 1} first.`
    );
  }

  // Reuse an existing IN_PROGRESS attempt for this test, if any.
  const existingSnap = await attemptsCol(userId)
    .where("testId", "==", testId)
    .where("status", "==", "IN_PROGRESS")
    .limit(1)
    .get();

  let attemptId: string;
  let attemptData: FirebaseFirestore.DocumentData;

  if (!existingSnap.empty) {
    attemptId = existingSnap.docs[0].id;
    attemptData = existingSnap.docs[0].data();

    // If time has already passed while the client was away, auto-expire now
    // and surface the finalized result instead of an active attempt.
    const expiresAt: Date = attemptData.expiresAt.toDate();
    if (expiresAt.getTime() <= Date.now()) {
      const result = await finalizeAttempt(userId, attemptId, "TIME_EXPIRED");
      return {
        attemptId,
        expired: true as const,
        result,
      };
    }
  } else {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + EXAM_CONFIG.DURATION_MS);

    const ref = attemptsCol(userId).doc();
    attemptId = ref.id;
    const newAttempt = {
      id: attemptId,
      userId,
      dayId,
      testId,
      testNumber: test.testNumber,
      status: "IN_PROGRESS" as const,
      startedAt: Timestamp.fromDate(now),
      expiresAt: Timestamp.fromDate(expiresAt),
      submittedAt: null,
      score: null,
      correctAnswers: null,
      wrongAnswers: null,
      unansweredQuestions: null,
      accuracy: null,
      timeTakenSeconds: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    await ref.set(newAttempt);
    attemptData = newAttempt;

    // Pre-seed answer docs as NOT_VISITED so palette state is consistent from question 1.
    const mappingSnap = await testDoc.ref
      .collection("questions")
      .orderBy("questionNumber", "asc")
      .get();
    const batch = db.batch();
    mappingSnap.docs.forEach((m) => {
      const qId = m.data().questionId as string;
      batch.set(answersCol(userId, attemptId).doc(qId), {
        questionId: qId,
        selectedOptionId: null,
        status: "NOT_VISITED",
        answeredAt: null,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });
    await batch.commit();
  }

  const questions = await loadMaskedQuestionsForTest(dayId, testId);

  return {
    attemptId,
    startedAt: attemptData.startedAt.toDate().toISOString(),
    expiresAt: attemptData.expiresAt.toDate().toISOString(),
    durationMinutes: test.durationMinutes,
    questions,
  };
}

async function loadMaskedQuestionsForTest(
  dayId: string,
  testId: string
): Promise<QuestionPublic[]> {
  const mappingSnap = await db
    .collection("dailyTestBatches")
    .doc(dayId)
    .collection("tests")
    .doc(testId)
    .collection("questions")
    .orderBy("questionNumber", "asc")
    .get();

  const ids = mappingSnap.docs.map((d) => d.data().questionId as string);
  const numByI = new Map(ids.map((id, idx) => [id, mappingSnap.docs[idx].data().questionNumber as number]));

  const out: QuestionPublic[] = [];
  for (let i = 0; i < ids.length; i += 30) {
    const c = ids.slice(i, i + 30);
    const snap = await db.collection("questions").where("__name__", "in", c).get();
    snap.docs.forEach((qd) => {
      const q = qd.data();
      out.push({
        id: qd.id,
        questionNumber: numByI.get(qd.id)!,
        subject: q.subject,
        topic: q.topic,
        difficulty: q.difficulty,
        questionEnglish: q.questionEnglish,
        questionMarathi: q.questionMarathi,
        options: q.options,
      });
    });
  }
  out.sort((a, b) => a.questionNumber - b.questionNumber);
  return out;
}

// ---------------------------------------------------------------------------
// SAVE ANSWER
// ---------------------------------------------------------------------------

export async function saveAnswer(
  userId: string,
  attemptId: string,
  input: z.infer<typeof saveAnswerSchema>
) {
  const attemptDoc = await attemptsCol(userId).doc(attemptId).get();
  if (!attemptDoc.exists) throw AppError.notFound("Attempt not found");
  const attempt = attemptDoc.data()!;

  if (attempt.status !== "IN_PROGRESS") {
    throw AppError.conflict("Cannot modify answers on a completed attempt");
  }

  const expiresAt: Date = attempt.expiresAt.toDate();
  if (expiresAt.getTime() <= Date.now()) {
    await finalizeAttempt(userId, attemptId, "TIME_EXPIRED");
    throw AppError.conflict("Test time has expired. Attempt has been auto-submitted.");
  }

  await answersCol(userId, attemptId).doc(input.questionId).set(
    {
      questionId: input.questionId,
      selectedOptionId: input.selectedOptionId,
      status: input.status as QuestionAnswerStatus,
      answeredAt: input.selectedOptionId ? FieldValue.serverTimestamp() : null,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return { saved: true };
}

// ---------------------------------------------------------------------------
// GET ATTEMPT (reopen app)
// ---------------------------------------------------------------------------

export async function getAttempt(userId: string, attemptId: string) {
  const doc = await attemptsCol(userId).doc(attemptId).get();
  if (!doc.exists) throw AppError.notFound("Attempt not found");
  const a = doc.data()!;

  // Auto-expire on read if time has passed but status still IN_PROGRESS.
  if (a.status === "IN_PROGRESS") {
    const expiresAt: Date = a.expiresAt.toDate();
    if (expiresAt.getTime() <= Date.now()) {
      await finalizeAttempt(userId, attemptId, "TIME_EXPIRED");
      const refreshed = await attemptsCol(userId).doc(attemptId).get();
      return serializeAttempt(refreshed.data()!);
    }
  }

  const answersSnap = await answersCol(userId, attemptId).get();
  const answers = answersSnap.docs.map((d) => d.data());

  return { ...serializeAttempt(a), answers };
}

function serializeAttempt(a: FirebaseFirestore.DocumentData): TestAttempt {
  return {
    id: a.id,
    userId: a.userId,
    dayId: a.dayId,
    testId: a.testId,
    testNumber: a.testNumber,
    status: a.status,
    startedAt: a.startedAt.toDate().toISOString(),
    expiresAt: a.expiresAt.toDate().toISOString(),
    submittedAt: a.submittedAt?.toDate?.().toISOString?.() ?? null,
    score: a.score ?? null,
    correctAnswers: a.correctAnswers ?? null,
    wrongAnswers: a.wrongAnswers ?? null,
    unansweredQuestions: a.unansweredQuestions ?? null,
    accuracy: a.accuracy ?? null,
    timeTakenSeconds: a.timeTakenSeconds ?? null,
    createdAt: a.createdAt?.toDate?.().toISOString?.() ?? "",
    updatedAt: a.updatedAt?.toDate?.().toISOString?.() ?? "",
  };
}

// ---------------------------------------------------------------------------
// SUBMIT (manual)
// ---------------------------------------------------------------------------

export async function submitAttempt(userId: string, attemptId: string): Promise<AttemptResult> {
  const attemptDoc = await attemptsCol(userId).doc(attemptId).get();
  if (!attemptDoc.exists) throw AppError.notFound("Attempt not found");
  const attempt = attemptDoc.data()!;

  if (attempt.status !== "IN_PROGRESS") {
    // Already finalized — return existing result (idempotent).
    return buildResultFromAttempt(attempt);
  }

  // If time already passed, this is really an expiry, not a manual submit.
  const expiresAt: Date = attempt.expiresAt.toDate();
  const status = expiresAt.getTime() <= Date.now() ? "TIME_EXPIRED" : "COMPLETED";

  return finalizeAttempt(userId, attemptId, status);
}

// ---------------------------------------------------------------------------
// EXPIRE (timer-driven)
// ---------------------------------------------------------------------------

export async function expireAttempt(userId: string, attemptId: string): Promise<AttemptResult> {
  const attemptDoc = await attemptsCol(userId).doc(attemptId).get();
  if (!attemptDoc.exists) throw AppError.notFound("Attempt not found");
  const attempt = attemptDoc.data()!;

  if (attempt.status !== "IN_PROGRESS") {
    return buildResultFromAttempt(attempt);
  }

  // CRITICAL: verify expiresAt has actually passed server-side.
  // A client cannot force-expire an attempt early.
  const expiresAt: Date = attempt.expiresAt.toDate();
  if (expiresAt.getTime() > Date.now()) {
    throw AppError.forbidden(
      "Attempt has not yet expired. Use /submit to submit manually."
    );
  }

  return finalizeAttempt(userId, attemptId, "TIME_EXPIRED");
}

// ---------------------------------------------------------------------------
// FINALIZE — shared scoring + progression logic for submit AND expire
// ---------------------------------------------------------------------------

async function finalizeAttempt(
  userId: string,
  attemptId: string,
  status: "COMPLETED" | "TIME_EXPIRED"
): Promise<AttemptResult> {
  const attemptRef = attemptsCol(userId).doc(attemptId);
  const attemptDoc = await attemptRef.get();
  const attempt = attemptDoc.data()!;

  // Re-check in case of race (another request already finalized it).
  if (attempt.status !== "IN_PROGRESS") {
    return buildResultFromAttempt(attempt);
  }

  const answersSnap = await answersCol(userId, attemptId).get();
  const answerByQuestionId = new Map(
    answersSnap.docs.map((d) => [d.id, d.data()])
  );

  // Load correct answers server-side only (never trust client for correctness).
  const questionIds = Array.from(answerByQuestionId.keys());
  const correctOptionByQ = new Map<string, string>();
  for (let i = 0; i < questionIds.length; i += 30) {
    const c = questionIds.slice(i, i + 30);
    const snap = await db.collection("questions").where("__name__", "in", c).get();
    snap.docs.forEach((qd) => correctOptionByQ.set(qd.id, qd.data().correctOptionId));
  }

  let correct = 0;
  let wrong = 0;
  let unanswered = 0;

  for (const qId of questionIds) {
    const ans = answerByQuestionId.get(qId);
    const selected = ans?.selectedOptionId ?? null;
    if (!selected) {
      unanswered++;
      continue;
    }
    if (selected === correctOptionByQ.get(qId)) correct++;
    else wrong++;
  }

  const score = calculateScore(correct, wrong);
  const attempted = correct + wrong;
  const accuracy = calculateAccuracy(correct, attempted);

  const startedAt: Date = attempt.startedAt.toDate();
  const now = new Date();
  const cappedNow =
    status === "TIME_EXPIRED"
      ? attempt.expiresAt.toDate() // exact 60:00 if truly expired
      : now;
  const timeTakenSeconds = Math.max(
    0,
    Math.round((cappedNow.getTime() - startedAt.getTime()) / 1000)
  );

  await attemptRef.update({
    status,
    submittedAt: FieldValue.serverTimestamp(),
    score,
    correctAnswers: correct,
    wrongAnswers: wrong,
    unansweredQuestions: unanswered,
    accuracy,
    timeTakenSeconds,
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Update daily progress + unlock next test.
  await markTestCompleted(userId, attempt.dayId, attempt.testId, attempt.testNumber);

  // Update aggregate user stats. `bestScore` needs a read-then-compare
  // (Firestore's Admin SDK has no atomic "max" FieldValue), so it's done
  // inside a transaction alongside the other increments to avoid a lost
  // update if two attempts ever finish in quick succession.
  //
  // BUGFIX: this used tx.update(ref, ...), which THROWS if the
  // `users/{userId}` document doesn't exist yet (e.g. signup's
  // profile-creation step never completed, or ran after the user had
  // already started taking tests). Because that failure happened after
  // attemptRef.update() and markTestCompleted() above had already
  // committed, the attempt still ended up fully scored and "COMPLETED",
  // and submitAttempt()'s idempotent short-circuit meant a retry just
  // returned that cached result — so the whole thing looked successful
  // to the user while this stats update silently, permanently failed
  // every time. tx.set(..., { merge: true }) creates the doc from these
  // fields if it's missing instead of throwing, so a test completion can
  // never again finish "successfully" while dropping the user's stats.
  await db.runTransaction(async (tx) => {
    const ref = userRef(userId);
    const snap = await tx.get(ref);
    const currentBest = (snap.data()?.bestScore as number | undefined) ?? 0;
    tx.set(
      ref,
      {
        totalTestsCompleted: FieldValue.increment(1),
        totalQuestionsAttempted: FieldValue.increment(attempted + unanswered),
        totalCorrectAnswers: FieldValue.increment(correct),
        totalWrongAnswers: FieldValue.increment(wrong),
        totalScore: FieldValue.increment(score),
        bestScore: Math.max(currentBest, score),
        currentDayId: attempt.dayId,
        currentTestNumber: attempt.testNumber + 1,
        lastActiveAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  });

  return {
    attemptId,
    testId: attempt.testId,
    testNumber: attempt.testNumber,
    dayId: attempt.dayId,
    status,
    score,
    correctAnswers: correct,
    wrongAnswers: wrong,
    unansweredQuestions: unanswered,
    accuracy,
    timeTakenSeconds,
    submittedAt: new Date().toISOString(),
  };
}

function buildResultFromAttempt(a: FirebaseFirestore.DocumentData): AttemptResult {
  return {
    attemptId: a.id,
    testId: a.testId,
    testNumber: a.testNumber,
    dayId: a.dayId,
    status: a.status,
    score: a.score ?? 0,
    correctAnswers: a.correctAnswers ?? 0,
    wrongAnswers: a.wrongAnswers ?? 0,
    unansweredQuestions: a.unansweredQuestions ?? 0,
    accuracy: a.accuracy ?? 0,
    timeTakenSeconds: a.timeTakenSeconds ?? 0,
    submittedAt: a.submittedAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// RESULT
// ---------------------------------------------------------------------------

export async function getResult(userId: string, attemptId: string): Promise<AttemptResult> {
  const doc = await attemptsCol(userId).doc(attemptId).get();
  if (!doc.exists) throw AppError.notFound("Attempt not found");
  const a = doc.data()!;
  if (a.status === "IN_PROGRESS") {
    throw AppError.badRequest("Attempt is still in progress");
  }
  return buildResultFromAttempt(a);
}

// ---------------------------------------------------------------------------
// REVIEW — only available after completion
// ---------------------------------------------------------------------------

export async function getReview(
  userId: string,
  attemptId: string
): Promise<ReviewQuestionItem[]> {
  const attemptDoc = await attemptsCol(userId).doc(attemptId).get();
  if (!attemptDoc.exists) throw AppError.notFound("Attempt not found");
  const attempt = attemptDoc.data()!;

  if (attempt.status === "IN_PROGRESS") {
    throw AppError.forbidden("Review is only available after test completion");
  }

  const mappingSnap = await db
    .collection("dailyTestBatches")
    .doc(attempt.dayId)
    .collection("tests")
    .doc(attempt.testId)
    .collection("questions")
    .orderBy("questionNumber", "asc")
    .get();

  const numByQ = new Map(
    mappingSnap.docs.map((d) => [d.data().questionId as string, d.data().questionNumber as number])
  );
  const questionIds = mappingSnap.docs.map((d) => d.data().questionId as string);

  const answersSnap = await answersCol(userId, attemptId).get();
  const answerByQ = new Map(answersSnap.docs.map((d) => [d.id, d.data()]));

  const items: ReviewQuestionItem[] = [];
  for (let i = 0; i < questionIds.length; i += 30) {
    const c = questionIds.slice(i, i + 30);
    const snap = await db.collection("questions").where("__name__", "in", c).get();
    snap.docs.forEach((qd) => {
      const q = qd.data();
      const ans = answerByQ.get(qd.id);
      const selected = ans?.selectedOptionId ?? null;
      const result =
        !selected
          ? "UNANSWERED"
          : selected === q.correctOptionId
          ? "CORRECT"
          : "WRONG";
      items.push({
        questionNumber: numByQ.get(qd.id)!,
        questionEnglish: q.questionEnglish,
        questionMarathi: q.questionMarathi,
        options: q.options,
        selectedOptionId: selected,
        correctOptionId: q.correctOptionId,
        result,
        explanationEnglish: q.explanationEnglish,
        explanationMarathi: q.explanationMarathi,
      });
    });
  }

  items.sort((a, b) => a.questionNumber - b.questionNumber);
  return items;
}
