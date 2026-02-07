import Clock from '@/components/clock';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  Alert,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { useSimpleTheme } from '../context/SimpleThemeContext';
import { Colors } from '@/constants/Colors';

export default function CalculatorScreen() {
  const { theme, toggleTheme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === 'dark';

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
    Alert.alert('Validation Error', 'Please fill in all fields with valid numbers');
    return;
  }

  const heightMeters = heightNum / 100;
  const bmi = weightNum / (heightMeters * heightMeters);

  let bmr;
  if (gender === 'male') {
    bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5;
  } else {
    bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;
  }

  const calories = bmr * parseFloat(activityLevel);

  setResults({
    bmi: parseFloat(bmi.toFixed(2)),
    bmr: parseFloat(bmr.toFixed(2)),
    calories: parseFloat(calories.toFixed(2)),
  });
};

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      {/* Header with Theme Toggle */}
      <View style={[styles.header, { 
        backgroundColor: isDark ? currentColors.background : '#FFFFFF',
        borderBottomColor: isDark ? currentColors.border : 'rgba(57, 255, 20, 0.15)',
      }]}>
        <Text style={[styles.title, { color: currentColors.text }]}>
          FITNESS CALCULATOR
        </Text>
        
        <View style={styles.headerRight}>
          <Clock style={{ marginRight: 12 }} />
          
          <TouchableOpacity 
            onPress={toggleTheme}
            style={[styles.themeToggle, {
              backgroundColor: currentColors.primary,
              shadowColor: currentColors.primary,
            }]}
            activeOpacity={0.8}
          >
            <Ionicons 
              name={isDark ? 'sunny' : 'moon'} 
              size={20} 
              color={isDark ? currentColors.background : '#FFFFFF'} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Age Input */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 100, duration: 400 }}
        >
          <View style={[styles.inputContainer, { 
            backgroundColor: isDark ? currentColors.card : '#F5F5F5',
            borderColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'transparent',
          }]}>
            <Ionicons 
              name="person-outline" 
              size={22} 
              color={currentColors.primary} 
              style={styles.icon} 
            />
            <TextInput
              style={[styles.input, { color: currentColors.text }]}
              placeholder="Age"
              placeholderTextColor={isDark ? '#888' : '#999'}
              keyboardType="numeric"
              value={age}
              onChangeText={setAge}
            />
          </View>
        </MotiView>

        {/* Gender Picker */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 200, duration: 400 }}
        >
          <View style={[styles.pickerContainer, { 
            backgroundColor: isDark ? currentColors.card : '#F5F5F5',
            borderColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'transparent',
          }]}>
            <Ionicons 
              name="male-female-outline" 
              size={22} 
              color={currentColors.primary} 
              style={styles.pickerIcon} 
            />
            <Picker
              selectedValue={gender}
              onValueChange={(itemValue) => setGender(itemValue)}
              style={[styles.picker, { color: currentColors.text }]}
              dropdownIconColor={currentColors.primary}
            >
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
            </Picker>
          </View>
        </MotiView>

        {/* Weight Input */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 300, duration: 400 }}
        >
          <View style={[styles.inputContainer, { 
            backgroundColor: isDark ? currentColors.card : '#F5F5F5',
            borderColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'transparent',
          }]}>
            <Ionicons 
              name="barbell-outline" 
              size={22} 
              color={currentColors.primary} 
              style={styles.icon} 
            />
            <TextInput
              style={[styles.input, { color: currentColors.text }]}
              placeholder="Weight (kg)"
              placeholderTextColor={isDark ? '#888' : '#999'}
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />
          </View>
        </MotiView>

        {/* Height Input */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 400, duration: 400 }}
        >
          <View style={[styles.inputContainer, { 
            backgroundColor: isDark ? currentColors.card : '#F5F5F5',
            borderColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'transparent',
          }]}>
            <Ionicons 
              name="resize-outline" 
              size={22} 
              color={currentColors.primary} 
              style={styles.icon} 
            />
            <TextInput
              style={[styles.input, { color: currentColors.text }]}
              placeholder="Height (cm)"
              placeholderTextColor={isDark ? '#888' : '#999'}
              keyboardType="numeric"
              value={height}
              onChangeText={setHeight}
            />
          </View>
        </MotiView>

        {/* Activity Level Picker */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 500, duration: 400 }}
        >
          <View style={[styles.pickerContainer, { 
            backgroundColor: isDark ? currentColors.card : '#F5F5F5',
            borderColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'transparent',
          }]}>
            <Ionicons 
              name="fitness-outline" 
              size={22} 
              color={currentColors.primary} 
              style={styles.pickerIcon} 
            />
            <Picker
              selectedValue={activityLevel}
              onValueChange={(itemValue) => setActivityLevel(itemValue)}
              style={[styles.picker, { color: currentColors.text }]}
              dropdownIconColor={currentColors.primary}
            >
              <Picker.Item label="Sedentary (little exercise)" value="1.2" />
              <Picker.Item label="Lightly active" value="1.375" />
              <Picker.Item label="Moderately active" value="1.55" />
              <Picker.Item label="Very active" value="1.725" />
              <Picker.Item label="Extra active" value="1.9" />
            </Picker>
          </View>
        </MotiView>

        {/* Calculate Button */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 600, duration: 400 }}
        >
          <TouchableOpacity 
            style={[styles.button, { 
              backgroundColor: currentColors.primary,
              shadowColor: currentColors.primary,
            }]} 
            onPress={calculate}
            activeOpacity={0.85}
          >
            <Ionicons 
              name="calculator" 
              size={20} 
              color={isDark ? currentColors.background : '#FFFFFF'} 
            />
            <Text style={[styles.buttonText, { 
              color: isDark ? currentColors.background : '#FFFFFF' 
            }]}>
              CALCULATE
            </Text>
          </TouchableOpacity>
        </MotiView>

        {/* Results */}
        {results.bmi && (
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 500 }}
            style={[styles.resultsContainer, { 
              backgroundColor: isDark ? currentColors.card : '#FFFFFF',
              borderColor: isDark ? currentColors.primary : 'rgba(57, 255, 20, 0.2)',
              shadowColor: isDark ? currentColors.primary : '#000',
            }]}
          >
            <View style={styles.resultHeader}>
              <Ionicons name="stats-chart" size={24} color={currentColors.primary} />
              <Text style={[styles.resultTitle, { color: currentColors.text }]}>
                YOUR RESULTS
              </Text>
            </View>
            
            <View style={[styles.divider, { 
              backgroundColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.15)' 
            }]} />

            <View style={styles.resultRow}>
              <View style={styles.resultLabelContainer}>
                <Ionicons name="body-outline" size={20} color={currentColors.primary} />
                <Text style={[styles.resultLabel, { 
                  color: isDark ? currentColors.text : '#666' 
                }]}>
                  BMI
                </Text>
              </View>
              <Text style={[styles.resultValue, { color: currentColors.primary }]}>
                {results.bmi}
              </Text>
            </View>

            <View style={styles.resultRow}>
              <View style={styles.resultLabelContainer}>
                <Ionicons name="flame-outline" size={20} color={currentColors.primary} />
                <Text style={[styles.resultLabel, { 
                  color: isDark ? currentColors.text : '#666' 
                }]}>
                  BMR
                </Text>
              </View>
              <Text style={[styles.resultValue, { color: currentColors.primary }]}>
                {results.bmr} kcal/day
              </Text>
            </View>

            <View style={styles.resultRow}>
              <View style={styles.resultLabelContainer}>
                <Ionicons name="nutrition-outline" size={20} color={currentColors.primary} />
                <Text style={[styles.resultLabel, { 
                  color: isDark ? currentColors.text : '#666' 
                }]}>
                  Daily Calories
                </Text>
              </View>
              <Text style={[styles.resultValue, { color: currentColors.primary }]}>
                {results.calories} kcal
              </Text>
            </View>
          </MotiView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    borderBottomWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingLeft: 16,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  pickerIcon: {
    marginRight: 12,
  },
  picker: {
    flex: 1,
    height: 50,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 8,
    marginBottom: 24,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  buttonText: {
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1,
  },
  resultsContainer: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 10,
  },
  resultTitle: {
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  divider: {
    height: 2,
    borderRadius: 1,
    marginBottom: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingVertical: 8,
  },
  resultLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultValue: {
    fontWeight: '700',
    fontSize: 18,
  },
});