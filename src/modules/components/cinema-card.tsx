import React from "react";
import { StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { CaretRightIcon, MapPinIcon } from "phosphor-react-native";
import colors from "@constants/styles/color";
import { radius } from "@constants/styles/size";
import { formatDistance } from "@helpers/format";
import Text from "@components/text";
import PressableScale from "@components/pressable-scale";
import type { Cinema } from "@api-hooks/cinemas/model";

export default function CinemaCard({ cinema, distanceKm }: { cinema: Cinema; distanceKm?: number | null }) {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const premiere = cinema.tier === "premiere";
  return (
    <PressableScale
      accessibilityRole="button"
      onPress={() => navigation.navigate("CinemaDetail", { cinemaId: cinema.id })}
      style={styles.card}
      scaleTo={0.98}
    >
      <View style={styles.icon}>
        <MapPinIcon size={20} color={premiere ? colors.warm : colors.sel} weight="fill" />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <View style={styles.titleRow}>
          <Text weight="semibold" numberOfLines={1} style={{ flexShrink: 1 }}>{cinema.name}</Text>
          {premiere && (
            <View style={styles.tier}>
              <Text variant="tiny" weight="bold" color={colors.warm}>{t("tier.premiere")}</Text>
            </View>
          )}
        </View>
        <Text variant="small" color={colors.muted} numberOfLines={1}>{cinema.address}</Text>
        <Text variant="small" color={colors.dim}>
          {[distanceKm != null ? formatDistance(distanceKm) : null, t("studios", { count: cinema.studios })].filter(Boolean).join(" · ")}
        </Text>
      </View>
      <CaretRightIcon size={16} color={colors.dim} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.panel2,
    alignItems: "center",
    justifyContent: "center",
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  tier: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: "rgba(255,184,107,0.12)" },
});
