import Clock from "@/components/clock";
import { Colors } from "@/constants/Colors";
import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSimpleTheme } from "../../context/SimpleThemeContext";

const { width } = Dimensions.get("window");

export default function Home() {
  const { theme, toggleTheme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [username, setUsername] = useState("");
  const isDark = theme === "dark";

  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [glowAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const redirectIfNotLoggedIn = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");

        if (!token) {
          console.log("No token found, redirecting to login...");
          router.replace("/login");
        } else {
          const storedUsername = await AsyncStorage.getItem("username");
          setIsLoggedIn(true);
          setUsername(storedUsername || "");
        }
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    };

    redirectIfNotLoggedIn();
  }, []);

  useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation for primary button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Continuous glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleLogout = async () => {
    console.log("Logout pressed");
    try {
      await AsyncStorage.clear();
      setIsLoggedIn(false);
      setUsername("");
      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to logout.");
    }
  };

  const testNavigation = async () => {
    console.log("=== TESTING NAVIGATION ===");
    const testPaths = ["/login", "/admin/login", "/signup", "/admin/signup"];

    for (const path of testPaths) {
      console.log(`Testing navigation to: ${path}`);
      try {
        router.push("/login");
        console.log(`✓ Navigation to ${path} initiated`);
        return;
      } catch (error) {
        console.log(`✗ Failed to navigate to ${path}:`, error);
      }
    }

    console.log("All navigation paths failed");
    Alert.alert("Navigation Test", "All paths failed. Check console.");
  };

  const handleAdminAccess = () => {
    Alert.alert("Admin Access", "Go to admin login panel?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Go to Admin",
        onPress: () => router.push("/admin/login"),
      },
    ]);
  };

  const quotes = [
    "No pain, no gain.",
    "Push harder than yesterday if you want a different tomorrow.",
    "Your body can stand almost anything. It's your mind you have to convince.",
  ];

  const mantras = [
    "Respect yourself and trust your power but be humble",
    "Consistency beats perfection every single time",
    "Progress is progress, no matter how small",
  ];

  return (
    <View
      style={[styles.container, { backgroundColor: currentColors.background }]}
    >
      {/* Mobile-Optimized Top Bar */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: isDark
              ? "rgba(18, 18, 18, 0.98)"
              : "rgba(255, 255, 255, 0.98)",
            borderBottomColor: isDark
              ? "rgba(57, 255, 20, 0.15)"
              : "rgba(57, 255, 20, 0.1)",
          },
        ]}
      >
        {/* First Row: Logo and Theme Toggle */}
        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={() => router.replace("/")}
            activeOpacity={0.7}
            style={styles.logoTouchable}
          >
            <View style={styles.logoContainer}>
              <View
                style={[
                  styles.logoIconWrapper,
                  {
                    backgroundColor: isDark
                      ? "rgba(57, 255, 20, 0.15)"
                      : "rgba(57, 255, 20, 0.1)",
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="dumbbell"
                  size={20}
                  color={currentColors.primary}
                />
              </View>
              <Text style={[styles.logo, { color: currentColors.primary }]}>
                GymBro
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleTheme}
            style={[
              styles.themeToggle,
              {
                backgroundColor: currentColors.primary,
                shadowColor: currentColors.primary,
              },
            ]}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isDark ? "sunny" : "moon"}
              size={18}
              color={isDark ? currentColors.background : "#FFFFFF"}
            />
          </TouchableOpacity>
        </View>

        {/* Second Row: Clock and User/Login */}
        <View style={styles.bottomRow}>
          <Clock />

          {isLoggedIn ? (
            <View style={styles.loggedInContainer}>
              <View style={styles.userBadge}>
                <View
                  style={[
                    styles.avatarCircle,
                    {
                      backgroundColor: isDark
                        ? currentColors.primary
                        : "rgba(57, 255, 20, 0.15)",
                      borderWidth: 2,
                      borderColor: isDark
                        ? "rgba(57, 255, 20, 0.3)"
                        : currentColors.primary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.avatarText,
                      {
                        color: isDark
                          ? currentColors.background
                          : currentColors.primary,
                      },
                    ]}
                  >
                    {username.charAt(0).toUpperCase() || "U"}
                  </Text>
                </View>
                <Text style={[styles.username, { color: currentColors.text }]}>
                  {username || "User"}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.logoutButton,
                  {
                    backgroundColor: currentColors.primary,
                    borderColor: currentColors.primary,
                  },
                ]}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="log-out-outline"
                  size={16}
                  color={isDark ? currentColors.background : "#FFFFFF"}
                />
                <Text
                  style={[
                    styles.logoutButtonText,
                    { color: isDark ? currentColors.background : "#FFFFFF" },
                  ]}
                >
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.loginButton,
                {
                  backgroundColor: currentColors.primary,
                },
              ]}
              onPress={() => {
                console.log("Login button pressed, trying /login");
                router.push("/login");
              }}
              activeOpacity={0.85}
            >
              <AntDesign
                name="login"
                size={16}
                color={isDark ? currentColors.background : "#FFFFFF"}
              />
              <Text
                style={[
                  styles.loginButtonText,
                  {
                    color: isDark ? currentColors.background : "#FFFFFF",
                  },
                ]}
              >
                Login
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={{ backgroundColor: currentColors.background }}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View
            style={[
              styles.heroCard,
              {
                backgroundColor: isDark ? currentColors.card : "#FFFFFF",
                borderColor: isDark
                  ? currentColors.primary
                  : "rgba(0, 255, 65, 0.2)",
                shadowColor: isDark ? currentColors.primary : "#000",
              },
            ]}
          >
            {/* Animated gradient background */}
            <Animated.View
              style={[
                styles.gradientOverlay,
                {
                  opacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.1, 0.3],
                  }),
                },
              ]}
            >
              <View
                style={[
                  styles.gradientCircle1,
                  {
                    backgroundColor: isDark
                      ? "rgba(0, 255, 65, 0.15)"
                      : "rgba(0, 255, 65, 0.08)",
                  },
                ]}
              />
              <View
                style={[
                  styles.gradientCircle2,
                  {
                    backgroundColor: isDark
                      ? "rgba(127, 255, 0, 0.15)"
                      : "rgba(127, 255, 0, 0.08)",
                  },
                ]}
              />
            </Animated.View>

            <View style={styles.heroContent}>
              <Animated.View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: isDark
                      ? "rgba(0, 255, 65, 0.15)"
                      : "rgba(0, 255, 65, 0.08)",
                    borderWidth: 3,
                    borderColor: currentColors.primary,
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="arm-flex"
                  size={42}
                  color={currentColors.primary}
                />
              </Animated.View>
              <Text style={[styles.heroTitle, { color: currentColors.text }]}>
                Your Fitness Journey
              </Text>
              <Text
                style={[
                  styles.heroSubtitle,
                  {
                    color: isDark
                      ? "rgba(255, 255, 255, 0.7)"
                      : "rgba(0, 0, 0, 0.6)",
                  },
                ]}
              >
                Transform your body, elevate your mind
              </Text>
              <View
                style={[
                  styles.heroBadge,
                  {
                    backgroundColor: isDark
                      ? "rgba(0, 255, 65, 0.15)"
                      : "rgba(0, 255, 65, 0.08)",
                    borderWidth: 1,
                    borderColor: isDark
                      ? "rgba(0, 255, 65, 0.3)"
                      : "rgba(0, 255, 65, 0.2)",
                  },
                ]}
              >
                <Ionicons name="star" size={14} color={currentColors.primary} />
                <Text
                  style={[
                    styles.heroBadgeText,
                    { color: currentColors.primary },
                  ]}
                >
                  Track • Train • Transform
                </Text>
              </View>
            </View>
          </View>

          {/* Premium Stats Grid */}
          <View style={styles.statsGrid}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.statCard,
                {
                  backgroundColor: isDark ? currentColors.card : "#FFFFFF",
                  borderColor: isDark
                    ? "rgba(255, 107, 107, 0.3)"
                    : "rgba(255, 107, 107, 0.15)",
                  shadowColor: "#FF6B6B",
                },
              ]}
            >
              <View
                style={[
                  styles.statIconContainer,
                  {
                    backgroundColor: isDark
                      ? "rgba(255, 107, 107, 0.2)"
                      : "rgba(255, 107, 107, 0.08)",
                    borderWidth: 2,
                    borderColor: "#FF6B6B",
                  },
                ]}
              >
                <Ionicons name="flame" size={24} color="#FF6B6B" />
              </View>
              <Text style={[styles.statNumber, { color: currentColors.text }]}>
                0
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  {
                    color: isDark
                      ? "rgba(255, 255, 255, 0.7)"
                      : "rgba(0, 0, 0, 0.5)",
                  },
                ]}
              >
                Workouts
              </Text>
              <View
                style={[
                  styles.statProgress,
                  { backgroundColor: "rgba(255, 107, 107, 0.2)" },
                ]}
              >
                <View
                  style={[
                    styles.statProgressBar,
                    { backgroundColor: "#FF6B6B", width: "0%" },
                  ]}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.statCard,
                {
                  backgroundColor: isDark ? currentColors.card : "#FFFFFF",
                  borderColor: isDark
                    ? "rgba(255, 193, 7, 0.3)"
                    : "rgba(255, 193, 7, 0.15)",
                  shadowColor: "#FFC107",
                },
              ]}
            >
              <View
                style={[
                  styles.statIconContainer,
                  {
                    backgroundColor: isDark
                      ? "rgba(255, 193, 7, 0.2)"
                      : "rgba(255, 193, 7, 0.08)",
                    borderWidth: 2,
                    borderColor: "#FFC107",
                  },
                ]}
              >
                <Ionicons name="trophy" size={24} color="#FFC107" />
              </View>
              <Text style={[styles.statNumber, { color: currentColors.text }]}>
                0
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  {
                    color: isDark
                      ? "rgba(255, 255, 255, 0.7)"
                      : "rgba(0, 0, 0, 0.5)",
                  },
                ]}
              >
                Day Streak
              </Text>
              <View
                style={[
                  styles.statProgress,
                  { backgroundColor: "rgba(255, 193, 7, 0.2)" },
                ]}
              >
                <View
                  style={[
                    styles.statProgressBar,
                    { backgroundColor: "#FFC107", width: "0%" },
                  ]}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.statCard,
                {
                  backgroundColor: isDark ? currentColors.card : "#FFFFFF",
                  borderColor: isDark
                    ? currentColors.primary
                    : "rgba(0, 255, 65, 0.15)",
                  shadowColor: currentColors.primary,
                },
              ]}
            >
              <View
                style={[
                  styles.statIconContainer,
                  {
                    backgroundColor: isDark
                      ? "rgba(0, 255, 65, 0.2)"
                      : "rgba(0, 255, 65, 0.08)",
                    borderWidth: 2,
                    borderColor: currentColors.primary,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="weight-lifter"
                  size={24}
                  color={currentColors.primary}
                />
              </View>
              <Text style={[styles.statNumber, { color: currentColors.text }]}>
                0
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  {
                    color: isDark
                      ? "rgba(255, 255, 255, 0.7)"
                      : "rgba(0, 0, 0, 0.5)",
                  },
                ]}
              >
                Total PRs
              </Text>
              <View
                style={[
                  styles.statProgress,
                  {
                    backgroundColor: isDark
                      ? "rgba(0, 255, 65, 0.2)"
                      : "rgba(0, 255, 65, 0.1)",
                  },
                ]}
              >
                <View
                  style={[
                    styles.statProgressBar,
                    {
                      backgroundColor: currentColors.primary,
                      width: "0%",
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Premium Content Cards */}
          <View
            style={[
              styles.contentCard,
              {
                backgroundColor: isDark ? currentColors.card : "#FFFFFF",
                borderColor: isDark
                  ? currentColors.primary
                  : "rgba(0, 255, 65, 0.12)",
                shadowColor: isDark ? currentColors.primary : "#000",
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <View
                  style={[
                    styles.headerIcon,
                    {
                      backgroundColor: isDark
                        ? "rgba(0, 255, 65, 0.2)"
                        : "rgba(0, 255, 65, 0.08)",
                      borderWidth: 2,
                      borderColor: currentColors.primary,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="meditation"
                    size={20}
                    color={currentColors.primary}
                  />
                </View>
                <View>
                  <Text
                    style={[styles.cardTitle, { color: currentColors.text }]}
                  >
                    Daily Mantras
                  </Text>
                  <Text
                    style={[
                      styles.cardSubtitle,
                      {
                        color: isDark
                          ? "rgba(255, 255, 255, 0.6)"
                          : "rgba(0, 0, 0, 0.45)",
                      },
                    ]}
                  >
                    Mindset & Focus
                  </Text>
                </View>
              </View>
            </View>
            <View
              style={[
                styles.cardDivider,
                {
                  backgroundColor: isDark
                    ? "rgba(0, 255, 65, 0.2)"
                    : "rgba(0, 255, 65, 0.08)",
                },
              ]}
            />
            {mantras.map((mantra, i) => (
              <View key={i} style={styles.listItem}>
                <View
                  style={[
                    styles.bulletPoint,
                    {
                      backgroundColor: currentColors.primary,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.listText,
                    {
                      color: isDark
                        ? "rgba(255, 255, 255, 0.9)"
                        : "rgba(0, 0, 0, 0.8)",
                    },
                  ]}
                >
                  {mantra}
                </Text>
              </View>
            ))}
          </View>

          <View
            style={[
              styles.contentCard,
              {
                backgroundColor: isDark ? currentColors.card : "#FFFFFF",
                borderColor: isDark
                  ? currentColors.primary
                  : "rgba(0, 255, 65, 0.12)",
                shadowColor: isDark ? currentColors.primary : "#000",
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <View
                  style={[
                    styles.headerIcon,
                    {
                      backgroundColor: isDark
                        ? "rgba(0, 255, 65, 0.2)"
                        : "rgba(0, 255, 65, 0.08)",
                      borderWidth: 2,
                      borderColor: currentColors.primary,
                    },
                  ]}
                >
                  <Ionicons
                    name="flash"
                    size={20}
                    color={currentColors.primary}
                  />
                </View>
                <View>
                  <Text
                    style={[styles.cardTitle, { color: currentColors.text }]}
                  >
                    Motivation Boost
                  </Text>
                  <Text
                    style={[
                      styles.cardSubtitle,
                      {
                        color: isDark
                          ? "rgba(255, 255, 255, 0.6)"
                          : "rgba(0, 0, 0, 0.45)",
                      },
                    ]}
                  >
                    Stay Inspired
                  </Text>
                </View>
              </View>
            </View>
            <View
              style={[
                styles.cardDivider,
                {
                  backgroundColor: isDark
                    ? "rgba(0, 255, 65, 0.2)"
                    : "rgba(0, 255, 65, 0.08)",
                },
              ]}
            />
            {quotes.map((quote, i) => (
              <TouchableOpacity
                key={i}
                activeOpacity={0.7}
                style={[
                  styles.quoteItem,
                  {
                    backgroundColor: isDark
                      ? "rgba(0, 255, 65, 0.05)"
                      : "rgba(0, 255, 65, 0.025)",
                  },
                ]}
              >
                <View
                  style={[
                    styles.quoteAccent,
                    { backgroundColor: currentColors.primary },
                  ]}
                />
                <View style={styles.quoteContent}>
                  <Text
                    style={[
                      styles.quoteText,
                      {
                        color: isDark
                          ? "rgba(255, 255, 255, 0.85)"
                          : "rgba(0, 0, 0, 0.75)",
                      },
                    ]}
                  >
                    "{quote}"
                  </Text>
                  <Ionicons
                    name="heart-outline"
                    size={18}
                    color={
                      isDark
                        ? "rgba(255, 255, 255, 0.4)"
                        : "rgba(0, 0, 0, 0.25)"
                    }
                    style={styles.quoteIcon}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Premium Animated Primary Button */}
          <Animated.View
            style={{
              transform: [{ scale: pulseAnim }],
            }}
          >
            <TouchableOpacity
              style={[
                styles.primaryButton,
                {
                  backgroundColor: currentColors.primary,
                  shadowColor: currentColors.primary,
                },
              ]}
              onPress={() => router.push("/plan")}
              activeOpacity={0.85}
            >
              <Animated.View
                style={[
                  styles.buttonGlow,
                  {
                    backgroundColor: currentColors.primary,
                    opacity: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.2, 0.4],
                    }),
                  },
                ]}
              />
              <MaterialCommunityIcons
                name="play-circle"
                size={26}
                color={isDark ? currentColors.background : "#000000"}
              />
              <Text
                style={[
                  styles.primaryButtonText,
                  {
                    color: isDark ? currentColors.background : "#000000",
                  },
                ]}
              >
                Start New Workout
              </Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={isDark ? currentColors.background : "#000000"}
              />
            </TouchableOpacity>
          </Animated.View>

          {/* Premium Secondary Actions */}
          <View style={styles.secondaryActions}>
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                {
                  backgroundColor: isDark ? currentColors.card : "#FFFFFF",
                  borderColor: isDark
                    ? currentColors.primary
                    : "rgba(0, 255, 65, 0.2)",
                },
              ]}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.secondaryIconWrapper,
                  {
                    backgroundColor: isDark
                      ? "rgba(0, 255, 65, 0.15)"
                      : "rgba(0, 255, 65, 0.08)",
                  },
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={currentColors.primary}
                />
              </View>
              <Text
                style={[
                  styles.secondaryButtonText,
                  { color: currentColors.text },
                ]}
              >
                Schedule
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                {
                  backgroundColor: isDark ? currentColors.card : "#FFFFFF",
                  borderColor: isDark
                    ? currentColors.primary
                    : "rgba(0, 255, 65, 0.2)",
                },
              ]}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.secondaryIconWrapper,
                  {
                    backgroundColor: isDark
                      ? "rgba(0, 255, 65, 0.15)"
                      : "rgba(0, 255, 65, 0.08)",
                  },
                ]}
              >
                <Ionicons
                  name="bar-chart-outline"
                  size={20}
                  color={currentColors.primary}
                />
              </View>
              <Text
                style={[
                  styles.secondaryButtonText,
                  { color: currentColors.text },
                ]}
              >
                Progress
              </Text>
            </TouchableOpacity>
          </View>

          {/* Premium Quick Actions Grid */}
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[
                styles.quickActionCard,
                {
                  backgroundColor: isDark ? currentColors.card : "#FFFFFF",
                  borderColor: isDark
                    ? currentColors.primary
                    : "rgba(0, 255, 65, 0.12)",
                },
              ]}
              onPress={() => router.push("/calculator")}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.quickActionIconWrapper,
                  {
                    backgroundColor: isDark
                      ? "rgba(0, 255, 65, 0.15)"
                      : "rgba(0, 255, 65, 0.06)",
                  },
                ]}
              >
                <Ionicons
                  name="calculator"
                  size={24}
                  color={currentColors.primary}
                />
              </View>
              <Text
                style={[styles.quickActionText, { color: currentColors.text }]}
              >
                Calculator
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickActionCard,
                {
                  backgroundColor: isDark ? currentColors.card : "#FFFFFF",
                  borderColor: isDark
                    ? currentColors.primary
                    : "rgba(0, 255, 65, 0.12)",
                },
              ]}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.quickActionIconWrapper,
                  {
                    backgroundColor: isDark
                      ? "rgba(0, 255, 65, 0.15)"
                      : "rgba(0, 255, 65, 0.06)",
                  },
                ]}
              >
                <Ionicons
                  name="water-outline"
                  size={24}
                  color={currentColors.primary}
                />
              </View>
              <Text
                style={[styles.quickActionText, { color: currentColors.text }]}
              >
                Hydration
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickActionCard,
                {
                  backgroundColor: isDark ? currentColors.card : "#FFFFFF",
                  borderColor: isDark
                    ? currentColors.primary
                    : "rgba(0, 255, 65, 0.12)",
                },
              ]}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.quickActionIconWrapper,
                  {
                    backgroundColor: isDark
                      ? "rgba(0, 255, 65, 0.15)"
                      : "rgba(0, 255, 65, 0.06)",
                  },
                ]}
              >
                <Ionicons
                  name="moon-outline"
                  size={24}
                  color={currentColors.primary}
                />
              </View>
              <Text
                style={[styles.quickActionText, { color: currentColors.text }]}
              >
                Sleep
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickActionCard,
                {
                  backgroundColor: isDark ? currentColors.card : "#FFFFFF",
                  borderColor: isDark
                    ? currentColors.primary
                    : "rgba(0, 255, 65, 0.12)",
                },
              ]}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.quickActionIconWrapper,
                  {
                    backgroundColor: isDark
                      ? "rgba(0, 255, 65, 0.15)"
                      : "rgba(0, 255, 65, 0.06)",
                  },
                ]}
              >
                <Ionicons
                  name="settings-outline"
                  size={24}
                  color={currentColors.primary}
                />
              </View>
              <Text
                style={[styles.quickActionText, { color: currentColors.text }]}
              >
                Settings
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 12,
    borderBottomWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoTouchable: {
    flexShrink: 1,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  themeToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  loggedInContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  avatarCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "700",
  },
  username: {
    fontSize: 13,
    fontWeight: "600",
    maxWidth: 70,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    height: 34,
    borderRadius: 17,
    gap: 5,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  loginButtonText: {
    fontWeight: "700",
    fontSize: 13,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 16,
    gap: 4,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  logoutButtonText: {
    fontWeight: "700",
    fontSize: 12,
  },
  scrollContainer: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 28,
    height: 290,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1.5,
    position: "relative",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientCircle1: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    top: -70,
    right: -70,
  },
  gradientCircle2: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    bottom: -60,
    left: -60,
  },
  decorCircle: {
    position: "absolute",
    borderRadius: 1000,
  },
  decorCircle1: {
    width: 220,
    height: 220,
    top: -60,
    right: -60,
  },
  decorCircle2: {
    width: 160,
    height: 160,
    bottom: -50,
    left: -50,
  },
  heroContent: {
    alignItems: "center",
    zIndex: 1,
  },
  iconCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 10,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 18,
    textAlign: "center",
    lineHeight: 22,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
  },
  heroBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 22,
    paddingHorizontal: 8,
    borderRadius: 24,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  statProgress: {
    width: "85%",
    height: 5,
    borderRadius: 2.5,
    marginTop: 2,
    overflow: "hidden",
  },
  statProgressBar: {
    height: "100%",
    borderRadius: 2.5,
  },
  contentCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 18,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 3,
  },
  cardDivider: {
    height: 1.5,
    borderRadius: 1,
    marginBottom: 20,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
    paddingRight: 4,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
    marginRight: 14,
    flexShrink: 0,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "500",
  },
  quoteItem: {
    flexDirection: "row",
    marginBottom: 14,
    paddingLeft: 4,
    paddingVertical: 14,
    paddingRight: 14,
    borderRadius: 16,
  },
  quoteAccent: {
    width: 4,
    borderRadius: 2,
    marginRight: 16,
    flexShrink: 0,
  },
  quoteContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  quoteText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "500",
    fontStyle: "italic",
  },
  quoteIcon: {
    marginLeft: 10,
    marginTop: 4,
    flexShrink: 0,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 20,
    marginTop: 6,
    marginBottom: 16,
    gap: 12,
    position: "relative",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  buttonGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  secondaryActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  secondaryIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 6,
  },
  quickActionCard: {
    width: (width - 52) / 2,
    aspectRatio: 1.5,
    borderRadius: 20,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  quickActionIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "700",
  },
});