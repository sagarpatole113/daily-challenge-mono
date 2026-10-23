# What was verified, and what was not

## Automated (run `npm run verify`)

- TypeScript strict: clean. ESLint (Next core-web-vitals + TypeScript rules incl. React 19 hook rules): clean.
- Unit tests: API client (bearer header, 401 refresh-and-retry, 403 passthrough, timeout, network, bad envelope), IST day ids and countdown maths with clock offset, streak rules, answer state machine, answer sync queue (coalescing, retry, 409, reload recovery, StrictMode remount), expiry retry on 403, redirect safety, username mapping, form schemas, SEO helpers, content-quality guards, and a drift test against `shared` `EXAM_CONFIG`.
- Production build succeeds; public routes prerender statically; unknown routes and unknown subjects return 404.

## Rendered-HTML audit (all 25 routes)

Unique title and description, canonical equals the page URL, exactly one h1, Open Graph and Twitter tags with image, JSON-LD parses (Organization, WebSite, BreadcrumbList, Article), primary content present without JavaScript, no public page is noindex, and `/login`, `/signup`, `/dashboard` are noindex.

## Browser end-to-end (headless Chromium, real Firebase SDK, mocked network)

51 checks passed, including: signed-out redirect with `next`; login; every API call carried the Firebase token; locked tests have no start link and a direct URL shows a locked screen without calling `start`; completed tests redirect to results with no second `start`; countdown from server expiry and **not reset on reload**; saved answers restored after reload; payloads match the API schema (including clear and mark); submit dialog counts; result and review match server scoring; expiry with a 3 s clock skew retried through 403 to a TIME_EXPIRED result; offline answer retry and the unsaved-answers submit guard; no horizontal scroll at 390 px on 12 pages; mobile menu and question-navigator sheet; touch selection; logout re-guards the dashboard; no React, hydration or page errors.

## NOT verified (needs your environment)

- Real Firebase sign-in/sign-up with existing accounts (needs your project config, API-key referrer rules).
- Real API behaviour and CORS for the deployed web origin.
- Real-device testing on iOS Safari and Android Chrome; screen-reader pass (NVDA/VoiceOver); automated axe audit; Lighthouse/CWV on the deployed site.
- Official-source confirmation of exam facts (`docs/CONTENT_REVIEW.md`).

## Pre-launch checklist

1. Create an account on the web with a brand-new username, then log in on mobile with it (and the reverse).
2. Complete tests 1 to 3 on web; confirm unlocks and results match mobile.
3. Start a test, refresh, close the tab, return: answers and timer intact. Let a test expire while away.
4. Toggle airplane mode mid-test; confirm answers sync on reconnect.
5. Confirm CORS from the production origin and that `Authorization` preflight succeeds.
6. Check the Firebase API key referrer restriction includes the web domain.
7. Run Lighthouse and an axe scan on `/`, a guide, `/login`, `/dashboard`.
