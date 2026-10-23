import { AlertTriangle, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8", className)}>{children}</div>;
}

export function Spinner({ label = "Loading", className }: { label?: string; className?: string }) {
  return (
    <span role="status" className={cn("inline-flex items-center gap-2 text-ink-3", className)}>
      <Loader2 className="size-5 animate-spin motion-reduce:animate-none" aria-hidden />
      <span className="text-sm">{label}</span>
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-xl bg-sunken motion-reduce:animate-none", className)} />;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  className,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div role="alert" className={cn("rounded-2xl border border-bad-100 bg-bad-50 p-6 text-bad-700", className)}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />
        <div>
          <p className="font-semibold">{title}</p>
          {message && <p className="mt-1 text-sm">{message}</p>}
          {onRetry && (
            <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
              Try again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: "neutral" | "brand" | "ok" | "warn" | "bad";
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    neutral: "bg-sunken text-ink-2",
    brand: "bg-brand-50 text-brand-700",
    ok: "bg-ok-50 text-ok-700",
    warn: "bg-warn-50 text-warn-700",
    bad: "bg-bad-50 text-bad-700",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone], className)}>
      {children}
    </span>
  );
}

export function ProgressBar({ value, max, label, tone = "ok" }: { value: number; max: number; label: string; tone?: "ok" | "brand" }) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className="h-2.5 w-full overflow-hidden rounded-full bg-sunken"
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-700", tone === "ok" ? "bg-ok-600" : "bg-brand-600")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
