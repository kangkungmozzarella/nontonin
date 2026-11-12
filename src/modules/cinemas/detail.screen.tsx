import React from "react";
import { Image, Linking, Platform, ScrollView, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { MapPinIcon, NavigationArrowIcon } from "phosphor-react-native";
import colors from "@constants/styles/color";
import { GUTTER, radius } from "@constants/styles/size";
import { FilmArt } from "@constants/assets";
import { formatDistance, formatDuration, haversineKm } from "@helpers/format";
import { useLang } from "@hooks/use-lang";
import { useUserLocation } from "@hooks/use-user-location";
import { useGetCinema } from "@api-hooks/cinemas";
import { useGetCinemaSchedule } from "@api-hooks/showtimes";
import Screen from "@components/screen";
import Header from "@components/header";
import Text from "@components/text";
import Button from "@components/button";
import StateView from "@components/state-view";
import PressableScale from "@components/pressable-scale";
import DateStrip, { upcomingDays } from "@modules/components/date-strip";
import ShowtimeChips from "@modules/components/showtime-chips";
import type { RootScreenProps } from "@app-types/navigation";

function openMaps(lat: number, lng: number, label: string) {
  const q = encodeURIComponent(label);
  const url = Platform.OS === "ios" ? `maps:0,0?q=${q}&ll=${lat},${lng}` : `geo:${lat},${lng}?q=${lat},${lng}(${q})`;
  Linking.openURL(url).catch(() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`));
}

export default function CinemaDetailScreen({ route, navigation }: RootScreenProps<"CinemaDetail">) {
  const { cinemaId } = route.params;
  const { t } = useTranslation(["home", "common"]);
  const lang = useLang();
  const { coords } = useUserLocation();
  const [date, setDate] = React.useState(() => upcomingDays()[0]);
  const cinema = useGetCinema(cinemaId);
  const schedule = useGetCinemaSchedule(cinemaId, date);

  if (!cinema.data) {
    return (
      <Screen>
        <Header />
        <StateView loading={cinema.isLoading} error={cinema.error} onRetry={cinema.refetch} />
      </Screen>
    );
  }
  const c = cinema.data;

  return (
    <Screen>
      <Header title={c.name} subtitle={t(`common:tier.${c.tier}`)} />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.info}>
          <View style={styles.addr}>
            <MapPinIcon size={18} color={colors.muted} />
            <Text color={colors.muted} style={{ flex: 1 }}>
              {c.address}
              {coords ? ` · ${formatDistance(haversineKm(coords, c))}` : ""}
            </Text>
          </View>
          <Button
            variant="secondary"
            size="sm"
            label={t("cinemas.directions")}
            icon={<NavigationArrowIcon size={14} color={colors.text} weight="fill" />}
            onPress={() => openMaps(c.lat, c.lng, c.name)}
            style={{ alignSelf: "flex-start" }}
          />
        </View>

        <DateStrip value={date} onChange={setDate} />

        <Text variant="h2" weight="bold" style={styles.section}>{t("cinemas.playing")}</Text>
        {schedule.isLoading || schedule.error ? (
          <StateView compact loading={schedule.isLoading} error={schedule.error} onRetry={schedule.refetch} />
        ) : !schedule.data?.length ? (
          <StateView compact empty={{ title: t("cinemas.nothing") }} />
        ) : (
          <View style={{ gap: 12, paddingHorizontal: GUTTER }}>
            {schedule.data.map(({ film, showtimes }) => (
              <View key={film.id} style={styles.filmCard}>
                <PressableScale
                  style={styles.filmRow}
                  onPress={() => navigation.navigate("FilmDetail", { filmId: film.id })}
                  accessibilityRole="button"
                >
                  <Image source={FilmArt[film.id].poster} style={styles.thumb} />
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text weight="semibold" variant="h3">{film.title}</Text>
                    <Text variant="small" color={colors.muted}>
                      {[film.rating, formatDuration(film.duration, lang), t(`common:studio`, { n: showtimes[0].studio })].join(" · ")}
                    </Text>
                  </View>
                </PressableScale>
                <ShowtimeChips showtimes={showtimes} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  info: { paddingHorizontal: GUTTER, gap: 12, paddingBottom: 20 },
  addr: { flexDirection: "row", gap: 8 },
  section: { paddingHorizontal: GUTTER, marginTop: 24, marginBottom: 12 },
  filmCard: { padding: 14, gap: 14, borderRadius: radius.lg, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line },
  filmRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  thumb: { width: 44, height: 66, borderRadius: 8 },
});
