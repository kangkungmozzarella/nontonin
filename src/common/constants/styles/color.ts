// Palette from DESIGN.md (shared with the web app). Contrast ratios noted where a pairing is used.
const colors = {
  bg: "#0B0A0E",
  panel: "#16151A",
  panel2: "#1D1C22",
  line: "#2A2930",
  lineStrong: "#3A3940",

  text: "#F3F2EF",
  muted: "#8F8D95", // 5.2:1 on panel
  dim: "#8A8890", // 5.19:1 on panel

  // Red curtain accent: primary button, active item, selected seat only
  accent: "#C8102E", // 3.35:1 on bg, so never small text on dark
  accentPressed: "#A80D26",
  onAccent: "#F3F2EF", // 5.26:1 on accent
  accentSoft: "rgba(200,16,46,0.16)",

  // Seat states (non-text, 3:1 against bg)
  seatFill: "#1D1C22",
  seatLine: "#6A6971", // 3.64:1
  takenFill: "#26252C",
  takenMark: "#8A8890",
  recl: "#9A6A42", // leather, 4.24:1
  reclFill: "#2A2019",

  star: "#FFB86B",
  danger: "#FF8F8F",

  overlay: "rgba(5,5,8,0.72)",
  scrim: "rgba(11,10,14,0.88)",
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
} as const;

export default colors;
