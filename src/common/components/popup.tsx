import React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeOut, ZoomIn } from "react-native-reanimated";
import colors from "@constants/styles/color";
import { radius } from "@constants/styles/size";

interface Props {
  visible: boolean;
  onRequestClose: () => void;
  children: React.ReactNode;
  dismissOnBackdrop?: boolean;
}

// Centered modal card used for the entry popups (location, promo)
export default function Popup({ visible, onRequestClose, children, dismissOnBackdrop = true }: Props) {
  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onRequestClose}>
      {visible && (
        <Animated.View entering={FadeIn.duration(220)} exiting={FadeOut.duration(160)} style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={dismissOnBackdrop ? onRequestClose : undefined} />
          <Animated.View entering={ZoomIn.springify().damping(18).mass(0.7)} style={styles.card}>
            <View>{children}</View>
          </Animated.View>
        </Animated.View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    borderRadius: radius.xl,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
  },
});
