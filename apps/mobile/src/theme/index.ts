/**
 * Lasan Family design system for mobile (HANDOFF §5).
 * The same palette, fonts and radii as the website, tuned for touch.
 */
import { Platform, type TextStyle, type ViewStyle } from "react-native";

export const colors = {
  cream: "#fbf6f1",
  ivory: "#fffdfb",
  white: "#ffffff",
  plum900: "#2a1428",
  plum700: "#4d2649",
  plum500: "#7a4377",
  plum300: "#b98fb5",
  blush50: "#fdf3f5",
  blush100: "#fbe5ea",
  blush300: "#f0a3b4",
  blush500: "#d45677",
  blush600: "#b93d5f",
  sage100: "#e8efe5",
  sage600: "#5f7d57",
  peach100: "#fde9dc",
  lilac100: "#eee8fb",
  lilac300: "#c9b8f0",
  gold400: "#e7b45f",
  // Text tints derived from plum
  text: "#2a1428",
  textMuted: "#6f5a6c",
  textSubtle: "#9a8797",
  ring: "#fbe5ea",
  danger: "#b93d5f",
  overlay: "rgba(42,20,40,0.45)",
} as const;

export const fonts = {
  display: "Fraunces_600SemiBold",
  displayMedium: "Fraunces_500Medium",
  displayItalic: "Fraunces_500Medium_Italic",
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semibold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
} as const;

/** Type scale. Body text never drops below 16 for readability. */
export const type = {
  hero: { fontFamily: fonts.display, fontSize: 36, lineHeight: 42, letterSpacing: -0.6, color: colors.text },
  title: { fontFamily: fonts.display, fontSize: 28, lineHeight: 34, letterSpacing: -0.4, color: colors.text },
  heading: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28, letterSpacing: -0.2, color: colors.text },
  subheading: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 24, color: colors.text },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: colors.text },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 24, color: colors.text },
  label: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 20, color: colors.text },
  caption: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colors.textMuted },
  overline: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 16, letterSpacing: 1.8, textTransform: "uppercase", color: colors.blush600 },
} satisfies Record<string, TextStyle>;

export type TypeVariant = keyof typeof type;

export const space = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32, xxxl: 48 } as const;

export const radii = { sm: 14, md: 20, lg: 28, xl: 36, pill: 999 } as const;

/** Minimum touch target (Android guidance is 48dp). */
export const touch = 52;

export const shadow: ViewStyle = Platform.select({
  ios: { shadowColor: colors.plum900, shadowOpacity: 0.06, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } },
  default: { elevation: 2 },
})!;

export const ring: ViewStyle = { borderWidth: 1, borderColor: colors.ring };
