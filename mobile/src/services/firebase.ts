import { initializeApp, getApps } from "firebase/app";
import {
  initializeAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updatePassword as firebaseUpdatePassword,
  onAuthStateChanged,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth";
// @ts-expect-error — `getReactNativePersistence` IS present at runtime
// (Metro resolves @firebase/auth's "react-native" export condition to
// dist/rn/index.rn.js, which does export it — verified against the
// installed package). TypeScript's own resolver, however, matches the
// package's top-level "types" condition before it ever reaches the
// nested "react-native" branch, so `tsc` cannot see this export even
// though the bundler will. This is a known gap in how the Firebase JS
// SDK structures its package.json "exports" map, not a mistake here.
// If a future SDK release nests "types" inside each condition branch
// instead of hoisting it to the top, this suppression can be removed.
import { getAuth, getReactNativePersistence } from "@firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

declare const process: {
  env: Record<string, string | undefined>;
};

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// CRITICAL: getReactNativePersistence(AsyncStorage) makes the Firebase auth
// session survive app restarts. This is what makes "stay logged in until
// manual logout" work — Firebase, not any custom session code, owns this.
export const auth = (() => {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // initializeAuth() throws "auth/already-initialized" if this module is
    // re-evaluated while the app is still running (happens during Expo/
    // Metro Fast Refresh). getAuth(app) recovers the existing instance
    // instead of crashing this whole module — which previously broke
    // onAuthStateChanged for the rest of the session and left you stuck
    // on the splash screen.
    return getAuth(app);
  }
})();

export type { FirebaseUser };
export { onAuthStateChanged, signOut };

// ---------------------------------------------------------------------------
// Username + Password auth
// ---------------------------------------------------------------------------
//
// Firebase Authentication has no native concept of a bare "username" (only
// email/password, phone, or federated providers). Rather than build a
// custom auth server, we keep Firebase Authentication as the single source
// of truth (as required — persistent sessions, ID-token verification on the
// API, no custom session code) by mapping each username to a deterministic,
// never-emailed synthetic address:
//
//     username "rahul_k" -> "rahul_k@mpscdaily.local"
//
// Firebase Auth's own email-uniqueness constraint then transparently
// enforces username uniqueness — two people can never register the same
// username, because Firebase will reject the second `createUserWithEmail-
// AndPassword` call with `auth/email-already-in-use`.
//
// CAVEAT: because this address is never real mail, Firebase's built-in
// "forgot password" email flow (`sendPasswordResetEmail`) will NOT work —
// there's no inbox to deliver to. See README "Username/Password Auth —
// Forgot Password" for the tradeoff and options.

const AUTH_EMAIL_DOMAIN = process.env.EXPO_PUBLIC_AUTH_EMAIL_DOMAIN || "mpscdaily.local";

const USERNAME_REGEX = /^[a-z][a-z0-9_]{2,19}$/;

export function isValidUsername(raw: string): boolean {
  return USERNAME_REGEX.test(raw.trim().toLowerCase());
}

function usernameToEmail(username: string): string {
  return `${username.trim().toLowerCase()}@${AUTH_EMAIL_DOMAIN}`;
}

export class UsernameAuthError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}

function friendlyAuthError(err: any): UsernameAuthError {
  const code = err?.code || "unknown";
  const messages: Record<string, string> = {
    "auth/email-already-in-use": "That username is already taken.",
    "auth/invalid-email": "That username isn't valid.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/user-not-found": "No account found with that username.",
    "auth/wrong-password": "Incorrect password.",
    "auth/invalid-credential": "Incorrect username or password.",
    "auth/too-many-requests": "Too many attempts. Try again later.",
  };
  return new UsernameAuthError(messages[code] || "Something went wrong. Try again.", code);
}

/** Signup: creates the Firebase account. Caller still needs to POST
 * /users/profile with { username, name } afterwards to create the
 * Firestore profile — see app/(auth)/signup.tsx. */
export async function signUpWithUsername(username: string, password: string) {
  if (!isValidUsername(username)) {
    throw new UsernameAuthError(
      "Username must be 3-20 characters, start with a letter, and contain only lowercase letters, numbers, and underscores.",
      "invalid-username"
    );
  }
  try {
    const result = await createUserWithEmailAndPassword(auth, usernameToEmail(username), password);
    return result.user;
  } catch (err) {
    throw friendlyAuthError(err);
  }
}

/** Login: existing account, username + password. */
export async function signInWithUsername(username: string, password: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, usernameToEmail(username), password);
    return result.user;
  } catch (err) {
    throw friendlyAuthError(err);
  }
}

/** Change password while signed in (Profile screen). Does NOT need the old
 * password re-entered here because Firebase requires a recent sign-in for
 * this call to succeed — if the session is stale it throws
 * `auth/requires-recent-login`, which the UI should handle by prompting a
 * re-login. */
export async function changePassword(newPassword: string) {
  const user = auth.currentUser;
  if (!user) throw new UsernameAuthError("Not signed in.", "auth/not-signed-in");
  try {
    await firebaseUpdatePassword(user, newPassword);
  } catch (err) {
    throw friendlyAuthError(err);
  }
}

export async function getIdToken(forceRefresh = false): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken(forceRefresh);
}
