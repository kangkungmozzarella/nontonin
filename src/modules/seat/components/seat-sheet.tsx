import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { Easing, Extrapolation, interpolate, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { GestureDetector, usePanGesture } from "react-native-gesture-handler";
import { scheduleOnRN } from "react-native-worklets";
import { CaretUpIcon } from "phosphor-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import colors from "@constants/styles/color";
import { radius } from "@constants/styles/size";
import { ROWS, SeatCell } from "@common/theater/layout";
import { analyze, TAG_COLOR } from "@common/theater/analyze";
import { formatIDR } from "@helpers/format";
import Text from "@components/text";
import Button from "@components/button";
import MiniMap from "./mini-map";

interface Props {
  visible: boolean;
  seat: SeatCell | null;
  price: number;
  picked: boolean;
  readOnly?: boolean;
  taken: ReadonlySet<string>;
  mine: ReadonlySet<string>;
  onToggle: () => void;
  onBack: () => void;
  onJump: (s: SeatCell) => void;
  onHeight: (h: number) => void;
}

const SNAP = { duration: 380, easing: Easing.bezier(0.2, 0.8, 0.2, 1) };

// The sheet can be dragged down (or its handle tapped) to a peek that only keeps
// the seat name, leaving most of the 3D view clear. Drag up or tap to expand.
export default function SeatSheet({ visible, seat, price, picked, readOnly, taken, mine, onToggle, onBack, onJump, onHeight }: Props) {
  const { t } = useTranslation(["booking", "common"]);
  const insets = useSafeAreaInsets();
  const a = React.useMemo(() => (seat ? analyze(seat) : null), [seat]);

  const [sheetH, setSheetH] = React.useState(0);
  const [head, setHead] = React.useState({ y: 0, h: 0 });
  const [collapsed, setCollapsed] = React.useState(false);

  // a newly opened seat always starts expanded so its details are seen first
  const [seatId, setSeatId] = React.useState(seat?.id);
  if (seat?.id !== seatId) {
    setSeatId(seat?.id);
    setCollapsed(false);
  }

  // how far the sheet travels down to leave only the header visible
  const range = sheetH && head.h ? Math.max(0, sheetH - (head.y + head.h + insets.bottom + 18)) : 0;

  const drag = useSharedValue(0);
  const start = useSharedValue(0);
  const max = useSharedValue(0);
  const hide = useSharedValue(visible ? 0 : 1);

  React.useEffect(() => {
    max.set(range);
    drag.set(withTiming(collapsed ? range : 0, SNAP));
  }, [collapsed, range, drag, max]);

  React.useEffect(() => {
    hide.set(withTiming(visible ? 0 : 1, { duration: 450, easing: SNAP.easing }));
  }, [visible, hide]);

  React.useEffect(() => {
    if (sheetH) onHeight(collapsed ? sheetH - range : sheetH);
  }, [collapsed, sheetH, range, onHeight]);

  // Memoized so re-renders keep the same gesture instead of rebuilding it
  const panConfig = React.useMemo(
    () => ({
      activeOffsetY: [-8, 8] as [number, number],
      failOffsetX: [-24, 24] as [number, number],
      onBegin: () => {
        "worklet";
        start.set(drag.get());
      },
      onUpdate: (e: { translationY: number }) => {
        "worklet";
        drag.set(Math.min(max.get(), Math.max(0, start.get() + e.translationY)));
      },
      onDeactivate: (e: { translationY: number; velocityY: number }) => {
        "worklet";
        // a flick or a deliberate drag decides the direction; tiny moves snap to the nearest end
        const down =
          Math.abs(e.velocityY) > 500
            ? e.velocityY > 0
            : Math.abs(e.translationY) > 24
              ? e.translationY > 0
              : drag.get() > max.get() / 2;
        drag.set(withTiming(down ? max.get() : 0, SNAP));
        scheduleOnRN(setCollapsed, down);
      },
    }),
    [drag, start, max],
  );
  const pan = usePanGesture(panConfig);

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateY: drag.get() + hide.get() * (sheetH || 420) }],
  }));
  // everything below the header fades as the sheet folds away
  const rest = useAnimatedStyle(() => ({
    opacity: max.get() ? interpolate(drag.get(), [0, max.get() * 0.7], [1, 0], Extrapolation.CLAMP) : 1,
  }));

  if (!seat || !a) return null;
  const desc =
    a.tag === "full" && seat.kind === "rec"
      ? t("seat.desc.fullRec")
      : t(`seat.desc.${a.tag}`, { tilt: Math.round(a.tilt), off: Math.round(a.off) });
  const toggle = () => setCollapsed((c) => !c);

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[styles.sheet, { paddingBottom: insets.bottom + 14 }, anim]}
        onLayout={(e) => setSheetH(e.nativeEvent.layout.height)}
        pointerEvents={visible ? "auto" : "none"}
        accessibilityLiveRegion="polite"
      >
        <Pressable
          onPress={toggle}
          hitSlop={{ top: 10, bottom: 6, left: 60, right: 60 }}
          accessibilityRole="button"
          accessibilityLabel={collapsed ? t("seat.sheetShow") : t("seat.sheetHide")}
          style={styles.handleHit}
        >
          <View style={styles.handle} />
        </Pressable>
        <View style={styles.top} onLayout={(e) => setHead((h) => ({ ...h, y: e.nativeEvent.layout.y }))}>
          <Pressable
            style={{ flex: 1, gap: 3 }}
            onPress={collapsed ? toggle : undefined}
            disabled={!collapsed}
            onLayout={(e) => {
              const h = e.nativeEvent.layout.height;
              setHead((p) => (p.h === h ? p : { ...p, h }));
            }}
          >
            <Text variant="tiny" weight="bold" color={TAG_COLOR[a.tag]} style={{ letterSpacing: 1, textTransform: "uppercase" }}>
              {t(`seat.tag.${a.tag}`)}
            </Text>
            <Text variant="h1" weight="bold">{t("seat.name", { row: ROWS[seat.row], num: seat.num })}</Text>
            <Text variant="small" color={colors.muted}>
              {t(`seat.kind.${seat.kind}`)} · {formatIDR(price)}
            </Text>
          </Pressable>
          <Animated.View style={rest} pointerEvents={collapsed ? "none" : "auto"}>
            <MiniMap taken={taken} mine={mine} current={seat.id} onPick={readOnly ? undefined : onJump} />
          </Animated.View>
          {collapsed && (
            <Pressable
              onPress={toggle}
              style={[styles.expand, { top: Math.max(0, head.h / 2 - 20) }]}
              accessibilityRole="button"
              accessibilityLabel={t("seat.sheetShow")}
            >
              <CaretUpIcon size={18} color={colors.text} weight="bold" />
            </Pressable>
          )}
        </View>

        <Animated.View style={rest} pointerEvents={collapsed ? "none" : "auto"}>
          <Text variant="small" color="#C9C7CF" style={{ marginTop: 12 }}>{desc}</Text>

          <View style={styles.stats}>
            <Stat value={`${Math.round(a.fov)}°`} label={t("seat.stats.fov")} />
            <Stat value={`${a.dist.toFixed(1).replace(".", ",")} m`} label={t("seat.stats.dist")} />
            <Stat
              value={a.off < 3 ? t("seat.stats.centered") : t("seat.stats.off", { deg: Math.round(a.off) })}
              label={t("seat.stats.angle")}
            />
          </View>

          <View style={styles.actions}>
            <Button variant="secondary" label={readOnly ? t("common:back") : t("seat.backToMap")} onPress={onBack} flex />
            {!readOnly && (
              <Button variant={picked ? "danger" : "primary"} label={picked ? t("seat.unpick") : t("seat.pick")} onPress={onToggle} flex />
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text weight="bold" variant="h3" numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      <Text variant="tiny" color={colors.muted}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 10,
    backgroundColor: colors.glass,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.line,
  },
  handleHit: { alignSelf: "stretch", alignItems: "center", paddingBottom: 12 },
  handle: { width: 38, height: 4, borderRadius: 2, backgroundColor: "#3A3A42" },
  expand: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.panel2,
    position: "absolute",
    right: 0,
  },
  top: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  stats: { flexDirection: "row", gap: 8, marginTop: 14 },
  stat: { flex: 1, padding: 10, borderRadius: radius.md, backgroundColor: colors.panel2, gap: 2 },
  actions: { flexDirection: "row", gap: 10, marginTop: 16 },
});
