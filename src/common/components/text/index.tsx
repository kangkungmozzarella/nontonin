import React from "react";
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from "react-native";
import colors from "@constants/styles/color";
import { fontFamily, FontWeight, typography, TypographyVariant } from "@constants/styles/typography";

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  weight?: FontWeight;
  color?: string;
  align?: "left" | "center" | "right";
}

export default function Text({
  variant = "body",
  weight = "regular",
  color = colors.text,
  align,
  style,
  ...rest
}: TextProps) {
  return (
    <RNText
      maxFontSizeMultiplier={1.4}
      {...rest}
      style={[styles.base, typography[variant], { fontFamily: fontFamily[weight], color, textAlign: align }, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: { includeFontPadding: false },
});
