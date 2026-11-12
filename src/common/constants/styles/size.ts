export const space = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

// DESIGN.md: pills for buttons, 8 for controls, 12 for cards, 16 for sheets and popups
export const radius = {
  sm: 8,
  md: 12,
  lg: 12,
  xl: 16,
  pill: 999,
} as const;

// Horizontal page gutter used by every screen
export const GUTTER = space.md;
