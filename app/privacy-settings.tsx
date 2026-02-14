import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useSimpleTheme } from "../context/SimpleThemeContext";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { theme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === "dark";

  return (
    <View style={{ flex: 1, backgroundColor: currentColors.background }}>
      <View style={{ padding: 20, paddingTop: 60, flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={currentColors.text} />
        </TouchableOpacity>
        <Text style={{ marginLeft: 20, fontSize: 20, fontWeight: "800", color: currentColors.text }}>
          Notifications
        </Text>
      </View>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Ionicons name="notifications-off-outline" size={60} color={currentColors.primary} />
        <Text style={{ marginTop: 16, fontSize: 16, color: currentColors.text }}>
          Notification settings coming soon
        </Text>
      </View>
    </View>
  );
}