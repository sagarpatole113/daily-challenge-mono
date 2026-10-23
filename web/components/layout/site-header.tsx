import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { MobileNav, type NavItem } from "@/components/layout/mobile-nav";
import { buttonClass } from "@/components/ui/button";

export const NAV: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/mpsc-group-c", label: "MPSC Group C" },
  { href: "/mpsc-group-c/syllabus", label: "Syllabus" },
  { href: "/mpsc-group-c/exam-pattern", label: "Exam Pattern" },
  { href: "/mpsc-group-c/study-resources", label: "Study Resources" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-white backdrop-blur">
      <div className="relative mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Logo />
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((i) => (
              <li key={i.href}>
                <Link href={i.href} className="rounded-lg px-3 py-2 text-[0.95rem] font-medium text-ink-2 hover:bg-sunken hover:text-ink">
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/login" className={buttonClass("ghost")}>
            Log in
          </Link>
          <Link href="/signup" className={buttonClass("primary")}>
            Start practicing
          </Link>
        </div>
        <MobileNav items={NAV} />
      </div>
    </header>
  );
}
