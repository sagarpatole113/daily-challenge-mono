import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  BackHandler,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAttemptStore } from "../../src/store/attemptStore";
import { useTimer } from "../../src/hooks/useTimer";
import {
  useStartTest,
  useSaveAnswer,
  useSubmitAttempt,
  useExpireAttempt,
} from "../../src/hooks/useAttempt";
import { QuestionPalette } from "../../src/components/quiz/QuestionPalette";
import { SubmitConfirmModal } from "../../src/components/quiz/SubmitConfirmModal";
import { colors, radius, spacing, shadow } from "../../src/theme/theme";

export default function TestScreen() {
  const router = useRouter();
  const { testId, dayId } = useLocalSearchParams<{ testId: string; dayId: string }>();

  const [showPalette, setShowPalette] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [language, setLanguage] = useState<"both" | "en" | "mr">("both");

  const startTest = useStartTest();
  const submitAttempt = useSubmitAttempt();
  const expireAttempt = useExpireAttempt();

  const { attemptId, questions, answers, currentIndex, setCurrentIndex, selectOption, toggleMarkForReview } =
    useAttemptStore();

  const saveAnswer = useSaveAnswer(attemptId);

  // Start (or resume) the attempt on mount.
  useEffect(() => {
    if (testId && dayId) {
      startTest.mutate({ dayId, testId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId, dayId]);

  const handleExpire = useCallback(() => {
    if (!attemptId) return;
    expireAttempt.mutate(attemptId, {
      onSuccess: () => {
        router.replace({
          pathname: "/result/[attemptId]",
          params: { attemptId, dayId, testId },
        });
      },
    });
  }, [attemptId, dayId, testId]);

  const { label: timerLabel, isExpired } = useTimer(handleExpire);

  // Prevent hardware back button from leaving an active exam silently.
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      Alert.alert("Leave test?", "Your progress is saved, but the timer keeps running.", [
        { text: "Stay", style: "cancel" },
        { text: "Leave", onPress: () => router.back() },
      ]);
      return true;
    });
    return () => sub.remove();
  }, []);

  if (startTest.isPending || questions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (startTest.isError) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{(startTest.error as any)?.message || "Failed to start test"}</Text>
        <Pressable style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const question = questions[currentIndex];
  const answer = answers[question.id];
  const answeredCount = Object.values(answers).filter(
    (a) => a.status === "ANSWERED" || a.status === "ANSWERED_AND_MARKED"
  ).length;

  function handleSelect(optionId: string) {
    selectOption(question.id, optionId);
    saveAnswer.mutate({
      questionId: question.id,
      selectedOptionId: optionId,
      status:
        answer?.status === "MARKED_FOR_REVIEW" || answer?.status === "ANSWERED_AND_MARKED"
          ? "ANSWERED_AND_MARKED"
          : "ANSWERED",
    });
  }

  function handleMark() {
    toggleMarkForReview(question.id);
    const updated = useAttemptStore.getState().answers[question.id];
    saveAnswer.mutate({
      questionId: question.id,
      selectedOptionId: updated.selectedOptionId,
      status: updated.status,
    });
  }

  function handleSubmit() {
    if (!attemptId || isSubmitting || submitAttempt.isPending) return;
    setIsSubmitting(true);
    submitAttempt.mutate(attemptId, {
      onSuccess: () => {
        setShowSubmitModal(false);
        router.replace({
          pathname: "/result/[attemptId]",
          params: { attemptId, dayId, testId },
        });
      },
      onError: () => {
        setIsSubmitting(false);
      },
    });
  }

  if (showPalette) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.paletteHeader}>
          <Text style={styles.paletteTitle}>Question Palette</Text>
          <Pressable onPress={() => setShowPalette(false)}>
            <Text style={styles.closeLink}>Close</Text>
          </Pressable>
        </View>
        <QuestionPalette
          total={questions.length}
          currentIndex={currentIndex}
          getStatus={(i) => answers[questions[i].id]?.status ?? "NOT_VISITED"}
          onSelect={(i) => {
            setCurrentIndex(i);
            setShowPalette(false);
          }}
        />
        <Pressable style={styles.submitButtonFooter} onPress={() => setShowSubmitModal(true)}>
          <Text style={styles.submitButtonFooterText}>SUBMIT TEST</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.topBar}>
        <Text style={styles.questionCount}>
          Question {currentIndex + 1} / {questions.length}
        </Text>
        <View style={[styles.timerBadge, isExpired && styles.timerBadgeExpired]}>
          <Text style={[styles.timer, isExpired && styles.timerExpired]}>{timerLabel}</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 24 }}>
        {question.subject && (
          <View style={styles.subjectTagWrap}>
            <Text style={styles.subjectTag}>{question.subject}</Text>
          </View>
        )}

        <Text style={styles.questionEnglish}>{question.questionEnglish}</Text>
        <Text style={styles.questionMarathi}>{question.questionMarathi}</Text>

        <View style={{ marginTop: 20 }}>
          {question.options.map((opt) => {
            const selected = answer?.selectedOptionId === opt.id;
            return (
              <Pressable
                key={opt.id}
                style={[styles.option, selected && styles.optionSelected]}
                onPress={() => handleSelect(opt.id)}
              >
                <View style={[styles.optionBadge, selected && styles.optionBadgeSelected]}>
                  <Text style={[styles.optionBadgeText, selected && styles.optionBadgeTextSelected]}>
                    {opt.id}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionEnglish}>{opt.english}</Text>
                  <Text style={styles.optionMarathi}>{opt.marathi}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Pressable style={styles.markButton} onPress={handleMark}>
          <Text style={styles.markButtonText}>
            {answer?.status === "MARKED_FOR_REVIEW" || answer?.status === "ANSWERED_AND_MARKED"
              ? "★ Marked for Review — Tap to Unmark"
              : "☆ Mark for Review"}
          </Text>
        </Pressable>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable
          style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
          onPress={() => setCurrentIndex(currentIndex - 1)}
          disabled={currentIndex === 0}
        >
          <Text style={styles.navButtonText}>Previous</Text>
        </Pressable>

        <Pressable style={styles.paletteButton} onPress={() => setShowPalette(true)}>
          <Text style={styles.paletteButtonText}>{answeredCount}/{questions.length}</Text>
        </Pressable>

        {currentIndex === questions.length - 1 ? (
          <Pressable style={styles.navButtonPrimary} onPress={() => setShowSubmitModal(true)}>
            <Text style={styles.navButtonPrimaryText}>Submit</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.navButtonPrimary} onPress={() => setCurrentIndex(currentIndex + 1)}>
            <Text style={styles.navButtonPrimaryText}>Next</Text>
          </Pressable>
        )}
      </View>

      <SubmitConfirmModal
        visible={showSubmitModal}
        answeredCount={answeredCount}
        totalCount={questions.length}
        onCancel={() => setShowSubmitModal(false)}
        onConfirm={handleSubmit}
        submitting={isSubmitting || submitAttempt.isPending}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  loadingContainer: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center", padding: spacing.xxl },
  errorText: { color: colors.danger, textAlign: "center", marginBottom: spacing.lg },
  retryButton: { backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.border },
  retryText: { color: colors.text, fontWeight: "800" },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bgAlt,
  },
  questionCount: { color: colors.text, fontSize: 14, fontWeight: "800" },
  timerBadge: {
    backgroundColor: colors.successSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  timerBadgeExpired: { backgroundColor: colors.dangerSoft },
  timer: { color: colors.success, fontSize: 16, fontWeight: "800", fontVariant: ["tabular-nums"] },
  timerExpired: { color: colors.danger },
  scroll: { flex: 1, padding: spacing.xl },
  subjectTagWrap: { alignSelf: "flex-start", backgroundColor: colors.primarySoft, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 5, marginBottom: spacing.md },
  subjectTag: { color: colors.primary, fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
  questionEnglish: { color: colors.text, fontSize: 17, fontWeight: "700", lineHeight: 25, letterSpacing: -0.1 },
  questionMarathi: { color: colors.textDim, fontSize: 16, marginTop: spacing.sm, lineHeight: 24 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  optionBadge: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  optionBadgeSelected: { backgroundColor: colors.primary },
  optionBadgeText: { color: colors.text, fontWeight: "800" },
  optionBadgeTextSelected: { color: colors.onPrimary },
  optionEnglish: { color: colors.text, fontSize: 15, fontWeight: "600" },
  optionMarathi: { color: colors.textDim, fontSize: 13, marginTop: 2 },
  markButton: { marginTop: spacing.sm, alignItems: "center", paddingVertical: spacing.md },
  markButtonText: { color: colors.purple, fontSize: 13, fontWeight: "700" },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bgAlt,
    gap: spacing.sm,
  },
  navButton: { flex: 1, backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: "center", borderWidth: 1, borderColor: colors.border },
  navButtonDisabled: { opacity: 0.4 },
  navButtonText: { color: colors.text, fontWeight: "800" },
  navButtonPrimary: { flex: 1, backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: "center", ...shadow.button },
  navButtonPrimaryText: { color: colors.onPrimary, fontWeight: "800" },
  paletteButton: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.border },
  paletteButtonText: { color: colors.text, fontWeight: "800", fontSize: 12 },
  paletteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  paletteTitle: { color: colors.text, fontSize: 18, fontWeight: "800" },
  closeLink: { color: colors.primary, fontWeight: "700" },
  submitButtonFooter: { margin: spacing.xl, backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.lg, alignItems: "center", ...shadow.button },
  submitButtonFooterText: { color: colors.onPrimary, fontWeight: "800", letterSpacing: 0.3 },
});
