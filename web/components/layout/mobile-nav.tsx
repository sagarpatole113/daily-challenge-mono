"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { buttonClass } from "@/components/ui/button";

export interface NavItem {
  href: string;
  label: string;
}

export function MobileNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  // Open state is tied to the path it was opened on, so navigating closes it
  // without an effect.
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const setOpen = (v: boolean | ((o: boolean) => boolean)) => {
    const next = typeof v === "function" ? v(open) : v;
    setOpenPath(next ? pathname : null);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenPath(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-11 items-center justify-center rounded-xl text-ink hover:bg-sunken"
      >
        {open ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
      </button>
      {open && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="absolute inset-x-0 top-full border-b border-line bg-paper px-5 pb-6 pt-2 shadow-card"
        >
          <ul className="flex flex-col">
            {items.map((i) => (
              <li key={i.href}>
                <Link href={i.href} className="block rounded-lg px-2 py-3 text-lg font-medium text-ink hover:bg-sunken">
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link href="/login" className={buttonClass("secondary", "lg")}>
              Log in
            </Link>
            <Link href="/signup" className={buttonClass("primary", "lg")}>
              Start practicing
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
