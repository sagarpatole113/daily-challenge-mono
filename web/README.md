# Saatatya web (सातत्य)

SEO-first Next.js app for the existing Saatatya daily mock-test platform: a public MPSC Group C guide site plus the authenticated student experience (dashboard, timed tests, results, review). It is an **independent client** of the existing API and Firebase project. Nothing in `api/`, `cron/`, `shared/`, `firebase/` or `mobile/` was changed.

Stack: Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind CSS 4, Firebase Auth (browser), TanStack Query, React Hook Form + Zod, Lucide.

## Quick start

```bash
cd web
cp .env.example .env.local      # fill in the values below
npm install
npm run dev                     # http://localhost:3000
```

Requires Node 20.9+. Run from inside the monorepo: `types/shared.ts` re-exports types from `../shared/src` (type-only, erased at build).

## Configuration

| Variable | What |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Public origin, no trailing slash. Drives canonicals, sitemap, Open Graph, JSON-LD. **Set the real domain in production.** |
| `NEXT_PUBLIC_API_URL` | Existing API base **including** `/api/v1`. No default in production builds. |
| `NEXT_PUBLIC_FIREBASE_*` | Web-app config from Firebase console (Project settings, Your apps, Web). Use the **same project** as mobile and the API. |
| `NEXT_PUBLIC_AUTH_EMAIL_DOMAIN` | Must equal the mobile app's `EXPO_PUBLIC_AUTH_EMAIL_DOMAIN` (default `mpscdaily.local`), or existing accounts cannot sign in. |

Only browser-safe values belong here. Never add Admin SDK keys.

## What must already be true in your existing setup

These are the only things outside `web/` that deployment depends on. This repo does not change them.

1. **CORS.** The API uses `cors({ origin: env.CORS_ORIGIN || "*" })`. The web origin must be allowed, either `*` or `CORS_ORIGIN` set to the web domain (it accepts a single origin string, so if mobile/web/staging all need access, use `*` or extend the API separately). Requests use `credentials: "omit"` and a bearer token only.
2. **Firebase Authentication.** Email/Password provider must be enabled (it already is for mobile). Email/password sign-in does not require authorised domains, but add your web domain under Authentication, Settings, Authorised domains in case you later add redirect-based providers.
3. **Firebase Web API key.** If the key has application restrictions, add an HTTP-referrer entry for the web domain (and `localhost` for development), or browser sign-in will fail. Keep the key restricted to Identity Toolkit.
4. **Do not weaken anything.** No custom tokens, no Firestore access from the browser, no new endpoints.

## Scripts

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm test            # vitest (63+ unit tests)
npm run build       # production build
npm run verify      # all of the above
```

## Build and deploy

```bash
npm run build && npm start
```

- **Vercel/Netlify:** set the Root Directory to `web`. Keep "include source files outside the root directory" enabled so the type-only import of `../shared` resolves during type-checking. Add the env vars above, then attach the production domain and set `NEXT_PUBLIC_SITE_URL` to it (rebuild after changing it, since it is inlined at build time).
- **Docker/Node host:** `npm ci && npm run build && npm start` from a checkout that includes `shared/`.
- Public pages are statically generated; `/dashboard/*` is client-rendered behind an auth guard and served with `Cache-Control: private, no-store`.

## Verify SEO after deploy

```bash
curl -s https://YOUR-DOMAIN/robots.txt          # Disallow: /dashboard, Sitemap link
curl -s https://YOUR-DOMAIN/sitemap.xml         # 25 public URLs, no /dashboard /login /signup
curl -s https://YOUR-DOMAIN/mpsc-group-c/exam-pattern | grep -E '<title>|canonical|application/ld\+json'
```

Then submit the sitemap in Google Search Console, inspect a few URLs, and check Core Web Vitals in PageSpeed Insights. `/login` and `/signup` carry `noindex, follow`; `/dashboard` carries `noindex, nofollow`.

## Structure

```
app/(site)/     public pages + shared header/footer (static, SEO)
app/(app)/      login, signup, dashboard (Providers: auth + query cache)
components/     layout, marketing, dashboard, test, result, auth, ui
lib/            api client, endpoints, auth, dates (IST), attempt logic, answer sync, seo
hooks/          queries, countdown clock, language preference
content/        typed editorial content (guides, subjects, FAQs)
docs/           audit, API contracts, keyword map, content review, verification
e2e/            contract-level browser harness (see e2e/README.md)
```

## How the important behaviours work

- **Auth:** same username-to-synthetic-email mapping as mobile. The Firebase ID token is fetched per request (`getIdToken`, auto-refreshed); one forced refresh and retry on 401, then sign-out. Tokens are never stored by the app. The whole query cache is cleared on sign-out/account change and every key is uid-namespaced.
- **Timer:** countdown = server `expiresAt` minus (browser clock + offset from `GET /health`). Refresh/navigation never resets it. At zero the app calls `/expire`, retrying while the server answers 403 (clock skew).
- **Answers:** optimistic UI; each change is queued and sent to `POST /attempts/:id/answers` with backoff, mirrored to `sessionStorage` so a reload does not lose unsent answers. Submit refuses to silently drop unsent answers.
- **Progression:** the UI shows the server's `locked/unlocked/completed/inProgress` flags and never computes unlocks. It also re-checks state before `start` because the API itself would create a new attempt for an already-completed test (see `docs/API_CONTRACTS.md`).
- **Scoring:** never computed in the browser; result/review come from the API.

## Known limitations

- Verified against a contract-level harness, **not** the production backend or a real Firebase project (see `docs/VERIFICATION.md`).
- Exam-structure statements on public pages are from secondary sources and need an owner check against official notices (`docs/CONTENT_REVIEW.md`).
- No password reset (accounts have no real email; same as mobile).
- Streak and the 14-day strip use `GET /days`, which returns at most 30 days.
- No per-test score history chart: the API has no attempt-listing endpoint.
- `npm audit` reports high advisories in Firestore's gRPC client pulled in transitively by the `firebase` package. The app imports only `firebase/app` and `firebase/auth`; no Firestore/gRPC code is in the client bundle.
- Public pages have one shared social image (`public/og.png`), not per-page images.
