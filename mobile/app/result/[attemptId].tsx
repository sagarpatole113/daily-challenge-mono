import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAttemptResult } from "../../src/hooks/useAttempt";
import { ApiClientError } from "../../src/services/api";
import { useAttemptStore } from "../../src/store/attemptStore";
import { formatDayLabel } from "../../src/utils/dates";
import { colors, radius, spacing, shadow } from "../../src/theme/theme";

export default function ResultScreen() {
  const router = useRouter();
  const { attemptId } = useLocalSearchParams<{
    attemptId: string;
  }>();

  const { data: result, isLoading, isError, error, refetch } = useAttemptResult(attemptId);

  useEffect(() => {
    useAttemptStore.getState().clear();
  }, []);

  if (isLoading || !result) {
    if (isError) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>
            {error instanceof ApiClientError ? error.message : "Unable to load this result."}
          </Text>
          <Pressable style={styles.homeLink} onPress={() => refetch()}>
            <Text style={styles.homeLinkText}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const minutes = Math.floor(result.timeTakenSeconds / 60);
  const seconds = result.timeTakenSeconds % 60;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.badge, result.status === "TIME_EXPIRED" && styles.badgeWarning]}>
          <Text style={[styles.badgeText, result.status === "TIME_EXPIRED" && styles.badgeTextWarning]}>
            {result.status === "TIME_EXPIRED" ? "⏱ TIME EXPIRED" : "✅ TEST COMPLETED"}
          </Text>
        </View>
        <Text style={styles.title}>Test {result.testNumber}</Text>
        <Text style={styles.subtitle}>{formatDayLabel(result.dayId)}</Text>

        <View style={styles.scoreCircle}>
          <View style={styles.scoreCircleInner}>
            <Text style={styles.scoreValue}>{result.score}</Text>
            <Text style={styles.scoreOutOf}>OUT OF 100</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatBox label="Correct" value={String(result.correctAnswers)} color={colors.success} bg={colors.successSoft} />
          <StatBox label="Wrong" value={String(result.wrongAnswers)} color={colors.danger} bg={colors.dangerSoft} />
          <StatBox label="Unanswered" value={String(result.unansweredQuestions)} color={colors.textDim} bg={colors.surfaceAlt} />
          <StatBox label="Accuracy" value={`${result.accuracy}%`} color={colors.primary} bg={colors.primarySoft} />
        </View>

        <View style={styles.timeRow}>
          <Text style={styles.timeLabel}>Time Taken</Text>
          <Text style={styles.timeValue}>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </Text>
        </View>

        <Pressable
          style={styles.reviewButton}
          onPress={() =>
            router.push({ pathname: "/review/[attemptId]", params: { attemptId } })
          }
        >
          <Text style={styles.reviewButtonText}>REVIEW ANSWERS</Text>
        </Pressable>

        <Pressable style={styles.homeLink} onPress={() => router.replace("/(tabs)/home")}>
          <Text style={styles.homeLinkText}>Back to Home</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ label, value, color, bg }: { label: string; value: string; color: string; bg: string }) {
  return (
    <View style={[styles.statBox, { backgroundColor: bg }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  loadingContainer: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  errorText: { color: colors.textDim, textAlign: "center", fontSize: 14, paddingHorizontal: spacing.xxl },
  scroll: { padding: spacing.xxl, alignItems: "center", paddingBottom: 48 },
  badge: {
    marginTop: spacing.md,
    backgroundColor: colors.successSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs + 2,
  },
  badgeWarning: { backgroundColor: colors.dangerSoft },
  badgeText: { color: colors.success, fontWeight: "800", fontSize: 12, letterSpacing: 1 },
  badgeTextWarning: { color: colors.danger },
  title: { color: colors.text, fontSize: 26, fontWeight: "800", marginTop: spacing.md, letterSpacing: -0.3 },
  subtitle: { color: colors.textDim, fontSize: 14, marginTop: 2, marginBottom: spacing.xxl, fontWeight: "600" },
  scoreCircle: {
    width: 172,
    height: 172,
    borderRadius: 86,
    borderWidth: 10,
    borderColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xxl,
  },
  scoreCircleInner: {
    width: 148,
    height: 148,
    borderRadius: 74,
    borderWidth: 3,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.soft,
  },
  scoreValue: { color: colors.text, fontSize: 40, fontWeight: "800", letterSpacing: -1 },
  scoreOutOf: { color: colors.textFaint, fontSize: 11, fontWeight: "700", letterSpacing: 0.5, marginTop: 2 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, width: "100%" },
  statBox: { flexBasis: "47%", borderRadius: radius.lg, padding: spacing.lg, alignItems: "center" },
  statValue: { fontSize: 22, fontWeight: "800" },
  statLabel: { color: colors.textDim, fontSize: 12, marginTop: spacing.xs, fontWeight: "600" },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  timeLabel: { color: colors.textDim, fontSize: 14, fontWeight: "600" },
  timeValue: { color: colors.text, fontSize: 15, fontWeight: "800", fontVariant: ["tabular-nums"] },
  reviewButton: {
    width: "100%",
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: "center",
    marginTop: spacing.xxl,
  },
  reviewButtonText: { color: colors.text, fontWeight: "800", letterSpacing: 0.3 },
  homeLink: { marginTop: spacing.xl },
  homeLinkText: { color: colors.textFaint, fontSize: 13, fontWeight: "600" },
});
