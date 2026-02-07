import Clock from "@/components/clock";
import { Colors } from "@/constants/Colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import {
  Alert,
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSimpleTheme } from "../../context/SimpleThemeContext";

export default function CalculatorScreen() {
  const { theme, toggleTheme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === "dark";

  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [activityLevel, setActivityLevel] = useState("1.2");
  const [results, setResults] = useState<{
    bmi?: number;
    bmr?: number;
    calories?: number;
  }>({});

  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  const calculate = () => {
    const ageNum = parseInt(age);
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (!ageNum || !weightNum || !heightNum) {
      Alert.alert(
        "Validation Error",
        "Please fill in all fields with valid numbers",
      );
      return;
    }

    const heightMeters = heightNum / 100;
    const bmi = weightNum / (heightMeters * heightMeters);

    let bmr;
    if (gender === "male") {
      bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5;
    } else {
      bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;
    }

    const calories = bmr * parseFloat(activityLevel);

    setResults({
      bmi: parseFloat(bmi.toFixed(2)),
      bmr: parseFloat(bmr.toFixed(2)),
      calories: parseFloat(calories.toFixed(2)),
    });

    // Animate results
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { text: "Underweight", color: "#3B82F6" };
    if (bmi < 25) return { text: "Normal", color: currentColors.primary };
    if (bmi < 30) return { text: "Overweight", color: "#F59E0B" };
    return { text: "Obese", color: "#EF4444" };
  };

  return (
    <View
      style={[styles.container, { backgroundColor: currentColors.background }]}
    >
      {/* Enhanced Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: isDark
              ? "rgba(18, 18, 18, 0.95)"
              : "rgba(255, 255, 255, 0.95)",
            borderBottomColor: isDark
              ? "rgba(57, 255, 20, 0.2)"
              : "rgba(57, 255, 20, 0.15)",
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.headerIconWrapper,
              {
                backgroundColor: isDark
                  ? "rgba(57, 255, 20, 0.15)"
                  : "rgba(57, 255, 20, 0.1)",
              },
            ]}
          >
            <Ionicons
              name="calculator"
              size={22}
              color={currentColors.primary}
            />
          </View>
          <Text style={[styles.title, { color: currentColors.text }]}>
            Calculator
          </Text>
        </View>

        <View style={styles.headerRight}>
          <Clock style={{ marginRight: 12 }} />

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
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Card */}
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: isDark ? currentColors.card : "#FFFFFF",
              borderColor: currentColors.primary,
            },
          ]}
        >
          <View
            style={[
              styles.infoIconWrapper,
              {
                backgroundColor: isDark
                  ? "rgba(57, 255, 20, 0.15)"
                  : "rgba(57, 255, 20, 0.1)",
              },
            ]}
          >
            <MaterialCommunityIcons
              name="information"
              size={24}
              color={currentColors.primary}
            />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={[styles.infoTitle, { color: currentColors.text }]}>
              Calculate Your Metrics
            </Text>
            <Text
              style={[
                styles.infoSubtitle,
                {
                  color: isDark ? "rgba(255, 255, 255, 0.6)" : "#666",
                },
              ]}
            >
              Get your BMI, BMR, and daily calorie needs
            </Text>
          </View>
        </View>

        {/* Age Input */}
        <View style={styles.inputWrapper}>
          <Text style={[styles.inputLabel, { color: currentColors.text }]}>
            Age
          </Text>
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: isDark ? currentColors.card : "#FFFFFF",
                borderColor: isDark
                  ? "rgba(57, 255, 20, 0.2)"
                  : "rgba(0, 0, 0, 0.1)",
              },
            ]}
          >
            <View
              style={[
                styles.inputIconWrapper,
                {
                  backgroundColor: isDark
                    ? "rgba(57, 255, 20, 0.1)"
                    : "rgba(57, 255, 20, 0.08)",
                },
              ]}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={currentColors.primary}
              />
            </View>
            <TextInput
              style={[styles.input, { color: currentColors.text }]}
              placeholder="Enter your age"
              placeholderTextColor={isDark ? "#888" : "#999"}
              keyboardType="numeric"
              value={age}
              onChangeText={setAge}
            />
            <Text
              style={[styles.inputUnit, { color: isDark ? "#888" : "#999" }]}
            >
              years
            </Text>
          </View>
        </View>

        {/* Gender Picker */}
        <View style={styles.inputWrapper}>
          <Text style={[styles.inputLabel, { color: currentColors.text }]}>
            Gender
          </Text>
          <View
            style={[
              styles.pickerContainer,
              {
                backgroundColor: isDark ? currentColors.card : "#FFFFFF",
                borderColor: isDark
                  ? "rgba(57, 255, 20, 0.2)"
                  : "rgba(0, 0, 0, 0.1)",
              },
            ]}
          >
            <View
              style={[
                styles.inputIconWrapper,
                {
                  backgroundColor: isDark
                    ? "rgba(57, 255, 20, 0.1)"
                    : "rgba(57, 255, 20, 0.08)",
                },
              ]}
            >
              <Ionicons
                name="male-female-outline"
                size={20}
                color={currentColors.primary}
              />
            </View>
            <Picker
              selectedValue={gender}
              onValueChange={(itemValue) => setGender(itemValue)}
              style={[styles.picker, { color: currentColors.text }]}
              dropdownIconColor={currentColors.primary}
            >
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
            </Picker>
          </View>
        </View>

        {/* Weight Input */}
        <View style={styles.inputWrapper}>
          <Text style={[styles.inputLabel, { color: currentColors.text }]}>
            Weight
          </Text>
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: isDark ? currentColors.card : "#FFFFFF",
                borderColor: isDark
                  ? "rgba(57, 255, 20, 0.2)"
                  : "rgba(0, 0, 0, 0.1)",
              },
            ]}
          >
            <View
              style={[
                styles.inputIconWrapper,
                {
                  backgroundColor: isDark
                    ? "rgba(57, 255, 20, 0.1)"
                    : "rgba(57, 255, 20, 0.08)",
                },
              ]}
            >
              <Ionicons
                name="barbell-outline"
                size={20}
                color={currentColors.primary}
              />
            </View>
            <TextInput
              style={[styles.input, { color: currentColors.text }]}
              placeholder="Enter your weight"
              placeholderTextColor={isDark ? "#888" : "#999"}
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />
            <Text
              style={[styles.inputUnit, { color: isDark ? "#888" : "#999" }]}
            >
              kg
            </Text>
          </View>
        </View>

        {/* Height Input */}
        <View style={styles.inputWrapper}>
          <Text style={[styles.inputLabel, { color: currentColors.text }]}>
            Height
          </Text>
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: isDark ? currentColors.card : "#FFFFFF",
                borderColor: isDark
                  ? "rgba(57, 255, 20, 0.2)"
                  : "rgba(0, 0, 0, 0.1)",
              },
            ]}
          >
            <View
              style={[
                styles.inputIconWrapper,
                {
                  backgroundColor: isDark
                    ? "rgba(57, 255, 20, 0.1)"
                    : "rgba(57, 255, 20, 0.08)",
                },
              ]}
            >
              <Ionicons
                name="resize-outline"
                size={20}
                color={currentColors.primary}
              />
            </View>
            <TextInput
              style={[styles.input, { color: currentColors.text }]}
              placeholder="Enter your height"
              placeholderTextColor={isDark ? "#888" : "#999"}
              keyboardType="numeric"
              value={height}
              onChangeText={setHeight}
            />
            <Text
              style={[styles.inputUnit, { color: isDark ? "#888" : "#999" }]}
            >
              cm
            </Text>
          </View>
        </View>

        {/* Activity Level Picker */}
        <View style={styles.inputWrapper}>
          <Text style={[styles.inputLabel, { color: currentColors.text }]}>
            Activity Level
          </Text>
          <View
            style={[
              styles.pickerContainer,
              {
                backgroundColor: isDark ? currentColors.card : "#FFFFFF",
                borderColor: isDark
                  ? "rgba(57, 255, 20, 0.2)"
                  : "rgba(0, 0, 0, 0.1)",
              },
            ]}
          >
            <View
              style={[
                styles.inputIconWrapper,
                {
                  backgroundColor: isDark
                    ? "rgba(57, 255, 20, 0.1)"
                    : "rgba(57, 255, 20, 0.08)",
                },
              ]}
            >
              <Ionicons
                name="fitness-outline"
                size={20}
                color={currentColors.primary}
              />
            </View>
            <Picker
              selectedValue={activityLevel}
              onValueChange={(itemValue) => setActivityLevel(itemValue)}
              style={[styles.picker, { color: currentColors.text }]}
              dropdownIconColor={currentColors.primary}
            >
              <Picker.Item label="Sedentary (little exercise)" value="1.2" />
              <Picker.Item label="Lightly active" value="1.375" />
              <Picker.Item label="Moderately active" value="1.55" />
              <Picker.Item label="Very active" value="1.725" />
              <Picker.Item label="Extra active" value="1.9" />
            </Picker>
          </View>
        </View>

        {/* Calculate Button */}
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: currentColors.primary,
              shadowColor: currentColors.primary,
            },
          ]}
          onPress={calculate}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons
            name="calculator-variant"
            size={24}
            color={isDark ? currentColors.background : "#FFFFFF"}
          />
          <Text
            style={[
              styles.buttonText,
              {
                color: isDark ? currentColors.background : "#FFFFFF",
              },
            ]}
          >
            Calculate Metrics
          </Text>
          <Ionicons
            name="arrow-forward"
            size={20}
            color={isDark ? currentColors.background : "#FFFFFF"}
          />
        </TouchableOpacity>

        {/* Enhanced Results */}
        {results.bmi && (
          <Animated.View
            style={[
              styles.resultsContainer,
              {
                backgroundColor: isDark ? currentColors.card : "#FFFFFF",
                borderColor: currentColors.primary,
                shadowColor: currentColors.primary,
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.resultHeader}>
              <View
                style={[
                  styles.resultHeaderIcon,
                  {
                    backgroundColor: isDark
                      ? "rgba(57, 255, 20, 0.15)"
                      : "rgba(57, 255, 20, 0.1)",
                  },
                ]}
              >
                <Ionicons
                  name="stats-chart"
                  size={28}
                  color={currentColors.primary}
                />
              </View>
              <View>
                <Text
                  style={[styles.resultTitle, { color: currentColors.text }]}
                >
                  Your Results
                </Text>
                <Text
                  style={[
                    styles.resultSubtitle,
                    {
                      color: isDark ? "rgba(255, 255, 255, 0.5)" : "#999",
                    },
                  ]}
                >
                  Based on your inputs
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.divider,
                {
                  backgroundColor: isDark
                    ? "rgba(57, 255, 20, 0.2)"
                    : "rgba(57, 255, 20, 0.15)",
                },
              ]}
            />

            {/* BMI Card */}
            <View
              style={[
                styles.metricCard,
                {
                  backgroundColor: isDark
                    ? "rgba(57, 255, 20, 0.05)"
                    : "rgba(57, 255, 20, 0.03)",
                  borderColor: getBMICategory(results.bmi!).color,
                },
              ]}
            >
              <View style={styles.metricHeader}>
                <View
                  style={[
                    styles.metricIconWrapper,
                    {
                      backgroundColor: isDark
                        ? "rgba(57, 255, 20, 0.15)"
                        : "rgba(57, 255, 20, 0.1)",
                    },
                  ]}
                >
                  <Ionicons
                    name="body-outline"
                    size={24}
                    color={currentColors.primary}
                  />
                </View>
                <View style={styles.metricInfo}>
                  <Text
                    style={[
                      styles.metricLabel,
                      {
                        color: isDark ? currentColors.text : "#666",
                      },
                    ]}
                  >
                    Body Mass Index
                  </Text>
                  <View style={styles.metricValueRow}>
                    <Text
                      style={[
                        styles.metricValue,
                        { color: currentColors.text },
                      ]}
                    >
                      {results.bmi}
                    </Text>
                    <View
                      style={[
                        styles.categoryBadge,
                        {
                          backgroundColor: getBMICategory(results.bmi!).color,
                        },
                      ]}
                    >
                      <Text style={styles.categoryText}>
                        {getBMICategory(results.bmi!).text}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* BMR Card */}
            <View
              style={[
                styles.metricCard,
                {
                  backgroundColor: isDark
                    ? "rgba(255, 107, 107, 0.05)"
                    : "rgba(255, 107, 107, 0.03)",
                  borderColor: "rgba(255, 107, 107, 0.3)",
                },
              ]}
            >
              <View style={styles.metricHeader}>
                <View
                  style={[
                    styles.metricIconWrapper,
                    {
                      backgroundColor: "rgba(255, 107, 107, 0.15)",
                    },
                  ]}
                >
                  <Ionicons name="flame-outline" size={24} color="#FF6B6B" />
                </View>
                <View style={styles.metricInfo}>
                  <Text
                    style={[
                      styles.metricLabel,
                      {
                        color: isDark ? currentColors.text : "#666",
                      },
                    ]}
                  >
                    Basal Metabolic Rate
                  </Text>
                  <Text
                    style={[styles.metricValue, { color: currentColors.text }]}
                  >
                    {results.bmr}{" "}
                    <Text style={styles.metricUnit}>kcal/day</Text>
                  </Text>
                  <Text
                    style={[
                      styles.metricDescription,
                      {
                        color: isDark ? "rgba(255, 255, 255, 0.5)" : "#999",
                      },
                    ]}
                  >
                    Calories burned at rest
                  </Text>
                </View>
              </View>
            </View>

            {/* Calories Card */}
            <View
              style={[
                styles.metricCard,
                {
                  backgroundColor: isDark
                    ? "rgba(255, 193, 7, 0.05)"
                    : "rgba(255, 193, 7, 0.03)",
                  borderColor: "rgba(255, 193, 7, 0.3)",
                },
              ]}
            >
              <View style={styles.metricHeader}>
                <View
                  style={[
                    styles.metricIconWrapper,
                    {
                      backgroundColor: "rgba(255, 193, 7, 0.15)",
                    },
                  ]}
                >
                  <Ionicons
                    name="nutrition-outline"
                    size={24}
                    color="#FFC107"
                  />
                </View>
                <View style={styles.metricInfo}>
                  <Text
                    style={[
                      styles.metricLabel,
                      {
                        color: isDark ? currentColors.text : "#666",
                      },
                    ]}
                  >
                    Daily Calorie Needs
                  </Text>
                  <Text
                    style={[styles.metricValue, { color: currentColors.text }]}
                  >
                    {results.calories}{" "}
                    <Text style={styles.metricUnit}>kcal</Text>
                  </Text>
                  <Text
                    style={[
                      styles.metricDescription,
                      {
                        color: isDark ? "rgba(255, 255, 255, 0.5)" : "#999",
                      },
                    ]}
                  >
                    Based on activity level
                  </Text>
                </View>
              </View>
            </View>

            {/* Info Footer */}
            <View
              style={[
                styles.infoFooter,
                {
                  backgroundColor: isDark
                    ? "rgba(57, 255, 20, 0.08)"
                    : "rgba(57, 255, 20, 0.05)",
                },
              ]}
            >
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={currentColors.primary}
              />
              <Text
                style={[
                  styles.infoFooterText,
                  {
                    color: isDark ? "rgba(255, 255, 255, 0.7)" : "#666",
                  },
                ]}
              >
                These are estimates. Consult a professional for personalized
                advice.
              </Text>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
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
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  themeToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1.5,
    gap: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  infoIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  infoSubtitle: {
    fontSize: 13,
    fontWeight: "500",
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: "600",
  },
  inputUnit: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    paddingLeft: 16,
    paddingRight: 8,
    overflow: "hidden",
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  picker: {
    flex: 1,
    height: 50,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    paddingVertical: 18,
    marginTop: 8,
    marginBottom: 32,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  buttonText: {
    fontWeight: "800",
    fontSize: 17,
    letterSpacing: 0.5,
  },
  resultsContainer: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 14,
  },
  resultHeaderIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  resultTitle: {
    fontWeight: "800",
    fontSize: 22,
    letterSpacing: 0.3,
  },
  resultSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
  },
  divider: {
    height: 2,
    borderRadius: 1,
    marginBottom: 20,
  },
  metricCard: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  metricIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  metricInfo: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metricValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  metricValue: {
    fontWeight: "800",
    fontSize: 28,
    letterSpacing: -0.5,
  },
  metricUnit: {
    fontSize: 16,
    fontWeight: "600",
    opacity: 0.6,
  },
  metricDescription: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  infoFooter: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 14,
    gap: 10,
    marginTop: 4,
  },
  infoFooterText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 18,
  },
});
