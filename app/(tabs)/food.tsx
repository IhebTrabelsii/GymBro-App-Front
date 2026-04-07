import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  TextInput,
  Animated,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import { useSimpleTheme } from "../../context/SimpleThemeContext";

if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const { width } = Dimensions.get("window");
const API_BASE_URL = "http://192.168.100.143:3000";

const categories = ["All", "Protein", "Carbs", "Fats", "Fruit", "Vegetables"];
const sortOptions = ["Name", "Calories", "Protein", "Carbs"];

const CATEGORY_META: Record<string, { emoji: string; color: string }> = {
  All:        { emoji: "🌟", color: "#39FF14" },
  Protein:    { emoji: "💪", color: "#FF6B6B" },
  Carbs:      { emoji: "⚡", color: "#FFC107" },
  Fats:       { emoji: "🥑", color: "#FF9500" },
  Fruit:      { emoji: "🍎", color: "#FF4F8B" },
  Vegetables: { emoji: "🥗", color: "#34C759" },
};

const getCategoryColor = (category: string) =>
  CATEGORY_META[category]?.color ?? "#39FF14";

export default function FoodScreen() {
  const router = useRouter();
  const { theme, toggleTheme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === "dark";

  const [foods, setFoods] = useState<any[]>([]);
  const [loadingFoods, setLoadingFoods] = useState(true);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Name");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const scaleAnim  = useRef(new Animated.Value(0)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(-24)).current;
  const buttonPulse = useRef(new Animated.Value(1)).current;
  const glowAnim   = useRef(new Animated.Value(0)).current;

  // ── All original functions intact ─────────────────────────────────────────
  const fetchFoods = async () => {
    try {
      setLoadingFoods(true);
      const response = await fetch(`${API_BASE_URL}/api/foods`);
      const data = (await response.json()) as { success: boolean; foods: any[] };
      if (data.success) setFoods(data.foods);
    } catch (error) {
      console.error("Error fetching foods:", error);
    } finally {
      setLoadingFoods(false);
    }
  };

  useEffect(() => {
    fetchFoods();

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 52, friction: 9, useNativeDriver: true }),
    ]).start();

    Animated.loop(Animated.sequence([
      Animated.timing(buttonPulse, { toValue: 1.03, duration: 1500, useNativeDriver: true }),
      Animated.timing(buttonPulse, { toValue: 1,    duration: 1500, useNativeDriver: true }),
    ])).start();

    Animated.loop(Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
    ])).start();
  }, []);

  const processedFoods = useMemo(() => {
    let result = foods;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (food) =>
          food.name.toLowerCase().includes(query) ||
          food.category.toLowerCase().includes(query) ||
          (food.tags && food.tags.some((tag: string) => tag.includes(query)))
      );
    }
    if (selectedCategory !== "All") {
      result = result.filter((food) => food.category === selectedCategory);
    }
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "Calories": return b.calories - a.calories;
        case "Protein":  return parseFloat(b.protein) - parseFloat(a.protein);
        case "Carbs":    return parseFloat(b.carbs)   - parseFloat(a.carbs);
        default:         return a.name.localeCompare(b.name);
      }
    });
    return result;
  }, [searchQuery, selectedCategory, sortBy, foods]);

  const openFood = (food: any) => {
    setSelectedFood(food);
    setModalVisible(true);
    scaleAnim.setValue(0);
    Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }).start();
  };

  const closeModal = () => {
    Animated.timing(scaleAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setModalVisible(false);
      setSelectedFood(null);
    });
  };

  const toggleFilters = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilters(!showFilters);
  };

  const getCategoryIcon = (category: string) => CATEGORY_META[category]?.emoji ?? "📦";

  const getMacroPercentage = (value: string) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };
  // ─────────────────────────────────────────────────────────────────────────

  const filtersActive = selectedCategory !== "All" || sortBy !== "Name";

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>

      {/* ── TOP BAR ──────────────────────────────────────────────────────── */}
      <View style={[styles.topBar, {
        backgroundColor: isDark ? "rgba(8,8,8,0.98)" : "rgba(255,255,255,0.98)",
        borderBottomColor: isDark ? currentColors.primary + "18" : currentColors.primary + "10",
      }]}>
        <LinearGradient
          colors={[currentColors.primary + "00", currentColors.primary, currentColors.primary + "00"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.topBarLine}
        />
        <TouchableOpacity onPress={() => router.replace("/")} activeOpacity={0.7}>
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

        <View style={styles.topRightSection}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, {
              backgroundColor: isDark ? currentColors.primary + "12" : currentColors.primary + "08",
              borderColor: isDark ? currentColors.primary + "35" : currentColors.primary + "25",
            }]}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={16} color={currentColors.primary} />
            <Text style={[styles.backText, { color: currentColors.primary }]}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={toggleTheme}
            style={[styles.themeToggle, { backgroundColor: currentColors.primary, shadowColor: currentColors.primary }]}
            activeOpacity={0.8}
          >
            <Ionicons name={isDark ? "sunny" : "moon"} size={16} color={isDark ? currentColors.background : "#FFF"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.headerTop}>
          <View>
            <View style={styles.headerTitleRow}>
              <Text style={[styles.title, { color: currentColors.text }]}>Nutrition</Text>
              <Text style={styles.titleEmoji}>🍎</Text>
            </View>
            <View style={styles.headerSubRow}>
              <View style={[styles.headerPulse, { backgroundColor: currentColors.primary }]} />
              <Text style={[styles.subtitle, { color: isDark ? "#555" : "#bbb" }]}>
                {loadingFoods ? "Loading…" : `${processedFoods.length} food${processedFoods.length !== 1 ? "s" : ""} available`}
              </Text>
            </View>
          </View>

          {/* View toggle */}
          <TouchableOpacity
            style={[styles.viewToggle, {
              backgroundColor: isDark ? "#111" : "#f5f5f5",
              borderColor: isDark ? "#222" : "#e8e8e8",
            }]}
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setViewMode(viewMode === "list" ? "grid" : "list");
            }}
          >
            <Ionicons
              name={viewMode === "list" ? "grid-outline" : "list-outline"}
              size={18}
              color={currentColors.primary}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* ── SEARCH ───────────────────────────────────────────────────────── */}
      <View style={[styles.searchContainer, {
        backgroundColor: isDark ? "#111" : "#f7f7f7",
        borderColor: isDark ? "#1e1e1e" : "#ebebeb",
      }]}>
        <View style={[styles.searchIconBox, { backgroundColor: currentColors.primary + "12" }]}>
          <Ionicons name="search" size={16} color={currentColors.primary} />
        </View>
        <TextInput
          style={[styles.searchInput, { color: currentColors.text }]}
          placeholder="Search foods, categories, tags…"
          placeholderTextColor={isDark ? "#333" : "#ccc"}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
            <Ionicons name="close-circle" size={16} color={isDark ? "#444" : "#ccc"} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── FILTER TOGGLE ────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={[styles.filterToggleBtn, {
          backgroundColor: isDark ? "#111" : "#f7f7f7",
          borderColor: filtersActive
            ? currentColors.primary + "50"
            : (isDark ? "#1e1e1e" : "#ebebeb"),
        }]}
        onPress={toggleFilters}
      >
        <Ionicons
          name={showFilters ? "options" : "options-outline"}
          size={16}
          color={filtersActive ? currentColors.primary : (isDark ? "#555" : "#bbb")}
        />
        <Text style={[styles.filterToggleText, {
          color: filtersActive ? currentColors.primary : (isDark ? "#555" : "#bbb"),
        }]}>
          {showFilters ? "Hide Filters" : "Filters"}
        </Text>
        {filtersActive && (
          <View style={[styles.filterActiveDot, { backgroundColor: currentColors.primary }]} />
        )}
        <Ionicons
          name={showFilters ? "chevron-up" : "chevron-down"}
          size={14}
          color={isDark ? "#444" : "#ccc"}
          style={{ marginLeft: "auto" }}
        />
      </TouchableOpacity>

      {/* ── FILTERS PANEL ────────────────────────────────────────────────── */}
      {showFilters && (
        <View style={[styles.filtersPanel, {
          backgroundColor: isDark ? "#0a0a0a" : "#f9f9f9",
          borderColor: isDark ? "#1a1a1a" : "#efefef",
        }]}>
          <Text style={[styles.filterLabel, { color: isDark ? "#444" : "#ccc" }]}>CATEGORY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 4 }}>
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              const meta = CATEGORY_META[cat];
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, {
                    backgroundColor: active ? meta.color + "18" : (isDark ? "#111" : "#f0f0f0"),
                    borderColor: active ? meta.color + "60" : (isDark ? "#222" : "#e0e0e0"),
                  }]}
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setSelectedCategory(cat);
                  }}
                >
                  <Text style={styles.categoryEmoji}>{meta.emoji}</Text>
                  <Text style={[styles.categoryChipText, { color: active ? meta.color : (isDark ? "#666" : "#aaa") }]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={[styles.filterLabel, { color: isDark ? "#444" : "#ccc", marginTop: 14 }]}>SORT BY</Text>
          <View style={styles.sortRow}>
            {sortOptions.map((opt) => {
              const active = sortBy === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.sortChip, {
                    backgroundColor: active ? currentColors.primary + "15" : (isDark ? "#111" : "#f0f0f0"),
                    borderColor: active ? currentColors.primary + "50" : (isDark ? "#222" : "#e0e0e0"),
                  }]}
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setSortBy(opt);
                  }}
                >
                  <Text style={[styles.sortChipText, { color: active ? currentColors.primary : (isDark ? "#555" : "#aaa") }]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* ── FOOD LIST ────────────────────────────────────────────────────── */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {loadingFoods ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={currentColors.primary} />
            <Text style={[styles.loadingText, { color: isDark ? "#444" : "#ccc" }]}>
              Loading nutritious foods…
            </Text>
          </View>
        ) : processedFoods.length > 0 ? (
          <View style={viewMode === "grid" ? styles.gridContainer : styles.listContainer}>
            {processedFoods.map((food, index) => {
              const catColor = getCategoryColor(food.category);
              return viewMode === "list" ? (
                /* ── LIST CARD ── */
                <TouchableOpacity
                  key={food._id || index}
                  style={[styles.foodCard, {
                    backgroundColor: isDark ? "#0e0e0e" : "#fff",
                    borderColor: isDark ? catColor + "25" : catColor + "15",
                  }]}
                  onPress={() => openFood(food)}
                  activeOpacity={0.82}
                >
                  {/* Left color strip */}
                  <View style={[styles.foodCardStrip, { backgroundColor: catColor }]} />

                  {/* Emoji box */}
                  <View style={[styles.emojiBox, { backgroundColor: catColor + "12" }]}>
                    <Text style={styles.foodEmoji}>{food.image || "🍗"}</Text>
                  </View>

                  {/* Info */}
                  <View style={styles.foodInfo}>
                    <Text style={[styles.foodName, { color: currentColors.text }]} numberOfLines={1}>
                      {food.name}
                    </Text>
                    <View style={[styles.catPill, { backgroundColor: catColor + "15", borderColor: catColor + "30" }]}>
                      <Text style={[styles.catPillText, { color: catColor }]}>{food.category}</Text>
                    </View>
                    <View style={styles.macroRow}>
                      {[
                        { label: "P", val: food.protein, color: "#FF6B6B" },
                        { label: "C", val: food.carbs,   color: "#FFC107" },
                        { label: "F", val: food.fat,     color: "#FF9500" },
                      ].map((m) => (
                        <View key={m.label} style={styles.macroPill}>
                          <Text style={[styles.macroPillLabel, { color: m.color }]}>{m.label}</Text>
                          <Text style={[styles.macroPillVal, { color: isDark ? "#555" : "#bbb" }]}>{m.val}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Calories + chevron */}
                  <View style={styles.foodCardRight}>
                    <Text style={[styles.foodCalories, { color: catColor }]}>{food.calories}</Text>
                    <Text style={[styles.foodCalUnit, { color: isDark ? "#333" : "#ddd" }]}>kcal</Text>
                    <View style={[styles.chevronBox, { backgroundColor: catColor + "12" }]}>
                      <Ionicons name="chevron-forward" size={14} color={catColor} />
                    </View>
                  </View>
                </TouchableOpacity>
              ) : (
                /* ── GRID CARD ── */
                <TouchableOpacity
                  key={food._id || index}
                  style={[styles.foodCardGrid, {
                    backgroundColor: isDark ? "#0e0e0e" : "#fff",
                    borderColor: isDark ? catColor + "25" : catColor + "15",
                  }]}
                  onPress={() => openFood(food)}
                  activeOpacity={0.82}
                >
                  <View style={[styles.gridCardStrip, { backgroundColor: catColor }]} />
                  <View style={[styles.gridEmojiBox, { backgroundColor: catColor + "10" }]}>
                    <Text style={styles.gridFoodEmoji}>{food.image || "🍗"}</Text>
                  </View>
                  <Text style={[styles.gridFoodName, { color: currentColors.text }]} numberOfLines={1}>
                    {food.name}
                  </Text>
                  <Text style={[styles.gridCalories, { color: catColor }]}>{food.calories} kcal</Text>
                  <Text style={[styles.gridProtein, { color: isDark ? "#444" : "#ccc" }]}>
                    P: {food.protein}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          /* ── EMPTY STATE ── */
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={[styles.emptyText, { color: isDark ? "#444" : "#ccc" }]}>No foods found</Text>
            <Text style={[styles.emptySubtext, { color: isDark ? "#333" : "#ddd" }]}>
              Try adjusting your filters or search
            </Text>
            <TouchableOpacity
              style={[styles.resetButton, { borderColor: currentColors.primary + "50", backgroundColor: currentColors.primary + "10" }]}
              onPress={() => { setSearchQuery(""); setSelectedCategory("All"); setSortBy("Name"); }}
            >
              <Text style={[styles.resetButtonText, { color: currentColors.primary }]}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ── MODAL ────────────────────────────────────────────────────────── */}
      <Modal transparent animationType="fade" visible={modalVisible} onRequestClose={closeModal}>
        <Pressable style={styles.overlay} onPress={closeModal}>
          <Animated.View
            style={[styles.popupCard, {
              backgroundColor: isDark ? "#0e0e0e" : "#fff",
              borderColor: selectedFood ? getCategoryColor(selectedFood.category) + "50" : currentColors.primary + "50",
              transform: [{ scale: scaleAnim }],
            }]}
          >
            {selectedFood && (() => {
              const catColor = getCategoryColor(selectedFood.category);
              return (
                <>
                  {/* Top strip */}
                  <View style={[styles.modalStrip, { backgroundColor: catColor }]} />

                  {/* Close */}
                  <TouchableOpacity
                    style={[styles.topCloseButton, { backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5" }]}
                    onPress={closeModal}
                  >
                    <Ionicons name="close" size={18} color={isDark ? "#555" : "#aaa"} />
                  </TouchableOpacity>

                  {/* Emoji */}
                  <View style={[styles.popupImageCard, { backgroundColor: catColor + "12", borderColor: catColor + "30" }]}>
                    <Text style={styles.popupEmoji}>{selectedFood.image || "🍗"}</Text>
                  </View>

                  <Text style={[styles.popupTitle, { color: currentColors.text }]}>{selectedFood.name}</Text>

                  <View style={[styles.popupCategoryBadge, { backgroundColor: catColor + "15", borderColor: catColor + "30" }]}>
                    <View style={[styles.modalCatDot, { backgroundColor: catColor }]} />
                    <Text style={[styles.popupCategoryText, { color: catColor }]}>{selectedFood.category}</Text>
                  </View>

                  {/* Calories banner */}
                  <View style={[styles.caloriesBanner, { backgroundColor: catColor + "08", borderColor: catColor + "25" }]}>
                    <Text style={[styles.caloriesLabel, { color: isDark ? "#555" : "#bbb" }]}>TOTAL CALORIES</Text>
                    <Text style={[styles.popupCalories, { color: catColor }]}>{selectedFood.calories}</Text>
                    <Text style={[styles.caloriesUnit, { color: isDark ? "#444" : "#ccc" }]}>kcal per 100g</Text>
                  </View>

                  {/* Macros */}
                  <View style={styles.macrosGrid}>
                    {[
                      { label: "💪 Protein", val: selectedFood.protein, color: "#FF6B6B", max: 40 },
                      { label: "⚡ Carbs",   val: selectedFood.carbs,   color: "#FFC107", max: 50 },
                      { label: "🥑 Fat",     val: selectedFood.fat,     color: "#FF9500", max: 30 },
                    ].map((m) => (
                      <View key={m.label} style={[styles.macroBox, {
                        backgroundColor: m.color + "08",
                        borderColor: m.color + "25",
                      }]}>
                        <Text style={[styles.macroLabel, { color: m.color }]}>{m.label}</Text>
                        <Text style={[styles.macroValue, { color: currentColors.text }]}>{m.val}</Text>
                        <View style={[styles.macroBarTrack, { backgroundColor: isDark ? "#1a1a1a" : "#f0f0f0" }]}>
                          <View style={[styles.macroBar, {
                            backgroundColor: m.color,
                            width: `${Math.min((getMacroPercentage(m.val) / m.max) * 100, 100)}%`,
                          }]} />
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* Tags */}
                  {selectedFood.tags && selectedFood.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                      {selectedFood.tags.map((tag: string, idx: number) => (
                        <View key={idx} style={[styles.tag, {
                          backgroundColor: catColor + "10",
                          borderColor: catColor + "25",
                        }]}>
                          <Text style={[styles.tagText, { color: catColor }]}>#{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Benefits */}
                  <View style={[styles.benefitContainer, { backgroundColor: isDark ? "#111" : "#fafafa", borderColor: isDark ? "#1e1e1e" : "#efefef" }]}>
                    <View style={styles.benefitHeader}>
                      <View style={[styles.benefitIconBox, { backgroundColor: catColor + "12" }]}>
                        <Text style={{ fontSize: 14 }}>✨</Text>
                      </View>
                      <Text style={[styles.benefitLabel, { color: catColor }]}>Benefits</Text>
                    </View>
                    <Text style={[styles.popupBenefit, { color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.65)" }]}>
                      {selectedFood.benefit}
                    </Text>
                  </View>

                  {/* CTA */}
                  <Animated.View style={[styles.actionButtons, { transform: [{ scale: buttonPulse }] }]}>
                    <TouchableOpacity
                      style={[styles.addButton, { shadowColor: catColor }]}
                      onPress={closeModal}
                      activeOpacity={0.85}
                    >
                      <LinearGradient
                        colors={[catColor, catColor + "cc"]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                      />
                      <Animated.View style={[styles.buttonGlow, {
                        opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.15] }),
                      }]} />
                      <Ionicons name="add-circle-outline" size={20} color={isDark ? "#000" : "#fff"} />
                      <Text style={[styles.addButtonText, { color: isDark ? "#000" : "#fff" }]}>
                        Add to Meal
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                </>
              );
            })()}
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── Top bar ────────────────────────────────────────────────────────────────
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: Platform.OS === "ios" ? 52 : 42,
    paddingBottom: 13,
    borderBottomWidth: 1,
    position: "relative",
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  topBarLine: { position: "absolute", top: 0, left: 0, right: 0, height: 2 },
  logoContainer: { flexDirection: "row", alignItems: "center", gap: 9 },
  logoIconWrapper: { width: 32, height: 32, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  logo: { fontSize: 20, fontWeight: "900", letterSpacing: 0.4 },
  logoUnderline: { height: 2, width: 22, borderRadius: 1, marginTop: 1 },
  topRightSection: { flexDirection: "row", alignItems: "center", gap: 10 },
  backButton: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 18, borderWidth: 1.5,
  },
  backText: { fontSize: 13, fontWeight: "700" },
  themeToggle: {
    width: 34, height: 34, borderRadius: 17,
    justifyContent: "center", alignItems: "center",
    ...Platform.select({
      ios: { shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.28, shadowRadius: 7 },
      android: { elevation: 5 },
    }),
  },

  // ── Header ─────────────────────────────────────────────────────────────────
  header: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 12 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  headerTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 5 },
  title: { fontSize: 28, fontWeight: "900", letterSpacing: -0.5 },
  titleEmoji: { fontSize: 26 },
  headerSubRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  headerPulse: { width: 6, height: 6, borderRadius: 3 },
  subtitle: { fontSize: 12, fontWeight: "600" },
  viewToggle: {
    width: 38, height: 38, borderRadius: 12,
    justifyContent: "center", alignItems: "center", borderWidth: 1.5,
  },

  // ── Search ─────────────────────────────────────────────────────────────────
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginHorizontal: 18,
    marginBottom: 10,
    borderWidth: 1.5,
  },
  searchIconBox: { width: 30, height: 30, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 11, fontWeight: "500" },
  clearButton: { padding: 4 },

  // ── Filter toggle ──────────────────────────────────────────────────────────
  filterToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 10,
    gap: 7,
  },
  filterToggleText: { fontSize: 13, fontWeight: "700", flex: 1 },
  filterActiveDot: { width: 6, height: 6, borderRadius: 3 },

  // ── Filters panel ──────────────────────────────────────────────────────────
  filtersPanel: {
    marginHorizontal: 18,
    marginBottom: 10,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  filterLabel: { fontSize: 9, fontWeight: "800", letterSpacing: 1.3, marginBottom: 10 },
  categoryChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5,
  },
  categoryEmoji: { fontSize: 15 },
  categoryChipText: { fontSize: 12, fontWeight: "700" },
  sortRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  sortChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 14, borderWidth: 1.5,
  },
  sortChipText: { fontSize: 12, fontWeight: "700" },

  // ── Scroll ─────────────────────────────────────────────────────────────────
  scrollContent: { paddingHorizontal: 18, paddingBottom: 30, paddingTop: 4 },
  listContainer: {},
  gridContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },

  // ── List food card ─────────────────────────────────────────────────────────
  foodCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1.5,
    marginBottom: 10,
    overflow: "hidden",
    position: "relative",
    paddingVertical: 14,
    paddingRight: 14,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  foodCardStrip: { width: 4, alignSelf: "stretch", marginRight: 12 },
  emojiBox: { width: 54, height: 54, borderRadius: 16, justifyContent: "center", alignItems: "center", marginRight: 12 },
  foodEmoji: { fontSize: 30 },
  foodInfo: { flex: 1 },
  foodName: { fontSize: 15, fontWeight: "800", marginBottom: 5 },
  catPill: {
    alignSelf: "flex-start",
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 10, borderWidth: 1, marginBottom: 6,
  },
  catPillText: { fontSize: 10, fontWeight: "700" },
  macroRow: { flexDirection: "row", gap: 8 },
  macroPill: { flexDirection: "row", alignItems: "center", gap: 3 },
  macroPillLabel: { fontSize: 10, fontWeight: "800" },
  macroPillVal: { fontSize: 10, fontWeight: "600" },
  foodCardRight: { alignItems: "flex-end", gap: 2 },
  foodCalories: { fontSize: 18, fontWeight: "900", letterSpacing: -0.5 },
  foodCalUnit: { fontSize: 9, fontWeight: "600", textTransform: "uppercase" },
  chevronBox: { width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center", marginTop: 4 },

  // ── Grid food card ─────────────────────────────────────────────────────────
  foodCardGrid: {
    width: (width - 46) / 2,
    borderRadius: 20, borderWidth: 1.5,
    overflow: "hidden", position: "relative",
    paddingBottom: 14, alignItems: "center",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  gridCardStrip: { width: "100%", height: 3, marginBottom: 12 },
  gridEmojiBox: { width: 60, height: 60, borderRadius: 18, justifyContent: "center", alignItems: "center", marginBottom: 10 },
  gridFoodEmoji: { fontSize: 34 },
  gridFoodName: { fontSize: 13, fontWeight: "800", textAlign: "center", marginBottom: 4, paddingHorizontal: 8 },
  gridCalories: { fontSize: 14, fontWeight: "800", marginBottom: 2 },
  gridProtein: { fontSize: 10, fontWeight: "600" },

  // ── Empty ──────────────────────────────────────────────────────────────────
  loadingContainer: { paddingVertical: 60, alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 13, fontWeight: "500" },
  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyEmoji: { fontSize: 56, marginBottom: 14, opacity: 0.25 },
  emptyText: { fontSize: 17, fontWeight: "700", marginBottom: 6 },
  emptySubtext: { fontSize: 13, fontWeight: "500", marginBottom: 20 },
  resetButton: { paddingHorizontal: 22, paddingVertical: 10, borderRadius: 14, borderWidth: 1.5 },
  resetButtonText: { fontSize: 13, fontWeight: "700" },

  // ── Modal overlay ──────────────────────────────────────────────────────────
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.88)", justifyContent: "center", alignItems: "center" },
  popupCard: {
    width: "92%",
    maxHeight: "88%",
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: "center",
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#39FF14", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 24 },
      android: { elevation: 10 },
    }),
  },
  modalStrip: { width: "100%", height: 4 },
  topCloseButton: {
    position: "absolute", top: 14, right: 14,
    width: 30, height: 30, borderRadius: 15,
    justifyContent: "center", alignItems: "center", zIndex: 10,
  },
  popupImageCard: {
    width: 100, height: 100, borderRadius: 22,
    justifyContent: "center", alignItems: "center",
    borderWidth: 1.5, marginBottom: 14, marginTop: 18,
  },
  popupEmoji: { fontSize: 54 },
  popupTitle: { fontSize: 24, fontWeight: "900", marginBottom: 8, textAlign: "center", paddingHorizontal: 20 },
  popupCategoryBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 14, borderWidth: 1, marginBottom: 14,
  },
  modalCatDot: { width: 6, height: 6, borderRadius: 3 },
  popupCategoryText: { fontSize: 12, fontWeight: "800" },
  caloriesBanner: {
    width: "90%", paddingVertical: 14,
    borderRadius: 18, alignItems: "center", marginBottom: 16, borderWidth: 1.5,
  },
  caloriesLabel: { fontSize: 9, fontWeight: "800", letterSpacing: 1.2, marginBottom: 4 },
  popupCalories: { fontSize: 36, fontWeight: "900", letterSpacing: -1 },
  caloriesUnit: { fontSize: 11, fontWeight: "600", marginTop: 2 },

  // Modal macros
  macrosGrid: { flexDirection: "row", width: "90%", justifyContent: "space-between", marginBottom: 14, gap: 8 },
  macroBox: { flex: 1, padding: 10, borderRadius: 16, borderWidth: 1.5, alignItems: "center" },
  macroLabel: { fontSize: 10, fontWeight: "700", marginBottom: 5, textAlign: "center" },
  macroValue: { fontSize: 17, fontWeight: "900", marginBottom: 8 },
  macroBarTrack: { width: "100%", height: 4, borderRadius: 2, overflow: "hidden" },
  macroBar: { height: "100%", borderRadius: 2 },

  // Tags
  tagsContainer: { flexDirection: "row", flexWrap: "wrap", width: "90%", marginBottom: 12, justifyContent: "center", gap: 6 },
  tag: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10, borderWidth: 1.5 },
  tagText: { fontSize: 10, fontWeight: "700" },

  // Benefits
  benefitContainer: { width: "90%", padding: 14, borderRadius: 16, borderWidth: 1.5, marginBottom: 18 },
  benefitHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  benefitIconBox: { width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  benefitLabel: { fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
  popupBenefit: { fontSize: 13, lineHeight: 20, fontWeight: "500" },

  // CTA
  actionButtons: { width: "90%", marginBottom: 6 },
  addButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: 15, borderRadius: 18, gap: 8,
    overflow: "hidden", position: "relative",
    ...Platform.select({
      ios: { shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14 },
      android: { elevation: 8 },
    }),
  },
  buttonGlow: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#fff" },
  addButtonText: { fontSize: 15, fontWeight: "900", letterSpacing: 0.3 },
});