import React from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import {
  ArrowCounterClockwiseIcon,
  CaretRightIcon,
  CheckIcon,
  InfoIcon,
  MapPinIcon,
  TranslateIcon,
  TrashIcon,
  UserIcon,
  type Icon,
} from "phosphor-react-native";
import colors from "@constants/styles/color";
import { GUTTER, radius } from "@constants/styles/size";
import { APP_NAME, APP_VERSION } from "@constants/app";
import { localStorage } from "@helpers/local-storage";
import { useCity } from "@hooks/use-city";
import { useLang } from "@hooks/use-lang";
import { useBookings } from "@hooks/use-bookings";
import { LANGUAGES, setLanguage } from "@locales/index";
import Screen from "@components/screen";
import Text from "@components/text";
import PressableScale from "@components/pressable-scale";

export default function ProfileScreen() {
  const { t } = useTranslation(["account", "common"]);
  const navigation = useNavigation();
  const lang = useLang();
  const { city } = useCity();
  const { bookings, clear } = useBookings();

  const clearAll = () =>
    Alert.alert(t("profile.clearData"), t("profile.clearConfirm"), [
      { text: t("common:cancel"), style: "cancel" },
      {
        text: t("profile.clearData"),
        style: "destructive",
        onPress: async () => {
          clear();
          await localStorage.clearAll();
          navigation.reset({ index: 0, routes: [{ name: "Onboarding" }] });
        },
      },
    ]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: GUTTER, gap: 22, paddingBottom: 40 }}>
        <View style={styles.user}>
          <View style={styles.avatar}>
            <UserIcon size={26} color={colors.sel} weight="fill" />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="h2" weight="bold">{t("profile.guest")}</Text>
            <Text variant="small" color={colors.muted}>{t("profile.guestDesc")}</Text>
          </View>
          <View style={styles.count}>
            <Text weight="bold" color={colors.sel}>{bookings.length}</Text>
          </View>
        </View>

        <Group>
          <Item icon={MapPinIcon} label={t("profile.city")} value={city?.name} onPress={() => navigation.navigate("CityPicker")} />
        </Group>

        <View style={{ gap: 8 }}>
          <View style={styles.groupTitle}>
            <TranslateIcon size={16} color={colors.muted} />
            <Text variant="small" weight="semibold" color={colors.muted}>{t("profile.language")}</Text>
          </View>
          <Group>
            {LANGUAGES.map((l) => (
              <Item
                key={l.code}
                label={l.label}
                onPress={() => setLanguage(l.code)}
                trailing={l.code === lang ? <CheckIcon size={18} color={colors.sel} weight="bold" /> : <View />}
              />
            ))}
          </Group>
        </View>

        <Group>
          <Item icon={InfoIcon} label={t("profile.about")} onPress={() => navigation.navigate("About")} />
          <Item
            icon={ArrowCounterClockwiseIcon}
            label={t("profile.replayOnboarding")}
            onPress={() => navigation.navigate("Onboarding")}
          />
          <Item icon={TrashIcon} label={t("profile.clearData")} danger onPress={clearAll} trailing={<View />} />
        </Group>

        <Text variant="tiny" color={colors.dim} align="center">
          {APP_NAME} · {t("profile.version", { v: APP_VERSION })}
        </Text>
      </ScrollView>
    </Screen>
  );
}

function Group({ children }: { children: React.ReactNode }) {
  const items = React.Children.toArray(children);
  return (
    <View style={styles.group}>
      {items.map((c, i) => (
        <View key={i} style={i > 0 && styles.sep}>{c}</View>
      ))}
    </View>
  );
}

function Item({
  icon: I,
  label,
  value,
  onPress,
  danger,
  trailing,
}: {
  icon?: Icon;
  label: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
  trailing?: React.ReactNode;
}) {
  return (
    <PressableScale scaleTo={0.99} onPress={onPress} style={styles.item} accessibilityRole="button">
      {I && <I size={20} color={danger ? colors.danger : colors.text} />}
      <Text weight="medium" color={danger ? colors.danger : colors.text} style={{ flex: 1 }}>{label}</Text>
      {!!value && <Text variant="small" color={colors.muted}>{value}</Text>}
      {trailing ?? <CaretRightIcon size={16} color={colors.dim} />}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  user: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
  },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.selSoft, alignItems: "center", justifyContent: "center" },
  count: { minWidth: 34, height: 34, borderRadius: 17, paddingHorizontal: 8, backgroundColor: colors.selSoft, alignItems: "center", justifyContent: "center" },
  groupTitle: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 4 },
  group: { borderRadius: radius.lg, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line, overflow: "hidden" },
  sep: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  item: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 15 },
});
