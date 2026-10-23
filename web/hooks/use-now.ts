"use client";

import { useEffect, useState } from "react";

/**
 * A ticking clock for countdowns. Re-reads Date.now() on every tick (never
 * counts down from a local value), and immediately when the tab becomes
 * visible again, so background-tab throttling can't make the display drift.
 */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const id = setInterval(tick, intervalMs);
    const onVisible = () => document.visibilityState === "visible" && tick();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", tick);
    };
  }, [intervalMs]);
  return now;
}
