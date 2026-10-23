"use client";

import { Bookmark, BookmarkCheck, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Lang } from "@/hooks/use-language";
import { isMarked, type LocalAnswer } from "@/lib/attempt";
import { cn } from "@/lib/utils";
import type { QuestionPublic } from "@/types/shared";

interface Props {
  question: QuestionPublic;
  index: number;
  total: number;
  answer: LocalAnswer | undefined;
  lang: Lang;
  disabled: boolean;
  onSelect: (optionId: string) => void;
  onToggleMark: () => void;
  onClear: () => void;
}

function Bilingual({ en, mr, lang, className }: { en: string; mr: string; lang: Lang; className?: string }) {
  return (
    <>
      {(lang === "both" || lang === "en") && <span className={cn("q-text block", className)}>{en}</span>}
      {(lang === "both" || lang === "mr") && (
        <span lang="mr" className={cn("q-text block", lang === "both" && "mt-1.5 text-ink-2", className)}>
          {mr}
        </span>
      )}
    </>
  );
}

export function QuestionView({ question, index, total, answer, lang, disabled, onSelect, onToggleMark, onClear }: Props) {
  const selected = answer?.selectedOptionId ?? null;
  const marked = !!answer && isMarked(answer.status);

  return (
    <section aria-labelledby={`q-${question.id}`} className="rounded-2xl border border-line bg-card p-5 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink-3">
          Question {index + 1} of {total}
        </p>
        {marked && <span className="rounded-full bg-warn-50 px-2.5 py-0.5 text-xs font-semibold text-warn-700">Marked for review</span>}
      </div>

      <h2 id={`q-${question.id}`} className="mt-3 font-sans text-xl font-semibold leading-snug text-ink sm:text-[1.35rem]">
        <Bilingual en={question.questionEnglish} mr={question.questionMarathi} lang={lang} />
      </h2>

      <div role="radiogroup" aria-labelledby={`q-${question.id}`} className="mt-6 grid gap-3">
        {question.options.map((o) => {
          const checked = selected === o.id;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={checked}
              disabled={disabled}
              onClick={() => onSelect(o.id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-colors disabled:cursor-not-allowed",
                checked ? "border-brand-600 bg-brand-50" : "border-line bg-card hover:border-brand-200",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold",
                  checked ? "border-brand-600 bg-brand-600 text-white" : "border-line-strong text-ink-2",
                )}
              >
                {o.id}
              </span>
              <span className="min-w-0 flex-1 text-[1.02rem] leading-snug text-ink">
                <span className="sr-only">Option {o.id}: </span>
                <Bilingual en={o.english} mr={o.marathi} lang={lang} />
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={onToggleMark} disabled={disabled} aria-pressed={marked}>
          {marked ? <BookmarkCheck className="size-4 text-warn-700" aria-hidden /> : <Bookmark className="size-4" aria-hidden />}
          {marked ? "Unmark review" : "Mark for review"}
        </Button>
        <Button variant="ghost" size="sm" onClick={onClear} disabled={disabled || !selected}>
          <Eraser className="size-4" aria-hidden />
          Clear response
        </Button>
      </div>
    </section>
  );
}
