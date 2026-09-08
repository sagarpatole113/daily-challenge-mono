import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { colors, radius, spacing, shadow } from "../../theme/theme";

interface Props {
  visible: boolean;
  answeredCount: number;
  totalCount: number;
  onCancel: () => void;
  onConfirm: () => void;
  submitting: boolean;
}

export function SubmitConfirmModal({
  visible,
  answeredCount,
  totalCount,
  onCancel,
  onConfirm,
  submitting,
}: Props) {
  const unanswered = totalCount - answeredCount;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Submit Test?</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.success }]}>
                {answeredCount} / {totalCount}
              </Text>
              <Text style={styles.statLabel}>Answered</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.danger }]}>{unanswered}</Text>
              <Text style={styles.statLabel}>Unanswered</Text>
            </View>
          </View>
          <Text style={styles.warning}>
            You won't be able to change your answers after submitting.
          </Text>
          <View style={styles.buttonRow}>
            <Pressable style={[styles.button, styles.cancelButton]} onPress={onCancel} disabled={submitting}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.submitButton]} onPress={onConfirm} disabled={submitting}>
              <Text style={styles.submitText}>{submitting ? "Submitting..." : "Submit Test"}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: "center", padding: spacing.xl },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    ...shadow.card,
  },
  title: { color: colors.text, fontSize: 20, fontWeight: "800", textAlign: "center", marginBottom: spacing.xl, letterSpacing: -0.2 },
  statsRow: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.lg },
  statBox: { flex: 1, backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: spacing.md, alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "800" },
  statLabel: { color: colors.textDim, fontSize: 12, marginTop: spacing.xs, fontWeight: "600" },
  warning: { color: colors.textDim, fontSize: 13, textAlign: "center", marginBottom: spacing.xl, lineHeight: 19 },
  buttonRow: { flexDirection: "row", gap: spacing.md },
  button: { flex: 1, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: "center" },
  cancelButton: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  cancelText: { color: colors.text, fontWeight: "800" },
  submitButton: { backgroundColor: colors.primary, ...shadow.button },
  submitText: { color: colors.onPrimary, fontWeight: "800" },
});
