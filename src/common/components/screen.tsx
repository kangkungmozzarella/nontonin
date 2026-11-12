import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Edge, SafeAreaView } from "react-native-safe-area-context";
import colors from "@constants/styles/color";

interface Props {
  children: React.ReactNode;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
}

// Full-screen container with the app background and safe-area padding
export default function Screen({ children, edges = ["top"], style }: Props) {
  return (
    <SafeAreaView edges={edges} style={[styles.root, style]}>
      <View style={styles.fill}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  fill: { flex: 1 },
});
