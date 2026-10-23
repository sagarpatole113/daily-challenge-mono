"use client";

import { isAnswered, isMarked, type AnswerMap } from "@/lib/attempt";
import { cn } from "@/lib/utils";
import type { QuestionPublic } from "@/types/shared";

function describe(status: string | undefined) {
  switch (status) {
    case "ANSWERED":
      return "answered";
    case "ANSWERED_AND_MARKED":
      return "answered and marked for review";
    case "MARKED_FOR_REVIEW":
      return "marked for review";
    case "NOT_ANSWERED":
      return "not answered";
    default:
      return "not visited";
  }
}

export function Palette({
  questions,
  answers,
  current,
  onJump,
}: {
  questions: QuestionPublic[];
  answers: AnswerMap;
  current: number;
  onJump: (i: number) => void;
}) {
  return (
    <div>
      <ul className="mb-4 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-ink-2">
        <Legend cls="bg-ok-600" label="Answered" />
        <Legend cls="bg-bad-50 border border-bad-100" label="Not answered" />
        <Legend cls="bg-warn-500" label="Marked" />
        <Legend cls="bg-card border border-line" label="Not visited" />
      </ul>
      <ul className="grid grid-cols-5 gap-2 p-1 sm:grid-cols-8 lg:grid-cols-5 xl:grid-cols-6">
        {questions.map((q, i) => {
          const a = answers[q.id];
          const answered = !!a && isAnswered(a.status);
          const marked = !!a && isMarked(a.status);
          const visited = !!a && a.status !== "NOT_VISITED";
          return (
            <li key={q.id}>
              <button
                type="button"
                onClick={() => onJump(i)}
                aria-label={`Question ${i + 1}, ${describe(a?.status)}${i === current ? ", current" : ""}`}
                aria-current={i === current ? "true" : undefined}
                className={cn(
                  "relative flex h-10 w-full items-center justify-center rounded-lg border text-sm font-semibold",
                  answered && "border-ok-600 bg-ok-600 text-white",
                  !answered && marked && "border-warn-500 bg-warn-500 text-ink",
                  !answered && !marked && visited && "border-bad-100 bg-bad-50 text-bad-700",
                  !answered && !marked && !visited && "border-line bg-card text-ink-2",
                  i === current && "ring-2 ring-brand-600 ring-offset-2",
                )}
              >
                {i + 1}
                {answered && marked && <span aria-hidden className="absolute -right-1 -top-1 size-3 rounded-full border-2 border-white bg-warn-500" />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Legend({ cls, label }: { cls: string; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span aria-hidden className={cn("size-3.5 rounded", cls)} />
      {label}
    </li>
  );
}
