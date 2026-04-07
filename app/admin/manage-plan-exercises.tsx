import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { Colors } from "@/constants/Colors";
import { useSimpleTheme } from "../../context/SimpleThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

const API_BASE_URL = "http://192.168.100.143:3000";

type Plan = {
  _id: string;
  title: string;
  description: string;
  bodyType: string;
  focus: string;
  days: string[];
  tips: string;
  icon: string;
  exercises: Exercise[];
};

type Exercise = {
  _id: string;
  name: string;
  category: string;
  difficulty: string;
  muscleGroups: string[];
};

type PlansResponse = {
  success: boolean;
  plans: Plan[];
  error?: string;
};

type ExercisesResponse = {
  success: boolean;
  exercises: Exercise[];
  error?: string;
};

type UpdateExercisesResponse = {
  success: boolean;
  plan?: Plan;
  error?: string;
};

type RefreshExercisesResponse = {
  success: boolean;
  message: string;
  linkedCount?: number;
  error?: string;
};

type CreatePlanResponse = {
  success: boolean;
  data?: {
    _id: string;
    title: string;
    exercises?: any[];
  };
  message?: string;
  error?: string;
};

export default function AdminPlanExercisesScreen() {
  const router = useRouter();
  const { theme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === "dark";
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newPlanData, setNewPlanData] = useState({
    title: "",
    description: "",
    bodyType: "Ectomorph",
    focus: "",
    days: "",
    tips: "",
    icon: "fitness",
  });
  const [creating, setCreating] = useState(false);
  // Fetch all plans with their exercises
  const fetchPlans = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/admin/plans-with-exercises`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = (await response.json()) as PlansResponse;

      if (response.ok && data.success) {
        setPlans(data.plans);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      Alert.alert("Error", "Failed to load plans");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const refreshPlanExercises = async (planId: string) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(
        `${API_BASE_URL}/api/admin/plans/${planId}/refresh-exercises`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = (await response.json()) as RefreshExercisesResponse;

      if (data.success) {
        Alert.alert("Success", data.message);
        fetchPlans(); // Refresh the list
      } else {
        Alert.alert("Error", data.error || "Failed to refresh exercises");
      }
    } catch (error) {
      console.error("Refresh error:", error);
      Alert.alert("Error", "Could not refresh exercises");
    }
  };

  const createPlan = async () => {
    if (
      !newPlanData.title ||
      !newPlanData.description ||
      !newPlanData.focus ||
      !newPlanData.days ||
      !newPlanData.tips
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    const daysArray = newPlanData.days.split(",").map((d) => d.trim());

    setCreating(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(`${API_BASE_URL}/api/admin/plans`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newPlanData.title,
          description: newPlanData.description,
          bodyType: newPlanData.bodyType,
          focus: newPlanData.focus,
          days: daysArray,
          tips: newPlanData.tips,
          icon: newPlanData.icon,
        }),
      });

      const data = (await response.json()) as CreatePlanResponse;

      if (response.ok && data.success) {
        Alert.alert(
          "Success",
          `Plan "${newPlanData.title}" created with ${data.data?.exercises?.length || 0} exercises auto-linked!`,
        );
        setCreateModalVisible(false);
        fetchPlans();
        fetchAllExercises();
      } else {
        Alert.alert("Error", data.error || "Failed to create plan");
      }
    } catch (error) {
      console.error("Create plan error:", error);
      Alert.alert("Error", "Could not create plan");
    } finally {
      setCreating(false);
    }
  };
  const openCreatePlanModal = () => {
    setNewPlanData({
      title: "",
      description: "",
      bodyType: "Ectomorph",
      focus: "",
      days: "",
      tips: "",
      icon: "fitness",
    });
    setCreateModalVisible(true);
  };
  // Fetch all available exercises
  const fetchAllExercises = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(`${API_BASE_URL}/api/exercises/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await response.json()) as ExercisesResponse;

      if (response.ok && data.success) {
        setAllExercises(data.exercises);
      }
    } catch (error) {
      console.error("Error fetching exercises:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPlans();
      fetchAllExercises();
    }, []),
  );

  const openPlanModal = (plan: Plan) => {
    setSelectedPlan(plan);
    setSelectedExercises(plan.exercises.map((ex) => ex._id));
    setModalVisible(true);
  };

  const toggleExercise = (exerciseId: string) => {
    setSelectedExercises((prev) =>
      prev.includes(exerciseId)
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId],
    );
  };

  const savePlanExercises = async () => {
    if (!selectedPlan) return;

    setSaving(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(
        `${API_BASE_URL}/api/admin/plans/${selectedPlan._id}/exercises`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ exerciseIds: selectedExercises }),
        },
      );

      const data = (await response.json()) as UpdateExercisesResponse;

      if (response.ok && data.success) {
        Alert.alert("Success", `Updated exercises for ${selectedPlan.title}`);
        setModalVisible(false);
        fetchPlans();
      } else {
        Alert.alert("Error", data.error || "Failed to update exercises");
      }
    } catch (error) {
      console.error("Error saving exercises:", error);
      Alert.alert("Error", "Could not save exercises");
    } finally {
      setSaving(false);
    }
  };

  const filteredExercises = allExercises.filter(
    (ex) =>
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getBodyTypeColor = (bodyType: string) => {
    switch (bodyType) {
      case "Ectomorph":
        return "#39FF14";
      case "Mesomorph":
        return "#00F0FF";
      case "Endomorph":
        return "#6c7deb";
      default:
        return currentColors.primary;
    }
  };

  if (loading) {
    return (
      <View
        style={[styles.centered, { backgroundColor: currentColors.background }]}
      >
        <ActivityIndicator size="large" color={currentColors.primary} />
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
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color={currentColors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: currentColors.text }]}>
            Plan Exercises
          </Text>
          <TouchableOpacity
            onPress={openCreatePlanModal}
            style={styles.createBtn}
          >
            <Ionicons name="add" size={24} color={currentColors.primary} />
          </TouchableOpacity>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchPlans();
              fetchAllExercises();
            }}
            tintColor={currentColors.primary}
          />
        }
      >
        {plans.map((plan) => (
          <TouchableOpacity
            key={plan._id}
            style={[
              styles.planCard,
              {
                backgroundColor: isDark ? "#0e0e0e" : "#fff",
                borderColor: getBodyTypeColor(plan.bodyType) + "40",
              },
            ]}
            onPress={() => openPlanModal(plan)}
            activeOpacity={0.85}
          >
            <View style={styles.planCardHeader}>
              <View
                style={[
                  styles.planBadge,
                  { backgroundColor: getBodyTypeColor(plan.bodyType) + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.planBadgeText,
                    { color: getBodyTypeColor(plan.bodyType) },
                  ]}
                >
                  {plan.bodyType}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={currentColors.text}
              />
            </View>
            <Text style={[styles.planTitle, { color: currentColors.text }]}>
              {plan.title}
            </Text>
            <Text
              style={[
                styles.planFocus,
                { color: getBodyTypeColor(plan.bodyType) },
              ]}
            >
              {plan.focus}
            </Text>
            <View style={styles.exerciseCount}>
              <Ionicons
                name="fitness-outline"
                size={14}
                color={currentColors.primary}
              />
              <Text
                style={[
                  styles.exerciseCountText,
                  { color: isDark ? "#aaa" : "#666" },
                ]}
              >
                {plan.exercises.length} exercises
              </Text>
            </View>

            {/* 👇 ADD REFRESH BUTTON HERE */}
            <TouchableOpacity
              onPress={() => refreshPlanExercises(plan._id)}
              style={styles.refreshBtn}
            >
              <Ionicons
                name="refresh"
                size={14}
                color={currentColors.primary}
              />
              <Text
                style={[
                  styles.refreshBtnText,
                  { color: currentColors.primary },
                ]}
              >
                Refresh Exercises
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Modal to manage exercises for a plan */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: isDark ? "#0e0e0e" : "#fff",
                borderColor: currentColors.primary,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: currentColors.text }]}>
                {selectedPlan?.title}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={currentColors.text} />
              </TouchableOpacity>
            </View>

            <Text
              style={[
                styles.modalSubtitle,
                { color: isDark ? "#aaa" : "#666" },
              ]}
            >
              Select exercises to include in this plan
            </Text>

            {/* Search Bar */}
            <View
              style={[
                styles.searchContainer,
                {
                  backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5",
                  borderColor: isDark ? "#333" : "#e0e0e0",
                },
              ]}
            >
              <Ionicons
                name="search"
                size={18}
                color={isDark ? "#666" : "#999"}
              />
              <TextInput
                style={[styles.searchInput, { color: currentColors.text }]}
                placeholder="Search exercises..."
                placeholderTextColor={isDark ? "#666" : "#999"}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <ScrollView style={styles.exercisesList}>
              {filteredExercises.map((exercise) => {
                const isSelected = selectedExercises.includes(exercise._id);
                return (
                  <TouchableOpacity
                    key={exercise._id}
                    style={[
                      styles.exerciseItem,
                      {
                        backgroundColor: isSelected
                          ? currentColors.primary + "15"
                          : isDark
                            ? "#151515"
                            : "#fafafa",
                        borderColor: isSelected
                          ? currentColors.primary
                          : isDark
                            ? "#2a2a2a"
                            : "#e8e8e8",
                      },
                    ]}
                    onPress={() => toggleExercise(exercise._id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.exerciseCheck}>
                      {isSelected ? (
                        <Ionicons
                          name="checkbox"
                          size={22}
                          color={currentColors.primary}
                        />
                      ) : (
                        <Ionicons
                          name="square-outline"
                          size={22}
                          color={isDark ? "#666" : "#ccc"}
                        />
                      )}
                    </View>
                    <View style={styles.exerciseInfo}>
                      <Text
                        style={[
                          styles.exerciseName,
                          { color: currentColors.text },
                        ]}
                      >
                        {exercise.name}
                      </Text>
                      <View style={styles.exerciseTags}>
                        <Text
                          style={[
                            styles.exerciseCategory,
                            { color: currentColors.primary },
                          ]}
                        >
                          {exercise.category}
                        </Text>
                        <Text
                          style={[
                            styles.exerciseDifficulty,
                            { color: isDark ? "#666" : "#aaa" },
                          ]}
                        >
                          {exercise.difficulty}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.modalActions}>
              <Text
                style={[styles.selectedCount, { color: currentColors.primary }]}
              >
                {selectedExercises.length} exercises selected
              </Text>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  {
                    backgroundColor: currentColors.primary,
                    opacity: saving ? 0.7 : 1,
                  },
                ]}
                onPress={savePlanExercises}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? "Saving..." : "Save Changes"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Create Plan Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: isDark ? "#0e0e0e" : "#fff",
                borderColor: currentColors.primary,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: currentColors.text }]}>
                Create New Plan
              </Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <Ionicons name="close" size={24} color={currentColors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: "80%" }}>
              {/* Title */}
              <View style={styles.inputGroup}>
                <Text
                  style={[styles.inputLabel, { color: currentColors.text }]}
                >
                  Plan Title *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5",
                      color: currentColors.text,
                    },
                  ]}
                  placeholder="e.g., Mass Builder (4 Day Split)"
                  placeholderTextColor={isDark ? "#666" : "#999"}
                  value={newPlanData.title}
                  onChangeText={(text) =>
                    setNewPlanData({ ...newPlanData, title: text })
                  }
                />
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <Text
                  style={[styles.inputLabel, { color: currentColors.text }]}
                >
                  Description *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    {
                      backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5",
                      color: currentColors.text,
                    },
                  ]}
                  multiline
                  numberOfLines={3}
                  placeholder="Describe the plan..."
                  placeholderTextColor={isDark ? "#666" : "#999"}
                  value={newPlanData.description}
                  onChangeText={(text) =>
                    setNewPlanData({ ...newPlanData, description: text })
                  }
                />
              </View>

              {/* Body Type */}
              <View style={styles.inputGroup}>
                <Text
                  style={[styles.inputLabel, { color: currentColors.text }]}
                >
                  Body Type *
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {["Ectomorph", "Mesomorph", "Endomorph"].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.optionChip,
                        {
                          backgroundColor:
                            newPlanData.bodyType === type
                              ? currentColors.primary
                              : isDark
                                ? "#1a1a1a"
                                : "#f0f0f0",
                        },
                      ]}
                      onPress={() =>
                        setNewPlanData({ ...newPlanData, bodyType: type })
                      }
                    >
                      <Text
                        style={[
                          styles.optionChipText,
                          {
                            color:
                              newPlanData.bodyType === type
                                ? "#000"
                                : currentColors.text,
                          },
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Focus */}
              <View style={styles.inputGroup}>
                <Text
                  style={[styles.inputLabel, { color: currentColors.text }]}
                >
                  Focus *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5",
                      color: currentColors.text,
                    },
                  ]}
                  placeholder="e.g., Mass Building, Fat Loss, Strength"
                  placeholderTextColor={isDark ? "#666" : "#999"}
                  value={newPlanData.focus}
                  onChangeText={(text) =>
                    setNewPlanData({ ...newPlanData, focus: text })
                  }
                />
              </View>

              {/* Days */}
              <View style={styles.inputGroup}>
                <Text
                  style={[styles.inputLabel, { color: currentColors.text }]}
                >
                  Days (comma separated) *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5",
                      color: currentColors.text,
                    },
                  ]}
                  placeholder="e.g., Monday, Wednesday, Friday"
                  placeholderTextColor={isDark ? "#666" : "#999"}
                  value={newPlanData.days}
                  onChangeText={(text) =>
                    setNewPlanData({ ...newPlanData, days: text })
                  }
                />
              </View>

              {/* Tips */}
              <View style={styles.inputGroup}>
                <Text
                  style={[styles.inputLabel, { color: currentColors.text }]}
                >
                  Tips *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    {
                      backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5",
                      color: currentColors.text,
                    },
                  ]}
                  multiline
                  numberOfLines={3}
                  placeholder="Pro tips for this plan..."
                  placeholderTextColor={isDark ? "#666" : "#999"}
                  value={newPlanData.tips}
                  onChangeText={(text) =>
                    setNewPlanData({ ...newPlanData, tips: text })
                  }
                />
              </View>

              {/* Icon */}
              <View style={styles.inputGroup}>
                <Text
                  style={[styles.inputLabel, { color: currentColors.text }]}
                >
                  Icon
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {[
                    "fitness",
                    "barbell",
                    "run",
                    "flash",
                    "leaf",
                    "arm-flex",
                  ].map((icon) => (
                    <TouchableOpacity
                      key={icon}
                      style={[
                        styles.iconChip,
                        {
                          backgroundColor:
                            newPlanData.icon === icon
                              ? currentColors.primary
                              : isDark
                                ? "#1a1a1a"
                                : "#f0f0f0",
                        },
                      ]}
                      onPress={() =>
                        setNewPlanData({ ...newPlanData, icon: icon })
                      }
                    >
                      <Ionicons
                        name={icon as any}
                        size={20}
                        color={
                          newPlanData.icon === icon
                            ? "#000"
                            : currentColors.text
                        }
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Create Button */}
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  {
                    backgroundColor: currentColors.primary,
                    opacity: creating ? 0.7 : 1,
                    marginTop: 20,
                  },
                ]}
                onPress={createPlan}
                disabled={creating}
              >
                <Text style={styles.saveButtonText}>
                  {creating ? "Creating..." : "Create Plan"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    paddingTop: Platform.OS === "ios" ? 52 : 42,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "800" },

  scrollContent: { padding: 16, paddingBottom: 40 },

  planCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
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
  planCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  planBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  planBadgeText: { fontSize: 11, fontWeight: "700" },
  planTitle: { fontSize: 17, fontWeight: "800", marginBottom: 4 },
  planFocus: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  exerciseCount: { flexDirection: "row", alignItems: "center", gap: 6 },
  exerciseCountText: { fontSize: 12, fontWeight: "500" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "85%",
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: "800" },
  modalSubtitle: { fontSize: 13, marginBottom: 16 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, marginLeft: 8 },
  exercisesList: { maxHeight: 400 },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  exerciseCheck: { marginRight: 12 },
  exerciseInfo: { flex: 1 },
  exerciseName: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  exerciseTags: { flexDirection: "row", gap: 10 },
  exerciseCategory: { fontSize: 11, fontWeight: "700" },
  exerciseDifficulty: { fontSize: 11, fontWeight: "500" },
  modalActions: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedCount: { fontSize: 13, fontWeight: "600" },
  saveButton: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16 },
  saveButtonText: { fontSize: 14, fontWeight: "700", color: "#000" },
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(57,255,20,0.1)",
    marginTop: 12,
    alignSelf: "flex-start",
  },
  refreshBtnText: {
    fontSize: 12,
    fontWeight: "600",
  },
  createBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 4,
  },
  optionChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  iconChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
});
