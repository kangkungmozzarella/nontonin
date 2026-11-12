import React from "react";
import { ActivityIndicator, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import colors from "@constants/styles/color";
import { radius } from "@constants/styles/size";
import Text from "@components/text";
import PressableScale from "@components/pressable-scale";

type Variant = "primary" | "secondary" | "ghost" | "danger";

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: "md" | "lg" | "sm";
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  flex?: boolean;
}

const palette: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.sel, fg: colors.selInk, border: colors.sel },
  secondary: { bg: colors.panel2, fg: colors.text, border: colors.line },
  ghost: { bg: colors.transparent, fg: colors.text, border: colors.line },
  danger: { bg: colors.transparent, fg: colors.danger, border: "rgba(255,143,143,0.35)" },
};

const heights = { sm: 36, md: 46, lg: 54 };

export default function Button({ label, onPress, variant = "primary", size = "md", icon, loading, disabled, style, flex }: ButtonProps) {
  const p = palette[variant];
  const off = disabled || loading;
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ disabled: !!off, busy: !!loading }}
      disabled={off}
      onPress={onPress}
      haptic={variant === "primary"}
      style={[
        styles.base,
        { height: heights[size], backgroundColor: p.bg, borderColor: p.border, opacity: disabled ? 0.45 : 1 },
        flex && { flex: 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={styles.row}>
          {icon}
          <Text weight="semibold" variant={size === "sm" ? "small" : "body"} color={p.fg} numberOfLines={1}>
            {label}
          </Text>
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
});
