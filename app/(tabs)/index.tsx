// app/(tabs)/index.tsx - Enhanced Homepage
import Clock from "@/components/clock";
import MusicPlayer from "@/components/MusicPlayer";
import { Colors } from "@/constants/Colors";
import { useMusic } from "@/context/MusicContext";
import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSimpleTheme } from "../../context/SimpleThemeContext";

const { width } = Dimensions.get("window");

type ActivityResponse = {
  success: boolean;
  activity?: {
    currentStreak?: number;
    longestStreak?: number;
    weeklyProgress?: {
      completedWorkouts?: number;
    };
  };
};

// Enhanced animated background particles
const FloatingParticles = ({ color }: { color: string }) => {
  const particles = useRef([...Array(12)]).current.map(() => ({
    anim: new Animated.Value(0),
    x: Math.random() * width,
    y: Math.random() * 300,
    size: Math.random() * 4 + 2,
    delay: Math.random() * 2000,
    duration: Math.random() * 3000 + 2000,
  }));

  useEffect(() => {
    particles.forEach((p) => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.delay(p.delay),
          Animated.timing(p.anim, {
            toValue: 1,
            duration: p.duration,
            useNativeDriver: true,
          }),
          Animated.timing(p.anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.delay(500),
        ]),
      );
      loop.start();
    });
  }, []);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            left: p.x,
            bottom: p.y,
            width: p.size,
            height: p.size,
            borderRadius: p.size / 2,
            backgroundColor: color,
            opacity: p.anim.interpolate({
              inputRange: [0, 0.2, 0.8, 1],
              outputRange: [0, 0.6, 0.4, 0],
            }),
            transform: [
              {
                translateY: p.anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -250],
                }),
              },
              {
                scale: p.anim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [1, 1.5, 0.8],
                }),
              },
            ],
          }}
        />
      ))}
    </View>
  );
};

const QuoteCarousel = ({
  quotes,
  color,
  isDark,
}: {
  quotes: string[];
  color: string;
  isDark: boolean;
}) => {
  const [index, setIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIndex((prev) => (prev + 1) % quotes.length);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
        alignItems: "center",
      }}
    >
      <Text
        style={[
          styles.quoteCarouselText,
          { color: isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.75)" },
        ]}
      >
        "{quotes[index]}"
      </Text>
      <View style={styles.quoteDots}>
        {quotes.map((_, i) => (
          <View
            key={i}
            style={[
              styles.quoteDot,
              {
                backgroundColor: i === index ? color : isDark ? "#333" : "#ddd",
                width: i === index ? 20 : 6,
                height: i === index ? 4 : 3,
              },
            ]}
          />
        ))}
      </View>
    </Animated.View>
  );
};

const PulsingDot = ({ color }: { color: string }) => {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.4,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);
  return (
    <Animated.View
      style={{
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: color,
        transform: [{ scale: pulse }],
        opacity: pulse.interpolate({
          inputRange: [1, 1.4],
          outputRange: [1, 0.5],
        }),
      }}
    />
  );
};

const gymBroLogo = require("@/assets/images/sections/Icon_gym_bro.png");
const gymBroLogoT = require("@/assets/images/sections/gym_bro_khw.png");

export default function Home() {
  const { theme, toggleTheme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [username, setUsername] = useState("");
  const isDark = theme === "dark";

  const [streak, setStreak] = useState(0);
  const [workouts, setWorkouts] = useState(0);
  const [prs, setPrs] = useState(0);

  const fadeInAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;
  const [pulseAnim] = useState(new Animated.Value(1));
  const [glowAnim] = useState(new Animated.Value(0));

  const { stopMusic } = useMusic();
  const [longestStreak, setLongestStreak] = useState(0);

  const fetchUserStats = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      const response = await fetch(
        "https://gymbro-api-sn0e.onrender.com/api/users/activity",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = (await response.json()) as ActivityResponse;

      if (data.success && data.activity) {
        setStreak(data.activity.currentStreak ?? 0);
        setWorkouts(data.activity.weeklyProgress?.completedWorkouts ?? 0);
        setLongestStreak(data.activity.longestStreak ?? 0);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    const redirectIfNotLoggedIn = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          router.replace("/login");
        } else {
          const storedUsername = await AsyncStorage.getItem("username");
          setIsLoggedIn(true);
          setUsername(storedUsername || "");
          await fetchUserStats();
        }
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    };
    redirectIfNotLoggedIn();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeInAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideUpAnim, {
        toValue: 0,
        damping: 12,
        stiffness: 80,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();

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
      ]),
    ).start();
  }, []);

  const handleLogout = async () => {
    try {
      await stopMusic();
      await AsyncStorage.clear();
      setIsLoggedIn(false);
      setUsername("");
      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to logout.");
    }
  };

  const quotes = [
    "The body achieves what the mind believes.",
    "Don't stop when it hurts — stop when you're done.",
    "Every rep is a conversation with your future self.",
    "Champions aren't born. They're built in the gym.",
    "Pain is temporary. The physique you build is permanent.",
  ];

  const mantras = [
    "Respect yourself and trust your power but be humble",
    "Consistency beats perfection every single time",
    "Progress is progress, no matter how small",
  ];

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12 ? "Morning" : greetingHour < 17 ? "Afternoon" : "Evening";

  return (
    <View
      style={[styles.container, { backgroundColor: currentColors.background }]}
    >
      <LinearGradient
        colors={
          isDark
            ? [currentColors.primary + "08", "transparent"]
            : [currentColors.primary + "04", "transparent"]
        }
        style={styles.ambientGlow}
      />

      <View
        style={[
          styles.topBar,
          {
            backgroundColor: isDark
              ? "rgba(10,10,10,0.95)"
              : "rgba(255,255,255,0.95)",
            borderBottomColor: isDark
              ? currentColors.primary + "15"
              : currentColors.primary + "08",
          },
        ]}
      >
        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={() => router.replace("/")}
            activeOpacity={0.7}
            style={styles.logoTouchable}
          >
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={[
                  currentColors.primary + "25",
                  currentColors.primary + "08",
                ]}
                style={styles.logoIconWrapper}
              >
                <Image
                  source={gymBroLogo}
                  style={{
                    width: 34,
                    height: 34,
                    tintColor: currentColors.primary,
                  }}
                  resizeMode="contain"
                />
              </LinearGradient>
              <View>
                <Image
                  source={gymBroLogoT}
                  style={{
                    width: 90,
                    height: 26,
                    tintColor: currentColors.primary,
                  }}
                  resizeMode="contain"
                />
                <View
                  style={[
                    styles.logoUnderline,
                    { backgroundColor: currentColors.primary },
                  ]}
                />
              </View>
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
              size={16}
              color={isDark ? currentColors.background : "#FFF"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomRow}>
          <Clock />

          {isLoggedIn ? (
            <View style={styles.loggedInContainer}>
              <TouchableOpacity
                style={styles.userBadge}
                onPress={() => router.push("/profile")}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[
                    currentColors.primary + "40",
                    currentColors.primary + "15",
                  ]}
                  style={[
                    styles.avatarCircle,
                    {
                      borderColor: currentColors.primary + "60",
                      borderWidth: 1.5,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.avatarText,
                      { color: currentColors.primary },
                    ]}
                  >
                    {username.charAt(0).toUpperCase() || "U"}
                  </Text>
                </LinearGradient>
                <View>
                  <Text
                    style={[styles.username, { color: currentColors.text }]}
                    numberOfLines={1}
                  >
                    {username || "User"}
                  </Text>
                  <Text
                    style={[
                      styles.usernameSubLabel,
                      { color: isDark ? "#555" : "#bbb" },
                    ]}
                  >
                    Good {greeting} 👋
                  </Text>
                </View>
              </TouchableOpacity>
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
                  size={14}
                  color={isDark ? currentColors.background : "#FFF"}
                />
                <Text
                  style={[
                    styles.logoutButtonText,
                    { color: isDark ? currentColors.background : "#FFF" },
                  ]}
                >
                  Out
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.loginButton,
                { backgroundColor: currentColors.primary },
              ]}
              onPress={() => router.push("/login")}
              activeOpacity={0.85}
            >
              <AntDesign
                name="login"
                size={14}
                color={isDark ? currentColors.background : "#FFF"}
              />
              <Text
                style={[
                  styles.loginButtonText,
                  { color: isDark ? currentColors.background : "#FFF" },
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
            opacity: fadeInAnim,
            transform: [{ translateY: slideUpAnim }],
          }}
        >
          {/* Hero Card */}
          <View
            style={[
              styles.heroCard,
              {
                backgroundColor: isDark ? "#0d0d0d" : "#fff",
                borderColor: isDark
                  ? currentColors.primary + "30"
                  : currentColors.primary + "15",
              },
            ]}
          >
            <FloatingParticles color={currentColors.primary} />

            <View
              style={[
                styles.heroCornerAccent,
                { borderColor: currentColors.primary + "40" },
              ]}
            />

            <Animated.View
              pointerEvents="none"
              style={[
                styles.heroGlow,
                {
                  backgroundColor: currentColors.primary,
                  opacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.04, 0.12],
                  }),
                },
              ]}
            />

            <View style={styles.heroContent}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <LinearGradient
                  colors={[
                    currentColors.primary + "20",
                    currentColors.primary + "05",
                  ]}
                  style={styles.heroIconRing}
                >
                  <LinearGradient
                    colors={[
                      currentColors.primary + "30",
                      currentColors.primary + "10",
                    ]}
                    style={styles.heroIconCore}
                  >
                    <Image
                      source={gymBroLogo}
                      style={{
                        width: 55,
                        height: 55,
                        tintColor: currentColors.primary,
                      }}
                      resizeMode="contain"
                    />
                  </LinearGradient>
                </LinearGradient>
              </Animated.View>

              <View style={styles.heroTagRow}>
                <View
                  style={[
                    styles.heroTag,
                    {
                      backgroundColor: currentColors.primary + "12",
                      borderColor: currentColors.primary + "25",
                    },
                  ]}
                >
                  <PulsingDot color={currentColors.primary} />
                  <Text
                    style={[
                      styles.heroTagText,
                      { color: currentColors.primary },
                    ]}
                  >
                    TRACK · TRAIN · TRANSFORM
                  </Text>
                </View>
              </View>

              <Text style={[styles.heroTitle, { color: currentColors.text }]}>
                Your Fitness{" "}
                <Text style={{ color: currentColors.primary }}>Journey</Text>{" "}
                Starts Here
              </Text>

              <Text
                style={[
                  styles.heroSubtitle,
                  { color: isDark ? "#888" : "#aaa" },
                ]}
              >
                Every rep brings you closer to your best self
              </Text>

              <View style={styles.heroStatRow}>
                <View style={styles.heroStatItem}>
                  <Ionicons name="flame" size={18} color="#FF6B6B" />
                  <Text
                    style={[
                      styles.heroStatValue,
                      { color: currentColors.text },
                    ]}
                  >
                    {streak}
                  </Text>
                  <Text
                    style={[
                      styles.heroStatLabel,
                      { color: isDark ? "#666" : "#999" },
                    ]}
                  >
                    Day Streak
                  </Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStatItem}>
                  <Ionicons name="barbell-outline" size={18} color="#FFC107" />
                  <Text
                    style={[
                      styles.heroStatValue,
                      { color: currentColors.text },
                    ]}
                  >
                    {workouts}
                  </Text>
                  <Text
                    style={[
                      styles.heroStatLabel,
                      { color: isDark ? "#666" : "#999" },
                    ]}
                  >
                    This Week
                  </Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStatItem}>
                  <Ionicons
                    name="trophy-outline"
                    size={18}
                    color={currentColors.primary}
                  />
                  <Text
                    style={[
                      styles.heroStatValue,
                      { color: currentColors.text },
                    ]}
                  >
                    {longestStreak}
                  </Text>
                  <Text
                    style={[
                      styles.heroStatLabel,
                      { color: isDark ? "#666" : "#999" },
                    ]}
                  >
                    Best Streak
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <MusicPlayer />

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            {[
              {
                icon: "flame",
                label: "Workouts",
                value: workouts,
                color: "#FF6B6B",
                bg: "rgba(255,107,107,0.1)",
              },
              {
                icon: "trophy",
                label: "Current Streak",
                value: streak,
                color: "#FFC107",
                bg: "rgba(255,193,7,0.1)",
              },
              {
                icon: "barbell-outline" as any,
                label: "Total PRs",
                value: prs,
                color: currentColors.primary,
                bg: currentColors.primary + "10",
              },
            ].map((s, i) => (
              <TouchableOpacity
                key={i}
                activeOpacity={0.85}
                style={[
                  styles.statCard,
                  {
                    backgroundColor: isDark ? currentColors.card : "#fff",
                    borderColor: isDark ? s.color + "20" : s.color + "10",
                  },
                ]}
              >
                <View
                  style={[styles.statTopStrip, { backgroundColor: s.color }]}
                />
                <View
                  style={[styles.statIconContainer, { backgroundColor: s.bg }]}
                >
                  <Ionicons name={s.icon as any} size={24} color={s.color} />
                </View>
                <Text
                  style={[styles.statNumber, { color: currentColors.text }]}
                >
                  {s.value}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: isDark ? "#666" : "#999" },
                  ]}
                >
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Primary CTA */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { shadowColor: currentColors.primary },
              ]}
              onPress={() => router.push("/workout")}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[currentColors.primary, currentColors.primary + "dd"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Animated.View
                style={[
                  styles.buttonShimmer,
                  {
                    opacity: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.15],
                    }),
                  },
                ]}
              />
              <View style={styles.btnIconWrap}>
                <MaterialCommunityIcons
                  name="play-circle"
                  size={22}
                  color={isDark ? currentColors.background : "#000"}
                />
              </View>
              <Text
                style={[
                  styles.primaryButtonText,
                  { color: isDark ? currentColors.background : "#000" },
                ]}
              >
                Start New Workout
              </Text>
              <View style={styles.btnArrowWrap}>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color={isDark ? currentColors.background : "#000"}
                />
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Secondary Actions */}
          <View style={styles.secondaryActions}>
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                {
                  backgroundColor: isDark ? currentColors.card : "#fff",
                  borderColor: isDark
                    ? currentColors.primary + "20"
                    : currentColors.primary + "10",
                },
              ]}
              activeOpacity={0.8}
              onPress={() => router.push("/config/schedule")}
            >
              <View
                style={[
                  styles.secondaryIconWrapper,
                  { backgroundColor: currentColors.primary + "10" },
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={currentColors.primary}
                />
              </View>
              <View>
                <Text
                  style={[
                    styles.secondaryButtonText,
                    { color: currentColors.text },
                  ]}
                >
                  Schedule
                </Text>
                <Text
                  style={[
                    styles.secondaryButtonSub,
                    { color: isDark ? "#555" : "#bbb" },
                  ]}
                >
                  Plan ahead
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                {
                  backgroundColor: isDark ? currentColors.card : "#fff",
                  borderColor: isDark
                    ? currentColors.primary + "20"
                    : currentColors.primary + "10",
                },
              ]}
              activeOpacity={0.8}
              onPress={() => router.push("/profile")}
            >
              <View
                style={[
                  styles.secondaryIconWrapper,
                  { backgroundColor: currentColors.primary + "10" },
                ]}
              >
                <Ionicons
                  name="bar-chart-outline"
                  size={20}
                  color={currentColors.primary}
                />
              </View>
              <View>
                <Text
                  style={[
                    styles.secondaryButtonText,
                    { color: currentColors.text },
                  ]}
                >
                  Progress
                </Text>
                <Text
                  style={[
                    styles.secondaryButtonSub,
                    { color: isDark ? "#555" : "#bbb" },
                  ]}
                >
                  View stats
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Motivation Card */}
          <View
            style={[
              styles.contentCard,
              {
                backgroundColor: isDark ? currentColors.card : "#fff",
                borderColor: isDark
                  ? currentColors.primary + "18"
                  : currentColors.primary + "08",
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <View
                  style={[
                    styles.headerIcon,
                    { backgroundColor: currentColors.primary + "12" },
                  ]}
                >
                  <Ionicons
                    name="flash"
                    size={18}
                    color={currentColors.primary}
                  />
                </View>
                <Text style={[styles.cardTitle, { color: currentColors.text }]}>
                  Fuel Your Mindset
                </Text>
              </View>
              <View
                style={[
                  styles.liveDot,
                  { backgroundColor: currentColors.primary },
                ]}
              />
            </View>
            <View
              style={[
                styles.cardDivider,
                {
                  backgroundColor: isDark
                    ? currentColors.primary + "15"
                    : currentColors.primary + "08",
                },
              ]}
            />
            <QuoteCarousel
              quotes={quotes}
              color={currentColors.primary}
              isDark={isDark}
            />
          </View>

          {/* Daily Mantras */}
          <View
            style={[
              styles.contentCard,
              {
                backgroundColor: isDark ? currentColors.card : "#fff",
                borderColor: isDark
                  ? currentColors.primary + "18"
                  : currentColors.primary + "08",
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <View
                  style={[
                    styles.headerIcon,
                    { backgroundColor: currentColors.primary + "12" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="meditation"
                    size={18}
                    color={currentColors.primary}
                  />
                </View>
                <Text style={[styles.cardTitle, { color: currentColors.text }]}>
                  Daily Mantras
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.cardDivider,
                {
                  backgroundColor: isDark
                    ? currentColors.primary + "15"
                    : currentColors.primary + "08",
                },
              ]}
            />
            {mantras.map((mantra, i) => (
              <View
                key={i}
                style={[
                  styles.mantraRow,
                  {
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.02)"
                      : "rgba(0,0,0,0.01)",
                    borderLeftColor: currentColors.primary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.mantraNumber,
                    { color: currentColors.primary },
                  ]}
                >
                  0{i + 1}
                </Text>
                <Text
                  style={[
                    styles.mantraText,
                    {
                      color: isDark
                        ? "rgba(255,255,255,0.85)"
                        : "rgba(0,0,0,0.75)",
                    },
                  ]}
                >
                  {mantra}
                </Text>
              </View>
            ))}
          </View>

          {/* Quick Access Grid */}
          <Text
            style={[
              styles.gridSectionLabel,
              { color: isDark ? "#555" : "#ccc" },
            ]}
          >
            QUICK ACCESS
          </Text>
          <View style={styles.quickActionsGrid}>
            {[
              {
                icon: "calculator",
                label: "Calculator",
                onPress: () => router.push("/calculator"),
                accent: "#007AFF",
              },
              {
                icon: "water-outline",
                label: "Hydration",
                onPress: () => router.push("/config/hydration"),
                accent: "#34C759",
              },
              {
                icon: "moon-outline",
                label: "Sleep Mode",
                onPress: () => router.push("/config/sleep-mode"),
                accent: "#AF52DE",
              },
              {
                icon: "settings-outline",
                label: "Settings",
                onPress: () => router.push("/settings"),
                accent: "#FF9500",
              },
            ].map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.quickActionCard,
                  {
                    backgroundColor: isDark ? currentColors.card : "#fff",
                    borderColor: isDark
                      ? item.accent + "20"
                      : item.accent + "10",
                  },
                ]}
                onPress={item.onPress}
                activeOpacity={0.78}
              >
                <View
                  style={[styles.qaCorner, { backgroundColor: item.accent }]}
                />
                <View
                  style={[
                    styles.quickActionIconWrapper,
                    { backgroundColor: item.accent + "10" },
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={22}
                    color={item.accent}
                  />
                </View>
                <Text
                  style={[
                    styles.quickActionText,
                    { color: currentColors.text },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          
          {/* Bottom Banner */}
          <View
            style={[
              styles.bottomBanner,
              {
                borderColor: isDark
                  ? currentColors.primary + "15"
                  : currentColors.primary + "08",
              },
            ]}
          >
            <LinearGradient
              colors={
                isDark
                  ? [currentColors.primary + "08", "transparent"]
                  : [currentColors.primary + "04", "transparent"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <MaterialCommunityIcons
              name="lightning-bolt"
              size={18}
              color={currentColors.primary}
            />
            <Text
              style={[
                styles.bottomBannerText,
                {
                  color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)",
                },
              ]}
            >
              GymBro v1.0.0 · Stay consistent, stay lethal.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  ambientGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },

  topBar: {
    paddingHorizontal: 18,
    paddingTop: Platform.OS === "ios" ? 54 : 44,
    paddingBottom: 14,
    borderBottomWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
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
  logoTouchable: { flexShrink: 1 },
  logoContainer: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  logoUnderline: { height: 2, width: 28, borderRadius: 1, marginTop: 2 },
  themeToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: { elevation: 5 },
    }),
  },
  loggedInContainer: { flexDirection: "row", alignItems: "center", gap: 10 },
  userBadge: { flexDirection: "row", alignItems: "center", gap: 8 },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 14, fontWeight: "800" },
  username: { fontSize: 13, fontWeight: "700", maxWidth: 80 },
  usernameSubLabel: { fontSize: 9, fontWeight: "500", marginTop: 0 },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 17,
    gap: 6,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  loginButtonText: { fontWeight: "700", fontSize: 13 },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    height: 32,
    borderRadius: 16,
    gap: 4,
    borderWidth: 1.5,
  },
  logoutButtonText: { fontWeight: "700", fontSize: 11 },

  scrollContainer: { paddingTop: 16, paddingHorizontal: 18, paddingBottom: 40 },

  heroCard: {
    borderRadius: 28,
    minHeight: 280,
    marginBottom: 16,
    borderWidth: 1.5,
    position: "relative",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
      },
      android: { elevation: 8 },
    }),
  },
  heroCornerAccent: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 80,
    height: 80,
    borderRightWidth: 2,
    borderTopWidth: 2,
    borderTopRightRadius: 28,
  },
  heroGlow: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    top: -80,
    right: -80,
  },
  heroContent: {
    alignItems: "center",
    zIndex: 1,
    paddingTop: 20,
    paddingBottom: 20,
  },
  heroIconRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  heroIconCore: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
  },
  heroTagRow: { marginBottom: 12 },
  heroTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  heroTagText: { fontSize: 9, fontWeight: "800", letterSpacing: 1.2 },
  heroTitle: {
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 0.3,
    lineHeight: 30,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
  },
  heroStatRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(128,128,128,0.05)",
  },
  heroStatItem: { alignItems: "center", gap: 4 },
  heroStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(128,128,128,0.15)",
  },
  heroStatValue: { fontSize: 18, fontWeight: "800" },
  heroStatLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  statsGrid: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 6,
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: "hidden",
    position: "relative",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: { elevation: 4 },
    }),
  },
  statTopStrip: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0.7,
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },

  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 24,
    marginBottom: 16,
    gap: 12,
    overflow: "hidden",
    position: "relative",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
      },
      android: { elevation: 10 },
    }),
  },
  buttonShimmer: {
    position: "absolute",
    top: 0,
    left: "-30%",
    width: "50%",
    height: "100%",
    backgroundColor: "#fff",
    transform: [{ skewX: "-20deg" }],
  },
  btnIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  primaryButtonText: { fontSize: 16, fontWeight: "900", letterSpacing: 0.5 },
  btnArrowWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
  },

  secondaryActions: { flexDirection: "row", gap: 12, marginBottom: 16 },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  secondaryIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: { fontSize: 14, fontWeight: "800" },
  secondaryButtonSub: { fontSize: 10, fontWeight: "500", marginTop: 2 },

  contentCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: { fontSize: 17, fontWeight: "800", letterSpacing: 0.2 },
  cardDivider: { height: 1, borderRadius: 1, marginBottom: 16 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },

  quoteCarouselText: {
    fontSize: 16,
    fontWeight: "600",
    fontStyle: "italic",
    lineHeight: 26,
    textAlign: "center",
    marginBottom: 16,
  },
  quoteDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  quoteDot: { height: 3, borderRadius: 2 },

  mantraRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderLeftWidth: 3,
    marginBottom: 8,
  },
  mantraNumber: { fontSize: 14, fontWeight: "900", minWidth: 24 },
  mantraText: { flex: 1, fontSize: 13, fontWeight: "500", lineHeight: 20 },

  gridSectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 18,
  },
  quickActionCard: {
    width: (width - 48) / 2,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: "flex-start",
    gap: 12,
    position: "relative",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  qaCorner: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 35,
    height: 3,
    borderBottomLeftRadius: 3,
    opacity: 0.7,
  },
  quickActionIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionText: { fontSize: 14, fontWeight: "800" },
  sleepButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 28,
    borderWidth: 1.5,
    marginBottom: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#AF52DE",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  sleepIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#AF52DE15",
    justifyContent: "center",
    alignItems: "center",
  },
  sleepTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  sleepTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  sleepSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
  bottomBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
    marginBottom: 8,
  },
  bottomBannerText: { fontSize: 11, fontWeight: "500", flex: 1 },
});
