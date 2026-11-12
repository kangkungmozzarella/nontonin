import * as Linking from "expo-linking";
import type { LinkingOptions } from "@react-navigation/native";
import type { RootStackParamList } from "@app-types/navigation";

// Deep links, e.g. for promo links and push notifications:
//   nontonin://film/lautan-pasir
//   nontonin://cinema/braga
//   nontonin://seat/<showtimeId>?focusSeat=F8
//   nontonin://tickets
export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL("/"), "nontonin://"],
  config: {
    screens: {
      Tabs: {
        screens: {
          Home: "home",
          Cinemas: "cinemas",
          Tickets: "tickets",
          Profile: "profile",
        },
      },
      FilmDetail: "film/:filmId",
      CinemaDetail: "cinema/:cinemaId",
      SeatSelect: {
        path: "seat/:showtimeId",
        parse: { readOnly: (v: string) => v === "1" || v === "true" },
      },
      CityPicker: "city",
      About: "about",
    },
  },
};
