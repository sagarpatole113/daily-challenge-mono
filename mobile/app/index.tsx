import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { colors, radius, spacing } from "../src/theme/theme";

/**
 * Splash/landing route. The real routing decision (Login vs Main App)
 * happens in app/_layout.tsx's auth-state listener, which replaces this
 * route as soon as Firebase's persisted session check resolves.
 */
export default function Index() {
  return (
    <View style={styles.container}>
      <View style={styles.mark}>
        <Text style={styles.markText}>MD</Text>
      </View>
      <Text style={styles.logo}>MPSC Daily Challenge</Text>
      <Text style={styles.tagline}>Daily discipline. Daily progress.</Text>
      <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 28 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xl },
  mark: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  markText: { color: colors.primary, fontSize: 20, fontWeight: "900", letterSpacing: -0.5 },
  logo: { color: colors.text, fontSize: 20, fontWeight: "800", letterSpacing: -0.2 },
  tagline: { color: colors.textDim, fontSize: 13, marginTop: 6 },
});
