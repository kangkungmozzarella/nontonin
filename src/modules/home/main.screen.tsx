import React from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import colors from "@constants/styles/color";
import { GUTTER } from "@constants/styles/size";
import { useCity } from "@hooks/use-city";
import { useLang } from "@hooks/use-lang";
import type { Lang } from "@common/api/model";
import { useCinemasNearby } from "@hooks/use-cinemas-nearby";
import { useGetFilms } from "@api-hooks/films";
import Screen from "@components/screen";
import Text from "@components/text";
import SectionHeader from "@components/section-header";
import Skeleton from "@components/skeleton";
import CinemaCard from "@modules/components/cinema-card";
import EntryPopups from "@modules/components/announcement/entry-popups";
import BannerCarousel from "./components/banner-carousel";
import FilmRail from "./components/film-rail";
import CityButton from "./components/city-button";

// "Siang" starts around 11 in Indonesian; "afternoon" starts at noon in English
function greetingKey(lang: Lang) {
  const h = new Date().getHours();
  return h < (lang === "id" ? 11 : 12) ? "morning" : h < 15 ? "afternoon" : h < 18 ? "evening" : "night";
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation("home");
  const lang = useLang();
  const { city } = useCity();
  const nowShowing = useGetFilms("now");
  const comingSoon = useGetFilms("soon");
  const nearby = useCinemasNearby(city?.id);
  const client = useQueryClient();
  const [refreshing, setRefreshing] = React.useState(false);

  const refresh = async () => {
    setRefreshing(true);
    await client.invalidateQueries();
    setRefreshing(false);
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.sel} />}
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text variant="small" color={colors.muted}>{t(`greeting.${greetingKey(lang)}`)}</Text>
            <Text variant="h1" weight="bold" style={{ marginTop: 2 }}>{t("subtitle")}</Text>
          </View>
          <CityButton />
        </View>

        <BannerCarousel />

        <FilmRail title={t("nowShowing")} films={nowShowing.data} />
        <FilmRail title={t("comingSoon")} films={comingSoon.data} />

        {city && (
          <View>
            <SectionHeader
              title={nearby.hasLocation ? t("nearby") : t("inCity", { city: city.name })}
              onSeeAll={nearby.items.length > 3 ? () => navigation.navigate("Tabs", { screen: "Cinemas" }) : undefined}
            />
            <View style={styles.cinemas}>
              {nearby.isLoading
                ? [0, 1].map((i) => <Skeleton key={i} style={{ height: 76 }} />)
                : nearby.items.slice(0, 3).map(({ cinema, distanceKm }) => (
                    <CinemaCard key={cinema.id} cinema={cinema} distanceKm={distanceKm} />
                  ))}
            </View>
          </View>
        )}
      </ScrollView>
      <EntryPopups />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 32, gap: 28 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: GUTTER, paddingTop: 8 },
  cinemas: { paddingHorizontal: GUTTER, gap: 10 },
});
