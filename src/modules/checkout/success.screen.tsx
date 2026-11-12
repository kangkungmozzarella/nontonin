import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, { ZoomIn, FadeInDown } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import { CheckIcon } from "phosphor-react-native";
import colors from "@constants/styles/color";
import { GUTTER } from "@constants/styles/size";
import Screen from "@components/screen";
import Text from "@components/text";
import Button from "@components/button";
import type { RootScreenProps } from "@app-types/navigation";

export default function PaymentSuccessScreen({ route, navigation }: RootScreenProps<"PaymentSuccess">) {
  const { bookingId } = route.params;
  const { t } = useTranslation("booking");

  React.useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, []);

  return (
    <Screen edges={["top", "bottom"]}>
      <View style={styles.center}>
        <Animated.View entering={ZoomIn.springify().damping(12)} style={styles.badge}>
          <CheckIcon size={44} color={colors.onAccent} weight="bold" />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(200)} style={{ gap: 8, alignItems: "center" }}>
          <Text variant="display" weight="bold" align="center">{t("checkout.success")}</Text>
          <Text color={colors.muted} align="center">{t("checkout.successDesc")}</Text>
        </Animated.View>
      </View>
      <View style={styles.actions}>
        <Button size="lg" label={t("checkout.viewTicket")} onPress={() => navigation.replace("TicketDetail", { bookingId })} />
        <Button
          size="lg"
          variant="ghost"
          label={t("checkout.backHome")}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: "Tabs", params: { screen: "Home" } }] })}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 24, paddingHorizontal: 32 },
  badge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.black,
    shadowOpacity: 0.6,
    shadowRadius: 30,
  },
  actions: { paddingHorizontal: GUTTER, gap: 8, paddingBottom: 12 },
});
