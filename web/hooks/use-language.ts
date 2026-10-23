"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Lang = "both" | "en" | "mr";
const KEY = "saatatya:lang";
const listeners = new Set<() => void>();

function read(): Lang {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "en" || v === "mr" || v === "both") return v;
  } catch {
    /* storage blocked */
  }
  return "both";
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  window.addEventListener("storage", fn);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", fn);
  };
}

/** Display-language preference for questions. Harmless UI preference, kept in localStorage. */
export function useLanguage(): [Lang, (l: Lang) => void] {
  const lang = useSyncExternalStore(subscribe, read, () => "both" as Lang);
  const set = useCallback((l: Lang) => {
    try {
      localStorage.setItem(KEY, l);
    } catch {
      /* ignore */
    }
    listeners.forEach((f) => f());
  }, []);
  return [lang, set];
}
