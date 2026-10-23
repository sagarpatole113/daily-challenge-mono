"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, Home, LogOut, User as UserIcon } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { useAuth } from "@/components/providers";
import { useMe } from "@/hooks/queries";
import { cn, firstName } from "@/lib/utils";

const ITEMS = [
  { href: "/dashboard", label: "Today", icon: Home, exact: true },
  { href: "/dashboard/tests", label: "Practice days", icon: CalendarDays, exact: false },
  { href: "/dashboard/profile", label: "Profile", icon: UserIcon, exact: false },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const me = useMe();

  const isActive = (href: string, exact: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-line/70 bg-white backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <Logo href="/dashboard" />
          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {ITEMS.map((i) => (
                <li key={i.href}>
                  <Link
                    href={i.href}
                    aria-current={isActive(i.href, i.exact) ? "page" : undefined}
                    className={cn(
                      "rounded-lg px-3 py-2 text-[0.95rem] font-medium",
                      isActive(i.href, i.exact) ? "bg-brand-50 text-brand-700" : "text-ink-2 hover:bg-sunken",
                    )}
                  >
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-2">
            {me.data && <span className="hidden text-sm text-ink-2 sm:block">{firstName(me.data.name)}</span>}
            <button
              type="button"
              onClick={async () => {
                await logout();
                router.replace("/login");
              }}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-ink-2 hover:bg-sunken"
            >
              <LogOut className="size-4" aria-hidden />
              <span className="hidden sm:inline">Log out</span>
              <span className="sr-only sm:hidden">Log out</span>
            </button>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-6xl px-5 pb-28 pt-8 sm:px-8 md:pb-16">
        {children}
      </main>

      <nav aria-label="Main (mobile)" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 backdrop-blur md:hidden">
        <ul className="mx-auto grid max-w-md grid-cols-3 pb-[env(safe-area-inset-bottom)]">
          {ITEMS.map((i) => {
            const Icon = i.icon;
            const active = isActive(i.href, i.exact);
            return (
              <li key={i.href}>
                <Link
                  href={i.href}
                  aria-current={active ? "page" : undefined}
                  className={cn("flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-semibold", active ? "text-brand-700" : "text-ink-3")}
                >
                  <Icon className="size-5" aria-hidden />
                  {i.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
