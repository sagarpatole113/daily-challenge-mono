import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useState, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../src/store/authStore";
import { useDays, useTestsForDay } from "../../src/hooks/useDailyTests";
import { todayDayId, yesterdayDayId, formatDayLabel } from "../../src/utils/dates";
import { ProgressBar } from "../../src/components/progress/ProgressBar";
import { ApiClientError } from "../../src/services/api";
import { colors, radius, spacing, shadow } from "../../src/theme/theme";

export default function HomeScreen() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const [refreshing, setRefreshing] = useState(false);

  const todayId = todayDayId();
  const yesterdayId = yesterdayDayId();

  const { data: days, refetch: refetchDays } = useDays();
  const {
    data: todayTests,
    isLoading,
    error: todayTestsErrorObj,
    refetch: refetchToday,
  } = useTestsForDay(todayId);

  const todaySummary = days?.find((d) => d.dayId === todayId);
  const yesterdaySummary = days?.find((d) => d.dayId === yesterdayId);

  // Distinguish *why* today has no tests, instead of collapsing every
  // failure into one generic message — a 401 (auth/token problem) and a
  // 404 (nothing published yet) need completely different fixes, and
  // silently treating them the same is what made the auth bug look like
  // a content bug.
  const todayStatus: "ok" | "not_published" | "auth_error" | "other_error" = !todayTestsErrorObj
    ? "ok"
    : todayTestsErrorObj instanceof ApiClientError && todayTestsErrorObj.status === 404
    ? "not_published"
    : todayTestsErrorObj instanceof ApiClientError && todayTestsErrorObj.status === 401
    ? "auth_error"
    : "other_error";

  const nextAction = useMemo(() => {
    if (!todayTests) return null;
    const inProgress = todayTests.find((t) => t.inProgress);
    if (inProgress) return { type: "continue" as const, test: inProgress };
    const allDone = todayTests.every((t) => t.completed);
    if (allDone) return { type: "done" as const, test: null };
    const nextUnlocked = todayTests.find((t) => t.unlocked && !t.completed);
    if (nextUnlocked) return { type: "start" as const, test: nextUnlocked };
    return null;
  }, [todayTests]);

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([refetchDays(), refetchToday()]);
    setRefreshing(false);
  }

  const completed = todaySummary?.completedTests ?? 0;
  const total = todaySummary?.totalTests ?? 3;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.topRow}>
          <View>
            <Text style={styles.eyebrow}>WELCOME BACK</Text>
            <Text style={styles.welcome}>{profile?.name?.split(" ")[0] || "Student"} 👋</Text>
          </View>
          <View style={styles.avatarBadge}>
            <Text style={styles.avatarBadgeText}>{(profile?.name?.[0] || "S").toUpperCase()}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.heroCard]}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardLabel}>TODAY · {formatDayLabel(todayId).toUpperCase()}</Text>
            {nextAction?.type === "done" && <View style={styles.doneDot} />}
          </View>
          <Text style={styles.cardTitle}>
            {nextAction?.type === "done"
              ? `All ${completed} Tests Completed 🎉`
              : nextAction?.test
              ? `Test ${nextAction.test.testNumber} of ${total}`
              : `Test ${completed + 1} of ${total}`}
          </Text>

          <ProgressBar progress={completed / total} />

          <View style={styles.progressRow}>
            <Text style={styles.progressText}>{completed} Completed</Text>
            <Text style={styles.progressText}>{total - completed} Remaining</Text>
          </View>

          {isLoading ? (
            <ActivityIndicator style={{ marginTop: spacing.lg }} color={colors.primary} />
          ) : todayStatus === "auth_error" ? (
            // The API rejected the request with 401 — verifyIdToken is
            // failing server-side (or no token was sent). This is an auth
            // bug, not a content bug — check the API server's terminal for
            // the "[requireAuth] Token verification failed: ..." line.
            <View style={styles.noticeBox}>
              <Text style={[styles.emptyStateText, styles.errorText]}>
                Couldn't verify your login with the server. Check the API server logs for the auth
                error and confirm FIREBASE_PROJECT_ID (api/.env) matches EXPO_PUBLIC_FIREBASE_PROJECT_ID
                (mobile/.env).
              </Text>
            </View>
          ) : todayStatus === "other_error" ? (
            <View style={styles.noticeBox}>
              <Text style={[styles.emptyStateText, styles.errorText]}>
                Couldn't reach the server
                {todayTestsErrorObj instanceof Error ? `: ${todayTestsErrorObj.message}` : "."} Pull to
                retry.
              </Text>
            </View>
          ) : todayStatus === "not_published" || !todayTests || todayTests.length === 0 ? (
            // No ACTIVE dailyTestBatches/{todayId} exists yet — a genuine
            // 404, meaning the server was reached and auth succeeded, but
            // nobody has imported today's tests. Run:
            //   cd cron && npm run import -- --date=<today's YYYY-MM-DD>
            <View style={styles.noticeBox}>
              <Text style={styles.emptyStateText}>
                No tests published for today yet. Check back soon, or view Yesterday below.
              </Text>
            </View>
          ) : nextAction?.type === "done" ? (
            <Pressable style={[styles.button, styles.buttonSecondary]} onPress={() => router.push("/(tabs)/profile")}>
              <Text style={styles.buttonSecondaryText}>VIEW YOUR STATS</Text>
            </Pressable>
          ) : nextAction?.test ? (
            <Pressable
              style={styles.button}
              onPress={() =>
                router.push({
                  pathname: "/test/[testId]",
                  params: { testId: nextAction.test!.id, dayId: todayId },
                })
              }
            >
              <Text style={styles.buttonText}>
                {nextAction.type === "continue" ? "CONTINUE TEST" : "START NEXT TEST"}
              </Text>
            </Pressable>
          ) : null}
        </View>

        {yesterdaySummary && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>YESTERDAY · {formatDayLabel(yesterdayId).toUpperCase()}</Text>
            <Text style={styles.cardTitle}>
              {yesterdaySummary.completedTests} / {yesterdaySummary.totalTests} Completed
            </Text>
            <ProgressBar progress={yesterdaySummary.completedTests / yesterdaySummary.totalTests} />
            <Pressable
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => router.push("/(tabs)/tests")}
            >
              <Text style={styles.buttonSecondaryText}>VIEW TESTS</Text>
            </Pressable>
          </View>
        )}

        <Text style={styles.sectionHeading}>Your Stats</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{profile?.totalTestsCompleted ?? 0}</Text>
            <Text style={styles.statLabel}>Tests Completed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: colors.amber }]}>
              {profile && profile.totalTestsCompleted > 0
                ? (profile.totalScore / profile.totalTestsCompleted).toFixed(1)
                : "0.0"}
            </Text>
            <Text style={styles.statLabel}>Average Score</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.xl, paddingBottom: 48 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.xl },
  eyebrow: { color: colors.textFaint, fontSize: 11, fontWeight: "800", letterSpacing: 1.1, marginBottom: 4 },
  welcome: { fontSize: 24, fontWeight: "800", color: colors.text, letterSpacing: -0.3 },
  avatarBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarBadgeText: { color: colors.primary, fontWeight: "800", fontSize: 16 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  heroCard: { borderColor: colors.primaryBorder },
  cardTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  doneDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  cardLabel: { color: colors.textDim, fontSize: 11, fontWeight: "800", letterSpacing: 0.6, marginBottom: spacing.xs },
  cardTitle: { color: colors.text, fontSize: 20, fontWeight: "800", marginBottom: spacing.lg, letterSpacing: -0.2 },
  progressRow: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.sm },
  progressText: { color: colors.textDim, fontSize: 12, fontWeight: "600" },
  noticeBox: {
    marginTop: spacing.lg,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  emptyStateText: { color: colors.textDim, fontSize: 13, lineHeight: 19 },
  errorText: { color: colors.danger },
  button: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
    ...shadow.button,
  },
  buttonText: { color: colors.onPrimary, fontWeight: "800", fontSize: 14, letterSpacing: 0.3 },
  buttonSecondary: { backgroundColor: colors.surfaceAlt, shadowOpacity: 0, elevation: 0, borderWidth: 1, borderColor: colors.border },
  buttonSecondaryText: { color: colors.text, fontWeight: "800", fontSize: 13, letterSpacing: 0.3 },
  sectionHeading: { color: colors.textDim, fontSize: 12, fontWeight: "800", letterSpacing: 0.6, marginBottom: spacing.md, marginTop: spacing.xs },
  statsRow: { flexDirection: "row", gap: spacing.md },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: "center",
    ...shadow.soft,
  },
  statValue: { color: colors.primary, fontSize: 26, fontWeight: "800", letterSpacing: -0.4 },
  statLabel: { color: colors.textDim, fontSize: 11, marginTop: spacing.xs, textAlign: "center", fontWeight: "600" },
});
