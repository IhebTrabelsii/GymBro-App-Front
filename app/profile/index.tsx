import { Colors } from "@/constants/Colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useFocusEffect } from "expo-router";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { Linking } from 'react-native';
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
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSimpleTheme } from "../../context/SimpleThemeContext";

const { width } = Dimensions.get("window");

// API URL
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

interface ActivityResponse {
  success: boolean;
  activity: {
    dailyCheckIns: Date[];
    currentStreak: number;
    longestStreak: number;
    lastCheckIn: Date | null;
    weeklyProgress: {
      weekStart: Date;
      completedWorkouts: number;
      weeklyGoal: number;
      rewardClaimed: boolean;
    };
    missions: Mission[];
    achievements: Achievement[];
    aiMessagesRemaining: number;
    weeklyCupsCompleted: number;
    monthlyRewardClaimed: boolean;
  };
}

interface Mission {
  id: string;
  title: string;
  description: string;
  category: string;
  target: number;
  progress: number;
  completed: boolean;
  reward: number;
  completedAt?: Date;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

interface AIMessagesResponse {
  success: boolean;
  aiMessagesRemaining: number;
  plan: string;
  isUnlimited: boolean;
}

interface CheckInResponse {
  success: boolean;
  message: string;
  currentStreak: number;
  longestStreak: number;
  newAchievements?: Achievement[];
  error?: string;
}

interface ClaimRewardResponse {
  success: boolean;
  message: string;
  aiMessagesRemaining: number;
  achievement?: Achievement;
}


// Animated Stat Card
const AnimatedStatCard = ({
  icon,
  iconColor,
  value,
  label,
  colors,
  isDark,
  delay = 0,
}: any) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(animatedValue, {
        toValue: value,
        duration: 900,
        useNativeDriver: false,
        delay,
      }).start();

      const listener = animatedValue.addListener(({ value: val }) => {
        setDisplayValue(Math.floor(val));
      });

      return () => {
        animatedValue.removeListener(listener);
      };
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <View
      style={[
        styles.statCard,
        { backgroundColor: isDark ? colors.card : "#FFFFFF" },
      ]}
    >
      {/* Subtle corner accent */}
      <View style={[styles.statCornerAccent, { backgroundColor: iconColor }]} />
      <View style={[styles.statIcon, { backgroundColor: iconColor + "18" }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <Animated.Text style={[styles.statNumber, { color: colors.text }]}>
        {displayValue}
      </Animated.Text>
      <Text style={[styles.statLabel, { color: isDark ? "#888" : "#999" }]}>
        {label}
      </Text>
    </View>
  );
};

// Section Header Component
const SectionHeader = ({
  icon,
  title,
  count,
  colors,
  onPress,
  countColor,
}: any) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionTitleContainer}>
      <View
        style={[styles.sectionIcon, { backgroundColor: colors.primary + "18" }]}
      >
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
    </View>
    {count !== undefined && (
      <TouchableOpacity
        onPress={onPress}
        disabled={!onPress}
        style={[
          styles.countPill,
          { backgroundColor: (countColor || colors.primary) + "15" },
        ]}
      >
        <Text
          style={[styles.sectionCount, { color: countColor || colors.primary }]}
        >
          {count}
        </Text>
      </TouchableOpacity>
    )}
  </View>
);

// Glass Card Component
const GlassCard = ({ children, style, colors, borderColor }: any) => (
  <View
    style={[
      styles.glassCard,
      {
        backgroundColor: colors.card,
        borderColor: borderColor || colors.primary + "25",
      },
      style,
    ]}
  >
    {children}
  </View>
);

// Progress Bar Component
const ProgressBar = ({ progress, color, height = 8 }: any) => (
  <View style={[styles.progressBarContainer, { height }]}>
    <View
      style={[
        styles.progressFill,
        {
          backgroundColor: color,
          width: `${Math.min(progress, 100)}%`,
        },
      ]}
    />
  </View>
);

// ==================== Main Component ====================
export default function ProfileScreen() {
  const router = useRouter();
  const { theme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === "dark";
  const scrollY = useRef(new Animated.Value(0)).current;

  // State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [aiMessages, setAiMessages] = useState(10);
  const [checkingIn, setCheckingIn] = useState(false);
  const [weeklyCupsCompleted, setWeeklyCupsCompleted] = useState(0);
  const [monthlyRewardClaimed, setMonthlyRewardClaimed] = useState(false);
  const [weeklyProgress, setWeeklyProgress] = useState({
    weekStart: new Date(),
    completedWorkouts: 0,
    weeklyGoal: 4,
    rewardClaimed: false,
  });

  // Header animation


  // ========== Fetch Functions ==========
const fetchProfile = async () => {
  try {
    setError(null);
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      router.replace("/login");
      return;
    }

    const profileRes = await fetch(`${API_BASE_URL}/api/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const profileData = (await profileRes.json()) as ProfileResponse;

    if (!profileRes.ok) {
      throw new Error((profileData as any).message || "Failed to load profile");
    }
    setProfile(profileData.user);

    // ❌ REMOVE or COMMENT OUT this entire stats fetch block
    // try {
    //   const statsRes = await fetch(`${API_BASE_URL}/api/users/stats`, {
    //     headers: { Authorization: `Bearer ${token}` },
    //   });
    //   const statsData = (await statsRes.json()) as StatsResponse;
    //   if (statsRes.ok) setStats(statsData.stats);
    // } catch (err) {
    //   setStats({
    //     totalWorkouts: 0,
    //     currentStreak: 0,
    //     longestStreak: 0,
    //     totalPRs: 0,
    //     totalMinutes: 0,
    //     achievements: 0,
    //   });
    // }
    
  } catch (err: any) {
    setError(err.message || "Network error");
    Alert.alert("Error", err.message || "Could not load profile");
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  const fetchActivity = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      console.log("🔄 Fetching activity data...");

      const response = await fetch(`${API_BASE_URL}/api/users/activity`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("📡 Activity response status:", response.status);

      if (response.ok) {
        const data = (await response.json()) as ActivityResponse;
        // 🔍 ADD THIS DEBUG LOG
        console.log("🔍 STREAK DEBUG:", {
          currentStreak: data.activity?.currentStreak,
          longestStreak: data.activity?.longestStreak,
          dailyCheckIns: data.activity?.dailyCheckIns,
          fullActivity: data.activity,
        });

        if (data.success && data.activity) {
          setStats({
            totalWorkouts: data.activity.weeklyProgress?.completedWorkouts || 0,
            currentStreak: data.activity.currentStreak || 0,
            longestStreak: data.activity.longestStreak || 0,
            totalPRs: 0,
            totalMinutes: 0,
            achievements: data.activity.achievements?.length || 0,
          });

          setMissions(data.activity.missions || []);
          setAchievements(data.activity.achievements || []);
          setWeeklyCupsCompleted(data.activity.weeklyCupsCompleted || 0);
          setMonthlyRewardClaimed(data.activity.monthlyRewardClaimed || false);
          setAiMessages(data.activity.aiMessagesRemaining || 10);
          setWeeklyProgress(
            data.activity.weeklyProgress || {
              weekStart: new Date(),
              completedWorkouts: 0,
              weeklyGoal: 4,
              rewardClaimed: false,
            },
          );
        } else {
          console.log(" Activity response success=false or missing activity");
        }
      } else {
        console.log(" Activity response not OK:", response.status);
      }
    } catch (err) {
      console.log("Activity fetch error:", err);
    }
  };
  // ========== Handlers ==========
  // ========== HANDLERS ==========
  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Error", "Please login again");
        router.replace("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/users/checkin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = (await response.json()) as CheckInResponse;

      console.log("🔍 CHECK-IN RESPONSE:", {
        success: data.success,
        currentStreak: data.currentStreak,
        longestStreak: data.longestStreak,
        error: data.error,
      });

      if (response.ok && data.success) {
        setStats((prev) =>
          prev
            ? {
                ...prev,
                currentStreak: data.currentStreak,
                longestStreak: data.longestStreak,
              }
            : {
                totalWorkouts: 0,
                currentStreak: data.currentStreak,
                longestStreak: data.longestStreak,
                totalPRs: 0,
                totalMinutes: 0,
                achievements: 0,
              },
        );

        Alert.alert(
          "✅ Checked In!",
          `Day ${data.currentStreak} streak! Keep going! 🔥`,
        );
        await fetchActivity();
        await fetchProfile();
      } else {
        // ✅ Now 'error' exists on the type
        const errorMsg =
          data.error || data.message || "Already checked in today!";
        if (errorMsg === "Already checked in today!") {
          Alert.alert(
            "⏰ Already Checked In",
            "You've already checked in today. Come back tomorrow for your next streak day! 🔥",
          );
        } else {
          Alert.alert("Check-in Failed", errorMsg);
        }
      }
    } catch (error) {
      console.error("Check-in error:", error);
      Alert.alert("Error", "Could not check in. Please try again.");
    } finally {
      setCheckingIn(false);
    }
  };
  const handleClaimReward = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      const response = await fetch(
        `${API_BASE_URL}/api/users/claim-weekly-reward`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // ✅ ADD TYPE ASSERTION HERE
      const data = (await response.json()) as ClaimRewardResponse;

      if (response.ok && data.success) {
        Alert.alert(
          "🎉 Reward Claimed!",
          `You earned +20 AI messages! Total: ${data.aiMessagesRemaining}`,
        );
        setAiMessages(data.aiMessagesRemaining);
        fetchActivity();
      } else {
        Alert.alert(
          "Not Yet",
          (data as any).error || "Complete your weekly goal first!",
        );
      }
    } catch (error) {
      console.error("Claim reward error:", error);
      Alert.alert("Error", "Could not claim reward");
    }
  };

  const handleClaimMonthlyReward = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      const response = await fetch(
        `${API_BASE_URL}/api/users/claim-monthly-cup-reward`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = (await response.json()) as {
        success: boolean;
        aiMessagesRemaining: number;
        error?: string;
        message?: string;
      };

      if (response.ok && data.success) {
        Alert.alert(
          "🎉 Monthly Reward!",
          `You earned 50 AI messages! Total: ${data.aiMessagesRemaining}`,
        );
        setAiMessages(data.aiMessagesRemaining);
        setMonthlyRewardClaimed(true);
        fetchActivity();
      } else {
        Alert.alert("Error", data.error || "Could not claim reward");
      }
    } catch (error) {
      console.error("Claim monthly reward error:", error);
      Alert.alert("Error", "Could not claim reward");
    }
  };

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
              await AsyncStorage.multiRemove([
                "userToken",
                "username",
                "userRole",
                "userId",
              ]);
              router.replace("/login");
            } catch (error) {
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const handleEditProfile = () => router.push("./profile/edit-profile");
  const handleChangePassword = () => router.push("./profile/change-password");
  const handleNotificationSettings = () =>
    router.push("./profile/notification-settings");
  const handlePrivacySettings = () => router.push("./profile/privacy-settings");

  // View Monthly Report in Browser
const viewMonthlyReport = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      Alert.alert("Error", "Please login again");
      return;
    }

    if (!profile?._id) {
      Alert.alert("Error", "User ID not found");
      return;
    }

    // Get previous month (last month)
    const now = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const year = prevMonth.getFullYear();
    const month = String(prevMonth.getMonth() + 1).padStart(2, '0');
    const monthName = prevMonth.toLocaleString('default', { month: 'long' });
    
const reportUrl = `${API_BASE_URL}/reports/${profile._id}_${year}_${month}.html`;    
    console.log("Opening report:", reportUrl);
    
    // Check if report exists first
    const checkResponse = await fetch(reportUrl, { method: 'HEAD' });
    
    if (checkResponse.ok) {
      await Linking.openURL(reportUrl);
    } else {
      Alert.alert(
        "No Report Yet",
        `No report available for ${monthName} ${year}. Keep using the Calculator daily to generate your monthly report!`,
        [{ text: "OK" }]
      );
    }
  } catch (error) {
    console.error("Report error:", error);
    Alert.alert("Error", "Could not open report. Please try again later.");
  }
};

useEffect(() => {
  const loadData = async () => {
    await fetchActivity(); 
    await fetchProfile();  
  };
  loadData();
}, []);

  useFocusEffect(
    useCallback(() => {
      const refreshData = async () => {
        await fetchActivity(); // Refresh activity first
        await fetchProfile(); // Then refresh profile
      };
      refreshData();
    }, []),
  );

  // Loading / Error states
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

  const displayStats = stats || {
    totalWorkouts: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalPRs: 0,
    totalMinutes: 0,
    achievements: 0,
  };

  const memberSince = new Date(profile.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const weeklyProgressPercent =
    (weeklyProgress.completedWorkouts / weeklyProgress.weeklyGoal) * 100;

  return (
    <View
      style={[styles.container, { backgroundColor: currentColors.background }]}
    >


      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchProfile();
              fetchActivity();
            }}
            tintColor={currentColors.primary}
          />
        }
      >
        {/* ========== PROFILE HERO ========== */}
        <View style={styles.profileHero}>
          {/* Radial glow behind avatar */}
          <View
            style={[
              styles.heroGlowBehind,
              { backgroundColor: currentColors.primary + "12" },
            ]}
          />

          {/* Top actions row */}
          <View style={styles.heroTopRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={[
                styles.heroActionBtn,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.07)"
                    : "rgba(0,0,0,0.04)",
                },
              ]}
            >
              <Ionicons
                name="arrow-back"
                size={20}
                color={currentColors.text}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleEditProfile}
              style={[
                styles.heroActionBtn,
                { backgroundColor: currentColors.primary + "15" },
              ]}
            >
              <Ionicons
                name="create-outline"
                size={20}
                color={currentColors.primary}
              />
            </TouchableOpacity>
          </View>

          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            {/* Outer ring */}
            <View
              style={[
                styles.avatarRingOuter,
                { borderColor: currentColors.primary + "30" },
              ]}
            />
            {/* Inner ring */}
            <View
              style={[
                styles.avatarRingInner,
                { borderColor: currentColors.primary + "60" },
              ]}
            />
            <LinearGradient
              colors={[
                currentColors.primary + "30",
                currentColors.primary + "08",
              ]}
              style={styles.avatarInner}
            >
              <Text
                style={[styles.avatarText, { color: currentColors.primary }]}
              >
                {profile.username.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
            {/* Level badge */}
            <View
              style={[
                styles.levelBadge,
                { backgroundColor: currentColors.primary },
              ]}
            >
              <Text style={styles.levelBadgeText}>
                Lv {Math.floor(displayStats.currentStreak / 7) + 1}
              </Text>
            </View>
          </View>

          {/* Name & role */}
          <Text style={[styles.userName, { color: currentColors.text }]}>
            {profile.fullName || profile.username}
          </Text>

          <View style={styles.roleRow}>
            <View
              style={[
                styles.rolePill,
                {
                  backgroundColor:
                    profile.role === "admin"
                      ? "#FF6B6B18"
                      : currentColors.primary + "15",
                  borderColor:
                    profile.role === "admin"
                      ? "#FF6B6B40"
                      : currentColors.primary + "40",
                },
              ]}
            >
              <View
                style={[
                  styles.roleDot,
                  {
                    backgroundColor:
                      profile.role === "admin"
                        ? "#FF6B6B"
                        : currentColors.primary,
                  },
                ]}
              />
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
            <Text
              style={[styles.userEmail, { color: isDark ? "#777" : "#999" }]}
            >
              {profile.email}
            </Text>
          </View>

          {profile.bio && (
            <Text style={[styles.bio, { color: isDark ? "#bbb" : "#666" }]}>
              {profile.bio}
            </Text>
          )}

          {/* Meta chips */}
          <View style={styles.metaRow}>
            {profile.location && (
              <View
                style={[
                  styles.metaChip,
                  {
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.04)",
                  },
                ]}
              >
                <Ionicons
                  name="location-outline"
                  size={12}
                  color={currentColors.primary}
                />
                <Text
                  style={[
                    styles.metaChipText,
                    { color: isDark ? "#aaa" : "#777" },
                  ]}
                >
                  {profile.location}
                </Text>
              </View>
            )}
            <View
              style={[
                styles.metaChip,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(0,0,0,0.04)",
                },
              ]}
            >
              <Ionicons
                name="calendar-outline"
                size={12}
                color={currentColors.primary}
              />
              <Text
                style={[
                  styles.metaChipText,
                  { color: isDark ? "#aaa" : "#777" },
                ]}
              >
                Joined {memberSince}
              </Text>
            </View>
          </View>
        </View>

        {/* ========== STATS GRID ========== */}
        <View style={styles.statsGrid}>
          <AnimatedStatCard
            icon="flame"
            iconColor="#FF6B6B"
            value={displayStats.currentStreak}
            label="Streak"
            colors={currentColors}
            isDark={isDark}
            delay={80}
          />
          <AnimatedStatCard
            icon="barbell-outline"
            iconColor="#FFC107"
            value={displayStats.totalWorkouts}
            label="Workouts"
            colors={currentColors}
            isDark={isDark}
            delay={160}
          />
          <AnimatedStatCard
            icon="trophy-outline"
            iconColor={currentColors.primary}
            value={displayStats.totalPRs}
            label="PRs"
            colors={currentColors}
            isDark={isDark}
            delay={240}
          />
          <AnimatedStatCard
            icon="time-outline"
            iconColor="#007AFF"
            value={Math.floor(displayStats.totalMinutes / 60)}
            label="Hours"
            colors={currentColors}
            isDark={isDark}
            delay={320}
          />
        </View>

        {/* ========== DAILY CHECK-IN ========== */}
        <View style={styles.checkInSection}>
          <TouchableOpacity
            style={[styles.checkInButton, { opacity: checkingIn ? 0.72 : 1 }]}
            onPress={handleCheckIn}
            disabled={checkingIn}
            activeOpacity={0.82}
          >
            <LinearGradient
              colors={[currentColors.primary, currentColors.primary + "cc"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.checkInLeft}>
              <View style={styles.checkInIconWrap}>
                <Ionicons name="checkmark-done" size={20} color="#000" />
              </View>
              <View>
                <Text style={styles.checkInTitle}>
                  {checkingIn ? "Checking in…" : "Daily Check-in"}
                </Text>
                <Text style={styles.checkInSub}>
                  Tap to log today's activity
                </Text>
              </View>
            </View>
            <View style={styles.streakPill}>
              <Ionicons name="flame" size={12} color="#000" />
              <Text style={styles.streakPillText}>
                {displayStats.currentStreak}d
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ========== WEEKLY PROGRESS ========== */}
        <GlassCard
          colors={currentColors}
          borderColor={currentColors.primary + "35"}
        >
          <View style={styles.weeklyHeader}>
            <View style={styles.weeklyHeaderLeft}>
              <View
                style={[
                  styles.weeklyIconBox,
                  { backgroundColor: currentColors.primary + "15" },
                ]}
              >
                <Ionicons
                  name="calendar"
                  size={18}
                  color={currentColors.primary}
                />
              </View>
              <View>
                <Text
                  style={[styles.weeklyTitle, { color: currentColors.text }]}
                >
                  Weekly Goal
                </Text>
                <Text
                  style={[
                    styles.weeklySubtitle,
                    { color: isDark ? "#777" : "#aaa" },
                  ]}
                >
                  This week's workouts
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.weeklyCountBubble,
                { backgroundColor: currentColors.primary + "15" },
              ]}
            >
              <Text
                style={[
                  styles.weeklyCountText,
                  { color: currentColors.primary },
                ]}
              >
                {weeklyProgress.completedWorkouts}
                <Text style={{ fontWeight: "500", opacity: 0.6 }}>
                  /{weeklyProgress.weeklyGoal}
                </Text>
              </Text>
            </View>
          </View>

          <ProgressBar
            progress={weeklyProgressPercent}
            color={currentColors.primary}
            height={6}
          />

          {!weeklyProgress.rewardClaimed &&
            weeklyProgress.completedWorkouts >= weeklyProgress.weeklyGoal && (
              <TouchableOpacity
                style={[
                  styles.claimButton,
                  { backgroundColor: currentColors.primary },
                ]}
                onPress={handleClaimReward}
              >
                <Ionicons name="gift" size={16} color="#000" />
                <Text style={styles.claimButtonText}>
                  Claim Weekly Reward · +20 AI Questions
                </Text>
              </TouchableOpacity>
            )}
        </GlassCard>

        {/* ========== ACTIVE MISSIONS ========== */}
        {missions.length > 0 && (
          <GlassCard colors={currentColors}>
            <SectionHeader
              icon="flag-outline"
              title="Active Missions"
              count={missions.filter((m) => !m.completed).length}
              colors={currentColors}
            />

            {missions.map((mission, index) => {
              const missionProgress = (mission.progress / mission.target) * 100;
              return (
                <View
                  key={mission.id}
                  style={[
                    styles.missionItem,
                    index !== missions.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: isDark
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.04)",
                      paddingBottom: 16,
                      marginBottom: 16,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.missionEmojiBubble,
                      { backgroundColor: currentColors.primary + "10" },
                    ]}
                  >
                    <Text style={styles.missionEmoji}>
                      {mission.title.includes("💪")
                        ? "💪"
                        : mission.title.includes("🔥")
                          ? "🔥"
                          : mission.title.includes("📱")
                            ? "📱"
                            : "🎯"}
                    </Text>
                  </View>
                  <View style={styles.missionContent}>
                    <View style={styles.missionHeader}>
                      <Text
                        style={[
                          styles.missionTitle,
                          { color: currentColors.text },
                        ]}
                      >
                        {mission.title}
                      </Text>
                      <View
                        style={[
                          styles.rewardBadge,
                          { backgroundColor: currentColors.primary + "15" },
                        ]}
                      >
                        <Text
                          style={[
                            styles.missionReward,
                            { color: currentColors.primary },
                          ]}
                        >
                          +{mission.reward} AI
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.missionDesc,
                        { color: isDark ? "#888" : "#999" },
                      ]}
                    >
                      {mission.description}
                    </Text>
                    <ProgressBar
                      progress={missionProgress}
                      color={currentColors.primary}
                      height={4}
                    />
                    <Text
                      style={[
                        styles.missionProgressText,
                        { color: isDark ? "#666" : "#bbb" },
                      ]}
                    >
                      {mission.progress} / {mission.target} completed
                    </Text>
                  </View>
                </View>
              );
            })}
          </GlassCard>
        )}

        {/* ========== AI MESSAGES ========== */}
        <View
          style={[
            styles.aiCard,
            {
              backgroundColor: currentColors.card,
              borderColor: currentColors.primary + "35",
            },
          ]}
        >
          {/* Decorative stripe */}
          <LinearGradient
            colors={[currentColors.primary + "25", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.aiStripe}
          />
          <View style={styles.aiCardContent}>
            <View
              style={[
                styles.aiIconBox,
                { backgroundColor: currentColors.primary + "15" },
              ]}
            >
              <Ionicons
                name="chatbubble-ellipses"
                size={26}
                color={currentColors.primary}
              />
            </View>
            <View style={styles.aiCardMid}>
              <Text style={[styles.aiTitle, { color: currentColors.text }]}>
                AI Coach Messages
              </Text>
              <Text
                style={[styles.aiSubtitle, { color: isDark ? "#777" : "#aaa" }]}
              >
                Complete missions to earn more
              </Text>
            </View>
            <View style={styles.aiCountBox}>
              <Text style={[styles.aiCount, { color: currentColors.primary }]}>
                {aiMessages}
              </Text>
              <Text
                style={[
                  styles.aiRemaining,
                  { color: isDark ? "#666" : "#bbb" },
                ]}
              >
                left
              </Text>
            </View>
          </View>
        </View>

        {/* ========== FITNESS METRICS ========== */}
        {(profile.height || profile.weight) && (
          <GlassCard colors={currentColors}>
            <SectionHeader
              icon="fitness-outline"
              title="Fitness Metrics"
              colors={currentColors}
              onPress={() => router.push("/calculator")}
              countColor={currentColors.primary}
            />

            <View style={styles.metricsGrid}>
              {profile.height && (
                <View
                  style={[
                    styles.metricBox,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.04)"
                        : "rgba(0,0,0,0.025)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.metricLabel,
                      { color: isDark ? "#777" : "#aaa" },
                    ]}
                  >
                    Height
                  </Text>
                  <Text
                    style={[styles.metricValue, { color: currentColors.text }]}
                  >
                    {profile.height}
                    <Text
                      style={[
                        styles.metricUnit,
                        { color: isDark ? "#666" : "#bbb" },
                      ]}
                    >
                      {" "}
                      cm
                    </Text>
                  </Text>
                </View>
              )}
              {profile.weight && (
                <View
                  style={[
                    styles.metricBox,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.04)"
                        : "rgba(0,0,0,0.025)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.metricLabel,
                      { color: isDark ? "#777" : "#aaa" },
                    ]}
                  >
                    Weight
                  </Text>
                  <Text
                    style={[styles.metricValue, { color: currentColors.text }]}
                  >
                    {profile.weight}
                    <Text
                      style={[
                        styles.metricUnit,
                        { color: isDark ? "#666" : "#bbb" },
                      ]}
                    >
                      {" "}
                      kg
                    </Text>
                  </Text>
                </View>
              )}
              {profile.height && profile.weight && (
                <>
                  <View
                    style={[
                      styles.metricBox,
                      {
                        backgroundColor: isDark
                          ? "rgba(255,255,255,0.04)"
                          : "rgba(0,0,0,0.025)",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.metricLabel,
                        { color: isDark ? "#777" : "#aaa" },
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
                  <View
                    style={[
                      styles.metricBox,
                      {
                        backgroundColor: isDark
                          ? "rgba(255,255,255,0.04)"
                          : "rgba(0,0,0,0.025)",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.metricLabel,
                        { color: isDark ? "#777" : "#aaa" },
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
                          5 * 25 +
                          (profile.role === "admin" ? 5 : -161),
                      )}
                      <Text
                        style={[
                          styles.metricUnit,
                          { color: isDark ? "#666" : "#bbb" },
                        ]}
                      >
                        {" "}
                        kcal
                      </Text>
                    </Text>
                  </View>
                </>
              )}
            </View>
          </GlassCard>
        )}

        {/* ========== HABIT CUPS ========== */}
        <GlassCard
          colors={currentColors}
          borderColor={currentColors.primary + "35"}
        >
          <SectionHeader
            icon="wine"
            title="Monthly Habit Cups"
            count={`${weeklyCupsCompleted}/4`}
            colors={currentColors}
          />

          <Text
            style={[styles.cupDescription, { color: isDark ? "#777" : "#aaa" }]}
          >
            Complete 4+ workouts per week to earn cups
          </Text>

          <View style={styles.cupsRow}>
            {[1, 2, 3, 4].map((week) => {
              const isCompleted = weeklyCupsCompleted >= week;
              return (
                <View
                  key={week}
                  style={[
                    styles.cupItem,
                    {
                      borderColor: isCompleted
                        ? currentColors.primary
                        : isDark
                          ? "#2a2a2a"
                          : "#e8e8e8",
                      backgroundColor: isCompleted
                        ? currentColors.primary + "15"
                        : isDark
                          ? "#161616"
                          : "#fafafa",
                    },
                  ]}
                >
                  <Ionicons
                    name={isCompleted ? "wine" : "wine-outline"}
                    size={28}
                    color={
                      isCompleted
                        ? currentColors.primary
                        : isDark
                          ? "#333"
                          : "#ddd"
                    }
                  />
                  <Text
                    style={[
                      styles.cupWeekLabel,
                      {
                        color: isCompleted
                          ? currentColors.primary
                          : isDark
                            ? "#444"
                            : "#ccc",
                      },
                    ]}
                  >
                    Wk {week}
                  </Text>
                  {isCompleted && (
                    <View
                      style={[
                        styles.cupCheck,
                        { backgroundColor: currentColors.primary },
                      ]}
                    >
                      <Ionicons name="checkmark" size={9} color="#000" />
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {weeklyCupsCompleted === 4 && !monthlyRewardClaimed && (
            <TouchableOpacity
              style={[
                styles.claimButton,
                { backgroundColor: currentColors.primary },
              ]}
              onPress={handleClaimMonthlyReward}
            >
              <Ionicons name="gift" size={16} color="#000" />
              <Text style={styles.claimButtonText}>
                Claim 50 AI Messages! 🎉
              </Text>
            </TouchableOpacity>
          )}

          {weeklyCupsCompleted === 4 && monthlyRewardClaimed && (
            <View
              style={[
                styles.rewardClaimedBadge,
                { backgroundColor: currentColors.primary + "12" },
              ]}
            >
              <Ionicons
                name="checkmark-circle"
                size={15}
                color={currentColors.primary}
              />
              <Text
                style={[
                  styles.rewardClaimedText,
                  { color: currentColors.primary },
                ]}
              >
                Monthly reward claimed · Resets next month
              </Text>
            </View>
          )}

          {weeklyCupsCompleted < 4 && (
            <View style={styles.cupProgressWrap}>
              <Text
                style={[
                  styles.cupProgressHint,
                  { color: isDark ? "#666" : "#bbb" },
                ]}
              >
                {4 - weeklyCupsCompleted} more week
                {4 - weeklyCupsCompleted !== 1 ? "s" : ""} to go
              </Text>
              <ProgressBar
                progress={(weeklyCupsCompleted / 4) * 100}
                color={currentColors.primary}
                height={4}
              />
            </View>
          )}
        </GlassCard>

        {/* ========== MONTHLY REPORT BUTTON ========== */}
<View style={styles.reportSection}>
  <TouchableOpacity
    style={[
      styles.reportButton,
      {
        backgroundColor: currentColors.primary,
        shadowColor: currentColors.primary,
      },
    ]}
    onPress={viewMonthlyReport}
    activeOpacity={0.85}
  >
    <LinearGradient
      colors={[currentColors.primary, currentColors.primary + "cc"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
    <Ionicons name="document-text-outline" size={24} color="#000" />
    <Text style={styles.reportButtonText}>View Monthly Report</Text>
    <Ionicons name="open-outline" size={20} color="#000" />
  </TouchableOpacity>
</View>


  {/* ... rest of account settings ... */}

        {/* ========== ACCOUNT SETTINGS ========== */}
        <View style={styles.settingsSection}>
          <Text
            style={[styles.settingsHeader, { color: isDark ? "#777" : "#bbb" }]}
          >
            ACCOUNT
          </Text>

          {[
            {
              icon: "person-outline",
              title: "Edit Profile",
              subtitle: "Name, bio, location",
              onPress: handleEditProfile,
            },
            {
              icon: "lock-closed-outline",
              title: "Change Password",
              subtitle: "Update your password",
              onPress: handleChangePassword,
            },
            {
              icon: "notifications-outline",
              title: "Notifications",
              subtitle: "Push notification settings",
              onPress: handleNotificationSettings,
            },
            {
              icon: "shield-outline",
              title: "Privacy",
              subtitle: "Control profile visibility",
              onPress: handlePrivacySettings,
            },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.settingItem,
                {
                  backgroundColor: isDark ? currentColors.card : "#FFFFFF",
                  borderColor: isDark
                    ? "rgba(57,255,20,0.12)"
                    : "rgba(57,255,20,0.08)",
                },
              ]}
              onPress={item.onPress}
              activeOpacity={0.75}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.settingIconBox,
                    { backgroundColor: currentColors.primary + "12" },
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={18}
                    color={currentColors.primary}
                  />
                </View>
                <View>
                  <Text
                    style={[styles.settingTitle, { color: currentColors.text }]}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.settingSubtitle,
                      { color: isDark ? "#666" : "#bbb" },
                    ]}
                  >
                    {item.subtitle}
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={isDark ? "#444" : "#ddd"}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[
            styles.logoutButton,
            {
              backgroundColor: isDark ? "rgba(255,107,107,0.08)" : "#FFF5F5",
              borderColor: "rgba(255,107,107,0.22)",
            },
          ]}
          onPress={handleLogout}
          activeOpacity={0.75}
        >
          <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
          <Text style={[styles.logoutText, { color: "#FF6B6B" }]}>
            Sign Out
          </Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, { color: isDark ? "#333" : "#ddd" }]}>
          GymBro v1.0.0
        </Text>
      </Animated.ScrollView>
    </View>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: { flex: 1 },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    marginTop: 14,
    marginBottom: 22,
    textAlign: "center",
    lineHeight: 24,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 13,
    borderRadius: 30,
  },
  retryText: { fontSize: 15, fontWeight: "700" },

  scrollContent: { paddingBottom: 48 },

  // ── Animated header ──────────────────────────────

  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerButton: {
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "700", letterSpacing: 0.3 },

  // ── Profile hero ────────────────────────────────
  profileHero: {
    marginTop: Platform.OS === "ios" ? 60 : 50,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingTop: 24,
    paddingBottom: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    borderRadius: 32,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
      },
      android: { elevation: 6 },
    }),
  },
  heroGlowBehind: {
    position: "absolute",
    top: -40,
    width: 280,
    height: 280,
    borderRadius: 140,
    alignSelf: "center",
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "stretch",
    marginBottom: 20,
  },
  heroActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },

  // avatar
  avatarWrapper: {
    position: "relative",
    width: 104,
    height: 104,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  avatarRingOuter: {
    position: "absolute",
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 2,
  },
  avatarRingInner: {
    position: "absolute",
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 1.5,
  },
  avatarInner: {
    width: 82,
    height: 82,
    borderRadius: 41,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 38, fontWeight: "800" },
  levelBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 14,
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#000",
    letterSpacing: 0.3,
  },

  userName: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 0.2,
    marginBottom: 10,
    textAlign: "center",
  },
  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  rolePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  roleDot: { width: 6, height: 6, borderRadius: 3 },
  roleText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
  userEmail: { fontSize: 13, fontWeight: "500" },

  bio: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 16,
    paddingHorizontal: 8,
  },

  // meta chips
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  metaChipText: { fontSize: 12, fontWeight: "500" },

  // ── Stats grid ──────────────────────────────────
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 60) / 2,
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 10,
    borderRadius: 22,
    overflow: "hidden",
    position: "relative",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  statCornerAccent: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 40,
    height: 3,
    borderBottomLeftRadius: 3,
    opacity: 0.6,
  },
  statIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  // ── Check-in ─────────────────────────────────────
  checkInSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  checkInButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 22,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.28,
        shadowRadius: 14,
      },
      android: { elevation: 8 },
    }),
  },
  checkInLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkInIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.14)",
    justifyContent: "center",
    alignItems: "center",
  },
  checkInTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#000",
    letterSpacing: 0.1,
  },
  checkInSub: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(0,0,0,0.5)",
    marginTop: 1,
  },
  streakPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  streakPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#000",
  },

  // ── Glass card ───────────────────────────────────
  glassCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
      },
      android: { elevation: 2 },
    }),
  },

  // ── Section header ───────────────────────────────
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
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  countPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  sectionCount: { fontSize: 14, fontWeight: "700" },

  // ── Weekly card ──────────────────────────────────
  weeklyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  weeklyHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  weeklyIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  weeklyTitle: { fontSize: 15, fontWeight: "700" },
  weeklySubtitle: { fontSize: 11, fontWeight: "500", marginTop: 1 },
  weeklyCountBubble: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  weeklyCountText: { fontSize: 16, fontWeight: "800" },

  // progress bar
  progressBarContainer: {
    backgroundColor: "rgba(128,128,128,0.12)",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 6 },

  // claim button
  claimButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
    borderRadius: 16,
    gap: 7,
    marginTop: 14,
  },
  claimButtonText: { fontSize: 13, fontWeight: "700", color: "#000" },

  // ── Missions ─────────────────────────────────────
  missionItem: {
    flexDirection: "row",
    gap: 12,
  },
  missionEmojiBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  missionEmoji: { fontSize: 22 },
  missionContent: { flex: 1 },
  missionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  missionTitle: { fontSize: 14, fontWeight: "700", flex: 1, marginRight: 8 },
  rewardBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },
  missionReward: { fontSize: 11, fontWeight: "700" },
  missionDesc: { fontSize: 12, marginBottom: 8, lineHeight: 17 },
  missionProgressText: { fontSize: 10, fontWeight: "500", marginTop: 5 },

  // ── AI card ──────────────────────────────────────
  aiCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
      },
      android: { elevation: 2 },
    }),
  },
  aiStripe: {
    height: 3,
    width: "100%",
  },
  aiCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    gap: 14,
  },
  aiIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  aiCardMid: { flex: 1 },
  aiTitle: { fontSize: 15, fontWeight: "700" },
  aiSubtitle: { fontSize: 11, fontWeight: "500", marginTop: 3 },
  aiCountBox: { alignItems: "flex-end" },
  aiCount: { fontSize: 32, fontWeight: "800", lineHeight: 34 },
  aiRemaining: { fontSize: 11, fontWeight: "500" },

  // ── Fitness metrics ──────────────────────────────
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricBox: {
    width: (width - 100) / 2,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  metricValue: { fontSize: 22, fontWeight: "700" },
  metricUnit: { fontSize: 12, fontWeight: "500" },

  // ── Cups ─────────────────────────────────────────
  cupDescription: { fontSize: 12, textAlign: "center", marginBottom: 16 },
  cupsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 14,
  },
  cupItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    position: "relative",
  },
  cupWeekLabel: {
    fontSize: 10,
    fontWeight: "700",
    marginTop: 5,
    letterSpacing: 0.3,
  },
  cupCheck: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  rewardClaimedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: 14,
    gap: 6,
    marginTop: 8,
  },
  rewardClaimedText: { fontSize: 12, fontWeight: "600" },
  cupProgressWrap: { marginTop: 4 },
  cupProgressHint: {
    fontSize: 11,
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "500",
  },

  // ── Account settings ─────────────────────────────
  settingsSection: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  settingsHeader: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 12,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  settingIconBox: {
    width: 40,
    height: 40,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  settingTitle: { fontSize: 14, fontWeight: "700", marginBottom: 1 },
  settingSubtitle: { fontSize: 11, fontWeight: "500" },

  // ── Logout ───────────────────────────────────────
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    gap: 8,
    marginBottom: 18,
  },
  logoutText: { fontSize: 15, fontWeight: "700" },

  versionText: {
    textAlign: "center",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  reportSection: {
  marginHorizontal: 20,
  marginBottom: 16,
},
reportButton: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 16,
  borderRadius: 20,
  gap: 12,
  overflow: "hidden",
  ...Platform.select({
    ios: {
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 14,
    },
    android: {
      elevation: 6,
    },
  }),
},
reportButtonText: {
  fontSize: 16,
  fontWeight: "800",
  color: "#000",
  letterSpacing: 0.5,
},
});
