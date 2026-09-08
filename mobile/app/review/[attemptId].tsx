import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAttemptReview } from "../../src/hooks/useAttempt";
import { colors, radius, spacing } from "../../src/theme/theme";
import type { ReviewQuestionItem } from "@shared/index";

const RESULT_COLOR: Record<string, string> = {
  CORRECT: colors.success,
  WRONG: colors.danger,
  UNANSWERED: colors.textDim,
};

export default function ReviewScreen() {
  const router = useRouter();
  const { attemptId } = useLocalSearchParams<{ attemptId: string }>();
  const { data: review, isLoading } = useAttemptReview(attemptId);

  if (isLoading || !review) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.backLink}>‹ Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Answer Review</Text>
        <View style={{ width: 50 }} />
      </View>

      <FlatList
        data={review}
        keyExtractor={(q) => String(q.questionNumber)}
        contentContainerStyle={{ padding: spacing.xl }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <ReviewCard item={item} />}
      />
    </SafeAreaView>
  );
}

function ReviewCard({ item }: { item: ReviewQuestionItem }) {
  const color = RESULT_COLOR[item.result];
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.qNumber}>Q{item.questionNumber}</Text>
        <View style={[styles.resultPill, { backgroundColor: `${color}22`, borderColor: color }]}>
          <Text style={[styles.resultPillText, { color }]}>{item.result}</Text>
        </View>
      </View>

      <Text style={styles.questionEnglish}>{item.questionEnglish}</Text>
      <Text style={styles.questionMarathi}>{item.questionMarathi}</Text>

      <View style={{ marginTop: spacing.md }}>
        {item.options.map((opt) => {
          const isSelected = opt.id === item.selectedOptionId;
          const isCorrect = opt.id === item.correctOptionId;
          return (
            <View
              key={opt.id}
              style={[
                styles.option,
                isCorrect && styles.optionCorrect,
                isSelected && !isCorrect && styles.optionWrong,
              ]}
            >
              <Text style={styles.optionText}>
                {opt.id}. {opt.english} / {opt.marathi}
                {isCorrect ? "  ✓" : isSelected ? "  ✗" : ""}
              </Text>
            </View>
          );
        })}
      </View>

      {(item.explanationEnglish || item.explanationMarathi) && (
        <View style={styles.explanationBox}>
          <Text style={styles.explanationLabel}>Explanation</Text>
          {item.explanationEnglish ? (
            <Text style={styles.explanationText}>{item.explanationEnglish}</Text>
          ) : null}
          {item.explanationMarathi ? (
            <Text style={[styles.explanationText, { marginTop: spacing.xs }]}>{item.explanationMarathi}</Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  loadingContainer: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  backLink: { color: colors.primary, fontWeight: "700", width: 50 },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: "800" },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md },
  qNumber: { color: colors.text, fontWeight: "800", fontSize: 15 },
  resultPill: { borderRadius: radius.sm, borderWidth: 1, paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.xs - 1 },
  resultPillText: { fontWeight: "800", fontSize: 10, letterSpacing: 0.3 },
  questionEnglish: { color: colors.text, fontSize: 15, fontWeight: "700", lineHeight: 21 },
  questionMarathi: { color: colors.textDim, fontSize: 14, marginTop: spacing.xs + 2, lineHeight: 21 },
  option: { backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, padding: spacing.sm + 2, marginBottom: spacing.sm, borderWidth: 1, borderColor: "transparent" },
  optionCorrect: { borderColor: colors.success, backgroundColor: colors.successSoft },
  optionWrong: { borderColor: colors.danger, backgroundColor: colors.dangerSoft },
  optionText: { color: colors.text, fontSize: 13, fontWeight: "500" },
  explanationBox: { backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, padding: spacing.md, marginTop: spacing.sm },
  explanationLabel: { color: colors.primary, fontSize: 11, fontWeight: "800", marginBottom: spacing.xs, textTransform: "uppercase", letterSpacing: 0.5 },
  explanationText: { color: colors.textDim, fontSize: 13, lineHeight: 19 },
});
