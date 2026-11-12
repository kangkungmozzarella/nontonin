import React from "react";
import { StyleSheet, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import colors from "@constants/styles/color";
import { APP_NAME } from "@constants/app";
import { BrandMark } from "@constants/assets";
import Text from "@components/text";

// Picks up exactly where the native splash leaves off (same mark, same size,
// same background), then lifts the mark, reveals the name and fades out.
export default function AnimatedSplashScreen({ onFinish }: { onFinish: () => void }) {
  const lift = useSharedValue(0);
  const name = useSharedValue(0);
  const glow = useSharedValue(0);
  const out = useSharedValue(1);

  const started = React.useRef(false);
  const start = React.useCallback(() => {
    if (started.current) return; // onLayout can fire more than once
    started.current = true;
    SplashScreen.hideAsync().catch(() => {});
    const ease = Easing.bezier(0.2, 0.8, 0.2, 1);
    glow.set(withSequence(withTiming(1, { duration: 500 }), withTiming(0.6, { duration: 400 })));
    lift.set(withDelay(200, withTiming(1, { duration: 650, easing: ease })));
    name.set(withDelay(450, withTiming(1, { duration: 500, easing: ease })));
    out.set(withDelay(1500, withTiming(0, { duration: 380 }, (done) => {
      if (done) scheduleOnRN(onFinish);
    })));
  }, [glow, lift, name, out, onFinish]);

  const markStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -52 * lift.value }, { scale: 1 - 0.12 * lift.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value * 0.55 }));
  const nameStyle = useAnimatedStyle(() => ({
    opacity: name.value,
    transform: [{ translateY: 72 - 12 * name.value }],
  }));
  const rootStyle = useAnimatedStyle(() => ({ opacity: out.value }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, rootStyle]} onLayout={start} pointerEvents="none">
      <Animated.View style={[styles.glow, glowStyle]} />
      <Animated.Image source={BrandMark} style={[styles.mark, markStyle]} resizeMode="contain" />
      <Animated.View style={[styles.nameWrap, nameStyle]}>
        <Text variant="display" weight="extrabold" align="center" style={styles.name}>
          {APP_NAME}
        </Text>
      </Animated.View>
      <View />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.bg, alignItems: "center", justifyContent: "center", zIndex: 100 },
  mark: { width: 180, height: 180 },
  glow: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(200,16,46,0.10)",
  },
  nameWrap: { position: "absolute" },
  name: { letterSpacing: -0.5, fontSize: 30 },
});
