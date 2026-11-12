import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import colors from "@constants/styles/color";
import Text from "@components/text";
import Button from "@components/button";

interface Props {
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  empty?: { title: string; desc?: string; icon?: React.ReactNode; action?: { label: string; onPress: () => void } };
  compact?: boolean;
}

// Loading, error and empty states share one layout so screens stay consistent
export default function StateView({ loading, error, onRetry, empty, compact }: Props) {
  const { t } = useTranslation();
  return (
    <View style={[styles.box, compact && styles.compact]}>
      {loading ? (
        <ActivityIndicator color={colors.muted} />
      ) : error ? (
        <>
          <Text variant="h3" weight="semibold" align="center">{t("errorTitle")}</Text>
          <Text color={colors.muted} align="center">{t("errorDesc")}</Text>
          {onRetry && <Button label={t("retry")} variant="secondary" size="sm" onPress={onRetry} style={{ marginTop: 8 }} />}
        </>
      ) : empty ? (
        <>
          {empty.icon}
          <Text variant="h3" weight="semibold" align="center">{empty.title}</Text>
          {!!empty.desc && <Text color={colors.muted} align="center">{empty.desc}</Text>}
          {empty.action && <Button label={empty.action.label} size="sm" onPress={empty.action.onPress} style={{ marginTop: 8 }} />}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 32 },
  compact: { flex: 0, paddingVertical: 28 },
});
