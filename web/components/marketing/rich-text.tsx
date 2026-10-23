import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Tiny inline formatter for editorial strings: [label](url) and **bold**.
 * Internal links use next/link; external links open safely.
 */
export function RichText({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[3]) {
      nodes.push(<strong key={key++}>{m[3]}</strong>);
    } else {
      const label = m[1] ?? "";
      const href = m[2] ?? "#";
      nodes.push(
        href.startsWith("/") ? (
          <Link key={key++} href={href}>
            {label}
          </Link>
        ) : (
          <a key={key++} href={href} rel="noopener noreferrer" target="_blank">
            {label}
          </a>
        ),
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes}</>;
}
