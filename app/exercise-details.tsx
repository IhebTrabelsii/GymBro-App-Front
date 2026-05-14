import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState, useEffect } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Share,
  Linking,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useSimpleTheme } from "../context/SimpleThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Exercise = {
  id: string;
  name: string;
  category: string;
  sets: number;
  reps: string;
  rest: string;
  difficulty: string;
  muscleGroups: string[];
  equipment: string[];
  description: string;
  tips: string[];
  imageUrl: string;
  videoUrl: string;
  gifUrl: string;
  color?: string;
  calories?: string;
  popularity?: number;
  expertTip?: string;
};

type PlanData = {
  name: string;
  description: string;
  color: string;
  emoji: string;
  stats: {
    totalExercises: number;
    weeklyFrequency: number;
    avgDuration: string;
    caloriesBurn: string;
  };
  exercises: Exercise[];
};

const { width } = Dimensions.get("window");
const API_BASE_URL = "https://gymbro-api-sn0e.onrender.com";

// Muted/desaturated version of any hex color
const muteColor = (hex: string, opacity: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const difficultyColor = (d: string) => {
  if (d === "Beginner") return "#52A878";
  if (d === "Intermediate") return "#E09044";
  return "#C0544E";
};

// ─── Exercise Detail Modal ────────────────────────────────────────────────────

const ExerciseDetailModal = ({
  visible,
  exercise,
  onClose,
  theme,
  colors,
}: any) => {
  const isDark = theme === "dark";
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const accentColor = exercise?.color || "#3D7EAA";

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 9,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0.96);
    }
  }, [visible]);

  if (!exercise) return null;

  const openYouTube = () => Linking.openURL(exercise.videoUrl);
  const shareExercise = async () => {
    try {
      await Share.share({
        message: `Check out ${exercise.name} on GymBro! ${exercise.videoUrl}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const bg = isDark ? "#111214" : "#FAFAFA";
  const subText = isDark ? "#8A8E99" : "#7A7F8E";
  const cardBg = isDark ? "#1A1C20" : "#F0F1F4";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      {/* Dimmed backdrop */}
      <BlurView intensity={60} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill}>
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />
      </BlurView>

      <Animated.View
        style={[
          styles.modalSheet,
          { backgroundColor: bg, transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* Pull handle */}
        <View style={styles.modalHandle} />

        {/* Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.modalIconBtn}>
            <Ionicons name="close" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text
            style={[styles.modalTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            {exercise.name}
          </Text>
          <TouchableOpacity onPress={shareExercise} style={styles.modalIconBtn}>
            <Ionicons name="share-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} bounces>
          {/* Media */}
          <TouchableOpacity
            onPress={openYouTube}
            activeOpacity={0.92}
            style={styles.modalMediaWrap}
          >
            <Image
              source={{ uri: exercise.imageUrl }}
              style={styles.modalMedia}
              resizeMode="cover"
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.55)"]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.playRow}>
              <View style={[styles.playCircle, { backgroundColor: accentColor }]}>
                <Ionicons name="play" size={18} color="#fff" />
              </View>
              <Text style={styles.playLabel}>Watch Tutorial</Text>
            </View>
          </TouchableOpacity>

          {/* Quick 3-stat row */}
          <View style={[styles.triRow, { backgroundColor: cardBg }]}>
            {[
              { icon: "flame-outline", val: exercise.calories || "120", lbl: "Cal" },
              { icon: "trending-up-outline", val: `${exercise.popularity || 95}%`, lbl: "Effective" },
              { icon: "time-outline", val: exercise.rest, lbl: "Rest" },
            ].map((s, i) => (
              <React.Fragment key={i}>
                {i > 0 && <View style={[styles.triDivider, { backgroundColor: isDark ? "#2A2C30" : "#DDE0E8" }]} />}
                <View style={styles.triItem}>
                  <Ionicons name={s.icon as any} size={16} color={accentColor} />
                  <Text style={[styles.triVal, { color: colors.text }]}>{s.val}</Text>
                  <Text style={[styles.triLbl, { color: subText }]}>{s.lbl}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>

          {/* Tags */}
          <View style={styles.tagRow}>
            <View style={[styles.tag, { backgroundColor: muteColor(accentColor, 0.12) }]}>
              <View style={[styles.dot, { backgroundColor: difficultyColor(exercise.difficulty) }]} />
              <Text style={[styles.tagText, { color: accentColor }]}>{exercise.difficulty}</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: muteColor(accentColor, 0.12) }]}>
              <Ionicons name="fitness-outline" size={12} color={accentColor} />
              <Text style={[styles.tagText, { color: accentColor }]}>{exercise.category}</Text>
            </View>
          </View>

          {/* Sets / Reps */}
          <View style={styles.setsRepsRow}>
            {[
              { icon: "repeat-outline", val: exercise.sets, lbl: "Sets" },
              { icon: "barbell-outline", val: exercise.reps, lbl: "Reps" },
            ].map((s, i) => (
              <View
                key={i}
                style={[
                  styles.setsRepsCard,
                  {
                    backgroundColor: cardBg,
                    borderColor: muteColor(accentColor, 0.18),
                  },
                ]}
              >
                <Ionicons name={s.icon as any} size={22} color={accentColor} />
                <Text style={[styles.setsRepsVal, { color: colors.text }]}>{s.val}</Text>
                <Text style={[styles.setsRepsLbl, { color: subText }]}>{s.lbl}</Text>
              </View>
            ))}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
            <Text style={[styles.bodyText, { color: subText }]}>{exercise.description}</Text>
          </View>

          {/* Expert tip */}
          {exercise.expertTip && (
            <View style={[styles.tipCard, { backgroundColor: muteColor(accentColor, 0.08), borderColor: muteColor(accentColor, 0.2) }]}>
              <Ionicons name="school-outline" size={20} color={accentColor} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.tipCardLabel, { color: accentColor }]}>Expert Tip</Text>
                <Text style={[styles.bodyText, { color: colors.text }]}>{exercise.expertTip}</Text>
              </View>
            </View>
          )}

          {/* Muscles */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Target Muscles</Text>
            <View style={styles.chipWrap}>
              {exercise.muscleGroups?.map((m: string, i: number) => (
                <View key={i} style={[styles.chip, { backgroundColor: muteColor(accentColor, 0.1) }]}>
                  <Text style={[styles.chipText, { color: accentColor }]}>{m}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Equipment */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Equipment</Text>
            <View style={styles.chipWrap}>
              {exercise.equipment?.map((e: string, i: number) => (
                <View key={i} style={[styles.chip, { backgroundColor: muteColor(accentColor, 0.1) }]}>
                  <Ionicons name="barbell-outline" size={11} color={accentColor} />
                  <Text style={[styles.chipText, { color: accentColor }]}>{e}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Tips */}
          <View style={[styles.section, { marginBottom: 36 }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Pro Tips</Text>
            {exercise.tips?.map((t: string, i: number) => (
              <View key={i} style={styles.tipRow}>
                <View style={[styles.tipBullet, { backgroundColor: accentColor }]} />
                <Text style={[styles.bodyText, { color: isDark ? "#CCC" : "#444", flex: 1 }]}>{t}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ExerciseDetailsScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams();
  const { theme, toggleTheme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === "dark";

  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    fetchPlanExercises();
  }, [type]);

  const fetchPlanExercises = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(
        `${API_BASE_URL}/api/plans/${encodeURIComponent(type as string)}/exercises`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = (await response.json()) as {
        success: boolean;
        plan: PlanData;
        error?: string;
      };
      if (response.ok && data.success) {
        setPlanData(data.plan);
      } else {
        setError(data.error || "Failed to load exercises");
      }
    } catch (err) {
      console.error("Error fetching exercises:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
    ]).start();
  }, []);

  const openExerciseDetails = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setModalVisible(true);
  };

  // ── shared derived values ──
  const bg = isDark ? "#0D0F12" : "#F5F6F9";
  const cardBg = isDark ? "#15181D" : "#FFFFFF";
  const subText = isDark ? "#7A7F8E" : "#8A8E99";
  const borderColor = isDark ? "#222429" : "#E8E9EE";

  // ── Loading ──
  if (loading) {
    return (
      <SafeAreaView style={[styles.fill, { backgroundColor: bg }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <View style={styles.centeredFill}>
          <ActivityIndicator size="large" color={currentColors.primary} />
          <Text style={[styles.loadingText, { color: subText }]}>Loading exercises…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Error ──
  if (error || !planData) {
    return (
      <SafeAreaView style={[styles.fill, { backgroundColor: bg }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <View style={styles.centeredFill}>
          <View style={[styles.errorIconWrap, { backgroundColor: isDark ? "#1A1C20" : "#EDEEF3" }]}>
            <Ionicons name="alert-circle-outline" size={36} color={currentColors.primary} />
          </View>
          <Text style={[styles.errorTitle, { color: currentColors.text }]}>Something went wrong</Text>
          <Text style={[styles.errorSub, { color: subText }]}>{error || "Plan not found"}</Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: currentColors.primary }]}
            onPress={fetchPlanExercises}
          >
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const accent = planData.color;

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: bg, borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={20} color={currentColors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={[styles.emojiPill, { backgroundColor: muteColor(accent, 0.12) }]}>
            <Text style={styles.emoji}>{planData.emoji}</Text>
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: currentColors.text }]} numberOfLines={1}>
              {type} Plan
            </Text>
            <Text style={[styles.headerSub, { color: subText }]}>
              {planData.stats.totalExercises} exercises
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={toggleTheme}
          style={[styles.iconBtn, { backgroundColor: muteColor(accent, 0.1) }]}
        >
          <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={18} color={accent} />
        </TouchableOpacity>
      </View>

      {/* ── Stats bar ── */}
      <View style={[styles.statsBar, { backgroundColor: cardBg, borderColor: borderColor }]}>
        {[
          { icon: "barbell-outline", val: planData.stats.totalExercises, lbl: "Exercises" },
          { icon: "time-outline", val: planData.stats.avgDuration, lbl: "Avg Time" },
          { icon: "flame-outline", val: planData.stats.caloriesBurn, lbl: "Calories" },
        ].map((s, i) => (
          <React.Fragment key={i}>
            {i > 0 && <View style={[styles.statsDivider, { backgroundColor: borderColor }]} />}
            <View style={styles.statItem}>
              <Ionicons name={s.icon as any} size={14} color={accent} />
              <Text style={[styles.statVal, { color: currentColors.text }]}>{s.val}</Text>
              <Text style={[styles.statLbl, { color: subText }]}>{s.lbl}</Text>
            </View>
          </React.Fragment>
        ))}
      </View>

      {/* ── Exercise List ── */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Section label */}
          <View style={styles.sectionLabelRow}>
            <View style={[styles.sectionLine, { backgroundColor: borderColor }]} />
            <Text style={[styles.sectionLabel, { color: subText }]}>ALL EXERCISES</Text>
            <View style={[styles.sectionLine, { backgroundColor: borderColor }]} />
          </View>

          {planData.exercises.map((exercise: Exercise, index: number) => (
            <View key={exercise.id} style={[styles.card, { backgroundColor: cardBg, borderColor: borderColor }]}>

              {/* Left accent strip */}
              <View style={[styles.cardAccent, { backgroundColor: accent }]} />

              <View style={styles.cardInner}>
                {/* Thumbnail */}
                <TouchableOpacity
                  onPress={() => openExerciseDetails(exercise)}
                  style={styles.thumbWrap}
                  activeOpacity={0.85}
                >
                  <Image
                    source={{ uri: exercise.imageUrl }}
                    style={styles.thumb}
                    resizeMode="cover"
                  />
                  <View style={[styles.playBadge, { backgroundColor: accent }]}>
                    <Ionicons name="play" size={9} color="#fff" />
                  </View>
                </TouchableOpacity>

                {/* Info */}
                <View style={styles.cardInfo}>
                  <TouchableOpacity onPress={() => openExerciseDetails(exercise)}>
                    <Text style={[styles.cardName, { color: currentColors.text }]} numberOfLines={1}>
                      {exercise.name}
                    </Text>
                  </TouchableOpacity>

                  {/* Meta pills */}
                  <View style={styles.metaRow}>
                    {[
                      { icon: "repeat-outline", val: `${exercise.sets} sets` },
                      { icon: "barbell-outline", val: exercise.reps },
                      { icon: "timer-outline", val: exercise.rest },
                    ].map((m, i) => (
                      <View key={i} style={styles.metaItem}>
                        <Ionicons name={m.icon as any} size={10} color={accent} />
                        <Text style={[styles.metaText, { color: subText }]}>{m.val}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Bottom row */}
                  <View style={styles.cardBottom}>
                    <View style={styles.diffRow}>
                      <View style={[styles.diffDot, { backgroundColor: difficultyColor(exercise.difficulty) }]} />
                      <Text style={[styles.diffText, { color: subText }]}>{exercise.difficulty}</Text>
                    </View>

                    {/* Form Check */}
                    <TouchableOpacity
                      style={[styles.formBtn, { backgroundColor: muteColor(accent, 0.1), borderColor: muteColor(accent, 0.2) }]}
                      onPress={() =>
                        router.push({
                          pathname: "/form-check",
                          params: { exercise: exercise.name, planTitle: type },
                        })
                      }
                    >
                      <Ionicons name="scan-outline" size={11} color={accent} />
                      <Text style={[styles.formBtnText, { color: accent }]}>Check Form</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Arrow */}
                <TouchableOpacity
                  style={[styles.arrowBtn, { backgroundColor: muteColor(accent, 0.08) }]}
                  onPress={() => openExerciseDetails(exercise)}
                >
                  <Ionicons name="chevron-forward" size={16} color={accent} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </Animated.View>
      </ScrollView>

      {/* Modal */}
      <ExerciseDetailModal
        visible={modalVisible}
        exercise={selectedExercise}
        onClose={() => setModalVisible(false)}
        theme={theme}
        colors={currentColors}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  fill: { flex: 1 },
  centeredFill: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },

  // Loading / Error
  loadingText: { marginTop: 12, fontSize: 14, fontWeight: "500" },
  errorIconWrap: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  errorTitle: { fontSize: 17, fontWeight: "700", marginBottom: 6, textAlign: "center" },
  errorSub: { fontSize: 13, textAlign: "center", marginBottom: 24, lineHeight: 20 },
  retryBtn: { paddingHorizontal: 28, paddingVertical: 11, borderRadius: 24 },
  retryBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1, justifyContent: "center", paddingHorizontal: 8 },
  emojiPill: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 18 },
  headerTitle: { fontSize: 15, fontWeight: "700" },
  headerSub: { fontSize: 11, marginTop: 1 },

  // Stats bar
  statsBar: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  statItem: { flex: 1, alignItems: "center", gap: 3 },
  statVal: { fontSize: 15, fontWeight: "700" },
  statLbl: { fontSize: 10, fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.4 },
  statsDivider: { width: 1, height: 28 },

  // List
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 48 },
  sectionLabelRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  sectionLine: { flex: 1, height: 1 },
  sectionLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 1.2 },

  // Card
  card: {
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  cardAccent: { height: 2.5, width: "100%" },
  cardInner: { flexDirection: "row", alignItems: "center", padding: 12, gap: 12 },

  // Thumbnail
  thumbWrap: { width: 64, height: 64, borderRadius: 12, overflow: "hidden", position: "relative" },
  thumb: { width: "100%", height: "100%" },
  playBadge: { position: "absolute", top: 4, right: 4, width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },

  // Card info
  cardInfo: { flex: 1 },
  cardName: { fontSize: 14, fontWeight: "700", marginBottom: 5 },
  metaRow: { flexDirection: "row", gap: 10, marginBottom: 6 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 3 },
  metaText: { fontSize: 10, fontWeight: "500" },
  cardBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  diffRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  diffDot: { width: 6, height: 6, borderRadius: 3 },
  diffText: { fontSize: 10, fontWeight: "500" },

  // Form check btn
  formBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
  formBtnText: { fontSize: 10, fontWeight: "700" },

  // Arrow
  arrowBtn: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },

  // ── Modal ──
  modalSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "92%",
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 16 },
      android: { elevation: 20 },
    }),
  },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: "#ccc", alignSelf: "center", marginTop: 10, marginBottom: 2 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  modalIconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  modalTitle: { fontSize: 16, fontWeight: "700", flex: 1, textAlign: "center", marginHorizontal: 6 },

  // Modal media
  modalMediaWrap: { width: "100%", height: 200, position: "relative" },
  modalMedia: { width: "100%", height: "100%" },
  playRow: { position: "absolute", bottom: 14, left: 16, flexDirection: "row", alignItems: "center", gap: 10 },
  playCircle: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  playLabel: { color: "#fff", fontSize: 13, fontWeight: "600", textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },

  // Modal tri-row
  triRow: { flexDirection: "row", marginHorizontal: 16, marginTop: 14, borderRadius: 12, paddingVertical: 12 },
  triItem: { flex: 1, alignItems: "center", gap: 3 },
  triVal: { fontSize: 14, fontWeight: "700" },
  triLbl: { fontSize: 10 },
  triDivider: { width: 1, height: 26, alignSelf: "center" },

  // Tags
  tagRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginTop: 12 },
  tag: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, gap: 5 },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
  tagText: { fontSize: 12, fontWeight: "600" },

  // Sets/reps
  setsRepsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginTop: 14 },
  setsRepsCard: { flex: 1, alignItems: "center", paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, gap: 6 },
  setsRepsVal: { fontSize: 18, fontWeight: "800" },
  setsRepsLbl: { fontSize: 11 },

  // Section
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 14, fontWeight: "700", marginBottom: 10 },
  bodyText: { fontSize: 13, lineHeight: 20 },

  // Expert tip
  tipCard: { flexDirection: "row", marginHorizontal: 16, marginTop: 16, padding: 14, borderRadius: 12, gap: 10, borderWidth: 1 },
  tipCardLabel: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", marginBottom: 3, letterSpacing: 0.5 },

  // Chips
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  chip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, gap: 4 },
  chipText: { fontSize: 12, fontWeight: "500" },

  // Tip rows
  tipRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  tipBullet: { width: 5, height: 5, borderRadius: 2.5, marginTop: 7 },
});