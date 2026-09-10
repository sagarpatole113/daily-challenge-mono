import { db, FieldValue } from "../../config/firebase";
import type { UserDailyProgress } from "@shared/index";

const progressCol = (userId: string) =>
  db.collection("users").doc(userId).collection("dailyProgress");

/** Reads (or synthesizes a default, unsaved) progress record for a user+day. */
export async function getDailyProgress(
  userId: string,
  dayId: string
): Promise<UserDailyProgress> {
  const snap = await progressCol(userId).doc(dayId).get();
  if (!snap.exists) {
    return {
      dayId,
      date: dayId,
      completedTests: 0,
      currentUnlockedTest: 1,
      completedTestIds: [],
      dayCompleted: false,
      lastUpdatedAt: new Date().toISOString(),
    };
  }
  const d = snap.data()!;
  return {
    dayId,
    date: d.date ?? dayId,
    completedTests: d.completedTests ?? 0,
    currentUnlockedTest: d.currentUnlockedTest ?? 1,
    completedTestIds: d.completedTestIds ?? [],
    dayCompleted: d.dayCompleted ?? false,
    lastUpdatedAt:
      d.lastUpdatedAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
  };
}

/**
 * Marks a test as completed for a user's day progress. Idempotent —
 * calling twice for the same testId will not double count or unlock
 * further than necessary. This is the ONLY place that advances
 * `currentUnlockedTest`, and it is only ever called from the attempts
 * module after the backend has itself confirmed submit/expire.
 */
export async function markTestCompleted(
  userId: string,
  dayId: string,
  testId: string,
  testNumber: number
): Promise<UserDailyProgress> {
  const ref = progressCol(userId).doc(dayId);
  const batchSnap = await db.collection("dailyTestBatches").doc(dayId).get();
  const totalTests = batchSnap.data()?.totalTests ?? 0;

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const existing = snap.exists ? snap.data()! : null;

    const completedTestIds: string[] = existing?.completedTestIds ?? [];

    if (completedTestIds.includes(testId)) {
      // Already recorded — idempotent no-op, just return current state.
      return {
        dayId,
        date: existing?.date ?? dayId,
        completedTests: existing?.completedTests ?? completedTestIds.length,
        currentUnlockedTest: existing?.currentUnlockedTest ?? testNumber,
        completedTestIds,
        dayCompleted: existing?.dayCompleted ?? false,
        lastUpdatedAt: new Date().toISOString(),
      };
    }

    const newCompletedIds = [...completedTestIds, testId];
    const completedTests = newCompletedIds.length;
    const currentUnlockedTest = Math.min(
      testNumber + 1,
      totalTests
    );
    const dayCompleted = totalTests > 0 && completedTests >= totalTests;

    const data = {
      dayId,
      date: dayId,
      completedTests,
      currentUnlockedTest,
      completedTestIds: newCompletedIds,
      dayCompleted,
      lastUpdatedAt: FieldValue.serverTimestamp(),
    };

    tx.set(ref, data, { merge: true });

    return {
      dayId,
      date: dayId,
      completedTests,
      currentUnlockedTest,
      completedTestIds: newCompletedIds,
      dayCompleted,
      lastUpdatedAt: new Date().toISOString(),
    };
  });
}

/**
 * THE authoritative unlock check. Test 1 is always unlocked.
 * Test N (N>1) is unlocked only if N-1 is in completedTestIds.
 * This must be called server-side before allowing a test to start —
 * never trust the client's claim that a test is unlocked.
 */
export function isTestUnlocked(
  testNumber: number,
  progress: UserDailyProgress
): boolean {
  if (testNumber <= 1) return true;
  return progress.currentUnlockedTest >= testNumber;
}
