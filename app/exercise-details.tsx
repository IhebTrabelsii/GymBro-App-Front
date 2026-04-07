import { Colors } from "@/constants/Colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState, useEffect } from "react";
import {
    Animated,
    Dimensions,
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Share,
    Linking,
    SafeAreaView,
    ActivityIndicator,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
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
const API_BASE_URL = "http://192.168.100.143:3000";

const hexToRgba = (hex: string, opacity: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Exercise Detail Modal
const ExerciseDetailModal = ({ visible, exercise, onClose, theme, colors }: any) => {
  const isDark = theme === "dark";
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const modalColor = exercise?.color || "#2E7D32";

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }).start();
    }
  }, [visible]);

  if (!exercise) return null;

  const openYouTube = () => Linking.openURL(exercise.videoUrl);
  const shareExercise = async () => {
    try {
      await Share.share({ message: `Check out ${exercise.name} on GymBro! ${exercise.videoUrl}` });
    } catch (error) { console.error(error); }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
      </BlurView>
      
      <Animated.View style={[styles.modalContent, { backgroundColor: isDark ? colors.card : "#FFFFFF", transform: [{ scale: scaleAnim }] }]}>
        <LinearGradient
          colors={[hexToRgba(modalColor, 0.19), 'transparent']}
          style={styles.modalGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.text }]} numberOfLines={1}>{exercise.name}</Text>
          <TouchableOpacity onPress={shareExercise} style={styles.modalShareButton}>
            <Ionicons name="share-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={openYouTube} activeOpacity={0.9}>
            <View style={styles.modalMediaContainer}>
              <Image source={{ uri: exercise.imageUrl }} style={styles.modalMedia} resizeMode="cover" />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.modalMediaGradient} />
              <View style={styles.modalPlayButton}>
                <View style={[styles.modalPlayIcon, { backgroundColor: modalColor }]}>
                  <Ionicons name="play" size={30} color="#000" />
                </View>
                <Text style={styles.modalPlayText}>Watch Tutorial</Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.modalQuickStats}>
            <View style={[styles.quickStatCard, { backgroundColor: modalColor + '15' }]}>
              <Ionicons name="flame" size={20} color={modalColor} />
              <Text style={[styles.quickStatValue, { color: colors.text }]}>{exercise.calories || "120"}</Text>
              <Text style={[styles.quickStatLabel, { color: isDark ? '#aaa' : '#666' }]}>Calories</Text>
            </View>
            <View style={[styles.quickStatCard, { backgroundColor: modalColor + '15' }]}>
              <Ionicons name="trending-up" size={20} color={modalColor} />
              <Text style={[styles.quickStatValue, { color: colors.text }]}>{exercise.popularity || 95}%</Text>
              <Text style={[styles.quickStatLabel, { color: isDark ? '#aaa' : '#666' }]}>Effective</Text>
            </View>
            <View style={[styles.quickStatCard, { backgroundColor: modalColor + '15' }]}>
              <Ionicons name="time" size={20} color={modalColor} />
              <Text style={[styles.quickStatValue, { color: colors.text }]}>{exercise.rest}</Text>
              <Text style={[styles.quickStatLabel, { color: isDark ? '#aaa' : '#666' }]}>Rest</Text>
            </View>
          </View>

          <View style={styles.modalTags}>
            <View style={[styles.modalTag, { backgroundColor: modalColor + '20' }]}>
              <View style={[styles.modalDifficultyDot, { 
                backgroundColor: exercise.difficulty === 'Beginner' ? '#4CAF50' : 
                               exercise.difficulty === 'Intermediate' ? '#FF9800' : '#F44336'
              }]} />
              <Text style={[styles.modalTagText, { color: modalColor }]}>{exercise.difficulty}</Text>
            </View>
            <View style={[styles.modalTag, { backgroundColor: modalColor + '20' }]}>
              <Ionicons name="fitness-outline" size={14} color={modalColor} />
              <Text style={[styles.modalTagText, { color: modalColor }]}>{exercise.category}</Text>
            </View>
          </View>

          <View style={styles.modalStatsGrid}>
            <View style={[styles.modalStatItem, { borderColor: modalColor + '30' }]}>
              <Ionicons name="repeat" size={28} color={modalColor} />
              <Text style={[styles.modalStatValue, { color: colors.text }]}>{exercise.sets}</Text>
              <Text style={[styles.modalStatLabel, { color: isDark ? '#aaa' : '#666' }]}>Sets</Text>
            </View>
            <View style={[styles.modalStatItem, { borderColor: modalColor + '30' }]}>
              <Ionicons name="barbell" size={28} color={modalColor} />
              <Text style={[styles.modalStatValue, { color: colors.text }]}>{exercise.reps}</Text>
              <Text style={[styles.modalStatLabel, { color: isDark ? '#aaa' : '#666' }]}>Reps</Text>
            </View>
          </View>

          <View style={styles.modalSection}>
            <Text style={[styles.modalSectionTitle, { color: colors.text }]}>Description</Text>
            <Text style={[styles.modalSectionText, { color: isDark ? '#ccc' : '#444' }]}>{exercise.description}</Text>
          </View>

          {exercise.expertTip && (
            <View style={[styles.expertTipCard, { backgroundColor: modalColor + '10' }]}>
              <Ionicons name="school" size={24} color={modalColor} />
              <View style={styles.expertTipContent}>
                <Text style={[styles.expertTipLabel, { color: modalColor }]}>Expert Tip</Text>
                <Text style={[styles.expertTipText, { color: colors.text }]}>{exercise.expertTip}</Text>
              </View>
            </View>
          )}

          <View style={styles.modalSection}>
            <Text style={[styles.modalSectionTitle, { color: colors.text }]}>Target Muscles</Text>
            <View style={styles.modalChips}>
              {exercise.muscleGroups?.map((muscle: string, index: number) => (
                <View key={index} style={[styles.modalChip, { backgroundColor: modalColor + '15' }]}>
                  <Text style={[styles.modalChipText, { color: modalColor }]}>{muscle}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.modalSection}>
            <Text style={[styles.modalSectionTitle, { color: colors.text }]}>Equipment</Text>
            <View style={styles.modalChips}>
              {exercise.equipment?.map((item: string, index: number) => (
                <View key={index} style={[styles.modalChip, { backgroundColor: modalColor + '15' }]}>
                  <Ionicons name="fitness-outline" size={12} color={modalColor} />
                  <Text style={[styles.modalChipText, { color: modalColor }]}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.modalSection}>
            <Text style={[styles.modalSectionTitle, { color: colors.text }]}>Pro Tips</Text>
            {exercise.tips?.map((tip: string, index: number) => (
              <View key={index} style={styles.modalTipItem}>
                <View style={[styles.tipBullet, { backgroundColor: modalColor }]} />
                <Text style={[styles.modalTipText, { color: isDark ? '#ddd' : '#333' }]}>{tip}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

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
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchPlanExercises();
  }, [type]);

 const fetchPlanExercises = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const token = await AsyncStorage.getItem("userToken");
    
    const response = await fetch(`${API_BASE_URL}/api/plans/${encodeURIComponent(type as string)}/exercises`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
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
  } catch (error) {
    console.error("Error fetching exercises:", error);
    setError("Network error. Please try again.");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const openExerciseDetails = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setModalVisible(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeContainer, { backgroundColor: currentColors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentColors.primary} />
          <Text style={[styles.loadingText, { color: currentColors.text }]}>Loading exercises...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !planData) {
    return (
      <SafeAreaView style={[styles.safeContainer, { backgroundColor: currentColors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color={currentColors.primary} />
          <Text style={[styles.errorText, { color: currentColors.text }]}>{error || "Plan not found"}</Text>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: currentColors.primary }]} onPress={fetchPlanExercises}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: currentColors.background }]}>
      <View style={[styles.container, { backgroundColor: currentColors.background }]}>
        {/* Header */}
        <LinearGradient colors={isDark ? ['#0a0a0a', '#000000'] : ['#ffffff', '#f8f9fa']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={currentColors.text} />
            </TouchableOpacity>
            
            <View style={styles.headerCenter}>
              <LinearGradient colors={[planData.color + '30', planData.color + '10']} style={styles.headerIcon}>
                <Text style={styles.headerEmoji}>{planData.emoji}</Text>
              </LinearGradient>
              <View style={styles.headerTextContainer}>
                <Text style={[styles.headerTitle, { color: planData.color }]} numberOfLines={1}>
                  {type} Plan
                </Text>
                <Text style={[styles.headerSubtitle, { color: isDark ? '#aaa' : '#666' }]} numberOfLines={1}>
                  {planData.stats.totalExercises} exercises
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={toggleTheme} style={[styles.themeBtn, { backgroundColor: planData.color + '15' }]}>
              <Ionicons name={isDark ? "sunny" : "moon"} size={20} color={planData.color} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Hero Stats Banner */}
        <LinearGradient colors={[planData.color + '15', planData.color + '05']} style={styles.heroStats}>
          <View style={styles.heroStatItem}>
            <Ionicons name="barbell-outline" size={20} color={planData.color} />
            <Text style={[styles.heroStatValue, { color: currentColors.text }]}>{planData.stats.totalExercises}</Text>
            <Text style={[styles.heroStatLabel, { color: isDark ? '#aaa' : '#666' }]}>Exercises</Text>
          </View>
          <View style={[styles.heroStatDivider, { backgroundColor: planData.color + '30' }]} />
          <View style={styles.heroStatItem}>
            <Ionicons name="time-outline" size={20} color={planData.color} />
            <Text style={[styles.heroStatValue, { color: currentColors.text }]}>{planData.stats.avgDuration}</Text>
            <Text style={[styles.heroStatLabel, { color: isDark ? '#aaa' : '#666' }]}>Avg Time</Text>
          </View>
          <View style={[styles.heroStatDivider, { backgroundColor: planData.color + '30' }]} />
          <View style={styles.heroStatItem}>
            <Ionicons name="flame-outline" size={20} color={planData.color} />
            <Text style={[styles.heroStatValue, { color: currentColors.text }]}>{planData.stats.caloriesBurn}</Text>
            <Text style={[styles.heroStatLabel, { color: isDark ? '#aaa' : '#666' }]}>Calories</Text>
          </View>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionLine, { backgroundColor: planData.color + '30' }]} />
              <Text style={[styles.sectionTitle, { color: currentColors.text }]}>ALL EXERCISES</Text>
              <View style={[styles.sectionLine, { backgroundColor: planData.color + '30' }]} />
            </View>

            {planData.exercises.map((exercise: Exercise, index: number) => (
              <Animated.View
                key={exercise.id}
                style={{
                  transform: [{ translateY: slideAnim.interpolate({ inputRange: [0, 30], outputRange: [0, 10 * (index + 1)] }) }],
                }}
              >
                <TouchableOpacity onPress={() => openExerciseDetails(exercise)} activeOpacity={0.9}>
                  <LinearGradient
                    colors={isDark ? ['#0e0e0e', '#080808'] : ['#ffffff', '#f8f8f8']}
                    style={[styles.exerciseCard, { borderColor: planData.color + '30' }]}
                  >
                    <LinearGradient colors={[planData.color + '15', 'transparent']} style={styles.exerciseCardAccent} />
                    
                    <View style={styles.exerciseCardContent}>
                      <View style={styles.exerciseImageContainer}>
                        <Image source={{ uri: exercise.imageUrl }} style={styles.exerciseImage} resizeMode="cover" />
                        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={styles.exerciseImageOverlay} />
                        <View style={[styles.exerciseBadge, { backgroundColor: planData.color }]}>
                          <Ionicons name="play" size={12} color="#000" />
                        </View>
                      </View>

                      <View style={styles.exerciseInfo}>
                        <Text style={[styles.exerciseName, { color: currentColors.text }]} numberOfLines={1}>
                          {exercise.name}
                        </Text>
                        
                        <View style={styles.exerciseMetaRow}>
                          <View style={styles.exerciseMetaItem}>
                            <Ionicons name="repeat" size={12} color={planData.color} />
                            <Text style={[styles.exerciseMetaText, { color: currentColors.text }]}>{exercise.sets} sets</Text>
                          </View>
                          <View style={styles.exerciseMetaItem}>
                            <Ionicons name="barbell" size={12} color={planData.color} />
                            <Text style={[styles.exerciseMetaText, { color: currentColors.text }]}>{exercise.reps}</Text>
                          </View>
                          <View style={styles.exerciseMetaItem}>
                            <Ionicons name="timer" size={12} color={planData.color} />
                            <Text style={[styles.exerciseMetaText, { color: currentColors.text }]}>{exercise.rest}</Text>
                          </View>
                        </View>

                        <View style={styles.difficultyBadge}>
                          <View style={[styles.difficultyDot, { 
                            backgroundColor: exercise.difficulty === 'Beginner' ? '#4CAF50' : 
                                          exercise.difficulty === 'Intermediate' ? '#FF9800' : '#F44336'
                          }]} />
                          <Text style={[styles.difficultyText, { color: isDark ? '#aaa' : '#666' }]}>{exercise.difficulty}</Text>
                        </View>
                      </View>

                      <View style={[styles.exerciseArrow, { backgroundColor: planData.color + '15' }]}>
                        <Ionicons name="chevron-forward" size={20} color={planData.color} />
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </Animated.View>
        </ScrollView>

        <ExerciseDetailModal
          visible={modalVisible}
          exercise={selectedExercise}
          onClose={() => setModalVisible(false)}
          theme={theme}
          colors={currentColors}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
  },

  header: {
    paddingTop: Platform.OS === "ios" ? 12 : 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
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
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginHorizontal: 8,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  headerEmoji: {
    fontSize: 22,
  },
  headerTextContainer: {
    flexShrink: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
  themeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  heroStats: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 12,
  },
  heroStatItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  heroStatValue: {
    fontSize: 18,
    fontWeight: "800",
  },
  heroStatLabel: {
    fontSize: 10,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  heroStatDivider: {
    width: 1,
    height: 30,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 8,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  sectionLine: {
    flex: 1,
    height: 1,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },

  exerciseCard: {
    borderRadius: 18,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1.5,
    ...Platform.select({ ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 }, android: { elevation: 3 } }),
  },
  exerciseCardAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  exerciseCardContent: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
  },
  exerciseImageContainer: {
    width: 65,
    height: 65,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
  },
  exerciseImage: {
    width: "100%",
    height: "100%",
  },
  exerciseImageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  exerciseBadge: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  exerciseInfo: {
    flex: 1,
    marginLeft: 12,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  exerciseMetaRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 4,
  },
  exerciseMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  exerciseMetaText: {
    fontSize: 10,
    fontWeight: "500",
  },
  difficultyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  difficultyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: "500",
  },
  exerciseArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },

  modalBackdrop: { flex: 1 },
  modalContent: { position: "absolute", bottom: 0, left: 0, right: 0, borderTopLeftRadius: 30, borderTopRightRadius: 30, maxHeight: "90%", overflow: "hidden" },
  modalGradient: { position: "absolute", top: 0, left: 0, right: 0, height: 200 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.05)" },
  modalCloseButton: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  modalShareButton: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  modalTitle: { fontSize: 18, fontWeight: "700", flex: 1, textAlign: "center", marginHorizontal: 8 },
  modalMediaContainer: { width: "100%", height: 220, position: "relative" },
  modalMedia: { width: "100%", height: "100%" },
  modalMediaGradient: { position: "absolute", bottom: 0, left: 0, right: 0, height: 100 },
  modalPlayButton: { position: "absolute", bottom: 20, left: 20, flexDirection: "row", alignItems: "center", gap: 10 },
  modalPlayIcon: { width: 46, height: 46, borderRadius: 23, justifyContent: "center", alignItems: "center" },
  modalPlayText: { color: "#FFF", fontSize: 15, fontWeight: "600", textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  modalQuickStats: { flexDirection: "row", justifyContent: "space-around", paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  quickStatCard: { flex: 1, alignItems: "center", padding: 12, borderRadius: 12, gap: 4 },
  quickStatValue: { fontSize: 16, fontWeight: "700" },
  quickStatLabel: { fontSize: 11 },
  modalTags: { flexDirection: "row", gap: 10, paddingHorizontal: 20, marginBottom: 16 },
  modalTag: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
  modalTagText: { fontSize: 13, fontWeight: "600" },
  modalDifficultyDot: { width: 8, height: 8, borderRadius: 4 },
  modalStatsGrid: { flexDirection: "row", gap: 12, paddingHorizontal: 20, marginBottom: 20 },
  modalStatItem: { flex: 1, alignItems: "center", padding: 16, borderRadius: 16, borderWidth: 1.5, gap: 8 },
  modalStatValue: { fontSize: 20, fontWeight: "800" },
  modalStatLabel: { fontSize: 12, fontWeight: "500" },
  modalSection: { paddingHorizontal: 20, marginBottom: 24 },
  modalSectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  modalSectionText: { fontSize: 14, lineHeight: 20 },
  modalChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  modalChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 4 },
  modalChipText: { fontSize: 12, fontWeight: "500" },
  modalTipItem: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  tipBullet: { width: 6, height: 6, borderRadius: 3 },
  modalTipText: { fontSize: 14, flex: 1, lineHeight: 20 },
  expertTipCard: { flexDirection: "row", marginHorizontal: 20, marginBottom: 24, padding: 16, borderRadius: 16, gap: 12 },
  expertTipContent: { flex: 1 },
  expertTipLabel: { fontSize: 12, fontWeight: "700", marginBottom: 4, textTransform: "uppercase" },
  expertTipText: { fontSize: 14, lineHeight: 20 },
});