import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/misc";
import { noIndex } from "@/lib/seo";

export const metadata = { ...noIndex, title: "Page not found" };

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Container className="py-24">
          <p className="font-display text-7xl text-brand-600">404</p>
          <h1 className="mt-4 text-4xl">We couldn&apos;t find that page</h1>
          <p className="mt-4 max-w-lg text-ink-2">
            The link may be old or mistyped. Try the <Link className="font-semibold text-brand-700 underline" href="/mpsc-group-c">MPSC Group C guide</Link> or go back home.
          </p>
          <div className="mt-8 flex gap-3">
            <ButtonLink href="/">Go home</ButtonLink>
            <ButtonLink href="/mpsc-group-c/subjects" variant="secondary">Browse subjects</ButtonLink>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
