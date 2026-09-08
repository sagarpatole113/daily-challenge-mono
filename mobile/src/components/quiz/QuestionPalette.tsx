import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { colors, radius, spacing } from "../../theme/theme";
import type { QuestionAnswerStatus } from "@shared/index";

interface Props {
  total: number;
  currentIndex: number;
  getStatus: (index: number) => QuestionAnswerStatus;
  onSelect: (index: number) => void;
}

const COLORS: Record<QuestionAnswerStatus, string> = {
  NOT_VISITED: colors.surfaceAlt,
  NOT_ANSWERED: colors.danger,
  ANSWERED: colors.success,
  MARKED_FOR_REVIEW: colors.purple,
  ANSWERED_AND_MARKED: colors.indigo,
};

export function QuestionPalette({ total, currentIndex, getStatus, onSelect }: Props) {
  const items = Array.from({ length: total }, (_, i) => i);

  return (
    <View style={styles.container}>
      <View style={styles.legendRow}>
        <LegendDot color={COLORS.NOT_VISITED} label="Not visited" />
        <LegendDot color={COLORS.NOT_ANSWERED} label="Not answered" />
        <LegendDot color={COLORS.ANSWERED} label="Answered" />
        <LegendDot color={COLORS.MARKED_FOR_REVIEW} label="Marked" />
      </View>
      <ScrollView contentContainerStyle={styles.grid}>
        {items.map((i) => {
          const status = getStatus(i);
          const isCurrent = i === currentIndex;
          return (
            <Pressable
              key={i}
              onPress={() => onSelect(i)}
              style={[
                styles.cell,
                { backgroundColor: COLORS[status] },
                isCurrent && styles.cellCurrent,
              ]}
            >
              <Text style={styles.cellText}>{i + 1}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  legendRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, padding: spacing.lg },
  legendItem: { flexDirection: "row", alignItems: "center", gap: spacing.xs + 2 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { color: colors.textDim, fontSize: 11, fontWeight: "600" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm + 2, padding: spacing.lg },
  cell: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  cellCurrent: { borderWidth: 2, borderColor: colors.text },
  cellText: { color: colors.onPrimary, fontWeight: "800", fontSize: 14 },
});
