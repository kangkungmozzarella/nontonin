import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { CaretLeftIcon, ClockIcon, MapPinIcon, StarIcon } from "phosphor-react-native";
import colors from "@constants/styles/color";
import { GUTTER, radius } from "@constants/styles/size";
import { FilmArt } from "@constants/assets";
import { formatDate, formatDuration } from "@helpers/format";
import { useLang } from "@hooks/use-lang";
import { useCity } from "@hooks/use-city";
import { useGetFilm } from "@api-hooks/films";
import { useGetFilmSchedule } from "@api-hooks/showtimes";
import Text from "@components/text";
import IconButton from "@components/icon-button";
import StateView from "@components/state-view";
import Screen from "@components/screen";
import Header from "@components/header";
import Skeleton from "@components/skeleton";
import DateStrip, { upcomingDays } from "@modules/components/date-strip";
import ShowtimeChips from "@modules/components/showtime-chips";
import type { RootScreenProps } from "@app-types/navigation";

export default function FilmDetailScreen({ route, navigation }: RootScreenProps<"FilmDetail">) {
  const { filmId } = route.params;
  const { t } = useTranslation(["booking", "common"]);
  const lang = useLang();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { city } = useCity();
  const film = useGetFilm(filmId);
  const [date, setDate] = React.useState(() => upcomingDays()[0]);
  const [expanded, setExpanded] = React.useState(false);
  const schedule = useGetFilmSchedule(filmId, film.data?.status === "now" ? city?.id : undefined, date);

  if (!film.data) {
    return (
      <Screen>
        <Header />
        <StateView loading={film.isLoading} error={film.error} onRetry={film.refetch} />
      </Screen>
    );
  }
  const f = film.data;
  const heroH = width / 1.5;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <View style={{ width, height: heroH, overflow: "hidden" }}>
          <Image source={FilmArt[f.id].still} style={{ width, height: heroH }} resizeMode="cover" />
          <LinearGradient
            colors={["rgba(11,10,14,0.35)", "rgba(11,10,14,0)", colors.bg]}
            locations={[0, 0.35, 1]}
            style={StyleSheet.absoluteFill}
          />
        </View>

        <View style={styles.titleBlock}>
          <Image source={FilmArt[f.id].poster} style={styles.poster} />
          <View style={{ flex: 1, gap: 6, paddingTop: 52 }}>
            <Text variant="h1" weight="bold">{f.title}</Text>
            <View style={styles.metaRow}>
              <View style={styles.rating}>
                <Text variant="tiny" weight="bold">{f.rating}</Text>
              </View>
              <ClockIcon size={13} color={colors.muted} />
              <Text variant="small" color={colors.muted}>{formatDuration(f.duration, lang)}</Text>
              {f.score != null && (
                <>
                  <StarIcon size={13} color={colors.warm} weight="fill" />
                  <Text variant="small" weight="semibold">{f.score.toFixed(1)}</Text>
                </>
              )}
            </View>
            <Text variant="small" color={colors.muted}>{f.genres.map((g) => t(`common:genre.${g}`)).join(", ")}</Text>
          </View>
        </View>

        <View style={styles.block}>
          <Text variant="h3" weight="semibold">{t("film.synopsis")}</Text>
          <Pressable onPress={() => setExpanded((x) => !x)}>
            <Text color={colors.muted} numberOfLines={expanded ? undefined : 3} style={{ marginTop: 6 }}>
              {f.synopsis[lang]}
            </Text>
          </Pressable>
          <View style={styles.credits}>
            <Credit label={t("film.director")} value={f.director} />
            <Credit label={t("film.cast")} value={f.cast.join(", ")} />
          </View>
        </View>

        {f.status === "soon" ? (
          <View style={[styles.block, styles.soon]}>
            <Text color={colors.text}>
              {t("film.comingSoon", { date: formatDate(f.releaseDate!, "d MMMM yyyy", lang) })}
            </Text>
          </View>
        ) : (
          <View style={{ marginTop: 8 }}>
            <View style={styles.scheduleHead}>
              <Text variant="h2" weight="bold" style={{ flex: 1 }}>{t("film.schedule")}</Text>
              <Pressable style={styles.cityLink} onPress={() => navigation.navigate("CityPicker")} hitSlop={8}>
                <MapPinIcon size={14} color={colors.sel} weight="fill" />
                <Text variant="small" weight="semibold" color={colors.sel}>{city?.name ?? t("common:city.title")}</Text>
              </Pressable>
            </View>
            <DateStrip value={date} onChange={setDate} />
            <View style={{ paddingHorizontal: GUTTER, gap: 12, marginTop: 16 }}>
              {schedule.isLoading && !!city ? (
                [0, 1].map((i) => <Skeleton key={i} style={{ height: 110 }} />)
              ) : schedule.error ? (
                <StateView compact error={schedule.error} onRetry={schedule.refetch} />
              ) : !city ? (
                <StateView
                  compact
                  empty={{ title: t("common:city.title"), action: { label: t("common:city.title"), onPress: () => navigation.navigate("CityPicker") } }}
                />
              ) : !schedule.data?.length ? (
                <StateView compact empty={{ title: t("film.noSchedule", { city: city.name }) }} />
              ) : (
                schedule.data.map(({ cinema, showtimes }) => (
                  <View key={cinema.id} style={styles.cinemaCard}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Text weight="semibold" style={{ flex: 1 }} numberOfLines={1}>{cinema.name}</Text>
                      <Text variant="small" color={cinema.tier === "premiere" ? colors.warm : colors.muted}>
                        {t(`common:tier.${cinema.tier}`)} · {t("common:studio", { n: showtimes[0].studio })}
                      </Text>
                    </View>
                    <ShowtimeChips showtimes={showtimes} />
                  </View>
                ))
              )}
            </View>
          </View>
        )}
      </ScrollView>

      <IconButton label={t("common:back")} glass onPress={() => navigation.goBack()} style={[styles.back, { top: insets.top + 8 }]}>
        <CaretLeftIcon size={18} color={colors.text} weight="bold" />
      </IconButton>
    </View>
  );
}

function Credit({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 12 }}>
      <Text variant="small" color={colors.dim} style={{ width: 82 }}>{label}</Text>
      <Text variant="small" style={{ flex: 1 }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  back: { position: "absolute", left: GUTTER },
  titleBlock: { flexDirection: "row", gap: 16, paddingHorizontal: GUTTER, marginTop: -64 },
  poster: { width: 104, height: 156, borderRadius: radius.md, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  rating: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: colors.line },
  block: { paddingHorizontal: GUTTER, marginTop: 24 },
  credits: { marginTop: 14, gap: 6 },
  soon: { marginHorizontal: GUTTER, padding: 16, borderRadius: radius.lg, backgroundColor: colors.selSoft },
  scheduleHead: { flexDirection: "row", alignItems: "center", paddingHorizontal: GUTTER, marginTop: 20, marginBottom: 12 },
  cityLink: { flexDirection: "row", alignItems: "center", gap: 4 },
  cinemaCard: { padding: 14, gap: 12, borderRadius: radius.lg, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line },
});
