// Plus Jakarta Sans: Indonesian-designed geometric sans (see DESIGN.md)
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";

export const FONT_SOURCES = {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
};

export const fontFamily = {
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semibold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  extrabold: "PlusJakartaSans_800ExtraBold",
} as const;

export type FontWeight = keyof typeof fontFamily;

export const typography = {
  display: { fontSize: 30, lineHeight: 34, letterSpacing: -0.8 },
  h1: { fontSize: 22, lineHeight: 28, letterSpacing: -0.5 },
  h2: { fontSize: 18, lineHeight: 24, letterSpacing: -0.2 },
  h3: { fontSize: 16, lineHeight: 22, letterSpacing: -0.1 },
  body: { fontSize: 14, lineHeight: 20 },
  small: { fontSize: 12.5, lineHeight: 17 },
  tiny: { fontSize: 11, lineHeight: 14 },
} as const;

export type TypographyVariant = keyof typeof typography;
