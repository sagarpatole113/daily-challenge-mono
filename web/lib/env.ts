/**
 * Browser-safe configuration. Every value here is exposed to the client, so
 * nothing secret may ever be added. NEXT_PUBLIC_* variables must be read with
 * the literal `process.env.NEXT_PUBLIC_X` form so Next can inline them.
 */
const isProd = process.env.NODE_ENV === "production";

function trimSlash(v: string): string {
  return v.replace(/\/+$/, "");
}

export const env = {
  siteUrl: trimSlash(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  apiUrl: trimSlash(
    process.env.NEXT_PUBLIC_API_URL || (isProd ? "" : "http://localhost:5000/api/v1"),
  ),
  authEmailDomain: (process.env.NEXT_PUBLIC_AUTH_EMAIL_DOMAIN || "mpscdaily.local").trim(),
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  },
} as const;

export function isFirebaseConfigured(): boolean {
  const f = env.firebase;
  return Boolean(f.apiKey && f.authDomain && f.projectId && f.appId);
}

/** The API's /health route lives at the server root, outside /api/v1. */
export function apiOrigin(apiUrl: string = env.apiUrl): string {
  return apiUrl.replace(/\/api\/v\d+$/, "");
}
