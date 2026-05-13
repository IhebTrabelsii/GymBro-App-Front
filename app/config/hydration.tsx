// app/hydration.tsx
import { Colors } from "@/constants/Colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSimpleTheme } from "../../context/SimpleThemeContext";

const { width } = Dimensions.get("window");
const GOAL_LITERS = 3.5;

const QUOTES = [
  "Every glass of water is a gift to your kidneys, brain, and heart. Cheers to small, consistent choices.",
  "Even a 2% drop in body water causes a 20% drop in energy. Stay hydrated, stay powerful.",
  "Water is the only drink for a wise man. — Henry David Thoreau",
  "You are 60% water. When you drink, you're literally refueling your engine.",
];

const SCIENCE_FACTS = [
  {
    title: "Why water matters",
    description: "Regulates body temperature, transports nutrients, lubricates joints. Even 1–2% dehydration reduces focus, energy, and physical performance.",
    icon: "💧",
  },
  {
    title: "How much to drink",
    description: "General recommendation: 2.7–3.7 liters per day (11–15 cups). Needs vary by activity, climate, and body size. A simple rule: drink until your urine is pale yellow.",
    icon: "📏",
  },
  {
    title: "Signs of dehydration",
    description: "Dark urine, dry mouth, fatigue, headache, dizziness, decreased urination. Don't wait for thirst – it already signals mild dehydration.",
    icon: "⚠️",
  },
  {
    title: "Smart hydration tips",
    description: "Start morning with water, carry a bottle, drink before meals, add lemon or mint, eat water‑rich foods (melon, cucumber, oranges).",
    icon: "⏰",
  },
];

export default function HydrationScreen() {
  const router = useRouter();
  const { theme } = useSimpleTheme();
  const colors = Colors[theme];
  const isDark = theme === "dark";

  const [intake, setIntake] = useState(1.9);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const progressAnim = useRef(new Animated.Value(intake / GOAL_LITERS)).current;
  const headerFade = useRef(new Animated.Value(0)).current;
  const heroFade = useRef(new Animated.Value(0)).current;
  const trackerFade = useRef(new Animated.Value(0)).current;
  const trackerSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.timing(headerFade, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(heroFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(trackerFade, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.timing(trackerSlide, { toValue: 0, duration: 450, useNativeDriver: true }),
      ]),
    ]).start();

    const timer = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % QUOTES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const addWater = (amount: number) => {
    const next = Math.min(GOAL_LITERS, intake + amount);
    setIntake(next);
    Animated.spring(progressAnim, {
      toValue: next / GOAL_LITERS,
      useNativeDriver: false,
      tension: 60,
      friction: 8,
    }).start();
  };

  const pct = Math.round((intake / GOAL_LITERS) * 100);
  const remaining = Math.max(0, GOAL_LITERS - intake).toFixed(1);
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const primary = colors.primary;
  const bg = colors.background;
  const cardBg = isDark ? "rgba(15,23,42,0.7)" : "#fff";
  const borderLight = isDark ? "rgba(57,255,20,0.15)" : "rgba(57,255,20,0.1)";
  const textPrimary = colors.text;
  const textSecondary = isDark ? "#888" : "#999";

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Top accent line */}
      <LinearGradient
        colors={[primary, primary + "80"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topLine}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: headerFade }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: cardBg, borderColor: borderLight }]}
          >
            <Ionicons name="arrow-back" size={20} color={primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textPrimary }]}>Hydration</Text>
          <View style={[styles.headerPill, { backgroundColor: primary + "15", borderColor: primary + "30" }]}>
            <Text style={[styles.headerPillText, { color: primary }]}>💧 Daily tracker</Text>
          </View>
        </Animated.View>

        {/* Hero */}
        <Animated.View style={[styles.hero, { opacity: heroFade }]}>
          <View style={[styles.heroIconRing, { borderColor: primary + "60" }]}>
            <LinearGradient
              colors={[primary + "25", primary + "10"]}
              style={styles.heroIconGrad}
            >
              <Text style={styles.heroDropIcon}>💧</Text>
            </LinearGradient>
          </View>
          <Text style={[styles.heroTitle, { color: textPrimary }]}>
            Drink.{"\n"}
            <Text style={{ color: primary }}>Stay alive.</Text>
          </Text>
          <Text style={[styles.heroSub, { color: textSecondary }]}>
            Science‑backed hydration for peak performance
          </Text>
        </Animated.View>

        {/* Tracker Card */}
        <Animated.View
          style={[
            styles.trackerCard,
            {
              opacity: trackerFade,
              transform: [{ translateY: trackerSlide }],
              backgroundColor: cardBg,
              borderColor: borderLight,
            },
          ]}
        >
          <LinearGradient
            colors={[primary + "30", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.trackerTopBar}
          />
          <View style={styles.trackerTop}>
            <View>
              <Text style={[styles.trackerLabel, { color: textSecondary }]}>TODAY'S INTAKE</Text>
              <Text style={[styles.trackerNumber, { color: primary }]}>{intake.toFixed(1)}</Text>
              <Text style={[styles.trackerUnit, { color: textSecondary }]}>liters of {GOAL_LITERS} L goal</Text>
            </View>
            <View style={[styles.onTrackBadge, { backgroundColor: primary + "12", borderColor: primary + "30" }]}>
              <View style={[styles.pulseDot, { backgroundColor: primary }]} />
              <Text style={[styles.onTrackText, { color: primary }]}>On track</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={[styles.progressTrack, { backgroundColor: isDark ? "#111" : "#f0f0f0", borderColor: borderLight }]}>
            <Animated.View style={[styles.progressFill, { width: progressWidth, backgroundColor: primary }]} />
          </View>

          <View style={styles.progressMeta}>
            <Text style={[styles.progressMetaText, { color: textSecondary }]}>{pct}% complete</Text>
            <Text style={[styles.progressMetaText, { color: textSecondary }]}>{remaining} L remaining</Text>
          </View>

          {/* Add buttons */}
          <View style={styles.glassRow}>
            {[
              { label: "+250 ml", emoji: "🥛", amount: 0.25 },
              { label: "+500 ml", emoji: "🫙", amount: 0.5 },
              { label: "+1 L", emoji: "🍶", amount: 1 },
            ].map((btn) => (
              <TouchableOpacity
                key={btn.label}
                onPress={() => addWater(btn.amount)}
                style={[styles.glassBtn, { backgroundColor: primary + "10", borderColor: primary + "30" }]}
                activeOpacity={0.7}
              >
                <Text style={styles.glassBtnEmoji}>{btn.emoji}</Text>
                <Text style={[styles.glassBtnLabel, { color: primary }]}>{btn.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Quote Card */}
        <View style={[styles.quoteCard, { backgroundColor: cardBg, borderColor: borderLight }]}>
          <LinearGradient
            colors={[primary + "08", "transparent"]}
            style={StyleSheet.absoluteFill}
          />
          <Text style={[styles.quoteMark, { color: primary + "20" }]}>"</Text>
          <Text style={[styles.quoteText, { color: textPrimary }]}>{QUOTES[quoteIndex]}</Text>
          <View style={styles.quoteDots}>
            {QUOTES.map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setQuoteIndex(i)}
                style={[styles.qdot, i === quoteIndex ? styles.qdotActive : { backgroundColor: textSecondary + "40" }]}
              />
            ))}
          </View>
        </View>

        {/* Science section title */}
        <Text style={[styles.sectionLabel, { color: textSecondary }]}>⚡ THE SCIENCE</Text>

        {/* Science fact cards – professional, clean */}
        {SCIENCE_FACTS.map((fact, idx) => (
          <View
            key={idx}
            style={[styles.factCard, { backgroundColor: cardBg, borderColor: borderLight }]}
          >
            <View style={[styles.factIconWrap, { backgroundColor: primary + "12" }]}>
              <Text style={styles.factEmoji}>{fact.icon}</Text>
            </View>
            <View style={styles.factContent}>
              <Text style={[styles.factTitle, { color: textPrimary }]}>{fact.title}</Text>
              <Text style={[styles.factBody, { color: textSecondary }]}>{fact.description}</Text>
            </View>
          </View>
        ))}

        {/* Tip strip */}
        <View style={[styles.tipStrip, { backgroundColor: primary + "08", borderColor: primary + "25" }]}>
          <Ionicons name="bulb-outline" size={20} color={primary} />
          <Text style={[styles.tipText, { color: textPrimary }]}>
            Keep a bottle on your desk — you'll drink 30‑50% more without even trying.
          </Text>
        </View>

        <Text style={[styles.footerNote, { color: textSecondary }]}>
          ⓘ Based on general health guidelines. Always listen to your body.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topLine: { height: 3, width: "100%" },
  scrollContent: { paddingBottom: 60 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 58 : 44,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    shadowColor: "#39FF14",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerTitle: { fontSize: 20, fontWeight: "700", letterSpacing: -0.3 },
  headerPill: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerPillText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },

  hero: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  heroIconRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 2,
    marginBottom: 20,
    overflow: "hidden",
  },
  heroIconGrad: { flex: 1, justifyContent: "center", alignItems: "center" },
  heroDropIcon: { fontSize: 38 },
  heroTitle: {
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 40,
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 13.5,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 260,
    fontWeight: "400",
  },

  trackerCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: "hidden",
    shadowColor: "#39FF14",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  trackerTopBar: { height: 3 },
  trackerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    paddingBottom: 14,
  },
  trackerLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 0.9, marginBottom: 2 },
  trackerNumber: { fontSize: 52, fontWeight: "800", lineHeight: 58, letterSpacing: -1 },
  trackerUnit: { fontSize: 13, fontWeight: "400" },
  onTrackBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  pulseDot: { width: 7, height: 7, borderRadius: 4 },
  onTrackText: { fontSize: 11, fontWeight: "700" },

  progressTrack: {
    height: 8,
    borderRadius: 10,
    marginHorizontal: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 10 },
  progressMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 8,
  },
  progressMetaText: { fontSize: 12, fontWeight: "500" },

  glassRow: {
    flexDirection: "row",
    gap: 8,
    padding: 16,
    paddingTop: 14,
  },
  glassBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  glassBtnEmoji: { fontSize: 16 },
  glassBtnLabel: { fontSize: 12, fontWeight: "700" },

  quoteCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    overflow: "hidden",
    shadowColor: "#39FF14",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  quoteMark: {
    position: "absolute",
    top: -12,
    left: 14,
    fontSize: 100,
    fontWeight: "900",
    lineHeight: 100,
    fontFamily: Platform.OS === "ios" ? "Times New Roman" : "serif",
  },
  quoteText: { fontSize: 16, fontWeight: "500", lineHeight: 24, marginBottom: 14, fontStyle: "italic" },
  quoteDots: { flexDirection: "row", gap: 6 },
  qdot: { width: 7, height: 7, borderRadius: 4 },
  qdotActive: { width: 22, borderRadius: 4, backgroundColor: "#39FF14" },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 12,
  },

  factCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  factIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  factEmoji: { fontSize: 22 },
  factContent: { flex: 1 },
  factTitle: { fontSize: 15, fontWeight: "700", marginBottom: 5, letterSpacing: -0.2 },
  factBody: { fontSize: 13, lineHeight: 19, fontWeight: "400" },

  tipStrip: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 20,
    borderRadius: 18,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  tipText: { flex: 1, fontSize: 13, fontWeight: "500", lineHeight: 19 },

  footerNote: {
    textAlign: "center",
    fontSize: 11,
    marginTop: 4,
    paddingHorizontal: 24,
    lineHeight: 16,
  },
});