import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthFrame } from "@/components/auth/auth-frame";
import { noIndexFollow } from "@/lib/seo";

export const metadata: Metadata = { ...noIndexFollow, title: "Log in" };

export default function LoginPage() {
  return (
    <AuthFrame title="Welcome back" subtitle="Log in to continue today's practice.">
      <Suspense fallback={null}>
        <AuthForm mode="login" />
      </Suspense>
    </AuthFrame>
  );
}
