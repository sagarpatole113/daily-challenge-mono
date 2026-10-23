"use client";

import { useEffect, useMemo, useRef, useState, createContext, useContext, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { ApiError, configureApiClient } from "@/lib/api";
import { getIdToken, signOutUser } from "@/lib/auth";
import { isFirebaseConfigured } from "@/lib/env";
import { getFirebaseAuth } from "@/lib/firebase";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "unconfigured";

interface AuthContextValue {
  status: AuthStatus;
  user: FirebaseUser | null;
  uid: string | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <Providers>");
  return ctx;
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: true,
        // Only retry transient failures. 4xx (locked test, not found, auth)
        // will never succeed by repeating the same request.
        retry: (failureCount, error) =>
          error instanceof ApiError && error.isRetryable && failureCount < 2,
      },
      mutations: { retry: false },
    },
  });
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(makeQueryClient);
  const [status, setStatus] = useState<AuthStatus>(() => (isFirebaseConfigured() ? "loading" : "unconfigured"));
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const lastUid = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    configureApiClient({
      getToken: getIdToken,
      // A 401 after a forced token refresh means the session is really gone.
      onUnauthorized: () => {
        void signOutUser();
      },
    });

    const auth = getFirebaseAuth();
    if (!auth) return; // "unconfigured" is derived from env at init
    return onAuthStateChanged(auth, (next) => {
      const nextUid = next?.uid ?? null;
      // Private data must never survive an account change or sign-out.
      if (lastUid.current !== undefined && lastUid.current !== nextUid) {
        queryClient.clear();
      }
      lastUid.current = nextUid;
      setUser(next);
      setStatus(next ? "authenticated" : "unauthenticated");
    });
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      uid: user?.uid ?? null,
      logout: async () => {
        await signOutUser();
        queryClient.clear();
      },
    }),
    [status, user, queryClient],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </QueryClientProvider>
  );
}
