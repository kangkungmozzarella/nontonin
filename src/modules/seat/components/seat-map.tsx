import React from "react";
import { GestureResponderEvent, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { useTranslation } from "react-i18next";
import colors from "@constants/styles/color";
import { ROWS, PER, RECL_FROM, SEAT_CELLS, SeatCell, isAisleAfter } from "@common/theater/layout";
import Text from "@components/text";

interface Props {
  taken: ReadonlySet<string>;
  selected: ReadonlySet<string>;
  previewing?: string | null;
  onPressSeat: (s: SeatCell, at: { x: number; y: number }) => void;
}

const SIDE_PAD = 14, LABEL_W = 14;

// Seat size follows the CSS clamp() from the web prototype
export function useSeatMetrics() {
  const { width } = useWindowDimensions();
  const g = Math.max(3, Math.min(6, width * 0.009));
  const s = Math.max(13, Math.min(26, (width - SIDE_PAD * 2 - LABEL_W * 2 - 18 * g) / 15.7));
  return { s, g };
}

export default function SeatMap({ taken, selected, previewing, onPressSeat }: Props) {
  const { s, g } = useSeatMetrics();
  const { t } = useTranslation("booking");

  const rows = React.useMemo(() => ROWS.map((_, r) => SEAT_CELLS.slice(r * PER, r * PER + PER)), []);

  return (
    <View style={{ gap: g, alignItems: "center" }} accessibilityLabel="Seat map">
      {rows.map((cells, r) => (
        <React.Fragment key={ROWS[r]}>
          {r === RECL_FROM && <View style={{ height: s * 0.35 }} />}
          <View style={[styles.row, { gap: g }]}>
            <RowLabel label={ROWS[r]} />
            {cells.map((c) => (
              <React.Fragment key={c.id}>
                <SeatButton
                  cell={c}
                  size={s}
                  taken={taken.has(c.id)}
                  selected={selected.has(c.id) || previewing === c.id}
                  onPress={onPressSeat}
                  label={t("seat.name", { row: ROWS[c.row], num: c.num })}
                />
                {isAisleAfter(c.col) && <View style={{ width: s * 0.85 }} />}
              </React.Fragment>
            ))}
            <RowLabel label={ROWS[r]} />
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

function RowLabel({ label }: { label: string }) {
  return (
    <Text variant="tiny" weight="medium" color={colors.dim} align="center" style={{ width: LABEL_W }}>
      {label}
    </Text>
  );
}

const SeatButton = React.memo(function SeatButton({
  cell,
  size,
  taken,
  selected,
  onPress,
  label,
}: {
  cell: SeatCell;
  size: number;
  taken: boolean;
  selected: boolean;
  onPress: Props["onPressSeat"];
  label: string;
}) {
  const rec = cell.kind === "rec";
  const shape = {
    width: size,
    height: size * 0.84,
    borderTopLeftRadius: size * 0.3,
    borderTopRightRadius: size * 0.3,
    borderBottomLeftRadius: size * 0.16,
    borderBottomRightRadius: size * 0.16,
  };
  const handle = (e: GestureResponderEvent) => onPress(cell, { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY });
  return (
    <Pressable
      onPress={handle}
      disabled={taken}
      hitSlop={2}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: taken, selected }}
      style={({ pressed }) => [
        styles.seat,
        shape,
        { backgroundColor: rec ? colors.recl : colors.seat },
        taken && { backgroundColor: colors.transparent, borderWidth: 1.5, borderColor: rec ? colors.reclTaken : colors.taken },
        selected && styles.selected,
        pressed && !taken && { transform: [{ translateY: -1 }], opacity: 0.85 },
      ]}
    >
      {selected && (
        <Text weight="bold" color={colors.selInk} style={{ fontSize: size * 0.42, lineHeight: size * 0.5 }}>
          {cell.num}
        </Text>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  seat: { alignItems: "center", justifyContent: "center" },
  selected: {
    backgroundColor: colors.sel,
    shadowColor: colors.sel,
    shadowOpacity: 0.55,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 0 },
  },
});
