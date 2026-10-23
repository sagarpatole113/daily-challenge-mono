import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { env, isFirebaseConfigured } from "@/lib/env";

/**
 * Browser-only Firebase Auth. Firestore, Storage and every other Firebase
 * product are intentionally NOT imported: the web app talks to the existing
 * API for all data, never to Firestore directly.
 *
 * Session persistence is Firebase's own default for browsers (IndexedDB),
 * which is what keeps a student signed in across visits. No token is ever
 * stored by this app.
 */
let cachedApp: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null;
  if (!isFirebaseConfigured()) return null;
  if (cachedApp) return cachedApp;
  cachedApp = getApps().length ? getApp() : initializeApp(env.firebase);
  return cachedApp;
}

export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  return app ? getAuth(app) : null;
}
