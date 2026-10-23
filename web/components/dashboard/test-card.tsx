import Link from "next/link";
import { CheckCircle2, Clock, Lock, PlayCircle } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { Badge } from "@/components/ui/misc";
import { EXAM_FORMAT } from "@/lib/constants";
import type { TestState } from "@/lib/test-state";
import { cn } from "@/lib/utils";

export interface TestCardProps {
  number: number;
  state: TestState;
  questions?: number;
  minutes?: number;
  /** Where "Start"/"Continue" goes. Omit for non-interactive previews. */
  startHref?: string;
  resultHref?: string;
  reviewHref?: string;
}

const BADGE: Record<TestState, { tone: "ok" | "warn" | "brand" | "neutral"; label: string }> = {
  completed: { tone: "ok", label: "Completed" },
  in_progress: { tone: "warn", label: "In progress" },
  available: { tone: "brand", label: "Available" },
  locked: { tone: "neutral", label: "Locked" },
};

export function TestCard({
  number,
  state,
  questions = EXAM_FORMAT.questionsPerTest,
  minutes = EXAM_FORMAT.durationMinutes,
  startHref,
  resultHref,
  reviewHref,
}: TestCardProps) {
  const badge = BADGE[state];
  return (
    <article
      className={cn(
        "flex flex-col rounded-2xl border bg-card p-5",
        state === "available" || state === "in_progress" ? "border-brand-200 shadow-card" : "border-line",
        state === "locked" && "bg-paper",
      )}
      aria-label={`Test ${number}, ${badge.label}`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-2xl">Test {number}</h3>
        <Badge tone={badge.tone}>{badge.label}</Badge>
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-3">
        <Clock className="size-4" aria-hidden />
        {questions} questions, {minutes} minutes
      </p>

      <div className="mt-5 flex flex-1 flex-col justify-end gap-2">
        {state === "locked" && (
          <p className="flex items-start gap-2 text-sm text-ink-3">
            <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
            Finish Test {number - 1} to unlock this one.
          </p>
        )}
        {(state === "available" || state === "in_progress") &&
          (startHref ? (
            <Link href={startHref} className={buttonClass("primary", "md", "w-full")}>
              <PlayCircle className="size-5" aria-hidden />
              {state === "in_progress" ? "Continue test" : "Start test"}
            </Link>
          ) : (
            <span className={buttonClass("primary", "md", "w-full")} aria-hidden>
              <PlayCircle className="size-5" />
              {state === "in_progress" ? "Continue test" : "Start test"}
            </span>
          ))}
        {state === "completed" && (
          <>
            {resultHref && (
              <Link href={resultHref} className={buttonClass("secondary", "md", "w-full")}>
                <CheckCircle2 className="size-5 text-ok-600" aria-hidden />
                View result
              </Link>
            )}
            {reviewHref && (
              <Link href={reviewHref} className={buttonClass("ghost", "sm", "w-full")}>
                Review answers
              </Link>
            )}
          </>
        )}
      </div>
    </article>
  );
}
