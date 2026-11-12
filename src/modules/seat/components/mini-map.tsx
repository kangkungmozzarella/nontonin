import React from "react";
import { LayoutChangeEvent, Pressable } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import colors from "@constants/styles/color";
import { RECL_FROM, SEAT_CELLS, SeatCell, seatX } from "@common/theater/layout";

const miniY = (r: number) => r + (r >= RECL_FROM ? 0.45 : 0);
const VB = { x: seatX(0) - 0.7, y: -1.5, w: seatX(13) - seatX(0) + 1.4, h: miniY(8) + 2.3 };

interface Props {
  taken: ReadonlySet<string>;
  mine: ReadonlySet<string>;
  current: string | null;
  onPick?: (s: SeatCell) => void;
  width?: number;
}

// Small top-down map in the bottom sheet. Tap it to jump to the nearest open seat.
export default function MiniMap({ taken, mine, current, onPick, width = 116 }: Props) {
  const height = (width * VB.h) / VB.w;
  const [box, setBox] = React.useState({ w: width, h: height });

  const onPress = (x: number, y: number) => {
    if (!onPick) return;
    const k = Math.min(box.w / VB.w, box.h / VB.h);
    const px = VB.x + (x - (box.w - VB.w * k) / 2) / k;
    const py = VB.y + (y - (box.h - VB.h * k) / 2) / k;
    let best: SeatCell | null = null, bd = Infinity;
    for (const s of SEAT_CELLS) {
      if (taken.has(s.id)) continue;
      const d = (seatX(s.col) - px) ** 2 + ((miniY(s.row) - py) * 1.3) ** 2;
      if (d < bd) { bd = d; best = s; }
    }
    if (best && best.id !== current) onPick(best);
  };

  return (
    <Pressable
      onLayout={(e: LayoutChangeEvent) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      onPress={(e) => onPress(e.nativeEvent.locationX, e.nativeEvent.locationY)}
      disabled={!onPick}
      accessibilityLabel="Mini seat map"
      style={{ width, height }}
    >
      <Svg width={width} height={height} viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}>
        <Path
          d={`M${seatX(1)} -0.55 Q0 -1.25 ${seatX(12)} -0.55`}
          fill="none"
          stroke="#d9d6cf"
          strokeWidth={0.14}
          strokeLinecap="round"
        />
        {SEAT_CELLS.map((s) => {
          const isCur = s.id === current, isMine = mine.has(s.id), isTaken = taken.has(s.id);
          const rec = s.kind === "rec";
          return (
            <Rect
              key={s.id}
              x={seatX(s.col) - 0.24}
              y={miniY(s.row) - 0.2}
              width={0.48}
              height={0.4}
              rx={0.1}
              fill={isCur ? colors.sel : isMine ? "rgba(124,242,180,0.55)" : isTaken ? colors.transparent : rec ? colors.recl : colors.seat}
              stroke={isCur ? colors.sel : isTaken ? (rec ? colors.reclTaken : "#34343b") : "none"}
              strokeWidth={isCur ? 0.1 : 0.07}
            />
          );
        })}
      </Svg>
    </Pressable>
  );
}
