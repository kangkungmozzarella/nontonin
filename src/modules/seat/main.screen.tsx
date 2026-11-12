import React from "react";
import { BackHandler, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { Easing, FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import { ArrowsOutLineHorizontalIcon, CaretLeftIcon, PerspectiveIcon, EyeIcon } from "phosphor-react-native";
import colors from "@constants/styles/color";
import { GUTTER, radius } from "@constants/styles/size";
import { MAX_SEATS_PER_ORDER } from "@constants/app";
import { SeatCell, seatById } from "@common/theater/layout";
import { formatDate, formatIDR } from "@helpers/format";
import { orderTotals, seatPrice } from "@helpers/pricing";
import { localStorage, StorageKeys } from "@helpers/local-storage";
import { useLang } from "@hooks/use-lang";
import { useBookings } from "@hooks/use-bookings";
import { useGetShowtime } from "@api-hooks/showtimes";
import { useGetFilm } from "@api-hooks/films";
import { useGetCinema } from "@api-hooks/cinemas";
import { useGetSeatMap } from "@api-hooks/seats";
import Text from "@components/text";
import Header from "@components/header";
import Button from "@components/button";
import StateView from "@components/state-view";
import PressableScale from "@components/pressable-scale";
import { useToast } from "@components/toast";
import type { RootScreenProps } from "@app-types/navigation";
import SeatMap, { TakenMark } from "./components/seat-map";
import ScreenArc from "./components/screen-arc";
import SeatSheet from "./components/seat-sheet";
import TheaterView from "./theater/theater-view";
import { OVERVIEW, TheaterController, poseForSeat } from "./theater/camera-controller";

type Mode = "map" | "seat";

export default function SeatSelectScreen({ route, navigation }: RootScreenProps<"SeatSelect">) {
  const { showtimeId, focusSeat, readOnly } = route.params;
  const { t } = useTranslation(["booking", "common"]);
  const lang = useLang();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const mapScroll = React.useRef<React.ComponentRef<typeof ScrollView>>(null);
  const { bookings } = useBookings();

  const showtime = useGetShowtime(showtimeId);
  const film = useGetFilm(showtime.data?.filmId);
  const cinema = useGetCinema(showtime.data?.cinemaId);
  const seatMap = useGetSeatMap(showtimeId);

  // Seats this device already bought for the showtime
  const owned = React.useMemo(
    () => new Set(bookings.filter((b) => b.showtimeId === showtimeId).flatMap((b) => b.seats)),
    [bookings, showtimeId],
  );
  const taken = React.useMemo(() => {
    const s = new Set(seatMap.data?.taken ?? []);
    if (readOnly) owned.forEach((id) => s.delete(id)); // show my own seats as mine, not as taken
    return s;
  }, [seatMap.data, readOnly, owned]);

  const [selected, setSelected] = React.useState<Set<string>>(() => new Set());
  const mine = readOnly ? owned : selected;

  const [preview3d, setPreview3d] = React.useState(() => localStorage.getItem(StorageKeys.preview3d) !== "0");
  const [mode, setMode] = React.useState<Mode>("map");
  const modeRef = React.useRef<Mode>("map");
  const [current, setCurrent] = React.useState<SeatCell | null>(null);
  const [sheetVisible, setSheetVisible] = React.useState(false);
  const [sheetH, setSheetH] = React.useState(0);
  const [stageActive, setStageActive] = React.useState(false);
  const [glReady, setGlReady] = React.useState(false);
  const [lookHint, setLookHint] = React.useState(false);
  const [origin, setOrigin] = React.useState({ x: width / 2, y: height / 2 });
  const [controller] = React.useState(() => new TheaterController());
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  const later = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
  React.useEffect(() => () => timers.current.forEach(clearTimeout), []);

  /* ---------- 2D <-> 3D transition ---------- */
  const mapOpacity = useSharedValue(1);
  const mapScale = useSharedValue(1);
  const stageOpacity = useSharedValue(0);
  const mapStyle = useAnimatedStyle(() => ({ opacity: mapOpacity.value, transform: [{ scale: mapScale.value }] }));
  const stageStyle = useAnimatedStyle(() => ({ opacity: stageOpacity.value }));
  const zoomEase = Easing.bezier(0.6, 0, 0.2, 1);

  React.useEffect(() => {
    controller.setSheetOffset(sheetVisible ? sheetH * 0.8 : 0);
  }, [sheetVisible, sheetH, controller]);

  const showLookHint = () => {
    setLookHint(true);
    later(3600, () => setLookHint(false));
  };

  const openSeat = React.useCallback(
    (s: SeatCell, at?: { x: number; y: number }) => {
      if (taken.has(s.id)) return;
      Haptics.selectionAsync().catch(() => {});

      // With the preview off, a tap simply toggles the seat
      if (!preview3d && !readOnly && modeRef.current === "map") {
        setSelected((prev) => {
          const next = new Set(prev);
          if (next.has(s.id)) next.delete(s.id);
          else if (next.size >= MAX_SEATS_PER_ORDER) {
            toast(t("seat.max", { max: MAX_SEATS_PER_ORDER }));
            return prev;
          } else next.add(s.id);
          return next;
        });
        return;
      }

      setCurrent(s);
      if (modeRef.current === "map") {
        modeRef.current = "seat";
        setMode("seat");
        setOrigin(at ?? { x: width / 2, y: height / 2 });
        // zoom the 2D map into the tapped seat while the 3D view fades in
        mapScale.set(withTiming(2.4, { duration: 950, easing: zoomEase }));
        mapOpacity.set(withTiming(0, { duration: 550 }));
        stageOpacity.set(withTiming(1, { duration: 700 }));
        setStageActive(true);
        controller.setPose(OVERVIEW);
        controller.resetLook();
        controller.flyTo(poseForSeat(s), 1750, 0);
        later(900, () => {
          if (modeRef.current !== "seat") return;
          setSheetVisible(true);
          showLookHint();
        });
      } else {
        controller.flyTo(poseForSeat(s), 1150, 0.45); // seat-to-seat hop
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [taken, preview3d, readOnly, width, height],
  );

  const backToMap = React.useCallback(() => {
    if (modeRef.current !== "seat") return;
    if (readOnly) {
      navigation.goBack();
      return;
    }
    modeRef.current = "map";
    setMode("map");
    setSheetVisible(false);
    setLookHint(false);
    controller.flyTo(OVERVIEW, 1000, 0);
    later(250, () => {
      mapOpacity.set(withTiming(1, { duration: 550 }));
      mapScale.set(withTiming(1, { duration: 950, easing: zoomEase }));
    });
    later(900, () => {
      if (modeRef.current !== "map") return;
      stageOpacity.set(withTiming(0, { duration: 700 }));
      later(750, () => modeRef.current === "map" && setStageActive(false));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readOnly, navigation]);

  // Android back button leaves the 3D view before leaving the screen
  useFocusEffect(
    React.useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        if (modeRef.current === "seat") {
          backToMap();
          return true;
        }
        return false;
      });
      return () => sub.remove();
    }, [backToMap]),
  );

  // Ticket "see the view from my seat": fly straight in once everything is loaded
  const autoOpened = React.useRef(false);
  React.useEffect(() => {
    if (autoOpened.current || !focusSeat || !glReady || !seatMap.data) return;
    const s = seatById(focusSeat);
    if (!s) return;
    autoOpened.current = true;
    later(250, () => openSeat(s));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusSeat, glReady, seatMap.data]);

  const toggleCurrent = () => {
    if (!current) return;
    const has = selected.has(current.id);
    if (!has && selected.size >= MAX_SEATS_PER_ORDER) {
      toast(t("seat.max", { max: MAX_SEATS_PER_ORDER }));
      return;
    }
    setSelected((prev) => {
      const next = new Set(prev);
      if (has) next.delete(current.id);
      else next.add(current.id);
      return next;
    });
    if (!has) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      toast(t("seat.picked", { seat: current.id }));
    }
    backToMap();
  };

  const togglePreview = () => {
    const next = !preview3d;
    setPreview3d(next);
    localStorage.setItem(StorageKeys.preview3d, next ? "1" : "0");
  };

  /* ---------- render ---------- */
  const loading = showtime.isLoading || seatMap.isLoading || film.isLoading || cinema.isLoading;
  const error = showtime.error || seatMap.error || film.error || cinema.error;
  if (loading || error || !showtime.data || !seatMap.data || !film.data || !cinema.data) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <Header />
        <StateView
          loading={loading}
          error={error}
          onRetry={() => {
            showtime.refetch();
            seatMap.refetch();
          }}
        />
      </View>
    );
  }

  const st = showtime.data;
  const pricing = seatMap.data;
  const seatsSorted = [...selected].sort();
  const totals = orderTotals(seatsSorted, pricing);
  const subtitle = [cinema.data.name, formatDate(st.date, "EEE d MMM", lang), st.time, t("common:studio", { n: st.studio })].join(" · ");

  return (
    <View style={styles.root}>
      {/* 3D stage, under the map */}
      <Animated.View style={[StyleSheet.absoluteFill, stageStyle]} pointerEvents={mode === "seat" ? "auto" : "none"}>
        <TheaterView
          controller={controller}
          filmFrame={film.data.screenFrame}
          taken={taken}
          mine={readOnly ? owned : selected}
          active={stageActive}
          canLook={mode === "seat"}
          onReady={() => setGlReady(true)}
          onLookStart={() => setLookHint(false)}
        />
      </Animated.View>

      {/* 2D seat map */}
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.map, { transformOrigin: [origin.x, origin.y, 0] }, mapStyle]}
        pointerEvents={mode === "map" ? "auto" : "none"}
      >
        <View style={{ paddingTop: insets.top }}>
          <Header
            title={film.data.title}
            subtitle={subtitle}
            right={
              !readOnly && (
                <Pressable
                  onPress={togglePreview}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: preview3d }}
                  accessibilityLabel={t("seat.preview3d")}
                  style={[styles.toggle, preview3d && styles.toggleOn]}
                  hitSlop={6}
                >
                  <PerspectiveIcon size={16} color={preview3d ? colors.onAccent : colors.muted} weight={preview3d ? "fill" : "regular"} />
                  <Text variant="tiny" weight="bold" color={preview3d ? colors.onAccent : colors.muted}>
                    3D
                  </Text>
                </Pressable>
              )
            }
          />
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 12, paddingBottom: 150 + insets.bottom }}>
          {/* Wider than the screen on narrow phones: scroll sideways, opening centred */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            ref={mapScroll}
            onContentSizeChange={(w) => mapScroll.current?.scrollTo({ x: Math.max(0, (w - width) / 2), animated: false })}
            style={{ marginHorizontal: -14 }}
            contentContainerStyle={{ paddingHorizontal: 14, minWidth: width }}
          >
            <View style={{ flexGrow: 1 }}>
              <ScreenArc label={t("seat.screen")} />
              <SeatMap taken={taken} selected={mine} previewing={mode === "seat" ? current?.id : null} onPressSeat={openSeat} />
            </View>
          </ScrollView>
          <View style={styles.legend}>
            <Legend
              label={t("seat.legend.available")}
              style={{ backgroundColor: colors.seatFill, borderWidth: 1.5, borderColor: colors.seatLine }}
            />
            <Legend label={t("seat.legend.taken")} style={{ backgroundColor: colors.takenFill }} taken />
            <Legend
              label={t("seat.legend.recliner")}
              style={{ backgroundColor: colors.reclFill, borderWidth: 1.5, borderColor: colors.recl }}
            />
            <Legend label={t("seat.legend.selected")} style={{ backgroundColor: colors.accent }} />
          </View>
          {preview3d && (
            <View style={styles.hint}>
              <EyeIcon size={20} color={colors.text} />
              <Text variant="small" color="#C9C7CF" style={{ flex: 1 }}>
                {t("seat.hint")}
              </Text>
            </View>
          )}
        </ScrollView>

        {!readOnly && (
          <View style={[styles.bar, { paddingBottom: insets.bottom + 12 }]}>
            <View style={styles.barIn}>
              <View style={{ flex: 1 }}>
                <Text variant="tiny" color={colors.muted}>
                  {seatsSorted.length ? t("seat.seatsCount", { count: seatsSorted.length }) : t("seat.none")}
                </Text>
                <Text weight="semibold" numberOfLines={1} style={{ marginTop: 2 }}>
                  {seatsSorted.length ? `${seatsSorted.join(", ")} · ${formatIDR(totals.subtotal - totals.discount)}` : "–"}
                </Text>
              </View>
              <Button
                label={t("common:next")}
                disabled={!seatsSorted.length}
                onPress={() => navigation.navigate("Checkout", { showtimeId, seats: seatsSorted })}
              />
            </View>
          </View>
        )}
      </Animated.View>

      {/* 3D chrome */}
      {mode === "seat" && (
        <View style={[styles.chrome, { top: insets.top + 10 }]} pointerEvents="box-none">
          <Animated.View entering={FadeIn.delay(700)}>
            <PressableScale onPress={backToMap} style={styles.chip} accessibilityRole="button">
              <CaretLeftIcon size={16} color={colors.text} weight="bold" />
              <Text variant="small" weight="semibold">
                {readOnly ? t("common:back") : t("seat.backToMap")}
              </Text>
            </PressableScale>
          </Animated.View>
          {lookHint && (
            <Animated.View entering={FadeIn} exiting={FadeOut} style={[styles.chip, { marginLeft: "auto" }]} pointerEvents="none">
              <ArrowsOutLineHorizontalIcon size={16} color={colors.text} />
              <Text variant="small" weight="medium">
                {t("seat.drag")}
              </Text>
            </Animated.View>
          )}
        </View>
      )}

      <SeatSheet
        visible={sheetVisible}
        seat={current}
        price={current ? seatPrice(current.id, pricing.price) : 0}
        picked={!!current && selected.has(current.id)}
        readOnly={readOnly}
        taken={taken}
        mine={mine}
        onToggle={toggleCurrent}
        onBack={backToMap}
        onJump={(s) => openSeat(s)}
        onHeight={setSheetH}
      />
    </View>
  );
}

function Legend({ label, style, taken }: { label: string; style: object; taken?: boolean }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View style={[{ width: 16, height: 13, borderRadius: 4, alignItems: "center", justifyContent: "center" }, style]}>
        {taken && <TakenMark size={16} />}
      </View>
      <Text variant="tiny" color={colors.muted}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  map: { backgroundColor: colors.bg },
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    height: 34,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
  },
  toggleOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  legend: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 16, rowGap: 8, marginTop: 26 },
  hint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    alignSelf: "center",
    maxWidth: 360,
    marginTop: 22,
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
  },
  bar: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: GUTTER },
  barIn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    paddingLeft: 16,
    borderRadius: 18,
    backgroundColor: colors.scrim,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chrome: { position: "absolute", left: GUTTER, right: GUTTER, flexDirection: "row", alignItems: "center" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: "rgba(20,20,23,0.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
});
