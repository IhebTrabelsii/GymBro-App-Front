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
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { useSimpleTheme } from "../../context/SimpleThemeContext";

// Enable LayoutAnimation for Android
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const { width } = Dimensions.get("window");

const foods = [
  {
    name: "Chicken Breast",
    calories: 165,
    protein: "31g",
    carbs: "0g",
    fat: "3.6g",
    benefit: "Lean protein for muscle growth and recovery.",
    image: "🍗",
    category: "Protein",
    tags: ["high-protein", "low-carb", "lean"],
  },
  {
    name: "Eggs",
    calories: 155,
    protein: "13g",
    carbs: "1g",
    fat: "11g",
    benefit: "Complete protein with all essential amino acids.",
    image: "🥚",
    category: "Protein",
    tags: ["high-protein", "healthy-fats"],
  },
  {
    name: "Banana",
    calories: 89,
    protein: "1.1g",
    carbs: "23g",
    fat: "0.3g",
    benefit: "Fast energy and potassium for muscle function.",
    image: "🍌",
    category: "Fruit",
    tags: ["pre-workout", "energy"],
  },
  {
    name: "Salmon",
    calories: 208,
    protein: "20g",
    carbs: "0g",
    fat: "13g",
    benefit: "Rich in omega-3 fatty acids for heart health.",
    image: "🐟",
    category: "Protein",
    tags: ["high-protein", "omega-3", "healthy-fats"],
  },
  {
    name: "Sweet Potato",
    calories: 86,
    protein: "1.6g",
    carbs: "20g",
    fat: "0.1g",
    benefit: "Complex carbs for sustained energy release.",
    image: "🍠",
    category: "Carbs",
    tags: ["complex-carbs", "pre-workout"],
  },
  {
    name: "Avocado",
    calories: 160,
    protein: "2g",
    carbs: "9g",
    fat: "15g",
    benefit: "Healthy monounsaturated fats and fiber.",
    image: "🥑",
    category: "Fats",
    tags: ["healthy-fats", "fiber"],
  },
  {
    name: "Brown Rice",
    calories: 112,
    protein: "2.6g",
    carbs: "24g",
    fat: "0.9g",
    benefit: "Whole grain energy source with B vitamins.",
    image: "🍚",
    category: "Carbs",
    tags: ["complex-carbs", "energy"],
  },
  {
    name: "Greek Yogurt",
    calories: 100,
    protein: "17g",
    carbs: "6g",
    fat: "0.7g",
    benefit: "High protein with probiotics for gut health.",
    image: "🥛",
    category: "Protein",
    tags: ["high-protein", "probiotic", "low-fat"],
  },
  {
    name: "Almonds",
    calories: 164,
    protein: "6g",
    carbs: "6g",
    fat: "14g",
    benefit: "Nutrient-dense snack with vitamin E.",
    image: "🌰",
    category: "Fats",
    tags: ["healthy-fats", "snack"],
  },
  {
    name: "Spinach",
    calories: 23,
    protein: "2.9g",
    carbs: "3.6g",
    fat: "0.4g",
    benefit: "Iron and vitamins powerhouse for recovery.",
    image: "🥬",
    category: "Vegetables",
    tags: ["low-calorie", "vitamins"],
  },
  {
    name: "Oatmeal",
    calories: 150,
    protein: "5g",
    carbs: "27g",
    fat: "3g",
    benefit: "Fiber-rich breakfast for sustained energy.",
    image: "🥣",
    category: "Carbs",
    tags: ["fiber", "breakfast", "complex-carbs"],
  },
  {
    name: "Blueberries",
    calories: 57,
    protein: "0.7g",
    carbs: "14g",
    fat: "0.3g",
    benefit: "Antioxidants for recovery and brain health.",
    image: "🫐",
    category: "Fruit",
    tags: ["antioxidants", "low-calorie"],
  },
  {
    name: "Tuna",
    calories: 132,
    protein: "28g",
    carbs: "0g",
    fat: "1.3g",
    benefit: "Ultra lean protein source, perfect for cutting.",
    image: "🐟",
    category: "Protein",
    tags: ["high-protein", "low-fat", "lean"],
  },
  {
    name: "Quinoa",
    calories: 120,
    protein: "4.4g",
    carbs: "21g",
    fat: "1.9g",
    benefit: "Complete plant protein with all amino acids.",
    image: "🌾",
    category: "Carbs",
    tags: ["plant-protein", "complex-carbs"],
  },
  {
    name: "Broccoli",
    calories: 34,
    protein: "2.8g",
    carbs: "7g",
    fat: "0.4g",
    benefit: "High in vitamins C and K, low calorie.",
    image: "🥦",
    category: "Vegetables",
    tags: ["low-calorie", "vitamins", "fiber"],
  },
];

const categories = ["All", "Protein", "Carbs", "Fats", "Fruit", "Vegetables"];
const sortOptions = ["Name", "Calories", "Protein", "Carbs"];

export default function FoodScreen() {
  const router = useRouter();
  const { theme, toggleTheme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === "dark";

  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Name");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  // Animate header on mount
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

  // Filter and sort foods
  const processedFoods = useMemo(() => {
    let result = foods;

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (food) =>
          food.name.toLowerCase().includes(query) ||
          food.category.toLowerCase().includes(query) ||
          food.tags.some((tag) => tag.includes(query))
      );
    }

    // Filter by category
    if (selectedCategory !== "All") {
      result = result.filter((food) => food.category === selectedCategory);
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "Calories":
          return b.calories - a.calories;
        case "Protein":
          return parseFloat(b.protein) - parseFloat(a.protein);
        case "Carbs":
          return parseFloat(b.carbs) - parseFloat(a.carbs);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [searchQuery, selectedCategory, sortBy]);

  const openFood = (food: any) => {
    setSelectedFood(food);
    setModalVisible(true);
    scaleAnim.setValue(0);
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedFood(null);
    });
  };

  const toggleFilters = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilters(!showFilters);
  };

  const getCategoryIcon = (category: string) => {
    const icons: any = {
      All: "🌟",
      Protein: "💪",
      Carbs: "⚡",
      Fats: "🥑",
      Fruit: "🍎",
      Vegetables: "🥗",
    };
    return icons[category] || "📦";
  };

  // Calculate macros percentage
  const getMacroPercentage = (value: string) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      {/* Top Bar with Logo and Theme Toggle */}
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
        <TouchableOpacity onPress={() => router.replace("/")} activeOpacity={0.7}>
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
              <MaterialCommunityIcons name="dumbbell" size={24} color={currentColors.primary} />
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

      {/* Animated Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.title, { color: currentColors.primary }]}>
              Nutrition 🍎
            </Text>
            <Text
              style={[
                styles.subtitle,
                {
                  color: isDark
                    ? "rgba(255, 255, 255, 0.5)"
                    : "rgba(0, 0, 0, 0.45)",
                },
              ]}
            >
              {processedFoods.length} food{processedFoods.length !== 1 ? "s" : ""}{" "}
              available
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.viewToggle,
              {
                backgroundColor: isDark ? currentColors.card : "#F5F5F5",
                borderColor: isDark
                  ? "rgba(57, 255, 20, 0.3)"
                  : "rgba(57, 255, 20, 0.2)",
              },
            ]}
            onPress={() => {
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut
              );
              setViewMode(viewMode === "list" ? "grid" : "list");
            }}
          >
            <Ionicons
              name={viewMode === "list" ? "grid-outline" : "list-outline"}
              size={20}
              color={currentColors.primary}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: isDark ? currentColors.card : "#F5F5F5",
            borderColor: isDark
              ? "rgba(57, 255, 20, 0.2)"
              : "rgba(57, 255, 20, 0.15)",
          },
        ]}
      >
        <Ionicons
          name="search"
          size={18}
          color={isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.3)"}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { color: currentColors.text }]}
          placeholder="Search foods, categories, or tags..."
          placeholderTextColor={
            isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)"
          }
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            style={styles.clearButton}
          >
            <Ionicons
              name="close-circle"
              size={18}
              color={isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.3)"}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Toggle Button */}
      <TouchableOpacity
        style={[
          styles.filterButton,
          {
            backgroundColor: isDark ? currentColors.card : "#F5F5F5",
            borderColor: isDark
              ? "rgba(57, 255, 20, 0.2)"
              : "rgba(57, 255, 20, 0.15)",
          },
        ]}
        onPress={toggleFilters}
      >
        <Ionicons
          name={showFilters ? "chevron-up" : "chevron-down"}
          size={18}
          color={currentColors.primary}
        />
        <Text style={[styles.filterButtonText, { color: currentColors.primary }]}>
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Text>
        {(selectedCategory !== "All" || sortBy !== "Name") && (
          <View
            style={[styles.activeFilterDot, { backgroundColor: currentColors.primary }]}
          />
        )}
      </TouchableOpacity>

      {/* Filters Section */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          {/* Categories */}
          <Text
            style={[
              styles.filterLabel,
              {
                color: isDark
                  ? "rgba(255, 255, 255, 0.5)"
                  : "rgba(0, 0, 0, 0.45)",
              },
            ]}
          >
            CATEGORY
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor:
                      selectedCategory === category
                        ? isDark
                          ? "rgba(57, 255, 20, 0.15)"
                          : "rgba(57, 255, 20, 0.1)"
                        : isDark
                        ? currentColors.card
                        : "#F5F5F5",
                    borderColor:
                      selectedCategory === category
                        ? currentColors.primary
                        : isDark
                        ? "rgba(57, 255, 20, 0.2)"
                        : "rgba(57, 255, 20, 0.15)",
                  },
                ]}
                onPress={() => {
                  LayoutAnimation.configureNext(
                    LayoutAnimation.Presets.easeInEaseOut
                  );
                  setSelectedCategory(category);
                }}
              >
                <Text style={styles.categoryIcon}>
                  {getCategoryIcon(category)}
                </Text>
                <Text
                  style={[
                    styles.categoryChipText,
                    {
                      color:
                        selectedCategory === category
                          ? currentColors.primary
                          : isDark
                          ? "rgba(255, 255, 255, 0.6)"
                          : "rgba(0, 0, 0, 0.5)",
                    },
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Sort Options */}
          <Text
            style={[
              styles.filterLabel,
              {
                color: isDark
                  ? "rgba(255, 255, 255, 0.5)"
                  : "rgba(0, 0, 0, 0.45)",
              },
            ]}
          >
            SORT BY
          </Text>
          <View style={styles.sortContainer}>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.sortChip,
                  {
                    backgroundColor:
                      sortBy === option
                        ? isDark
                          ? "rgba(57, 255, 20, 0.15)"
                          : "rgba(57, 255, 20, 0.1)"
                        : isDark
                        ? currentColors.card
                        : "#F5F5F5",
                    borderColor:
                      sortBy === option
                        ? currentColors.primary
                        : isDark
                        ? "rgba(57, 255, 20, 0.2)"
                        : "rgba(57, 255, 20, 0.15)",
                  },
                ]}
                onPress={() => {
                  LayoutAnimation.configureNext(
                    LayoutAnimation.Presets.easeInEaseOut
                  );
                  setSortBy(option);
                }}
              >
                <Text
                  style={[
                    styles.sortChipText,
                    {
                      color:
                        sortBy === option
                          ? currentColors.primary
                          : isDark
                          ? "rgba(255, 255, 255, 0.6)"
                          : "rgba(0, 0, 0, 0.5)",
                    },
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Food List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {processedFoods.length > 0 ? (
          <View
            style={
              viewMode === "grid" ? styles.gridContainer : styles.listContainer
            }
          >
            {processedFoods.map((food, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  viewMode === "grid" ? styles.foodCardGrid : styles.foodCard,
                  {
                    backgroundColor: isDark ? currentColors.card : "#FFFFFF",
                    borderColor: isDark
                      ? "rgba(57, 255, 20, 0.2)"
                      : "rgba(57, 255, 20, 0.15)",
                  },
                ]}
                onPress={() => openFood(food)}
                activeOpacity={0.7}
              >
                {viewMode === "list" ? (
                  <>
                    {/* List View */}
                    <View
                      style={[
                        styles.imageCard,
                        {
                          backgroundColor: isDark
                            ? "rgba(57, 255, 20, 0.08)"
                            : "rgba(57, 255, 20, 0.05)",
                          borderColor: isDark
                            ? "rgba(57, 255, 20, 0.25)"
                            : "rgba(57, 255, 20, 0.2)",
                        },
                      ]}
                    >
                      <Text style={styles.foodEmoji}>{food.image}</Text>
                    </View>

                    <View style={styles.foodInfo}>
                      <View style={styles.foodHeader}>
                        <Text style={[styles.foodName, { color: currentColors.text }]}>
                          {food.name}
                        </Text>
                      </View>
                      <View style={styles.categoryBadgeContainer}>
                        <View
                          style={[
                            styles.categoryBadge,
                            {
                              backgroundColor: isDark
                                ? "rgba(57, 255, 20, 0.15)"
                                : "rgba(57, 255, 20, 0.1)",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.categoryText,
                              { color: currentColors.primary },
                            ]}
                          >
                            {food.category}
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={[
                          styles.foodCalories,
                          { color: currentColors.primary },
                        ]}
                      >
                        {food.calories} kcal
                      </Text>
                      <View style={styles.macroRow}>
                        <Text
                          style={[
                            styles.macroText,
                            {
                              color: isDark
                                ? "rgba(255, 255, 255, 0.5)"
                                : "rgba(0, 0, 0, 0.45)",
                            },
                          ]}
                        >
                          P: {food.protein}
                        </Text>
                        <Text
                          style={[
                            styles.macroDivider,
                            {
                              color: isDark
                                ? "rgba(255, 255, 255, 0.2)"
                                : "rgba(0, 0, 0, 0.15)",
                            },
                          ]}
                        >
                          •
                        </Text>
                        <Text
                          style={[
                            styles.macroText,
                            {
                              color: isDark
                                ? "rgba(255, 255, 255, 0.5)"
                                : "rgba(0, 0, 0, 0.45)",
                            },
                          ]}
                        >
                          C: {food.carbs}
                        </Text>
                        <Text
                          style={[
                            styles.macroDivider,
                            {
                              color: isDark
                                ? "rgba(255, 255, 255, 0.2)"
                                : "rgba(0, 0, 0, 0.15)",
                            },
                          ]}
                        >
                          •
                        </Text>
                        <Text
                          style={[
                            styles.macroText,
                            {
                              color: isDark
                                ? "rgba(255, 255, 255, 0.5)"
                                : "rgba(0, 0, 0, 0.45)",
                            },
                          ]}
                        >
                          F: {food.fat}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.arrowContainer}>
                      <Ionicons
                        name="chevron-forward"
                        size={24}
                        color={
                          isDark
                            ? "rgba(57, 255, 20, 0.4)"
                            : "rgba(57, 255, 20, 0.3)"
                        }
                      />
                    </View>
                  </>
                ) : (
                  <>
                    {/* Grid View */}
                    <View
                      style={[
                        styles.gridImageCard,
                        {
                          backgroundColor: isDark
                            ? "rgba(57, 255, 20, 0.08)"
                            : "rgba(57, 255, 20, 0.05)",
                          borderColor: isDark
                            ? "rgba(57, 255, 20, 0.25)"
                            : "rgba(57, 255, 20, 0.2)",
                        },
                      ]}
                    >
                      <Text style={styles.gridFoodEmoji}>{food.image}</Text>
                    </View>
                    <Text
                      style={[styles.gridFoodName, { color: currentColors.text }]}
                    >
                      {food.name}
                    </Text>
                    <Text
                      style={[styles.gridCalories, { color: currentColors.primary }]}
                    >
                      {food.calories} kcal
                    </Text>
                    <View style={styles.gridMacros}>
                      <Text
                        style={[
                          styles.gridMacroText,
                          {
                            color: isDark
                              ? "rgba(255, 255, 255, 0.5)"
                              : "rgba(0, 0, 0, 0.45)",
                          },
                        ]}
                      >
                        P:{food.protein}
                      </Text>
                    </View>
                  </>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text
              style={[
                styles.emptyText,
                {
                  color: isDark
                    ? "rgba(255, 255, 255, 0.5)"
                    : "rgba(0, 0, 0, 0.45)",
                },
              ]}
            >
              No foods found
            </Text>
            <Text
              style={[
                styles.emptySubtext,
                {
                  color: isDark
                    ? "rgba(255, 255, 255, 0.3)"
                    : "rgba(0, 0, 0, 0.25)",
                },
              ]}
            >
              Try adjusting your filters or search
            </Text>
            <TouchableOpacity
              style={[
                styles.resetButton,
                {
                  backgroundColor: isDark
                    ? "rgba(57, 255, 20, 0.15)"
                    : "rgba(57, 255, 20, 0.1)",
                  borderColor: currentColors.primary,
                },
              ]}
              onPress={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setSortBy("Name");
              }}
            >
              <Text
                style={[
                  styles.resetButtonText,
                  { color: currentColors.primary },
                ]}
              >
                Reset Filters
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Enhanced Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <Pressable style={styles.overlay} onPress={closeModal}>
          <Animated.View
            style={[
              styles.popupCard,
              {
                backgroundColor: isDark ? currentColors.card : "#FFFFFF",
                borderColor: currentColors.primary,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {selectedFood && (
              <>
                {/* Close button at top right */}
                <TouchableOpacity
                  style={[
                    styles.topCloseButton,
                    {
                      backgroundColor: isDark
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(0, 0, 0, 0.05)",
                    },
                  ]}
                  onPress={closeModal}
                >
                  <Ionicons
                    name="close"
                    size={20}
                    color={
                      isDark
                        ? "rgba(255, 255, 255, 0.6)"
                        : "rgba(0, 0, 0, 0.5)"
                    }
                  />
                </TouchableOpacity>

                {/* Food Image */}
                <View
                  style={[
                    styles.popupImageCard,
                    {
                      backgroundColor: isDark
                        ? "rgba(57, 255, 20, 0.1)"
                        : "rgba(57, 255, 20, 0.05)",
                      borderColor: isDark
                        ? "rgba(57, 255, 20, 0.3)"
                        : "rgba(57, 255, 20, 0.2)",
                    },
                  ]}
                >
                  <Text style={styles.popupEmoji}>{selectedFood.image}</Text>
                </View>

                <Text style={[styles.popupTitle, { color: currentColors.text }]}>
                  {selectedFood.name}
                </Text>

                <View
                  style={[
                    styles.popupCategoryBadge,
                    {
                      backgroundColor: isDark
                        ? "rgba(57, 255, 20, 0.15)"
                        : "rgba(57, 255, 20, 0.1)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.popupCategoryText,
                      { color: currentColors.primary },
                    ]}
                  >
                    {selectedFood.category}
                  </Text>
                </View>

                <View
                  style={[
                    styles.caloriesBanner,
                    {
                      backgroundColor: isDark
                        ? "rgba(57, 255, 20, 0.08)"
                        : "rgba(57, 255, 20, 0.04)",
                      borderColor: isDark
                        ? "rgba(57, 255, 20, 0.25)"
                        : "rgba(57, 255, 20, 0.15)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.caloriesLabel,
                      {
                        color: isDark
                          ? "rgba(255, 255, 255, 0.5)"
                          : "rgba(0, 0, 0, 0.45)",
                      },
                    ]}
                  >
                    Total Calories
                  </Text>
                  <Text
                    style={[
                      styles.popupCalories,
                      { color: currentColors.primary },
                    ]}
                  >
                    {selectedFood.calories}
                  </Text>
                  <Text
                    style={[
                      styles.caloriesUnit,
                      {
                        color: isDark
                          ? "rgba(255, 255, 255, 0.4)"
                          : "rgba(0, 0, 0, 0.35)",
                      },
                    ]}
                  >
                    kcal
                  </Text>
                </View>

                {/* Macros Grid with Progress Bars */}
                <View style={styles.macrosGrid}>
                  <View
                    style={[
                      styles.macroBox,
                      {
                        backgroundColor: isDark
                          ? "rgba(57, 255, 20, 0.06)"
                          : "rgba(57, 255, 20, 0.03)",
                        borderColor: isDark
                          ? "rgba(57, 255, 20, 0.2)"
                          : "rgba(57, 255, 20, 0.15)",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.macroLabel,
                        {
                          color: isDark
                            ? "rgba(255, 255, 255, 0.5)"
                            : "rgba(0, 0, 0, 0.45)",
                        },
                      ]}
                    >
                      💪 Protein
                    </Text>
                    <Text style={[styles.macroValue, { color: currentColors.text }]}>
                      {selectedFood.protein}
                    </Text>
                    <View
                      style={[
                        styles.macroBarContainer,
                        {
                          backgroundColor: isDark
                            ? "rgba(0, 0, 0, 0.3)"
                            : "rgba(0, 0, 0, 0.08)",
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.macroBar,
                          {
                            width: `${Math.min(
                              (getMacroPercentage(selectedFood.protein) / 40) *
                                100,
                              100
                            )}%`,
                            backgroundColor: "#39FF14",
                          },
                        ]}
                      />
                    </View>
                  </View>
                  <View
                    style={[
                      styles.macroBox,
                      {
                        backgroundColor: isDark
                          ? "rgba(57, 255, 20, 0.06)"
                          : "rgba(57, 255, 20, 0.03)",
                        borderColor: isDark
                          ? "rgba(57, 255, 20, 0.2)"
                          : "rgba(57, 255, 20, 0.15)",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.macroLabel,
                        {
                          color: isDark
                            ? "rgba(255, 255, 255, 0.5)"
                            : "rgba(0, 0, 0, 0.45)",
                        },
                      ]}
                    >
                      ⚡ Carbs
                    </Text>
                    <Text style={[styles.macroValue, { color: currentColors.text }]}>
                      {selectedFood.carbs}
                    </Text>
                    <View
                      style={[
                        styles.macroBarContainer,
                        {
                          backgroundColor: isDark
                            ? "rgba(0, 0, 0, 0.3)"
                            : "rgba(0, 0, 0, 0.08)",
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.macroBar,
                          {
                            width: `${Math.min(
                              (getMacroPercentage(selectedFood.carbs) / 50) *
                                100,
                              100
                            )}%`,
                            backgroundColor: "#00D9FF",
                          },
                        ]}
                      />
                    </View>
                  </View>
                  <View
                    style={[
                      styles.macroBox,
                      {
                        backgroundColor: isDark
                          ? "rgba(57, 255, 20, 0.06)"
                          : "rgba(57, 255, 20, 0.03)",
                        borderColor: isDark
                          ? "rgba(57, 255, 20, 0.2)"
                          : "rgba(57, 255, 20, 0.15)",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.macroLabel,
                        {
                          color: isDark
                            ? "rgba(255, 255, 255, 0.5)"
                            : "rgba(0, 0, 0, 0.45)",
                        },
                      ]}
                    >
                      🥑 Fat
                    </Text>
                    <Text style={[styles.macroValue, { color: currentColors.text }]}>
                      {selectedFood.fat}
                    </Text>
                    <View
                      style={[
                        styles.macroBarContainer,
                        {
                          backgroundColor: isDark
                            ? "rgba(0, 0, 0, 0.3)"
                            : "rgba(0, 0, 0, 0.08)",
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.macroBar,
                          {
                            width: `${Math.min(
                              (getMacroPercentage(selectedFood.fat) / 30) * 100,
                              100
                            )}%`,
                            backgroundColor: "#FF6B35",
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>

                {/* Tags */}
                {selectedFood.tags && (
                  <View style={styles.tagsContainer}>
                    {selectedFood.tags.map((tag: string, idx: number) => (
                      <View
                        key={idx}
                        style={[
                          styles.tag,
                          {
                            backgroundColor: isDark
                              ? "rgba(57, 255, 20, 0.1)"
                              : "rgba(57, 255, 20, 0.06)",
                            borderColor: isDark
                              ? "rgba(57, 255, 20, 0.2)"
                              : "rgba(57, 255, 20, 0.15)",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.tagText,
                            { color: currentColors.primary },
                          ]}
                        >
                          #{tag}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Benefits */}
                <View
                  style={[
                    styles.benefitContainer,
                    {
                      backgroundColor: isDark
                        ? "rgba(57, 255, 20, 0.06)"
                        : "rgba(57, 255, 20, 0.03)",
                      borderColor: isDark
                        ? "rgba(57, 255, 20, 0.2)"
                        : "rgba(57, 255, 20, 0.15)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.benefitLabel,
                      { color: currentColors.primary },
                    ]}
                  >
                    ✨ Benefits
                  </Text>
                  <Text
                    style={[
                      styles.popupBenefit,
                      {
                        color: isDark
                          ? "rgba(255, 255, 255, 0.8)"
                          : "rgba(0, 0, 0, 0.7)",
                      },
                    ]}
                  >
                    {selectedFood.benefit}
                  </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[
                      styles.addButton,
                      {
                        backgroundColor: currentColors.primary,
                        shadowColor: currentColors.primary,
                      },
                    ]}
                    onPress={closeModal}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.addButtonText,
                        {
                          color: isDark ? currentColors.background : "#FFFFFF",
                        },
                      ]}
                    >
                      Add to Meal
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Animated.View>
        </Pressable>
      </Modal>
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

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 6,
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 14,
    fontWeight: "500",
  },

  viewToggle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
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

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1.5,
  },

  searchIcon: {
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 14,
  },

  clearButton: {
    padding: 4,
  },

  filterButton: {
    marginHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  filterButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },

  activeFilterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4,
  },

  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },

  filterLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 10,
    letterSpacing: 1,
  },

  categoryScroll: {
    marginBottom: 16,
  },

  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1.5,
  },

  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },

  categoryChipText: {
    fontSize: 13,
    fontWeight: "600",
  },

  sortContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },

  sortChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1.5,
  },

  sortChipText: {
    fontSize: 13,
    fontWeight: "600",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  listContainer: {
    flex: 1,
  },

  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  foodCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  foodCardGrid: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1.5,
    width: (width - 52) / 2,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  imageCard: {
    width: 70,
    height: 70,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    marginRight: 14,
  },

  gridImageCard: {
    width: "100%",
    height: 80,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    marginBottom: 12,
  },

  foodEmoji: {
    fontSize: 36,
  },

  gridFoodEmoji: {
    fontSize: 42,
  },

  foodInfo: {
    flex: 1,
  },

  foodHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  foodName: {
    fontSize: 17,
    fontWeight: "700",
  },

  gridFoodName: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },

  categoryBadgeContainer: {
    marginBottom: 6,
  },

  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },

  categoryText: {
    fontSize: 11,
    fontWeight: "700",
  },

  foodCalories: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },

  gridCalories: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },

  macroRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  gridMacros: {
    alignItems: "center",
  },

  macroText: {
    fontSize: 13,
    fontWeight: "500",
  },

  gridMacroText: {
    fontSize: 12,
    fontWeight: "500",
  },

  macroDivider: {
    marginHorizontal: 8,
    fontSize: 12,
  },

  arrowContainer: {
    marginLeft: 8,
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },

  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.3,
  },

  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },

  emptySubtext: {
    fontSize: 14,
    marginBottom: 20,
  },

  resetButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },

  resetButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },

  popupCard: {
    width: "92%",
    maxHeight: "85%",
    borderRadius: 28,
    padding: 24,
    borderWidth: 2,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#39FF14",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
      },
      android: {
        elevation: 10,
      },
    }),
  },

  topCloseButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },

  popupImageCard: {
    width: 110,
    height: 110,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    marginBottom: 16,
    marginTop: 20,
  },

  popupEmoji: {
    fontSize: 60,
  },

  popupTitle: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },

  popupCategoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 16,
  },

  popupCategoryText: {
    fontSize: 13,
    fontWeight: "700",
  },

  caloriesBanner: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1.5,
  },

  caloriesLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  popupCalories: {
    fontSize: 32,
    fontWeight: "800",
  },

  caloriesUnit: {
    fontSize: 14,
    marginTop: 2,
  },

  macrosGrid: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  macroBox: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    marginHorizontal: 4,
    borderWidth: 1.5,
    alignItems: "center",
  },

  macroLabel: {
    fontSize: 11,
    marginBottom: 6,
    fontWeight: "700",
  },

  macroValue: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },

  macroBarContainer: {
    width: "100%",
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },

  macroBar: {
    height: "100%",
    borderRadius: 2,
  },

  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    marginBottom: 16,
    justifyContent: "center",
  },

  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    margin: 3,
    borderWidth: 1.5,
  },

  tagText: {
    fontSize: 11,
    fontWeight: "600",
  },

  benefitContainer: {
    width: "100%",
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1.5,
  },

  benefitLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  popupBenefit: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
  },

  actionButtons: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
  },

  addButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },

  addButtonText: {
    fontWeight: "800",
    fontSize: 16,
  },
});