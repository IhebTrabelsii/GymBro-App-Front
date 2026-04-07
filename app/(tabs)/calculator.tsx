import Clock from "@/components/clock";
import { Colors } from "@/constants/Colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
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
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSimpleTheme } from "../../context/SimpleThemeContext";

const { width } = Dimensions.get("window");

const BMI_CATEGORIES = {
  UNDERWEIGHT: { text: "Underweight", color: "#3B82F6", range: "< 18.5" },
  NORMAL: { text: "Normal", color: "#00FF41", range: "18.5 - 24.9" },
  OVERWEIGHT: { text: "Overweight", color: "#F59E0B", range: "25 - 29.9" },
  OBESE: { text: "Obese", color: "#EF4444", range: "≥ 30" },
} as const;

const ACTIVITY_LEVELS = [
  {
    label: "Sedentary",
    description: "Little or no exercise",
    value: "1.2",
    icon: "bed-outline",
    emoji: "🛋️",
  },
  {
    label: "Lightly active",
    description: "Light exercise 1-3 days/week",
    value: "1.375",
    icon: "walk-outline",
    emoji: "🚶",
  },
  {
    label: "Moderately active",
    description: "Moderate exercise 3-5 days/week",
    value: "1.55",
    icon: "bicycle-outline",
    emoji: "🚴",
  },
  {
    label: "Very active",
    description: "Hard exercise 6-7 days/week",
    value: "1.725",
    icon: "barbell-outline",
    emoji: "🏋️",
  },
  {
    label: "Extra active",
    description: "Very hard exercise/physical job",
    value: "1.9",
    icon: "fitness-outline",
    emoji: "⚡",
  },
] as const;

// ── BMI Gauge visual ─────────────────────────────────────────────────────────
const BMIGauge = ({ bmi, color }: { bmi: number; color: string }) => {
  const pct = Math.min(Math.max((bmi - 10) / (45 - 10), 0), 1);
  const filledWidth = pct * (width - 88);
  return (
    <View style={gaugeStyles.wrap}>
      <View style={gaugeStyles.track}>
        {/* Segment fills */}
        <View
          style={[gaugeStyles.seg, { backgroundColor: "#3B82F6", flex: 8.5 }]}
        />
        <View
          style={[gaugeStyles.seg, { backgroundColor: "#00FF41", flex: 6.4 }]}
        />
        <View
          style={[gaugeStyles.seg, { backgroundColor: "#F59E0B", flex: 5 }]}
        />
        <View
          style={[gaugeStyles.seg, { backgroundColor: "#EF4444", flex: 15 }]}
        />
        {/* Thumb */}
        <View
          style={[
            gaugeStyles.thumb,
            { left: filledWidth - 8, backgroundColor: color },
          ]}
        />
      </View>
      <View style={gaugeStyles.labels}>
        {["10", "18.5", "25", "30", "45"].map((l) => (
          <Text key={l} style={gaugeStyles.labelText}>
            {l}
          </Text>
        ))}
      </View>
    </View>
  );
};

const gaugeStyles = StyleSheet.create({
  wrap: { marginTop: 12, marginBottom: 4 },
  track: {
    flexDirection: "row",
    height: 8,
    borderRadius: 4,
    overflow: "visible",
    position: "relative",
  },
  seg: { height: 8, marginHorizontal: 1 },
  thumb: {
    position: "absolute",
    top: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  labelText: { fontSize: 9, color: "#888", fontWeight: "600" },
});

// ── InputField — defined OUTSIDE CalculatorScreen to prevent remount on every keystroke ──
const InputField = ({
  label,
  icon,
  value,
  onChangeText,
  unit,
  placeholder,
  isDark,
  primaryColor,
  textColor,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (text: string) => void;
  unit: string;
  placeholder: string;
  isDark: boolean;
  primaryColor: string;
  textColor: string;
}) => (
  <View style={styles.inputWrapper}>
    <View style={styles.inputLabelRow}>
      <Text style={[styles.inputLabel, { color: isDark ? "#777" : "#aaa" }]}>
        {label}
      </Text>
      {value !== "" && (
        <View
          style={[
            styles.inputValuePill,
            { backgroundColor: primaryColor + "15" },
          ]}
        >
          <Text style={[styles.inputValuePillText, { color: primaryColor }]}>
            {value} {unit}
          </Text>
        </View>
      )}
    </View>
    <View
      style={[
        styles.inputContainer,
        {
          backgroundColor: isDark ? "#111" : "#fafafa",
          borderColor:
            value !== "" ? primaryColor + "50" : isDark ? "#222" : "#ebebeb",
        },
      ]}
    >
      <View
        style={[styles.inputIconBox, { backgroundColor: primaryColor + "12" }]}
      >
        <Ionicons name={icon} size={18} color={primaryColor} />
      </View>
      <TextInput
        style={[styles.input, { color: textColor }]}
        placeholder={placeholder}
        placeholderTextColor={isDark ? "#333" : "#ccc"}
        keyboardType="numeric"
        value={value}
        onChangeText={onChangeText}
        selectionColor={primaryColor}
      />
      <Text style={[styles.inputUnit, { color: isDark ? "#444" : "#ccc" }]}>
        {unit}
      </Text>
    </View>
  </View>
);

export default function CalculatorScreen() {
  const { theme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === "dark";

  // ─── Form state (unchanged) ───────────────────────────────────────────────
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [activityLevel, setActivityLevel] = useState("1.55");
  const [results, setResults] = useState<{
    bmi?: number;
    bmr?: number;
    calories?: number;
  }>({});

  // ─── Animation refs (unchanged) ──────────────────────────────────────────
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const buttonPulse = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const resultSlide = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonPulse, {
          toValue: 1.03,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(buttonPulse, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("userToken");
      console.log("User token exists:", token ? "YES" : "NO");
    };
    checkToken();
  }, []);

  // ─── All original logic intact ────────────────────────────────────────────
  const getBMICategory = useCallback((bmi: number) => {
    if (bmi < 18.5) return BMI_CATEGORIES.UNDERWEIGHT;
    if (bmi < 25) return BMI_CATEGORIES.NORMAL;
    if (bmi < 30) return BMI_CATEGORIES.OVERWEIGHT;
    return BMI_CATEGORIES.OBESE;
  }, []);

  const API_BASE_URL = "http://192.168.100.143:3000";

  const saveDailyData = async (bmi: number, bmr: number, calories: number) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      console.log("🔍 Token found:", token ? "Yes" : "No");
      if (!token) {
        console.log("No token, cannot save");
        return false;
      }

      const today = new Date().toISOString().split("T")[0];
      const lastSaveKey = `lastSave_${today}`;
      const alreadySaved = await AsyncStorage.getItem(lastSaveKey);
      if (alreadySaved) {
        console.log("⏭️ Already saved today, skipping...");
        return false;
      }

      const requestBody = {
        gender,
        age: parseInt(age),
        weight: parseFloat(weight),
        height: parseFloat(height),
        activityLevel,
        bmi,
        bmr,
        tdee: calories,
      };
      console.log("📤 Sending data:", requestBody);

      const response = await fetch(`${API_BASE_URL}/api/daily-data/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = (await response.json()) as {
        success: boolean;
        alreadySaved?: boolean;
        message?: string;
      };
      console.log("📥 Response status:", response.status);
      console.log("📥 Response data:", data);

      if (response.ok && data.success) {
        await AsyncStorage.setItem(lastSaveKey, "true");
        console.log("✅ Daily data saved!");
        return true;
      } else if (data.alreadySaved) {
        await AsyncStorage.setItem(lastSaveKey, "true");
        return false;
      }
      return false;
    } catch (error) {
      console.log("Save error:", error);
      return false;
    }
  };

  const calculate = useCallback(async () => {
    const ageNum = parseInt(age);
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (!ageNum || !weightNum || !heightNum || ageNum < 1 || ageNum > 120) {
      Alert.alert(
        "Invalid Input",
        "Please enter valid age (1-120), weight, and height",
        [{ text: "OK" }],
      );
      return;
    }
    if (
      weightNum < 20 ||
      weightNum > 300 ||
      heightNum < 100 ||
      heightNum > 250
    ) {
      Alert.alert(
        "Out of Range",
        "Please enter realistic values (Weight: 20-300kg, Height: 100-250cm)",
        [{ text: "OK" }],
      );
      return;
    }

    const heightMeters = heightNum / 100;
    const bmi = weightNum / (heightMeters * heightMeters);
    let bmr =
      gender === "male"
        ? 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5
        : 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;
    const calories = bmr * parseFloat(activityLevel);

    const bmiValue = parseFloat(bmi.toFixed(1));
    const bmrValue = Math.round(bmr);
    const caloriesValue = Math.round(calories);

    setResults({ bmi: bmiValue, bmr: bmrValue, calories: caloriesValue });

    resultSlide.setValue(40);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(resultSlide, {
        toValue: 0,
        tension: 55,
        friction: 9,
        useNativeDriver: true,
      }),
    ]).start();

    await saveDailyData(bmiValue, bmrValue, caloriesValue);
  }, [age, gender, weight, height, activityLevel]);

  const clearForm = useCallback(() => {
    setAge("");
    setWeight("");
    setHeight("");
    setResults({});
    scaleAnim.setValue(0.95);
    // Do NOT reset fadeAnim — it would fade out the entire form
  }, []);

  const bmiCategory = useMemo(
    () => (results.bmi ? getBMICategory(results.bmi) : null),
    [results.bmi, getBMICategory],
  );
  const isFormValid = useMemo(
    () =>
      age &&
      weight &&
      height &&
      !isNaN(parseInt(age)) &&
      !isNaN(parseFloat(weight)) &&
      !isNaN(parseFloat(height)),
    [age, weight, height],
  );
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <View
      style={[styles.container, { backgroundColor: currentColors.background }]}
    >
      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: isDark ? "#0a0a0a" : "#fff",
            borderBottomColor: isDark
              ? currentColors.primary + "18"
              : currentColors.primary + "10",
          },
        ]}
      >
        {/* Top accent line */}
        <LinearGradient
          colors={[
            currentColors.primary + "00",
            currentColors.primary,
            currentColors.primary + "00",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerTopLine}
        />
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <LinearGradient
              colors={[
                currentColors.primary + "28",
                currentColors.primary + "08",
              ]}
              style={styles.headerIconWrapper}
            >
              <Ionicons
                name="calculator"
                size={22}
                color={currentColors.primary}
              />
            </LinearGradient>
            <View>
              <Text style={[styles.title, { color: currentColors.text }]}>
                Calculator
              </Text>
              <View style={styles.subtitleRow}>
                <View
                  style={[
                    styles.subtitleDot,
                    { backgroundColor: currentColors.primary },
                  ]}
                />
                <Text
                  style={[styles.subtitle, { color: isDark ? "#555" : "#bbb" }]}
                >
                  BMI · BMR · Calories
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Clock />
            <TouchableOpacity
              onPress={clearForm}
              style={[
                styles.clearButton,
                {
                  backgroundColor: isDark ? "#1a1a1a" : "#f0f0f0",
                  borderColor: isDark ? "#333" : "#ddd",
                },
              ]}
              activeOpacity={0.7}
            >
              <Ionicons
                name="refresh"
                size={18}
                color={isDark ? currentColors.primary : "#666"}
              />
              <Text
                style={[
                  styles.clearButtonText,
                  { color: isDark ? currentColors.primary : "#666" },
                ]}
              >
                
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          {/* ── INPUT CARD ─────────────────────────────────────────────────── */}
          <View
            style={[
              styles.formCard,
              {
                backgroundColor: isDark ? "#0e0e0e" : "#fff",
                borderColor: isDark ? "#1e1e1e" : "#f0f0f0",
              },
            ]}
          >
            {/* Section label */}
            <View style={styles.formCardHeader}>
              <Text
                style={[
                  styles.formCardLabel,
                  { color: isDark ? "#444" : "#ddd" },
                ]}
              >
                YOUR MEASUREMENTS
              </Text>
              <View
                style={[
                  styles.formCardLine,
                  { backgroundColor: isDark ? "#1e1e1e" : "#f0f0f0" },
                ]}
              />
            </View>

            {/* Age */}
            <InputField
              label="Age"
              icon="person-outline"
              value={age}
              onChangeText={setAge}
              unit="yrs"
              placeholder="25"
              isDark={isDark}
              primaryColor={currentColors.primary}
              textColor={currentColors.text}
            />

            {/* Gender toggle */}
            <View style={styles.inputWrapper}>
              <Text
                style={[styles.inputLabel, { color: isDark ? "#777" : "#aaa" }]}
              >
                Gender
              </Text>
              <View
                style={[
                  styles.genderTrack,
                  {
                    backgroundColor: isDark ? "#111" : "#f5f5f5",
                    borderColor: isDark ? "#222" : "#ebebeb",
                  },
                ]}
              >
                {["male", "female"].map((g) => {
                  const active = gender === g;
                  return (
                    <TouchableOpacity
                      key={g}
                      style={[
                        styles.genderTab,
                        active && { backgroundColor: currentColors.primary },
                      ]}
                      onPress={() => setGender(g)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={g === "male" ? "male" : "female"}
                        size={16}
                        color={
                          active
                            ? isDark
                              ? "#000"
                              : "#fff"
                            : isDark
                              ? "#555"
                              : "#bbb"
                        }
                      />
                      <Text
                        style={[
                          styles.genderTabText,
                          {
                            color: active
                              ? isDark
                                ? "#000"
                                : "#fff"
                              : isDark
                                ? "#555"
                                : "#aaa",
                          },
                        ]}
                      >
                        {g === "male" ? "Male" : "Female"}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Weight & Height side by side */}
            <View style={styles.dualRow}>
              <View style={{ flex: 1 }}>
                <InputField
                  label="Weight"
                  icon="barbell-outline"
                  value={weight}
                  onChangeText={setWeight}
                  unit="kg"
                  placeholder="70"
                  isDark={isDark}
                  primaryColor={currentColors.primary}
                  textColor={currentColors.text}
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <InputField
                  label="Height"
                  icon="resize-outline"
                  value={height}
                  onChangeText={setHeight}
                  unit="cm"
                  placeholder="175"
                  isDark={isDark}
                  primaryColor={currentColors.primary}
                  textColor={currentColors.text}
                />
              </View>
            </View>

            {/* Activity level */}
            <View style={styles.inputWrapper}>
              <Text
                style={[styles.inputLabel, { color: isDark ? "#777" : "#aaa" }]}
              >
                Activity Level
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.activityScrollContent}
              >
                {ACTIVITY_LEVELS.map((level) => {
                  const isSelected = activityLevel === level.value;
                  return (
                    <TouchableOpacity
                      key={level.value}
                      style={[
                        styles.activityCard,
                        {
                          backgroundColor: isSelected
                            ? currentColors.primary
                            : isDark
                              ? "#111"
                              : "#fafafa",
                          borderColor: isSelected
                            ? currentColors.primary
                            : isDark
                              ? "#222"
                              : "#ebebeb",
                        },
                      ]}
                      onPress={() => setActivityLevel(level.value)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.activityEmoji}>{level.emoji}</Text>
                      <View style={styles.activityTextContainer}>
                        <Text
                          style={[
                            styles.activityLabel,
                            {
                              color: isSelected
                                ? isDark
                                  ? "#000"
                                  : "#fff"
                                : currentColors.text,
                            },
                          ]}
                        >
                          {level.label}
                        </Text>
                        <Text
                          style={[
                            styles.activityDescription,
                            {
                              color: isSelected
                                ? isDark
                                  ? "rgba(0,0,0,0.7)"
                                  : "rgba(255,255,255,0.85)"
                                : isDark
                                  ? "#444"
                                  : "#ccc",
                            },
                          ]}
                        >
                          {level.description}
                        </Text>
                      </View>
                      {isSelected && (
                        <View
                          style={[
                            styles.activityCheck,
                            {
                              backgroundColor: isDark
                                ? "rgba(0,0,0,0.2)"
                                : "rgba(255,255,255,0.25)",
                            },
                          ]}
                        >
                          <Ionicons
                            name="checkmark"
                            size={12}
                            color={isDark ? "#000" : "#fff"}
                          />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          {/* ── CALCULATE BUTTON ───────────────────────────────────────────── */}
          <Animated.View style={{ transform: [{ scale: buttonPulse }] }}>
            <TouchableOpacity
              style={[
                styles.calculateButton,
                {
                  shadowColor: currentColors.primary,
                  opacity: isFormValid ? 1 : 0.5,
                },
              ]}
              onPress={calculate}
              disabled={!isFormValid}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[currentColors.primary, currentColors.primary + "cc"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Animated.View
                style={[
                  styles.buttonGlow,
                  {
                    backgroundColor: "#fff",
                    opacity: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.12],
                    }),
                  },
                ]}
              />
              <View
                style={[
                  styles.btnIconWrap,
                  { backgroundColor: "rgba(0,0,0,0.15)" },
                ]}
              >
                <MaterialCommunityIcons
                  name="calculator-variant"
                  size={20}
                  color={isDark ? "#000" : "#fff"}
                />
              </View>
              <Text
                style={[
                  styles.calculateButtonText,
                  { color: isDark ? "#000" : "#fff" },
                ]}
              >
                Calculate My Metrics
              </Text>
              <View
                style={[
                  styles.btnArrow,
                  { backgroundColor: "rgba(0,0,0,0.12)" },
                ]}
              >
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color={isDark ? "#000" : "#fff"}
                />
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* ── RESULTS ────────────────────────────────────────────────────── */}
          {results.bmi && bmiCategory && (
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }, { translateY: resultSlide }],
              }}
            >
              {/* BMI Card */}
              <View
                style={[
                  styles.resultCard,
                  {
                    backgroundColor: isDark ? "#0e0e0e" : "#fff",
                    borderColor: isDark
                      ? bmiCategory.color + "30"
                      : bmiCategory.color + "18",
                  },
                ]}
              >
                {/* Color top strip */}
                <View
                  style={[
                    styles.resultCardStrip,
                    { backgroundColor: bmiCategory.color },
                  ]}
                />

                <View style={styles.bmiTopRow}>
                  <View>
                    <Text
                      style={[
                        styles.resultSectionLabel,
                        { color: isDark ? "#444" : "#ccc" },
                      ]}
                    >
                      BODY MASS INDEX
                    </Text>
                    <View style={styles.bmiValueRow}>
                      <Text
                        style={[
                          styles.bmiBigNumber,
                          { color: currentColors.text },
                        ]}
                      >
                        {results.bmi}
                      </Text>
                      <View
                        style={[
                          styles.bmiCategoryBadge,
                          {
                            backgroundColor: bmiCategory.color + "20",
                            borderColor: bmiCategory.color + "50",
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.bmiCategoryDot,
                            { backgroundColor: bmiCategory.color },
                          ]}
                        />
                        <Text
                          style={[
                            styles.bmiCategoryText,
                            { color: bmiCategory.color },
                          ]}
                        >
                          {bmiCategory.text}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.bmiRange,
                        { color: isDark ? "#444" : "#ccc" },
                      ]}
                    >
                      Range: {bmiCategory.range}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.bmiIconBox,
                      { backgroundColor: bmiCategory.color + "15" },
                    ]}
                  >
                    <Ionicons
                      name="body-outline"
                      size={34}
                      color={bmiCategory.color}
                    />
                  </View>
                </View>

                <BMIGauge bmi={results.bmi} color={bmiCategory.color} />
              </View>

              {/* BMR + Calories row */}
              <View style={styles.metricsRow}>
                {/* BMR */}
                <View
                  style={[
                    styles.metricCard,
                    {
                      backgroundColor: isDark ? "#0e0e0e" : "#fff",
                      borderColor: isDark ? "#FF6B6B25" : "#FF6B6B12",
                      flex: 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.metricCardStrip,
                      { backgroundColor: "#FF6B6B" },
                    ]}
                  />
                  <View
                    style={[
                      styles.metricIconBox,
                      { backgroundColor: "rgba(255,107,107,0.1)" },
                    ]}
                  >
                    <Ionicons name="flame-outline" size={22} color="#FF6B6B" />
                  </View>
                  <Text
                    style={[
                      styles.metricCardLabel,
                      { color: isDark ? "#555" : "#bbb" },
                    ]}
                  >
                    BMR
                  </Text>
                  <Text
                    style={[
                      styles.metricCardValue,
                      { color: currentColors.text },
                    ]}
                  >
                    {results.bmr}
                  </Text>
                  <Text
                    style={[
                      styles.metricCardUnit,
                      { color: isDark ? "#444" : "#ccc" },
                    ]}
                  >
                    kcal/day
                  </Text>
                  <Text
                    style={[
                      styles.metricCardSub,
                      { color: isDark ? "#333" : "#ddd" },
                    ]}
                  >
                    At rest
                  </Text>
                </View>

                {/* Calories */}
                <View
                  style={[
                    styles.metricCard,
                    {
                      backgroundColor: isDark ? "#0e0e0e" : "#fff",
                      borderColor: isDark ? "#FFC10725" : "#FFC10712",
                      flex: 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.metricCardStrip,
                      { backgroundColor: "#FFC107" },
                    ]}
                  />
                  <View
                    style={[
                      styles.metricIconBox,
                      { backgroundColor: "rgba(255,193,7,0.1)" },
                    ]}
                  >
                    <Ionicons
                      name="nutrition-outline"
                      size={22}
                      color="#FFC107"
                    />
                  </View>
                  <Text
                    style={[
                      styles.metricCardLabel,
                      { color: isDark ? "#555" : "#bbb" },
                    ]}
                  >
                    Daily Calories
                  </Text>
                  <Text
                    style={[
                      styles.metricCardValue,
                      { color: currentColors.text },
                    ]}
                  >
                    {results.calories}
                  </Text>
                  <Text
                    style={[
                      styles.metricCardUnit,
                      { color: isDark ? "#444" : "#ccc" },
                    ]}
                  >
                    kcal/day
                  </Text>
                  <Text
                    style={[
                      styles.metricCardSub,
                      { color: isDark ? "#333" : "#ddd" },
                    ]}
                  >
                    With activity
                  </Text>
                </View>
              </View>

              {/* Calorie targets breakdown */}
              <View
                style={[
                  styles.targetCard,
                  {
                    backgroundColor: isDark ? "#0e0e0e" : "#fff",
                    borderColor: isDark
                      ? currentColors.primary + "20"
                      : currentColors.primary + "10",
                  },
                ]}
              >
                <View style={styles.targetCardHeader}>
                  <View
                    style={[
                      styles.targetIconBox,
                      { backgroundColor: currentColors.primary + "12" },
                    ]}
                  >
                    <Ionicons
                      name="cellular-outline"
                      size={18}
                      color={currentColors.primary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.targetCardTitle,
                      { color: currentColors.text },
                    ]}
                  >
                    Calorie Targets
                  </Text>
                </View>
                {[
                  {
                    label: "Lose weight",
                    kcal: Math.round((results.calories ?? 0) - 500),
                    color: "#3B82F6",
                    pct: 0.78,
                  },
                  {
                    label: "Maintain",
                    kcal: results.calories ?? 0,
                    color: currentColors.primary,
                    pct: 1,
                  },
                  {
                    label: "Gain muscle",
                    kcal: Math.round((results.calories ?? 0) + 300),
                    color: "#FF6B6B",
                    pct: 1.12,
                  },
                ].map((t, i) => (
                  <View key={i} style={styles.targetRow}>
                    <Text
                      style={[
                        styles.targetLabel,
                        { color: isDark ? "#777" : "#aaa" },
                      ]}
                    >
                      {t.label}
                    </Text>
                    <View style={styles.targetBarWrap}>
                      <View
                        style={[
                          styles.targetBarTrack,
                          { backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5" },
                        ]}
                      >
                        <View
                          style={[
                            styles.targetBarFill,
                            {
                              backgroundColor: t.color,
                              width: `${t.pct * 68}%`,
                            },
                          ]}
                        />
                      </View>
                    </View>
                    <Text style={[styles.targetKcal, { color: t.color }]}>
                      {t.kcal}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Disclaimer */}
              <View
                style={[
                  styles.disclaimer,
                  {
                    backgroundColor: isDark
                      ? currentColors.primary + "07"
                      : currentColors.primary + "04",
                    borderColor: isDark
                      ? currentColors.primary + "18"
                      : currentColors.primary + "10",
                  },
                ]}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={14}
                  color={currentColors.primary}
                />
                <Text
                  style={[
                    styles.disclaimerText,
                    { color: isDark ? "#555" : "#bbb" },
                  ]}
                >
                  Estimates only. Consult a professional for personalized
                  advice.
                </Text>
              </View>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── Header ─────────────────────────────────────────────────────────────────
  header: {
    paddingTop: Platform.OS === "ios" ? 56 : 42,
    paddingBottom: 16,
    borderBottomWidth: 1,
    position: "relative",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: { elevation: 6 },
    }),
  },
  headerTopLine: { position: "absolute", top: 0, left: 0, right: 0, height: 2 },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingRight: 24,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  headerIconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 21, fontWeight: "900", letterSpacing: 0.2 },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  subtitleDot: { width: 5, height: 5, borderRadius: 2.5 },
  subtitle: { fontSize: 12, fontWeight: "600" },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginRight: 10,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    marginLeft: 26,
    marginBottom: -0,
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },

  // ── Scroll ─────────────────────────────────────────────────────────────────
  scrollContainer: { padding: 18, paddingBottom: 44 },

  // ── Form card ──────────────────────────────────────────────────────────────
  formCard: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
    }),
  },
  formCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },
  formCardLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },
  formCardLine: { flex: 1, height: 1 },

  // ── Input field ────────────────────────────────────────────────────────────
  inputWrapper: { marginBottom: 16 },
  inputLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 7,
  },
  inputLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  inputValuePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  inputValuePillText: { fontSize: 10, fontWeight: "700" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
      },
      android: { elevation: 1 },
    }),
  },
  inputIconBox: {
    width: 34,
    height: 34,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  input: { flex: 1, paddingVertical: 13, fontSize: 16, fontWeight: "700" },
  inputUnit: { fontSize: 12, fontWeight: "600", marginLeft: 6 },

  // ── Gender ────────────────────────────────────────────────────────────────
  genderTrack: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 4,
    gap: 4,
  },
  genderTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
    borderRadius: 11,
    gap: 6,
  },
  genderTabText: { fontSize: 14, fontWeight: "700" },

  // ── Dual row ──────────────────────────────────────────────────────────────
  dualRow: { flexDirection: "row" },

  // ── Activity ──────────────────────────────────────────────────────────────
  activityScrollContent: { gap: 10, paddingRight: 4 },
  activityCard: {
    width: width * 0.58,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    position: "relative",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  activityEmoji: { fontSize: 24 },
  activityTextContainer: { flex: 1 },
  activityLabel: { fontSize: 14, fontWeight: "800", marginBottom: 2 },
  activityDescription: { fontSize: 11, fontWeight: "500", lineHeight: 15 },
  activityCheck: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Calculate button ───────────────────────────────────────────────────────
  calculateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 17,
    borderRadius: 20,
    marginBottom: 20,
    gap: 10,
    overflow: "hidden",
    position: "relative",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 18,
      },
      android: { elevation: 10 },
    }),
  },
  buttonGlow: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  btnIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  calculateButtonText: { fontWeight: "900", fontSize: 16, letterSpacing: 0.3 },
  btnArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  // ── BMI result card ────────────────────────────────────────────────────────
  resultCard: {
    borderRadius: 22,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1.5,
    overflow: "hidden",
    position: "relative",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 14,
      },
      android: { elevation: 4 },
    }),
  },
  resultCardStrip: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  bmiTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  resultSectionLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  bmiValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  bmiBigNumber: {
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: -2,
    lineHeight: 52,
  },
  bmiCategoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  bmiCategoryDot: { width: 6, height: 6, borderRadius: 3 },
  bmiCategoryText: { fontSize: 12, fontWeight: "800" },
  bmiRange: { fontSize: 11, fontWeight: "600" },
  bmiIconBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Metrics row ───────────────────────────────────────────────────────────
  metricsRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  metricCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
      },
      android: { elevation: 3 },
    }),
  },
  metricCardStrip: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  metricIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 6,
  },
  metricCardLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  metricCardValue: { fontSize: 30, fontWeight: "900", letterSpacing: -0.5 },
  metricCardUnit: { fontSize: 11, fontWeight: "600", marginTop: 2 },
  metricCardSub: { fontSize: 10, fontWeight: "500", marginTop: 4 },

  // ── Calorie target card ───────────────────────────────────────────────────
  targetCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
      },
      android: { elevation: 2 },
    }),
  },
  targetCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  targetIconBox: {width: 34,height: 34,borderRadius: 17,justifyContent: "center",alignItems: "center",},
  targetCardTitle: { fontSize: 15, fontWeight: "800" },
  targetRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  targetLabel: { fontSize: 12, fontWeight: "600", width: 82 },
  targetBarWrap: { flex: 1, marginHorizontal: 10 },
  targetBarTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  targetBarFill: { height: 6, borderRadius: 3 },
  targetKcal: {
    fontSize: 13,
    fontWeight: "800",
    minWidth: 40,
    textAlign: "right",
  },

  // ── Disclaimer ────────────────────────────────────────────────────────────
  disclaimer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  disclaimerText: { flex: 1, fontSize: 11, fontWeight: "500", lineHeight: 16 },
});
