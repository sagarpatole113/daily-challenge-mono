import { z } from "zod";
import { db, FieldValue } from "../../config/firebase";
import { AppError } from "../../utils/AppError";
import type { User } from "@shared/index";

/**
 * `username` is only required the FIRST time a profile is created
 * (immediately after Firebase account signup — see mobile
 * src/services/firebase.ts `signUpWithUsername`). Existing users calling
 * this to refresh `lastActiveAt` don't need to resend it.
 *
 * Uniqueness is enforced by Firebase Auth itself: the mobile app builds a
 * deterministic synthetic email from the username
 * (`${username}@<domain>`) and Firebase Auth rejects account creation if
 * that email already exists — so two users can never end up with the same
 * username. This endpoint does not need to re-check uniqueness.
 */
export const upsertProfileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z][a-z0-9_]{2,19}$/,
      "Username must be 3-20 characters, start with a letter, and contain only lowercase letters, numbers, and underscores"
    )
    .optional(),
});

const usersCol = () => db.collection("users");

/**
 * Rebuilds the aggregate stats fields from the user's actual completed
 * attempt records. This exists to self-heal accounts whose profile
 * document was missing (or got recreated from scratch, e.g. via the
 * mobile app's self-heal flow) while they already had real completed
 * attempts on file — see the note in attempts.service.ts's
 * finalizeAttempt for how a profile doc could go missing mid-history.
 * The attempt records themselves are the source of truth; this never
 * needs to touch them, only re-derive the totals from what's already
 * there.
 */
async function recomputeStatsFromAttempts(uid: string) {
  const snap = await usersCol()
    .doc(uid)
    .collection("testAttempts")
    .where("status", "in", ["COMPLETED", "TIME_EXPIRED"])
    .get();

  let totalTestsCompleted = 0;
  let totalScore = 0;
  let totalCorrectAnswers = 0;
  let totalWrongAnswers = 0;
  let totalQuestionsAttempted = 0;
  let bestScore = 0;

  snap.docs.forEach((d) => {
    const a = d.data();
    const correct = a.correctAnswers ?? 0;
    const wrong = a.wrongAnswers ?? 0;
    const unanswered = a.unansweredQuestions ?? 0;
    const attemptScore = a.score ?? 0;

    totalTestsCompleted += 1;
    totalScore += attemptScore;
    totalCorrectAnswers += correct;
    totalWrongAnswers += wrong;
    totalQuestionsAttempted += correct + wrong + unanswered;
    bestScore = Math.max(bestScore, attemptScore);
  });

  return {
    totalTestsCompleted,
    totalScore,
    totalCorrectAnswers,
    totalWrongAnswers,
    totalQuestionsAttempted,
    bestScore,
  };
}

export async function getOrCreateProfile(
  uid: string,
  input: z.infer<typeof upsertProfileSchema>
): Promise<User> {
  const ref = usersCol().doc(uid);
  const snap = await ref.get();
  const now = FieldValue.serverTimestamp();

  if (!snap.exists) {
    if (!input.username) {
      throw AppError.badRequest("username is required when creating a new profile");
    }

    const newUser = {
      id: uid,
      name: input.name,
      username: input.username,
      createdAt: now,
      updatedAt: now,
      lastActiveAt: now,
      currentDayId: null,
      currentTestNumber: 1,
      totalTestsCompleted: 0,
      totalQuestionsAttempted: 0,
      totalCorrectAnswers: 0,
      totalWrongAnswers: 0,
      totalScore: 0,
      bestScore: 0,
    };
    await ref.set(newUser);
    const created = await ref.get();
    return serializeUser(created.data()!, uid);
  }

  // Existing users are NOT re-asked for their name/username; this call
  // (made again e.g. on app relaunch) only refreshes activity timestamps.
  const existingData = snap.data()!;
  const patch: FirebaseFirestore.DocumentData = { lastActiveAt: now, updatedAt: now };

  // BUGFIX: self-heal a profile whose stats never got recorded (see
  // finalizeAttempt in attempts.service.ts) but which already has real
  // completed attempts on file — rebuild the totals instead of leaving
  // them stuck at zero forever.
  if (!existingData.totalTestsCompleted) {
    const recomputed = await recomputeStatsFromAttempts(uid);
    if (recomputed.totalTestsCompleted > 0) {
      Object.assign(patch, recomputed);
    }
  }

  await ref.update(patch);
  const updated = await ref.get();
  return serializeUser(updated.data()!, uid);
}

export async function getProfile(uid: string): Promise<User> {
  const ref = usersCol().doc(uid);
  const snap = await ref.get();
  if (!snap.exists) {
    throw AppError.notFound("User profile not found. Complete signup first.");
  }
  const data = snap.data()!;

  // BUGFIX: same self-heal as above, on the plain read path — this is
  // what the mobile Profile screen actually calls on every focus/pull-
  // to-refresh, so an account left with zeroed stats (from the
  // now-fixed finalizeAttempt bug) recovers automatically the next time
  // it's viewed, with no separate migration step needed.
  if (!data.totalTestsCompleted) {
    const recomputed = await recomputeStatsFromAttempts(uid);
    if (recomputed.totalTestsCompleted > 0) {
      await ref.update({ ...recomputed, updatedAt: FieldValue.serverTimestamp() });
      return serializeUser({ ...data, ...recomputed }, uid);
    }
  }

  return serializeUser(data, uid);
}

function serializeUser(data: FirebaseFirestore.DocumentData, uid: string): User {
  return {
    id: uid,
    name: data.name,
    username: data.username,
    createdAt: data.createdAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
    lastActiveAt: data.lastActiveAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
    currentDayId: data.currentDayId ?? null,
    currentTestNumber: data.currentTestNumber ?? 1,
    totalTestsCompleted: data.totalTestsCompleted ?? 0,
    totalQuestionsAttempted: data.totalQuestionsAttempted ?? 0,
    totalCorrectAnswers: data.totalCorrectAnswers ?? 0,
    totalWrongAnswers: data.totalWrongAnswers ?? 0,
    totalScore: data.totalScore ?? 0,
    bestScore: data.bestScore ?? 0,
  };
}
