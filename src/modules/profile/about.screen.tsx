import React from "react";
import { Image, Linking, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { ArrowSquareOutIcon, SparkleIcon } from "phosphor-react-native";
import colors from "@constants/styles/color";
import { GUTTER, radius } from "@constants/styles/size";
import { APP_NAME, APP_VERSION, DESIGN_CREDIT } from "@constants/app";
import { BrandMark } from "@constants/assets";
import { catalog } from "@common/api/catalog";
import Screen from "@components/screen";
import Header from "@components/header";
import Text from "@components/text";
import Button from "@components/button";

export default function AboutScreen() {
  const { t } = useTranslation(["account", "common"]);
  return (
    <Screen edges={["top", "bottom"]}>
      <Header title={t("about.title")} />
      <ScrollView contentContainerStyle={{ padding: GUTTER, gap: 20, paddingBottom: 40 }}>
        <View style={styles.brand}>
          <View style={styles.iconWrap}>
            <Image source={BrandMark} style={{ width: 84, height: 84 }} />
          </View>
          <Text variant="display" weight="extrabold" style={{ letterSpacing: 3 }}>{APP_NAME}</Text>
          <Text variant="small" color={colors.dim}>{t("profile.version", { v: APP_VERSION })}</Text>
        </View>

        <Text color={colors.muted}>{t("about.desc")}</Text>

        <View style={styles.credit}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <SparkleIcon size={18} color={colors.sel} weight="fill" />
            <Text weight="semibold" color={colors.sel}>{t("about.creditTitle")}</Text>
          </View>
          <Text>{t("about.credit", { concept: DESIGN_CREDIT.concept, designer: DESIGN_CREDIT.designer })}</Text>
          {!!DESIGN_CREDIT.url && (
            <Button
              variant="secondary"
              size="sm"
              label={t("about.openOriginal")}
              icon={<ArrowSquareOutIcon size={14} color={colors.text} />}
              onPress={() => Linking.openURL(DESIGN_CREDIT.url)}
              style={{ alignSelf: "flex-start", marginTop: 4 }}
            />
          )}
        </View>

        <View style={{ gap: 6 }}>
          {catalog.usesTmdb && (
            <Pressable onPress={() => Linking.openURL("https://www.themoviedb.org")} accessibilityRole="link" style={styles.tmdb}>
              <Text variant="tiny" weight="extrabold" color="#01B4E4" style={{ letterSpacing: 1 }}>TMDB</Text>
              <Text variant="small" color={colors.muted} style={{ flex: 1 }}>{t("about.tmdb")}</Text>
            </Pressable>
          )}
          <Text variant="small" color={colors.dim}>{catalog.usesTmdb ? t("about.disclaimerTmdb") : t("about.disclaimer")}</Text>
          <Text variant="small" color={colors.dim}>{t("about.builtWith")}</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { alignItems: "center", gap: 6, paddingVertical: 12 },
  iconWrap: {
    width: 108,
    height: 108,
    borderRadius: 28,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  credit: { gap: 8, padding: 16, borderRadius: radius.lg, backgroundColor: colors.selSoft },
  tmdb: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 6,
  },
});
