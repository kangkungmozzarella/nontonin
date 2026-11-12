import React from "react";
import { FlatList, StyleSheet, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { CheckIcon, MagnifyingGlassIcon, NavigationArrowIcon, XIcon } from "phosphor-react-native";
import colors from "@constants/styles/color";
import { GUTTER, radius } from "@constants/styles/size";
import { fontFamily } from "@constants/styles/typography";
import { CINEMAS } from "@common/api/mock/data";
import { haversineKm, formatDistance } from "@helpers/format";
import { useCity } from "@hooks/use-city";
import { nearestCity, useUserLocation } from "@hooks/use-user-location";
import { useGetCities } from "@api-hooks/cities";
import Screen from "@components/screen";
import Text from "@components/text";
import IconButton from "@components/icon-button";
import PressableScale from "@components/pressable-scale";
import StateView from "@components/state-view";
import { useToast } from "@components/toast";
import type { RootScreenProps } from "@app-types/navigation";

export default function CityPickerScreen({ navigation }: RootScreenProps<"CityPicker">) {
  const { t } = useTranslation();
  const { city, setCityId } = useCity();
  const { coords, request } = useUserLocation();
  const { data, isLoading, error, refetch } = useGetCities();
  const toast = useToast();
  const [q, setQ] = React.useState("");
  const [locating, setLocating] = React.useState(false);

  const pick = (id: string) => {
    setCityId(id);
    navigation.goBack();
  };

  const useMyLocation = async () => {
    setLocating(true);
    const c = await request();
    setLocating(false);
    if (!c) return toast(t("location.failed"));
    const near = nearestCity(c);
    toast(t("location.detected", { city: near.name }));
    pick(near.id);
  };

  const list = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    const filtered = (data ?? []).filter(
      (c) => !term || c.name.toLowerCase().includes(term) || c.province.toLowerCase().includes(term),
    );
    return coords ? [...filtered].sort((a, b) => haversineKm(coords, a) - haversineKm(coords, b)) : filtered;
  }, [data, q, coords]);

  const nearestId = coords && data ? nearestCity(coords).id : null;

  return (
    <Screen edges={["top", "bottom"]}>
      <View style={styles.head}>
        <Text variant="h1" weight="bold" style={{ flex: 1 }}>{t("city.title")}</Text>
        {city && (
          <IconButton label={t("close")} onPress={() => navigation.goBack()}>
            <XIcon size={18} color={colors.text} weight="bold" />
          </IconButton>
        )}
      </View>

      <View style={styles.search}>
        <MagnifyingGlassIcon size={18} color={colors.muted} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder={t("city.search")}
          placeholderTextColor={colors.dim}
          style={styles.input}
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>

      <PressableScale onPress={useMyLocation} disabled={locating} style={styles.locate} accessibilityRole="button">
        <NavigationArrowIcon size={18} color={colors.sel} weight="fill" />
        <Text weight="semibold" color={colors.sel}>{locating ? t("city.detecting") : t("city.useLocation")}</Text>
      </PressableScale>

      {isLoading || error ? (
        <StateView loading={isLoading} error={error} onRetry={refetch} />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(c) => c.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: GUTTER, paddingBottom: 24 }}
          ListEmptyComponent={<StateView compact empty={{ title: t("city.noResult") }} />}
          renderItem={({ item }) => {
            const count = CINEMAS.filter((c) => c.cityId === item.id).length;
            const active = item.id === city?.id;
            return (
              <PressableScale scaleTo={0.98} onPress={() => pick(item.id)} style={styles.row} accessibilityRole="button" accessibilityState={{ selected: active }}>
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text weight="semibold" color={active ? colors.sel : colors.text}>{item.name}</Text>
                    {item.id === nearestId && (
                      <View style={styles.badge}>
                        <Text variant="tiny" weight="bold" color={colors.sel}>{t("city.nearest")}</Text>
                      </View>
                    )}
                  </View>
                  <Text variant="small" color={colors.muted}>
                    {[item.province, t("city.cinemas", { count }), coords ? formatDistance(haversineKm(coords, item)) : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </Text>
                </View>
                {active && <CheckIcon size={18} color={colors.sel} weight="bold" />}
              </PressableScale>
            );
          }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", paddingHorizontal: GUTTER, paddingTop: 12, paddingBottom: 14 },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: GUTTER,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
  },
  input: { flex: 1, color: colors.text, fontFamily: fontFamily.regular, fontSize: 15 },
  locate: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: GUTTER, paddingVertical: 16 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: colors.selSoft },
});
