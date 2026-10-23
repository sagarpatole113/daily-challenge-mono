"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/providers";
import { Container, Spinner } from "@/components/ui/misc";

/**
 * UX guard only. It hides the private UI from signed-out visitors and sends
 * them to /login, but it is NOT a security boundary: every API call is
 * independently authorised by the existing backend from the Firebase token.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useAuth(); 
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      const search = typeof window !== "undefined" ? window.location.search : "";
      router.replace(`/login?next=${encodeURIComponent(pathname + search)}`);
    }
  }, [status, pathname, router]);

  if (status === "authenticated") return <>{children}</>;

  if (status === "unconfigured") {
    return (
      <Container className="py-24">
        <h1 className="text-3xl">Sign-in isn&apos;t configured</h1>
        <p className="mt-3 max-w-lg text-ink-2">
          This deployment is missing its Firebase web configuration. If you run this site, set the NEXT_PUBLIC_FIREBASE_* variables (see .env.example).
        </p>
      </Container>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner label={status === "loading" ? "Checking your session" : "Redirecting to log in"} />
    </div>
  );
}
