import type { NavigatorScreenParams } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

export type TabParamList = {
  Home: undefined;
  Cinemas: undefined;
  Tickets: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  CityPicker: undefined;
  FilmDetail: { filmId: string };
  CinemaDetail: { cinemaId: string };
  // `focusSeat` + `readOnly` open the 3D view of an already booked seat
  SeatSelect: { showtimeId: string; focusSeat?: string; readOnly?: boolean };
  Checkout: { showtimeId: string; seats: string[] };
  PaymentSuccess: { bookingId: string };
  TicketDetail: { bookingId: string };
  About: undefined;
};

export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
