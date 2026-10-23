# Repository audit and implementation plan

Audit performed against the uploaded `daily-challenge-mono-main` before any web code was written. Everything below was read from source, not from the README.

## Where the README is out of date

| README says | Source shows | Consequence for web |
|---|---|---|
| Phone OTP authentication | **Username + password.** `mobile/src/services/firebase.ts` maps a username to the synthetic email `<username>@<EXPO_PUBLIC_AUTH_EMAIL_DOMAIN>` (default `mpscdaily.local`) and calls `createUserWithEmailAndPassword` / `signInWithEmailAndPassword`. | The web app reproduces exactly this mapping with the Firebase JS SDK, so existing accounts sign in unchanged. No phone/OTP code exists or is needed. |
| `/history` endpoints | **Not implemented.** `api/src/routes` mounts only `users`, `daily-tests`, `attempts`. | History is built from `GET /days` and `GET /days/:dayId/tests`. |

## Architecture (as found)

- `api/`: Express + Zod + Firebase Admin. Auth middleware verifies `Authorization: Bearer <Firebase ID token>` and sets `req.uid`. Response envelope `{ success, data, message }` or `{ success: false, message, errors? }`. CORS: `cors({ origin: env.CORS_ORIGIN || "*", credentials: true })`. `GET /health` lives at the server root (outside `/api/v1`).
- `mobile/`: Expo app. Axios client with token interceptor; Zustand attempt store; offline answer queue in AsyncStorage.
- `cron/`: daily importer. Question JSON in `cron/data/` contains correct answers; **nothing from it is used or copied into the web app.**
- `shared/`: contract types and `EXAM_CONFIG`. The web app re-exports **types only** (erased at compile time) and mirrors the constants with a drift test.
- Firestore rules deny direct client access to protected data; the web app never touches Firestore.

## Mobile vs browser differences found

1. **Resume bug in mobile:** `app/test/[testId].tsx` calls `loadAttempt` without `initialAnswers`, so after a resume the mobile UI does not show previously saved answers. The web app hydrates from `GET /attempts/:id`.
2. **Offline queue storage:** AsyncStorage on mobile; `sessionStorage` on web (option ids only).
3. **Auth persistence:** React Native persistence on mobile; Firebase's default browser persistence (IndexedDB) on web. The app never stores tokens itself.
4. **Accuracy definition:** mobile's profile divides by `totalQuestionsAttempted` (which, per `users.service.ts`, counts all questions of completed tests, answered or not). The server's per-attempt accuracy is correct ÷ (correct + wrong). Web uses the server's definition everywhere.
5. **"Today":** mobile uses device-local date; web uses `Asia/Kolkata`, matching the server's recommended zone.

## Environment variables

Web (all browser-safe, see `.env.example`): `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_FIREBASE_{API_KEY,AUTH_DOMAIN,PROJECT_ID,STORAGE_BUCKET,MESSAGING_SENDER_ID,APP_ID}`, `NEXT_PUBLIC_AUTH_EMAIL_DOMAIN`.

Existing (unchanged): API needs `FIREBASE_*` admin credentials, `CORS_ORIGIN`, `PORT`; mobile uses `EXPO_PUBLIC_*` equivalents.

## Route map

Public (static, indexable): `/`, `/mpsc-group-c`, `/syllabus`, `/exam-pattern`, `/previous-year-questions`, `/mock-tests`, `/daily-mock-test`, `/subjects`, `/subjects/[subject]` (9 guides), `/study-resources`, `/about`, `/contact`, `/privacy-policy`, `/terms`.

Private (noindex, not in sitemap): `/login`, `/signup` (noindex, follow), `/dashboard` and children (noindex, disallowed in robots, `Cache-Control: private, no-store`).

## Plan that was followed

Audit, then API contracts, keyword map, scaffold, design system, public site, browser auth, API client + query layer, dashboard, test runner, result/review/profile, technical SEO, accessibility, tests, build, end-to-end verification.
