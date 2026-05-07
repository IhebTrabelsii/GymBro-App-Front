// app/form-check.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSimpleTheme } from '../context/SimpleThemeContext';
import { Colors } from '@/constants/Colors';
import PoseDetectionView from '../components/PoseDetectionView';

// Exercise library
const EXERCISES = [
  { id: 'squat', name: 'Squat', icon: '🏋️', color: '#39FF14', description: 'Lower body strength' },
  { id: 'pushup', name: 'Push-up', icon: '💪', color: '#FF6B6B', description: 'Chest & arms' },
  { id: 'lunge', name: 'Lunge', icon: '🦵', color: '#FFC107', description: 'Legs & balance' },
  { id: 'deadlift', name: 'Deadlift', icon: '🏋️‍♂️', color: '#FF9500', description: 'Back & hamstrings' },
  { id: 'bench press', name: 'Bench Press', icon: '🎯', color: '#007AFF', description: 'Chest & triceps' },
  { id: 'pull-up', name: 'Pull-up', icon: '⬆️', color: '#AF52DE', description: 'Back & biceps' },
];

export default function FormCheckScreen() {
  const router = useRouter();
  const { theme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === 'dark';
  
  const [showExerciseModal, setShowExerciseModal] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [showCameraOptions, setShowCameraOptions] = useState(false);
  const [analysisStarted, setAnalysisStarted] = useState(false);
  
  const handleSelectExercise = (exerciseId: string) => {
    setSelectedExercise(exerciseId);
    setShowExerciseModal(false);
    setShowCameraOptions(true);
  };
  
  const handleBackToExercises = () => {
    setSelectedExercise(null);
    setShowCameraOptions(false);
    setShowExerciseModal(true);
    setAnalysisStarted(false);
  };
  
  const handleStartAnalysis = () => {
    setAnalysisStarted(true);
  };
  
  const selectedExerciseData = EXERCISES.find(e => e.id === selectedExercise);
  
  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[currentColors.primary + '20', 'transparent']}
        style={styles.headerGradient}
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={currentColors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: currentColors.text }]}>Form Check</Text>
          {selectedExercise && !analysisStarted && (
            <Text style={[styles.headerExercise, { color: currentColors.primary }]}>
              {selectedExerciseData?.name}
            </Text>
          )}
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Exercise Selection Modal */}
      <Modal
        visible={showExerciseModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => router.back()}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: isDark ? '#0a0a0a' : '#fff' }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: currentColors.text }]}>Choose Exercise</Text>
              <TouchableOpacity onPress={() => router.back()} style={styles.modalClose}>
                <Ionicons name="close" size={24} color={currentColors.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.modalSubtitle, { color: isDark ? '#888' : '#666' }]}>
              Select an exercise to check your form
            </Text>
            
            {/* Exercise Grid */}
            <ScrollView showsVerticalScrollIndicator={false} style={styles.exerciseGrid}>
              {EXERCISES.map((exercise) => (
                <TouchableOpacity
                  key={exercise.id}
                  style={[
                    styles.exerciseCard,
                    {
                      backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
                      borderColor: exercise.color + '30',
                    },
                  ]}
                  onPress={() => handleSelectExercise(exercise.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.exerciseIconContainer, { backgroundColor: exercise.color + '15' }]}>
                    <Text style={styles.exerciseIcon}>{exercise.icon}</Text>
                  </View>
                  <Text style={[styles.exerciseName, { color: currentColors.text }]}>
                    {exercise.name}
                  </Text>
                  <Text style={[styles.exerciseDescription, { color: isDark ? '#888' : '#999' }]}>
                    {exercise.description}
                  </Text>
                  <View style={[styles.exerciseBadge, { backgroundColor: exercise.color + '20' }]}>
                    <Ionicons name="scan" size={12} color={exercise.color} />
                    <Text style={[styles.exerciseBadgeText, { color: exercise.color }]}>Check Form</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Camera Options Modal */}
      <Modal
        visible={showCameraOptions && !analysisStarted}
        animationType="slide"
        transparent={true}
        onRequestClose={handleBackToExercises}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: isDark ? '#0a0a0a' : '#fff' }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleBackToExercises} style={styles.modalBack}>
                <Ionicons name="arrow-back" size={24} color={currentColors.text} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: currentColors.text }]}>
                Check {selectedExerciseData?.name} Form
              </Text>
              <View style={{ width: 40 }} />
            </View>
            
            {/* Exercise Preview */}
            <View style={[styles.previewCard, { backgroundColor: isDark ? '#1a1a1a' : '#f0f0f0' }]}>
              <Text style={styles.previewEmoji}>{selectedExerciseData?.icon}</Text>
              <View>
                <Text style={[styles.previewTitle, { color: currentColors.text }]}>
                  {selectedExerciseData?.name}
                </Text>
                <Text style={[styles.previewSubtitle, { color: isDark ? '#888' : '#999' }]}>
                  {selectedExerciseData?.description}
                </Text>
              </View>
            </View>
            
            {/* Instruction */}
            <View style={styles.instructionCard}>
              <Ionicons name="information-circle" size={24} color={currentColors.primary} />
              <Text style={[styles.instructionText, { color: isDark ? '#ccc' : '#666' }]}>
                Record a short video (3-8 seconds) of yourself doing the exercise. 
                Position your full body in frame for best results.
              </Text>
            </View>
            
            {/* Action Buttons */}
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: currentColors.primary }]}
                onPress={handleStartAnalysis}
              >
                <Ionicons name="videocam" size={24} color="#000" />
                <Text style={styles.optionButtonText}>Start Recording</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.optionButtonOutline, { borderColor: currentColors.primary }]}
                onPress={handleStartAnalysis}
              >
                <Ionicons name="cloud-upload" size={24} color={currentColors.primary} />
                <Text style={[styles.optionButtonOutlineText, { color: currentColors.primary }]}>
                  Upload Video
                </Text>
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.noteText, { color: isDark ? '#555' : '#ccc' }]}>
              Your video will be analyzed by AI to provide form feedback
            </Text>
          </View>
        </View>
      </Modal>

      {/* Analysis Screen (when started) */}
      {analysisStarted && selectedExercise && (
        <PoseDetectionView 
          exerciseType={selectedExercise} 
          onResult={(feedback, score) => {
            console.log('Analysis complete:', { feedback, score });
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerExercise: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  modalClose: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBack: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  exerciseGrid: {
    paddingHorizontal: 16,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
  },
  exerciseIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  exerciseIcon: {
    fontSize: 24,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  exerciseDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  exerciseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    gap: 4,
  },
  exerciseBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 20,
    gap: 14,
    marginBottom: 20,
  },
  previewEmoji: {
    fontSize: 36,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  previewSubtitle: {
    fontSize: 12,
  },
  instructionCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    gap: 12,
    marginBottom: 24,
    backgroundColor: 'rgba(57,255,20,0.08)',
  },
  instructionText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  optionsContainer: {
    marginHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 30,
    gap: 10,
  },
  optionButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  optionButtonOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 30,
    gap: 10,
    borderWidth: 1.5,
  },
  optionButtonOutlineText: {
    fontSize: 16,
    fontWeight: '700',
  },
  noteText: {
    textAlign: 'center',
    fontSize: 12,
    marginHorizontal: 20,
  },
});