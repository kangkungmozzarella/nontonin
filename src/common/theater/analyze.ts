import { SCREEN, SeatCell, eyeOf } from "./layout";

export type SeatTag = "upClose" | "side" | "immersive" | "sweet" | "great" | "full";

export interface SeatAnalysis {
  fov: number; // horizontal degrees of view the screen fills
  off: number; // degrees off the screen's center line
  tilt: number; // degrees you look up
  dist: number; // meters from eye to screen center
  tag: SeatTag;
}

const deg = (r: number) => (r * 180) / Math.PI;

export function analyze(s: SeatCell): SeatAnalysis {
  const e = eyeOf(s);
  const dz = e.z;
  const fov = deg(Math.atan((SCREEN.w / 2 - e.x) / dz) - Math.atan((-SCREEN.w / 2 - e.x) / dz));
  const off = deg(Math.atan(Math.abs(e.x) / dz));
  const tilt = deg(Math.atan((SCREEN.cy - e.y) / dz));
  const dist = Math.hypot(e.x, SCREEN.cy - e.y, dz);

  let tag: SeatTag;
  if (fov >= 74) tag = "upClose";
  else if (off > 20) tag = "side";
  else if (fov >= 60) tag = "immersive";
  else if (fov >= 47) tag = off <= 9 ? "sweet" : "great";
  else tag = "full";

  return { fov, off, tilt, dist, tag };
}

export const TAG_COLOR: Record<SeatTag, string> = {
  upClose: "#FFB86B",
  side: "#FF8F8F",
  immersive: "#9DB8FF",
  sweet: "#7CF2B4",
  great: "#7CF2B4",
  full: "#D0B8FF",
};
