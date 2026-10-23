"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Clock, Grid3x3, Loader2, LogOut, Send, WifiOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { LangToggle } from "@/components/test/lang-toggle";
import { Palette } from "@/components/test/palette";
import { QuestionView } from "@/components/test/question-view";
import { useAuth } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useLanguage } from "@/hooks/use-language";
import { useNow } from "@/hooks/use-now";
import { qk } from "@/hooks/queries";
import type { AnswerSync, SyncSnapshot } from "@/lib/answer-sync";
import { isApiError } from "@/lib/api";
import {
  clearAnswer,
  selectOption,
  summarize,
  toggleMark,
  visit,
  type AnswerMap,
  type Change,
} from "@/lib/attempt";
import { formatMmSs, remainingMs } from "@/lib/dates";
import { endpoints } from "@/lib/endpoints";
import { expireWithRetry, warnLevel } from "@/lib/expire";
import { cn } from "@/lib/utils";
import type { AttemptResult, QuestionPublic } from "@/types/shared";

export interface ActiveTestProps {
  attemptId: string;
  testNumber: number;
  expiresAt: string;
  questions: QuestionPublic[];
  initialAnswers: AnswerMap;
  sync: AnswerSync;
  serverOffsetMs: number;
}

type Phase = "running" | "submitting" | "expiring" | "failed";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function ActiveTest({ attemptId, testNumber, expiresAt, questions, initialAnswers, sync, serverOffsetMs }: ActiveTestProps) {
  const router = useRouter();
  const qc = useQueryClient();
  const { uid } = useAuth();
  const [lang, setLang] = useLanguage();

  const answersRef = useRef<AnswerMap>(initialAnswers);
  const [answers, setAnswers] = useState<AnswerMap>(initialAnswers);
  const [index, setIndex] = useState(() => {
    const first = questions.findIndex((q) => {
      const s = initialAnswers[q.id]?.status;
      return s !== "ANSWERED" && s !== "ANSWERED_AND_MARKED";
    });
    return first === -1 ? 0 : first;
  });
  const [phase, setPhase] = useState<Phase>("running");
  const [failure, setFailure] = useState<{ kind: "submit" | "expire"; message: string } | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [unsaved, setUnsaved] = useState(0);
  const [syncSnap, setSyncSnap] = useState<SyncSnapshot>(() => sync.snapshot());
  const [announcement, setAnnouncement] = useState("");

  const q = questions[index] as QuestionPublic;
  const summary = summarize(answers, questions);

  // ---- Timer: derived from the server's expiresAt every tick -----------------
  const now = useNow(1000);
  const remaining = remainingMs(expiresAt, now, serverOffsetMs);
  const remSec = Math.ceil(remaining / 1000);
  const level = warnLevel(remSec);

  // ---- Sync status -----------------------------------------------------------
  useEffect(() => sync.listen(setSyncSnap), [sync]);
  useEffect(() => {
    void sync.flush(); // deliver anything restored after a reload
    const online = () => void sync.retryNow();
    window.addEventListener("online", online);
    return () => {
      window.removeEventListener("online", online);
      sync.dispose();
    };
  }, [sync]);

  // Only warn on unload when answers would be lost; the clock itself is server-side.
  useEffect(() => {
    if (syncSnap.pending === 0 || phase !== "running") return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [syncSnap.pending, phase]);

  // ---- Answer mutations ------------------------------------------------------
  const apply = useCallback(
    (r: { answers: AnswerMap; change: Change } | null) => {
      if (!r) return;
      answersRef.current = r.answers;
      setAnswers(r.answers);
      sync.enqueue(r.change.body);
    },
    [sync],
  );
  const locked = phase !== "running";

  const onSelect = useCallback((opt: string) => apply(selectOption(answersRef.current, q.id, opt)), [apply, q.id]);
  const onMark = useCallback(() => apply(toggleMark(answersRef.current, q.id)), [apply, q.id]);
  const onClear = useCallback(() => apply(clearAnswer(answersRef.current, q.id)), [apply, q.id]);

  // Visiting a question marks it "not answered" locally (mobile parity; not sent to the server).
  useEffect(() => {
    const next = visit(answersRef.current, q.id);
    if (next !== answersRef.current) {
      answersRef.current = next;
      setAnswers(next);
    }
  }, [q.id]);

  const go = useCallback((i: number) => setIndex(Math.min(questions.length - 1, Math.max(0, i))), [questions.length]);

  // ---- Finishing -------------------------------------------------------------
  const finish = useCallback(
    async (result: AttemptResult) => {
      sync.clearStored();
      if (uid) {
        qc.setQueryData(qk.result(uid, attemptId), result);
        // Progress, unlocks and profile stats all changed on the server.
        await qc.invalidateQueries({ queryKey: ["u", uid], refetchType: "none" });
        qc.removeQueries({ queryKey: qk.review(uid, attemptId) });
      }
      router.replace(`/dashboard/result/${attemptId}`);
    },
    [attemptId, qc, router, sync, uid],
  );

  const doExpire = useCallback(async () => {
    setPhase("expiring");
    setConfirmOpen(false);
    setLeaveOpen(false);
    setPaletteOpen(false);
    setFailure(null);
    await Promise.race([sync.flush(), sleep(2500)]).catch(() => undefined);
    try {
      const result = await expireWithRetry(() => endpoints.expireAttempt(attemptId));
      await finish(result);
    } catch (e) {
      setPhase("failed");
      setFailure({ kind: "expire", message: isApiError(e) ? e.message : "Couldn't finish the test." });
    }
  }, [attemptId, finish, sync]);

  useEffect(() => {
    if (remaining > 0 || phase !== "running") return;
    // Deferred so the state change happens in a callback, not the effect body.
    const id = setTimeout(() => void doExpire(), 0);
    return () => clearTimeout(id);
  }, [remaining, phase, doExpire]);

  const doSubmit = useCallback(
    async (force = false) => {
      setPhase("submitting");
      setFailure(null);
      await sync.flush();
      if (!force && sync.pendingCount > 0) {
        setUnsaved(sync.pendingCount);
        setPhase("running");
        return;
      }
      try {
        const result = await endpoints.submitAttempt(attemptId);
        setConfirmOpen(false);
        await finish(result);
      } catch (e) {
        setPhase("running");
        setFailure({ kind: "submit", message: isApiError(e) ? e.message : "Couldn't submit. Try again." });
      }
    },
    [attemptId, finish, sync],
  );

  // ---- Screen-reader announcements at 10 / 5 / 1 minutes ---------------------
  const lastLevel = useRef(level);
  useEffect(() => {
    if (level !== lastLevel.current && level !== "none") {
      setAnnouncement(level === "ten" ? "10 minutes remaining." : level === "five" ? "5 minutes remaining." : "1 minute remaining.");
    }
    lastLevel.current = level;
  }, [level]);

  // ---- Keyboard shortcuts ----------------------------------------------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase !== "running" || paletteOpen || confirmOpen || leaveOpen) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "ArrowRight") go(index + 1);
      else if (e.key === "ArrowLeft") go(index - 1);
      else if (e.key.toLowerCase() === "m") onMark();
      else {
        const k = e.key.toLowerCase();
        const idx = "abcd".indexOf(k) !== -1 && k.length === 1 ? "abcd".indexOf(k) : "1234".indexOf(k);
        const opt = idx >= 0 && k.length === 1 ? q.options[idx] : undefined;
        if (opt) onSelect(opt.id);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [phase, paletteOpen, confirmOpen, leaveOpen, go, index, onMark, onSelect, q.options]);

  const timerTone = remSec <= 60 ? "bg-bad-600 text-white" : remSec <= 300 ? "bg-warn-500 text-ink" : "bg-ink text-white";

  return (
    <div className="min-h-dvh bg-paper">
      <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-8">
          <div className="min-w-0">
            <p className="font-display text-xl leading-none sm:text-2xl">Test {testNumber}</p>
            <p className="mt-1 whitespace-nowrap text-xs text-ink-3">
              {summary.answered}/{summary.total} answered
            </p>
          </div>
          <div
            role="timer"
            aria-label="Time remaining"
            className={cn("inline-flex items-center gap-2 rounded-xl px-3.5 py-2 font-mono text-lg font-bold tabular-nums", timerTone)}
          >
            <Clock className="size-5" aria-hidden />
            {formatMmSs(remSec)}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setLeaveOpen(true)} disabled={locked} aria-label="Leave test">
              <LogOut className="size-4 sm:hidden" aria-hidden />
              <span className="max-sm:hidden">Leave</span>
            </Button>
            <Button size="md" onClick={() => setConfirmOpen(true)} disabled={locked}>
              <Send className="size-4" aria-hidden />
              Submit
            </Button>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto grid max-w-6xl gap-6 px-4 pb-32 pt-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:pb-12">
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <LangToggle value={lang} onChange={setLang} />
            <SyncBadge snap={syncSnap} />
          </div>
          <QuestionView
            question={q}
            index={index}
            total={questions.length}
            answer={answers[q.id]}
            lang={lang}
            disabled={locked}
            onSelect={onSelect}
            onToggleMark={onMark}
            onClear={onClear}
          />
          <div className="mt-5 hidden items-center justify-between lg:flex">
            <Button variant="secondary" onClick={() => go(index - 1)} disabled={index === 0}>
              <ChevronLeft className="size-5" aria-hidden /> Previous
            </Button>
            <Button onClick={() => go(index + 1)} disabled={index === questions.length - 1}>
              Next <ChevronRight className="size-5" aria-hidden />
            </Button>
          </div>
        </div>

        <aside aria-label="Question navigator" className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-line bg-card p-4">
            <h2 className="font-sans text-sm font-bold text-ink">Questions</h2>
            <div className="mt-3 max-h-[60vh] overflow-y-auto pr-1">
              <Palette questions={questions} answers={answers} current={index} onJump={go} />
            </div>
          </div>
        </aside>
      </main>

      {/* Mobile / tablet action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-[auto_1fr_1fr] gap-2">
          <Button variant="secondary" onClick={() => setPaletteOpen(true)} aria-label="Open question navigator">
            <Grid3x3 className="size-5" aria-hidden />
            <span>{index + 1}/{questions.length}</span>
          </Button>
          <Button variant="secondary" onClick={() => go(index - 1)} disabled={index === 0}>
            <ChevronLeft className="size-5" aria-hidden /> Prev
          </Button>
          <Button onClick={() => go(index + 1)} disabled={index === questions.length - 1}>
            Next <ChevronRight className="size-5" aria-hidden />
          </Button>
        </div>
      </div>

      <div className="sr-only-live" aria-live="polite" role="status">
        {announcement}
      </div>

      <Modal open={paletteOpen} onClose={() => setPaletteOpen(false)} title="Jump to a question" sheet>
        <div className="max-h-[60vh] overflow-y-auto">
          <Palette
            questions={questions}
            answers={answers}
            current={index}
            onJump={(i) => {
              go(i);
              setPaletteOpen(false);
            }}
          />
        </div>
      </Modal>

      <Modal open={confirmOpen && phase !== "expiring"} onClose={() => phase !== "submitting" && setConfirmOpen(false)} title="Submit this test?">
        <dl className="grid grid-cols-3 gap-2 text-center">
          <Stat label="Answered" value={summary.answered} tone="ok" />
          <Stat label="Unanswered" value={summary.unanswered} tone={summary.unanswered ? "bad" : "neutral"} />
          <Stat label="Marked" value={summary.marked} tone="warn" />
        </dl>
        <p className="mt-4 text-sm text-ink-2">
          Time left: <strong className="tabular-nums">{formatMmSs(remSec)}</strong>. Once you submit, you can&apos;t change your answers.
        </p>
        {unsaved > 0 && (
          <p role="alert" className="mt-4 rounded-xl bg-warn-50 px-4 py-3 text-sm text-warn-700">
            {unsaved} {unsaved === 1 ? "answer hasn't" : "answers haven't"} reached the server yet. Check your connection and retry, or submit anyway and those answers will not count.
          </p>
        )}
        {failure?.kind === "submit" && (
          <p role="alert" className="mt-4 rounded-xl bg-bad-50 px-4 py-3 text-sm text-bad-700">{failure.message}</p>
        )}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setConfirmOpen(false)} disabled={phase === "submitting"}>
            Keep working
          </Button>
          {unsaved > 0 && (
            <Button variant="danger" onClick={() => void doSubmit(true)} disabled={phase === "submitting"}>
              Submit anyway
            </Button>
          )}
          <Button onClick={() => void doSubmit(false)} disabled={phase === "submitting"}>
            {phase === "submitting" ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden /> Submitting…
              </>
            ) : unsaved > 0 ? (
              "Retry and submit"
            ) : (
              "Submit test"
            )}
          </Button>
        </div>
      </Modal>

      <Modal open={leaveOpen} onClose={() => setLeaveOpen(false)} title="Leave this test?">
        <p className="text-ink-2">
          Your saved answers are kept and you can come back to this test. <strong>The timer keeps running</strong> while you are away, and
          the test finishes automatically when time is up.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setLeaveOpen(false)}>Stay</Button>
          <Button
            onClick={async () => {
              await sync.flush();
              router.push("/dashboard");
            }}
          >
            Leave to dashboard
          </Button>
        </div>
      </Modal>

      {(phase === "expiring" || (phase === "failed" && failure?.kind === "expire")) && (
        <div role="alertdialog" aria-modal="true" aria-labelledby="exp-h" className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-6">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 text-center shadow-pop">
            <h2 id="exp-h" className="text-2xl">Time&apos;s up</h2>
            {phase === "expiring" ? (
              <p className="mt-3 inline-flex items-center gap-2 text-ink-2">
                <Loader2 className="size-5 animate-spin" aria-hidden /> Finishing your test and scoring it…
              </p>
            ) : (
              <>
                <p role="alert" className="mt-3 text-sm text-bad-700">{failure?.message}</p>
                <Button className="mt-5 w-full" onClick={() => void doExpire()}>Try again</Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "ok" | "bad" | "warn" | "neutral" }) {
  const cls = { ok: "bg-ok-50 text-ok-700", bad: "bg-bad-50 text-bad-700", warn: "bg-warn-50 text-warn-700", neutral: "bg-sunken text-ink-2" }[tone];
  return (
    <div className={cn("rounded-xl p-3", cls)}>
      <dd className="font-display text-3xl">{value}</dd>
      <dt className="text-xs font-semibold">{label}</dt>
    </div>
  );
}

function SyncBadge({ snap }: { snap: SyncSnapshot }) {
  if (snap.phase === "retrying") {
    return (
      <p role="status" className="inline-flex items-center gap-1.5 rounded-full bg-warn-50 px-3 py-1 text-xs font-semibold text-warn-700">
        <WifiOff className="size-3.5" aria-hidden /> Offline. Retrying ({snap.pending} unsaved)
      </p>
    );
  }
  if (snap.phase === "saving" || snap.pending > 0) {
    return (
      <p role="status" className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-3">
        <Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden /> Saving…
      </p>
    );
  }
  return <p role="status" className="text-xs font-medium text-ink-3">All answers saved</p>;
}
