import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { NavigationArrowIcon } from "phosphor-react-native";
import colors from "@constants/styles/color";
import { GUTTER, radius } from "@constants/styles/size";
import { useCity } from "@hooks/use-city";
import { useUserLocation } from "@hooks/use-user-location";
import { useCinemasNearby } from "@hooks/use-cinemas-nearby";
import Screen from "@components/screen";
import Text from "@components/text";
import StateView from "@components/state-view";
import PressableScale from "@components/pressable-scale";
import CinemaCard from "@modules/components/cinema-card";
import CityButton from "@modules/home/components/city-button";

export default function CinemasScreen() {
  const { t } = useTranslation("home");
  const { city } = useCity();
  const { status, request } = useUserLocation();
  const { items, isLoading, error, refetch, hasLocation } = useCinemasNearby(city?.id);

  return (
    <Screen>
      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <Text variant="h1" weight="bold">{t("cinemas.title")}</Text>
          {city && !isLoading && (
            <Text variant="small" color={colors.muted} style={{ marginTop: 2 }}>
              {t("cinemas.subtitle", { count: items.length, city: city.name })}
            </Text>
          )}
        </View>
        <CityButton />
      </View>

      {isLoading || error ? (
        <StateView loading={isLoading} error={error} onRetry={refetch} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(x) => x.cinema.id}
          contentContainerStyle={{ paddingHorizontal: GUTTER, gap: 10, paddingBottom: 24 }}
          ListHeaderComponent={
            !hasLocation && status !== "denied" ? (
              <PressableScale onPress={request} style={styles.hint} accessibilityRole="button">
                <NavigationArrowIcon size={18} color={colors.text} weight="fill" />
                <Text variant="small" color={colors.text} style={{ flex: 1 }}>{t("cinemas.enableLocation")}</Text>
              </PressableScale>
            ) : undefined
          }
          renderItem={({ item }) => <CinemaCard cinema={item.cinema} distanceKm={item.distanceKm} />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: GUTTER, paddingTop: 8, paddingBottom: 16 },
  hint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.panel2,
    marginBottom: 4,
  },
});
