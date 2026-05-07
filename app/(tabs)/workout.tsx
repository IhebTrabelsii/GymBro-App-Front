import { Colors } from "@/constants/Colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Modal,
  Image,
} from "react-native";
import { useSimpleTheme } from "../../context/SimpleThemeContext";

const { width } = Dimensions.get("window");

type BodyType = {
  id: string;
  name: "Ectomorph" | "Mesomorph" | "Endomorph";
  desc: string;
  icon: string;
  color: string;
  characteristics: Array<{ icon: string; label: string }>;
  planCount?: number;
};

type Plan = {
  _id: string;
  title: string;
  description: string;
  bodyType: "Ectomorph" | "Mesomorph" | "Endomorph";
  focus: string;
  days: string[];
  tips: string;
  icon: string;
};

type PlansResponse = { success: boolean; data: Plan[] };
type SetBodyTypeResponse = {
  success: boolean;
  message: string;
  missions?: any[];
  error?: string;
};
type LogWorkoutResponse = {
  success: boolean;
  message: string;
  weeklyProgress?: {
    weekStart: Date;
    completedWorkouts: number;
    weeklyGoal: number;
    rewardClaimed: boolean;
  };
  completedMissions?: Array<{ id: string; title: string; reward: number }>;
  aiMessagesRemaining?: number;
  error?: string;
};

const BODY_TYPE_META: Record<string, { emoji: string; tagline: string }> = {
  Ectomorph: { emoji: "⚡", tagline: "Fast metabolism · Built to endure" },
  Mesomorph: { emoji: "🏆", tagline: "Naturally athletic · Built to perform" },
  Endomorph: { emoji: "🔥", tagline: "High power output · Built to grind" },
};

const gymBroLogo  = require("@/assets/images/sections/Icon_gym_bro.png");
const gymBroLogoT = require("@/assets/images/sections/gym_bro_khw.png");

const BODY_TYPE_IMAGES: Record<string, any> = {
  Ectomorph: require("@/assets/images/bodytypes/ectomorph.png"),
  Mesomorph: require("@/assets/images/bodytypes/mesomorph.png"),
  Endomorph: require("@/assets/images/bodytypes/endomorph.png"),
};

const PARTICLE_CONFIG = [
  { x: 20,  delay: 0,    size: 3, duration: 2600 },
  { x: 70,  delay: 500,  size: 4, duration: 3000 },
  { x: 130, delay: 200,  size: 3, duration: 2800 },
  { x: 190, delay: 700,  size: 5, duration: 3200 },
  { x: 250, delay: 350,  size: 3, duration: 2700 },
  { x: 310, delay: 600,  size: 4, duration: 2900 },
];

const FloatingParticles = ({ color }: { color: string }) => {
  const a0 = useRef(new Animated.Value(0)).current;
  const a1 = useRef(new Animated.Value(0)).current;
  const a2 = useRef(new Animated.Value(0)).current;
  const a3 = useRef(new Animated.Value(0)).current;
  const a4 = useRef(new Animated.Value(0)).current;
  const a5 = useRef(new Animated.Value(0)).current;
  const anims = [a0, a1, a2, a3, a4, a5];

  useEffect(() => {
    anims.forEach((anim, i) => {
      const { delay, duration } = PARTICLE_CONFIG[i];
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.delay(400 + i * 60),
        ]),
      ).start();
    });
  }, []);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {anims.map((anim, i) => {
        const { x, size } = PARTICLE_CONFIG[i];
        return (
          <Animated.View
            key={i}
            style={{
              position: "absolute",
              bottom: 16,
              left: x,
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
              opacity: anim.interpolate({
                inputRange: [0, 0.15, 0.75, 1],
                outputRange: [0, 0.65, 0.2, 0],
              }),
              transform: [
                {
                  translateY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -160],
                  }),
                },
                {
                  scale: anim.interpolate({
                    inputRange: [0, 0.4, 0.8, 1],
                    outputRange: [1, 1.6, 1.1, 0.3],
                  }),
                },
              ],
            }}
          />
        );
      })}
    </View>
  );
};

const PulsingDot = ({ color }: { color: string }) => {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.9, duration: 950, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,   duration: 950, useNativeDriver: true }),
      ]),
    ).start();
  }, []);
  return (
    <Animated.View
      style={{
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: color,
        transform: [{ scale: pulse }],
        opacity: pulse.interpolate({
          inputRange: [1, 1.9],
          outputRange: [1, 0.3],
        }),
      }}
    />
  );
};

const HeroStat = ({
  value,
  label,
  color,
  icon,
  isDark,
}: {
  value: string | number;
  label: string;
  color: string;
  icon: string;
  isDark: boolean;
}) => (
  <View style={heroStatStyles.wrap}>
    <View style={[heroStatStyles.iconBox, { backgroundColor: color + "18" }]}>
      <Ionicons name={icon as any} size={14} color={color} />
    </View>
    <Text style={[heroStatStyles.value, { color: isDark ? "#fff" : "#111" }]}>
      {value}
    </Text>
    <Text style={[heroStatStyles.label, { color: isDark ? "#555" : "#bbb" }]}>
      {label}
    </Text>
  </View>
);

const heroStatStyles = StyleSheet.create({
  wrap:    { alignItems: "center", gap: 4 },
  iconBox: { width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  value:   { fontSize: 18, fontWeight: "900", letterSpacing: -0.3 },
  label:   { fontSize: 9, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6 },
});

export default function WorkoutScreen() {
  const router = useRouter();
  const { theme, toggleTheme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === "dark";

  const [modalVisible, setModalVisible]       = useState(false);
  const [selectedBodyType, setSelectedBodyType] = useState<BodyType | null>(null);
  const [savedPlans, setSavedPlans]            = useState<string[]>([]);
  const [loading, setLoading]                  = useState(true);
  const [plans, setPlans]                      = useState<Plan[]>([]);

  const [bodyTypes, setBodyTypes] = useState<BodyType[]>([
    {
      id: "1",
      name: "Ectomorph",
      desc: "Lean, fast metabolism. Focus on heavy weights + carbs.",
      icon: "leaf-outline",
      color: "#39FF14",
      characteristics: [
        { icon: "weight",      label: "Heavy Weights" },
        { icon: "food-apple",  label: "High Carbs" },
        { icon: "dumbbell",    label: "Strength" },
      ],
      planCount: 0,
    },
    {
      id: "2",
      name: "Mesomorph",
      desc: "Naturally muscular. Balanced strength/cardio works best.",
      icon: "fitness-outline",
      color: "#00F0FF",
      characteristics: [
        { icon: "weight",      label: "Balanced" },
        { icon: "food-apple",  label: "Balanced" },
        { icon: "dumbbell",    label: "Hybrid" },
      ],
      planCount: 0,
    },
    {
      id: "3",
      name: "Endomorph",
      desc: "Gains fat easily. Prioritize cardio + circuit training.",
      icon: "flash-outline",
      color: "#6c7deb",
      characteristics: [
        { icon: "weight",      label: "Cardio Focus" },
        { icon: "food-apple",  label: "Low Carbs" },
        { icon: "dumbbell",    label: "Endurance" },
      ],
      planCount: 0,
    },
  ]);

  const heroEntryAnim = useRef(new Animated.Value(0)).current;
  const stagger1      = useRef(new Animated.Value(0)).current;
  const stagger2      = useRef(new Animated.Value(0)).current;
  const stagger3      = useRef(new Animated.Value(0)).current;
  const pulseAnim     = useRef(new Animated.Value(1)).current;
  const glowAnim      = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(heroEntryAnim, {
      toValue: 1,
      damping: 16,
      stiffness: 80,
      mass: 1.1,
      useNativeDriver: true,
    }).start();

    [
      { anim: stagger1, delay: 200 },
      { anim: stagger2, delay: 360 },
      { anim: stagger3, delay: 500 },
    ].forEach(({ anim, delay }) =>
      setTimeout(
        () =>
          Animated.spring(anim, {
            toValue: 1,
            tension: 55,
            friction: 10,
            useNativeDriver: true,
          }).start(),
        delay,
      ),
    );

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 1800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 1800, useNativeDriver: true }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2400, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2400, useNativeDriver: true }),
      ]),
    ).start();

    fetchPlans();
    loadSavedPlans();
  }, []);

  const showBodyTypeImage = (bodyType: BodyType) => {
    setSelectedBodyType(bodyType);
    setModalVisible(true);
  };

  const fetchPlans = async () => {
    try {
      const response = await fetch("http://192.168.100.143:3000/api/plans");
      const data = (await response.json()) as PlansResponse;
      if (response.ok && data.success) {
        setPlans(data.data);
        setBodyTypes((prev) =>
          prev.map((bt) => ({
            ...bt,
            planCount: data.data.filter((p) => p.bodyType === bt.name).length,
          })),
        );
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedPlans = async () => {
    try {
      const saved = await AsyncStorage.getItem("savedPlans");
      if (saved) setSavedPlans(JSON.parse(saved));
    } catch (error) {
      console.error("Error loading saved plans:", error);
    }
  };

  const saveSavedPlans = async (updated: string[]) => {
    try {
      await AsyncStorage.setItem("savedPlans", JSON.stringify(updated));
    } catch (error) {
      console.error("Error saving plans:", error);
    }
  };

  const handleSelect = (type: string) => {
    const plansForType = plans.filter((plan) => plan.bodyType === type);
    router.push({
      pathname: "/config/plan",
      params: { type, plans: JSON.stringify(plansForType) },
    });
  };

  const setUserBodyType = async (bodyType: string) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Not Logged In", "Please log in to set your body type");
        router.push("/login");
        return;
      }
      const response = await fetch(
        "http://192.168.100.143:3000/api/users/set-body-type",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ bodyType }),
        },
      );
      const data = (await response.json()) as SetBodyTypeResponse;
      if (response.ok && data.success) {
        Alert.alert(
          "✅ Body Type Set!",
          `Your body type is now ${bodyType}. Missions have been generated! Check your profile.`,
        );
      } else {
        Alert.alert("Error", data.error || "Failed to set body type");
      }
    } catch (error) {
      console.error("Set body type error:", error);
      Alert.alert("Error", "Could not set body type");
    }
  };

  const logWorkout = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Not Logged In", "Please log in to log workouts");
        router.push("/login");
        return;
      }
      const response = await fetch(
        "http://192.168.100.143:3000/api/users/log-workout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ workoutId: "manual", duration: 30 }),
        },
      );
      const data = (await response.json()) as LogWorkoutResponse;
      if (response.ok && data.success) {
        let message = "✅ Workout logged!";
        if (data.completedMissions && data.completedMissions.length > 0) {
          message += `\n\n🎉 Mission Complete: ${data.completedMissions[0].title}\n+${data.completedMissions[0].reward} AI Messages!`;
        }
        Alert.alert("Success", message);
      } else {
        Alert.alert("Error", data.error || "Failed to log workout");
      }
    } catch (error) {
      console.error("Log workout error:", error);
      Alert.alert("Error", "Could not log workout");
    }
  };

  const toggleSavePlan = (planName: string) => {
    const updated = savedPlans.includes(planName)
      ? savedPlans.filter((item) => item !== planName)
      : [...savedPlans, planName];
    setSavedPlans(updated);
    saveSavedPlans(updated);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: currentColors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentColors.primary} />
          <Text style={[styles.loadingText, { color: currentColors.text }]}>
            Loading workout plans...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>

      {}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: isDark ? "#1a1a1a" : "#fff" },
            ]}
          >
            <View
              style={[
                styles.modalHeader,
                { borderBottomColor: isDark ? "#333" : "#eee" },
              ]}
            >
              <Text
                style={[
                  styles.modalTitle,
                  { color: selectedBodyType?.color || currentColors.primary },
                ]}
              >
                {selectedBodyType?.name}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={isDark ? "#fff" : "#000"} />
              </TouchableOpacity>
            </View>

            <View style={styles.imageContainer}>
              {selectedBodyType && BODY_TYPE_IMAGES[selectedBodyType.name] ? (
                <Image
                  source={BODY_TYPE_IMAGES[selectedBodyType.name]}
                  style={styles.bodyTypeImage}
                  resizeMode="contain"
                />
              ) : (
                <View
                  style={[
                    styles.imagePlaceholder,
                    { backgroundColor: selectedBodyType?.color + "20" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="human"
                    size={80}
                    color={selectedBodyType?.color}
                  />
                  <Text
                    style={[
                      styles.placeholderText,
                      { color: selectedBodyType?.color },
                    ]}
                  >
                    {selectedBodyType?.name} Reference Image
                  </Text>
                </View>
              )}
            </View>

            <Text style={[styles.modalDesc, { color: isDark ? "#ccc" : "#666" }]}>
              {selectedBodyType?.desc}
            </Text>

            <TouchableOpacity
              style={[
                styles.closeModalBtn,
                { backgroundColor: selectedBodyType?.color || currentColors.primary },
              ]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeModalBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: isDark
              ? "rgba(8,8,8,0.98)"
              : "rgba(255,255,255,0.98)",
            borderBottomColor: isDark
              ? currentColors.primary + "18"
              : currentColors.primary + "10",
          },
        ]}
      >
        <LinearGradient
          colors={[
            currentColors.primary + "00",
            currentColors.primary,
            currentColors.primary + "00",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.topBarLine}
        />
        <TouchableOpacity onPress={() => router.replace("/")} activeOpacity={0.7}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={[currentColors.primary + "30", currentColors.primary + "10"]}
              style={styles.logoIconWrapper}
            >
              <Image
                source={gymBroLogo}
                style={{ width: 45, height: 45, tintColor: currentColors.primary }}
                resizeMode="contain"
              />
            </LinearGradient>
            <View>
              <Image
                source={gymBroLogoT}
                style={{ width: 100, height: 30, tintColor: currentColors.primary }}
                resizeMode="contain"
              />
              <View
                style={[styles.logoUnderline, { backgroundColor: currentColors.primary }]}
              />
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.topRightSection}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[
              styles.backButton,
              {
                backgroundColor: isDark
                  ? currentColors.primary + "12"
                  : currentColors.primary + "08",
                borderColor: isDark
                  ? currentColors.primary + "35"
                  : currentColors.primary + "25",
              },
            ]}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={16} color={currentColors.primary} />
            <Text style={[styles.backText, { color: currentColors.primary }]}>
              Back
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleTheme}
            style={[
              styles.themeToggle,
              { backgroundColor: currentColors.primary, shadowColor: currentColors.primary },
            ]}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isDark ? "sunny" : "moon"}
              size={16}
              color={isDark ? currentColors.background : "#FFF"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {}
      <ScrollView
        style={{ backgroundColor: currentColors.background }}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {}
        <Animated.View
          style={{
            opacity: heroEntryAnim.interpolate({
              inputRange: [0, 0.35, 1],
              outputRange: [0, 0.7, 1],
            }),
            transform: [
              {
                translateY: heroEntryAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [44, 0],
                }),
              },
              {
                scale: heroEntryAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.94, 1],
                }),
              },
            ],
          }}
        >

          {
}
          <View
            style={[
              styles.heroCard,
              {
                backgroundColor: isDark ? "#0c0c0c" : "#fff",
                borderColor: isDark
                  ? currentColors.primary + "35"
                  : currentColors.primary + "18",
              },
            ]}
          >
            {}
            <View
              style={[
                styles.heroCorner,
                { borderColor: currentColors.primary + "45" },
              ]}
            />

            {}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.heroGlow1,
                {
                  backgroundColor: currentColors.primary,
                  opacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.05, 0.13],
                  }),
                },
              ]}
            />
            <Animated.View
              pointerEvents="none"
              style={[
                styles.heroGlow2,
                {
                  backgroundColor: "#FF10F0",
                  opacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.03, 0.08],
                  }),
                },
              ]}
            />

            {}
            <FloatingParticles color={currentColors.primary} />

            {}
            <View style={styles.heroRow}>

              {}
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <View
                  style={[
                    styles.heroIconOuter,
                    { borderColor: currentColors.primary + "35" },
                  ]}
                >
                  <View
                    style={[
                      styles.heroIconInner,
                      { borderColor: currentColors.primary + "65" },
                    ]}
                  >
                    <LinearGradient
                      colors={[
                        currentColors.primary + "30",
                        currentColors.primary + "08",
                      ]}
                      style={styles.heroIconCore}
                    >
                      <MaterialCommunityIcons
                        name="human"
                        size={32}
                        color={currentColors.primary}
                      />
                    </LinearGradient>
                  </View>
                </View>
              </Animated.View>

              {}
              <View style={styles.heroTextBlock}>
                {}
                <View
                  style={[
                    styles.heroPill,
                    {
                      backgroundColor: currentColors.primary + "12",
                      borderColor: currentColors.primary + "28",
                    },
                  ]}
                >
                  <PulsingDot color={currentColors.primary} />
                  <Text style={[styles.heroPillText, { color: currentColors.primary }]}>
                    GENETIC BLUEPRINT
                  </Text>
                </View>

                <Text style={[styles.heroTitle, { color: currentColors.text }]}>
                  Discover Your{" "}
                  <Text style={{ color: currentColors.primary }}>Body Type</Text>
                </Text>
                <Text
                  style={[
                    styles.heroSubtitle,
                    { color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)" },
                  ]}
                >
                  Train smarter with a plan built for your genetics
                </Text>
              </View>
            </View>

            {}
            <View
              style={[
                styles.heroStatStrip,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(0,0,0,0.03)",
                  borderColor: isDark
                    ? currentColors.primary + "15"
                    : currentColors.primary + "10",
                },
              ]}
            >
              <HeroStat
                value={plans.length}
                label="Plans"
                color={currentColors.primary}
                icon="barbell-outline"
                isDark={isDark}
              />
              <View style={[styles.statDivider, { backgroundColor: isDark ? "#222" : "#eee" }]} />
              <HeroStat
                value={3}
                label="Body Types"
                color="#FF6B6B"
                icon="body-outline"
                isDark={isDark}
              />
              <View style={[styles.statDivider, { backgroundColor: isDark ? "#222" : "#eee" }]} />
              <HeroStat
                value={savedPlans.length}
                label="Saved"
                color="#FFC107"
                icon="bookmark-outline"
                isDark={isDark}
              />
            </View>
          </View>

          {}
          <View style={styles.sectionLabelRow}>
            <View style={[styles.sectionLine, { backgroundColor: isDark ? "#222" : "#eee" }]} />
            <Text style={[styles.sectionLabel, { color: isDark ? "#444" : "#ccc" }]}>
              SELECT YOUR TYPE
            </Text>
            <View style={[styles.sectionLine, { backgroundColor: isDark ? "#222" : "#eee" }]} />
          </View>

          {}
          <FlatList
            data={bodyTypes}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.grid}
            renderItem={({ item, index }) => {
              const meta = BODY_TYPE_META[item.name];
              const staggerAnims = [stagger1, stagger2, stagger3];
              const anim = staggerAnims[index] ?? stagger1;
              return (
                <Animated.View
                  style={{
                    opacity: anim,
                    transform: [
                      {
                        translateY: anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [28, 0],
                        }),
                      },
                      {
                        scale: anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.96, 1],
                        }),
                      },
                    ],
                  }}
                >
                  <TouchableOpacity
                    onPress={() => handleSelect(item.name)}
                    activeOpacity={0.88}
                  >
                    <View
                      style={[
                        styles.card,
                        {
                          backgroundColor: isDark ? "#0e0e0e" : "#fff",
                          borderColor: isDark ? item.color + "35" : item.color + "20",
                        },
                      ]}
                    >
                      <View
                        style={[styles.cardStrip, { backgroundColor: item.color }]}
                      />
                      <Animated.View
                        style={[
                          styles.cardGlow,
                          {
                            backgroundColor: item.color,
                            opacity: glowAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.02, 0.06],
                            }),
                          },
                        ]}
                      />

                      <View style={styles.cardHeader}>
                        <TouchableOpacity
                          style={[
                            styles.cardIconBox,
                            { backgroundColor: item.color + "15" },
                          ]}
                          onPress={() => showBodyTypeImage(item)}
                        >
                          <Ionicons
                            name={item.icon as any}
                            size={24}
                            color={item.color}
                          />
                        </TouchableOpacity>
                        <View style={styles.cardTitleBlock}>
                          <Text style={[styles.cardTitle, { color: item.color }]}>
                            {item.name}
                          </Text>
                          <Text
                            style={[
                              styles.cardTagline,
                              { color: isDark ? "#555" : "#bbb" },
                            ]}
                          >
                            {meta.emoji} {meta.tagline}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={[
                            styles.bookmarkBtn,
                            {
                              backgroundColor: savedPlans.includes(item.name)
                                ? item.color + "18"
                                : "transparent",
                              borderColor: savedPlans.includes(item.name)
                                ? item.color + "50"
                                : isDark ? "#2a2a2a" : "#e8e8e8",
                            },
                          ]}
                          onPress={() => toggleSavePlan(item.name)}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={savedPlans.includes(item.name) ? "bookmark" : "bookmark-outline"}
                            size={18}
                            color={
                              savedPlans.includes(item.name)
                                ? item.color
                                : isDark ? "#444" : "#ccc"
                            }
                          />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.charsRow}>
                        {item.characteristics.map((char, i) => (
                          <View
                            key={i}
                            style={[
                              styles.charPill,
                              {
                                backgroundColor: isDark
                                  ? item.color + "10"
                                  : item.color + "08",
                                borderColor: isDark
                                  ? item.color + "28"
                                  : item.color + "18",
                              },
                            ]}
                          >
                            <MaterialCommunityIcons
                              name={char.icon as any}
                              size={14}
                              color={item.color}
                            />
                            <Text style={[styles.charText, { color: item.color }]}>
                              {char.label}
                            </Text>
                          </View>
                        ))}
                      </View>

                      <View
                        style={[
                          styles.cardDivider,
                          {
                            backgroundColor: isDark
                              ? item.color + "15"
                              : item.color + "10",
                          },
                        ]}
                      />

                      <Text
                        style={[
                          styles.cardDesc,
                          {
                            color: isDark
                              ? "rgba(255,255,255,0.75)"
                              : "rgba(0,0,0,0.65)",
                          },
                        ]}
                      >
                        {item.desc}
                      </Text>

                      <View style={styles.cardFooter}>
                        <View
                          style={[
                            styles.planCountPill,
                            {
                              backgroundColor: item.color + "12",
                              borderColor: item.color + "28",
                            },
                          ]}
                        >
                          <View style={[styles.planDot, { backgroundColor: item.color }]} />
                          <Text style={[styles.planCountText, { color: item.color }]}>
                            {item.planCount ?? 0} Plans
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={[
                            styles.setTypeBtn,
                            {
                              borderColor: item.color + "50",
                              backgroundColor: item.color + "10",
                            },
                          ]}
                          onPress={() => {
                            Alert.alert(
                              "Set Body Type",
                              `Set your body type to ${item.name}? This will generate personalized missions for you.`,
                              [
                                { text: "Cancel", style: "cancel" },
                                { text: "Confirm", onPress: () => setUserBodyType(item.name) },
                              ],
                            );
                          }}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="person-outline" size={14} color={item.color} />
                          <Text style={[styles.setTypeText, { color: item.color }]}>
                            Set Mine
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.viewPlansBtn, { backgroundColor: item.color }]}
                          onPress={() => handleSelect(item.name)}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.viewPlansBtnText}>View Plans</Text>
                          <Ionicons name="arrow-forward" size={14} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            }}
          />

          {}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[
                styles.logWorkoutButton,
                { shadowColor: currentColors.primary },
              ]}
              onPress={logWorkout}
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
                  styles.btnShimmer,
                  {
                    opacity: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.14],
                    }),
                  },
                ]}
              />
              <View style={[styles.logBtnIcon, { backgroundColor: "rgba(0,0,0,0.15)" }]}>
                <Ionicons
                  name="barbell-outline"
                  size={20}
                  color={isDark ? "#000" : "#fff"}
                />
              </View>
              <Text
                style={[
                  styles.logWorkoutButtonText,
                  { color: isDark ? "#000" : "#fff" },
                ]}
              >
                Log Today's Workout
              </Text>
              <View style={[styles.logBtnCheck, { backgroundColor: "rgba(0,0,0,0.12)" }]}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={isDark ? "#000" : "#fff"}
                />
              </View>
            </TouchableOpacity>
          </Animated.View>

          {}
          {savedPlans.length > 0 && (
            <View
              style={[
                styles.savedSection,
                {
                  backgroundColor: isDark ? "#0e0e0e" : "#fff",
                  borderColor: isDark
                    ? currentColors.primary + "20"
                    : currentColors.primary + "10",
                },
              ]}
            >
              <View style={styles.savedHeader}>
                <View
                  style={[
                    styles.savedIconBox,
                    { backgroundColor: currentColors.primary + "12" },
                  ]}
                >
                  <Ionicons name="bookmark" size={18} color={currentColors.primary} />
                </View>
                <View>
                  <Text style={[styles.savedTitle, { color: currentColors.text }]}>
                    Saved Types
                  </Text>
                  <Text style={[styles.savedSubtitle, { color: isDark ? "#555" : "#bbb" }]}>
                    {savedPlans.length} saved
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.savedDivider,
                  { backgroundColor: isDark ? "#1a1a1a" : "#f0f0f0" },
                ]}
              />

              {savedPlans.map((plan, index) => {
                const planData = bodyTypes.find((bt) => bt.name === plan);
                return (
                  <TouchableOpacity
                    key={plan}
                    style={[
                      styles.savedItem,
                      {
                        borderBottomWidth: index === savedPlans.length - 1 ? 0 : 1,
                        borderBottomColor: isDark ? "#141414" : "#f5f5f5",
                      },
                    ]}
                    onPress={() => handleSelect(plan)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.savedItemLeft}>
                      <View
                        style={[
                          styles.savedItemIcon,
                          {
                            backgroundColor: (planData?.color ?? "#fff") + "15",
                            borderColor: (planData?.color ?? "#fff") + "30",
                          },
                        ]}
                      >
                        <Ionicons
                          name={planData?.icon as any}
                          size={18}
                          color={planData?.color}
                        />
                      </View>
                      <View>
                        <Text style={[styles.savedItemName, { color: currentColors.text }]}>
                          {plan}
                        </Text>
                        <Text
                          style={[styles.savedItemSub, { color: isDark ? "#444" : "#ccc" }]}
                        >
                          {planData?.planCount ?? 0} plans available
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.savedChevron,
                        { backgroundColor: currentColors.primary + "12" },
                      ]}
                    >
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={currentColors.primary}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {}
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: isDark ? "#0e0e0e" : "#fff",
                borderColor: isDark
                  ? currentColors.primary + "18"
                  : currentColors.primary + "10",
              },
            ]}
          >
            <LinearGradient
              colors={
                isDark
                  ? [currentColors.primary + "08", "transparent"]
                  : [currentColors.primary + "05", "transparent"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.infoHeader}>
              <View
                style={[
                  styles.infoIconBox,
                  { backgroundColor: currentColors.primary + "12" },
                ]}
              >
                <Ionicons
                  name="information-circle"
                  size={18}
                  color={currentColors.primary}
                />
              </View>
              <View>
                <Text style={[styles.infoTitle, { color: currentColors.text }]}>
                  Body Type Guide
                </Text>
                <Text style={[styles.infoSub, { color: isDark ? "#555" : "#bbb" }]}>
                  Understanding genetics
                </Text>
              </View>
            </View>
            <Text
              style={[
                styles.infoText,
                { color: isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.6)" },
              ]}
            >
              Each body type responds differently to training and nutrition.
              Select your type to get a personalized workout plan designed for
              optimal results.
            </Text>
          </View>

          {}
          <TouchableOpacity
            style={[
              styles.backHomeBtn,
              {
                backgroundColor: isDark ? "#141414" : "#f5f5f5",
                borderColor: isDark ? "#222" : "#e8e8e8",
              },
            ]}
            activeOpacity={0.8}
            onPress={() => router.push("/")}
          >
            <MaterialCommunityIcons
              name="home"
              size={20}
              color={isDark ? "#555" : "#aaa"}
            />
            <Text style={[styles.backHomeBtnText, { color: isDark ? "#555" : "#aaa" }]}>
              Back to Home
            </Text>
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText:      { marginTop: 16, fontSize: 15, fontWeight: "600" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: width * 0.8,
    borderRadius: 24,
    overflow: "hidden",
    ...Platform.select({
      ios:     { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle:      { fontSize: 22, fontWeight: "800" },
  closeButton:     { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  imageContainer:  { padding: 20, alignItems: "center", justifyContent: "center", minHeight: 200 },
  bodyTypeImage:   { width: "100%", height: 200, borderRadius: 16 },
  imagePlaceholder:{ width: 180, height: 180, borderRadius: 90, justifyContent: "center", alignItems: "center" },
  placeholderText: { marginTop: 12, fontSize: 14, fontWeight: "600", textAlign: "center" },
  modalDesc:       { fontSize: 14, lineHeight: 20, textAlign: "center", paddingHorizontal: 20, paddingBottom: 20 },
  closeModalBtn:   { marginHorizontal: 20, marginBottom: 20, paddingVertical: 12, borderRadius: 24, alignItems: "center" },
  closeModalBtnText: { color: "#000", fontSize: 16, fontWeight: "700" },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: Platform.OS === "ios" ? 52 : 42,
    paddingBottom: 14,
    borderBottomWidth: 1,
    position: "relative",
    overflow: "hidden",
    ...Platform.select({
      ios:     { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  topBarLine:       { position: "absolute", top: 0, left: 0, right: 0, height: 2 },
  logoContainer:    { flexDirection: "row", alignItems: "center", gap: 9 },
  logoIconWrapper:  { width: 32, height: 32, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  logoUnderline:    { height: 2, width: 22, borderRadius: 1, marginTop: 1 },
  topRightSection:  { flexDirection: "row", alignItems: "center", gap: 10 },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  backText:    { fontSize: 13, fontWeight: "700" },
  themeToggle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios:     { shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.28, shadowRadius: 7 },
      android: { elevation: 5 },
    }),
  },

  scrollContainer: { paddingTop: 18, paddingHorizontal: 18, paddingBottom: 44 },

  heroCard: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1.5,
    position: "relative",
    overflow: "hidden",
    ...Platform.select({
      ios:     { shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 18 },
      android: { elevation: 6 },
    }),
  },
  heroCorner: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 60,
    height: 60,
    borderRightWidth: 2,
    borderTopWidth: 2,
    borderTopRightRadius: 24,
  },
  heroGlow1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -70,
    right: -70,
  },
  heroGlow2: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    bottom: -50,
    left: -50,
  },

  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
    zIndex: 1,
  },
  heroIconOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heroIconInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  heroIconCore: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  heroTextBlock: { flex: 1, gap: 5 },
  heroPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
  },
  heroPillText: { fontSize: 9, fontWeight: "800", letterSpacing: 1.1 },
  heroTitle: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0.1,
    lineHeight: 26,
  },
  heroSubtitle: {
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 16,
  },

  heroStatStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    zIndex: 1,
  },
  statDivider: { width: 1, height: 28 },

  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  sectionLine:  { flex: 1, height: 1 },
  sectionLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1.4 },

  grid: { gap: 14, marginBottom: 16 },
  card: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1.5,
    position: "relative",
    overflow: "hidden",
    ...Platform.select({
      ios:     { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 14 },
      android: { elevation: 4 },
    }),
  },
  cardStrip:   { position: "absolute", top: 0, left: 0, right: 0, height: 3 },
  cardGlow:    { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  cardHeader:  { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8, marginBottom: 14 },
  cardIconBox: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  cardTitleBlock: { flex: 1 },
  cardTitle:   { fontSize: 20, fontWeight: "900", letterSpacing: 0.3 },
  cardTagline: { fontSize: 11, fontWeight: "500", marginTop: 2 },
  bookmarkBtn: { width: 34, height: 34, borderRadius: 17, justifyContent: "center", alignItems: "center", borderWidth: 1.5 },
  charsRow:    { flexDirection: "row", gap: 7, marginBottom: 14, flexWrap: "wrap" },
  charPill:    { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  charText:    { fontSize: 11, fontWeight: "700" },
  cardDivider: { height: 1, marginBottom: 12 },
  cardDesc:    { fontSize: 13, lineHeight: 20, fontWeight: "500", marginBottom: 16 },
  cardFooter:  { flexDirection: "row", alignItems: "center", gap: 8 },
  planCountPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 12, borderWidth: 1 },
  planDot:       { width: 5, height: 5, borderRadius: 2.5 },
  planCountText: { fontSize: 11, fontWeight: "700" },
  setTypeBtn:    { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9, paddingVertical: 7, borderRadius: 13, borderWidth: 1.5 },
  setTypeText:   { fontSize: 11, fontWeight: "700" },
  viewPlansBtn:  { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, marginLeft: "auto" },
  viewPlansBtnText: { color: "#fff", fontSize: 12, fontWeight: "800" },

  logWorkoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 17,
    borderRadius: 22,
    marginBottom: 14,
    gap: 10,
    overflow: "hidden",
    position: "relative",
    ...Platform.select({
      ios:     { shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 18 },
      android: { elevation: 10 },
    }),
  },
  btnShimmer: {
    position: "absolute",
    top: 0,
    left: "-20%",
    width: "40%",
    height: "100%",
    backgroundColor: "#fff",
    transform: [{ skewX: "-20deg" }],
  },
  logBtnIcon:           { width: 34, height: 34, borderRadius: 17, justifyContent: "center", alignItems: "center" },
  logWorkoutButtonText: { fontSize: 16, fontWeight: "900", letterSpacing: 0.3 },
  logBtnCheck:          { width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center" },

  savedSection: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1.5,
    ...Platform.select({
      ios:     { shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.04, shadowRadius: 10 },
      android: { elevation: 2 },
    }),
  },
  savedHeader:   { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  savedIconBox:  { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  savedTitle:    { fontSize: 15, fontWeight: "800" },
  savedSubtitle: { fontSize: 11, fontWeight: "500", marginTop: 1 },
  savedDivider:  { height: 1, marginBottom: 4 },
  savedItem:     { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
  savedItemLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  savedItemIcon: { width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center", borderWidth: 1.5 },
  savedItemName: { fontSize: 14, fontWeight: "700" },
  savedItemSub:  { fontSize: 11, fontWeight: "500", marginTop: 1 },
  savedChevron:  { width: 30, height: 30, borderRadius: 15, justifyContent: "center", alignItems: "center" },

  infoCard: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1.5,
    overflow: "hidden",
    position: "relative",
    ...Platform.select({
      ios:     { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  infoHeader:  { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  infoIconBox: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  infoTitle:   { fontSize: 15, fontWeight: "800" },
  infoSub:     { fontSize: 11, fontWeight: "500", marginTop: 1 },
  infoText:    { fontSize: 13, lineHeight: 21, fontWeight: "500" },

  backHomeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 18,
    marginBottom: 8,
    gap: 8,
    borderWidth: 1.5,
  },
  backHomeBtnText: { fontSize: 14, fontWeight: "700" },
});