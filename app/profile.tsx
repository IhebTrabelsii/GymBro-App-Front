import { Colors } from "@/constants/Colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useFocusEffect } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSimpleTheme } from "../context/SimpleThemeContext";

const { width } = Dimensions.get("window");

// ✅ Move this to a config file later
const API_BASE_URL = "http://192.168.100.143:3000";

// ==================== Types ====================
interface UserProfile {
  _id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  fullName?: string;
  bio?: string;
  location?: string;
  birthDate?: string;
  height?: number;
  weight?: number;
  fitnessLevel?: "beginner" | "intermediate" | "advanced";
  goals?: string[];
  preferences?: {
    notifications: boolean;
    privacy: "public" | "private";
  };
}

interface UserStats {
  totalWorkouts: number;
  currentStreak: number;
  longestStreak: number;
  totalPRs: number;
  totalMinutes: number;
  achievements: number;
}

interface ProfileResponse {
  user: UserProfile;
}

interface StatsResponse {
  stats: UserStats;
}

// ==================== Main Component ====================
export default function ProfileScreen() {
  const router = useRouter();
  const { theme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === "dark";

  // State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ========== Fetch profile data ==========
  const fetchProfile = async () => {
    try {
      setError(null);
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        router.replace("/login");
        return;
      }

      // Fetch user profile
      const profileRes = await fetch(`${API_BASE_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = (await profileRes.json()) as ProfileResponse;
      
      if (!profileRes.ok) {
        throw new Error(
          (profileData as any).message || "Failed to load profile",
        );
      }
      setProfile(profileData.user);

      // Fetch user stats
      try {
        const statsRes = await fetch(`${API_BASE_URL}/api/users/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const statsData = (await statsRes.json()) as StatsResponse;
        if (statsRes.ok) setStats(statsData.stats);
      } catch (err) {
        // Default stats if endpoint doesn't exist yet
        setStats({
          totalWorkouts: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalPRs: 0,
          totalMinutes: 0,
          achievements: 0,
        });
      }
    } catch (err: any) {
      setError(err.message || "Network error");
      Alert.alert("Error", err.message || "Could not load profile");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchProfile();
  }, []);

  // Refresh when returning from edit profile
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  // ========== HANDLERS ==========

  // ✅ LOGOUT - Fully working
  const handleLogout = async () => {
    Alert.alert(
      "Logout", 
      "Are you sure you want to logout?", 
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              // Clear all stored data
              await AsyncStorage.multiRemove([
                "userToken", 
                "username", 
                "userRole", 
                "userId"
              ]);
              // Navigate to login and reset navigation stack
              router.replace("/login");
            } catch (error) {
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // ✅ EDIT PROFILE - Navigates to edit screen
  const handleEditProfile = () => {
    router.push("/edit-profile");
  };

  // ✅ CHANGE PASSWORD - Navigate to change password screen
  const handleChangePassword = () => {
    router.push("/change-password");
  };

  // ✅ NOTIFICATION SETTINGS - Navigate to notification preferences
  const handleNotificationSettings = () => {
    router.push("/notification-settings");
  };

  // ✅ PRIVACY SETTINGS - Navigate to privacy settings
  const handlePrivacySettings = () => {
    router.push("/privacy-settings");
  };

  // ========== Loading / Error ==========
  if (loading) {
    return (
      <View
        style={[styles.centered, { backgroundColor: currentColors.background }]}
      >
        <ActivityIndicator size="large" color={currentColors.primary} />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View
        style={[styles.centered, { backgroundColor: currentColors.background }]}
      >
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={60}
          color={currentColors.primary}
        />
        <Text style={[styles.errorText, { color: currentColors.text }]}>
          {error || "Failed to load profile"}
        </Text>
        <TouchableOpacity
          style={[
            styles.retryButton,
            { backgroundColor: currentColors.primary },
          ]}
          onPress={fetchProfile}
        >
          <Text style={[styles.retryText, { color: isDark ? "#000" : "#FFF" }]}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Default stats if not fetched
  const displayStats = stats || {
    totalWorkouts: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalPRs: 0,
    totalMinutes: 0,
    achievements: 0,
  };

  // Format date
  const memberSince = new Date(profile.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <View
      style={[styles.container, { backgroundColor: currentColors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchProfile();
            }}
            tintColor={currentColors.primary}
          />
        }
      >
        {/* ========== HEADER with back + edit ========== */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerButton}
          >
            <Ionicons name="arrow-back" size={24} color={currentColors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: currentColors.text }]}>
            Profile
          </Text>
          <TouchableOpacity
            onPress={handleEditProfile}
            style={styles.headerButton}
          >
            <Ionicons
              name="create-outline"
              size={24}
              color={currentColors.text}
            />
          </TouchableOpacity>
        </View>

        {/* ========== PROFILE CARD ========== */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: isDark ? currentColors.card : "#FFFFFF",
              borderColor: currentColors.primary,
              shadowColor: currentColors.primary,
            },
          ]}
        >
          {/* Avatar with glow effect */}
          <View style={styles.avatarContainer}>
            <View
              style={[
                styles.avatarGlow,
                {
                  backgroundColor: isDark
                    ? "rgba(57, 255, 20, 0.3)"
                    : "rgba(57, 255, 20, 0.2)",
                },
              ]}
            />
            <View
              style={[
                styles.avatarWrapper,
                {
                  backgroundColor: isDark
                    ? "rgba(57, 255, 20, 0.2)"
                    : "rgba(57, 255, 20, 0.1)",
                  borderColor: currentColors.primary,
                },
              ]}
            >
              <Text
                style={[styles.avatarText, { color: currentColors.primary }]}
              >
                {profile.username.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={[styles.userName, { color: currentColors.text }]}>
            {profile.fullName || profile.username}
          </Text>
          <Text
            style={[
              styles.userEmail,
              { color: isDark ? "rgba(255,255,255,0.7)" : "#666" },
            ]}
          >
            {profile.email}
          </Text>

          <View style={styles.roleBadgeContainer}>
            <View
              style={[
                styles.roleBadge,
                {
                  backgroundColor:
                    profile.role === "admin"
                      ? "rgba(255, 107, 107, 0.2)"
                      : "rgba(57, 255, 20, 0.2)",
                  borderColor:
                    profile.role === "admin"
                      ? "rgba(255, 107, 107, 0.5)"
                      : "rgba(57, 255, 20, 0.5)",
                },
              ]}
            >
              <Text
                style={[
                  styles.roleText,
                  {
                    color:
                      profile.role === "admin"
                        ? "#FF6B6B"
                        : currentColors.primary,
                  },
                ]}
              >
                {profile.role.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Bio if exists */}
          {profile.bio && (
            <Text
              style={[
                styles.bio,
                { color: isDark ? "rgba(255,255,255,0.8)" : "#444" },
              ]}
            >
              {profile.bio}
            </Text>
          )}

          {/* Location & Member since */}
          <View style={styles.metaContainer}>
            {profile.location && (
              <View style={styles.metaItem}>
                <Ionicons
                  name="location-outline"
                  size={16}
                  color={currentColors.primary}
                />
                <Text
                  style={[
                    styles.metaText,
                    { color: isDark ? "rgba(255,255,255,0.7)" : "#666" },
                  ]}
                >
                  {profile.location}
                </Text>
              </View>
            )}
            <View style={styles.metaItem}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color={currentColors.primary}
              />
              <Text
                style={[
                  styles.metaText,
                  { color: isDark ? "rgba(255,255,255,0.7)" : "#666" },
                ]}
              >
                Joined {memberSince}
              </Text>
            </View>
          </View>
        </View>

        {/* ========== STATS GRID ========== */}
        <View style={styles.statsGrid}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: isDark ? currentColors.card : "#FFFFFF" },
            ]}
          >
            <View
              style={[
                styles.statIcon,
                { backgroundColor: "rgba(255, 107, 107, 0.15)" },
              ]}
            >
              <Ionicons name="flame" size={24} color="#FF6B6B" />
            </View>
            <Text style={[styles.statNumber, { color: currentColors.text }]}>
              {displayStats.currentStreak}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: isDark ? "rgba(255,255,255,0.6)" : "#666" },
              ]}
            >
              Day Streak
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: isDark ? currentColors.card : "#FFFFFF" },
            ]}
          >
            <View
              style={[
                styles.statIcon,
                { backgroundColor: "rgba(255, 193, 7, 0.15)" },
              ]}
            >
              <Ionicons name="barbell-outline" size={24} color="#FFC107" />
            </View>
            <Text style={[styles.statNumber, { color: currentColors.text }]}>
              {displayStats.totalWorkouts}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: isDark ? "rgba(255,255,255,0.6)" : "#666" },
              ]}
            >
              Workouts
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: isDark ? currentColors.card : "#FFFFFF" },
            ]}
          >
            <View
              style={[
                styles.statIcon,
                { backgroundColor: "rgba(57, 255, 20, 0.15)" },
              ]}
            >
              <MaterialCommunityIcons
                name="weight-lifter"
                size={24}
                color={currentColors.primary}
              />
            </View>
            <Text style={[styles.statNumber, { color: currentColors.text }]}>
              {displayStats.totalPRs}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: isDark ? "rgba(255,255,255,0.6)" : "#666" },
              ]}
            >
              PRs
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: isDark ? currentColors.card : "#FFFFFF" },
            ]}
          >
            <View
              style={[
                styles.statIcon,
                { backgroundColor: "rgba(0, 122, 255, 0.15)" },
              ]}
            >
              <Ionicons name="time-outline" size={24} color="#007AFF" />
            </View>
            <Text style={[styles.statNumber, { color: currentColors.text }]}>
              {Math.floor(displayStats.totalMinutes / 60)}h
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: isDark ? "rgba(255,255,255,0.6)" : "#666" },
              ]}
            >
              Total Time
            </Text>
          </View>
        </View>

        {/* ========== FITNESS METRICS ========== */}
        {(profile.height || profile.weight) && (
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: isDark ? currentColors.card : "#FFFFFF",
                borderColor: isDark
                  ? "rgba(57,255,20,0.3)"
                  : "rgba(57,255,20,0.15)",
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <View
                  style={[
                    styles.sectionIcon,
                    {
                      backgroundColor: isDark
                        ? "rgba(57,255,20,0.15)"
                        : "rgba(57,255,20,0.08)",
                    },
                  ]}
                >
                  <Ionicons
                    name="fitness-outline"
                    size={20}
                    color={currentColors.primary}
                  />
                </View>
                <Text
                  style={[styles.sectionTitle, { color: currentColors.text }]}
                >
                  Fitness Metrics
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.push("/calculator")}>
                <Text
                  style={[
                    styles.sectionAction,
                    { color: currentColors.primary },
                  ]}
                >
                  Update
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.metricsGrid}>
              {profile.height && (
                <View style={styles.metricItem}>
                  <Text
                    style={[
                      styles.metricLabel,
                      { color: isDark ? "rgba(255,255,255,0.6)" : "#666" },
                    ]}
                  >
                    Height
                  </Text>
                  <Text
                    style={[styles.metricValue, { color: currentColors.text }]}
                  >
                    {profile.height} <Text style={styles.metricUnit}>cm</Text>
                  </Text>
                </View>
              )}
              {profile.weight && (
                <View style={styles.metricItem}>
                  <Text
                    style={[
                      styles.metricLabel,
                      { color: isDark ? "rgba(255,255,255,0.6)" : "#666" },
                    ]}
                  >
                    Weight
                  </Text>
                  <Text
                    style={[styles.metricValue, { color: currentColors.text }]}
                  >
                    {profile.weight} <Text style={styles.metricUnit}>kg</Text>
                  </Text>
                </View>
              )}
              {profile.height && profile.weight && (
                <>
                  <View style={styles.metricItem}>
                    <Text
                      style={[
                        styles.metricLabel,
                        { color: isDark ? "rgba(255,255,255,0.6)" : "#666" },
                      ]}
                    >
                      BMI
                    </Text>
                    <Text
                      style={[
                        styles.metricValue,
                        { color: currentColors.text },
                      ]}
                    >
                      {(profile.weight / (profile.height / 100) ** 2).toFixed(
                        1,
                      )}
                    </Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text
                      style={[
                        styles.metricLabel,
                        { color: isDark ? "rgba(255,255,255,0.6)" : "#666" },
                      ]}
                    >
                      BMR
                    </Text>
                    <Text
                      style={[
                        styles.metricValue,
                        { color: currentColors.text },
                      ]}
                    >
                      {Math.round(
                        10 * profile.weight +
                          6.25 * profile.height -
                          5 * 25 + // placeholder age
                          (profile.role === "admin" ? 5 : -161),
                      )}{" "}
                      <Text style={styles.metricUnit}>kcal</Text>
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {/* ========== ACHIEVEMENTS ========== */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: isDark ? currentColors.card : "#FFFFFF",
              borderColor: isDark
                ? "rgba(57,255,20,0.3)"
                : "rgba(57,255,20,0.15)",
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <View
                style={[
                  styles.sectionIcon,
                  {
                    backgroundColor: isDark
                      ? "rgba(57,255,20,0.15)"
                      : "rgba(57,255,20,0.08)",
                  },
                ]}
              >
                <Ionicons
                  name="trophy-outline"
                  size={20}
                  color={currentColors.primary}
                />
              </View>
              <Text
                style={[styles.sectionTitle, { color: currentColors.text }]}
              >
                Achievements
              </Text>
            </View>
            <Text
              style={[styles.sectionCount, { color: currentColors.primary }]}
            >
              {displayStats.achievements}
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgesContainer}
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <View key={i} style={styles.badgeItem}>
                <View
                  style={[
                    styles.badgeIcon,
                    {
                      backgroundColor: isDark
                        ? "rgba(57,255,20,0.15)"
                        : "rgba(57,255,20,0.08)",
                      borderColor:
                        i <= displayStats.achievements
                          ? currentColors.primary
                          : "transparent",
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      i <= displayStats.achievements
                        ? "trophy"
                        : "trophy-outline"
                    }
                    size={28}
                    color={
                      i <= displayStats.achievements
                        ? currentColors.primary
                        : "#999"
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.badgeLabel,
                    {
                      color:
                        i <= displayStats.achievements
                          ? currentColors.text
                          : isDark
                            ? "rgba(255,255,255,0.4)"
                            : "#999",
                    },
                  ]}
                >
                  {i === 1 && "First"}
                  {i === 2 && "Week"}
                  {i === 3 && "Month"}
                  {i === 4 && "Strength"}
                  {i === 5 && "Elite"}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ========== ACCOUNT SETTINGS ========== */}
        <View style={styles.settingsSection}>
          <Text style={[styles.settingsHeader, { color: currentColors.text }]}>
            Account
          </Text>

          {/* ✅ Edit Profile - WORKING */}
          <TouchableOpacity
            style={[
              styles.settingItem,
              {
                backgroundColor: isDark ? currentColors.card : "#FFFFFF",
                borderColor: isDark
                  ? "rgba(57,255,20,0.3)"
                  : "rgba(57,255,20,0.15)",
              },
            ]}
            onPress={handleEditProfile}
          >
            <View style={styles.settingLeft}>
              <View
                style={[
                  styles.settingIcon,
                  {
                    backgroundColor: isDark
                      ? "rgba(57,255,20,0.15)"
                      : "rgba(57,255,20,0.08)",
                  },
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={currentColors.primary}
                />
              </View>
              <View>
                <Text
                  style={[styles.settingTitle, { color: currentColors.text }]}
                >
                  Edit Profile
                </Text>
                <Text
                  style={[
                    styles.settingSubtitle,
                    { color: isDark ? "rgba(255,255,255,0.5)" : "#999" },
                  ]}
                >
                  Change name, bio, location
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDark ? "rgba(255,255,255,0.4)" : "#999"}
            />
          </TouchableOpacity>

          {/* ✅ Change Password - READY (needs screen) */}
          <TouchableOpacity
            style={[
              styles.settingItem,
              {
                backgroundColor: isDark ? currentColors.card : "#FFFFFF",
                borderColor: isDark
                  ? "rgba(57,255,20,0.3)"
                  : "rgba(57,255,20,0.15)",
              },
            ]}
            onPress={handleChangePassword}
          >
            <View style={styles.settingLeft}>
              <View
                style={[
                  styles.settingIcon,
                  {
                    backgroundColor: isDark
                      ? "rgba(57,255,20,0.15)"
                      : "rgba(57,255,20,0.08)",
                  },
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={currentColors.primary}
                />
              </View>
              <View>
                <Text
                  style={[styles.settingTitle, { color: currentColors.text }]}
                >
                  Change Password
                </Text>
                <Text
                  style={[
                    styles.settingSubtitle,
                    { color: isDark ? "rgba(255,255,255,0.5)" : "#999" },
                  ]}
                >
                  Update your password
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDark ? "rgba(255,255,255,0.4)" : "#999"}
            />
          </TouchableOpacity>

          {/* ✅ Notification Settings - READY (needs screen) */}
          <TouchableOpacity
            style={[
              styles.settingItem,
              {
                backgroundColor: isDark ? currentColors.card : "#FFFFFF",
                borderColor: isDark
                  ? "rgba(57,255,20,0.3)"
                  : "rgba(57,255,20,0.15)",
              },
            ]}
            onPress={handleNotificationSettings}
          >
            <View style={styles.settingLeft}>
              <View
                style={[
                  styles.settingIcon,
                  {
                    backgroundColor: isDark
                      ? "rgba(57,255,20,0.15)"
                      : "rgba(57,255,20,0.08)",
                  },
                ]}
              >
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color={currentColors.primary}
                />
              </View>
              <View>
                <Text
                  style={[styles.settingTitle, { color: currentColors.text }]}
                >
                  Notifications
                </Text>
                <Text
                  style={[
                    styles.settingSubtitle,
                    { color: isDark ? "rgba(255,255,255,0.5)" : "#999" },
                  ]}
                >
                  Manage push notifications
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDark ? "rgba(255,255,255,0.4)" : "#999"}
            />
          </TouchableOpacity>

          {/* ✅ Privacy Settings - READY (needs screen) */}
          <TouchableOpacity
            style={[
              styles.settingItem,
              {
                backgroundColor: isDark ? currentColors.card : "#FFFFFF",
                borderColor: isDark
                  ? "rgba(57,255,20,0.3)"
                  : "rgba(57,255,20,0.15)",
              },
            ]}
            onPress={handlePrivacySettings}
          >
            <View style={styles.settingLeft}>
              <View
                style={[
                  styles.settingIcon,
                  {
                    backgroundColor: isDark
                      ? "rgba(57,255,20,0.15)"
                      : "rgba(57,255,20,0.08)",
                  },
                ]}
              >
                <Ionicons
                  name="shield-outline"
                  size={20}
                  color={currentColors.primary}
                />
              </View>
              <View>
                <Text
                  style={[styles.settingTitle, { color: currentColors.text }]}
                >
                  Privacy
                </Text>
                <Text
                  style={[
                    styles.settingSubtitle,
                    { color: isDark ? "rgba(255,255,255,0.5)" : "#999" },
                  ]}
                >
                  Control profile visibility
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDark ? "rgba(255,255,255,0.4)" : "#999"}
            />
          </TouchableOpacity>
        </View>

        {/* ✅ LOGOUT BUTTON - FULLY WORKING */}
        <TouchableOpacity
          style={[
            styles.logoutButton,
            {
              backgroundColor: isDark ? "rgba(255, 107, 107, 0.15)" : "#FFF2F2",
              borderColor: "rgba(255, 107, 107, 0.3)",
            },
          ]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={22} color="#FF6B6B" />
          <Text style={[styles.logoutText, { color: "#FF6B6B" }]}>Logout</Text>
        </TouchableOpacity>

        {/* ========== APP VERSION ========== */}
        <Text
          style={[
            styles.versionText,
            { color: isDark ? "rgba(255,255,255,0.3)" : "#CCC" },
          ]}
        >
          GymBro v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}
// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryText: {
    fontSize: 16,
    fontWeight: "700",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  profileCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatarGlow: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    top: -5,
    left: -5,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(57,255,20,0.1)",
  },
  avatarText: {
    fontSize: 44,
    fontWeight: "800",
  },
  userName: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  userEmail: {
    fontSize: 15,
    marginBottom: 12,
  },
  roleBadgeContainer: {
    marginBottom: 16,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },
  bio: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  metaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    fontWeight: "500",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 64) / 2,
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: "600",
  },
  sectionCount: {
    fontSize: 20,
    fontWeight: "800",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  metricItem: {
    width: (width - 100) / 2,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  metricUnit: {
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.7,
  },
  badgesContainer: {
    paddingVertical: 8,
    gap: 16,
  },
  badgeItem: {
    alignItems: "center",
    marginRight: 16,
    width: 80,
  },
  badgeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 2,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  settingsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  settingsHeader: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
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
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    gap: 10,
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "700",
  },
  versionText: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "500",
    marginTop: 8,
  },
});