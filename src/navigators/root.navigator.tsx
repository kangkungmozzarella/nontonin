import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import colors from "@constants/styles/color";
import { FirstRun } from "@helpers/local-storage";
import type { RootStackParamList } from "@app-types/navigation";
import TabNavigator from "./tab.navigator";
import OnboardingScreen from "@modules/onboarding";
import CityPickerScreen from "@modules/city-picker/main.screen";
import FilmDetailScreen from "@modules/film/detail.screen";
import CinemaDetailScreen from "@modules/cinemas/detail.screen";
import SeatSelectScreen from "@modules/seat/main.screen";
import CheckoutScreen from "@modules/checkout/main.screen";
import PaymentSuccessScreen from "@modules/checkout/success.screen";
import TicketDetailScreen from "@modules/tickets/detail.screen";
import AboutScreen from "@modules/profile/about.screen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  // Read once: onboarding replaces itself with Tabs when it finishes
  const [initial] = React.useState<keyof RootStackParamList>(() => (FirstRun.isFirstRun() ? "Onboarding" : "Tabs"));

  return (
    <Stack.Navigator
      initialRouteName={initial}
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: "slide_from_right" }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ animation: "fade" }} />
      <Stack.Screen name="Tabs" component={TabNavigator} options={{ animation: "fade" }} />
      <Stack.Screen name="CityPicker" component={CityPickerScreen} options={{ presentation: "modal", animation: "slide_from_bottom" }} />
      <Stack.Screen name="FilmDetail" component={FilmDetailScreen} />
      <Stack.Screen name="CinemaDetail" component={CinemaDetailScreen} />
      <Stack.Screen name="SeatSelect" component={SeatSelectScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} options={{ animation: "fade", gestureEnabled: false }} />
      <Stack.Screen name="TicketDetail" component={TicketDetailScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
  );
}
