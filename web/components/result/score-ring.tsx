/** Score out of the paper's total marks. Animates once; static under reduced motion. */
export function ScoreRing({ score, outOf = 100 }: { score: number; outOf?: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const frac = Math.max(0, Math.min(1, score / outOf));
  const target = c * (1 - frac);
  return (
    <div className="relative size-52">
      <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden>
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-sunken)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="var(--color-brand-600)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={target}
          className="animate-draw"
          style={{ "--draw-from": c, "--draw-to": target } as React.CSSProperties}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="font-display text-5xl tabular-nums text-ink">{score}</p>
        <p className="text-sm text-ink-3">out of {outOf}</p>
      </div>
    </div>
  );
}
