import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function PlanScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams(); // FIX: useLocalSearchParams instead of useSearchParams
  const plan = typeof type === 'string' ? type : '';

  const exercises = {
    Ectomorph: [
      'Heavy Squats - 4 sets x 6 reps',
      'Deadlifts - 4 sets x 5 reps',
      'High Carb Meals',
    ],
    Mesomorph: [
      'Balanced Cardio - 30 mins',
      'Bench Press - 4 sets x 8 reps',
      'Circuit Training',
    ],
    Endomorph: [
      'HIIT Cardio - 20 mins',
      'Bodyweight Circuits',
      'Low Carb Diet',
    ],
  };

  return (
    <LinearGradient colors={['#0E0E0E', '#1A1A1A', '#0E0E0E']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#D0FF00" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{plan} PLAN</Text>

        <View style={styles.exerciseList}>
          {(exercises[plan as keyof typeof exercises] || []).map((exercise, index) => (
            <View key={index} style={styles.exerciseItem}>
              <Ionicons name="fitness-outline" size={20} color="#D0FF00" style={{ marginRight: 12 }} />
              <Text style={styles.exerciseText}>{exercise}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backText: {
    color: '#D0FF00',
    fontWeight: '600',
    marginLeft: 5,
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D0FF00',
    marginBottom: 24,
    textAlign: 'center',
  },
  exerciseList: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#39FF14',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseText: {
    color: '#FFF',
    fontSize: 16,
    opacity: 0.85,
  },
});
