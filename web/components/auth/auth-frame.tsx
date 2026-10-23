import Link from "next/link";
import { DayThread } from "@/components/dashboard/day-thread";
import { Logo } from "@/components/layout/logo";

export function AuthFrame({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_0.9fr]">
      <main id="main" className="flex flex-col px-5 py-6 sm:px-10">
        <Logo />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <h1 className="text-4xl">{title}</h1>
          <p className="mt-2 text-ink-2">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
        <Link href="/" className="text-sm text-ink-3 hover:text-ink">Back to the website</Link>
      </main>
      <aside aria-hidden className="hidden flex-col justify-center bg-brand-700 p-14 text-white lg:flex">
        <p className="font-display text-5xl leading-tight">सातत्य</p>
        <p className="mt-3 max-w-sm text-brand-100">One test, then the next. Keep the thread unbroken.</p>
        <div className="mt-10 max-w-sm rounded-3xl bg-white/10 p-6">
          <div className="[&_li_span:last-child]:text-brand-100 [&_span.bg-line]:bg-white/25">
            <DayThread states={["completed", "completed", "in_progress"]} />
          </div>
        </div>
      </aside>
    </div>
  );
}
