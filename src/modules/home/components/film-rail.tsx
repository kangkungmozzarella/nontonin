import React from "react";
import { FlatList, View } from "react-native";
import { GUTTER } from "@constants/styles/size";
import Skeleton from "@components/skeleton";
import SectionHeader from "@components/section-header";
import FilmPosterCard, { POSTER_W } from "@modules/components/film-poster-card";
import type { Film } from "@api-hooks/films/model";

export default function FilmRail({ title, films }: { title: string; films?: Film[] }) {
  return (
    <View>
      <SectionHeader title={title} />
      {films ? (
        <FlatList
          data={films}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: GUTTER, gap: 14 }}
          keyExtractor={(f) => f.id}
          renderItem={({ item }) => <FilmPosterCard film={item} />}
        />
      ) : (
        <View style={{ flexDirection: "row", gap: 14, paddingHorizontal: GUTTER }}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} style={{ width: POSTER_W, height: POSTER_W * 1.5 + 40 }} />
          ))}
        </View>
      )}
    </View>
  );
}
