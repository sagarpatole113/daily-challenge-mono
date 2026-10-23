import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthFrame } from "@/components/auth/auth-frame";
import { noIndexFollow } from "@/lib/seo";

export const metadata: Metadata = { ...noIndexFollow, title: "Create your account" };

export default function SignupPage() {
  return (
    <AuthFrame title="Start your daily practice" subtitle="Create a free account in under a minute.">
      <Suspense fallback={null}>
        <AuthForm mode="signup" />
      </Suspense>
    </AuthFrame>
  );
}
