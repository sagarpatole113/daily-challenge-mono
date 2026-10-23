import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  type User as FirebaseUser,
} from "firebase/auth";
import { env } from "@/lib/env";
import { getFirebaseAuth } from "@/lib/firebase";

/**
 * Username + password auth, byte-for-byte compatible with the mobile app
 * (mobile/src/services/firebase.ts). Firebase has no "username" concept, so
 * each username maps to a deterministic synthetic email:
 *
 *     rahul_k  ->  rahul_k@<NEXT_PUBLIC_AUTH_EMAIL_DOMAIN>
 *
 * The domain MUST equal the mobile app's EXPO_PUBLIC_AUTH_EMAIL_DOMAIN or
 * existing accounts can't sign in. Nothing is ever emailed to this address,
 * so "forgot password" by email is not possible (same limitation as mobile).
 */
export const USERNAME_REGEX = /^[a-z][a-z0-9_]{2,19}$/;

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidUsername(raw: string): boolean {
  return USERNAME_REGEX.test(normalizeUsername(raw));
}

export function usernameToEmail(username: string, domain: string = env.authEmailDomain): string {
  return `${normalizeUsername(username)}@${domain}`;
}

export class AuthError extends Error {
  readonly code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

const FRIENDLY: Record<string, string> = {
  "auth/email-already-in-use": "That username is already taken.",
  "auth/invalid-email": "That username isn't valid.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/user-not-found": "No account found with that username.",
  "auth/wrong-password": "Incorrect password.",
  "auth/invalid-credential": "Incorrect username or password.",
  "auth/too-many-requests": "Too many attempts. Try again in a few minutes.",
  "auth/network-request-failed": "Can't reach the sign-in service. Check your connection.",
  "auth/requires-recent-login": "For security, please log in again before changing your password.",
  "auth/api-key-not-valid.-please-pass-a-valid-api-key.":
    "Sign-in isn't configured correctly for this website yet.",
  "auth/operation-not-allowed": "Username sign-in isn't enabled for this project.",
  "auth/unauthorized-domain": "This website's domain isn't authorised for sign-in yet.",
};

export function friendlyAuthError(err: unknown): AuthError {
  const code = (err as { code?: string } | null)?.code ?? "unknown";
  return new AuthError(FRIENDLY[code] ?? "Something went wrong. Try again.", code);
}

function requireAuth() {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new AuthError("Sign-in isn't configured for this website yet.", "app/not-configured");
  }
  return auth;
}

export async function signInWithUsername(username: string, password: string): Promise<FirebaseUser> {
  const auth = requireAuth();
  try {
    return (await signInWithEmailAndPassword(auth, usernameToEmail(username), password)).user;
  } catch (e) {
    throw friendlyAuthError(e);
  }
}

/** Creates the Firebase account only. Caller must then POST /users/profile. */
export async function signUpWithUsername(username: string, password: string): Promise<FirebaseUser> {
  if (!isValidUsername(username)) {
    throw new AuthError(
      "Username must be 3-20 characters, start with a letter, and use only lowercase letters, numbers and underscores.",
      "invalid-username",
    );
  }
  const auth = requireAuth();
  try {
    return (await createUserWithEmailAndPassword(auth, usernameToEmail(username), password)).user;
  } catch (e) {
    throw friendlyAuthError(e);
  }
}

export async function signOutUser(): Promise<void> {
  const auth = getFirebaseAuth();
  if (auth) await signOut(auth);
}

export async function changePassword(newPassword: string): Promise<void> {
  const user = getFirebaseAuth()?.currentUser;
  if (!user) throw new AuthError("Not signed in.", "auth/not-signed-in");
  try {
    await updatePassword(user, newPassword);
  } catch (e) {
    throw friendlyAuthError(e);
  }
}

/** Fresh-or-cached Firebase ID token. The SDK refreshes it automatically near expiry. */
export async function getIdToken(forceRefresh = false): Promise<string | null> {
  const user = getFirebaseAuth()?.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken(forceRefresh);
  } catch {
    return null;
  }
}
