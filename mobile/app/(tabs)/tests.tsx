import { useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDays, useTestsForDay } from "../../src/hooks/useDailyTests";
import { formatDayLabel } from "../../src/utils/dates";
import { ProgressBar } from "../../src/components/progress/ProgressBar";
import { colors, radius, spacing, shadow } from "../../src/theme/theme";
import type { DayListItem, DailyTestWithState } from "@shared/index";

export default function TestsScreen() {
  const { data: days, isLoading } = useDays();
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

  if (selectedDayId) {
    return <DayTestsList dayId={selectedDayId} onBack={() => setSelectedDayId(null)} />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Text style={styles.header}>Daily Tests</Text>
      <Text style={styles.subheader}>Pick a day to see its tests</Text>
      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : (
        <FlatList
          data={days}
          keyExtractor={(d) => d.dayId}
          contentContainerStyle={{ padding: spacing.xl }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <DayCard day={item} onPress={() => setSelectedDayId(item.dayId)} />}
        />
      )}
    </SafeAreaView>
  );
}

function DayCard({ day, onPress }: { day: DayListItem; onPress: () => void }) {
  const isComplete = day.completedTests >= day.totalTests;
  return (
    <Pressable style={styles.dayCard} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <View style={styles.dayCardTopRow}>
          <Text style={styles.dayLabel}>{formatDayLabel(day.date)}</Text>
          {isComplete && <View style={styles.completeDot} />}
        </View>
        <Text style={styles.daySubLabel}>{day.totalTests} Tests</Text>
        <View style={{ marginTop: spacing.md }}>
          <ProgressBar progress={day.completedTests / day.totalTests} />
        </View>
        <Text style={styles.dayProgress}>
          {isComplete ? "Completed ✅" : `Progress: ${day.completedTests} / ${day.totalTests}`}
        </Text>
      </View>
    </Pressable>
  );
}

function DayTestsList({ dayId, onBack }: { dayId: string; onBack: () => void }) {
  const router = useRouter();
  const { data: tests, isLoading } = useTestsForDay(dayId);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.subHeaderRow}>
        <Pressable onPress={onBack} hitSlop={10}>
          <Text style={styles.backLink}>‹ Days</Text>
        </Pressable>
        <Text style={styles.subHeaderTitle}>{formatDayLabel(dayId)}</Text>
        <View style={{ width: 50 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : (
        <FlatList
          data={tests}
          keyExtractor={(t) => t.id}
          contentContainerStyle={{ padding: spacing.xl }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TestRow
              test={item}
              onPress={() => {
                if (!item.unlocked) return;
                if (item.completed) {
                  if (!item.attemptId) return;
                  router.push({ pathname: "/result/[attemptId]", params: { attemptId: item.attemptId, dayId, testId: item.id } });
                } else {
                  router.push({ pathname: "/test/[testId]", params: { testId: item.id, dayId } });
                }
              }}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

function TestRow({ test, onPress }: { test: DailyTestWithState; onPress: () => void }) {
  const locked = !test.unlocked;
  return (
    <Pressable
      style={({ pressed }) => [styles.testRow, locked && styles.testRowLocked, pressed && !locked && styles.testRowPressed]}
      onPress={onPress}
      disabled={locked}
    >
      <View style={[styles.statusIcon, test.completed && styles.statusIconDone, locked && styles.statusIconLocked]}>
        <Text style={{ fontSize: 16 }}>{test.completed ? "✅" : locked ? "🔒" : "🔓"}</Text>
      </View>
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <Text style={styles.testTitle}>Test {test.testNumber}</Text>
        {locked ? (
          <Text style={styles.testSubtitle}>Complete Test {test.testNumber - 1} to Unlock</Text>
        ) : test.completed ? (
          <Text style={styles.testSubtitle}>Completed — tap to view result</Text>
        ) : test.inProgress ? (
          <Text style={styles.testSubtitle}>In progress — tap to continue</Text>
        ) : (
          <Text style={styles.testSubtitle}>Available now</Text>
        )}
      </View>
      {!locked && !test.completed && (
        <View style={styles.startPill}>
          <Text style={styles.startPillText}>{test.inProgress ? "CONTINUE" : "START"}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { fontSize: 24, fontWeight: "800", color: colors.text, paddingHorizontal: spacing.xl, paddingTop: spacing.md, letterSpacing: -0.3 },
  subheader: { fontSize: 13, color: colors.textDim, paddingHorizontal: spacing.xl, marginTop: spacing.xs },
  dayCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: "row",
    ...shadow.soft,
  },
  dayCardTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  completeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  dayLabel: { color: colors.text, fontSize: 17, fontWeight: "800" },
  daySubLabel: { color: colors.textDim, fontSize: 12, marginTop: 2, fontWeight: "600" },
  dayProgress: { color: colors.textDim, fontSize: 12, marginTop: spacing.sm, fontWeight: "600" },
  subHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  backLink: { color: colors.primary, fontSize: 15, fontWeight: "700", width: 50 },
  subHeaderTitle: { color: colors.text, fontSize: 18, fontWeight: "800" },
  testRow: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
  },
  testRowPressed: { borderColor: colors.primaryBorder },
  testRowLocked: { opacity: 0.45 },
  statusIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  statusIconDone: { backgroundColor: colors.successSoft },
  statusIconLocked: { backgroundColor: colors.surfaceAlt },
  testTitle: { color: colors.text, fontSize: 15, fontWeight: "800" },
  testSubtitle: { color: colors.textDim, fontSize: 12, marginTop: 3, fontWeight: "500" },
  startPill: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2 },
  startPillText: { color: colors.onPrimary, fontWeight: "800", fontSize: 11, letterSpacing: 0.3 },
});
