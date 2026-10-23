import { JsonLd } from "@/components/json-ld";
import { Breadcrumbs } from "@/components/marketing/breadcrumbs";
import { Container } from "@/components/ui/misc";
import { breadcrumbJsonLd } from "@/lib/seo";

export function SimplePage({
  title,
  path,
  lead,
  updated,
  children,
}: {
  title: string;
  path: string;
  lead?: string;
  updated?: string;
  children: React.ReactNode;
}) {
  const crumbs = [{ name: "Home", path: "/" }, { name: title, path }];
  return (
    <Container className="pt-8 sm:pt-12">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs crumbs={crumbs} />
      <h1 className="mt-6 max-w-3xl text-4xl sm:text-5xl">{title}</h1>
      {lead && <p className="mt-5 max-w-2xl text-lg text-ink-2">{lead}</p>}
      {updated && <p className="mt-3 text-sm text-ink-3">Last updated {updated}</p>}
      <div className="prose-guide mt-6">{children}</div>
    </Container>
  );
}
