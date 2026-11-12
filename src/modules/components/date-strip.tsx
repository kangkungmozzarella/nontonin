import React from "react";
import { ScrollView, View } from "react-native";
import { addDays, format } from "date-fns";
import { useTranslation } from "react-i18next";
import colors from "@constants/styles/color";
import { GUTTER } from "@constants/styles/size";
import { formatDate } from "@helpers/format";
import { useLang } from "@hooks/use-lang";
import Text from "@components/text";
import Chip from "@components/chip";

export const DAYS_AHEAD = 7;

export function upcomingDays(n = DAYS_AHEAD) {
  const today = new Date();
  return Array.from({ length: n }, (_, i) => format(addDays(today, i), "yyyy-MM-dd"));
}

export default function DateStrip({ value, onChange }: { value: string; onChange: (d: string) => void }) {
  const { t } = useTranslation();
  const lang = useLang();
  const days = React.useMemo(() => upcomingDays(), []);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: GUTTER, gap: 8 }}>
      {days.map((d, i) => {
        const active = d === value;
        const top = i === 0 ? t("today") : i === 1 ? t("tomorrow") : formatDate(d, "EEE", lang);
        return (
          <Chip key={d} active={active} onPress={() => onChange(d)} style={{ minWidth: 64, paddingVertical: 8 }} label={formatDate(d, "EEEE d MMMM", lang)}>
            <View style={{ alignItems: "center" }}>
              <Text variant="tiny" weight="medium" color={active ? colors.selInk : colors.muted}>{top}</Text>
              <Text variant="h3" weight="bold" color={active ? colors.selInk : colors.text}>{formatDate(d, "d", lang)}</Text>
              <Text variant="tiny" color={active ? colors.selInk : colors.muted}>{formatDate(d, "MMM", lang)}</Text>
            </View>
          </Chip>
        );
      })}
    </ScrollView>
  );
}
