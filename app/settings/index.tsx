import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSimpleTheme } from "../../context/SimpleThemeContext";
import { useMusic } from "../../context/MusicContext";

const { width } = Dimensions.get("window");

type SettingsItem = {
  icon: string;
  iconColor: string;
  title: string;
  description: string;
  type: "toggle" | "button" | "link" | "info";
  value?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
  disabled?: boolean;
};

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, toggleTheme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === "dark";

  const { isPlaying, playMusic, pauseMusic, hasValidTracks } = useMusic();
  const [musicEnabled, setMusicEnabled] = useState(isPlaying);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotificationPreference();
  }, []);

  const loadNotificationPreference = async () => {
    try {
      const saved = await AsyncStorage.getItem("notificationsEnabled");
      if (saved !== null) {
        setNotificationsEnabled(saved === "true");
      }
    } catch (error) {
      console.error("Error loading notification preference:", error);
    }
  };

  const toggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    await AsyncStorage.setItem("notificationsEnabled", String(value));
  };

  const toggleMusicSetting = async (value: boolean) => {
    setMusicEnabled(value);
    if (value) {
      await playMusic();
    } else {
      await pauseMusic();
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache",
      "This will clear temporary data like chat history. Your account data will not be affected.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("aiChatHistory");
              Alert.alert("Success", "Cache cleared successfully!");
            } catch (error) {
              Alert.alert("Error", "Failed to clear cache");
            }
          },
        },
      ],
    );
  };

  const settingsSections: { title: string; items: SettingsItem[] }[] = [
    {
      title: "PREFERENCES",
      items: [
        {
          icon: isDark ? "sunny" : "moon",
          iconColor: currentColors.primary,
          title: "Dark Mode",
          description: "Toggle light/dark theme",
          type: "toggle",
          value: isDark,
          onToggle: () => toggleTheme(),
        },
        {
          icon: "musical-notes",
          iconColor: currentColors.primary,
          title: "Background Music",
          description: hasValidTracks
            ? "Enable workout music"
            : "Add music files to enable",
          type: "toggle",
          value: musicEnabled,
          onToggle: toggleMusicSetting,
          disabled: !hasValidTracks,
        },
        {
          icon: "notifications",
          iconColor: currentColors.primary,
          title: "Push Notifications",
          description: "Get workout reminders and updates",
          type: "toggle",
          value: notificationsEnabled,
          onToggle: toggleNotifications,
        },
      ],
    },
    {
      title: "CONTENT",
      items: [
        {
          icon: "chatbubbles",
          iconColor: "#FF9500",
          title: "Clear Chat History",
          description: "Delete all AI Coach conversations",
          type: "button",
          onPress: handleClearCache,
        },
      ],
    },
    {
      title: "SUPPORT",
      items: [
        {
          icon: "document-text",
          iconColor: "#007AFF",
          title: "Privacy Policy",
          description: "Read our privacy policy",
          type: "link",
          onPress: () => {
            console.log("Privacy Policy pressed");
            router.push("/settings/privacy-policy");
          },
        },
        {
          icon: "shield-checkmark",
          iconColor: "#34C759",
          title: "Terms of Service",
          description: "Read our terms and conditions",
          type: "link",
          onPress: () => {
            console.log("Terms pressed");
            router.push("/settings/terms-of-service");
          },
        },
{
  icon: "mail",
  iconColor: "#AF52DE",
  title: "Contact Support",
  description: "Get help from our team",
  type: "link",
  onPress: () => router.push("/settings/contact-support"),
},
        {
          icon: "star",
          iconColor: "#FFD700",
          title: "Rate the App",
          description: "Leave a review on the store",
          type: "link",
          onPress: () =>
            Alert.alert(
              "Coming Soon",
              "App store rating will be available soon",
            ),
        },
      ],
    },
    {
      title: "ABOUT",
      items: [
        {
          icon: "information-circle",
          iconColor: currentColors.primary,
          title: "Version",
          description: "GymBro v1.0.0",
          type: "info",
        },
        {
          icon: "build",
          iconColor: "#888",
          title: "Build",
          description:
            Platform.OS === "ios" ? "iOS • Build 1" : "Android • Build 1",
          type: "info",
        },
      ],
    },
  ];

  return (
    <View
      style={[styles.container, { backgroundColor: currentColors.background }]}
    >
      {}
      <View
        style={[
          styles.header,
          {
            backgroundColor: isDark
              ? "rgba(10,10,10,0.97)"
              : "rgba(255,255,255,0.97)",
            borderBottomColor: isDark
              ? "rgba(57,255,20,0.12)"
              : "rgba(57,255,20,0.08)",
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={currentColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentColors.text }]}>
          Settings
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text
              style={[styles.sectionTitle, { color: isDark ? "#888" : "#999" }]}
            >
              {section.title}
            </Text>

            {section.items.map((item, itemIndex) => (
              <View
                key={itemIndex}
                style={[
                  styles.settingItem,
                  {
                    backgroundColor: isDark ? "rgba(15,23,42,0.7)" : "#fff",
                    borderColor: isDark
                      ? "rgba(57,255,20,0.15)"
                      : "rgba(57,255,20,0.08)",
                  },
                ]}
              >
                <View style={styles.settingLeft}>
                  <View
                    style={[
                      styles.settingIcon,
                      { backgroundColor: item.iconColor + "15" },
                    ]}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={22}
                      color={item.iconColor}
                    />
                  </View>
                  <View style={styles.settingText}>
                    <Text
                      style={[
                        styles.settingTitle,
                        { color: currentColors.text },
                      ]}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={[
                        styles.settingDescription,
                        { color: isDark ? "#777" : "#aaa" },
                      ]}
                    >
                      {item.description}
                    </Text>
                  </View>
                </View>

                {item.type === "toggle" && item.onToggle && (
                  <Switch
                    value={item.value || false}
                    onValueChange={item.onToggle}
                    trackColor={{ false: "#333", true: currentColors.primary }}
                    thumbColor={item.value ? "#fff" : "#f4f3f4"}
                    disabled={item.disabled || false}
                  />
                )}

                {item.type === "button" && item.onPress && (
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { borderColor: currentColors.primary + "40" },
                    ]}
                    onPress={item.onPress}
                  >
                    <Text
                      style={[
                        styles.actionButtonText,
                        { color: currentColors.primary },
                      ]}
                    >
                      Clear
                    </Text>
                  </TouchableOpacity>
                )}

                {(item.type === "link" || item.type === "info") && (
                  <TouchableOpacity
                    onPress={item.onPress}
                    disabled={item.type === "info"}
                    style={styles.linkButton}
                  >
                    <Ionicons
                      name={
                        item.type === "link"
                          ? "chevron-forward"
                          : "information-circle-outline"
                      }
                      size={20}
                      color={isDark ? "#555" : "#ccc"}
                    />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        ))}

        {}
        <Text style={[styles.footerText, { color: isDark ? "#333" : "#ddd" }]}>
          Made with 💪 for fitness enthusiasts
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
  },
  actionButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  linkButton: {
    padding: 8,
  },
  footerText: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 32,
    marginBottom: 20,
  },
});
