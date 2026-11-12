import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import colors from "@constants/styles/color";
import { GUTTER } from "@constants/styles/size";
import Text from "@components/text";

interface Props {
  title: string;
  onSeeAll?: () => void;
  right?: React.ReactNode;
}

export default function SectionHeader({ title, onSeeAll, right }: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.row}>
      <Text variant="h2" weight="bold" style={{ flex: 1 }}>{title}</Text>
      {right}
      {onSeeAll && (
        <Pressable onPress={onSeeAll} hitSlop={8} accessibilityRole="button">
          <Text variant="small" weight="semibold" color={colors.sel}>{t("seeAll")}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: GUTTER, marginBottom: 12, gap: 12 },
});
