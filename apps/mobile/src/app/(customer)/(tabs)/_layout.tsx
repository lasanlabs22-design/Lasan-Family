import { Tabs } from "expo-router/js-tabs";
import { CalendarCheck, CirclePlus, House, UserRound } from "lucide-react-native";
import { tabScreenOptions } from "@/components";

export default function CustomerTabs() {
  return (
    <Tabs screenOptions={tabScreenOptions}>
      <Tabs.Screen name="home" options={{ title: "Home", tabBarIcon: ({ color, size }) => <House color={color} size={size} /> }} />
      <Tabs.Screen name="book" options={{ title: "Book", tabBarIcon: ({ color, size }) => <CirclePlus color={color} size={size} /> }} />
      <Tabs.Screen name="bookings" options={{ title: "Bookings", tabBarIcon: ({ color, size }) => <CalendarCheck color={color} size={size} /> }} />
      <Tabs.Screen name="account" options={{ title: "Account", tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} /> }} />
    </Tabs>
  );
}
