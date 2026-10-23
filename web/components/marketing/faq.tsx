import { ChevronDown } from "lucide-react";
import type { Faq } from "@/content/types";

/** Native <details>: keyboard accessible, no client JavaScript, content stays in the HTML for crawlers. */
export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="divide-y divide-line rounded-2xl border border-line bg-card">
      {faqs.map((f) => (
        <details key={f.q} className="group px-5 py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-semibold text-ink [&::-webkit-details-marker]:hidden">
            {f.q}
            <ChevronDown className="size-5 shrink-0 text-ink-3 transition-transform group-open:rotate-180" aria-hidden />
          </summary>
          <p className="mt-3 max-w-prose text-ink-2">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
