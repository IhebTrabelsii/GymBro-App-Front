import React, { useState } from 'react';

import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  ScrollView 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiPressable } from 'moti/interactions';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const bodyTypes = [
  {
    id: '1',
    name: 'Ectomorph',
    desc: 'Lean, fast metabolism. Focus on heavy weights + carbs.',
    icon: 'leaf-outline',
    color: '#39FF14',
  },
  {
    id: '2',
    name: 'Mesomorph',
    desc: 'Naturally muscular. Balanced strength/cardio works best.',
    icon: 'fitness-outline',
    color: '#00F0FF',
  },
  {
    id: '3',
    name: 'Endomorph',
    desc: 'Gains fat easily. Prioritize cardio + circuit training.',
    icon: 'flash-outline',
    color: '#FF10F0',
  },
];

export default function WorkoutScreen() {
  const router = useRouter();
  const [savedPlans, setSavedPlans] = useState<string[]>([]);

  const handleSelect = (type: string) => {
    router.push({ pathname: '/plan', params: { type } });
  };

  const toggleSavePlan = (plan: string) => {
    if (savedPlans.includes(plan)) {
      setSavedPlans(savedPlans.filter(item => item !== plan));
    } else {
      setSavedPlans([...savedPlans, plan]);
    }
  };

  return (
    <LinearGradient
      colors={['#0E0E0E', '#1A1A1A', '#0E0E0E']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>CHOOSE YOUR BODY TYPE</Text>
        
        <FlatList
          data={bodyTypes}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <MotiPressable
              onPress={() => handleSelect(item.name)}
              style={[styles.card, { borderColor: item.color }]}
              animate={({ pressed }) => ({
                scale: pressed ? 0.95 : 1,
              })}
            >
              <View style={styles.cardHeader}>
                <Ionicons name={item.icon as any} size={24} color={item.color} />
                <Text style={[styles.cardTitle, { color: item.color }]}>
                  {item.name}
                </Text>
              </View>
              <Text style={styles.cardDesc}>{item.desc}</Text>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => toggleSavePlan(item.name)}
              >
                <Ionicons
                  name={savedPlans.includes(item.name) ? 'bookmark' : 'bookmark-outline'}
                  size={20}
                  color={item.color}
                />
              </TouchableOpacity>
            </MotiPressable>
          )}
        />

        {savedPlans.length > 0 && (
          <View style={styles.savedSection}>
            <Text style={styles.savedTitle}>YOUR SAVED PLANS</Text>
            {savedPlans.map((plan) => (
              <TouchableOpacity
                key={plan}
                style={styles.savedItem}
                onPress={() => handleSelect(plan)}
              >
                <Text style={styles.savedText}>{plan}</Text>
                <Ionicons name="chevron-forward" size={20} color="#D0FF00" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D0FF00',
    textAlign: 'center',
    marginBottom: 24,
  },
  grid: {
    gap: 16,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardDesc: {
    color: '#FFF',
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 15,
  },
  saveButton: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  savedSection: {
    marginTop: 30,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
  },
  savedTitle: {
    color: '#D0FF00',
    fontWeight: '600',
    marginBottom: 10,
  },
  savedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  savedText: {
    color: '#FFF',
    fontSize: 16,
  },
});