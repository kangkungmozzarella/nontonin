import React from "react";
import { FlatList, Image, StyleSheet, useWindowDimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import colors from "@constants/styles/color";
import { GUTTER, radius } from "@constants/styles/size";
import { useGetPromos, type Promo } from "@api-hooks/promos";
import Text from "@components/text";
import Skeleton from "@components/skeleton";
import PressableScale from "@components/pressable-scale";

const GAP = 10;
const AUTO_MS = 4500;
const KIND_COLOR = { feature: colors.sel, discount: colors.warm, premiere: colors.violet };

export default function BannerCarousel() {
  const { width } = useWindowDimensions();
  const itemW = width - GUTTER * 2;
  const itemH = Math.round(itemW / 2.1);
  const { data } = useGetPromos();
  const navigation = useNavigation();
  const list = React.useRef<FlatList<Promo>>(null);
  const [index, setIndex] = React.useState(0);
  const dragging = React.useRef(false);

  // Auto-advance, paused while the user is swiping
  React.useEffect(() => {
    if (!data?.length) return;
    const id = setInterval(() => {
      if (dragging.current) return;
      const next = (index + 1) % data.length;
      list.current?.scrollToOffset({ offset: next * (itemW + GAP), animated: true });
    }, AUTO_MS);
    return () => clearInterval(id);
  }, [data, index, itemW]);

  if (!data) return <Skeleton style={{ marginHorizontal: GUTTER, height: itemH, borderRadius: radius.lg }} />;

  return (
    <View>
      <FlatList
        ref={list}
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={itemW + GAP}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: GUTTER, gap: GAP }}
        keyExtractor={(p) => p.id}
        onScrollBeginDrag={() => (dragging.current = true)}
        onScrollEndDrag={() => (dragging.current = false)}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / (itemW + GAP)))}
        renderItem={({ item }) => (
          <PressableScale
            scaleTo={0.98}
            accessibilityRole="button"
            accessibilityLabel={item.title}
            onPress={() => navigation.navigate("FilmDetail", { filmId: item.film.id })}
            style={[styles.banner, { width: itemW, height: itemH }]}
          >
            <Image source={item.film.backdrop} style={{ position: "absolute", width: itemW, height: itemH }} resizeMode="cover" />
            <LinearGradient
              colors={["rgba(8,8,10,0)", "rgba(8,8,10,0.85)"]}
              start={{ x: 0, y: 0.25 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.copy}>
              <View style={[styles.kind, { backgroundColor: KIND_COLOR[item.kind] }]} />
              <Text variant="h2" weight="bold" numberOfLines={1}>{item.title}</Text>
              <Text variant="small" color="rgba(243,242,239,0.8)" numberOfLines={1}>{item.subtitle}</Text>
            </View>
          </PressableScale>
        )}
      />
      <View style={styles.dots}>
        {data.map((p, i) => (
          <View key={p.id} style={[styles.dot, i === index && styles.dotOn]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { borderRadius: radius.lg, overflow: "hidden", backgroundColor: colors.panel2 },
  copy: { position: "absolute", left: 16, right: 16, bottom: 14, gap: 3 },
  kind: { width: 22, height: 3, borderRadius: 2, marginBottom: 6 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 5, marginTop: 10 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.seat },
  dotOn: { width: 16, backgroundColor: colors.text },
});
