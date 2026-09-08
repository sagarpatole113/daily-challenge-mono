import { useEffect, useState, useCallback } from "react";
import { useTimerStore } from "../store/timerStore";

/**
 * Ticks once a second and derives remaining time from `expiresAt`
 * (never from a locally-decremented counter), so backgrounding /
 * killing / reopening the app can never reset or desync the timer.
 */
export function useTimer(onExpire?: () => void) {
  const getRemainingMs = useTimerStore((s) => s.getRemainingMs);
  const expiresAt = useTimerStore((s) => s.expiresAt);
  const [remainingMs, setRemainingMs] = useState(getRemainingMs());
  const [hasExpiredFired, setHasExpiredFired] = useState(false);

  const tick = useCallback(() => {
    const ms = getRemainingMs();
    setRemainingMs(ms);
    if (ms <= 0 && !hasExpiredFired) {
      setHasExpiredFired(true);
      onExpire?.();
    }
  }, [getRemainingMs, hasExpiredFired, onExpire]);

  useEffect(() => {
    // Recompute immediately whenever expiresAt changes (e.g. after reopening
    // the app / navigating back into the test screen).
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, tick]);

  const totalSeconds = Math.floor(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const label = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return { remainingMs, totalSeconds, label, isExpired: remainingMs <= 0 };
}
