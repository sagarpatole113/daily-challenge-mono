import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { signInWithUsername } from "../../src/services/firebase";
import { api } from "../../src/services/api";
import { useAuthStore } from "../../src/store/authStore";
import { colors, radius, spacing, shadow } from "../../src/theme/theme";
import type { User } from "@shared/index";

export default function LoginScreen() {
  const router = useRouter();
  const setProfile = useAuthStore((s) => s.setProfile);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = username.trim().length >= 3 && password.length >= 6;

  async function handleLogin() {
    setError(null);
    setLoading(true);
    try {
      await signInWithUsername(username, password);
      // Existing user — profile already exists. Fetch it and go straight in.
      const profile = await api.get<User>("/users/me");
      setProfile(profile);
      router.replace("/(tabs)/home");
    } catch (err: any) {
      setError(err?.message || "Failed to log in. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.content}>
        <View style={styles.mark}>
          <Text style={styles.markText}>MD</Text>
        </View>
        <Text style={styles.title}>MPSC Daily Challenge</Text>
        <Text style={styles.subtitle}>Daily discipline. Daily progress.</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. rahul_k"
            placeholderTextColor={colors.textFaint}
            autoCapitalize="none"
            autoCorrect={false}
            value={username}
            onChangeText={setUsername}
          />

          <Text style={[styles.label, { marginTop: spacing.lg }]}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={colors.textFaint}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <Pressable
            style={[styles.button, (!canSubmit || loading) && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={!canSubmit || loading}
          >
            <Text style={styles.buttonText}>{loading ? "Logging in..." : "Log In"}</Text>
          </Pressable>
        </View>

        <Pressable style={styles.linkRow} onPress={() => router.push("/(auth)/signup")}>
          <Text style={styles.linkText}>
            New here? <Text style={styles.linkTextAccent}>Create an account</Text>
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, justifyContent: "center", paddingHorizontal: spacing.xl },
  mark: {
    alignSelf: "center",
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  markText: { color: colors.primary, fontSize: 18, fontWeight: "900", letterSpacing: -0.5 },
  title: { fontSize: 26, fontWeight: "800", color: colors.text, textAlign: "center", letterSpacing: -0.3 },
  subtitle: { fontSize: 14, color: colors.textDim, textAlign: "center", marginTop: 6, marginBottom: spacing.xxl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    ...shadow.card,
  },
  label: { fontSize: 12, color: colors.textDim, marginBottom: spacing.sm, fontWeight: "700", letterSpacing: 0.3 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surfaceAlt,
  },
  error: { color: colors.danger, marginTop: spacing.md, fontSize: 13 },
  button: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: "center",
    ...shadow.button,
  },
  buttonDisabled: { opacity: 0.5, shadowOpacity: 0 },
  buttonText: { color: colors.onPrimary, fontSize: 16, fontWeight: "800" },
  linkRow: { marginTop: spacing.xxl, alignItems: "center" },
  linkText: { color: colors.textDim, fontSize: 14 },
  linkTextAccent: { color: colors.primary, fontWeight: "700" },
});
