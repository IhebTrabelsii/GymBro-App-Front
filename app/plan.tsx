import { Colors } from "@/constants/Colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSimpleTheme } from "../context/SimpleThemeContext";

const { width } = Dimensions.get("window");

export default function PlanScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams();
  const { theme, toggleTheme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === "dark";

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const plan = typeof type === "string" ? type : "";

  const workoutPlans = {
    Ectomorph: [
      {
        title: "Mass Builder (4 Day Split)",
        focus: "Heavy weights, low reps, high calories",
        days: [
          "Monday: Chest/Back - Bench Press 4x6, Pull-ups 4x8, Incline Press 3x8, Rows 3x10",
          "Tuesday: Legs - Squats 4x6, Deadlifts 3x5, Leg Press 3x10, Calf Raises 4x15",
          "Wednesday: Rest + 500 extra calories",
          "Thursday: Shoulders/Arms - Military Press 4x8, Lateral Raises 3x12, Tricep Dips 4x10, Curls 3x12",
          "Friday: Full Body - Clean & Press 4x6, Kettlebell Swings 3x15, Pull-ups 3xMax, Push-ups 3x20",
          "Weekend: Rest + High Carb Meals",
        ],
        tips: "Eat every 3 hours, focus on compound lifts, minimum 8 hours sleep",
        color: "#39FF14",
        icon: "leaf",
      },
      {
        title: "Strength & Power (3 Day)",
        focus: "Powerlifting focus, strength gains",
        days: [
          "Monday: Power Day - Squats 5x5, Bench Press 5x5, Power Cleans 4x3",
          "Wednesday: Volume Day - Deadlifts 3x8, Overhead Press 4x6, Weighted Pull-ups 3x5",
          "Friday: Accessory Day - Front Squats 3x8, Incline Bench 3x10, Rows 4x8, Arms 3x12",
          "Rest Days: Active recovery, mobility work",
        ],
        tips: "Heavy weights, long rest periods (3-5 min), progressive overload weekly",
        color: "#00D9FF",
        icon: "barbell",
      },
    ],

    Mesomorph: [
      {
        title: "Push/Pull/Legs (6 Day Split)",
        focus: "Balanced muscle growth and definition",
        days: [
          "Monday: Push - Bench Press 4x10, Shoulder Press 3x12, Tricep Extensions 3x15",
          "Tuesday: Pull - Deadlifts 4x8, Pull-ups 4x10, Rows 3x12, Curls 3x15",
          "Wednesday: Legs - Squats 4x10, Lunges 3x12, Leg Curls 4x15, Calf Raises 5x20",
          "Thursday: Push - Incline Press 4x10, Dips 3x15, Lateral Raises 4x12",
          "Friday: Pull - Barbell Rows 4x10, Lat Pulldowns 3x12, Face Pulls 4x15",
          "Saturday: Legs - Front Squats 4x8, Romanian DL 3x10, Leg Press 4x12",
          "Sunday: Active Recovery",
        ],
        tips: "45-60 min sessions, moderate cardio 3x week, balanced macros",
        color: "#39FF14",
        icon: "fitness",
      },
      {
        title: "Upper/Lower Split (4 Day)",
        focus: "Strength & hypertrophy balance",
        days: [
          "Monday: Upper Strength - Bench 5x5, Rows 5x5, Shoulder Press 4x8",
          "Tuesday: Lower Strength - Squats 5x5, Deadlifts 3x5, Leg Press 4x10",
          "Thursday: Upper Hypertrophy - Incline DB Press 4x10, Pull-ups 4x12, Arms 3x15",
          "Friday: Lower Hypertrophy - Hack Squats 4x12, Lunges 3x10, Hamstring Curls 4x15",
          "Off Days: 30 min cardio or sports",
        ],
        tips: "Alternate heavy/light weeks, track progress, 1.6g protein/kg bodyweight",
        color: "#FF10F0",
        icon: "arm-flex",
      },
    ],

    Endomorph: [
      {
        title: "Fat Loss Circuit (5 Day)",
        focus: "High intensity, metabolic conditioning",
        days: [
          "Monday: Full Body Circuit - 45 sec work/15 rest: Squats, Push-ups, Rows, Plank, Jumping Jacks x 4 rounds",
          "Tuesday: HIIT Cardio - 20 min: 30 sec sprint/90 sec walk x 10 rounds",
          "Wednesday: Strength Circuit - 3 rounds: Deadlifts 10x, Overhead Press 10x, Lunges 10x each",
          "Thursday: Active Recovery - 45 min brisk walk, stretching",
          "Friday: Metabolic Conditioning - AMRAP 20 min: 5 Burpees, 10 KB Swings, 15 Air Squats",
          "Weekend: 1 hour low intensity cardio",
        ],
        tips: "Keep rest short (30-60 sec), focus on compound movements, intermittent fasting",
        color: "#FF10F0",
        icon: "run-fast",
      },
      {
        title: "Strength & Conditioning (3 Day)",
        focus: "Build muscle while burning fat",
        days: [
          "Monday: Heavy Day - Squats 4x8, Bench Press 4x8, Rows 4x8 (2 min rest)",
          "Wednesday: Conditioning - 10 min warm-up, 20 min EMOM: 1) 10 KB Swings 2) 10 Push-ups 3) 10 Air Squats",
          "Friday: Full Body - Deadlifts 3x6, Shoulder Press 3x10, Pull-ups 3xMax, 15 min HIIT after",
          "Other Days: 45 min steady cardio, core work",
        ],
        tips: "Lift heavy but keep workouts under 60 min, prioritize protein, limit processed carbs",
        color: "#00D9FF",
        icon: "flash",
      },
    ],
  };

  const plans = workoutPlans[plan as keyof typeof workoutPlans] || [];

  const getPlanTypeIcon = (planName: string) => {
    if (planName === "Ectomorph") return "leaf";
    if (planName === "Mesomorph") return "arm-flex";
    return "run";
  };

  const getPlanTypeColor = (planName: string) => {
    if (planName === "Ectomorph") return "#39FF14";
    if (planName === "Mesomorph") return "#00F0FF";
    return "#FF10F0";
  };

  return (
    <View
      style={[styles.container, { backgroundColor: currentColors.background }]}
    >
      {/* Enhanced Top Bar */}
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
        <TouchableOpacity
          onPress={() => router.replace("/")}
          activeOpacity={0.7}
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
                size={24}
                color={currentColors.primary}
              />
            </View>
            <Text style={[styles.logo, { color: currentColors.primary }]}>
              GymBro
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.topRightSection}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[
              styles.backButton,
              {
                backgroundColor: isDark
                  ? "rgba(57, 255, 20, 0.12)"
                  : "rgba(57, 255, 20, 0.06)",
                borderWidth: 1.5,
                borderColor: isDark
                  ? "rgba(57, 255, 20, 0.3)"
                  : "rgba(57, 255, 20, 0.25)",
              },
            ]}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={18} color={currentColors.primary} />
            <Text style={[styles.backText, { color: currentColors.primary }]}>
              Back
            </Text>
          </TouchableOpacity>
        </View>

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
            size={20}
            color={isDark ? currentColors.background : "#FFFFFF"}
          />
        </TouchableOpacity>
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
          {/* Enhanced Hero Section with Gradient Effect */}
          <View
            style={[
              styles.heroCard,
              {
                backgroundColor: isDark ? currentColors.card : "#FFFFFF",
                borderColor: isDark
                  ? "rgba(57, 255, 20, 0.2)"
                  : "rgba(57, 255, 20, 0.15)",
                shadowColor: currentColors.primary,
              },
            ]}
          >
            {/* Decorative Circles */}
            <View
              style={[
                styles.decorCircle,
                styles.decorCircle1,
                {
                  backgroundColor: isDark
                    ? "rgba(57, 255, 20, 0.04)"
                    : "rgba(57, 255, 20, 0.025)",
                },
              ]}
            />
            <View
              style={[
                styles.decorCircle,
                styles.decorCircle2,
                {
                  backgroundColor: isDark
                    ? getPlanTypeColor(plan) + "10"
                    : getPlanTypeColor(plan) + "08",
                },
              ]}
            />

            <View style={styles.heroContent}>
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: isDark
                      ? "rgba(57, 255, 20, 0.15)"
                      : "rgba(57, 255, 20, 0.08)",
                    borderWidth: 3,
                    borderColor: isDark
                      ? "rgba(57, 255, 20, 0.25)"
                      : "rgba(57, 255, 20, 0.15)",
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={getPlanTypeIcon(plan) as any}
                  size={46}
                  color={currentColors.primary}
                />
              </View>
              <Text style={[styles.heroTitle, { color: currentColors.text }]}>
                {plan} Workout Plans
              </Text>
              <Text
                style={[
                  styles.heroSubtitle,
                  {
                    color: isDark
                      ? "rgba(255, 255, 255, 0.65)"
                      : "rgba(0, 0, 0, 0.6)",
                  },
                ]}
              >
                Customized training programs for your body type
              </Text>
              <View
                style={[
                  styles.heroBadge,
                  {
                    backgroundColor: isDark
                      ? "rgba(57, 255, 20, 0.12)"
                      : "rgba(57, 255, 20, 0.08)",
                  },
                ]}
              >
                <Ionicons name="calendar" size={14} color={currentColors.primary} />
                <Text
                  style={[styles.heroBadgeText, { color: currentColors.primary }]}
                >
                  {plans.length} Available Plans
                </Text>
              </View>
            </View>
          </View>

          {/* Creative Plan Cards with Staggered Layout */}
          <View style={styles.plansContainer}>
            {plans.map((planItem, index) => (
              <View
                key={index}
                style={[
                  styles.planCardWrapper,
                  {
                    marginLeft: index % 2 === 0 ? 0 : 16,
                    marginRight: index % 2 === 0 ? 16 : 0,
                  },
                ]}
              >
                <View
                  style={[
                    styles.planCard,
                    {
                      backgroundColor: isDark ? currentColors.card : "#FFFFFF",
                      borderColor: planItem.color + (isDark ? "40" : "30"),
                      shadowColor: planItem.color,
                    },
                  ]}
                >
                  {/* Accent Bar on Side */}
                  <View
                    style={[
                      styles.accentBar,
                      { backgroundColor: planItem.color },
                    ]}
                  />

                  {/* Plan Number Badge */}
                  <View
                    style={[
                      styles.planNumber,
                      {
                        backgroundColor: planItem.color + (isDark ? "20" : "15"),
                        borderColor: planItem.color + (isDark ? "40" : "30"),
                      },
                    ]}
                  >
                    <Text
                      style={[styles.planNumberText, { color: planItem.color }]}
                    >
                      #{index + 1}
                    </Text>
                  </View>

                  {/* Plan Header */}
                  <View style={styles.planHeader}>
                    <View
                      style={[
                        styles.planIconLarge,
                        {
                          backgroundColor: planItem.color + (isDark ? "20" : "10"),
                          borderWidth: 2,
                          borderColor: planItem.color + (isDark ? "40" : "30"),
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={planItem.icon as any}
                        size={28}
                        color={planItem.color}
                      />
                    </View>
                    <View style={styles.planTitleContainer}>
                      <Text
                        style={[styles.planTitle, { color: currentColors.text }]}
                      >
                        {planItem.title}
                      </Text>
                      <View
                        style={[
                          styles.focusBadge,
                          {
                            backgroundColor: isDark
                              ? "rgba(255, 107, 107, 0.15)"
                              : "rgba(255, 107, 107, 0.08)",
                          },
                        ]}
                      >
                        <Ionicons name="flame" size={12} color="#FF6B6B" />
                        <Text
                          style={[
                            styles.planFocus,
                            {
                              color: isDark
                                ? "rgba(255, 255, 255, 0.8)"
                                : "rgba(0, 0, 0, 0.7)",
                            },
                          ]}
                        >
                          {planItem.focus}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Divider */}
                  <View
                    style={[
                      styles.cardDivider,
                      { backgroundColor: planItem.color + (isDark ? "20" : "15") },
                    ]}
                  />

                  {/* Days Section with Enhanced Design */}
                  <View style={styles.daysSection}>
                    <View style={styles.daysSectionHeader}>
                      <Ionicons
                        name="calendar-outline"
                        size={16}
                        color={currentColors.primary}
                      />
                      <Text
                        style={[
                          styles.daysSectionTitle,
                          { color: currentColors.text },
                        ]}
                      >
                        Training Schedule
                      </Text>
                      <View
                        style={[
                          styles.daysCount,
                          {
                            backgroundColor: isDark
                              ? "rgba(57, 255, 20, 0.15)"
                              : "rgba(57, 255, 20, 0.1)",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.daysCountText,
                            { color: currentColors.primary },
                          ]}
                        >
                          {planItem.days.length}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.daysContainer}>
                      {planItem.days.map((day, dayIndex) => (
                        <View key={dayIndex} style={styles.dayItem}>
                          <View
                            style={[
                              styles.dayDot,
                              { backgroundColor: planItem.color },
                            ]}
                          />
                          <View style={styles.dayContent}>
                            <Text
                              style={[
                                styles.dayText,
                                {
                                  color: isDark
                                    ? "rgba(255, 255, 255, 0.9)"
                                    : "rgba(0, 0, 0, 0.8)",
                                },
                              ]}
                            >
                              {day}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Tips Section with Enhanced Design */}
                  <View
                    style={[
                      styles.tipsContainer,
                      {
                        backgroundColor: isDark
                          ? "rgba(255, 193, 7, 0.1)"
                          : "rgba(255, 193, 7, 0.05)",
                        borderColor: isDark
                          ? "rgba(255, 193, 7, 0.25)"
                          : "rgba(255, 193, 7, 0.15)",
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.tipIconWrapper,
                        {
                          backgroundColor: isDark
                            ? "rgba(255, 193, 7, 0.2)"
                            : "rgba(255, 193, 7, 0.15)",
                        },
                      ]}
                    >
                      <Ionicons name="bulb" size={18} color="#FFC107" />
                    </View>
                    <View style={styles.tipsContent}>
                      <Text
                        style={[
                          styles.tipsLabel,
                          {
                            color: isDark
                              ? "rgba(255, 193, 7, 0.9)"
                              : "rgba(255, 193, 7, 0.8)",
                          },
                        ]}
                      >
                        Pro Tips
                      </Text>
                      <Text
                        style={[
                          styles.tipsText,
                          {
                            color: isDark
                              ? "rgba(255, 255, 255, 0.8)"
                              : "rgba(0, 0, 0, 0.7)",
                          },
                        ]}
                      >
                        {planItem.tips}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Enhanced Info Card */}
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: isDark ? currentColors.card : "#FFFFFF",
                borderColor: isDark
                  ? "rgba(57, 255, 20, 0.2)"
                  : "rgba(57, 255, 20, 0.12)",
                shadowColor: currentColors.primary,
              },
            ]}
          >
            <View style={styles.infoHeader}>
              <View
                style={[
                  styles.infoIconWrapper,
                  {
                    backgroundColor: isDark
                      ? "rgba(57, 255, 20, 0.15)"
                      : "rgba(57, 255, 20, 0.08)",
                    borderWidth: 2,
                    borderColor: isDark
                      ? "rgba(57, 255, 20, 0.25)"
                      : "rgba(57, 255, 20, 0.15)",
                  },
                ]}
              >
                <Ionicons
                  name="information-circle"
                  size={22}
                  color={currentColors.primary}
                />
              </View>
              <View style={styles.infoHeaderText}>
                <Text style={[styles.infoTitle, { color: currentColors.text }]}>
                  Important Guidelines
                </Text>
                <Text
                  style={[
                    styles.infoSubtitle,
                    {
                      color: isDark
                        ? "rgba(255, 255, 255, 0.5)"
                        : "rgba(0, 0, 0, 0.45)",
                    },
                  ]}
                >
                  Read before starting
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.divider,
                {
                  backgroundColor: isDark
                    ? "rgba(57, 255, 20, 0.15)"
                    : "rgba(57, 255, 20, 0.08)",
                },
              ]}
            />

            <View style={styles.guidelinesList}>
              <View style={styles.guidelineItem}>
                <View
                  style={[
                    styles.guidelineDot,
                    { backgroundColor: currentColors.primary },
                  ]}
                />
                <Text
                  style={[
                    styles.infoText,
                    {
                      color: isDark
                        ? "rgba(255, 255, 255, 0.8)"
                        : "rgba(0, 0, 0, 0.7)",
                    },
                  ]}
                >
                  Follow your chosen plan consistently for 6-8 weeks
                </Text>
              </View>
              <View style={styles.guidelineItem}>
                <View
                  style={[
                    styles.guidelineDot,
                    { backgroundColor: currentColors.primary },
                  ]}
                />
                <Text
                  style={[
                    styles.infoText,
                    {
                      color: isDark
                        ? "rgba(255, 255, 255, 0.8)"
                        : "rgba(0, 0, 0, 0.7)",
                    },
                  ]}
                >
                  Track your progress and adjust weights progressively
                </Text>
              </View>
              <View style={styles.guidelineItem}>
                <View
                  style={[
                    styles.guidelineDot,
                    { backgroundColor: currentColors.primary },
                  ]}
                />
                <Text
                  style={[
                    styles.infoText,
                    {
                      color: isDark
                        ? "rgba(255, 255, 255, 0.8)"
                        : "rgba(0, 0, 0, 0.7)",
                    },
                  ]}
                >
                  Ensure proper nutrition and recovery for best results
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                {
                  backgroundColor: isDark ? currentColors.card : "#FFFFFF",
                  borderColor: isDark
                    ? "rgba(57, 255, 20, 0.25)"
                    : "rgba(57, 255, 20, 0.2)",
                },
              ]}
              activeOpacity={0.8}
              onPress={() => router.push("/workout")}
            >
              <View
                style={[
                  styles.secondaryButtonIcon,
                  {
                    backgroundColor: isDark
                      ? "rgba(57, 255, 20, 0.12)"
                      : "rgba(57, 255, 20, 0.08)",
                  },
                ]}
              >
                <Ionicons
                  name="arrow-back"
                  size={18}
                  color={currentColors.primary}
                />
              </View>
              <Text
                style={[
                  styles.secondaryButtonText,
                  { color: currentColors.text },
                ]}
              >
                Choose Different Body Type
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                {
                  backgroundColor: currentColors.primary,
                  shadowColor: currentColors.primary,
                },
              ]}
              activeOpacity={0.85}
              onPress={() => router.push("/")}
            >
              <MaterialCommunityIcons
                name="home"
                size={24}
                color={isDark ? currentColors.background : "#FFFFFF"}
              />
              <Text
                style={[
                  styles.primaryButtonText,
                  {
                    color: isDark ? currentColors.background : "#FFFFFF",
                  },
                ]}
              >
                Back to Home
              </Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={isDark ? currentColors.background : "#FFFFFF"}
              />
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 18,
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
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  themeToggle: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
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
  topRightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginRight: 52,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backText: {
    fontWeight: "700",
    fontSize: 14,
  },
  scrollContainer: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 28,
    padding: 36,
    marginBottom: 24,
    borderWidth: 1.5,
    position: "relative",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
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
    textAlign: "center",
    marginBottom: 18,
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
  plansContainer: {
    gap: 20,
    marginBottom: 24,
  },
  planCardWrapper: {
    position: "relative",
  },
  planCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    position: "relative",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
  },
  planNumber: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  planNumberText: {
    fontSize: 15,
    fontWeight: "800",
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 18,
  },
  planIconLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  planTitleContainer: {
    flex: 1,
    paddingRight: 40,
  },
  planTitle: {
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: 0.3,
    marginBottom: 8,
    lineHeight: 26,
  },
  focusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  planFocus: {
    fontSize: 12,
    fontWeight: "600",
    fontStyle: "italic",
  },
  cardDivider: {
    height: 2,
    borderRadius: 1,
    marginBottom: 20,
  },
  daysSection: {
    marginBottom: 18,
  },
  daysSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  daysSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
    flex: 1,
  },
  daysCount: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  daysCountText: {
    fontSize: 12,
    fontWeight: "800",
  },
  daysContainer: {
    gap: 14,
  },
  dayItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  dayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  dayContent: {
    flex: 1,
  },
  dayText: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "500",
  },
  tipsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 14,
    gap: 12,
    borderWidth: 1.5,
  },
  tipIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  tipsContent: {
    flex: 1,
  },
  tipsLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  tipsText: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "500",
  },
  infoCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  infoIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  infoHeaderText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  infoSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 3,
  },
  divider: {
    height: 1.5,
    borderRadius: 1,
    marginBottom: 20,
  },
  guidelinesList: {
    gap: 14,
  },
  guidelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  guidelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 7,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
    flex: 1,
  },
  actionButtons: {
    gap: 12,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 20,
    gap: 12,
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
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  secondaryButton: {
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
  secondaryButtonIcon: {
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
});