import React from "react";
import { StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTranslation } from "react-i18next";
import { FilmSlateIcon, HouseIcon, TicketIcon, UserIcon, type Icon } from "phosphor-react-native";
import colors from "@constants/styles/color";
import { fontFamily } from "@constants/styles/typography";
import type { TabParamList } from "@app-types/navigation";
import HomeScreen from "@modules/home/main.screen";
import CinemasScreen from "@modules/cinemas/list.screen";
import TicketsScreen from "@modules/tickets/list.screen";
import ProfileScreen from "@modules/profile/main.screen";

const Tab = createBottomTabNavigator<TabParamList>();

const ICONS: Record<keyof TabParamList, Icon> = {
  Home: HouseIcon,
  Cinemas: FilmSlateIcon,
  Tickets: TicketIcon,
  Profile: UserIcon,
};

const LABEL_KEY = { Home: "tabs.home", Cinemas: "tabs.cinemas", Tickets: "tabs.tickets", Profile: "tabs.profile" } as const;

export default function TabNavigator() {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const I = ICONS[route.name];
        return {
          headerShown: false,
          tabBarLabel: t(LABEL_KEY[route.name]),
          tabBarIcon: ({ color, focused }) => <I size={22} color={color} weight={focused ? "fill" : "regular"} />,
          tabBarActiveTintColor: colors.text,
          tabBarInactiveTintColor: colors.muted,
          tabBarLabelStyle: { fontFamily: fontFamily.medium, fontSize: 11 },
          tabBarStyle: styles.bar,
        };
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Cinemas" component={CinemasScreen} />
      <Tab.Screen name="Tickets" component={TicketsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.panel,
    borderTopColor: colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
