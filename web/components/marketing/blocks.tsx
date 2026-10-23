import { Info, Lightbulb, ShieldCheck } from "lucide-react";
import type { Block } from "@/content/types";
import { RichText } from "@/components/marketing/rich-text";
import { cn } from "@/lib/utils";

const CALLOUT = {
  official: { icon: ShieldCheck, cls: "border-brand-200 bg-brand-50 text-brand-800", label: "Official information" },
  tip: { icon: Lightbulb, cls: "border-ok-100 bg-ok-50 text-ok-700", label: "Tip" },
  note: { icon: Info, cls: "border-warn-100 bg-warn-50 text-warn-700", label: "Note" },
} as const;

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.t) {
          case "p":
            return <p key={i}><RichText text={b.text} /></p>;
          case "h3":
            return <h3 key={i}>{b.text}</h3>;
          case "ul":
            return <ul key={i}>{b.items.map((x, j) => <li key={j}><RichText text={x} /></li>)}</ul>;
          case "ol":
            return <ol key={i}>{b.items.map((x, j) => <li key={j}><RichText text={x} /></li>)}</ol>;
          case "callout": {
            const c = CALLOUT[b.tone];
            const Icon = c.icon;
            return (
              <aside key={i} className={cn("not-prose my-6 rounded-2xl border p-5 text-[0.95rem] leading-relaxed", c.cls)}>
                <p className="flex items-center gap-2 font-bold">
                  <Icon className="size-5" aria-hidden />
                  {b.title}
                </p>
                <p className="mt-2 text-ink-2 [&_a]:font-semibold [&_a]:underline"><RichText text={b.text} /></p>
              </aside>
            );
          }
          case "table":
            return (
              <div key={i} className="my-6 overflow-x-auto rounded-xl border border-line bg-card">
                <table className="w-full min-w-[28rem] border-collapse text-left text-[0.95rem]">
                  <caption className="px-4 pb-2 pt-3 text-left text-sm font-semibold text-ink-3">{b.caption}</caption>
                  <thead>
                    <tr className="border-y border-line bg-sunken/70">
                      {b.head.map((h) => (
                        <th key={h} scope="col" className="px-4 py-2.5 font-semibold text-ink">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((r, ri) => (
                      <tr key={ri} className="border-b border-line last:border-0">
                        {r.map((c, ci) => (
                          <td key={ci} className={cn("px-4 py-2.5 align-top", ci === 0 && "font-semibold text-ink")}>
                            <RichText text={c} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
        }
      })}
    </>
  );
}
