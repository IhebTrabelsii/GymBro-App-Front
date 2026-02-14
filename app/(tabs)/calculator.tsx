import Clock from "@/components/clock";
import { Colors } from "@/constants/Colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
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
import { LinearGradient } from 'expo-linear-gradient';
import { useSimpleTheme } from "../../context/SimpleThemeContext";

const { width } = Dimensions.get('window');

// BMI Categories
const BMI_CATEGORIES = {
  UNDERWEIGHT: { text: "Underweight", color: "#3B82F6", range: "< 18.5" },
  NORMAL: { text: "Normal", color: "#00FF41", range: "18.5 - 24.9" },
  OVERWEIGHT: { text: "Overweight", color: "#F59E0B", range: "25 - 29.9" },
  OBESE: { text: "Obese", color: "#EF4444", range: "≥ 30" }
} as const;

// Activity levels with labels and values - ALL 5 RESTORED
const ACTIVITY_LEVELS = [
  { label: "Sedentary", description: "Little or no exercise", value: "1.2", icon: "bed-outline" },
  { label: "Lightly active", description: "Light exercise 1-3 days/week", value: "1.375", icon: "walk-outline" },
  { label: "Moderately active", description: "Moderate exercise 3-5 days/week", value: "1.55", icon: "bicycle-outline" },
  { label: "Very active", description: "Hard exercise 6-7 days/week", value: "1.725", icon: "barbell-outline" },
  { label: "Extra active", description: "Very hard exercise/physical job", value: "1.9", icon: "fitness-outline" },
] as const;

export default function CalculatorScreen() {
  const { theme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === "dark";

  // Form state
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

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const buttonPulse = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Start animations
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

    // Button pulse animation
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
      ])
    ).start();

    // Glow animation
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
      ])
    ).start();
  }, []);

  // Get BMI category with memoization
  const getBMICategory = useCallback((bmi: number) => {
    if (bmi < 18.5) return BMI_CATEGORIES.UNDERWEIGHT;
    if (bmi < 25) return BMI_CATEGORIES.NORMAL;
    if (bmi < 30) return BMI_CATEGORIES.OVERWEIGHT;
    return BMI_CATEGORIES.OBESE;
  }, []);

  // Calculate metrics
  const calculate = useCallback(() => {
    const ageNum = parseInt(age);
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (!ageNum || !weightNum || !heightNum || ageNum < 1 || ageNum > 120) {
      Alert.alert(
        "Invalid Input",
        "Please enter valid age (1-120), weight, and height",
        [{ text: "OK" }]
      );
      return;
    }

    if (weightNum < 20 || weightNum > 300 || heightNum < 100 || heightNum > 250) {
      Alert.alert(
        "Out of Range",
        "Please enter realistic values (Weight: 20-300kg, Height: 100-250cm)",
        [{ text: "OK" }]
      );
      return;
    }

    const heightMeters = heightNum / 100;
    const bmi = weightNum / (heightMeters * heightMeters);

    // Mifflin-St Jeor Equation
    let bmr;
    if (gender === "male") {
      bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5;
    } else {
      bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;
    }

    const calories = bmr * parseFloat(activityLevel);

    setResults({
      bmi: parseFloat(bmi.toFixed(1)),
      bmr: Math.round(bmr),
      calories: Math.round(calories),
    });

    // Animate results
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
    ]).start();
  }, [age, gender, weight, height, activityLevel]);

  // Clear form
  const clearForm = useCallback(() => {
    setAge("");
    setWeight("");
    setHeight("");
    setResults({});
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.95);
  }, []);

  // Memoized values
  const bmiCategory = useMemo(() => 
    results.bmi ? getBMICategory(results.bmi) : null,
  [results.bmi, getBMICategory]);

  const isFormValid = useMemo(() => 
    age && weight && height && 
    !isNaN(parseInt(age)) && 
    !isNaN(parseFloat(weight)) && 
    !isNaN(parseFloat(height)),
  [age, weight, height]);

  // Custom input component
  const InputField = ({ 
    label, 
    icon, 
    value, 
    onChangeText, 
    unit, 
    placeholder 
  }: { 
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    value: string;
    onChangeText: (text: string) => void;
    unit: string;
    placeholder: string;
  }) => (
    <View style={styles.inputWrapper}>
      <Text style={[styles.inputLabel, { color: currentColors.text }]}>
        {label}
      </Text>
      <Animated.View
        style={[
          styles.inputContainer,
          {
            backgroundColor: isDark ? 'rgba(30, 30, 30, 0.9)' : '#FFFFFF',
            borderColor: isDark ? 'rgba(0, 255, 65, 0.3)' : 'rgba(0, 255, 65, 0.2)',
          },
        ]}
      >
        <View style={[
          styles.inputIconWrapper,
          {
            backgroundColor: isDark ? 'rgba(0, 255, 65, 0.15)' : 'rgba(0, 255, 65, 0.08)',
          }
        ]}>
          <Ionicons name={icon} size={20} color={currentColors.primary} />
        </View>
        <TextInput
          style={[styles.input, { color: currentColors.text }]}
          placeholder={placeholder}
          placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}
          keyboardType="numeric"
          value={value}
          onChangeText={onChangeText}
          selectionColor={currentColors.primary}
        />
        <Text style={[styles.inputUnit, { color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }]}>
          {unit}
        </Text>
      </Animated.View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      {/* Premium Header with Gradient */}
      <LinearGradient
        colors={isDark ? ['#1a1a1a', '#0a0a0a'] : ['#ffffff', '#f8f8f8']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={[
              styles.headerIconWrapper,
              {
                backgroundColor: isDark ? 'rgba(0, 255, 65, 0.2)' : 'rgba(0, 255, 65, 0.1)',
                borderWidth: 2,
                borderColor: currentColors.primary,
              }
            ]}>
              <Ionicons name="calculator" size={24} color={currentColors.primary} />
            </View>
            <View>
              <Text style={[styles.title, { color: currentColors.text }]}>
                Fitness Calculator
              </Text>
              <Text style={[styles.subtitle, { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }]}>
                BMI • BMR • Calories
              </Text>
            </View>
          </View>
          
          <View style={styles.headerRight}>
            <Clock />
            <TouchableOpacity
              onPress={clearForm}
              style={[
                styles.clearButton,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                }
              ]}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={20} color={currentColors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Input Section */}
        <Animated.View 
          style={[
            styles.inputsSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Age Input */}
          <InputField
            label="Age"
            icon="person-outline"
            value={age}
            onChangeText={setAge}
            unit="years"
            placeholder="25"
          />

          {/* Gender Selection - Fixed Dark Mode */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: currentColors.text }]}>
              Gender
            </Text>
            <View style={styles.genderContainer}>
              {['male', 'female'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.genderButton,
                    {
                      backgroundColor: gender === g 
                        ? currentColors.primary 
                        : isDark 
                          ? 'rgba(255,255,255,0.08)' 
                          : 'rgba(0,0,0,0.03)',
                      borderColor: gender === g 
                        ? currentColors.primary 
                        : isDark 
                          ? 'rgba(255,255,255,0.1)' 
                          : 'rgba(0,0,0,0.1)',
                    }
                  ]}
                  onPress={() => setGender(g)}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={g === 'male' ? 'male' : 'female'} 
                    size={22} 
                    color={gender === g 
                      ? isDark ? '#000000' : '#FFFFFF'
                      : isDark 
                        ? 'rgba(255,255,255,0.6)' 
                        : 'rgba(0,0,0,0.6)'
                    } 
                  />
                  <Text style={[
                    styles.genderText,
                    { 
                      color: gender === g 
                        ? isDark ? '#000000' : '#FFFFFF'
                        : isDark 
                          ? 'rgba(255,255,255,0.8)' 
                          : 'rgba(0,0,0,0.8)'
                    }
                  ]}>
                    {g === 'male' ? 'Male' : 'Female'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Weight Input */}
          <InputField
            label="Weight"
            icon="barbell-outline"
            value={weight}
            onChangeText={setWeight}
            unit="kg"
            placeholder="70"
          />

          {/* Height Input */}
          <InputField
            label="Height"
            icon="resize-outline"
            value={height}
            onChangeText={setHeight}
            unit="cm"
            placeholder="175"
          />

          {/* Activity Level - ALL 5 LEVELS RESTORED - Fixed Dark Mode */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: currentColors.text }]}>
              Activity Level
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activityContainer}
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
                            ? 'rgba(20, 20, 20, 0.95)' 
                            : '#FFFFFF',
                        borderColor: isSelected
                          ? currentColors.primary
                          : isDark 
                            ? 'rgba(255,255,255,0.1)' 
                            : 'rgba(0,0,0,0.08)',
                      }
                    ]}
                    onPress={() => setActivityLevel(level.value)}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.activityIconWrapper,
                      {
                        backgroundColor: isSelected
                          ? isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.25)'
                          : isDark 
                            ? 'rgba(255,255,255,0.08)' 
                            : 'rgba(0,0,0,0.04)',
                      }
                    ]}>
                      <Ionicons 
                        name={level.icon as any} 
                        size={22} 
                        color={isSelected
                          ? isDark ? '#000000' : '#FFFFFF'
                          : isDark 
                            ? 'rgba(255,255,255,0.7)' 
                            : 'rgba(0,0,0,0.6)'
                        } 
                      />
                    </View>
                    <View style={styles.activityTextContainer}>
                      <Text style={[
                        styles.activityLabel,
                        { 
                          color: isSelected
                            ? isDark ? '#000000' : '#FFFFFF'
                            : currentColors.text
                        }
                      ]}>
                        {level.label}
                      </Text>
                      <Text style={[
                        styles.activityDescription,
                        { 
                          color: isSelected
                            ? isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)'
                            : isDark 
                              ? 'rgba(255,255,255,0.45)' 
                              : 'rgba(0,0,0,0.45)'
                        }
                      ]}>
                        {level.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Calculate Button */}
          <Animated.View style={{ transform: [{ scale: buttonPulse }] }}>
            <TouchableOpacity
              style={[
                styles.calculateButton,
                {
                  backgroundColor: currentColors.primary,
                  opacity: isFormValid ? 1 : 0.6,
                }
              ]}
              onPress={calculate}
              disabled={!isFormValid}
              activeOpacity={0.85}
            >
              <Animated.View
                style={[
                  styles.buttonGlow,
                  {
                    opacity: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.2, 0.4],
                    }),
                  },
                ]}
              />
              <MaterialCommunityIcons
                name="calculator-variant"
                size={24}
                color={isDark ? '#000000' : '#FFFFFF'}
              />
              <Text style={[
                styles.calculateButtonText,
                { color: isDark ? '#000000' : '#FFFFFF' }
              ]}>
                Calculate My Metrics
              </Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={isDark ? '#000000' : '#FFFFFF'}
              />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* Results Section */}
        {results.bmi && (
          <Animated.View
            style={[
              styles.resultsSection,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={isDark 
                ? ['rgba(25,25,25,0.98)', 'rgba(18,18,18,0.98)'] 
                : ['rgba(255,255,255,0.98)', 'rgba(250,250,250,0.98)']
              }
              style={[
                styles.resultsContainer,
                {
                  borderColor: currentColors.primary,
                }
              ]}
            >
              {/* BMI Result */}
              <View style={styles.resultMain}>
                <View style={styles.resultHeader}>
                  <View style={[
                    styles.resultIconWrapper,
                    {
                      backgroundColor: isDark ? 'rgba(0, 255, 65, 0.15)' : 'rgba(0, 255, 65, 0.08)',
                      borderWidth: 2,
                      borderColor: currentColors.primary,
                    }
                  ]}>
                    <Ionicons name="body-outline" size={32} color={currentColors.primary} />
                  </View>
                  <View>
                    <Text style={[styles.resultLabel, { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }]}>
                      YOUR BMI
                    </Text>
                    <View style={styles.resultValueRow}>
                      <Text style={[styles.resultValue, { color: currentColors.text }]}>
                        {results.bmi}
                      </Text>
                      {bmiCategory && (
                        <View style={[
                          styles.categoryBadge,
                          { backgroundColor: bmiCategory.color }
                        ]}>
                          <Text style={styles.categoryText}>
                            {bmiCategory.text}
                          </Text>
                        </View>
                      )}
                    </View>
                    {bmiCategory && (
                      <Text style={[styles.resultRange, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }]}>
                        {bmiCategory.range}
                      </Text>
                    )}
                  </View>
                </View>
              </View>

              <View style={[
                styles.divider,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }
              ]} />

              {/* BMR & Calories Grid */}
              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <View style={[styles.metricIcon, { backgroundColor: 'rgba(255, 107, 107, 0.15)' }]}>
                    <Ionicons name="flame-outline" size={24} color="#FF6B6B" />
                  </View>
                  <Text style={[styles.metricTitle, { color: currentColors.text }]}>
                    BMR
                  </Text>
                  <Text style={[styles.metricValue2, { color: currentColors.text }]}>
                    {results.bmr}
                  </Text>
                  <Text style={[styles.metricUnit2, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }]}>
                    kcal/day
                  </Text>
                  <Text style={[styles.metricDescription2, { color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }]}>
                    At rest
                  </Text>
                </View>

                <View style={[styles.metricDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />

                <View style={styles.metricItem}>
                  <View style={[styles.metricIcon, { backgroundColor: 'rgba(255, 193, 7, 0.15)' }]}>
                    <Ionicons name="nutrition-outline" size={24} color="#FFC107" />
                  </View>
                  <Text style={[styles.metricTitle, { color: currentColors.text }]}>
                    Daily Calories
                  </Text>
                  <Text style={[styles.metricValue2, { color: currentColors.text }]}>
                    {results.calories}
                  </Text>
                  <Text style={[styles.metricUnit2, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }]}>
                    kcal
                  </Text>
                  <Text style={[styles.metricDescription2, { color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }]}>
                    With activity
                  </Text>
                </View>
              </View>

              {/* Disclaimer */}
              <View style={[
                styles.disclaimer,
                {
                  backgroundColor: isDark ? 'rgba(0, 255, 65, 0.06)' : 'rgba(0, 255, 65, 0.03)',
                  borderColor: isDark ? 'rgba(0, 255, 65, 0.15)' : 'rgba(0, 255, 65, 0.1)',
                }
              ]}>
                <Ionicons name="information-circle-outline" size={16} color={currentColors.primary} />
                <Text style={[styles.disclaimerText, { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }]}>
                  These are estimates. Consult a professional for personalized advice.
                </Text>
              </View>
            </LinearGradient>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    padding: 20,
  },
  inputsSection: {
    marginBottom: 24,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  inputUnit: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 8,
  },
  genderText: {
    fontSize: 16,
    fontWeight: '600',
  },
  activityContainer: {
    paddingVertical: 4,
    paddingRight: 4,
    gap: 12,
  },
  activityCard: {
    width: width * 0.65,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  activityIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityTextContainer: {
    flex: 1,
  },
  activityLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginTop: 12,
    marginBottom: 8,
    gap: 12,
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  buttonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#00FF41',
  },
  calculateButtonText: {
    fontWeight: '800',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  resultsSection: {
    marginTop: 8,
  },
  resultsContainer: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  resultMain: {
    marginBottom: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  resultIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 1,
  },
  resultValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
  },
  resultRange: {
    fontSize: 13,
    fontWeight: '500',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  divider: {
    height: 1,
    marginVertical: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  metricValue2: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  metricUnit2: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  metricDescription2: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
  metricDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 16,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginTop: 24,
    gap: 10,
    borderWidth: 1,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
  },
});