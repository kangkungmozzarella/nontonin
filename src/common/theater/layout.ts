// Auditorium geometry shared by the 2D seat map, the mini map and the 3D scene.
// All distances are in meters. The screen sits on the plane z = 0 and the
// audience faces -z. Ported from legacy-web/src/data.js.

export const ROWS = "ABCDEFGHI".split("");
export const PER = 14; // seats per row
export const RECL_FROM = 7; // row index where recliners start (H)
// Column indices after which an aisle runs: blocks of 3 | 8 | 3
export const AISLE_AFTER = [2, 10] as const;

export const SP = 0.62; // seat pitch, center to center
export const AISLE = 0.75; // extra width for each aisle
export const SCREEN = { w: 10, h: 4.18, cy: 4.29 };

export const rowZ: number[] = [];
{
  let z = 4.5;
  for (let i = 0; i < ROWS.length; i++) {
    if (i) z += i >= RECL_FROM ? 1.6 : 1.15;
    rowZ.push(z);
  }
}

// Stadium riser height per row
export const rowFloor = (row: number) => (row < 2 ? 0 : (row - 1) * 0.34);

const mid = (PER - 1) / 2;
export const seatX = (col: number) =>
  (col - mid) * SP + (col <= AISLE_AFTER[0] ? -AISLE : col > AISLE_AFTER[1] ? AISLE : 0);

export const isAisleAfter = (col: number) => (AISLE_AFTER as readonly number[]).includes(col);

export type SeatKind = "std" | "rec";

export interface SeatCell {
  id: string; // e.g. "F8"
  row: number;
  col: number;
  num: number;
  kind: SeatKind;
}

export const SEAT_CELLS: SeatCell[] = ROWS.flatMap((R, row) =>
  Array.from({ length: PER }, (_, col) => ({
    id: R + (col + 1),
    row,
    col,
    num: col + 1,
    kind: (row >= RECL_FROM ? "rec" : "std") as SeatKind,
  })),
);

export const seatAt = (row: number, col: number) => SEAT_CELLS[row * PER + col];
export const seatById = (id: string) => SEAT_CELLS.find((s) => s.id === id);

// Seated eye position
export function eyeOf(s: SeatCell) {
  const rec = s.kind === "rec";
  return {
    x: seatX(s.col),
    y: rowFloor(s.row) + (rec ? 1.05 : 1.15),
    z: rowZ[s.row] + (rec ? 0.22 : 0.12),
  };
}

export function mulberry(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
