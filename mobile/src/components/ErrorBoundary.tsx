import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, radius, spacing, shadow } from "../theme/theme";

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * No error boundary existed anywhere in the app, so any render-time
 * exception (e.g. an unexpected shape coming back from the API) would take
 * the entire app down with a hard crash / white screen and no way to
 * recover except force-quitting. This catches it and offers a reload
 * instead. It does NOT catch errors in event handlers, async code, or
 * effects — only render-time throws — so `api.ts` / react-query error
 * states still need their own handling (which they already have).
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary] caught render error:", error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <View style={styles.iconCircle}>
            <Text style={{ fontSize: 26 }}>⚠️</Text>
          </View>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>{this.state.error.message}</Text>
          <Pressable style={styles.button} onPress={this.reset}>
            <Text style={styles.buttonText}>Try Again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: radius.lg,
    backgroundColor: colors.dangerSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: { color: colors.text, fontSize: 18, fontWeight: "800", marginBottom: spacing.sm },
  message: { color: colors.textDim, fontSize: 13, textAlign: "center", marginBottom: spacing.xl, lineHeight: 19 },
  button: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.xxl, paddingVertical: 14, ...shadow.button },
  buttonText: { color: colors.onPrimary, fontWeight: "800", fontSize: 14 },
});
