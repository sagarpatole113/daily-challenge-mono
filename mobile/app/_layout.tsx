import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { auth, onAuthStateChanged } from "../src/services/firebase";
import { useAuthStore } from "../src/store/authStore";
import { api } from "../src/services/api";
import { ErrorBoundary } from "../src/components/ErrorBoundary";
import { colors } from "../src/theme/theme";
import type { User } from "@shared/index";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

/**
 * App startup flow (per spec):
 *   App Opens -> Check Firebase Auth State -> User exists? -> Main App
 *                                            -> No user?    -> Login
 * This listener is the single source of truth; it fires once immediately
 * with the persisted session (or null) on cold start, then on every
 * subsequent sign-in/out. The user is never bounced back to Login just
 * because the app restarted.
 */
function useAuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const { firebaseUser, authChecked, setFirebaseUser, setProfile, setAuthChecked } =
    useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const profile = await api.get<User>("/users/me");
          setProfile(profile);
        } catch {
          // No profile yet — signup step 3 (collect name) hasn't happened.
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    const inAuthGroup = segments[0] === "(auth)";
    const atRoot = segments.length === 0;

    // BUGFIX (regression from the previous fix): redirecting whenever the
    // user wasn't inside "(tabs)" also fired while viewing the top-level
    // test/result/review screens (their first segment is "test",
    // "result", "review" — none of which is "(tabs)"), which is why
    // tapping "Start" on a test immediately bounced back to Home. The
    // fix only needs to cover two transitions: cold start landing on the
    // bare root route, and finishing login/signup while still on an
    // (auth) screen. Anywhere else the user navigates while logged in
    // (test, result, review, tabs) should be left alone.
    if (!firebaseUser && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (firebaseUser && (inAuthGroup || atRoot)) {
      router.replace("/(tabs)/home");
    }
  }, [authChecked, firebaseUser, segments]);

  return authChecked;
}

function RootNavigator() {
  const authChecked = useAuthGate();

  if (!authChecked) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="test/[testId]" options={{ gestureEnabled: false }} />
      <Stack.Screen name="result/[attemptId]" />
      <Stack.Screen name="review/[attemptId]" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <RootNavigator />
        </SafeAreaProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
