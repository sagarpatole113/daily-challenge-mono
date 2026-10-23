# Contract-level end-to-end harness

Drives the **built** web app in headless Chromium with the **real Firebase JS SDK**, intercepting at the network boundary:

- Firebase Identity Toolkit and token endpoints return fake credentials (a decodable fake JWT).
- The Saatatya API is replaced by `mock_api.py`, a stateful implementation of the contracts documented in `docs/API_CONTRACTS.md` (sequential unlocking, 403 on `/expire` before expiry, 409 on finalised attempts, server-side scoring, hidden answers until completion). It also simulates a 3-second server/browser clock skew.

This proves the web app's behaviour against the contracts read from source. **It is not a test against the real backend**; run the checklist in `docs/VERIFICATION.md` against staging before launch.

## Run

```bash
pip install playwright && playwright install chromium
# build with the harness env, then serve
export NEXT_PUBLIC_SITE_URL=http://localhost:3100 NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1 \
  NEXT_PUBLIC_FIREBASE_API_KEY=fake-key NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=fake.firebaseapp.com \
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=fake-proj NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc
npm run build && npx next start -p 3100 &
python3 e2e/run_e2e.py        # screenshots go to E2E_SHOTS (default /tmp/shots)
```
