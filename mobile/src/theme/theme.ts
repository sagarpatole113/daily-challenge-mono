/**
 * Central design tokens for the app's new look.
 * Pure style values only — no behavior lives here, so importing this
 * file can never change how a screen works, only how it looks.
 */

export const colors = {
  // Surfaces
  bg: "#0A0A0D",
  bgAlt: "#0F1015",
  surface: "#16171D",
  surfaceAlt: "#1D1F27",
  surfaceRaised: "#22242E",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.14)",
  overlay: "rgba(5,5,8,0.86)",

  // Text
  text: "#F5F6FA",
  textDim: "#A7ABBD",
  textFaint: "#6E7288",

  // Brand
  primary: "#FF6A3D",
  primarySoft: "rgba(255,106,61,0.14)",
  primaryBorder: "rgba(255,106,61,0.4)",
  amber: "#FFB74A",
  onPrimary: "#160B06",

  // Status
  success: "#3DDC97",
  successSoft: "rgba(61,220,151,0.14)",
  danger: "#FF6B6B",
  dangerSoft: "rgba(255,107,107,0.14)",
  purple: "#B490FF",
  indigo: "#8A93FF",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 36,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export const shadow = {
  card: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 6,
  },
  button: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 5,
  },
  soft: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
} as const;

export const type = {
  display: { fontSize: 28, fontWeight: "800" as const, letterSpacing: -0.4 },
  title: { fontSize: 20, fontWeight: "800" as const, letterSpacing: -0.2 },
  subtitle: { fontSize: 14, fontWeight: "600" as const },
  body: { fontSize: 15, fontWeight: "500" as const },
  label: { fontSize: 11, fontWeight: "800" as const, letterSpacing: 1.1, textTransform: "uppercase" as const },
  caption: { fontSize: 12, fontWeight: "600" as const },
};
