"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/misc";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main">
      <Container className="py-24">
        <h1 className="text-4xl">Something went wrong</h1>
        <p className="mt-4 max-w-lg text-ink-2">An unexpected error occurred. You can try again, or return to the home page.</p>
        <div className="mt-8 flex gap-3">
          <Button onClick={reset}>Try again</Button>
          <Link href="/" className="inline-flex min-h-11 items-center rounded-xl border border-line-strong px-4 font-semibold">Home</Link>
        </div>
      </Container>
    </main>
  );
}
