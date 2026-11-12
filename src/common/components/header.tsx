import React from "react";
import { StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { CaretLeftIcon } from "phosphor-react-native";
import colors from "@constants/styles/color";
import { GUTTER } from "@constants/styles/size";
import Text from "@components/text";
import IconButton from "@components/icon-button";

interface Props {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  onBack?: () => void;
  hideBack?: boolean;
}

export default function Header({ title, subtitle, right, onBack, hideBack }: Props) {
  const navigation = useNavigation();
  const { t } = useTranslation();
  return (
    <View style={styles.row}>
      {!hideBack && (
        <IconButton label={t("back")} onPress={onBack ?? (() => navigation.goBack())}>
          <CaretLeftIcon size={18} color={colors.text} weight="bold" />
        </IconButton>
      )}
      <View style={styles.titles}>
        {!!title && (
          <Text variant="h3" weight="semibold" numberOfLines={1}>
            {title}
          </Text>
        )}
        {!!subtitle && (
          <Text variant="small" color={colors.muted} numberOfLines={1} style={{ marginTop: 2 }}>
            {subtitle}
          </Text>
        )}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: GUTTER, paddingVertical: 10 },
  titles: { flex: 1 },
});
