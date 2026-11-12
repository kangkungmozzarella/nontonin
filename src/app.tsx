import React from "react";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { I18nextProvider } from "react-i18next";
import { QueryClientProvider } from "@tanstack/react-query";
import { NavigationContainer, DarkTheme, type Theme } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import colors from "@constants/styles/color";
import { FONT_SOURCES } from "@constants/styles/typography";
import { localStorage } from "@helpers/local-storage";
import { queryClient } from "@common/api/query-client";
import AnimatedSplashScreen from "@common/animated-splash-screen";
import { ToastProvider } from "@components/toast";
import { CityProvider } from "@hooks/use-city";
import { LocationProvider } from "@hooks/use-user-location";
import { BookingsProvider } from "@hooks/use-bookings";
import { AppReadyContext } from "@hooks/use-app-ready";
import { initI18n } from "@locales/index";
import RootNavigator from "@navigators/root.navigator";
import { linking } from "@navigators/linking";

SplashScreen.preventAutoHideAsync().catch(() => {});

const theme: Theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg, card: colors.panel, primary: colors.sel, text: colors.text, border: colors.line },
};

export default function App() {
  const [fontsLoaded, fontError] = useFonts(FONT_SOURCES);
  const [storageReady, setStorageReady] = React.useState(false);
  const [splashDone, setSplashDone] = React.useState(false);

  React.useEffect(() => {
    localStorage
      .hydrate()
      .catch(() => {})
      .finally(() => {
        initI18n();
        setStorageReady(true);
      });
  }, []);

  // Keep the native splash up until everything the first frame needs is loaded
  if (!storageReady || (!fontsLoaded && !fontError)) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <I18nextProvider i18n={initI18n()}>
          <QueryClientProvider client={queryClient}>
            <LocationProvider>
              <CityProvider>
                <BookingsProvider>
                  <ToastProvider>
                    <AppReadyContext.Provider value={splashDone}>
                      <NavigationContainer theme={theme} linking={linking}>
                        <StatusBar style="light" />
                        <RootNavigator />
                      </NavigationContainer>
                    </AppReadyContext.Provider>
                  </ToastProvider>
                </BookingsProvider>
              </CityProvider>
            </LocationProvider>
          </QueryClientProvider>
        </I18nextProvider>
        {!splashDone && <AnimatedSplashScreen onFinish={() => setSplashDone(true)} />}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
