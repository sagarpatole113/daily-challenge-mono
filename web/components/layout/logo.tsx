import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5", className)} aria-label="Saatatya home">
      <Image src="/Saatatya.jpeg" alt="" width={66} height={66} className="size-14 object-contain" />
    </Link>
  );
}
