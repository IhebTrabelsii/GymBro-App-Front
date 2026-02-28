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
        ViewStyle,          
    FlatList,
    Share,
    Linking,
} from "react-native";
import { useSimpleTheme } from "../context/SimpleThemeContext";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

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

const { width } = Dimensions.get("window");

// Enhanced exercise data with realistic images and more variety
const exerciseData = {
  Ectomorph: {
    name: "Ectomorph Mass Blueprint",
    description: "Scientifically crafted program for hardgainers to pack on quality mass",
    color: "#00FF41",
    gradientColors: ['#00FF41', '#00CC33', '#009900'],
    emoji: "🔥",
    stats: {
      totalExercises: 24,
      weeklyFrequency: 4,
      avgDuration: "55 min",
      caloriesBurn: "450-600"
    },
    weeklySchedule: [
      { day: "Monday", focus: "Chest & Triceps", intensity: "High", exercises: 5 },
      { day: "Tuesday", focus: "Back & Biceps", intensity: "High", exercises: 5 },
      { day: "Wednesday", focus: "Rest & Recovery", intensity: "Low", exercises: 0 },
      { day: "Thursday", focus: "Shoulders & Abs", intensity: "Medium", exercises: 4 },
      { day: "Friday", focus: "Legs", intensity: "Very High", exercises: 6 },
      { day: "Saturday", focus: "Cardio & Accessories", intensity: "Medium", exercises: 4 },
      { day: "Sunday", focus: "Complete Rest", intensity: "Low", exercises: 0 },
    ],
    exercises: [
      {
        id: "1",
        name: "Barbell Bench Press",
        category: "Chest",
        sets: 4,
        reps: "8-10",
        rest: "90 sec",
        difficulty: "Intermediate",
        muscleGroups: ["Chest", "Triceps", "Shoulders"],
        equipment: ["Barbell", "Bench"],
        description: "Compound exercise for building chest mass and strength.",
        tips: [
          "Keep your back arched",
          "Drive through your heels",
          "Lower the bar to your sternum",
        ],
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/watch?v=ejI1Nlsul9k",
        gifUrl: "https://media.giphy.com/media/l0HlNQ03J5JxX6lZ6/giphy.gif",
        calories: "120-150",
        popularity: 98,
        expertTip: "Touch the bar to your sternum, not your chest, for better pec activation"
      },
      {
        id: "2",
        name: "Weighted Pull-Ups",
        category: "Back",
        sets: 4,
        reps: "6-10",
        rest: "75 sec",
        difficulty: "Advanced",
        muscleGroups: ["Back", "Biceps", "Forearms"],
        equipment: ["Pull-up Bar", "Weight Belt"],
        description: "Ultimate back width builder and strength developer.",
        tips: [
          "Squeeze your shoulder blades",
          "Pull your chest to the bar",
          "Control the descent",
        ],
        imageUrl: "https://images.unsplash.com/photo-1598971639058-999901d212d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/watch?v=example",
        gifUrl: "https://media.giphy.com/media/3o7abB06u9bNzA8LC8/giphy.gif",
        calories: "100-130",
        popularity: 95,
        expertTip: "Add weight only when you can do 12+ strict bodyweight pull-ups"
      },
      {
        id: "3",
        name: "Barbell Squat",
        category: "Legs",
        sets: 4,
        reps: "8-12",
        rest: "120 sec",
        difficulty: "Advanced",
        muscleGroups: ["Quads", "Glutes", "Hamstrings", "Core"],
        equipment: ["Barbell", "Squat Rack"],
        description: "King of all exercises for total lower body development.",
        tips: [
          "Keep your chest up",
          "Break at the hips first",
          "Go below parallel",
        ],
        imageUrl: "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/watch?v=example",
        gifUrl: "https://media.giphy.com/media/3o7TKz2fB6yKQFgQKk/giphy.gif",
        calories: "150-200",
        popularity: 99,
        expertTip: "Point your toes slightly outward and track knees over toes"
      },
      {
        id: "4",
        name: "Standing Overhead Press",
        category: "Shoulders",
        sets: 3,
        reps: "8-10",
        rest: "90 sec",
        difficulty: "Intermediate",
        muscleGroups: ["Shoulders", "Triceps", "Core"],
        equipment: ["Barbell"],
        description: "Build powerful shoulders and improve upper body strength.",
        tips: [
          "Squeeze your glutes",
          "Keep your core tight",
          "Press directly overhead",
        ],
        imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/watch?v=example",
        gifUrl: "https://media.giphy.com/media/l0HlOBZCl7sF0r3jK/giphy.gif",
        calories: "90-120",
        popularity: 92,
        expertTip: "Don't flare your ribs - keep your core braced throughout"
      },
      {
        id: "5",
        name: "Conventional Deadlift",
        category: "Back",
        sets: 3,
        reps: "5-8",
        rest: "150 sec",
        difficulty: "Advanced",
        muscleGroups: ["Back", "Glutes", "Hamstrings", "Forearms"],
        equipment: ["Barbell"],
        description: "Ultimate full-body strength builder.",
        tips: [
          "Keep the bar close",
          "Drive through your heels",
          "Lock your lats",
        ],
        imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/watch?v=example",
        gifUrl: "https://media.giphy.com/media/3o7abB06u9bNzA8LC8/giphy.gif",
        calories: "180-220",
        popularity: 97,
        expertTip: "Pull the slack out of the bar before lifting - hear the 'click'"
      },
      {
        id: "6",
        name: "Dumbbell Incline Press",
        category: "Chest",
        sets: 3,
        reps: "10-12",
        rest: "60 sec",
        difficulty: "Beginner",
        muscleGroups: ["Upper Chest", "Triceps"],
        equipment: ["Dumbbells", "Incline Bench"],
        description: "Target upper chest for balanced development.",
        tips: [
          "Keep shoulders pinned back",
          "Don't arch excessively",
          "Squeeze at the top",
        ],
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/watch?v=example",
        gifUrl: "https://media.giphy.com/media/l0HlNQ03J5JxX6lZ6/giphy.gif",
        calories: "80-110",
        popularity: 88,
        expertTip: "Don't let the dumbbells touch at the top - keep tension"
      },
    ],
    nutritionTips: [
      { icon: "restaurant", tip: "3000-3500 calories daily", color: "#00FF41", detail: "Focus on complex carbs" },
      { icon: "cafe", tip: "1.6-2.2g protein per kg", color: "#7FFF00", detail: "Spread across 5-6 meals" },
      { icon: "water", tip: "3-4 liters water daily", color: "#39FF14", detail: "Add electrolytes post-workout" },
      { icon: "timer", tip: "Eat every 3-4 hours", color: "#00FF41", detail: "Don't skip meals" },
    ],
    testimonials: [
      { id: 1, name: "Alex M.", text: "Gained 15lbs in 8 weeks! Best program for hardgainers.", rating: 5 },
      { id: 2, name: "Jordan T.", text: "Finally seeing results after years of struggling.", rating: 5 },
    ]
  },
  Mesomorph: {
    name: "Mesomorph Athletic Performer",
    description: "Balanced training for muscle definition and athletic performance",
    color: "#7FFF00",
    gradientColors: ['#7FFF00', '#66CC00', '#4C9900'],
    emoji: "💪",
    stats: {
      totalExercises: 28,
      weeklyFrequency: 5,
      avgDuration: "50 min",
      caloriesBurn: "400-550"
    },
    weeklySchedule: [
      { day: "Monday", focus: "Chest & Back", intensity: "High", exercises: 5 },
      { day: "Tuesday", focus: "Legs", intensity: "High", exercises: 6 },
      { day: "Wednesday", focus: "Cardio & Core", intensity: "Medium", exercises: 4 },
      { day: "Thursday", focus: "Shoulders & Arms", intensity: "High", exercises: 5 },
      { day: "Friday", focus: "Full Body", intensity: "Very High", exercises: 6 },
      { day: "Saturday", focus: "Active Recovery", intensity: "Low", exercises: 3 },
      { day: "Sunday", focus: "Rest", intensity: "Low", exercises: 0 },
    ],
    exercises: [
      {
        id: "1",
        name: "Dumbbell Bench Press",
        category: "Chest",
        sets: 3,
        reps: "10-12",
        rest: "60 sec",
        difficulty: "Beginner",
        muscleGroups: ["Chest", "Triceps", "Shoulders"],
        equipment: ["Dumbbells", "Bench"],
        description: "Great for chest development and stability.",
        tips: [
          "Control the dumbbells",
          "Squeeze at the top",
          "Keep shoulders back",
        ],
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/watch?v=example",
        gifUrl: "https://media.giphy.com/media/l0HlNQ03J5JxX6lZ6/giphy.gif",
        calories: "100-130",
        popularity: 94,
        expertTip: "Keep your shoulders pinned back on the bench"
      },
      {
        id: "2",
        name: "Lat Pulldown",
        category: "Back",
        sets: 3,
        reps: "12-15",
        rest: "60 sec",
        difficulty: "Beginner",
        muscleGroups: ["Back", "Biceps"],
        equipment: ["Cable Machine"],
        description: "Build back width and strength.",
        tips: [
          "Pull to your upper chest",
          "Squeeze at the bottom",
          "Control the weight",
        ],
        imageUrl: "https://images.unsplash.com/photo-1598971639058-999901d212d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/watch?v=example",
        gifUrl: "https://media.giphy.com/media/3o7abB06u9bNzA8LC8/giphy.gif",
        calories: "80-110",
        popularity: 91,
        expertTip: "Lean back slightly and pull to your upper chest"
      },
      {
        id: "3",
        name: "Leg Press",
        category: "Legs",
        sets: 4,
        reps: "12-15",
        rest: "75 sec",
        difficulty: "Beginner",
        muscleGroups: ["Quads", "Glutes", "Hamstrings"],
        equipment: ["Leg Press Machine"],
        description: "Build leg mass safely.",
        tips: [
          "Don't lock your knees",
          "Control the weight",
          "Full range of motion",
        ],
        imageUrl: "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/watch?v=example",
        gifUrl: "https://media.giphy.com/media/3o7TKz2fB6yKQFgQKk/giphy.gif",
        calories: "110-140",
        popularity: 89,
        expertTip: "Keep your back flat against the pad"
      },
      {
        id: "4",
        name: "Dumbbell Lateral Raises",
        category: "Shoulders",
        sets: 3,
        reps: "15-20",
        rest: "45 sec",
        difficulty: "Beginner",
        muscleGroups: ["Shoulders"],
        equipment: ["Dumbbells"],
        description: "Build shoulder width and definition.",
        tips: [
          "Light weight, high reps",
          "Lead with your elbows",
          "Control the negative",
        ],
        imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/watch?v=example",
        gifUrl: "https://media.giphy.com/media/l0HlOBZCl7sF0r3jK/giphy.gif",
        calories: "70-90",
        popularity: 93,
        expertTip: "Don't use momentum - control the movement"
      },
      {
        id: "5",
        name: "Barbell Rows",
        category: "Back",
        sets: 3,
        reps: "10-12",
        rest: "75 sec",
        difficulty: "Intermediate",
        muscleGroups: ["Back", "Biceps"],
        equipment: ["Barbell"],
        description: "Build back thickness.",
        tips: [
          "Keep your back straight",
          "Pull to your stomach",
          "Squeeze at the top",
        ],
        imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/watch?v=example",
        gifUrl: "https://media.giphy.com/media/3o7abB06u9bNzA8LC8/giphy.gif",
        calories: "120-150",
        popularity: 96,
        expertTip: "Pull the bar to your lower chest/stomach"
      },
    ],
    nutritionTips: [
      { icon: "restaurant", tip: "2500-2800 calories daily", color: "#7FFF00", detail: "40% carbs, 30% protein, 30% fat" },
      { icon: "cafe", tip: "1.8-2.2g protein per kg", color: "#00FF41", detail: "Quality protein sources" },
      { icon: "water", tip: "2.5-3 liters daily", color: "#39FF14", detail: "Hydrate before, during, after" },
      { icon: "timer", tip: "Balanced meals every 4h", color: "#7FFF00", detail: "Include veggies with each meal" },
    ],
    testimonials: [
      { id: 1, name: "Chris P.", text: "Added 2 inches to arms while staying lean!", rating: 5 },
      { id: 2, name: "Mike R.", text: "Perfect balance of strength and aesthetics.", rating: 5 },
    ]
  },
  Endomorph: {
    name: "Endomorph Fat Torcher",
    description: "High-intensity metabolic conditioning for maximum fat loss",
    color: "#39FF14",
    gradientColors: ['#39FF14', '#2ECC40', '#27AE60'],
    emoji: "⚡",
    stats: {
      totalExercises: 30,
      weeklyFrequency: 6,
      avgDuration: "45 min",
      caloriesBurn: "500-700"
    },
    weeklySchedule: [
      { day: "Monday", focus: "HIIT & Full Body", intensity: "Very High", exercises: 8 },
      { day: "Tuesday", focus: "Cardio & Core", intensity: "High", exercises: 6 },
      { day: "Wednesday", focus: "Upper Body Circuit", intensity: "High", exercises: 7 },
      { day: "Thursday", focus: "HIIT & Lower Body", intensity: "Very High", exercises: 8 },
      { day: "Friday", focus: "Full Body Circuit", intensity: "High", exercises: 7 },
      { day: "Saturday", focus: "LISS Cardio", intensity: "Medium", exercises: 4 },
      { day: "Sunday", focus: "Rest", intensity: "Low", exercises: 0 },
    ],
    exercises: [
      {
        id: "1",
        name: "Burpees",
        category: "HIIT",
        sets: 4,
        reps: "15-20",
        rest: "30 sec",
        difficulty: "Intermediate",
        muscleGroups: ["Full Body", "Cardio"],
        equipment: ["None"],
        description: "Full body explosive movement for fat burning.",
        tips: ["Keep your core tight", "Jump explosively", "Land softly"],
        imageUrl: "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/watch?v=example",
        gifUrl: "https://media.giphy.com/media/3o7abB06u9bNzA8LC8/giphy.gif",
        calories: "200-250",
        popularity: 97,
        expertTip: "Push through your heels when jumping up"
      },
      {
        id: "2",
        name: "Kettlebell Swings",
        category: "Full Body",
        sets: 4,
        reps: "20-25",
        rest: "45 sec",
        difficulty: "Intermediate",
        muscleGroups: ["Glutes", "Hamstrings", "Core", "Cardio"],
        equipment: ["Kettlebell"],
        description: "Explosive hip movement for power and conditioning.",
        tips: [
          "Hinge at the hips",
          "Squeeze glutes at top",
          "Keep your back straight",
        ],
        imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/watch?v=example",
        gifUrl: "https://media.giphy.com/media/3o7TKz2fB6yKQFgQKk/giphy.gif",
        calories: "180-220",
        popularity: 95,
        expertTip: "Let the kettlebell float, don't lift with your arms"
      },
      {
        id: "3",
        name: "Box Jumps",
        category: "Plyometrics",
        sets: 3,
        reps: "10-12",
        rest: "60 sec",
        difficulty: "Advanced",
        muscleGroups: ["Legs", "Cardio"],
        equipment: ["Box", "Plyo Box"],
        description: "Explosive leg power and cardio.",
        tips: ["Land softly", "Step down, don't jump", "Use your arms"],
        imageUrl: "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/watch?v=example",
        gifUrl: "https://media.giphy.com/media/3o7abB06u9bNzA8LC8/giphy.gif",
        calories: "150-180",
        popularity: 92,
        expertTip: "Start with a lower box and focus on form"
      },
      {
        id: "4",
        name: "Battle Ropes",
        category: "Cardio",
        sets: 3,
        reps: "30 sec",
        rest: "30 sec",
        difficulty: "Intermediate",
        muscleGroups: ["Shoulders", "Arms", "Core", "Cardio"],
        equipment: ["Battle Ropes"],
        description: "Intense full body conditioning.",
        tips: [
          "Keep your knees soft",
          "Generate from your core",
          "Alternate waves",
        ],
        imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/watch?v=example",
        gifUrl: "https://media.giphy.com/media/l0HlNQ03J5JxX6lZ6/giphy.gif",
        calories: "160-200",
        popularity: 90,
        expertTip: "Keep your back straight and engage your core"
      },
      {
        id: "5",
        name: "Mountain Climbers",
        category: "HIIT",
        sets: 4,
        reps: "30 sec",
        rest: "20 sec",
        difficulty: "Beginner",
        muscleGroups: ["Full Body", "Cardio", "Core"],
        equipment: ["None"],
        description: "Great for cardio and core stability.",
        tips: ["Keep your hips down", "Drive your knees", "Maintain pace"],
        imageUrl: "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/watch?v=example",
        gifUrl: "https://media.giphy.com/media/3o7abB06u9bNzA8LC8/giphy.gif",
        calories: "120-150",
        popularity: 88,
        expertTip: "Keep your shoulders over your wrists"
      },
    ],
    nutritionTips: [
      { icon: "restaurant", tip: "2000-2300 calories daily", color: "#39FF14", detail: "Higher protein, moderate fat" },
      { icon: "cafe", tip: "2-2.5g protein per kg", color: "#7FFF00", detail: "Preserve muscle while cutting" },
      { icon: "water", tip: "3+ liters daily", color: "#00FF41", detail: "Essential for metabolism" },
      { icon: "timer", tip: "IF options available", color: "#39FF14", detail: "16:8 fasting recommended" },
    ],
    testimonials: [
      { id: 1, name: "Sarah K.", text: "Lost 20lbs in 3 months without losing muscle!", rating: 5 },
      { id: 2, name: "Dave L.", text: "Finally a program that works for my body type.", rating: 5 },
    ]
  }
};

// Enhanced Exercise Detail Modal with video integration
const ExerciseDetailModal = ({
  visible,
  exercise,
  onClose,
  theme,
  colors,
}: any) => {
  const isDark = theme === "dark";
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!exercise) return null;

  const openYouTube = () => {
    Linking.openURL(exercise.videoUrl);
  };

  const shareExercise = async () => {
    try {
      await Share.share({
        message: `Check out ${exercise.name} on GymBro! ${exercise.videoUrl}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill}>
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
      </BlurView>
      
      <Animated.View
        style={[
          styles.modalContent,
          {
            backgroundColor: isDark ? colors.card : "#FFFFFF",
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={[exercise.color + '30', 'transparent']}
          style={styles.modalGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        {/* Modal Header with Actions */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.text }]} numberOfLines={1}>
            {exercise.name}
          </Text>
          <TouchableOpacity onPress={shareExercise} style={styles.modalShareButton}>
            <Ionicons name="share-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Video/Image Section with Play Button */}
          <TouchableOpacity onPress={openYouTube} activeOpacity={0.9}>
            <View style={styles.modalMediaContainer}>
              <Image
                source={{ uri: exercise.imageUrl }}
                style={styles.modalMedia}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.modalMediaGradient}
              />
              <View style={styles.modalPlayButton}>
                <View style={[styles.modalPlayIcon, { backgroundColor: exercise.color }]}>
                  <Ionicons name="play" size={30} color="#000000" />
                </View>
                <Text style={styles.modalPlayText}>Watch Tutorial</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Quick Stats Cards */}
          <View style={styles.modalQuickStats}>
            <View style={[styles.quickStatCard, { backgroundColor: exercise.color + '15' }]}>
              <Ionicons name="flame" size={20} color={exercise.color} />
              <Text style={[styles.quickStatValue, { color: colors.text }]}>{exercise.calories || "120"}</Text>
              <Text style={[styles.quickStatLabel, { color: isDark ? '#aaa' : '#666' }]}>Calories</Text>
            </View>
            <View style={[styles.quickStatCard, { backgroundColor: exercise.color + '15' }]}>
              <Ionicons name="trending-up" size={20} color={exercise.color} />
              <Text style={[styles.quickStatValue, { color: colors.text }]}>{exercise.popularity || 95}%</Text>
              <Text style={[styles.quickStatLabel, { color: isDark ? '#aaa' : '#666' }]}>Effective</Text>
            </View>
            <View style={[styles.quickStatCard, { backgroundColor: exercise.color + '15' }]}>
              <Ionicons name="time" size={20} color={exercise.color} />
              <Text style={[styles.quickStatValue, { color: colors.text }]}>{exercise.rest}</Text>
              <Text style={[styles.quickStatLabel, { color: isDark ? '#aaa' : '#666' }]}>Rest</Text>
            </View>
          </View>

          {/* Difficulty and Category Pills */}
          <View style={styles.modalTags}>
            <View style={[styles.modalTag, { backgroundColor: exercise.color + '20' }]}>
              <View style={[styles.difficultyDot, { 
                backgroundColor: exercise.difficulty === 'Beginner' ? '#00FF41' : 
                               exercise.difficulty === 'Intermediate' ? '#FFA500' : '#FF4444'
              }]} />
              <Text style={[styles.modalTagText, { color: exercise.color }]}>
                {exercise.difficulty}
              </Text>
            </View>
            <View style={[styles.modalTag, { backgroundColor: exercise.color + '20' }]}>
              <Ionicons name="fitness-outline" size={14} color={exercise.color} />
              <Text style={[styles.modalTagText, { color: exercise.color }]}>
                {exercise.category}
              </Text>
            </View>
          </View>

          {/* Main Stats Grid */}
          <View style={styles.modalStatsGrid}>
            <View style={[styles.modalStatItem, { borderColor: exercise.color + '30' }]}>
              <Ionicons name="repeat" size={28} color={exercise.color} />
              <Text style={[styles.modalStatValue, { color: colors.text }]}>{exercise.sets}</Text>
              <Text style={[styles.modalStatLabel, { color: isDark ? '#aaa' : '#666' }]}>Sets</Text>
            </View>
            <View style={[styles.modalStatItem, { borderColor: exercise.color + '30' }]}>
              <Ionicons name="barbell" size={28} color={exercise.color} />
              <Text style={[styles.modalStatValue, { color: colors.text }]}>{exercise.reps}</Text>
              <Text style={[styles.modalStatLabel, { color: isDark ? '#aaa' : '#666' }]}>Reps</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.modalSection}>
            <Text style={[styles.modalSectionTitle, { color: colors.text }]}>
              Description
            </Text>
            <Text style={[styles.modalSectionText, { color: isDark ? '#ccc' : '#444' }]}>
              {exercise.description}
            </Text>
          </View>

          {/* Expert Tip */}
          {exercise.expertTip && (
            <View style={[styles.expertTipCard, { backgroundColor: exercise.color + '10' }]}>
              <Ionicons name="school" size={24} color={exercise.color} />
              <View style={styles.expertTipContent}>
                <Text style={[styles.expertTipLabel, { color: exercise.color }]}>Expert Tip</Text>
                <Text style={[styles.expertTipText, { color: colors.text }]}>
                  {exercise.expertTip}
                </Text>
              </View>
            </View>
          )}

          {/* Muscle Groups */}
          <View style={styles.modalSection}>
            <Text style={[styles.modalSectionTitle, { color: colors.text }]}>
              Target Muscles
            </Text>
            <View style={styles.modalChips}>
              {exercise.muscleGroups?.map((muscle: string, index: number) => (
                <View
                  key={index}
                  style={[styles.modalChip, { backgroundColor: exercise.color + '15' }]}
                >
                  <Text style={[styles.modalChipText, { color: exercise.color }]}>
                    {muscle}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Equipment */}
          <View style={styles.modalSection}>
            <Text style={[styles.modalSectionTitle, { color: colors.text }]}>
              Equipment Needed
            </Text>
            <View style={styles.modalChips}>
              {exercise.equipment?.map((item: string, index: number) => (
                <View
                  key={index}
                  style={[styles.modalChip, { backgroundColor: exercise.color + '15' }]}
                >
                  <Ionicons name="fitness-outline" size={12} color={exercise.color} />
                  <Text style={[styles.modalChipText, { color: exercise.color }]}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Pro Tips */}
          <View style={styles.modalSection}>
            <Text style={[styles.modalSectionTitle, { color: colors.text }]}>
              Pro Tips
            </Text>
            {exercise.tips?.map((tip: string, index: number) => (
              <View key={index} style={styles.modalTipItem}>
                <View style={[styles.tipBullet, { backgroundColor: exercise.color }]} />
                <Text style={[styles.modalTipText, { color: isDark ? '#ddd' : '#333' }]}>
                  {tip}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

// Progress Card Component
const ProgressCard = ({ planData, colors, isDark }: any) => (
  <LinearGradient
    colors={[planData.color + '30', 'transparent']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.progressCard}
  >
    <Text style={[styles.progressTitle, { color: colors.text }]}>Your Progress</Text>
    <View style={styles.progressStats}>
      <View style={styles.progressStat}>
        <Text style={[styles.progressValue, { color: planData.color }]}>0/24</Text>
        <Text style={[styles.progressLabel, { color: isDark ? '#aaa' : '#666' }]}>Exercises Done</Text>
      </View>
      <View style={[styles.progressDivider, { backgroundColor: planData.color + '30' }]} />
      <View style={styles.progressStat}>
        <Text style={[styles.progressValue, { color: planData.color }]}>0</Text>
        <Text style={[styles.progressLabel, { color: isDark ? '#aaa' : '#666' }]}>Current Streak</Text>
      </View>
    </View>
    <View style={styles.progressBar}>
      <View style={[styles.progressFill, { backgroundColor: planData.color, width: '0%' }]} />
    </View>
  </LinearGradient>
);

// Testimonial Card Component
const TestimonialCard = ({ testimonial, colors, isDark }: any) => (
  <View style={[styles.testimonialCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }]}>
    <View style={styles.testimonialHeader}>
      <View style={styles.testimonialAvatar}>
        <Text style={styles.testimonialAvatarText}>{testimonial.name[0]}</Text>
      </View>
      <View>
        <Text style={[styles.testimonialName, { color: colors.text }]}>{testimonial.name}</Text>
        <View style={styles.testimonialRating}>
          {[...Array(5)].map((_, i) => (
            <Ionicons
              key={i}
              name={i < testimonial.rating ? 'star' : 'star-outline'}
              size={14}
              color="#FFD700"
            />
          ))}
        </View>
      </View>
    </View>
    <Text style={[styles.testimonialText, { color: isDark ? '#ccc' : '#666' }]}>
      "{testimonial.text}"
    </Text>
  </View>
);

export default function ExerciseDetailsScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams();
  const { theme, toggleTheme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === "dark";

  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('exercises');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const planData = exerciseData[type as keyof typeof exerciseData] || exerciseData.Ectomorph;

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

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, []);

  const openExerciseDetails = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setModalVisible(true);
  };

  // Fixed: Create separate style objects - one for regular views, one for Animated.View
  const getGlowingBorderStyle = (
    color: string
  ): any => {
    return {
      borderWidth: 2,
      borderColor: color,
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.4, 0.9],
      }),
      shadowRadius: glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [4, 12],
      }),
      // elevation doesn't work with animated values, so we'll use a fixed value
      elevation: 5,
    };
  };

  const sharePlan = async () => {
    try {
      await Share.share({
        message: `Check out the ${planData.name} on GymBro! Perfect for ${type} body type.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      {/* Premium Header with Gradient */}
      <LinearGradient
        colors={isDark ? ['#1a1a1a', '#0a0a0a'] : ['#ffffff', '#f5f5f5']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <View style={styles.logoContainer}>
              <View style={[styles.logoIconWrapper, { borderColor: planData.color }]}>
                <LinearGradient
                  colors={[planData.color + '40', planData.color + '20']}
                  style={styles.logoGradient}
                >
                  <Text style={styles.headerEmoji}>{planData.emoji}</Text>
                </LinearGradient>
              </View>
              <View>
                <Text style={[styles.logo, { color: planData.color }]}>
                  {type} Plan
                </Text>
                <Text style={[styles.logoSubtitle, { color: isDark ? '#aaa' : '#666' }]}>
                  {planData.stats.totalExercises} exercises • {planData.stats.weeklyFrequency}x/week
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={sharePlan}
              style={[styles.headerActionButton, { borderColor: planData.color + '40' }]}
            >
              <Ionicons name="share-outline" size={20} color={planData.color} />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={toggleTheme}
              style={[styles.headerActionButton, { borderColor: planData.color + '40' }]}
            >
              <Ionicons
                name={isDark ? "sunny" : "moon"}
                size={20}
                color={planData.color}
              />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'exercises' && styles.activeTab]}
          onPress={() => setActiveTab('exercises')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'exercises' ? planData.color : isDark ? '#888' : '#999' }
          ]}>
            Exercises
          </Text>
          {activeTab === 'exercises' && <View style={[styles.tabIndicator, { backgroundColor: planData.color }]} />}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'schedule' && styles.activeTab]}
          onPress={() => setActiveTab('schedule')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'schedule' ? planData.color : isDark ? '#888' : '#999' }
          ]}>
            Schedule
          </Text>
          {activeTab === 'schedule' && <View style={[styles.tabIndicator, { backgroundColor: planData.color }]} />}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'nutrition' && styles.activeTab]}
          onPress={() => setActiveTab('nutrition')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'nutrition' ? planData.color : isDark ? '#888' : '#999' }
          ]}>
            Nutrition
          </Text>
          {activeTab === 'nutrition' && <View style={[styles.tabIndicator, { backgroundColor: planData.color }]} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ backgroundColor: currentColors.background }}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Plan Overview Card with Gradient - Fixed: Using regular View instead of LinearGradient for animated styles */}
        {/* Plan Overview Card with Gradient – now an Animated.View so
            animated shadow props are legal */}
          <Animated.View
            style={[
              styles.overviewCard,
              getGlowingBorderStyle(planData.color),
              { backgroundColor: isDark ? currentColors.card : "#FFFFFF" },
            ]}
          >
            <LinearGradient
              colors={[planData.color + "20", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <Text style={[styles.planName, { color: planData.color }]}>
              {planData.name}
            </Text>
            <Text
              style={[styles.planDescription, { color: isDark ? "#ccc" : "#666" }]}
            >
              {planData.description}
            </Text>

            {/* …rest of card… */}
          </Animated.View>

          {/* Progress Card */}
          <ProgressCard planData={planData} colors={currentColors} isDark={isDark} />

          {/* Conditional Content Based on Tab */}
          {activeTab === 'exercises' && (
            <>
              {/* Exercises List */}
              <View style={styles.sectionHeader}>
                <Ionicons name="fitness" size={24} color={planData.color} />
                <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
                  Today's Focus
                </Text>
                <Text style={[styles.sectionCount, { color: planData.color }]}>
                  {planData.exercises.length} exercises
                </Text>
              </View>

              {planData.exercises.map((exercise: Exercise, index: number) => (
                <Animated.View
                  key={exercise.id}
                  style={{
                    transform: [
                      {
                        translateY: slideAnim.interpolate({
                          inputRange: [0, 30],
                          outputRange: [0, 10 * (index + 1)],
                        }),
                      },
                    ],
                  }}
                >
                  <TouchableOpacity
                    onPress={() => openExerciseDetails(exercise)}
                    activeOpacity={0.9}
                  >
                    {/* Fixed: Using View instead of Animated.View for the card since LinearGradient doesn't accept animated styles */}
                    <View
                      style={[
                        styles.exerciseCard,
                        {
                          borderWidth: 2,
                          borderColor: planData.color,
                          shadowColor: planData.color,
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.5,
                          shadowRadius: 8,
                          elevation: 5,
                          backgroundColor: isDark ? currentColors.card : "#FFFFFF"
                        }
                      ]}
                    >
                      <LinearGradient
                        colors={[planData.color + '10', 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFillObject}
                      />
                      
                      <View style={styles.exerciseCardContent}>
                        {/* Exercise Image */}
                        <View style={styles.exerciseImageContainer}>
                          <Image
                            source={{ uri: exercise.imageUrl }}
                            style={styles.exerciseImage}
                            resizeMode="cover"
                          />
                          <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.5)']}
                            style={styles.exerciseImageOverlay}
                          />
                          <View style={[styles.exerciseBadge, { backgroundColor: planData.color }]}>
                            <Ionicons name="play" size={12} color="#000" />
                          </View>
                        </View>

                        {/* Exercise Info */}
                        <View style={styles.exerciseInfo}>
                          <Text style={[styles.exerciseName, { color: currentColors.text }]} numberOfLines={1}>
                            {exercise.name}
                          </Text>
                          
                          <View style={styles.exerciseTags}>
                            <View style={[styles.exerciseTag, { backgroundColor: exercise.difficulty === 'Beginner' ? '#00FF4120' : exercise.difficulty === 'Intermediate' ? '#FFA50020' : '#FF444420' }]}>
                              <View style={[styles.tagDot, { 
                                backgroundColor: exercise.difficulty === 'Beginner' ? '#00FF41' : 
                                               exercise.difficulty === 'Intermediate' ? '#FFA500' : '#FF4444'
                              }]} />
                              <Text style={[styles.exerciseTagText, { 
                                color: exercise.difficulty === 'Beginner' ? '#00FF41' : 
                                       exercise.difficulty === 'Intermediate' ? '#FFA500' : '#FF4444'
                              }]}>
                                {exercise.difficulty}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.exerciseMetrics}>
                            <View style={styles.exerciseMetric}>
                              <Ionicons name="repeat" size={12} color={planData.color} />
                              <Text style={[styles.exerciseMetricText, { color: currentColors.text }]}>
                                {exercise.sets} sets
                              </Text>
                            </View>
                            <View style={styles.exerciseMetric}>
                              <Ionicons name="barbell" size={12} color={planData.color} />
                              <Text style={[styles.exerciseMetricText, { color: currentColors.text }]}>
                                {exercise.reps}
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* Arrow */}
                        <View style={[styles.exerciseArrow, { backgroundColor: planData.color + '15' }]}>
                          <Ionicons name="chevron-forward" size={20} color={planData.color} />
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </>
          )}

          {activeTab === 'schedule' && (
            <>
              <View style={styles.sectionHeader}>
                <Ionicons name="calendar" size={24} color={planData.color} />
                <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
                  Weekly Schedule
                </Text>
              </View>

              {planData.weeklySchedule.map((day: any, index: number) => (
                <View key={index} style={[styles.scheduleItem, { borderBottomColor: planData.color + '20' }]}>
                  <View style={styles.scheduleItemLeft}>
                    <Text style={[styles.scheduleItemDay, { color: currentColors.text }]}>{day.day}</Text>
                    <Text style={[styles.scheduleItemFocus, { color: planData.color }]}>{day.focus}</Text>
                  </View>
                  <View style={[styles.scheduleItemRight, { backgroundColor: day.intensity === 'High' ? '#FF444420' : day.intensity === 'Medium' ? '#FFA50020' : '#00FF4120' }]}>
                    <Text style={[styles.scheduleItemIntensity, { 
                      color: day.intensity === 'High' ? '#FF4444' : 
                             day.intensity === 'Medium' ? '#FFA500' : '#00FF41'
                    }]}>
                      {day.intensity}
                    </Text>
                    {day.exercises > 0 && (
                      <Text style={[styles.scheduleItemExercises, { color: isDark ? '#aaa' : '#666' }]}>
                        {day.exercises} exercises
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </>
          )}

          {activeTab === 'nutrition' && (
            <>
              <View style={styles.sectionHeader}>
                <Ionicons name="restaurant" size={24} color={planData.color} />
                <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
                  Nutrition Guide
                </Text>
              </View>

              <View style={styles.nutritionGrid}>
                {planData.nutritionTips.map((tip: any, index: number) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.nutritionCard,
                      {
                        borderWidth: 2,
                        borderColor: tip.color,
                        shadowColor: tip.color,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.5,
                        shadowRadius: 8,
                        elevation: 5,
                        backgroundColor: isDark ? currentColors.card : "#FFFFFF"
                      }
                    ]}
                  >
                    <LinearGradient
                      colors={[tip.color + '20', 'transparent']}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <View style={[styles.nutritionIcon, { backgroundColor: tip.color + '20' }]}>
                      <Ionicons name={tip.icon as any} size={28} color={tip.color} />
                    </View>
                    <Text style={[styles.nutritionTip, { color: currentColors.text }]}>
                      {tip.tip}
                    </Text>
                    <Text style={[styles.nutritionDetail, { color: isDark ? '#aaa' : '#666' }]}>
                      {tip.detail}
                    </Text>
                  </Animated.View>
                ))}
              </View>
            </>
          )}

          {/* Testimonials Section */}
          {planData.testimonials && (
            <>
              <View style={styles.sectionHeader}>
                <Ionicons name="chatbubbles" size={24} color={planData.color} />
                <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
                  Success Stories
                </Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.testimonialsScroll}>
                {planData.testimonials.map((testimonial: any) => (
                  <TestimonialCard
                    key={testimonial.id}
                    testimonial={testimonial}
                    colors={currentColors}
                    isDark={isDark}
                  />
                ))}
              </ScrollView>
            </>
          )}

          {/* Enhanced CTA Button */}
          <TouchableOpacity activeOpacity={0.9}>
            <LinearGradient
              colors={[planData.color, planData.color + '80']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.ctaButton]}
            >
              <View style={styles.ctaContent}>
                <View style={styles.ctaLeft}>
                  <Text style={styles.ctaTitle}>Ready to transform?</Text>
                  <Text style={styles.ctaSubtitle}>Start your journey today</Text>
                </View>
                <View style={styles.ctaRight}>
                  <Text style={styles.ctaEmoji}>💪</Text>
                  <Ionicons name="arrow-forward" size={24} color="#000" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Exercise Detail Modal */}
      <ExerciseDetailModal
        visible={modalVisible}
        exercise={selectedExercise}
        onClose={() => setModalVisible(false)}
        theme={theme}
        colors={currentColors}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 2,
    overflow: "hidden",
  },
  logoGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerEmoji: {
    fontSize: 24,
  },
  logo: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  logoSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    position: "relative",
  },
  activeTab: {},
  tabText: {
    fontSize: 15,
    fontWeight: "600",
  },
  tabIndicator: {
    position: "absolute",
    bottom: -8,
    width: "50%",
    height: 3,
    borderRadius: 1.5,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  overviewCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    position: "relative",
    overflow: "hidden",
  },
  planName: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8,
    zIndex: 1,
  },
  planDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    zIndex: 1,
  },
  quickStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 8,
    zIndex: 1,
  },
  quickStat: {
    alignItems: "center",
    gap: 4,
  },
  quickStatNumber: {
    fontSize: 16,
    fontWeight: "700",
  },
  quickStatDivider: {
    width: 1,
    height: 30,
  },
  progressCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  progressStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  progressStat: {
    alignItems: "center",
  },
  progressValue: {
    fontSize: 24,
    fontWeight: "800",
  },
  progressLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  progressDivider: {
    width: 1,
    height: 40,
  },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: "600",
  },
  exerciseCard: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 2,
    position: "relative",
  },
  exerciseCardContent: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
    zIndex: 1,
  },
  exerciseImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 12,
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
    top: 4,
    right: 4,
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
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  exerciseTags: {
    flexDirection: "row",
    marginBottom: 6,
  },
  exerciseTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  tagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  exerciseTagText: {
    fontSize: 10,
    fontWeight: "600",
  },
  exerciseMetrics: {
    flexDirection: "row",
    gap: 12,
  },
  exerciseMetric: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  exerciseMetricText: {
    fontSize: 11,
    fontWeight: "500",
  },
  exerciseArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  nutritionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  nutritionCard: {
    width: (width - 52) / 2,
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
    gap: 12,
    borderWidth: 2,
    position: "relative",
    overflow: "hidden",
  },
  nutritionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  nutritionTip: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 18,
    zIndex: 1,
  },
  nutritionDetail: {
    fontSize: 11,
    textAlign: "center",
    zIndex: 1,
  },
  ctaButton: {
    marginTop: 24,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#000",
  },
  ctaContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  ctaLeft: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000",
    marginBottom: 4,
  },
  ctaSubtitle: {
    fontSize: 13,
    color: "rgba(0,0,0,0.7)",
  },
  ctaRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ctaEmoji: {
    fontSize: 28,
  },
  scheduleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  scheduleItemLeft: {
    flex: 1,
  },
  scheduleItemDay: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  scheduleItemFocus: {
    fontSize: 14,
  },
  scheduleItemRight: {
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scheduleItemIntensity: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  scheduleItemExercises: {
    fontSize: 10,
  },
  testimonialsScroll: {
    marginBottom: 24,
  },
  testimonialCard: {
    width: width * 0.7,
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
  },
  testimonialHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  testimonialAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#00FF41",
    justifyContent: "center",
    alignItems: "center",
  },
  testimonialAvatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  testimonialName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  testimonialRating: {
    flexDirection: "row",
    gap: 2,
  },
  testimonialText: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: "italic",
  },
  // Modal Styles
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: "90%",
    overflow: "hidden",
  },
  modalGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  modalShareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  modalMediaContainer: {
    width: "100%",
    height: 220,
    position: "relative",
  },
  modalMedia: {
    width: "100%",
    height: "100%",
  },
  modalMediaGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  modalPlayButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  modalPlayIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  modalPlayText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  modalQuickStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  quickStatCard: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    gap: 4,
  },
  quickStatValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  quickStatLabel: {
    fontSize: 11,
  },
  modalTags: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  modalTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  modalTagText: {
    fontSize: 13,
    fontWeight: "600",
  },
  modalStatsGrid: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalStatItem: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 8,
  },
  modalStatValue: {
    fontSize: 20,
    fontWeight: "800",
  },
  modalStatLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  modalSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  modalSectionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  modalChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  modalChipText: {
    fontSize: 12,
    fontWeight: "500",
  },
  modalTipItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  modalTipText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  expertTipCard: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  expertTipContent: {
    flex: 1,
  },
  expertTipLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  expertTipText: {
    fontSize: 14,
    lineHeight: 20,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});