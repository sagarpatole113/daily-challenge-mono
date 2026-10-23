"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PerformanceOverview } from "@/components/dashboard/performance";
import { useAuth } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { ErrorState, Skeleton } from "@/components/ui/misc";
import { useMe } from "@/hooks/queries";
import { AuthError, changePassword } from "@/lib/auth";
import { zodResolver } from "@/lib/zod-resolver";

const pwSchema = z
  .object({ password: z.string().min(6, "At least 6 characters"), confirm: z.string() })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords don't match" });
type PwValues = z.infer<typeof pwSchema>;

export function ProfileView() {
  const me = useMe();
  const { logout } = useAuth();
  const router = useRouter();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PwValues>({ resolver: zodResolver(pwSchema) });

  if (me.isPending) return <Skeleton className="h-80" />;
  if (me.isError) return <ErrorState message={me.error.message} onRetry={() => me.refetch()} />;
  const u = me.data;

  const input = "block w-full rounded-xl border border-line-strong bg-card px-4 py-3 aria-[invalid=true]:border-bad-600";

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-4xl sm:text-5xl">{u.name}</h1>
        <p className="mt-2 text-ink-2">@{u.username}
          {u.createdAt && <> · Member since {new Date(u.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</>}
        </p>
      </header>

      <section aria-labelledby="stats-h">
        <h2 id="stats-h" className="text-3xl">Your statistics</h2>
        <div className="mt-5"><PerformanceOverview user={u} /></div>
      </section>

      <section aria-labelledby="pw-h" className="max-w-md">
        <h2 id="pw-h" className="text-3xl">Change password</h2>
        <form
          noValidate
          className="mt-5 space-y-4"
          onSubmit={handleSubmit(async (v) => {
            setMsg(null);
            try {
              await changePassword(v.password);
              reset();
              setMsg({ ok: true, text: "Password updated." });
            } catch (e) {
              setMsg({ ok: false, text: e instanceof AuthError ? e.message : "Couldn't update the password." });
            }
          })}
        >
          <div>
            <label htmlFor="np" className="mb-1.5 block text-sm font-semibold">New password</label>
            <input id="np" type="password" autoComplete="new-password" aria-invalid={!!errors.password} className={input} {...register("password")} />
            {errors.password && <p role="alert" className="mt-1 text-sm text-bad-700">{errors.password.message}</p>}
          </div>
          <div>
            <label htmlFor="cp" className="mb-1.5 block text-sm font-semibold">Confirm new password</label>
            <input id="cp" type="password" autoComplete="new-password" aria-invalid={!!errors.confirm} className={input} {...register("confirm")} />
            {errors.confirm && <p role="alert" className="mt-1 text-sm text-bad-700">{errors.confirm.message}</p>}
          </div>
          {msg && <p role={msg.ok ? "status" : "alert"} className={msg.ok ? "text-sm font-medium text-ok-700" : "text-sm font-medium text-bad-700"}>{msg.text}</p>}
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Updating…" : "Update password"}</Button>
        </form>
      </section>

      <section>
        <Button variant="secondary" onClick={async () => { await logout(); router.replace("/login"); }}>Log out</Button>
      </section>
    </div>
  );
}
