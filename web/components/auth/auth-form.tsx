"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers";
import { loadOrHealProfile } from "@/hooks/queries";
import { endpoints } from "@/lib/endpoints";
import { AuthError, signInWithUsername, signUpWithUsername } from "@/lib/auth";
import { loginSchema, signupSchema, type LoginValues, type SignupValues } from "@/lib/auth-schemas";
import { safeNextPath } from "@/lib/redirect";
import { zodResolver } from "@/lib/zod-resolver";
import { cn } from "@/lib/utils";

const inputCls =
  "block w-full rounded-xl border border-line-strong bg-card px-4 py-3 text-base text-ink placeholder:text-ink-3 focus:border-brand-600 aria-[invalid=true]:border-bad-600";

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
      </label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="mt-1.5 text-sm text-ink-3">{hint}</p>}
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1.5 text-sm font-medium text-bad-700">
          {error}
        </p>
      )}
    </div>
  );
}

function PasswordInput({ id, invalid, describedBy, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { id: string; invalid?: boolean; describedBy?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input id={id} type={show ? "text" : "password"} aria-invalid={invalid} aria-describedby={describedBy} className={cn(inputCls, "pr-12")} {...rest} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
        className="absolute inset-y-0 right-1 my-auto inline-flex size-10 items-center justify-center rounded-lg text-ink-3 hover:text-ink"
      >
        {show ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
      </button>
    </div>
  );
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const { status } = useAuth();
  const next = safeNextPath(params.get("next"));
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") router.replace(next);
  }, [status, next, router]);

  return mode === "login" ? (
    <LoginForm next={next} formError={formError} setFormError={setFormError} expired={params.get("expired") === "1"} />
  ) : (
    <SignupForm next={next} formError={formError} setFormError={setFormError} />
  );
}

interface FormProps {
  next: string;
  formError: string | null;
  setFormError: (s: string | null) => void;
}

function LoginForm({ next, formError, setFormError, expired }: FormProps & { expired: boolean }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (v) => {
    setFormError(null);
    try {
      const user = await signInWithUsername(v.username, v.password);
      await loadOrHealProfile(user.email).catch(() => undefined); // dashboard retries and shows errors
      router.replace(next);
    } catch (e) {
      setFormError(e instanceof AuthError ? e.message : "Something went wrong. Try again.");
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {expired && (
        <p role="status" className="rounded-xl bg-warn-50 px-4 py-3 text-sm text-warn-700">
          Your session ended. Please log in again.
        </p>
      )}
      <Field id="username" label="Username" error={errors.username?.message}>
        <input id="username" autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} aria-invalid={!!errors.username} aria-describedby={errors.username ? "username-err" : undefined} className={inputCls} {...register("username")} />
      </Field>
      <Field id="password" label="Password" error={errors.password?.message}>
        <PasswordInput id="password" autoComplete="current-password" invalid={!!errors.password} describedBy={errors.password ? "password-err" : undefined} {...register("password")} />
      </Field>
      {formError && <p role="alert" className="rounded-xl bg-bad-50 px-4 py-3 text-sm font-medium text-bad-700">{formError}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Logging in…" : "Log in"}
      </Button>
      <p className="text-center text-sm text-ink-2">
        New here? <Link href={`/signup${next !== "/dashboard" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-brand-700 underline">Create an account</Link>
      </p>
    </form>
  );
}

function SignupForm({ next, formError, setFormError }: FormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });

  const onSubmit = handleSubmit(async (v) => {
    setFormError(null);
    try {
      await signUpWithUsername(v.username, v.password);
    } catch (e) {
      setFormError(e instanceof AuthError ? e.message : "Something went wrong. Try again.");
      return;
    }
    // Same two-step signup as mobile. If this second call fails the account
    // still works: the dashboard recreates the profile on the next load.
    await endpoints.upsertProfile({ name: v.name, username: v.username }).catch(() => undefined);
    router.replace(next);
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <Field id="name" label="Your name" error={errors.name?.message}>
        <input id="name" autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-err" : undefined} className={inputCls} {...register("name")} />
      </Field>
      <Field id="username" label="Choose a username" error={errors.username?.message} hint="You will log in with this. It can't be changed later.">
        <input id="username" autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} aria-invalid={!!errors.username} aria-describedby={errors.username ? "username-err" : "username-hint"} className={inputCls} {...register("username")} />
      </Field>
      <Field id="password" label="Password" error={errors.password?.message} hint="At least 6 characters.">
        <PasswordInput id="password" autoComplete="new-password" invalid={!!errors.password} describedBy={errors.password ? "password-err" : "password-hint"} {...register("password")} />
      </Field>
      <Field id="confirmPassword" label="Confirm password" error={errors.confirmPassword?.message}>
        <PasswordInput id="confirmPassword" autoComplete="new-password" invalid={!!errors.confirmPassword} describedBy={errors.confirmPassword ? "confirmPassword-err" : undefined} {...register("confirmPassword")} />
      </Field>
      <p className="text-sm text-ink-3">
        There is no email on your account, so a forgotten password can&apos;t be reset by email. Keep it somewhere safe.
      </p>
      {formError && <p role="alert" className="rounded-xl bg-bad-50 px-4 py-3 text-sm font-medium text-bad-700">{formError}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating account…" : "Create account"}
      </Button>
      <p className="text-center text-sm text-ink-2">
        Already registered? <Link href="/login" className="font-semibold text-brand-700 underline">Log in</Link>
      </p>
    </form>
  );
}
