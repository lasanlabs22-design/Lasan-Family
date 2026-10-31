import type { BottomTabNavigationOptions } from "expo-router/js-tabs";
import { colors, fonts } from "@/theme";

/** Shared tab bar styling for the customer and provider apps. */
export const tabScreenOptions: BottomTabNavigationOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.plum900,
  tabBarInactiveTintColor: colors.textSubtle,
  tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 12 },
  tabBarStyle: { backgroundColor: colors.ivory, borderTopColor: colors.ring, minHeight: 64, paddingTop: 6 },
  tabBarItemStyle: { minHeight: 48 },
  sceneStyle: { backgroundColor: colors.cream },
};
