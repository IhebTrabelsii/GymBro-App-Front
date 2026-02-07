import { Colors } from "@/constants/Colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
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
      },
    ],
  };

  const plans = workoutPlans[plan as keyof typeof workoutPlans] || [];

  return (
    <View
      style={[styles.container, { backgroundColor: currentColors.background }]}
    >
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: isDark ? currentColors.background : "#FFFFFF",
            borderBottomColor: isDark
              ? currentColors.border
              : "rgba(57, 255, 20, 0.15)",
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.replace("/")}
          activeOpacity={0.7}
        >
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons
              name="dumbbell"
              size={28}
              color={currentColors.primary}
            />
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
                backgroundColor: isDark ? currentColors.card : "#F5F5F5",
                borderWidth: 1.5,
                borderColor: currentColors.primary,
              },
            ]}
            activeOpacity={0.8}
          >
            <Ionicons
              name="arrow-back"
              size={18}
              color={currentColors.primary}
            />
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
        {/* Hero Section */}
        <View>
          <View
            style={[
              styles.heroCard,
              {
                backgroundColor: isDark ? currentColors.card : "#FFFFFF",
                borderColor: isDark
                  ? currentColors.primary
                  : "rgba(57, 255, 20, 0.2)",
                shadowColor: isDark ? currentColors.primary : "#000",
              },
            ]}
          >
            <View style={styles.heroContent}>
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: isDark
                      ? "rgba(57, 255, 20, 0.2)"
                      : "rgba(57, 255, 20, 0.1)",
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={
                    plan === "Ectomorph"
                      ? "leaf"
                      : plan === "Mesomorph"
                        ? "arm-flex"
                        : "run"
                  }
                  size={40}
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
                    color: isDark ? currentColors.text : "#666",
                  },
                ]}
              >
                Customized training programs for your body type
              </Text>
            </View>
          </View>
        </View>

        {/* Plan Count Badge */}
        <View>
          <View
            style={[
              styles.countBadge,
              {
                backgroundColor: isDark ? currentColors.card : "#FFFFFF",
                borderColor: isDark
                  ? "rgba(57, 255, 20, 0.3)"
                  : "rgba(57, 255, 20, 0.15)",
              },
            ]}
          >
            <View
              style={[
                styles.badgeIcon,
                {
                  backgroundColor: isDark
                    ? "rgba(57, 255, 20, 0.2)"
                    : "rgba(57, 255, 20, 0.1)",
                },
              ]}
            >
              <Ionicons name="list" size={20} color={currentColors.primary} />
            </View>
            <Text style={[styles.badgeText, { color: currentColors.text }]}>
              {plans.length} Available Plans
            </Text>
          </View>
        </View>

        {/* Plans Grid */}
        <View style={styles.plansContainer}>
          {plans.map((planItem, index) => (
            <View key={index}>
              <View
                style={[
                  styles.planCard,
                  {
                    backgroundColor: isDark ? currentColors.card : "#FFFFFF",
                    borderColor: isDark
                      ? "rgba(57, 255, 20, 0.3)"
                      : "rgba(57, 255, 20, 0.15)",
                    shadowColor: isDark ? currentColors.primary : "#000",
                  },
                ]}
              >
                <View style={styles.planHeader}>
                  <View style={styles.planTitleContainer}>
                    <View
                      style={[
                        styles.planIcon,
                        {
                          backgroundColor: isDark
                            ? "rgba(57, 255, 20, 0.2)"
                            : "rgba(57, 255, 20, 0.1)",
                        },
                      ]}
                    >
                      <Ionicons
                        name="barbell"
                        size={18}
                        color={currentColors.primary}
                      />
                    </View>
                    <Text
                      style={[
                        styles.planTitle,
                        { color: currentColors.primary },
                      ]}
                    >
                      {planItem.title}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.cardDivider,
                    {
                      backgroundColor: isDark
                        ? "rgba(57, 255, 20, 0.2)"
                        : "rgba(57, 255, 20, 0.1)",
                    },
                  ]}
                />

                <View style={styles.focusContainer}>
                  <Ionicons name="flame" size={16} color="#FF6B6B" />
                  <Text
                    style={[
                      styles.planFocus,
                      { color: isDark ? currentColors.text : "#666" },
                    ]}
                  >
                    {planItem.focus}
                  </Text>
                </View>

                <View style={styles.daysContainer}>
                  {planItem.days.map((day, dayIndex) => (
                    <View key={dayIndex} style={styles.dayItem}>
                      <View
                        style={[
                          styles.dayIcon,
                          {
                            backgroundColor: isDark
                              ? "rgba(57, 255, 20, 0.2)"
                              : "rgba(57, 255, 20, 0.1)",
                          },
                        ]}
                      >
                        <Ionicons
                          name="calendar-outline"
                          size={14}
                          color={currentColors.primary}
                        />
                      </View>
                      <Text
                        style={[
                          styles.dayText,
                          {
                            color: isDark ? currentColors.text : "#333",
                          },
                        ]}
                      >
                        {day}
                      </Text>
                    </View>
                  ))}
                </View>

                <View
                  style={[
                    styles.tipsContainer,
                    {
                      backgroundColor: isDark
                        ? "rgba(57, 255, 20, 0.1)"
                        : "rgba(57, 255, 20, 0.05)",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.tipIcon,
                      {
                        backgroundColor: isDark
                          ? "rgba(255, 193, 7, 0.2)"
                          : "rgba(255, 193, 7, 0.1)",
                      },
                    ]}
                  >
                    <Ionicons name="bulb-outline" size={16} color="#FFC107" />
                  </View>
                  <Text
                    style={[
                      styles.tipsText,
                      {
                        color: isDark ? currentColors.text : "#333",
                      },
                    ]}
                  >
                    {planItem.tips}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                {
                  backgroundColor: isDark ? currentColors.card : "#FFFFFF",
                  borderColor: isDark
                    ? "rgba(57, 255, 20, 0.3)"
                    : "rgba(57, 255, 20, 0.2)",
                },
              ]}
              activeOpacity={0.8}
              onPress={() => router.push("/workout")}
            >
              <Ionicons
                name="arrow-back"
                size={20}
                color={currentColors.primary}
              />
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
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Card */}
        <View>
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: isDark ? currentColors.card : "#FFFFFF",
                borderColor: isDark
                  ? currentColors.primary + "40"
                  : "rgba(57, 255, 20, 0.15)",
                shadowColor: isDark ? currentColors.primary : "#000",
              },
            ]}
          >
            <View style={styles.infoHeader}>
              <View
                style={[
                  styles.infoIcon,
                  {
                    backgroundColor: isDark
                      ? "rgba(57, 255, 20, 0.2)"
                      : "rgba(57, 255, 20, 0.1)",
                  },
                ]}
              >
                <Ionicons
                  name="information-circle"
                  size={20}
                  color={currentColors.primary}
                />
              </View>
              <Text style={[styles.infoTitle, { color: currentColors.text }]}>
                Plan Instructions
              </Text>
            </View>

            <View
              style={[
                styles.divider,
                {
                  backgroundColor: isDark
                    ? currentColors.primary + "20"
                    : "rgba(57, 255, 20, 0.1)",
                },
              ]}
            />

            <Text
              style={[
                styles.infoText,
                {
                  color: isDark ? currentColors.text : "#666",
                },
              ]}
            >
              Follow your chosen plan consistently for 6-8 weeks. Track your
              progress, adjust weights as needed, and ensure proper nutrition
              and recovery for best results.
            </Text>
          </View>
        </View>
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logo: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  themeToggle: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 40,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  topRightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  backText: {
    fontWeight: "600",
    fontSize: 14,
  },
  scrollContainer: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 24,
    padding: 28,
    marginBottom: 20,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  heroContent: {
    alignItems: "center",
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: 0.3,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: "500",
    opacity: 0.8,
    textAlign: "center",
  },
  countBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 20,
    alignSelf: "center",
  },
  badgeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  badgeText: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  plansContainer: {
    gap: 16,
    marginBottom: 20,
  },
  planCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  planHeader: {
    marginBottom: 12,
  },
  planTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  planIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  planTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
    flex: 1,
  },
  cardDivider: {
    height: 2,
    borderRadius: 1,
    marginBottom: 14,
  },
  focusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "rgba(255, 107, 107, 0.05)",
  },
  planFocus: {
    fontSize: 14,
    fontWeight: "500",
    fontStyle: "italic",
    flex: 1,
  },
  daysContainer: {
    gap: 12,
    marginBottom: 16,
  },
  dayItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  dayIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
  },
  dayText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
    flex: 1,
  },
  tipsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  tipIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
  },
  tipsText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
    fontStyle: "italic",
    flex: 1,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  infoCard: {
    borderRadius: 20,
    padding: 20,
    marginTop: 8,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  divider: {
    height: 2,
    borderRadius: 1,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
  },
});
