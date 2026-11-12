import { type ExpoConfig } from "expo/config";

const BG = "#0B0A0E";

const config: ExpoConfig = {
  name: "Nontonin",
  slug: "nontonin",
  scheme: "nontonin",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "dark",
  backgroundColor: BG,
  platforms: ["ios", "android", "web"],
  web: {
    bundler: "metro",
    output: "single",
    favicon: "./assets/favicon.png",
    name: "Nontonin",
    shortName: "Nontonin",
    description: "Pesan tiket bioskop dan lihat layar dari kursimu dalam 3D sebelum memesan.",
    lang: "id",
    themeColor: BG,
    backgroundColor: BG,
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.nontonin.app",
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        "Nontonin memakai lokasimu untuk menampilkan bioskop terdekat.",
    },
  },
  android: {
    package: "com.nontonin.app",
    adaptiveIcon: {
      backgroundColor: BG,
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      monochromeImage: "./assets/android-icon-monochrome.png",
    },
    permissions: ["ACCESS_COARSE_LOCATION"],
    predictiveBackGestureEnabled: false,
  },
  plugins: [
    [
      "expo-splash-screen",
      {
        image: "./assets/splash-icon.png",
        imageWidth: 180,
        backgroundColor: BG,
      },
    ],
    [
      "expo-location",
      {
        locationWhenInUsePermission:
          "Nontonin memakai lokasimu untuk menampilkan bioskop terdekat.",
      },
    ],
    "expo-localization",
    "expo-font",
    "expo-image",
    "expo-asset",
  ],
};

export default config;
