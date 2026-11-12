import React from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { useAppDimensions } from "@hooks/use-app-dimensions";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import colors from "@constants/styles/color";
import { GUTTER } from "@constants/styles/size";
import { FirstRun } from "@helpers/local-storage";
import Screen from "@components/screen";
import Text from "@components/text";
import Button from "@components/button";
import type { RootScreenProps } from "@app-types/navigation";
import { PosterFan, ScreenOverSeats, TicketCard } from "./illustrations";

const ART = [PosterFan, ScreenOverSeats, TicketCard];

export default function OnboardingScreen({ navigation }: RootScreenProps<"Onboarding">) {
  const { t } = useTranslation();
  const { width } = useAppDimensions();
  const slides = t("onboarding.slides", { returnObjects: true }) as { title: string; desc: string }[];
  const list = React.useRef<FlatList>(null);
  const [index, setIndex] = React.useState(0);
  const last = index === slides.length - 1;

  const finish = () => {
    FirstRun.done();
    navigation.reset({ index: 0, routes: [{ name: "Tabs" }] });
  };

  // FlatList requires this callback to keep the same identity
  const onViewable = React.useCallback(({ viewableItems }: { viewableItems: { index?: number | null }[] }) => {
    const i = viewableItems[0]?.index;
    if (i != null) setIndex(i);
  }, []);

  return (
    <Screen edges={["top", "bottom"]}>
      <View style={styles.top}>
        {!last && (
          <Pressable onPress={finish} hitSlop={10} accessibilityRole="button">
            <Text weight="medium" color={colors.muted}>{t("onboarding.skip")}</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        ref={list}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        renderItem={({ item, index: i }) => {
          const Art = ART[i];
          return (
            <View style={[styles.slide, { width }]}>
              <Art />
              <Text variant="display" weight="bold" align="center" style={styles.title}>{item.title}</Text>
              <Text color={colors.muted} align="center" style={styles.desc}>{item.desc}</Text>
            </View>
          );
        }}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <Dot key={i} active={i === index} />
          ))}
        </View>
        <Button
          size="lg"
          label={last ? t("onboarding.start") : t("next")}
          onPress={() => (last ? finish() : list.current?.scrollToIndex({ index: index + 1 }))}
        />
      </View>
    </Screen>
  );
}

function Dot({ active }: { active: boolean }) {
  const style = useAnimatedStyle(() => ({
    width: withTiming(active ? 22 : 7),
    backgroundColor: withTiming(active ? colors.sel : colors.seat),
  }));
  return <Animated.View style={[styles.dot, style]} />;
}

const styles = StyleSheet.create({
  top: { height: 44, alignItems: "flex-end", justifyContent: "center", paddingHorizontal: GUTTER },
  slide: { paddingHorizontal: 28, justifyContent: "center" },
  title: { marginTop: 28 },
  desc: { marginTop: 12, maxWidth: 340, alignSelf: "center" },
  footer: { paddingHorizontal: GUTTER, paddingBottom: 12, gap: 22 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6 },
  dot: { height: 7, borderRadius: 4 },
});
