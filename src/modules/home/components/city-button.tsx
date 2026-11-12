import React from "react";
import { StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { CaretDownIcon, MapPinIcon } from "phosphor-react-native";
import colors from "@constants/styles/color";
import { radius } from "@constants/styles/size";
import { useCity } from "@hooks/use-city";
import Text from "@components/text";
import PressableScale from "@components/pressable-scale";

export default function CityButton() {
  const { city } = useCity();
  const navigation = useNavigation();
  const { t } = useTranslation();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={t("city.title")}
      onPress={() => navigation.navigate("CityPicker")}
      style={styles.btn}
    >
      <MapPinIcon size={15} color={colors.text} weight="fill" />
      <Text variant="small" weight="semibold" numberOfLines={1} style={{ maxWidth: 130 }}>
        {city?.name ?? t("city.title")}
      </Text>
      <CaretDownIcon size={12} color={colors.muted} weight="bold" />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
  },
});
