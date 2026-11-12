import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { StarIcon } from "phosphor-react-native";
import colors from "@constants/styles/color";
import { radius } from "@constants/styles/size";
import { formatDate } from "@helpers/format";
import { useLang } from "@hooks/use-lang";
import Text from "@components/text";
import PressableScale from "@components/pressable-scale";
import type { Film } from "@api-hooks/films/model";

export const POSTER_W = 132;

export default function FilmPosterCard({ film, width = POSTER_W }: { film: Film; width?: number }) {
  const navigation = useNavigation();
  const { t } = useTranslation(["home", "common"]);
  const lang = useLang();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={film.title}
      onPress={() => navigation.navigate("FilmDetail", { filmId: film.id })}
      style={{ width }}
    >
      <View>
        <Image source={film.poster} style={[styles.poster, { width, height: width * 1.5 }]} />
        {film.rating && (
          <View style={styles.badge}>
            <Text variant="tiny" weight="bold">{film.rating}</Text>
          </View>
        )}
      </View>
      <Text weight="semibold" numberOfLines={1} style={{ marginTop: 10 }}>{film.title}</Text>
      {film.status === "soon" && film.releaseDate ? (
        <Text variant="small" color={colors.sel} style={{ marginTop: 2 }}>
          {t("home:releaseOn", { date: formatDate(film.releaseDate, "d MMM", lang) })}
        </Text>
      ) : (
        <View style={styles.meta}>
          {film.score != null && (
            <>
              <StarIcon size={12} color={colors.warm} weight="fill" />
              <Text variant="small" color={colors.text} weight="medium">{film.score.toFixed(1)}</Text>
              <Text variant="small" color={colors.dim}>·</Text>
            </>
          )}
          <Text variant="small" color={colors.muted} numberOfLines={1} style={{ flex: 1 }}>
            {film.genres[0] ?? ""}
          </Text>
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  poster: { borderRadius: radius.md, backgroundColor: colors.panel2 },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "rgba(10,10,12,0.72)",
  },
  meta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
});
