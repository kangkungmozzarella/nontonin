import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import colors from "@constants/styles/color";
import Text from "@components/text";

// Curved screen glow above the seat map, same drawing as the web prototype
export default function ScreenArc({ label }: { label: string }) {
  return (
    <View style={styles.box} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width="100%" height="100%" viewBox="0 0 480 58" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="sg" x1="0" x2="1" y1="0" y2="0">
            <Stop offset="0" stopColor="#7cf2b4" stopOpacity="0" />
            <Stop offset="0.5" stopColor="#e9e6df" stopOpacity="0.9" />
            <Stop offset="1" stopColor="#7cf2b4" stopOpacity="0" />
          </LinearGradient>
          <LinearGradient id="sglow" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#e9e6df" stopOpacity="0.16" />
            <Stop offset="1" stopColor="#e9e6df" stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Path d="M30 26 Q240 -2 450 26 L450 58 Q240 30 30 58 Z" fill="url(#sglow)" />
        <Path d="M30 26 Q240 -2 450 26" fill="none" stroke="url(#sg)" strokeWidth={2.5} strokeLinecap="round" />
      </Svg>
      <Text variant="tiny" color={colors.muted} align="center" style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { height: 58, width: "100%", marginBottom: 14 },
  label: { position: "absolute", left: 0, right: 0, top: 30, letterSpacing: 4.5, fontSize: 10 },
});
