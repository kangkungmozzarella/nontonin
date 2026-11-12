import React from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import colors from "@constants/styles/color";
import { radius } from "@constants/styles/size";
import PressableScale from "@components/pressable-scale";

interface Props {
  active?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  label?: string;
}

// Selectable pill used for dates, showtimes and filters
export default function Chip({ active, disabled, onPress, children, style, label }: Props) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!active, disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      haptic
      style={[styles.base, active && styles.active, disabled && styles.disabled, style]}
    >
      {children}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
    paddingHorizontal: 14,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  active: { backgroundColor: colors.sel, borderColor: colors.sel },
  disabled: { opacity: 0.35 },
});
