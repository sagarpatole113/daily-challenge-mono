import { db } from "../../config/firebase";
import { AppError } from "../../utils/AppError";
import { getDailyProgress, isTestUnlocked } from "../progress/progress.service";
import type {
  DailyTestWithState,
  DayListItem,
  QuestionPublic,
} from "@shared/index";

const batchesCol = () => db.collection("dailyTestBatches");

export async function listDays(userId: string): Promise<DayListItem[]> {
  const snap = await batchesCol()
    .where("status", "==", "ACTIVE")
    .orderBy("date", "desc")
    .limit(30)
    .get();

  const results: DayListItem[] = [];
  for (const doc of snap.docs) {
    const d = doc.data();
    const progress = await getDailyProgress(userId, doc.id);
    results.push({
      dayId: doc.id,
      date: d.date,
      totalTests: d.totalTests ?? 0,
      completedTests: progress.completedTests,
      currentUnlockedTest: progress.currentUnlockedTest,
      status: d.status,
    });
  }
  return results;
}

export async function getDayDetail(userId: string, dayId: string) {
  const doc = await batchesCol().doc(dayId).get();
  if (!doc.exists) throw AppError.notFound("Day not found");
  const d = doc.data()!;
  const progress = await getDailyProgress(userId, dayId);
  return {
    dayId,
    date: d.date,
    totalTests: d.totalTests ?? 0,
    status: d.status,
    completedTests: progress.completedTests,
    currentUnlockedTest: progress.currentUnlockedTest,
    dayCompleted: progress.dayCompleted,
  };
}

export async function listTestsForDay(
  userId: string,
  dayId: string
): Promise<DailyTestWithState[]> {
  const dayDoc = await batchesCol().doc(dayId).get();
  if (!dayDoc.exists) throw AppError.notFound("Day not found");

  const testsSnap = await batchesCol()
    .doc(dayId)
    .collection("tests")
    .orderBy("testNumber", "asc")
    .get();

  const progress = await getDailyProgress(userId, dayId);

  // Load attempts once so completed tests can navigate to their result.
  const attemptsSnap = await db
    .collection("users")
    .doc(userId)
    .collection("testAttempts")
    .where("dayId", "==", dayId)
    .get();
  const attemptByTestId = new Map<string, { id: string; status: string }>();
  attemptsSnap.docs.forEach((attempt) => {
    const data = attempt.data();
    const existing = attemptByTestId.get(data.testId);
    if (!existing || data.status !== "IN_PROGRESS") {
      attemptByTestId.set(data.testId, { id: attempt.id, status: data.status });
    }
  });

  return testsSnap.docs.map((doc) => {
    const t = doc.data();
    const unlocked = isTestUnlocked(t.testNumber, progress);
    const completed = progress.completedTestIds.includes(doc.id);
    const attempt = attemptByTestId.get(doc.id);
    return {
      id: doc.id,
      dayId,
      testNumber: t.testNumber,
      title: t.title,
      totalQuestions: t.totalQuestions,
      totalMarks: t.totalMarks,
      durationMinutes: t.durationMinutes,
      negativeMarking: t.negativeMarking,
      status: t.status,
      createdAt: t.createdAt?.toDate?.().toISOString?.() ?? "",
      locked: !unlocked,
      unlocked,
      completed,
      inProgress: attempt?.status === "IN_PROGRESS",
      attemptId: completed ? attempt?.id : undefined,
    };
  });
}

/**
 * Returns test metadata + MASKED questions (no correctOptionId / explanations).
 * Used for pre-test preview only. The authoritative question set for an
 * active attempt is served by the attempts module via /tests/:testId/start.
 */
export async function getTestWithMaskedQuestions(dayId: string, testId: string) {
  const testDoc = await batchesCol().doc(dayId).collection("tests").doc(testId).get();
  if (!testDoc.exists) throw AppError.notFound("Test not found");
  const t = testDoc.data()!;

  const mappingSnap = await testDoc.ref
    .collection("questions")
    .orderBy("questionNumber", "asc")
    .get();

  const questionIds = mappingSnap.docs.map((d) => d.data().questionId as string);
  const numberByQuestionId = new Map(
    mappingSnap.docs.map((d) => [d.data().questionId as string, d.data().questionNumber as number])
  );

  const questions: QuestionPublic[] = [];
  // Firestore 'in' queries are capped at 30 — batch fetch.
  const chunks = chunk(questionIds, 30);
  for (const c of chunks) {
    const qSnap = await db.collection("questions").where("__name__", "in", c).get();
    qSnap.docs.forEach((qd) => {
      const q = qd.data();
      questions.push({
        id: qd.id,
        questionNumber: numberByQuestionId.get(qd.id)!,
        subject: q.subject,
        topic: q.topic,
        difficulty: q.difficulty,
        questionEnglish: q.questionEnglish,
        questionMarathi: q.questionMarathi,
        options: q.options,
      });
    });
  }
  questions.sort((a, b) => a.questionNumber - b.questionNumber);

  return {
    id: testId,
    dayId,
    testNumber: t.testNumber,
    title: t.title,
    totalQuestions: t.totalQuestions,
    totalMarks: t.totalMarks,
    durationMinutes: t.durationMinutes,
    negativeMarking: t.negativeMarking,
    questions,
  };
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
