import Clock from "@/components/clock";
import { Colors } from "@/constants/Colors";

import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
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
import { LinearGradient } from "expo-linear-gradient";
import { useSimpleTheme } from "../../context/SimpleThemeContext";

const { width } = Dimensions.get("window");

const GridBackground = ({ color }: { color: string }) => {
  const dots = [];
  const cols = 8;
  const rows = 6;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push(
        <View
          key={`${r}-${c}`}
          style={{
            position: "absolute",
            width: 3,
            height: 3,
            borderRadius: 1.5,
            backgroundColor: color,
            opacity: Math.random() > 0.55 ? 0.35 : 0.1,
            top: r * 40 + 12,
            left: c * (width / cols) + 8,
          }}
        />
      );
    }
  }
  return <View style={StyleSheet.absoluteFill}>{dots}</View>;
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

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setIndex((prev) => (prev + 1) % quotes.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Text style={[styles.quoteCarouselText, { color: isDark ? "rgba(255,255,255,0.88)" : "rgba(0,0,0,0.78)" }]}>
        "{quotes[index]}"
      </Text>
      <View style={styles.quoteDots}>
        {quotes.map((_, i) => (
          <View
            key={i}
            style={[
              styles.quoteDot,
              {
                backgroundColor: i === index ? color : (isDark ? "#333" : "#ddd"),
                width: i === index ? 18 : 6,
              },
            ]}
          />
        ))}
      </View>
    </Animated.View>
  );
};

const ScanLine = ({ color }: { color: string }) => {
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        height: 1.5,
        backgroundColor: color,
        opacity: 0.45,
        transform: [
          {
            translateY: scanAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 280],
            }),
          },
        ],
      }}
    />
  );
};

const focusOptions = [
  { emoji: "💪", label: "Upper Body", color: "#FF6B6B" },
  { emoji: "🦵", label: "Lower Body", color: "#FFC107" },
  { emoji: "🔥", label: "Full Body", color: "#FF9500" },
  { emoji: "🧘", label: "Recovery", color: "#34C759" },
  { emoji: "🏃", label: "Cardio", color: "#007AFF" },
  { emoji: "🏋️", label: "Strength", color: "#AF52DE" },
];

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
  const [stagger1] = useState(new Animated.Value(0));
  const [stagger2] = useState(new Animated.Value(0));
  const [stagger3] = useState(new Animated.Value(0));

  const [selectedFocus, setSelectedFocus] = useState(0);

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
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 45, friction: 8, useNativeDriver: true }),
    ]).start();

    setTimeout(() => Animated.spring(stagger1, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }).start(), 200);
    setTimeout(() => Animated.spring(stagger2, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }).start(), 380);
    setTimeout(() => Animated.spring(stagger3, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }).start(), 540);

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 1600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1600, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2200, useNativeDriver: true }),
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
      { text: "Go to Admin", onPress: () => router.push("/admin/login") },
    ]);
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
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>

      {/* ── TOP BAR ───────────────────────────────────────────────────── */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: isDark ? "rgba(10,10,10,0.97)" : "rgba(255,255,255,0.97)",
            borderBottomColor: isDark ? "rgba(57,255,20,0.12)" : "rgba(57,255,20,0.08)",
          },
        ]}
      >
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => router.replace("/")} activeOpacity={0.7} style={styles.logoTouchable}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={[currentColors.primary + "30", currentColors.primary + "10"]}
                style={styles.logoIconWrapper}
              >
                <MaterialCommunityIcons name="dumbbell" size={18} color={currentColors.primary} />
              </LinearGradient>
              <View>
                <Text style={[styles.logo, { color: currentColors.primary }]}>GymBro</Text>
                <View style={[styles.logoUnderline, { backgroundColor: currentColors.primary }]} />
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleTheme}
            style={[styles.themeToggle, { backgroundColor: currentColors.primary, shadowColor: currentColors.primary }]}
            activeOpacity={0.8}
          >
            <Ionicons name={isDark ? "sunny" : "moon"} size={16} color={isDark ? currentColors.background : "#FFF"} />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomRow}>
          <Clock />

          {isLoggedIn ? (
            <View style={styles.loggedInContainer}>
              <TouchableOpacity style={styles.userBadge} onPress={() => router.push("/profile")} activeOpacity={0.7}>
                <LinearGradient
                  colors={[currentColors.primary + "40", currentColors.primary + "15"]}
                  style={[styles.avatarCircle, { borderColor: currentColors.primary + "60", borderWidth: 1.5 }]}
                >
                  <Text style={[styles.avatarText, { color: currentColors.primary }]}>
                    {username.charAt(0).toUpperCase() || "U"}
                  </Text>
                </LinearGradient>
                <View>
                  <Text style={[styles.username, { color: currentColors.text }]}>{username || "User"}</Text>
                  <Text style={[styles.usernameSubLabel, { color: isDark ? "#555" : "#bbb" }]}>Good {greeting} 👋</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.logoutButton, { backgroundColor: currentColors.primary, borderColor: currentColors.primary }]}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Ionicons name="log-out-outline" size={14} color={isDark ? currentColors.background : "#FFF"} />
                <Text style={[styles.logoutButtonText, { color: isDark ? currentColors.background : "#FFF" }]}>Out</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: currentColors.primary }]}
              onPress={() => { console.log("Login button pressed, trying /login"); router.push("/login"); }}
              activeOpacity={0.85}
            >
              <AntDesign name="login" size={14} color={isDark ? currentColors.background : "#FFF"} />
              <Text style={[styles.loginButtonText, { color: isDark ? currentColors.background : "#FFF" }]}>Login</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── SCROLL BODY ───────────────────────────────────────────────── */}
      <ScrollView
        style={{ backgroundColor: currentColors.background }}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* ══ HERO CARD ══════════════════════════════════════════════ */}
          <View
            style={[
              styles.heroCard,
              {
                backgroundColor: isDark ? "#0d0d0d" : "#fff",
                borderColor: isDark ? currentColors.primary + "40" : currentColors.primary + "20",
              },
            ]}
          >
            {/* Dot grid */}
            <GridBackground color={currentColors.primary} />

            {/* Scan line */}
            <ScanLine color={currentColors.primary} />

            {/* Top-right corner accent */}
            <View style={[styles.heroCornerAccent, { borderColor: currentColors.primary + "50" }]} />

            {/* Ambient glow circles */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.heroGlow1,
                {
                  backgroundColor: currentColors.primary,
                  opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.06, 0.14] }),
                },
              ]}
            />
            <Animated.View
              pointerEvents="none"
              style={[
                styles.heroGlow2,
                {
                  backgroundColor: "#FF6B6B",
                  opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.04, 0.10] }),
                },
              ]}
            />

            <View style={styles.heroContent}>
              {/* Icon with animated ring */}
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <View style={[styles.heroIconRing, { borderColor: currentColors.primary + "40" }]}>
                  <View style={[styles.heroIconRingInner, { borderColor: currentColors.primary + "70" }]}>
                    <LinearGradient
                      colors={[currentColors.primary + "25", currentColors.primary + "08"]}
                      style={styles.heroIconCore}
                    >
                      <MaterialCommunityIcons name="arm-flex" size={44} color={currentColors.primary} />
                    </LinearGradient>
                  </View>
                </View>
              </Animated.View>

              {/* Tag line */}
              <View style={styles.heroTagRow}>
                <View style={[styles.heroTag, { backgroundColor: currentColors.primary + "15", borderColor: currentColors.primary + "30" }]}>
                  <View style={[styles.heroPulsingDot, { backgroundColor: currentColors.primary }]} />
                  <Text style={[styles.heroTagText, { color: currentColors.primary }]}>TRACK · TRAIN · TRANSFORM</Text>
                </View>
              </View>

              {/* Headline */}
              <Text style={[styles.heroTitle, { color: currentColors.text }]}>
                Your Fitness{"\n"}
                <Text style={{ color: currentColors.primary }}>Journey</Text> Starts
              </Text>
              <Text style={[styles.heroSubtitle, { color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.45)" }]}>
                Build discipline. Build strength. Build legacy.
              </Text>

              {/* Micro stat row */}
              <View style={styles.heroStatRow}>
                {[
                  { icon: "flame", value: "0", label: "Streak", color: "#FF6B6B" },
                  { icon: "barbell-outline", value: "0", label: "Workouts", color: "#FFC107" },
                  { icon: "trophy-outline", value: "0", label: "PRs", color: currentColors.primary },
                ].map((s, i) => (
                  <View key={i} style={styles.heroStatItem}>
                    <Ionicons name={s.icon as any} size={16} color={s.color} />
                    <Text style={[styles.heroStatValue, { color: currentColors.text }]}>{s.value}</Text>
                    <Text style={[styles.heroStatLabel, { color: isDark ? "#555" : "#bbb" }]}>{s.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* ══ TODAY'S FOCUS ══════════════════════════════════════════ */}
          <Animated.View style={{ opacity: stagger1, transform: [{ scale: stagger1.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }] }}>
            <View style={[styles.sectionCard, { backgroundColor: isDark ? currentColors.card : "#fff", borderColor: isDark ? currentColors.primary + "20" : currentColors.primary + "12" }]}>
              <View style={styles.sectionCardHeader}>
                <View style={[styles.sectionIconBox, { backgroundColor: currentColors.primary + "15" }]}>
                  <Ionicons name="today-outline" size={18} color={currentColors.primary} />
                </View>
                <View>
                  <Text style={[styles.sectionCardTitle, { color: currentColors.text }]}>Today's Focus</Text>
                  <Text style={[styles.sectionCardSub, { color: isDark ? "#555" : "#bbb" }]}>Select your training goal</Text>
                </View>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.focusScroll} contentContainerStyle={{ gap: 10, paddingRight: 4 }}>
                {focusOptions.map((f, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setSelectedFocus(i)}
                    activeOpacity={0.8}
                    style={[
                      styles.focusPill,
                      {
                        backgroundColor: selectedFocus === i ? f.color + "20" : (isDark ? "#1a1a1a" : "#f5f5f5"),
                        borderColor: selectedFocus === i ? f.color : (isDark ? "#2a2a2a" : "#e8e8e8"),
                        borderWidth: selectedFocus === i ? 1.5 : 1,
                      },
                    ]}
                  >
                    <Text style={styles.focusEmoji}>{f.emoji}</Text>
                    <Text style={[styles.focusLabel, { color: selectedFocus === i ? f.color : (isDark ? "#777" : "#999") }]}>
                      {f.label}
                    </Text>
                    {selectedFocus === i && (
                      <View style={[styles.focusCheck, { backgroundColor: f.color }]}>
                        <Ionicons name="checkmark" size={8} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </Animated.View>

          {/* ══ STATS GRID ═════════════════════════════════════════════ */}
          <Animated.View style={{ opacity: stagger1, transform: [{ translateY: stagger1.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
            <View style={styles.statsGrid}>
              {[
                { icon: "flame", label: "Workouts", value: "0", color: "#FF6B6B", bg: "rgba(255,107,107,0.08)" },
                { icon: "trophy", label: "Day Streak", value: "0", color: "#FFC107", bg: "rgba(255,193,7,0.08)" },
                { icon: "barbell-outline" as any, label: "Total PRs", value: "0", color: currentColors.primary, bg: currentColors.primary + "10" },
              ].map((s, i) => (
                <TouchableOpacity
                  key={i}
                  activeOpacity={0.82}
                  style={[
                    styles.statCard,
                    {
                      backgroundColor: isDark ? currentColors.card : "#fff",
                      borderColor: isDark ? s.color + "30" : s.color + "18",
                    },
                  ]}
                >
                  {/* Top strip */}
                  <View style={[styles.statTopStrip, { backgroundColor: s.color }]} />
                  <View style={[styles.statIconContainer, { backgroundColor: s.bg }]}>
                    <Ionicons name={s.icon as any} size={22} color={s.color} />
                  </View>
                  <Text style={[styles.statNumber, { color: currentColors.text }]}>{s.value}</Text>
                  <Text style={[styles.statLabel, { color: isDark ? "#666" : "#bbb" }]}>{s.label}</Text>
                  <View style={[styles.statProgress, { backgroundColor: s.color + "20" }]}>
                    <View style={[styles.statProgressBar, { backgroundColor: s.color, width: "0%" }]} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[styles.primaryButton, { shadowColor: currentColors.primary }]}
              onPress={() => router.push("/workout")}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[currentColors.primary, currentColors.primary + "cc"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              {/* Shimmer overlay */}
              <Animated.View
                style={[
                  styles.buttonShimmer,
                  {
                    opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.18] }),
                  },
                ]}
              />
              <View style={[styles.btnIconWrap, { backgroundColor: "rgba(0,0,0,0.15)" }]}>
                <MaterialCommunityIcons name="play-circle" size={22} color={isDark ? currentColors.background : "#000"} />
              </View>
              <Text style={[styles.primaryButtonText, { color: isDark ? currentColors.background : "#000" }]}>
                Start New Workout
              </Text>
              <View style={[styles.btnArrowWrap, { backgroundColor: "rgba(0,0,0,0.12)" }]}>
                <Ionicons name="arrow-forward" size={16} color={isDark ? currentColors.background : "#000"} />
              </View>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.secondaryActions}>
            {[
              { icon: "calendar-outline", label: "Schedule", sublabel: "Plan ahead" },
              { icon: "bar-chart-outline", label: "Progress", sublabel: "View stats" },
            ].map((btn, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.secondaryButton,
                  {
                    backgroundColor: isDark ? currentColors.card : "#fff",
                    borderColor: isDark ? currentColors.primary + "25" : currentColors.primary + "15",
                  },
                ]}
                activeOpacity={0.8}
              >
                <View style={[styles.secondaryIconWrapper, { backgroundColor: currentColors.primary + "12" }]}>
                  <Ionicons name={btn.icon as any} size={20} color={currentColors.primary} />
                </View>
                <View>
                  <Text style={[styles.secondaryButtonText, { color: currentColors.text }]}>{btn.label}</Text>
                  <Text style={[styles.secondaryButtonSub, { color: isDark ? "#555" : "#bbb" }]}>{btn.sublabel}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <Animated.View style={{ opacity: stagger2, transform: [{ translateY: stagger2.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }] }}>
            <View
              style={[
                styles.contentCard,
                {
                  backgroundColor: isDark ? currentColors.card : "#fff",
                  borderColor: isDark ? currentColors.primary + "22" : currentColors.primary + "12",
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                  <View style={[styles.headerIcon, { backgroundColor: currentColors.primary + "15" }]}>
                    <Ionicons name="flash" size={18} color={currentColors.primary} />
                  </View>
                  <View>
                    <Text style={[styles.cardTitle, { color: currentColors.text }]}>Fuel the Mindset</Text>
                    <Text style={[styles.cardSubtitle, { color: isDark ? "#555" : "#bbb" }]}>Auto-rotating · every 4s</Text>
                  </View>
                </View>
                <View style={[styles.liveDot, { backgroundColor: currentColors.primary }]} />
              </View>

              <View style={[styles.cardDivider, { backgroundColor: isDark ? currentColors.primary + "18" : currentColors.primary + "10" }]} />

              <QuoteCarousel quotes={quotes} color={currentColors.primary} isDark={isDark} />
            </View>
          </Animated.View>

          <Animated.View style={{ opacity: stagger2, transform: [{ translateY: stagger2.interpolate({ inputRange: [0, 1], outputRange: [32, 0] }) }] }}>
            <View
              style={[
                styles.contentCard,
                {
                  backgroundColor: isDark ? currentColors.card : "#fff",
                  borderColor: isDark ? currentColors.primary + "22" : currentColors.primary + "12",
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                  <View style={[styles.headerIcon, { backgroundColor: currentColors.primary + "15" }]}>
                    <MaterialCommunityIcons name="meditation" size={18} color={currentColors.primary} />
                  </View>
                  <View>
                    <Text style={[styles.cardTitle, { color: currentColors.text }]}>Daily Mantras</Text>
                    <Text style={[styles.cardSubtitle, { color: isDark ? "#555" : "#bbb" }]}>Mindset & Focus</Text>
                  </View>
                </View>
              </View>
              <View style={[styles.cardDivider, { backgroundColor: isDark ? currentColors.primary + "18" : currentColors.primary + "10" }]} />

              {mantras.map((mantra, i) => (
                <View
                  key={i}
                  style={[
                    styles.mantraRow,
                    {
                      backgroundColor: isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.018)",
                      borderLeftColor: currentColors.primary,
                    },
                  ]}
                >
                  <Text style={[styles.mantraNumber, { color: currentColors.primary }]}>
                    0{i + 1}
                  </Text>
                  <Text style={[styles.mantraText, { color: isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.78)" }]}>
                    {mantra}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          <Animated.View style={{ opacity: stagger3, transform: [{ translateY: stagger3.interpolate({ inputRange: [0, 1], outputRange: [28, 0] }) }] }}>
            <Text style={[styles.gridSectionLabel, { color: isDark ? "#555" : "#ccc" }]}>QUICK ACCESS</Text>
            <View style={styles.quickActionsGrid}>
              {[
                { icon: "calculator", label: "Calculator", onPress: () => router.push("/calculator"), accent: "#007AFF" },
                { icon: "water-outline", label: "Hydration", accent: "#34C759" },
                { icon: "moon-outline", label: "Sleep", accent: "#AF52DE" },
                { icon: "settings-outline", label: "Settings", accent: "#FF9500" },
              ].map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.quickActionCard,
                    {
                      backgroundColor: isDark ? currentColors.card : "#fff",
                      borderColor: isDark ? item.accent + "25" : item.accent + "14",
                    },
                  ]}
                  onPress={item.onPress}
                  activeOpacity={0.78}
                >
                  <View style={[styles.qaCorner, { backgroundColor: item.accent }]} />
                  <View style={[styles.quickActionIconWrapper, { backgroundColor: item.accent + "14" }]}>
                    <Ionicons name={item.icon as any} size={22} color={item.accent} />
                  </View>
                  <Text style={[styles.quickActionText, { color: currentColors.text }]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* ══ BOTTOM BANNER ══════════════════════════════════════════ */}
          <View style={[styles.bottomBanner, { borderColor: isDark ? currentColors.primary + "20" : currentColors.primary + "12" }]}>
            <LinearGradient
              colors={isDark ? [currentColors.primary + "10", "transparent"] : [currentColors.primary + "06", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <MaterialCommunityIcons name="lightning-bolt" size={18} color={currentColors.primary} />
            <Text style={[styles.bottomBannerText, { color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.55)" }]}>
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

  topBar: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 52 : 42,
    paddingBottom: 12,
    borderBottomWidth: 1,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoTouchable: { flexShrink: 1 },
  logoContainer: { flexDirection: "row", alignItems: "center", gap: 9 },
  logoIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: { fontSize: 21, fontWeight: "900", letterSpacing: 0.4 },
  logoUnderline: { height: 2, width: 24, borderRadius: 1, marginTop: 1 },
  themeToggle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: { shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.28, shadowRadius: 7 },
      android: { elevation: 5 },
    }),
  },
  loggedInContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  userBadge: { flexDirection: "row", alignItems: "center", gap: 7 },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 14, fontWeight: "800" },
  username: { fontSize: 13, fontWeight: "700", maxWidth: 72 },
  usernameSubLabel: { fontSize: 10, fontWeight: "500", marginTop: 0 },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    height: 32,
    borderRadius: 16,
    gap: 5,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  loginButtonText: { fontWeight: "700", fontSize: 13 },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    height: 30,
    borderRadius: 15,
    gap: 3,
    borderWidth: 1.5,
  },
  logoutButtonText: { fontWeight: "700", fontSize: 11 },

  scrollContainer: { paddingTop: 20, paddingHorizontal: 18, paddingBottom: 40 },

  heroCard: {
    borderRadius: 28,
    minHeight: 320,
    padding: 22,
    marginBottom: 16,
    borderWidth: 1.5,
    position: "relative",
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.18, shadowRadius: 24 },
      android: { elevation: 10 },
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
  heroGlow1: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    top: -80,
    right: -80,
  },
  heroGlow2: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    bottom: -60,
    left: -60,
  },
  heroContent: { alignItems: "center", zIndex: 1, paddingTop: 8 },
  heroIconRing: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  heroIconRingInner: {
    width: 94,
    height: 94,
    borderRadius: 47,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  heroIconCore: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  heroTagRow: { marginBottom: 14 },
  heroTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  heroPulsingDot: { width: 6, height: 6, borderRadius: 3 },
  heroTagText: { fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },
  heroTitle: {
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 0.3,
    lineHeight: 38,
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  heroStatRow: {
    flexDirection: "row",
    gap: 24,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 18,
    backgroundColor: "rgba(128,128,128,0.07)",
  },
  heroStatItem: { alignItems: "center", gap: 3 },
  heroStatValue: { fontSize: 20, fontWeight: "800" },
  heroStatLabel: { fontSize: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },

  sectionCard: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1.5,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.04, shadowRadius: 10 },
      android: { elevation: 2 },
    }),
  },
  sectionCardHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  sectionIconBox: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  sectionCardTitle: { fontSize: 16, fontWeight: "800" },
  sectionCardSub: { fontSize: 11, fontWeight: "500", marginTop: 1 },
  focusScroll: { marginTop: 2 },
  focusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 20,
    position: "relative",
  },
  focusEmoji: { fontSize: 18 },
  focusLabel: { fontSize: 12, fontWeight: "700" },
  focusCheck: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
  },

  statsGrid: { flexDirection: "row", gap: 10, marginBottom: 14 },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 6,
    borderRadius: 22,
    borderWidth: 1.5,
    overflow: "hidden",
    position: "relative",
    ...Platform.select({
      ios: { shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
      android: { elevation: 4 },
    }),
  },
  statTopStrip: { position: "absolute", top: 0, left: 0, right: 0, height: 3, opacity: 0.7 },
  statIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statNumber: { fontSize: 26, fontWeight: "900", letterSpacing: -0.5, marginBottom: 4 },
  statLabel: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 10 },
  statProgress: { width: "75%", height: 4, borderRadius: 2, overflow: "hidden" },
  statProgressBar: { height: "100%", borderRadius: 2 },

  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 17,
    borderRadius: 22,
    marginBottom: 14,
    gap: 10,
    overflow: "hidden",
    position: "relative",
    ...Platform.select({
      ios: { shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.38, shadowRadius: 22 },
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
  btnIconWrap: { width: 34, height: 34, borderRadius: 17, justifyContent: "center", alignItems: "center" },
  primaryButtonText: { fontSize: 17, fontWeight: "900", letterSpacing: 0.4 },
  btnArrowWrap: { width: 30, height: 30, borderRadius: 15, justifyContent: "center", alignItems: "center" },

  secondaryActions: { flexDirection: "row", gap: 10, marginBottom: 14 },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    gap: 10,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  secondaryIconWrapper: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  secondaryButtonText: { fontSize: 14, fontWeight: "800" },
  secondaryButtonSub: { fontSize: 10, fontWeight: "500", marginTop: 1 },

  contentCard: {
    borderRadius: 22,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1.5,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12 },
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
  headerIcon: { width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center" },
  cardTitle: { fontSize: 17, fontWeight: "800", letterSpacing: 0.2 },
  cardSubtitle: { fontSize: 11, fontWeight: "500", marginTop: 2 },
  cardDivider: { height: 1, borderRadius: 1, marginBottom: 16 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },

  quoteCarouselText: {
    fontSize: 17,
    fontWeight: "600",
    fontStyle: "italic",
    lineHeight: 27,
    textAlign: "center",
    marginBottom: 16,
  },
  quoteDots: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 5 },
  quoteDot: { height: 6, borderRadius: 3 },

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
  mantraNumber: { fontSize: 14, fontWeight: "900", minWidth: 22 },
  mantraText: { flex: 1, fontSize: 14, fontWeight: "500", lineHeight: 22 },

  gridSectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginBottom: 10,
    marginLeft: 4,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
  quickActionCard: {
    width: (width - 46) / 2,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: "flex-start",
    gap: 10,
    position: "relative",
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  qaCorner: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 32,
    height: 3,
    borderBottomLeftRadius: 3,
    opacity: 0.7,
  },
  quickActionIconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionText: { fontSize: 14, fontWeight: "800" },

  bottomBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
    marginBottom: 6,
  },
  bottomBannerText: { fontSize: 12, fontWeight: "500", flex: 1 },
});