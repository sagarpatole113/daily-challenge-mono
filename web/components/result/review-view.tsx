"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LangToggle } from "@/components/test/lang-toggle";
import { ErrorState, Skeleton } from "@/components/ui/misc";
import { useReview } from "@/hooks/queries";
import { useLanguage, type Lang } from "@/hooks/use-language";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ReviewQuestionItem } from "@/types/shared";

type Filter = "ALL" | ReviewQuestionItem["result"];

function Text({ en, mr, lang, className }: { en?: string; mr?: string; lang: Lang; className?: string }) {
  return (
    <>
      {(lang === "both" || lang === "en") && en && <span className={cn("q-text block", className)}>{en}</span>}
      {(lang === "both" || lang === "mr") && mr && (
        <span lang="mr" className={cn("q-text block", lang === "both" && "mt-1 text-ink-2", className)}>{mr}</span>
      )}
    </>
  );
}

export function ReviewView({ attemptId }: { attemptId: string }) {
  const review = useReview(attemptId);
  const [lang, setLang] = useLanguage();
  const [filter, setFilter] = useState<Filter>("ALL");

  const items = useMemo(() => review.data ?? [], [review.data]);
  const counts = useMemo(() => {
    const c = { ALL: items.length, CORRECT: 0, WRONG: 0, UNANSWERED: 0 };
    for (const i of items) c[i.result] += 1;
    return c;
  }, [items]);
  const shown = filter === "ALL" ? items : items.filter((i) => i.result === filter);

  if (review.isPending) return <Skeleton className="h-96" />;
  if (review.isError) {
    const e = review.error;
    const early = e instanceof ApiError && (e.status === 403 || e.status === 409 || e.status === 400);
    return (
      <ErrorState
        title={early ? "Review isn't available yet" : undefined}
        message={early ? "Answers can be reviewed only after the test is finished." : e.message}
        onRetry={early ? undefined : () => review.refetch()}
      />
    );
  }

  const tabs: { v: Filter; label: string }[] = [
    { v: "ALL", label: "All" },
    { v: "WRONG", label: "Wrong" },
    { v: "UNANSWERED", label: "Unanswered" },
    { v: "CORRECT", label: "Correct" },
  ];

  return (
    <div>
      <Link href={`/dashboard/result/${attemptId}`} className="text-sm font-medium text-ink-3 hover:text-ink">Back to result</Link>
      <h1 className="mt-2 text-4xl sm:text-5xl">Review your answers</h1>

      <div className="sticky top-16 z-20 -mx-5 mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-paper/95 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <div role="tablist" aria-label="Filter questions" className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.v}
              role="tab"
              aria-selected={filter === t.v}
              onClick={() => setFilter(t.v)}
              className={cn("min-h-9 rounded-full px-3.5 text-sm font-semibold", filter === t.v ? "bg-ink text-white" : "bg-sunken text-ink-2 hover:text-ink")}
            >
              {t.label} ({counts[t.v]})
            </button>
          ))}
        </div>
        <LangToggle value={lang} onChange={setLang} />
      </div>

      {shown.length === 0 ? (
        <p className="mt-8 text-ink-3">Nothing to show in this filter.</p>
      ) : (
        <ol className="mt-6 space-y-5">
          {shown.map((it) => (
            <li key={it.questionNumber} style={{ contentVisibility: "auto", containIntrinsicSize: "auto 420px" }}>
              <article className="rounded-2xl border border-line bg-card p-5 sm:p-6" aria-label={`Question ${it.questionNumber}, ${it.result.toLowerCase()}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-ink-3">Question {it.questionNumber}</p>
                  <ResultTag r={it.result} />
                </div>
                <h2 className="mt-3 font-sans text-lg font-semibold leading-snug text-ink">
                  <Text en={it.questionEnglish} mr={it.questionMarathi} lang={lang} />
                </h2>
                <ul className="mt-4 grid gap-2.5">
                  {it.options.map((o) => {
                    const isCorrect = o.id === it.correctOptionId;
                    const isSelected = o.id === it.selectedOptionId;
                    return (
                      <li
                        key={o.id}
                        className={cn(
                          "flex items-start gap-3 rounded-xl border-2 px-4 py-3",
                          isCorrect ? "border-ok-600 bg-ok-50" : isSelected ? "border-bad-600 bg-bad-50" : "border-line",
                        )}
                      >
                        <span aria-hidden className={cn("mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold", isCorrect ? "bg-ok-600 text-white" : isSelected ? "bg-bad-600 text-white" : "bg-sunken text-ink-2")}>{o.id}</span>
                        <span className="min-w-0 flex-1">
                          <Text en={o.english} mr={o.marathi} lang={lang} />
                          {(isCorrect || isSelected) && (
                            <span className={cn("mt-1 block text-xs font-bold", isCorrect ? "text-ok-700" : "text-bad-700")}>
                              {isCorrect && isSelected ? "Your answer, correct" : isCorrect ? "Correct answer" : "Your answer"}
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                {(it.explanationEnglish || it.explanationMarathi) && (
                  <details className="group mt-4 rounded-xl bg-sunken/70 px-4 py-3">
                    <summary className="cursor-pointer text-sm font-semibold text-brand-700">Explanation</summary>
                    <div className="mt-2 text-[0.95rem] text-ink-2">
                      <Text en={it.explanationEnglish} mr={it.explanationMarathi} lang={lang} />
                    </div>
                  </details>
                )}
              </article>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function ResultTag({ r }: { r: ReviewQuestionItem["result"] }) {
  const map = {
    CORRECT: ["bg-ok-50 text-ok-700", "Correct"],
    WRONG: ["bg-bad-50 text-bad-700", "Wrong"],
    UNANSWERED: ["bg-sunken text-ink-2", "Unanswered"],
  } as const;
  const [cls, label] = map[r];
  return <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", cls)}>{label}</span>;
}
