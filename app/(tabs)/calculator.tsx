import React, { useState } from 'react';

import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function CalculatorScreen() {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('1.2');
  const [results, setResults] = useState<{
    bmi?: number;
    bmr?: number;
    calories?: number;
  }>({});

  const calculate = () => {
    const ageNum = parseInt(age);
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (!ageNum || !weightNum || !heightNum) {
      alert('Please fill in all fields with valid numbers');
      return;
    }

    // BMI calculation
    const heightMeters = heightNum / 100;
    const bmi = weightNum / (heightMeters * heightMeters);

    // BMR calculation
    let bmr;
    if (gender === 'male') {
      bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5;
    } else {
      bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;
    }

    // Daily calories
    const calories = bmr * parseFloat(activityLevel);

    setResults({
      bmi: parseFloat(bmi.toFixed(2)),
      bmr: parseFloat(bmr.toFixed(2)),
      calories: parseFloat(calories.toFixed(2)),
    });
  };

  return (
    <LinearGradient
      colors={['#0E0E0E', '#1A1A1A', '#0E0E0E']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>FITNESS CALCULATOR</Text>

        {/* Age Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#888" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Age"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
          />
        </View>

        {/* Gender Picker */}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={gender}
            onValueChange={(itemValue) => setGender(itemValue)}
            style={styles.picker}
            dropdownIconColor="#D0FF00"
          >
            <Picker.Item label="Male" value="male" style={styles.pickerItem} />
            <Picker.Item label="Female" value="female" style={styles.pickerItem} />
          </Picker>
        </View>

        {/* Weight Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="barbell-outline" size={20} color="#888" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Weight (kg)"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
          />
        </View>

        {/* Height Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="resize-outline" size={20} color="#888" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Height (cm)"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={height}
            onChangeText={setHeight}
          />
        </View>

        {/* Activity Level Picker */}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={activityLevel}
            onValueChange={(itemValue) => setActivityLevel(itemValue)}
            style={styles.picker}
            dropdownIconColor="#D0FF00"
          >
            <Picker.Item label="Sedentary (little exercise)" value="1.2" style={styles.pickerItem} />
            <Picker.Item label="Lightly active" value="1.375" style={styles.pickerItem} />
            <Picker.Item label="Moderately active" value="1.55" style={styles.pickerItem} />
            <Picker.Item label="Very active" value="1.725" style={styles.pickerItem} />
            <Picker.Item label="Extra active" value="1.9" style={styles.pickerItem} />
          </Picker>
        </View>

        {/* Calculate Button */}
        <TouchableOpacity style={styles.button} onPress={calculate}>
          <Text style={styles.buttonText}>CALCULATE</Text>
        </TouchableOpacity>

        {/* Results (Animated) */}
        {results.bmi && (
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}

            style={styles.resultsContainer}
          >
            <Text style={styles.resultHeader}>YOUR RESULTS</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>BMI:</Text>
              <Text style={styles.resultValue}>{results.bmi}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>BMR:</Text>
              <Text style={styles.resultValue}>{results.bmr} kcal/day</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Daily Calories:</Text>
              <Text style={styles.resultValue}>{results.calories} kcal</Text>
            </View>
          </MotiView>
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
    padding: 24,
    paddingBottom: 48,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#D0FF00',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#FFF',
    paddingVertical: 16,
  },
  pickerContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    color: '#FFF',
    height: 50,
  },
  pickerItem: {
    color: '#FFF',
    backgroundColor: '#1A1A1A',
  },
  button: {
    backgroundColor: '#D0FF00',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultsContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
  },
  resultHeader: {
    color: '#D0FF00',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 12,
    textAlign: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resultLabel: {
    color: '#888',
    fontSize: 16,
  },
  resultValue: {
    color: '#FFF',
    fontWeight: '600',
  },
});