import { NextFunction, Request, Response } from "express";
import { firebaseAuth } from "../config/firebase";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

export interface AuthenticatedUser {
  uid: string;
  /**
   * The synthetic email Firebase Auth has on file for this account
   * (see mobile/src/services/firebase.ts — built as `${username}@<domain>`
   * since this project uses username+password auth, not real email).
   * Prefer the `username` field stored in the user's Firestore profile
   * for anything user-facing; this is kept only for debugging/audit.
   */
  email?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Verifies the Firebase ID token sent as `Authorization: Bearer <token>`.
 * Attaches { uid, phoneNumber } to req.user. Never trusts client-supplied
 * user IDs for anything sensitive — always use req.user.uid.
 */
export const requireAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      throw AppError.unauthorized("Missing or malformed Authorization header");
    }

    const idToken = header.substring("Bearer ".length).trim();
    if (!idToken) {
      throw AppError.unauthorized("Missing Firebase ID token");
    }

    try {
      const decoded = await firebaseAuth.verifyIdToken(idToken);
      req.user = {
        uid: decoded.uid,
        email: decoded.email,
      };
      next();
    } catch (err) {
      // Never log the raw token — it's a bearer credential. Log the
      // *reason* verification failed instead; that's what actually tells
      // you what's wrong. Common causes for this specific stack:
      //   - "incorrect \"aud\" (audience) claim" -> FIREBASE_PROJECT_ID in
      //     api/.env does not match EXPO_PUBLIC_FIREBASE_PROJECT_ID in
      //     mobile/.env. The mobile app signed the token for a different
      //     Firebase project than this Admin SDK is initialized with.
      //     This is the #1 cause of verifyIdToken always failing.
      //   - "Firebase ID token has expired" -> server clock is skewed, or
      //     a stale token is being reused instead of a fresh one.
      //   - "Decoding Firebase ID token failed" / auth/argument-error ->
      //     the client sent something that isn't a real ID token (e.g. a
      //     custom token, or undefined/empty string serialized as text).
      const reason = err instanceof Error ? err.message : String(err);
      console.error("[requireAuth] Token verification failed:", reason);
      throw AppError.unauthorized("Invalid or expired authentication token");
    }
  }
);