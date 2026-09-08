import { create } from "zustand";
import type { FirebaseUser } from "../services/firebase";
import type { User } from "@shared/index";

interface AuthState {
  firebaseUser: FirebaseUser | null;
  profile: User | null;
  authChecked: boolean; // becomes true once the initial onAuthStateChanged fires
  isLoggedIn: boolean;

  setFirebaseUser: (u: FirebaseUser | null) => void;
  setProfile: (p: User | null) => void;
  setAuthChecked: (v: boolean) => void;
  reset: () => void;
}

/**
 * Source of truth for "is the user logged in". `authChecked` gates the
 * initial route decision (splash -> login vs splash -> main app) so we
 * never flash a login screen for an already-authenticated user.
 */
export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  profile: null,
  authChecked: false,
  isLoggedIn: false,

  setFirebaseUser: (u) => set({ firebaseUser: u, isLoggedIn: !!u }),
  setProfile: (p) => set({ profile: p }),
  setAuthChecked: (v) => set({ authChecked: v }),
  reset: () => set({ firebaseUser: null, profile: null, isLoggedIn: false }),
}));
