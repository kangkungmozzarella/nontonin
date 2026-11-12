import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { MapPinLineIcon, QrCodeIcon } from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import colors from "@constants/styles/color";
import { GUTTER } from "@constants/styles/size";
import { FirstRun } from "@helpers/local-storage";
import Screen from "@components/screen";
import Text from "@components/text";
import Button from "@components/button";
import type { RootScreenProps } from "@app-types/navigation";
import { ScreenOverSeats } from "./illustrations";

// One screen built around the seat preview, the thing only Nontonin does.
// The other two facts are supporting lines, not slides of their own.
export default function OnboardingScreen({ navigation }: RootScreenProps<"Onboarding">) {
  const { t } = useTranslation();

  const finish = () => {
    FirstRun.done();
    navigation.reset({ index: 0, routes: [{ name: "Tabs" }] });
  };

  return (
    <Screen edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.body} bounces={false}>
        <ScreenOverSeats />
        <Text variant="display" weight="extrabold" style={styles.title}>
          {t("onboarding.title")}
        </Text>
        <Text color={colors.muted} style={styles.desc}>
          {t("onboarding.desc")}
        </Text>
        <View style={styles.points}>
          <View style={styles.point}>
            <MapPinLineIcon size={20} color={colors.muted} />
            <Text style={styles.pointText}>{t("onboarding.points.cinemas")}</Text>
          </View>
          <View style={styles.point}>
            <QrCodeIcon size={20} color={colors.muted} />
            <Text style={styles.pointText}>{t("onboarding.points.ticket")}</Text>
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button size="lg" label={t("onboarding.start")} onPress={finish} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flexGrow: 1, justifyContent: "center", paddingHorizontal: GUTTER + 4, paddingVertical: 24 },
  title: { marginTop: 8 },
  desc: { marginTop: 12 },
  points: { marginTop: 28, gap: 14, paddingTop: 20, borderTopWidth: 1, borderColor: colors.line },
  point: { flexDirection: "row", alignItems: "center", gap: 12 },
  pointText: { flex: 1 },
  footer: { paddingHorizontal: GUTTER, paddingBottom: 12 },
});
