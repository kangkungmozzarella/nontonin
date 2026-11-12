import React from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import colors from "@constants/styles/color";
import { radius } from "@constants/styles/size";
import PressableScale from "@components/pressable-scale";

interface Props {
  onPress?: () => void;
  children: React.ReactNode;
  label: string; // accessibility label, icons have no text
  style?: StyleProp<ViewStyle>;
  size?: number;
  glass?: boolean;
}

export default function IconButton({ onPress, children, label, style, size = 40, glass }: Props) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      onPress={onPress}
      style={[styles.base, { width: size, height: size }, glass && styles.glass, style]}
    >
      {children}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  glass: { backgroundColor: "rgba(20,20,23,0.72)", borderColor: "rgba(255,255,255,0.08)" },
});
