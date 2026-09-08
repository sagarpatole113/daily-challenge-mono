import { create } from "zustand";

interface TimerState {
  /** The ONLY source of truth for remaining time. Never store seconds directly. */
  expiresAt: string | null; // ISO timestamp from the server
  setExpiresAt: (iso: string | null) => void;
  /** remainingMs recomputed on demand — never drifts, survives app restarts. */
  getRemainingMs: () => number;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  expiresAt: null,
  setExpiresAt: (iso) => set({ expiresAt: iso }),
  getRemainingMs: () => {
    const { expiresAt } = get();
    if (!expiresAt) return 0;
    return Math.max(0, new Date(expiresAt).getTime() - Date.now());
  },
}));
