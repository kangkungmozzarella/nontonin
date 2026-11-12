import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";

export const FONT_SOURCES = {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
};

export const fontFamily = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  extrabold: "Inter_800ExtraBold",
} as const;

export type FontWeight = keyof typeof fontFamily;

export const typography = {
  display: { fontSize: 28, lineHeight: 34, letterSpacing: -0.4 },
  h1: { fontSize: 22, lineHeight: 28, letterSpacing: -0.3 },
  h2: { fontSize: 18, lineHeight: 24, letterSpacing: -0.2 },
  h3: { fontSize: 16, lineHeight: 22, letterSpacing: -0.1 },
  body: { fontSize: 14, lineHeight: 20 },
  small: { fontSize: 12.5, lineHeight: 17 },
  tiny: { fontSize: 11, lineHeight: 14 },
} as const;

export type TypographyVariant = keyof typeof typography;
