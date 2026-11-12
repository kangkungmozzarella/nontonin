import Constants from "expo-constants";

export const APP_NAME = "Nontonin";
export const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";

// Shown on the About screen. The seat-view interaction is based on a concept
// shared publicly by the designer below; fill in `url` with the original post.
export const DESIGN_CREDIT = {
  designer: "Ramin Nasibov",
  url: "https://www.instagram.com/reel/DfgHVQyD98i/",
} as const;

export const MAX_SEATS_PER_ORDER = 6;
export const SERVICE_FEE = 4000;
