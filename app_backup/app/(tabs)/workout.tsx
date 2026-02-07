import React, { useState } from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { MotiPressable } from 'moti/interactions';
import { MotiView } from 'moti';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
} from 'react-native';
import { useSimpleTheme } from '../context/SimpleThemeContext';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

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
  const { theme, toggleTheme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === 'dark';
  
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
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      <View style={[styles.topBar, { 
        backgroundColor: isDark ? currentColors.background : '#FFFFFF',
        borderBottomColor: isDark ? currentColors.border : 'rgba(57, 255, 20, 0.15)',
      }]}>
        <TouchableOpacity onPress={() => router.replace('/')} activeOpacity={0.7}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="dumbbell" size={28} color={currentColors.primary} />
            <Text style={[styles.logo, { color: currentColors.primary }]}>
              GymBro
            </Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.topRightSection}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={[styles.backButton, { 
              backgroundColor: isDark ? currentColors.card : '#F5F5F5',
              borderWidth: 1.5,
              borderColor: currentColors.primary,
            }]}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={18} color={currentColors.primary} />
            <Text style={[styles.backText, { color: currentColors.primary }]}>
              Back
            </Text>
          </TouchableOpacity>
        </View>
        
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

      <ScrollView
        style={{ backgroundColor: currentColors.background }} 
        contentContainerStyle={[styles.scrollContainer]}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Hero Section */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 600 }}
        >
          <View style={[styles.heroCard, { 
            backgroundColor: isDark ? currentColors.card : '#FFFFFF',
            borderColor: isDark ? currentColors.primary : 'rgba(57, 255, 20, 0.2)',
            shadowColor: isDark ? currentColors.primary : '#000',
          }]}>
            <View style={styles.heroContent}>
              <View style={[styles.iconCircle, { 
                backgroundColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.1)' 
              }]}>
                <MaterialCommunityIcons name="human" size={40} color={currentColors.primary} />
              </View>
              <Text style={[styles.heroTitle, { color: currentColors.text }]}>
                Discover Your Body Type
              </Text>
              <Text style={[styles.heroSubtitle, { 
                color: isDark ? currentColors.text : '#666' 
              }]}>
                Choose the right training plan for your genetics
              </Text>
            </View>
          </View>
        </MotiView>

        {/* Body Types Grid */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 150, duration: 500 }}
        >
          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
            SELECT YOUR BODY TYPE
          </Text>
          
          <FlatList
            data={bodyTypes}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => (
              <MotiPressable
                onPress={() => handleSelect(item.name)}
                animate={({ pressed }) => ({
                  scale: pressed ? 0.95 : 1,
                })}
              >
                <View style={[styles.card, { 
                  backgroundColor: isDark ? currentColors.card : '#FFFFFF',
                  borderColor: isDark ? item.color + '40' : item.color + '20',
                  shadowColor: isDark ? currentColors.primary : '#000',
                }]}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.cardIconContainer, { 
                      backgroundColor: isDark ? item.color + '20' : item.color + '10' 
                    }]}>
                      <Ionicons name={item.icon as any} size={22} color={item.color} />
                    </View>
                    <Text style={[styles.cardTitle, { color: item.color }]}>
                      {item.name}
                    </Text>
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
                  </View>
                  
                  {/* Characteristic Icons Row */}
                  <View style={styles.characteristicsRow}>
                    <View style={styles.characteristicItem}>
                      <View style={[styles.charIconContainer, { 
                        backgroundColor: isDark ? item.color + '20' : item.color + '10' 
                      }]}>
                        <MaterialCommunityIcons name="weight" size={20} color={item.color} />
                      </View>
                      <Text style={[styles.charText, { 
                        color: isDark ? currentColors.text : '#333' 
                      }]}>
                        {item.id === '1' ? 'Heavy Weights' : 
                         item.id === '2' ? 'Balanced' : 'Cardio Focus'}
                      </Text>
                    </View>
                    
                    <View style={styles.characteristicItem}>
                      <View style={[styles.charIconContainer, { 
                        backgroundColor: isDark ? item.color + '20' : item.color + '10' 
                      }]}>
                        <MaterialCommunityIcons name="food-apple" size={20} color={item.color} />
                      </View>
                      <Text style={[styles.charText, { 
                        color: isDark ? currentColors.text : '#333' 
                      }]}>
                        {item.id === '1' ? 'High Carbs' : 
                         item.id === '2' ? 'Balanced' : 'Low Carbs'}
                      </Text>
                    </View>
                    
                    <View style={styles.characteristicItem}>
                      <View style={[styles.charIconContainer, { 
                        backgroundColor: isDark ? item.color + '20' : item.color + '10' 
                      }]}>
                        <Ionicons name="barbell" size={20} color={item.color} />
                      </View>
                      <Text style={[styles.charText, { 
                        color: isDark ? currentColors.text : '#333' 
                      }]}>
                        {item.id === '1' ? 'Strength' : 
                         item.id === '2' ? 'Hybrid' : 'Endurance'}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={[styles.cardDesc, { 
                    color: isDark ? currentColors.text : '#333' 
                  }]}>
                    {item.desc}
                  </Text>
                </View>
              </MotiPressable>
            )}
          />
        </MotiView>

        {/* Saved Plans Section */}
        {savedPlans.length > 0 && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 300, duration: 500 }}
          >
            <View style={[styles.savedSection, { 
              backgroundColor: isDark ? currentColors.card : '#FFFFFF',
              borderColor: isDark ? currentColors.primary + '40' : 'rgba(57, 255, 20, 0.15)',
              shadowColor: isDark ? currentColors.primary : '#000',
            }]}>
              <View style={styles.savedHeader}>
                <View style={[styles.savedIcon, { 
                  backgroundColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.1)' 
                }]}>
                  <Ionicons name="bookmark" size={20} color={currentColors.primary} />
                </View>
                <Text style={[styles.savedTitle, { color: currentColors.primary }]}>
                  YOUR SAVED PLANS
                </Text>
              </View>
              
              <View style={[styles.divider, { 
                backgroundColor: isDark ? currentColors.primary + '20' : 'rgba(57, 255, 20, 0.1)' 
              }]} />
              
              {savedPlans.map((plan) => (
                <TouchableOpacity
                  key={plan}
                  style={styles.savedItem}
                  onPress={() => handleSelect(plan)}
                  activeOpacity={0.7}
                >
                  <View style={styles.savedItemLeft}>
                    <View style={[styles.savedBullet, { backgroundColor: currentColors.primary }]} />
                    <Text style={[styles.savedText, { color: currentColors.text }]}>
                      {plan}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={currentColors.primary} />
                </TouchableOpacity>
              ))}
            </View>
          </MotiView>
        )}

        {/* Action Button */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 450, duration: 500 }}
        >
          <TouchableOpacity 
            style={[styles.primaryButton, { 
              backgroundColor: currentColors.primary,
              shadowColor: currentColors.primary,
            }]}
            activeOpacity={0.85}
            onPress={() => router.push('/')}
          >
            <MaterialCommunityIcons name="home" size={24} color={isDark ? currentColors.background : '#FFFFFF'} />
            <Text style={[styles.primaryButtonText, { 
              color: isDark ? currentColors.background : '#FFFFFF' 
            }]}>
              Back to Home
            </Text>
          </TouchableOpacity>
        </MotiView>

        {/* Info Card */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 600, duration: 500 }}
        >
          <View style={[styles.infoCard, { 
            backgroundColor: isDark ? currentColors.card : '#FFFFFF',
            borderColor: isDark ? currentColors.primary + '40' : 'rgba(57, 255, 20, 0.15)',
            shadowColor: isDark ? currentColors.primary : '#000',
          }]}>
            <View style={styles.infoHeader}>
              <View style={[styles.infoIcon, { 
                backgroundColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.1)' 
              }]}>
                <Ionicons name="information-circle" size={20} color={currentColors.primary} />
              </View>
              <Text style={[styles.infoTitle, { color: currentColors.text }]}>
                Body Type Guide
              </Text>
            </View>
            
            <View style={[styles.divider, { 
              backgroundColor: isDark ? currentColors.primary + '20' : 'rgba(57, 255, 20, 0.1)' 
            }]} />
            
            <Text style={[styles.infoText, { 
              color: isDark ? currentColors.text : '#666' 
            }]}>
              Each body type responds differently to training and nutrition. Select your type to get a personalized workout plan designed for optimal results.
            </Text>
          </View>
        </MotiView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
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
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  themeToggle: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
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
  topRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  backText: {
    fontWeight: '600',
    fontSize: 14,
  },
  scrollContainer: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 24,
    padding: 28,
    marginBottom: 20,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  heroContent: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    opacity: 0.8,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 16,
    textAlign: 'center',
  },
  grid: {
    gap: 16,
    marginBottom: 20,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  cardIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    letterSpacing: 0.3,
  },
  saveButton: {
    padding: 4,
  },
  characteristicsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  characteristicItem: {
    alignItems: 'center',
    flex: 1,
  },
  charIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  charText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  cardDesc: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  savedSection: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  savedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  savedIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savedTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  divider: {
    height: 2,
    borderRadius: 1,
    marginBottom: 16,
  },
  savedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  savedItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  savedBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  savedText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 20,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  infoCard: {
    borderRadius: 20,
    padding: 20,
    marginTop: 8,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
});