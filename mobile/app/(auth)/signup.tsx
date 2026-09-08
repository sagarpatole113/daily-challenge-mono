import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { signUpWithUsername, isValidUsername } from "../../src/services/firebase";
import { api } from "../../src/services/api";
import { useAuthStore } from "../../src/store/authStore";
import { colors, radius, spacing, shadow } from "../../src/theme/theme";
import type { User } from "@shared/index";

export default function SignupScreen() {
  const router = useRouter();
  const setProfile = useAuthStore((s) => s.setProfile);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const usernameValid = isValidUsername(username);
  const passwordsMatch = password.length >= 6 && password === confirmPassword;
  const canSubmit = name.trim().length >= 2 && usernameValid && passwordsMatch;

  async function handleSignup() {
    setError(null);
    if (!usernameValid) {
      setError("Username must be 3-20 characters: lowercase letters, numbers, underscores, starting with a letter.");
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords must match and be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      // 1. Create the Firebase account.
      await signUpWithUsername(username, password);

      // 2. Create the Firestore profile (name + username). If this fails
      // after the Firebase account was created, the user can still log in
      // and retry — /users/me will 404 until a profile exists, but the
      // account itself isn't lost.
      const profile = await api.post<User>("/users/profile", {
        name: name.trim(),
        username: username.trim().toLowerCase(),
      });
      setProfile(profile);
      router.replace("/(tabs)/home");
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Start your daily MPSC practice</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your full name"
            placeholderTextColor={colors.textFaint}
            value={name}
            onChangeText={setName}
          />

          <Text style={[styles.label, { marginTop: spacing.lg }]}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. rahul_k"
            placeholderTextColor={colors.textFaint}
            autoCapitalize="none"
            autoCorrect={false}
            value={username}
            onChangeText={setUsername}
          />
          {username.length > 0 && !usernameValid && (
            <Text style={styles.hint}>3-20 chars, lowercase letters/numbers/underscore, start with a letter</Text>
          )}

          <Text style={[styles.label, { marginTop: spacing.lg }]}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="At least 6 characters"
            placeholderTextColor={colors.textFaint}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Text style={[styles.label, { marginTop: spacing.lg }]}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Re-enter password"
            placeholderTextColor={colors.textFaint}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <Pressable
            style={[styles.button, (!canSubmit || loading) && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={!canSubmit || loading}
          >
            <Text style={styles.buttonText}>{loading ? "Creating account..." : "Create Account"}</Text>
          </Pressable>
        </View>

        <Pressable style={styles.linkRow} onPress={() => router.replace("/(auth)/login")}>
          <Text style={styles.linkText}>
            Already have an account? <Text style={styles.linkTextAccent}>Log in</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flexGrow: 1, justifyContent: "center", paddingHorizontal: spacing.xl, paddingVertical: spacing.xxxl },
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
  hint: { color: colors.textFaint, fontSize: 11, marginTop: 6 },
  error: { color: colors.danger, marginTop: spacing.lg, fontSize: 13 },
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
