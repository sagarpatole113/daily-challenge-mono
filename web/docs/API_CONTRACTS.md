# API contracts used by the web app

Verified against `api/src/modules/*`. Base: `NEXT_PUBLIC_API_URL` (includes `/api/v1`). All routes below require `Authorization: Bearer <Firebase ID token>`. Envelope: `{ success: true, data, message }`; failures `{ success: false, message, errors? }`.

| Method and path | Request | Response `data` | Notes |
|---|---|---|---|
| `GET /users/me` | none | `User` | 404 if profile missing; web self-heals via `POST /users/profile` like mobile |
| `POST /users/profile` | `{ name (2-80), username? (^[a-z][a-z0-9_]{2,19}$) }` | `User` | Second step of signup |
| `GET /days` | none | `DayListItem[]` | ACTIVE days, newest first, **max 30** |
| `GET /days/:dayId` | none | day detail | not needed by UI |
| `GET /days/:dayId/tests` | none | `DailyTestWithState[]` | per-user `locked/unlocked/completed/inProgress/attemptId?` |
| `POST /tests/:testId/start` | `{ dayId }` | `{ attemptId, startedAt, expiresAt, durationMinutes, questions[] }` **or** `{ attemptId, result }` | Resumes an IN_PROGRESS attempt with its original times. If a stale attempt had expired it is finalised and `result` is returned instead. 403 if locked. Questions carry no answers/explanations. |
| `GET /attempts/:id` | none | attempt (+ `answers[]` while IN_PROGRESS) | `answers[]` rows: `questionId, selectedOptionId, status` (timestamps are Firestore objects, ignored) |
| `POST /attempts/:id/answers` | `{ questionId, selectedOptionId \| null, status }` | `{ saved: true }` | 409 once finalised. `status`: NOT_VISITED, NOT_ANSWERED, ANSWERED, MARKED_FOR_REVIEW, ANSWERED_AND_MARKED |
| `POST /attempts/:id/submit` | none | `AttemptResult` | Idempotent. If past expiry it is recorded as TIME_EXPIRED |
| `POST /attempts/:id/expire` | none | `AttemptResult` | **403 until server `expiresAt` has passed**; idempotent |
| `GET /attempts/:id/result` | none | `AttemptResult` | `accuracy` is a 0-100 percentage of answered questions |
| `GET /attempts/:id/review` | none | `ReviewQuestionItem[]` | Only after completion; includes correct option and explanations |
| `GET /health` (server root) | none, **no auth** | `{ time }` | Used only to estimate clock offset for the countdown display |

## Scoring and progression (server-owned, never recomputed in the browser)

`score = correct × 1 − wrong × 0.25`, unanswered = 0. Completing or expiring test N unlocks N+1. The web UI renders the server's `locked/unlocked/completed/inProgress` flags and contains no unlock logic.

## Observed backend behaviours the frontend must work around (not changed)

1. **Starting an already-completed test creates a new attempt.** `startTest` only checks the unlock level. The web runner therefore re-reads the day's test states from the API immediately before calling `start` and refuses completed/locked tests. A direct API caller can still do this; recommend a server-side guard.
2. **`GET /days/:dayId/tests/:testId`** returns masked questions without time gating. The web app does not use it.
3. **No attempt-listing or history endpoint**, so per-test score trends over time are not available. The dashboard shows only profile aggregates and a 14-day completion strip derived from `GET /days`.
