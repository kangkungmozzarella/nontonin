import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";
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

export default function SeatSheet({ visible, seat, price, picked, readOnly, taken, mine, onToggle, onBack, onJump, onHeight }: Props) {
  const { t } = useTranslation(["booking", "common"]);
  const insets = useSafeAreaInsets();
  const a = React.useMemo(() => (seat ? analyze(seat) : null), [seat]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateY: withTiming(visible ? 0 : 420, { duration: 450, easing: Easing.bezier(0.2, 0.8, 0.2, 1) }) }],
  }));

  if (!seat || !a) return null;
  const desc =
    a.tag === "full" && seat.kind === "rec"
      ? t("seat.desc.fullRec")
      : t(`seat.desc.${a.tag}`, { tilt: Math.round(a.tilt), off: Math.round(a.off) });

  return (
    <Animated.View
      style={[styles.sheet, { paddingBottom: insets.bottom + 14 }, anim]}
      onLayout={(e) => onHeight(e.nativeEvent.layout.height)}
      pointerEvents={visible ? "auto" : "none"}
      accessibilityLiveRegion="polite"
    >
      <View style={styles.handle} />
      <View style={styles.top}>
        <View style={{ flex: 1, gap: 3 }}>
          <Text variant="tiny" weight="bold" color={TAG_COLOR[a.tag]} style={{ letterSpacing: 1, textTransform: "uppercase" }}>
            {t(`seat.tag.${a.tag}`)}
          </Text>
          <Text variant="h1" weight="bold">{t("seat.name", { row: ROWS[seat.row], num: seat.num })}</Text>
          <Text variant="small" color={colors.muted}>
            {t(`seat.kind.${seat.kind}`)} · {formatIDR(price)}
          </Text>
        </View>
        <MiniMap taken={taken} mine={mine} current={seat.id} onPick={readOnly ? undefined : onJump} />
      </View>

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
  handle: { alignSelf: "center", width: 38, height: 4, borderRadius: 2, backgroundColor: "#3A3A42", marginBottom: 12 },
  top: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  stats: { flexDirection: "row", gap: 8, marginTop: 14 },
  stat: { flex: 1, padding: 10, borderRadius: radius.md, backgroundColor: colors.panel2, gap: 2 },
  actions: { flexDirection: "row", gap: 10, marginTop: 16 },
});
