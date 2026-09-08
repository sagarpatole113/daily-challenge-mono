import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../services/api";
import type { QuestionAnswerStatus } from "@shared/index";

interface QueuedAnswer {
  attemptId: string;
  questionId: string;
  selectedOptionId: string | null;
  status: QuestionAnswerStatus;
  queuedAt: number;
}

const QUEUE_KEY_PREFIX = "mpsc:answerQueue:";

function queueKey(attemptId: string) {
  return `${QUEUE_KEY_PREFIX}${attemptId}`;
}

/**
 * Offline-safe answer sync. Every answer is written to AsyncStorage
 * immediately (so a crash/app-kill never loses it), then we attempt an
 * API sync. If the network call fails, the item stays queued and a later
 * call to `flushQueue` (e.g. on reconnect, or the next answer save) retries
 * everything still pending, oldest first.
 */
export async function enqueueAndSync(item: QueuedAnswer): Promise<boolean> {
  await pushToQueue(item);
  return flushQueue(item.attemptId);
}

async function pushToQueue(item: QueuedAnswer) {
  const key = queueKey(item.attemptId);
  const raw = await AsyncStorage.getItem(key);
  const queue: QueuedAnswer[] = raw ? JSON.parse(raw) : [];

  // Replace any existing queued entry for the same question — only the
  // latest selection for a question needs to be synced.
  const filtered = queue.filter((q) => q.questionId !== item.questionId);
  filtered.push(item);
  await AsyncStorage.setItem(key, JSON.stringify(filtered));
}

export async function flushQueue(attemptId: string): Promise<boolean> {
  const key = queueKey(attemptId);
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return true;

  let queue: QueuedAnswer[] = JSON.parse(raw);
  if (queue.length === 0) return true;

  const stillPending: QueuedAnswer[] = [];
  let allSucceeded = true;

  for (const item of queue) {
    try {
      await api.post(`/attempts/${item.attemptId}/answers`, {
        questionId: item.questionId,
        selectedOptionId: item.selectedOptionId,
        status: item.status,
      });
    } catch {
      stillPending.push(item);
      allSucceeded = false;
    }
  }

  await AsyncStorage.setItem(key, JSON.stringify(stillPending));
  return allSucceeded;
}

export async function clearQueue(attemptId: string) {
  await AsyncStorage.removeItem(queueKey(attemptId));
}

export async function hasPendingSync(attemptId: string): Promise<boolean> {
  const raw = await AsyncStorage.getItem(queueKey(attemptId));
  if (!raw) return false;
  const queue: QueuedAnswer[] = JSON.parse(raw);
  return queue.length > 0;
}
