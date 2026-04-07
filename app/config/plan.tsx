import { Colors } from "@/constants/Colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSimpleTheme } from "../../context/SimpleThemeContext";

const { width } = Dimensions.get("window");

type WorkoutPlan = {
  _id: string;
  title: string;
  description: string;
  bodyType: "Ectomorph" | "Mesomorph" | "Endomorph";
  focus: string;
  days: string[];
  tips: string;
  icon: string;
  color?: string;
};

export default function PlanScreen() {
  const router = useRouter();
  const { type, plans } = useLocalSearchParams();
  const { theme, toggleTheme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === "dark";

  const [loading, setLoading] = useState(true);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const modalScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (plans) {
      try {
        const parsedPlans = JSON.parse(plans as string);
        setWorkoutPlans(parsedPlans);
      } catch (error) {
        console.error("Error parsing plans:", error);
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
    return "#6c7deb";
  };

  const getPlanColor = (plan: WorkoutPlan) => {
    if (plan.bodyType === "Ectomorph") return "#39FF14";
    if (plan.bodyType === "Mesomorph") return "#00F0FF";
    return "#6c7deb";
  };

  const getPlanIcon = (plan: WorkoutPlan) => plan.icon || "fitness";

  const openPlanDetails = (planItem: WorkoutPlan) => {
    setSelectedPlan(planItem);
    setModalVisible(true);
    modalScale.setValue(0.9);
    Animated.spring(modalScale, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalScale, {
      toValue: 0.9,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedPlan(null);
    });
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: currentColors.background },
        ]}
      >
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
      {/* Header */}
      <LinearGradient
        colors={isDark ? ["#0a0a0a", "#000000"] : ["#ffffff", "#f8f9fa"]}
        style={[
          styles.header,
          { borderBottomColor: currentColors.primary + "20" },
        ]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={[
                  currentColors.primary + "30",
                  currentColors.primary + "10",
                ]}
                style={styles.logoIconWrapper}
              >
                <MaterialCommunityIcons
                  name="dumbbell"
                  size={22}
                  color={currentColors.primary}
                />
              </LinearGradient>
              <Text style={[styles.logo, { color: currentColors.primary }]}>
                GymBro
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleTheme}
            style={[
              styles.themeToggle,
              { backgroundColor: currentColors.primary },
            ]}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isDark ? "sunny" : "moon"}
              size={18}
              color={isDark ? "#000" : "#fff"}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          {/* Hero Section */}
          <LinearGradient
            colors={isDark ? ["#0a0a0a", "#050505"] : ["#ffffff", "#fafafa"]}
            style={[
              styles.heroCard,
              { borderColor: currentColors.primary + "30" },
            ]}
          >
            <View
              style={[
                styles.heroGlow1,
                { backgroundColor: currentColors.primary + "08" },
              ]}
            />
            <View
              style={[
                styles.heroGlow2,
                { backgroundColor: currentColors.primary + "05" },
              ]}
            />

            <View style={styles.heroContent}>
              <LinearGradient
                colors={[
                  currentColors.primary + "30",
                  currentColors.primary + "10",
                ]}
                style={styles.heroIcon}
              >
                <MaterialCommunityIcons
                  name={getPlanTypeIcon(plan) as any}
                  size={44}
                  color={currentColors.primary}
                />
              </LinearGradient>
              <Text style={[styles.heroTitle, { color: currentColors.text }]}>
                {plan}{" "}
                <Text style={{ color: currentColors.primary }}>Workout</Text>{" "}
                Plans
              </Text>
              <Text
                style={[
                  styles.heroSubtitle,
                  { color: isDark ? "#aaa" : "#666" },
                ]}
              >
                Customized training programs for your {plan} body type
              </Text>
              <View
                style={[
                  styles.heroBadge,
                  { backgroundColor: currentColors.primary + "12" },
                ]}
              >
                <Ionicons
                  name="fitness"
                  size={14}
                  color={currentColors.primary}
                />
                <Text
                  style={[
                    styles.heroBadgeText,
                    { color: currentColors.primary },
                  ]}
                >
                  {workoutPlans.length} Available Plans
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Plan Cards */}
          {workoutPlans.length === 0 ? (
            <View
              style={[
                styles.emptyContainer,
                { borderColor: currentColors.primary + "30" },
              ]}
            >
              <MaterialCommunityIcons
                name="weight-lifter"
                size={64}
                color={currentColors.primary}
              />
              <Text style={[styles.emptyTitle, { color: currentColors.text }]}>
                No Plans Available
              </Text>
              <Text
                style={[styles.emptyText, { color: isDark ? "#888" : "#666" }]}
              >
                There are no workout plans for {plan} body type yet.
              </Text>
              <TouchableOpacity
                style={[
                  styles.emptyButton,
                  { backgroundColor: currentColors.primary },
                ]}
                onPress={() => router.push("/workout")}
              >
                <Text style={styles.emptyButtonText}>Browse Other Types</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.sectionHeader}>
                <View
                  style={[
                    styles.sectionLine,
                    { backgroundColor: currentColors.primary + "30" },
                  ]}
                />
                <Text
                  style={[styles.sectionTitle, { color: currentColors.text }]}
                >
                  SELECT YOUR PLAN
                </Text>
                <View
                  style={[
                    styles.sectionLine,
                    { backgroundColor: currentColors.primary + "30" },
                  ]}
                />
              </View>

              <View style={styles.plansGrid}>
                {workoutPlans.map((planItem, index) => {
                  const planColor = getPlanColor(planItem);
                  return (
                    <TouchableOpacity
                      key={planItem._id || index}
                      activeOpacity={0.85}
                      onPress={() => openPlanDetails(planItem)}
                    >
                      <LinearGradient
                        colors={
                          isDark
                            ? ["#0e0e0e", "#080808"]
                            : ["#ffffff", "#f8f8f8"]
                        }
                        style={[
                          styles.planCard,
                          { borderColor: planColor + "40" },
                        ]}
                      >
                        <LinearGradient
                          colors={[planColor + "25", "transparent"]}
                          style={styles.planCardAccent}
                        />

                        <View style={styles.planCardHeader}>
                          <LinearGradient
                            colors={[planColor + "25", planColor + "10"]}
                            style={styles.planCardIcon}
                          >
                            <MaterialCommunityIcons
                              name={getPlanIcon(planItem) as any}
                              size={26}
                              color={planColor}
                            />
                          </LinearGradient>
                          <View
                            style={[
                              styles.planCardBadge,
                              { backgroundColor: planColor + "15" },
                            ]}
                          >
                            <Text
                              style={[
                                styles.planCardBadgeText,
                                { color: planColor },
                              ]}
                            >
                              #{index + 1}
                            </Text>
                          </View>
                        </View>

                        <Text
                          style={[
                            styles.planCardTitle,
                            { color: currentColors.text },
                          ]}
                        >
                          {planItem.title}
                        </Text>
                        <Text
                          style={[styles.planCardFocus, { color: planColor }]}
                        >
                          {planItem.focus}
                        </Text>

                        <View style={styles.planCardFooter}>
                          <View style={styles.planCardStat}>
                            <Ionicons
                              name="calendar-outline"
                              size={14}
                              color={currentColors.primary}
                            />
                            <Text
                              style={[
                                styles.planCardStatText,
                                { color: isDark ? "#aaa" : "#666" },
                              ]}
                            >
                              {planItem.days.length} days/week
                            </Text>
                          </View>
                          <Ionicons
                            name="chevron-forward"
                            size={18}
                            color={planColor}
                          />
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {/* View All Exercises Button */}
          {workoutPlans.length > 0 && (
            <TouchableOpacity
              style={[
                styles.viewAllButton,
                { borderColor: currentColors.primary },
              ]}
              onPress={() =>
                router.push({
                  pathname: "/exercise-details",
                  params: { type: "all" },
                })
              }
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[currentColors.primary + "12", "transparent"]}
                style={styles.viewAllGradient}
              />
              <View
                style={[
                  styles.viewAllIcon,
                  { backgroundColor: currentColors.primary + "15" },
                ]}
              >
                <Ionicons
                  name="library"
                  size={22}
                  color={currentColors.primary}
                />
              </View>
              <View style={styles.viewAllTextContainer}>
                <Text
                  style={[styles.viewAllTitle, { color: currentColors.text }]}
                >
                  View All Exercises
                </Text>
                <Text
                  style={[
                    styles.viewAllSubtitle,
                    { color: isDark ? "#aaa" : "#666" },
                  ]}
                >
                  See all exercises from all plans combined
                </Text>
              </View>
              <Ionicons
                name="arrow-forward"
                size={18}
                color={currentColors.primary}
              />
            </TouchableOpacity>
          )}

          {/* Guidelines Section - RESTORED */}
          <View
            style={[
              styles.guidelinesCard,
              { borderColor: currentColors.primary + "25" },
            ]}
          >
            <View style={styles.guidelinesHeader}>
              <LinearGradient
                colors={[
                  currentColors.primary + "20",
                  currentColors.primary + "08",
                ]}
                style={styles.guidelinesIcon}
              >
                <Ionicons
                  name="information-circle"
                  size={22}
                  color={currentColors.primary}
                />
              </LinearGradient>
              <View>
                <Text
                  style={[
                    styles.guidelinesTitle,
                    { color: currentColors.text },
                  ]}
                >
                  Important Guidelines
                </Text>
                <Text
                  style={[
                    styles.guidelinesSubtitle,
                    { color: isDark ? "#777" : "#aaa" },
                  ]}
                >
                  Read before starting
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.divider,
                { backgroundColor: currentColors.primary + "15" },
              ]}
            />
            <View style={styles.guidelinesList}>
              {[
                "Follow your chosen plan consistently for 6-8 weeks",
                "Track your progress and adjust weights progressively",
                "Ensure proper nutrition and recovery for best results",
              ].map((text, i) => (
                <View key={i} style={styles.guidelineItem}>
                  <View
                    style={[
                      styles.guidelineDot,
                      { backgroundColor: currentColors.primary },
                    ]}
                  />
                  <Text
                    style={[
                      styles.guidelineText,
                      { color: isDark ? "#ccc" : "#666" },
                    ]}
                  >
                    {text}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Action Buttons - RESTORED */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                { borderColor: currentColors.primary + "30" },
              ]}
              onPress={() => router.push("/workout")}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.secondaryButtonIcon,
                  { backgroundColor: currentColors.primary + "12" },
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
                { backgroundColor: currentColors.primary },
              ]}
              onPress={() => router.push("/")}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons
                name="home"
                size={20}
                color={isDark ? "#000" : "#fff"}
              />
              <Text
                style={[
                  styles.primaryButtonText,
                  { color: isDark ? "#000" : "#fff" },
                ]}
              >
                Back to Home
              </Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={isDark ? "#000" : "#fff"}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Plan Details Modal - Button at Top */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeModal}>
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <Animated.View style={[styles.modalContent, { transform: [{ scale: modalScale }], backgroundColor: isDark ? "#0e0e0e" : "#fff" }]}>
            {selectedPlan && (
              <>
                {/* Modal Header with Action Buttons at Top */}
                <LinearGradient colors={[getPlanColor(selectedPlan) + "20", "transparent"]} style={styles.modalHeader}>
                  {/* Left: Close Button */}
                  <TouchableOpacity onPress={closeModal} style={styles.modalCloseBtn}>
                    <Ionicons name="close" size={22} color={currentColors.text} />
                  </TouchableOpacity>
                  
                  {/* Right: View Exercises Button */}
                  <TouchableOpacity
                    style={[styles.modalActionBtn, { backgroundColor: getPlanColor(selectedPlan) }]}
                    onPress={() => {
                      closeModal();
                      router.push({ pathname: "/exercise-details", params: { type: selectedPlan.title } });
                    }}
                  >
                    <Ionicons name="play-circle" size={16} color="#000" />
                    <Text style={styles.modalActionBtnText}>View Exercises</Text>
                  </TouchableOpacity>
                  
                  {/* Center Content */}
                  <LinearGradient colors={[getPlanColor(selectedPlan) + "25", getPlanColor(selectedPlan) + "08"]} style={styles.modalIcon}>
                    <MaterialCommunityIcons name={getPlanIcon(selectedPlan) as any} size={32} color={getPlanColor(selectedPlan)} />
                  </LinearGradient>
                  <Text style={[styles.modalTitle, { color: currentColors.text }]}>{selectedPlan.title}</Text>
                  <View style={[styles.modalFocusBadge, { backgroundColor: getPlanColor(selectedPlan) + "15" }]}>
                    <Text style={[styles.modalFocusText, { color: getPlanColor(selectedPlan) }]}>{selectedPlan.focus}</Text>
                  </View>
                </LinearGradient>

                {/* Scrollable Modal Body */}
                <ScrollView 
                  showsVerticalScrollIndicator={true} 
                  style={styles.modalScrollView}
                  contentContainerStyle={styles.modalScrollContent}
                >
                  {/* Description */}
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalSectionTitle, { color: currentColors.text }]}>About this plan</Text>
                    <Text style={[styles.modalDescription, { color: isDark ? "#ccc" : "#666" }]}>{selectedPlan.description}</Text>
                  </View>

                  {/* Weekly Schedule */}
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalSectionTitle, { color: currentColors.text }]}>Weekly Schedule</Text>
                    <View style={styles.scheduleList}>
                      {selectedPlan.days.map((day, idx) => (
                        <View key={idx} style={[styles.scheduleItem, { borderBottomColor: currentColors.primary + "15" }]}>
                          <View style={[styles.scheduleDot, { backgroundColor: getPlanColor(selectedPlan) }]} />
                          <Text style={[styles.scheduleText, { color: currentColors.text }]}>{day}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Pro Tips */}
                  <View style={[styles.modalSection, styles.tipsSection, { backgroundColor: getPlanColor(selectedPlan) + "08", borderColor: getPlanColor(selectedPlan) + "20" }]}>
                    <View style={styles.tipsHeader}>
                      <Ionicons name="bulb" size={20} color="#FFC107" />
                      <Text style={[styles.tipsTitle, { color: currentColors.text }]}>Pro Tips</Text>
                    </View>
                    <Text style={[styles.tipsText, { color: isDark ? "#ccc" : "#666" }]}>{selectedPlan.tips}</Text>
                  </View>
                </ScrollView>
              </>
            )}
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, fontSize: 16, fontWeight: "600" },

  header: {
    paddingTop: Platform.OS === "ios" ? 52 : 42,
    paddingBottom: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoContainer: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: { fontSize: 22, fontWeight: "800", letterSpacing: 0.5 },
  themeToggle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },

  scrollContent: { paddingHorizontal: 18, paddingBottom: 40, paddingTop: 16 },

  heroCard: {
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1.5,
    position: "relative",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: { elevation: 6 },
    }),
  },
  heroGlow1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -60,
    right: -60,
  },
  heroGlow2: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    bottom: -50,
    left: -50,
  },
  heroContent: { alignItems: "center" },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 16,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
  },
  heroBadgeText: { fontSize: 12, fontWeight: "700" },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    gap: 12,
  },
  sectionLine: { flex: 1, height: 1.5 },
  sectionTitle: { fontSize: 13, fontWeight: "700", letterSpacing: 1 },

  plansGrid: { gap: 14, marginBottom: 20 },
  planCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    position: "relative",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  planCardAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  planCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  planCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  planCardBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  planCardBadgeText: { fontSize: 11, fontWeight: "700" },
  planCardTitle: { fontSize: 17, fontWeight: "800", marginBottom: 4 },
  planCardFocus: { fontSize: 12, fontWeight: "600", marginBottom: 12 },
  planCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  planCardStat: { flexDirection: "row", alignItems: "center", gap: 5 },
  planCardStatText: { fontSize: 12, fontWeight: "500" },

  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    gap: 12,
    marginBottom: 24,
    position: "relative",
    overflow: "hidden",
  },
  viewAllGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  viewAllIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  viewAllTextContainer: { flex: 1 },
  viewAllTitle: { fontSize: 14, fontWeight: "800", marginBottom: 2 },
  viewAllSubtitle: { fontSize: 11, fontWeight: "500" },

  guidelinesCard: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1.5,
  },
  guidelinesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
  },
  guidelinesIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  guidelinesTitle: { fontSize: 16, fontWeight: "800" },
  guidelinesSubtitle: { fontSize: 11, fontWeight: "500", marginTop: 2 },
  divider: { height: 1, marginBottom: 16 },
  guidelinesList: { gap: 12 },
  guidelineItem: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  guidelineDot: { width: 7, height: 7, borderRadius: 3.5, marginTop: 6 },
  guidelineText: { fontSize: 13, lineHeight: 20, fontWeight: "500", flex: 1 },

  actionButtons: { gap: 12, marginBottom: 8 },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    gap: 10,
  },
  secondaryButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: { fontSize: 14, fontWeight: "700" },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 20,
    gap: 10,
  },
  primaryButtonText: { fontSize: 15, fontWeight: "800" },

  emptyContainer: {
    alignItems: "center",
    padding: 40,
    marginBottom: 24,
    borderWidth: 2,
    borderRadius: 24,
    borderStyle: "dashed",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyButton: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  emptyButtonText: { color: "#000", fontWeight: "700", fontSize: 14 },

    // Modal Styles - Button at Top
  modalOverlay: { 
    flex: 1, 
    backgroundColor: "rgba(0,0,0,0.85)", 
    justifyContent: "center", 
    alignItems: "center" 
  },
  modalContent: { 
    width: width - 32, 
    maxHeight: "85%", 
    borderRadius: 28, 
    overflow: "hidden",
  },
  modalHeader: { 
    alignItems: "center", 
    paddingTop: 20, 
    paddingBottom: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: "rgba(0,0,0,0.05)",
    position: "relative",
  },
  modalCloseBtn: { 
    position: "absolute", 
    top: 16, 
    left: 16, 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "rgba(0,0,0,0.05)",
    zIndex: 10,
  },
  modalActionBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  modalActionBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#000",
  },
  modalIcon: { 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 12,
    marginTop: 8,
  },
  modalTitle: { 
    fontSize: 22, 
    fontWeight: "800", 
    marginBottom: 6, 
    textAlign: "center" 
  },
  modalFocusBadge: { 
    paddingHorizontal: 14, 
    paddingVertical: 5, 
    borderRadius: 14 
  },
  modalFocusText: { 
    fontSize: 12, 
    fontWeight: "700" 
  },
  modalScrollView: { 
    maxHeight: "70%" 
  },
  modalScrollContent: { 
    padding: 20,
    paddingBottom: 30,
  },
  modalSection: { 
    marginBottom: 20 
  },
  modalSectionTitle: { 
    fontSize: 15, 
    fontWeight: "700", 
    marginBottom: 10, 
    letterSpacing: 0.3 
  },
  modalDescription: { 
    fontSize: 14, 
    lineHeight: 21, 
    fontWeight: "500" 
  },
  scheduleList: { 
    gap: 10 
  },
  scheduleItem: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 12, 
    paddingBottom: 8, 
    borderBottomWidth: 1 
  },
  scheduleDot: { 
    width: 7, 
    height: 7, 
    borderRadius: 3.5 
  },
  scheduleText: { 
    fontSize: 14, 
    fontWeight: "500" 
  },
  tipsSection: { 
    padding: 14, 
    borderRadius: 16, 
    borderWidth: 1.5, 
    marginBottom: 20 
  },
  tipsHeader: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 8, 
    marginBottom: 8 
  },
  tipsTitle: { 
    fontSize: 13, 
    fontWeight: "700" 
  },
  tipsText: { 
    fontSize: 13, 
    lineHeight: 19, 
    fontWeight: "500" 
  },
});
