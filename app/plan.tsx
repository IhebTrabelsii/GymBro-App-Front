
import { Colors } from "@/constants/Colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { useSimpleTheme } from "../context/SimpleThemeContext";

const { width } = Dimensions.get("window");

// Define types for the plan
type WorkoutPlan = {
  _id: string;
  title: string;
  description: string;
  bodyType: 'Ectomorph' | 'Mesomorph' | 'Endomorph';
  focus: string;
  days: string[];
  tips: string;
  icon: string;
  color?: string; // Optional, will be generated
};

export default function PlanScreen() {
  const router = useRouter();
  const { type, plans } = useLocalSearchParams();
  const { theme, toggleTheme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === "dark";
  
  const [loading, setLoading] = useState(true);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Parse plans from params
    if (plans) {
      try {
        const parsedPlans = JSON.parse(plans as string);
        setWorkoutPlans(parsedPlans);
      } catch (error) {
        console.error("Error parsing plans:", error);
        // Fallback to empty array
        setWorkoutPlans([]);
      }
    }
    setLoading(false);

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
  }, [plans]);

  const plan = typeof type === "string" ? type : "";

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

  // Generate color for each plan based on its body type
  const getPlanColor = (plan: WorkoutPlan) => {
    if (plan.bodyType === "Ectomorph") return "#39FF14";
    if (plan.bodyType === "Mesomorph") return "#00F0FF";
    return "#FF10F0";
  };

  // Get icon for each plan
  const getPlanIcon = (plan: WorkoutPlan) => {
    return plan.icon || "fitness";
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: currentColors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentColors.primary} />
          <Text style={[styles.loadingText, { color: currentColors.text }]}>
            Loading plans...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: currentColors.background }]}
    >
      {/* Top Bar */}
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
          {/* Hero Section */}
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
                  {workoutPlans.length} Available Plans
                </Text>
              </View>
            </View>
          </View>

          {/* Plan Cards */}
          {workoutPlans.length === 0 ? (
            <View style={[styles.emptyContainer, { borderColor: getPlanTypeColor(plan) + '30' }]}>
              <MaterialCommunityIcons 
                name="weight-lifter" 
                size={64} 
                color={getPlanTypeColor(plan)} 
              />
              <Text style={[styles.emptyTitle, { color: currentColors.text }]}>
                No Plans Available
              </Text>
              <Text style={[styles.emptyText, { color: isDark ? '#888' : '#666' }]}>
                There are no workout plans for {plan} body type yet.
              </Text>
              <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: getPlanTypeColor(plan) }]}
                onPress={() => router.push("/workout")}
              >
                <Text style={styles.emptyButtonText}>Browse Other Types</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.plansContainer}>
              {workoutPlans.map((planItem, index) => {
                const planColor = getPlanColor(planItem);
                
                return (
                  <View
                    key={planItem._id || index}
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
                          borderColor: planColor + (isDark ? "40" : "30"),
                          shadowColor: planColor,
                        },
                      ]}
                    >
                      {/* Accent Bar */}
                      <View
                        style={[
                          styles.accentBar,
                          { backgroundColor: planColor },
                        ]}
                      />

                      {/* Plan Number Badge */}
                      <View
                        style={[
                          styles.planNumber,
                          {
                            backgroundColor: planColor + (isDark ? "20" : "15"),
                            borderColor: planColor + (isDark ? "40" : "30"),
                          },
                        ]}
                      >
                        <Text
                          style={[styles.planNumberText, { color: planColor }]}
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
                              backgroundColor: planColor + (isDark ? "20" : "10"),
                              borderWidth: 2,
                              borderColor: planColor + (isDark ? "40" : "30"),
                            },
                          ]}
                        >
                          <MaterialCommunityIcons
                            name={getPlanIcon(planItem) as any}
                            size={28}
                            color={planColor}
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
                          { backgroundColor: planColor + (isDark ? "20" : "15") },
                        ]}
                      />

                      {/* Days Section */}
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
                                  { backgroundColor: planColor },
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

                      {/* Tips Section */}
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
                );
              })}
            </View>
          )}

          {/* Info Card */}
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

// Add these new styles to your existing StyleSheet
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

  
   loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginBottom: 24,
    borderWidth: 2,
    borderRadius: 24,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 14,
  },
});

