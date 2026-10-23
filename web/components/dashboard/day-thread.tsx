import { Check, Lock } from "lucide-react";
import type { TestState } from "@/lib/test-state";
import { cn } from "@/lib/utils";

const LABEL: Record<TestState, string> = {
  completed: "completed",
  in_progress: "in progress",
  available: "available",
  locked: "locked",
};

/**
 * The brand motif: today's three tests as nodes on one thread. The thread
 * between two nodes fills in once the earlier test is completed.
 */
export function DayThread({ states, className }: { states: TestState[]; className?: string }) {
  return (
    <ol className={cn("flex items-start", className)} aria-label="Today's tests">
      {states.map((state, i) => {
        const n = i + 1;
        const last = i === states.length - 1;
        return (
          <li key={n} className={cn("flex items-start", !last && "flex-1")}>
            <div className="flex w-14 shrink-0 flex-col items-center gap-2">
              <span
                className={cn(
                  "relative inline-flex size-11 items-center justify-center rounded-full text-base font-bold",
                  state === "completed" && "bg-ok-600 text-white animate-pop",
                  state === "in_progress" && "bg-warn-500 text-ink animate-pulse-ring",
                  state === "available" && "border-2 border-brand-600 bg-card text-brand-700",
                  state === "locked" && "bg-sunken text-ink-3",
                )}
              >
                {state === "completed" ? <Check className="size-5" aria-hidden /> : state === "locked" ? <Lock className="size-4" aria-hidden /> : n}
              </span>
              <span className="text-xs font-semibold text-ink-2">
                Test {n}
                <span className="sr-only">: {LABEL[state]}</span>
              </span>
            </div>
            {!last && (
              <span aria-hidden className="mt-5 h-1 flex-1 rounded-full bg-line">
                <span
                  className={cn(
                    "block h-full rounded-full bg-ok-600 transition-[width] duration-700",
                    state === "completed" ? "w-full" : "w-0",
                  )}
                />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
