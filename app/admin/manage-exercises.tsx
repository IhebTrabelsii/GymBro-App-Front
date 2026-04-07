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

type Exercise = {
  _id: string;
  name: string;
  category: string;
  subCategory: string;
  difficulty: string;
  muscleGroups: string[];
  primaryMuscle: string;
  equipment: string[];
  sets: number;
  reps: string;
  rest: string;
  description: string;
  tips: string[];
  videoUrl: string;
};

type CategoryStat = {
  _id: string;
  count: number;
};

type ExercisesResponse = {
  success: boolean;
  exercises: Exercise[];
  error?: string;
};

type StatsResponse = {
  success: boolean;
  stats: Array<{ _id: string; count: number }>;
  error?: string;
};

type SaveExerciseResponse = {
  success: boolean;
  exercise?: Exercise;
  error?: string;
};

type DeleteExerciseResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

const categories = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio", "HIIT", "Full Body"];
const subCategories = ["Compound", "Isolation", "Accessory", "Cardio", "HIIT", "Plyometrics"];
const difficultyLevels = ["Beginner", "Intermediate", "Advanced"];
const muscleGroupOptions = [
  "Chest", "Upper Chest", "Triceps", "Back", "Lats", "Traps", "Biceps", 
  "Shoulders", "Front Delts", "Side Delts", "Rear Delts", "Quads", 
  "Hamstrings", "Glutes", "Calves", "Core", "Abs", "Obliques", "Forearms"
];

export default function AdminExercisesScreen() {
  const router = useRouter();
  const { theme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === "dark";

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "Chest",
    subCategory: "Compound",
    difficulty: "Intermediate",
    muscleGroups: [] as string[],
    primaryMuscle: "",
    equipment: [] as string[],
    sets: 3,
    reps: "10-12",
    rest: "60 sec",
    description: "",
    tips: "",
    videoUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

const fetchExercises = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      router.replace("/login");
      return;
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/exercises/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = (await response.json()) as ExercisesResponse;

    if (response.ok && data.success) {
      setExercises(data.exercises);
    }
  } catch (error) {
    console.error("Error fetching exercises:", error);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

const fetchCategoryStats = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await fetch(`${API_BASE_URL}/api/admin/exercises/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = (await response.json()) as StatsResponse;

    if (response.ok && data.success) {
      setCategoryStats(data.stats);
    }
  } catch (error) {
    console.error("Error fetching stats:", error);
  }
};

  useFocusEffect(
    useCallback(() => {
      fetchExercises();
      fetchCategoryStats();
    }, [])
  );

  const filteredExercises = exercises.filter((ex) => {
    if (selectedCategory !== "All" && ex.category !== selectedCategory) return false;
    if (searchQuery && !ex.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const openAddModal = () => {
    setEditingExercise(null);
    setFormData({
      name: "",
      category: "Chest",
      subCategory: "Compound",
      difficulty: "Intermediate",
      muscleGroups: [],
      primaryMuscle: "",
      equipment: [],
      sets: 3,
      reps: "10-12",
      rest: "60 sec",
      description: "",
      tips: "",
      videoUrl: "",
    });
    setModalVisible(true);
  };

  const openEditModal = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setFormData({
      name: exercise.name,
      category: exercise.category,
      subCategory: exercise.subCategory,
      difficulty: exercise.difficulty,
      muscleGroups: exercise.muscleGroups || [],
      primaryMuscle: exercise.primaryMuscle || "",
      equipment: exercise.equipment || [],
      sets: exercise.sets,
      reps: exercise.reps,
      rest: exercise.rest,
      description: exercise.description,
      tips: exercise.tips?.join("\n") || "",
      videoUrl: exercise.videoUrl,
    });
    setModalVisible(true);
  };

  const toggleMuscleGroup = (muscle: string) => {
    setFormData((prev) => ({
      ...prev,
      muscleGroups: prev.muscleGroups.includes(muscle)
        ? prev.muscleGroups.filter((m) => m !== muscle)
        : [...prev.muscleGroups, muscle],
    }));
  };

  const toggleEquipment = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(item)
        ? prev.equipment.filter((e) => e !== item)
        : [...prev.equipment, item],
    }));
  };

const saveExercise = async () => {
  if (!formData.name || !formData.description) {
    Alert.alert("Error", "Please fill in required fields");
    return;
  }

  setSubmitting(true);
  try {
    const token = await AsyncStorage.getItem("userToken");
    const payload = {
      ...formData,
      tips: formData.tips.split("\n").filter((t) => t.trim()),
    };

    const url = editingExercise
      ? `${API_BASE_URL}/api/admin/exercises/${editingExercise._id}`
      : `${API_BASE_URL}/api/admin/exercises`;
    const method = editingExercise ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as SaveExerciseResponse;

    if (response.ok && data.success) {
      Alert.alert("Success", editingExercise ? "Exercise updated" : "Exercise created");
      setModalVisible(false);
      fetchExercises();
      fetchCategoryStats();
    } else {
      Alert.alert("Error", data.error || "Failed to save exercise");
    }
  } catch (error) {
    console.error("Save error:", error);
    Alert.alert("Error", "Could not save exercise");
  } finally {
    setSubmitting(false);
  }
};

const deleteExercise = (exercise: Exercise) => {
  Alert.alert(
    "Delete Exercise",
    `Are you sure you want to delete "${exercise.name}"?`,
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("userToken");
            const response = await fetch(`${API_BASE_URL}/api/admin/exercises/${exercise._id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = (await response.json()) as DeleteExerciseResponse;

            if (response.ok && data.success) {
              Alert.alert("Success", "Exercise deleted");
              fetchExercises();
              fetchCategoryStats();
            } else {
              Alert.alert("Error", data.error || "Failed to delete");
            }
          } catch (error) {
            Alert.alert("Error", "Could not delete exercise");
          }
        },
      },
    ]
  );
};
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Chest: "#FF6B6B",
      Back: "#4ECDC4",
      Legs: "#45B7D1",
      Shoulders: "#96CEB4",
      Arms: "#FFEAA7",
      Core: "#DFE6E9",
      Cardio: "#FF7675",
      HIIT: "#FDCB6E",
      "Full Body": "#6C5CE7",
    };
    return colors[category] || currentColors.primary;
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: currentColors.background }]}>
        <ActivityIndicator size="large" color={currentColors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={isDark ? ["#0a0a0a", "#000000"] : ["#ffffff", "#f8f9fa"]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={currentColors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: currentColors.text }]}>
            Manage Exercises
          </Text>
          <TouchableOpacity onPress={openAddModal} style={[styles.addBtn, { backgroundColor: currentColors.primary }]}>
            <Ionicons name="add" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Category Stats Row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsRow}>
        <TouchableOpacity
          style={[
            styles.statPill,
            {
              backgroundColor: selectedCategory === "All" ? currentColors.primary : (isDark ? "#1a1a1a" : "#f0f0f0"),
              borderColor: currentColors.primary,
            },
          ]}
          onPress={() => setSelectedCategory("All")}
        >
          <Text style={[styles.statPillText, { color: selectedCategory === "All" ? "#000" : currentColors.text }]}>
            All ({exercises.length})
          </Text>
        </TouchableOpacity>
        {categoryStats.map((stat) => (
          <TouchableOpacity
            key={stat._id}
            style={[
              styles.statPill,
              {
                backgroundColor: selectedCategory === stat._id ? getCategoryColor(stat._id) : (isDark ? "#1a1a1a" : "#f0f0f0"),
                borderColor: getCategoryColor(stat._id),
              },
            ]}
            onPress={() => setSelectedCategory(stat._id)}
          >
            <Text
              style={[
                styles.statPillText,
                { color: selectedCategory === stat._id ? "#000" : getCategoryColor(stat._id) },
              ]}
            >
              {stat._id} ({stat.count})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
        <Ionicons name="search" size={18} color={isDark ? "#666" : "#999"} />
        <TextInput
          style={[styles.searchInput, { color: currentColors.text }]}
          placeholder="Search exercises..."
          placeholderTextColor={isDark ? "#666" : "#999"}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Exercises List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchExercises();
              fetchCategoryStats();
            }}
            tintColor={currentColors.primary}
          />
        }
      >
        {filteredExercises.map((exercise) => (
          <View
            key={exercise._id}
            style={[
              styles.exerciseCard,
              {
                backgroundColor: isDark ? "#0e0e0e" : "#fff",
                borderColor: getCategoryColor(exercise.category) + "40",
              },
            ]}
          >
            <View style={styles.exerciseCardHeader}>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: getCategoryColor(exercise.category) + "20" },
                ]}
              >
                <Text style={[styles.categoryBadgeText, { color: getCategoryColor(exercise.category) }]}>
                  {exercise.category}
                </Text>
              </View>
              <View style={styles.exerciseActions}>
                <TouchableOpacity onPress={() => openEditModal(exercise)} style={styles.actionIcon}>
                  <Ionicons name="create-outline" size={20} color={currentColors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteExercise(exercise)} style={styles.actionIcon}>
                  <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={[styles.exerciseName, { color: currentColors.text }]}>{exercise.name}</Text>
            <View style={styles.exerciseMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="barbell-outline" size={12} color={currentColors.primary} />
                <Text style={[styles.metaText, { color: isDark ? "#aaa" : "#666" }]}>{exercise.subCategory}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="trending-up" size={12} color={currentColors.primary} />
                <Text style={[styles.metaText, { color: isDark ? "#aaa" : "#666" }]}>{exercise.difficulty}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="repeat" size={12} color={currentColors.primary} />
                <Text style={[styles.metaText, { color: isDark ? "#aaa" : "#666" }]}>{exercise.sets} sets</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
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
                {editingExercise ? "Edit Exercise" : "New Exercise"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={currentColors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Name */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: currentColors.text }]}>Name *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5", color: currentColors.text }]}
                  placeholder="e.g., Barbell Bench Press"
                  placeholderTextColor={isDark ? "#666" : "#999"}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
              </View>

              {/* Category & SubCategory Row */}
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, { color: currentColors.text }]}>Category *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.optionChip,
                          {
                            backgroundColor: formData.category === cat ? getCategoryColor(cat) : (isDark ? "#1a1a1a" : "#f0f0f0"),
                          },
                        ]}
                        onPress={() => setFormData({ ...formData, category: cat })}
                      >
                        <Text style={[styles.optionChipText, { color: formData.category === cat ? "#000" : getCategoryColor(cat) }]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* SubCategory */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: currentColors.text }]}>Sub-Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {subCategories.map((sub) => (
                    <TouchableOpacity
                      key={sub}
                      style={[
                        styles.optionChip,
                        {
                          backgroundColor: formData.subCategory === sub ? currentColors.primary : (isDark ? "#1a1a1a" : "#f0f0f0"),
                        },
                      ]}
                      onPress={() => setFormData({ ...formData, subCategory: sub })}
                    >
                      <Text style={[styles.optionChipText, { color: formData.subCategory === sub ? "#000" : currentColors.text }]}>
                        {sub}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Difficulty */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: currentColors.text }]}>Difficulty</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {difficultyLevels.map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.optionChip,
                        {
                          backgroundColor: formData.difficulty === level ? currentColors.primary : (isDark ? "#1a1a1a" : "#f0f0f0"),
                        },
                      ]}
                      onPress={() => setFormData({ ...formData, difficulty: level })}
                    >
                      <Text style={[styles.optionChipText, { color: formData.difficulty === level ? "#000" : currentColors.text }]}>
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Sets & Reps */}
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.inputLabel, { color: currentColors.text }]}>Sets</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5", color: currentColors.text }]}
                    keyboardType="numeric"
                    value={String(formData.sets)}
                    onChangeText={(text) => setFormData({ ...formData, sets: parseInt(text) || 0 })}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, { color: currentColors.text }]}>Reps</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5", color: currentColors.text }]}
                    placeholder="e.g., 8-10"
                    placeholderTextColor={isDark ? "#666" : "#999"}
                    value={formData.reps}
                    onChangeText={(text) => setFormData({ ...formData, reps: text })}
                  />
                </View>
              </View>

              {/* Rest */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: currentColors.text }]}>Rest</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5", color: currentColors.text }]}
                  placeholder="e.g., 60 sec"
                  placeholderTextColor={isDark ? "#666" : "#999"}
                  value={formData.rest}
                  onChangeText={(text) => setFormData({ ...formData, rest: text })}
                />
              </View>

              {/* Muscle Groups */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: currentColors.text }]}>Muscle Groups</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {muscleGroupOptions.map((muscle) => (
                    <TouchableOpacity
                      key={muscle}
                      style={[
                        styles.optionChip,
                        {
                          backgroundColor: formData.muscleGroups.includes(muscle) ? currentColors.primary : (isDark ? "#1a1a1a" : "#f0f0f0"),
                        },
                      ]}
                      onPress={() => toggleMuscleGroup(muscle)}
                    >
                      <Text style={[styles.optionChipText, { color: formData.muscleGroups.includes(muscle) ? "#000" : currentColors.text }]}>
                        {muscle}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Equipment */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: currentColors.text }]}>Equipment</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {["Barbell", "Dumbbells", "Kettlebell", "Cable Machine", "Pull-up Bar", "Bench", "Leg Press", "None"].map((eq) => (
                    <TouchableOpacity
                      key={eq}
                      style={[
                        styles.optionChip,
                        {
                          backgroundColor: formData.equipment.includes(eq) ? currentColors.primary : (isDark ? "#1a1a1a" : "#f0f0f0"),
                        },
                      ]}
                      onPress={() => toggleEquipment(eq)}
                    >
                      <Text style={[styles.optionChipText, { color: formData.equipment.includes(eq) ? "#000" : currentColors.text }]}>
                        {eq}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: currentColors.text }]}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5", color: currentColors.text }]}
                  multiline
                  numberOfLines={3}
                  placeholder="Describe the exercise..."
                  placeholderTextColor={isDark ? "#666" : "#999"}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                />
              </View>

              {/* Tips */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: currentColors.text }]}>Tips (one per line)</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5", color: currentColors.text }]}
                  multiline
                  numberOfLines={3}
                  placeholder="Keep your back arched&#10;Drive through your heels&#10;Lower the bar to your sternum"
                  placeholderTextColor={isDark ? "#666" : "#999"}
                  value={formData.tips}
                  onChangeText={(text) => setFormData({ ...formData, tips: text })}
                />
              </View>

              {/* Video URL */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: currentColors.text }]}>Video URL</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5", color: currentColors.text }]}
                  placeholder="https://www.youtube.com/watch?v=..."
                  placeholderTextColor={isDark ? "#666" : "#999"}
                  value={formData.videoUrl}
                  onChangeText={(text) => setFormData({ ...formData, videoUrl: text })}
                />
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: currentColors.primary, opacity: submitting ? 0.7 : 1 }]}
                onPress={saveExercise}
                disabled={submitting}
              >
                <Text style={styles.saveButtonText}>
                  {submitting ? "Saving..." : editingExercise ? "Update Exercise" : "Create Exercise"}
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
  headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  backBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "800" },
  addBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },

  statsRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  statPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, marginRight: 8 },
  statPillText: { fontSize: 13, fontWeight: "700" },

  searchContainer: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginBottom: 16, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, marginLeft: 8 },

  scrollContent: { padding: 16, paddingBottom: 40 },

  exerciseCard: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1.5 },
  exerciseCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  categoryBadgeText: { fontSize: 11, fontWeight: "700" },
  exerciseActions: { flexDirection: "row", gap: 12 },
  actionIcon: { padding: 4 },
  exerciseName: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  exerciseMeta: { flexDirection: "row", gap: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 11, fontWeight: "500" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "90%", maxHeight: "85%", borderRadius: 24, padding: 20, borderWidth: 2 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: "800" },

  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 12, fontWeight: "700", marginBottom: 6, marginLeft: 4 },
  input: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  textArea: { minHeight: 80, textAlignVertical: "top" },

  row: { flexDirection: "row" },
  optionChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, marginBottom: 4 },
  optionChipText: { fontSize: 13, fontWeight: "600" },

  saveButton: { paddingVertical: 14, borderRadius: 16, alignItems: "center", marginTop: 16 },
  saveButtonText: { fontSize: 16, fontWeight: "800", color: "#000" },
});