import { View, Text, StyleSheet, Pressable, Alert, RefreshControl, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../src/store/authStore";
import { auth, signOut, isValidUsername } from "../../src/services/firebase";
import { api, ApiClientError } from "../../src/services/api";
import { colors, radius, spacing, shadow } from "../../src/theme/theme";
import type { User } from "@shared/index";

export default function ProfileScreen() {
  const storeProfile = useAuthStore((s) => s.profile);
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const setProfile = useAuthStore((s) => s.setProfile);

  // BUGFIX: previously this screen only ever read `profile` from the
  // zustand store, which is populated exactly once by app/_layout.tsx
  // right after login. If that one fetch failed (slow network on cold
  // start, backend cold-starting on Render's free tier, a profile that
  // never got created because the signup flow's second step failed) the
  // screen was permanently stuck showing the "?" placeholder with no way
  // to recover short of a full app restart. Using react-query here gives
  // pull-to-refresh and a real retry button, and keeps the shared store
  // in sync so other screens see the same data.
  const {
    data: profile,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      try {
        const p = await api.get<User>("/users/me");
        setProfile(p);
        return p;
      } catch (err) {
        // BUGFIX (the real fix, not just a friendlier message): signup
        // creates the account in two separate calls — the Firebase Auth
        // account first, then a separate POST /users/profile that writes
        // the Firestore doc. If the app died or the network dropped
        // between those two calls, the user ends up with a working
        // Firebase login (so they can sign in and even take tests, since
        // attempts don't require a users/{uid} doc to exist) but /users/me
        // 404s forever. Just retrying that same GET can never fix this —
        // there is nothing to fetch. Since we still have the logged-in
        // Firebase user here, recover the same username signup encoded
        // into their auth email and recreate the missing profile through
        // the same endpoint signup uses.
        if (err instanceof ApiClientError && err.status === 404 && firebaseUser?.email) {
          const derivedUsername = firebaseUser.email.split("@")[0];
          if (isValidUsername(derivedUsername)) {
            const created = await api.post<User>("/users/profile", {
              name: derivedUsername,
              username: derivedUsername,
            });
            setProfile(created);
            return created;
          }
        }
        throw err;
      }
    },
    initialData: storeProfile ?? undefined,
    // BUGFIX: `initialData` alone tells react-query "here's some data",
    // but without a timestamp it's assumed to have just been fetched.
    // Combined with the app's global `staleTime: 30_000`, that meant a
    // profile cached at login (which could be hours old, and doesn't yet
    // reflect any tests completed since) was treated as "fresh" and this
    // screen could go up to 30s — or skip refetching on this mount
    // entirely if focused again quickly — without pulling real numbers.
    // Marking it as already-stale (updated at time 0) forces an
    // immediate background refetch every time this screen mounts/focuses,
    // while still showing the cached data instantly instead of a spinner.
    initialDataUpdatedAt: 0,
    retry: 1,
  });

  function handleLogout() {
    Alert.alert("Log out?", "You'll need to sign in again to continue.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => signOut(auth), // triggers onAuthStateChanged -> redirect to Login
      },
    ]);
  }

  const avgScore =
    profile && profile.totalTestsCompleted > 0
      ? (profile.totalScore / profile.totalTestsCompleted).toFixed(1)
      : "0.0";

  const accuracy =
    profile && profile.totalQuestionsAttempted > 0
      ? ((profile.totalCorrectAnswers / profile.totalQuestionsAttempted) * 100).toFixed(1)
      : "0.0";

  if (!profile && (isLoading || isFetching)) {
    return (
      <SafeAreaView style={[styles.safe, styles.centered]} edges={["top"]}>
        <Text style={styles.loadingText}>Loading profile…</Text>
      </SafeAreaView>
    );
  }

  if (!profile) {
    const message =
      error instanceof ApiClientError && error.status === 404
        ? "We couldn't recreate a profile for this account automatically. Please log out and sign up again with this username to finish setting it up."
        : error instanceof ApiClientError
          ? error.message
          : "Something went wrong loading your profile.";
    return (
      <SafeAreaView style={[styles.safe, styles.centered]} edges={["top"]}>
        <Text style={styles.errorText}>{message}</Text>
        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </Pressable>
        <Pressable onPress={handleLogout} style={{ marginTop: 20 }}>
          <Text style={styles.logoutLink}>Log out</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile.name?.[0]?.toUpperCase() || "?"}</Text>
          </View>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.phone}>@{profile.username}</Text>
        </View>

        <Text style={styles.sectionHeading}>Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard label="Tests Completed" value={String(profile.totalTestsCompleted ?? 0)} />
          <StatCard label="Average Score" value={avgScore} />
          <StatCard label="Best Score" value={String(profile.bestScore ?? 0)} />
          <StatCard label="Questions Attempted" value={String(profile.totalQuestionsAttempted ?? 0)} />
          <StatCard label="Overall Accuracy" value={`${accuracy}%`} wide />
        </View>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <View style={[styles.statCard, wide && { flexBasis: "100%" }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  centered: { alignItems: "center", justifyContent: "center", padding: spacing.xxl },
  loadingText: { color: colors.textDim, fontSize: 14 },
  errorText: { color: colors.textDim, fontSize: 14, textAlign: "center", marginBottom: spacing.xl, lineHeight: 20 },
  retryButton: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: spacing.xxl, paddingVertical: spacing.md, ...shadow.button },
  retryButtonText: { color: colors.onPrimary, fontWeight: "800", fontSize: 14 },
  logoutLink: { color: colors.danger, fontWeight: "700", fontSize: 13 },
  header: { alignItems: "center", marginTop: spacing.md, marginBottom: spacing.xl },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: radius.xl,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  avatarText: { fontSize: 28, fontWeight: "800", color: colors.primary },
  name: { color: colors.text, fontSize: 20, fontWeight: "800", letterSpacing: -0.2 },
  phone: { color: colors.textDim, fontSize: 13, marginTop: 4, fontWeight: "600" },
  sectionHeading: { color: colors.textDim, fontSize: 12, fontWeight: "800", letterSpacing: 0.6, marginBottom: spacing.md },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  statCard: {
    flexBasis: "47%",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.soft,
  },
  statValue: { color: colors.primary, fontSize: 22, fontWeight: "800" },
  statLabel: { color: colors.textDim, fontSize: 11, marginTop: spacing.xs, textAlign: "center", fontWeight: "600" },
  logoutButton: {
    marginTop: spacing.xxl,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.3)",
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutText: { color: colors.danger, fontWeight: "800", fontSize: 15 },
});
