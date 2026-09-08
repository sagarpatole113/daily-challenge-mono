# MPSC Daily Challenge

A mobile daily-test platform for MPSC Group C aspirants. Students complete a
sequence of 10 exam-pattern tests every day, unlocking each test only after
completing the one before it — building the daily discipline of real exam
practice.

This repository contains four coordinated projects:

```
mpsc-daily-challenge/
├── mobile/    React Native (Expo) app — the student-facing product
├── api/       Node.js + Express API — the source of truth for progression & scoring
├── cron/      Node.js importer — publishes each day's 10 tests from JSON
├── shared/    Shared TypeScript types & constants used by all three
├── firebase/  Firestore security rules
└── README.md  This file
```

---

## 1. Product Overview

**Core loop:**

```
Open app → Log in once (mobile number + OTP) → stay logged in until logout
  → Pick a day (Today / Yesterday / earlier)
  → See 10 tests for that day
  → Test 1 is unlocked, Tests 2–10 are locked
  → Complete Test 1 (submit or 60-min timer expiry)
  → See result → Test 2 unlocks
  → Repeat until Test 10
  → Review any past test's score and answers, anytime
```

Every test: **100 MCQs, 60 minutes, +1 correct, −0.25 wrong, 0 unanswered,
bilingual (English + Marathi)**. Answers and explanations are hidden until
the test is completed.

---

## 2. Architecture

```
                        ┌─────────────────────────┐
                        │   Firebase Authentication │
                        │   (Phone number + OTP)    │
                        └────────────┬──────────────┘
                                     │ ID token
                                     ▼
 ┌───────────────┐   HTTPS    ┌──────────────────┐    Admin SDK    ┌─────────────┐
 │  Mobile App    │──────────▶│   Node.js API     │────────────────▶│  Firestore  │
 │ (Expo Router)  │◀──────────│  (Express + Zod)  │◀────────────────│             │
 └───────────────┘  JSON      └──────────────────┘   reads/writes   └──────┬──────┘
                                                                             ▲
                                                                             │ Admin SDK
                                                                     ┌───────┴────────┐
                                                                     │  Cron Importer  │
                                                                     │ (node-cron/CLI) │
                                                                     └────────────────┘
```

**Why this split:** the mobile app never writes anything sensitive (score,
completion state, unlock state, correct answers) directly to Firestore. All
of that is computed and written by the API using the Firebase Admin SDK,
which is the only thing Firestore's security rules trust for those fields.
The client can only read its own data. See [`firebase/firestore.rules`](./firebase/firestore.rules).

---

## 3. Database Structure (Firestore)

```
users/{userId}
  name, phoneNumber, createdAt, updatedAt, lastActiveAt,
  currentDayId, currentTestNumber,
  totalTestsCompleted, totalQuestionsAttempted,
  totalCorrectAnswers, totalWrongAnswers, totalScore

  users/{userId}/testAttempts/{attemptId}
    dayId, testId, testNumber, status (IN_PROGRESS|COMPLETED|TIME_EXPIRED),
    startedAt, expiresAt, submittedAt,
    score, correctAnswers, wrongAnswers, unansweredQuestions,
    accuracy, timeTakenSeconds

    users/{userId}/testAttempts/{attemptId}/answers/{questionId}
      selectedOptionId, status, answeredAt, updatedAt

  users/{userId}/dailyProgress/{dayId}
    completedTests, currentUnlockedTest, completedTestIds[], dayCompleted

dailyTestBatches/{dayId}                     e.g. dayId = "2026-09-02"
  date, totalTests, status (ACTIVE|DRAFT), createdAt, publishedAt

  dailyTestBatches/{dayId}/tests/{testId}     e.g. testId = "test-1"
    testNumber, title, totalQuestions, totalMarks,
    durationMinutes, negativeMarking, status

    dailyTestBatches/{dayId}/tests/{testId}/questions/{questionId}
      questionId, questionNumber       ← thin mapping, not full content

questions/{questionId}                        top-level, reused across tests
  subject, topic, difficulty,
  questionEnglish, questionMarathi,
  options: [{ id, english, marathi }],
  correctOptionId,
  explanationEnglish, explanationMarathi
```

Question **content** lives once in the top-level `questions` collection;
each test only stores a lightweight `{questionId, questionNumber}` mapping.
The API assembles the two together and — critically — strips
`correctOptionId` and explanations whenever it serves a test that's still
in progress.

---

## 4. Authentication & Persistent Login

- **Login method:** mobile number + Firebase Phone Auth OTP. New users are
  asked for their name once (signup step 3); returning users go straight
  into the app.
- **Persistence:** the mobile app initializes Firebase Auth with
  `getReactNativePersistence(AsyncStorage)` (see `mobile/src/services/firebase.ts`).
  This is what keeps the user logged in across app restarts — there is no
  custom session/token code to maintain.
- **Startup flow:** `app/_layout.tsx` subscribes to `onAuthStateChanged`
  once. It fires immediately with the restored session (or `null`) and the
  app routes straight to Home or Login accordingly — no flash of the wrong
  screen.
- **API side:** every request carries `Authorization: Bearer <Firebase ID
  token>`. The API's `requireAuth` middleware verifies it with the Admin
  SDK and attaches `req.user = { uid, phoneNumber }`. There is no custom
  JWT anywhere in this system.
- **Logout:** only ever happens when the user taps Logout on the Profile
  screen, which calls Firebase `signOut()`.

### Firebase Phone Auth on React Native — one extra step

The plain Firebase JS SDK's phone-auth flow expects a browser reCAPTCHA. On
a real device you need one of:

- **Expo Go / no native build:** [`expo-firebase-recaptcha`](https://github.com/expo/expo-firebase-recaptcha)
  — a modal reCAPTCHA that satisfies `verifyPhoneNumber`. The login screen
  (`mobile/app/(auth)/login.tsx`) has this wired up as a commented-out
  import — install the package and un-comment it.
- **Dev client / bare build:** use a native phone-auth flow, e.g.
  `@react-native-firebase/auth`, which talks to Google Play
  Services/SafetyNet directly and needs no reCAPTCHA UI at all. This is the
  recommended path for production.

---

## 5. Daily Test Unlock Logic (server-authoritative)

**Rule:** Test 1 is always unlocked. Test *N* (N > 1) unlocks only once
Test *N-1* has reached `COMPLETED` or `TIME_EXPIRED`.

This is enforced in exactly one place —
`api/src/modules/progress/progress.service.ts` — and checked on every
`POST /tests/:testId/start` call before an attempt is created:

```ts
export function isTestUnlocked(testNumber: number, progress: UserDailyProgress) {
  if (testNumber <= 1) return true;
  return progress.currentUnlockedTest >= testNumber;
}
```

The mobile app also renders locked/unlocked state (for UX), but that is
purely cosmetic — a request to start a locked test is rejected with
`403 Forbidden` regardless of what the client believes.

`markTestCompleted()` (same file) is the only function that ever advances
`currentUnlockedTest`, and it's idempotent: completing the same test twice
(e.g. a retried request) does not double-advance progress.

---

## 6. Timer Logic (server-authoritative)

The 60-minute timer is **not** a countdown the client owns. When a test
starts, the API stamps:

```
startedAt = now (server time)
expiresAt = startedAt + 60 minutes
```

and returns both to the client. The mobile `TimerStore` stores only
`expiresAt`; the `useTimer` hook recomputes `remainingMs = expiresAt - Date.now()`
every second. Close the app, reopen it an hour later — the timer reflects
reality instead of resetting.

Two endpoints finalize an attempt:

- `POST /attempts/:id/submit` — user-initiated. If `expiresAt` has already
  passed by the time this arrives, the API treats it as an expiry, not a
  manual submit (protects against a client racing the clock).
- `POST /attempts/:id/expire` — timer-initiated. The API **re-checks**
  `expiresAt` against server time and rejects the call with `403` if the
  attempt genuinely has not expired yet. A client cannot force an early
  expiry.

`GET /attempts/:id` also self-heals: if it finds an `IN_PROGRESS` attempt
whose `expiresAt` has already passed (e.g. the user reopened the app two
days later), it finalizes the attempt on the spot before returning it.

---

## 7. Score Calculation

```
score      = (correct × 1) − (wrong × 0.25)
accuracy % = correct / (correct + wrong) × 100
```

Computed entirely server-side in
`api/src/modules/attempts/attempts.service.ts` → `finalizeAttempt()`, which
loads the user's submitted answers, loads `correctOptionId` for each
question directly from Firestore (never trusting anything the client sent
about correctness), tallies correct/wrong/unanswered, and writes the result
— all inside the same function that also unlocks the next test and updates
the user's running totals. This is the one and only place a score is ever
produced.

---

## 8. Cron Import Flow

Each day's content is 10 JSON files (`test-1.json` … `test-10.json`), each
with exactly 100 bilingual MCQs:

```
cron/data/2026-09-02/test-1.json … test-10.json
```

`cron/src/importer.ts`:

1. Loads and **Zod-validates all 10 files before writing anything** —
   exactly 100 questions per test, exactly 4 options per question, unique
   option ids, and a `correctOptionId` that actually matches one of them.
2. Creates the day's batch as `DRAFT`.
3. Writes each test, its questions (into the top-level `questions`
   collection), and the test→question mapping, batched in chunks under
   Firestore's 500-write-per-batch limit.
4. Publishes the batch as `ACTIVE` only once everything above succeeds —
   students never see a half-imported day.
5. **Idempotent:** if a day's batch is already `ACTIVE`, re-running the
   import is a no-op (`SKIPPED_EXISTING`). A `DRAFT` batch can be
   overwritten by setting `IMPORT_MODE=update`. An `ACTIVE` batch is never
   silently replaced.

A ready-to-use sample dataset (10 tests × 100 questions, English + Marathi)
ships in `cron/data/2026-09-02/` so you can run the importer immediately.

---

## 9. API Reference

All responses follow:

```json
// success
{ "success": true, "data": { ... }, "message": "..." }
// error
{ "success": false, "message": "...", "errors": [ ... ] }
```

All routes below (except `/health`) require `Authorization: Bearer <Firebase ID token>`.

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/v1/users/profile` | Create/update profile (signup step 3) |
| GET  | `/api/v1/users/me` | Get current profile |
| GET  | `/api/v1/days` | List available days with per-user progress |
| GET  | `/api/v1/days/:dayId` | Day detail |
| GET  | `/api/v1/days/:dayId/tests` | 10 tests with locked/unlocked/completed state |
| GET  | `/api/v1/days/:dayId/tests/:testId` | Test metadata + masked question preview |
| POST | `/api/v1/tests/:testId/start` | Body `{ dayId }`. Validates unlock, starts/resumes attempt |
| POST | `/api/v1/attempts/:id/answers` | Save/update one answer |
| GET  | `/api/v1/attempts/:id` | Current attempt state (for reopen) |
| POST | `/api/v1/attempts/:id/submit` | Manual submit → score, unlock next test |
| POST | `/api/v1/attempts/:id/expire` | Timer-driven finalize (server re-validates expiry) |
| GET  | `/api/v1/attempts/:id/result` | Result summary |
| GET  | `/api/v1/attempts/:id/review` | Full review with correct answers + explanations (post-completion only) |
| GET  | `/api/v1/history?page&limit&sort&dateFrom&dateTo` | Paginated completed-test history |
| GET  | `/api/v1/history/:attemptId` | Historical result detail |

---

## 10. Firebase Project Setup

1. **Create a Firebase project** at console.firebase.google.com.
2. **Enable Phone Authentication:** Authentication → Sign-in method → Phone.
   Add test phone numbers for development if you don't want to burn real SMS.
3. **Android:** add an Android app, download `google-services.json`, note
   the SHA-1 (needed for Phone Auth's Play Integrity check in production).
4. **iOS:** add an iOS app, download `GoogleService-Info.plist`.
5. **Create Firestore database** in production mode, pick a region close to
   your users.
6. **Create a service account** for the API/cron: Project Settings →
   Service Accounts → Generate new private key. This gives you
   `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
   for `api/.env` and `cron/.env`.
7. **Deploy Firestore rules:**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase deploy --only firestore:rules --project <your-project-id>
   ```
   (point the Firebase CLI at `firebase/firestore.rules`, e.g. via a root
   `firebase.json` with `"firestore": { "rules": "firebase/firestore.rules" }`).
8. **Local environment:** copy every `.env.example` to `.env` in `mobile/`,
   `api/`, and `cron/`, and fill in the values from steps 3/4/6.

---

## 11. Installation & Running

### Shared types
```bash
cd shared && npm install   # no build step needed — consumed as TS source via path aliases
```

### API
```bash
cd api
cp .env.example .env        # fill in Firebase Admin credentials
npm install
npm run dev                 # http://localhost:5000
```

### Cron — manual import
```bash
cd cron
cp .env.example .env
npm install
npm run import -- --date=2026-09-02
```

### Cron — scheduled import
```bash
cd cron
npm run schedule            # runs continuously, importing "today" on CRON_SCHEDULE
```

### Mobile
```bash
cd mobile
cp .env.example .env        # EXPO_PUBLIC_API_URL + Firebase web config
npm install
npm start                   # then press a (Android) / i (iOS) / w (web)
```

Point `EXPO_PUBLIC_API_URL` at your running API (e.g.
`http://localhost:5000/api/v1`, or your machine's LAN IP for a physical
device).

---

## 12. Future Improvements

The architecture leaves room for, but does not implement, the following —
they're all additive and don't require reshaping what exists:

- Leaderboards & daily streaks
- Badges / gamification
- Subject-wise analytics & weak-topic detection
- AI-generated explanations / personalized tests
- Push notifications (e.g. "Test 3 unlocked — 6 remaining today")
- Structured study plans
- Premium subscription tier
- Admin dashboard for content management (currently JSON + cron only)
- Web application sharing the same API and `shared/` types
