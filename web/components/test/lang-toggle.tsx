"use client";

import type { Lang } from "@/hooks/use-language";
import { cn } from "@/lib/utils";

const OPTIONS: { v: Lang; label: string; lang?: string }[] = [
  { v: "both", label: "Both" },
  { v: "en", label: "English" },
  { v: "mr", label: "मराठी", lang: "mr" },
];

export function LangToggle({ value, onChange }: { value: Lang; onChange: (l: Lang) => void }) {
  return (
    <div role="radiogroup" aria-label="Question language" className="inline-flex rounded-xl bg-sunken p-1">
      {OPTIONS.map((o) => (
        <button
          key={o.v}
          type="button"
          role="radio"
          aria-checked={value === o.v}
          lang={o.lang}
          onClick={() => onChange(o.v)}
          className={cn(
            "min-h-9 rounded-lg px-3 text-sm font-semibold",
            value === o.v ? "bg-card text-ink shadow-sm" : "text-ink-3 hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
