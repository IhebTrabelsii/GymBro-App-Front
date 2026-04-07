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

const API_BASE_URL = "http://192.168.100.143:3000";

const categories = ["Protein", "Carbs", "Fats", "Fruit", "Vegetables"];

export default function AdminFoodsScreen() {
  const router = useRouter();
  const { theme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === "dark";

  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFood, setEditingFood] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    benefit: "",
    image: "🍗",
    category: "Protein",
    tags: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch all foods
  const fetchFoods = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/foods`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await response.json()) as {
        success: boolean;
        foods: any[];
      };

      if (data.success) {
        setFoods(data.foods);
      }
    } catch (error) {
      console.error("Error fetching foods:", error);
      Alert.alert("Error", "Failed to load foods");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useFocusEffect(
    useCallback(() => {
      fetchFoods();
    }, []),
  );

  // Open modal for adding/editing
  const openModal = (food: any = null) => {
    if (food) {
      setEditingFood(food);
      setFormData({
        name: food.name,
        calories: String(food.calories),
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        benefit: food.benefit,
        image: food.image || "🍗",
        category: food.category,
        tags: food.tags?.join(", ") || "",
      });
    } else {
      setEditingFood(null);
      setFormData({
        name: "",
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
        benefit: "",
        image: "🍗",
        category: "Protein",
        tags: "",
      });
    }
    setModalVisible(true);
  };

  // Save food (create or update)
  const saveFood = async () => {
    if (!formData.name || !formData.calories || !formData.protein) {
      Alert.alert(
        "Error",
        "Please fill in required fields (Name, Calories, Protein)",
      );
      return;
    }

    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const payload = {
        name: formData.name,
        calories: parseInt(formData.calories),
        protein: formData.protein,
        carbs: formData.carbs || "0g",
        fat: formData.fat || "0g",
        benefit: formData.benefit || "No description",
        image: formData.image || "🍗",
        category: formData.category,
        tags: formData.tags.split(",").map((t) => t.trim()),
      };

      const url = editingFood
        ? `${API_BASE_URL}/api/foods/${editingFood._id}`
        : `${API_BASE_URL}/api/foods`;
      const method = editingFood ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        success: boolean;
        error?: string;
      };

      if (response.ok && data.success) {
        Alert.alert("Success", editingFood ? "Food updated" : "Food created");
        setModalVisible(false);
        fetchFoods();
      } else {
        Alert.alert("Error", data.error || "Failed to save food");
      }
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Error", "Could not save food");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete food
  const deleteFood = (food: any) => {
    Alert.alert(
      "Delete Food",
      `Are you sure you want to delete "${food.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("userToken");
              const response = await fetch(
                `${API_BASE_URL}/api/foods/${food._id}`,
                {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${token}` },
                },
              );
              const data = (await response.json()) as {
                success: boolean;
                error?: string;
              };

              if (response.ok && data.success) {
                Alert.alert("Success", "Food deleted");
                fetchFoods();
              } else {
                Alert.alert("Error", data.error || "Failed to delete");
              }
            } catch (error) {
              Alert.alert("Error", "Could not delete food");
            }
          },
        },
      ],
    );
  };

  const renderFoodItem = ({ item }: { item: any }) => (
    <View
      style={[
        styles.foodItem,
        {
          backgroundColor: isDark ? currentColors.card : "#FFFFFF",
          borderColor: isDark ? "rgba(57,255,20,0.2)" : "rgba(57,255,20,0.15)",
        },
      ]}
    >
      <View style={styles.foodItemLeft}>
        <Text style={styles.foodEmoji}>{item.image || "🍗"}</Text>
        <View style={styles.foodInfo}>
          <Text style={[styles.foodName, { color: currentColors.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.foodCategory, { color: currentColors.primary }]}>
            {item.category}
          </Text>
          <Text
            style={[styles.foodCalories, { color: isDark ? "#aaa" : "#666" }]}
          >
            {item.calories} kcal
          </Text>
        </View>
      </View>
      <View style={styles.foodItemRight}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: currentColors.primary + "20" },
          ]}
          onPress={() => openModal(item)}
        >
          <Ionicons
            name="create-outline"
            size={20}
            color={currentColors.primary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#FF6B6B20" }]}
          onPress={() => deleteFood(item)}
        >
          <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </View>
  );

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
      <View
        style={[
          styles.header,
          {
            backgroundColor: isDark ? currentColors.card : "#FFFFFF",
            borderBottomColor: currentColors.primary,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={currentColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentColors.text }]}>
          Manage Foods
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: currentColors.primary }]}
          onPress={() => openModal()}
        >
          <Ionicons name="add" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View
        style={[
          styles.statsCard,
          {
            backgroundColor: isDark ? currentColors.card : "#FFFFFF",
            borderColor: currentColors.primary,
          },
        ]}
      >
        <Text style={[styles.statsNumber, { color: currentColors.primary }]}>
          {foods.length}
        </Text>
        <Text style={[styles.statsLabel, { color: currentColors.text }]}>
          Total Foods
        </Text>
      </View>

      {/* Food List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchFoods();
            }}
            tintColor={currentColors.primary}
          />
        }
      >
        {foods.map((food) => (
          <View key={food._id}>{renderFoodItem({ item: food })}</View>
        ))}
        {foods.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🍽️</Text>
            <Text style={[styles.emptyText, { color: currentColors.text }]}>
              No foods yet
            </Text>
            <TouchableOpacity
              style={[
                styles.emptyButton,
                { backgroundColor: currentColors.primary },
              ]}
              onPress={() => openModal()}
            >
              <Text style={styles.emptyButtonText}>Add Your First Food</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: isDark ? currentColors.card : "#FFFFFF",
                borderColor: currentColors.primary,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: currentColors.text }]}>
                {editingFood ? "Edit Food" : "Add New Food"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={currentColors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Name */}
              <View style={styles.inputGroup}>
                <Text
                  style={[styles.inputLabel, { color: currentColors.text }]}
                >
                  Name *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.05)"
                        : "#F5F5F5",
                      color: currentColors.text,
                      borderColor: isDark
                        ? "rgba(57,255,20,0.3)"
                        : "rgba(57,255,20,0.2)",
                    },
                  ]}
                  placeholder="e.g., Chicken Breast"
                  placeholderTextColor={isDark ? "#666" : "#999"}
                  value={formData.name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, name: text })
                  }
                />
              </View>

              {/* Calories */}
              <View style={styles.inputGroup}>
                <Text
                  style={[styles.inputLabel, { color: currentColors.text }]}
                >
                  Calories *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.05)"
                        : "#F5F5F5",
                      color: currentColors.text,
                      borderColor: isDark
                        ? "rgba(57,255,20,0.3)"
                        : "rgba(57,255,20,0.2)",
                    },
                  ]}
                  placeholder="e.g., 165"
                  placeholderTextColor={isDark ? "#666" : "#999"}
                  keyboardType="numeric"
                  value={formData.calories}
                  onChangeText={(text) =>
                    setFormData({ ...formData, calories: text })
                  }
                />
              </View>

              {/* Protein */}
              <View style={styles.inputGroup}>
                <Text
                  style={[styles.inputLabel, { color: currentColors.text }]}
                >
                  Protein *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.05)"
                        : "#F5F5F5",
                      color: currentColors.text,
                      borderColor: isDark
                        ? "rgba(57,255,20,0.3)"
                        : "rgba(57,255,20,0.2)",
                    },
                  ]}
                  placeholder="e.g., 31g"
                  placeholderTextColor={isDark ? "#666" : "#999"}
                  value={formData.protein}
                  onChangeText={(text) =>
                    setFormData({ ...formData, protein: text })
                  }
                />
              </View>

              {/* Carbs */}
              <View style={styles.inputGroup}>
                <Text
                  style={[styles.inputLabel, { color: currentColors.text }]}
                >
                  Carbs
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.05)"
                        : "#F5F5F5",
                      color: currentColors.text,
                      borderColor: isDark
                        ? "rgba(57,255,20,0.3)"
                        : "rgba(57,255,20,0.2)",
                    },
                  ]}
                  placeholder="e.g., 0g"
                  placeholderTextColor={isDark ? "#666" : "#999"}
                  value={formData.carbs}
                  onChangeText={(text) =>
                    setFormData({ ...formData, carbs: text })
                  }
                />
              </View>

              {/* Fat */}
              <View style={styles.inputGroup}>
                <Text
                  style={[styles.inputLabel, { color: currentColors.text }]}
                >
                  Fat
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.05)"
                        : "#F5F5F5",
                      color: currentColors.text,
                      borderColor: isDark
                        ? "rgba(57,255,20,0.3)"
                        : "rgba(57,255,20,0.2)",
                    },
                  ]}
                  placeholder="e.g., 3.6g"
                  placeholderTextColor={isDark ? "#666" : "#999"}
                  value={formData.fat}
                  onChangeText={(text) =>
                    setFormData({ ...formData, fat: text })
                  }
                />
              </View>

              {/* Category */}
              <View style={styles.inputGroup}>
                <Text
                  style={[styles.inputLabel, { color: currentColors.text }]}
                >
                  Category
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor:
                            formData.category === cat
                              ? currentColors.primary
                              : isDark
                                ? "rgba(255,255,255,0.05)"
                                : "#F5F5F5",
                        },
                      ]}
                      onPress={() =>
                        setFormData({ ...formData, category: cat })
                      }
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          {
                            color:
                              formData.category === cat
                                ? "#000"
                                : currentColors.text,
                          },
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Image Emoji */}
              <View style={styles.inputGroup}>
                <Text
                  style={[styles.inputLabel, { color: currentColors.text }]}
                >
                  Image Emoji
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.05)"
                        : "#F5F5F5",
                      color: currentColors.text,
                      borderColor: isDark
                        ? "rgba(57,255,20,0.3)"
                        : "rgba(57,255,20,0.2)",
                    },
                  ]}
                  placeholder="e.g., 🍗"
                  placeholderTextColor={isDark ? "#666" : "#999"}
                  value={formData.image}
                  onChangeText={(text) =>
                    setFormData({ ...formData, image: text })
                  }
                />
              </View>

              {/* Tags */}
              <View style={styles.inputGroup}>
                <Text
                  style={[styles.inputLabel, { color: currentColors.text }]}
                >
                  Tags (comma separated)
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.05)"
                        : "#F5F5F5",
                      color: currentColors.text,
                      borderColor: isDark
                        ? "rgba(57,255,20,0.3)"
                        : "rgba(57,255,20,0.2)",
                    },
                  ]}
                  placeholder="e.g., high-protein, low-carb"
                  placeholderTextColor={isDark ? "#666" : "#999"}
                  value={formData.tags}
                  onChangeText={(text) =>
                    setFormData({ ...formData, tags: text })
                  }
                />
              </View>

              {/* Benefit */}
              <View style={styles.inputGroup}>
                <Text
                  style={[styles.inputLabel, { color: currentColors.text }]}
                >
                  Benefit Description
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.05)"
                        : "#F5F5F5",
                      color: currentColors.text,
                      borderColor: isDark
                        ? "rgba(57,255,20,0.3)"
                        : "rgba(57,255,20,0.2)",
                    },
                  ]}
                  placeholder="Health benefits of this food..."
                  placeholderTextColor={isDark ? "#666" : "#999"}
                  multiline
                  numberOfLines={3}
                  value={formData.benefit}
                  onChangeText={(text) =>
                    setFormData({ ...formData, benefit: text })
                  }
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  {
                    backgroundColor: currentColors.primary,
                    opacity: submitting ? 0.7 : 1,
                  },
                ]}
                onPress={saveFood}
                disabled={submitting}
              >
                <Text style={styles.submitButtonText}>
                  {submitting
                    ? "Saving..."
                    : editingFood
                      ? "Update Food"
                      : "Create Food"}
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
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 16,
    borderBottomWidth: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  statsCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: "center",
  },
  statsNumber: {
    fontSize: 36,
    fontWeight: "800",
  },
  statsLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 4,
  },
  scrollContent: {
    padding: 20,
  },
  foodItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  foodItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  foodEmoji: {
    fontSize: 40,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  foodCategory: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  foodCalories: {
    fontSize: 12,
    fontWeight: "500",
  },
  foodItemRight: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "85%",
    borderRadius: 28,
    padding: 20,
    borderWidth: 2,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1.5,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#000",
  },
});
