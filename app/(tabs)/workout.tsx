
import { Colors } from '@/constants/Colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { useSimpleTheme } from '../../context/SimpleThemeContext';

const { width } = Dimensions.get('window');

// Types
type BodyType = {
  id: string;
  name: 'Ectomorph' | 'Mesomorph' | 'Endomorph';
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
  bodyType: 'Ectomorph' | 'Mesomorph' | 'Endomorph';
  focus: string;
  days: string[];
  tips: string;
  icon: string;
};

type PlansResponse = {
  success: boolean;
  data: Plan[];
};

export default function WorkoutScreen() {
  const router = useRouter();
  const { theme, toggleTheme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === 'dark';
  
  const [savedPlans, setSavedPlans] = useState<string[]>([]);
  const [bodyTypes, setBodyTypes] = useState<BodyType[]>([
    // Initialize with basic structure, counts will be updated from API
    {
      id: '1',
      name: 'Ectomorph',
      desc: 'Lean, fast metabolism. Focus on heavy weights + carbs.',
      icon: 'leaf-outline',
      color: '#39FF14',
      characteristics: [
        { icon: 'weight', label: 'Heavy Weights' },
        { icon: 'food-apple', label: 'High Carbs' },
        { icon: 'dumbbell', label: 'Strength' },
      ],
      planCount: 0,
    },
    {
      id: '2',
      name: 'Mesomorph',
      desc: 'Naturally muscular. Balanced strength/cardio works best.',
      icon: 'fitness-outline',
      color: '#00F0FF',
      characteristics: [
        { icon: 'weight', label: 'Balanced' },
        { icon: 'food-apple', label: 'Balanced' },
        { icon: 'dumbbell', label: 'Hybrid' },
      ],
      planCount: 0,
    },
    {
      id: '3',
      name: 'Endomorph',
      desc: 'Gains fat easily. Prioritize cardio + circuit training.',
      icon: 'flash-outline',
      color: '#FF10F0',
      characteristics: [
        { icon: 'weight', label: 'Cardio Focus' },
        { icon: 'food-apple', label: 'Low Carbs' },
        { icon: 'dumbbell', label: 'Endurance' },
      ],
      planCount: 0,
    },
  ]);
  
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    
    fetchPlans();
    loadSavedPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch("http://192.168.100.143:3000/api/plans");
      const data = (await response.json()) as PlansResponse;

      if (response.ok && data.success) {
        setPlans(data.data);
        
        // Update plan counts for each body type
        const updatedBodyTypes = bodyTypes.map(bodyType => ({
          ...bodyType,
          planCount: data.data.filter(plan => plan.bodyType === bodyType.name).length
        }));
        setBodyTypes(updatedBodyTypes);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedPlans = async () => {
    try {
      const saved = await AsyncStorage.getItem('savedPlans');
      if (saved) {
        setSavedPlans(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading saved plans:", error);
    }
  };

  const saveSavedPlans = async (plans: string[]) => {
    try {
      await AsyncStorage.setItem('savedPlans', JSON.stringify(plans));
    } catch (error) {
      console.error("Error saving plans:", error);
    }
  };

  const handleSelect = (type: string) => {
    // Pass the type and all plans for that body type
    const plansForType = plans.filter(plan => plan.bodyType === type);
    router.push({ 
      pathname: '/plan', 
      params: { 
        type,
        plans: JSON.stringify(plansForType)
      } 
    });
  };

  const toggleSavePlan = (planName: string) => {
    let updatedPlans: string[];
    if (savedPlans.includes(planName)) {
      updatedPlans = savedPlans.filter(item => item !== planName);
    } else {
      updatedPlans = [...savedPlans, planName];
    }
    setSavedPlans(updatedPlans);
    saveSavedPlans(updatedPlans);
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
      {/* Top Bar */}
      <View style={[styles.topBar, { 
        backgroundColor: isDark ? 'rgba(18, 18, 18, 0.98)' : 'rgba(255, 255, 255, 0.98)',
        borderBottomColor: isDark ? 'rgba(57, 255, 20, 0.15)' : 'rgba(57, 255, 20, 0.1)',
      }]}>
        <TouchableOpacity onPress={() => router.replace('/')} activeOpacity={0.7}>
          <View style={styles.logoContainer}>
            <View style={[styles.logoIconWrapper, {
              backgroundColor: isDark ? 'rgba(57, 255, 20, 0.15)' : 'rgba(57, 255, 20, 0.1)',
            }]}>
              <MaterialCommunityIcons name="dumbbell" size={24} color={currentColors.primary} />
            </View>
            <Text style={[styles.logo, { color: currentColors.primary }]}>
              GymBro
            </Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.topRightSection}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={[styles.backButton, { 
              backgroundColor: isDark ? 'rgba(57, 255, 20, 0.12)' : 'rgba(57, 255, 20, 0.06)',
              borderWidth: 1.5,
              borderColor: isDark 
                ? 'rgba(57, 255, 20, 0.3)' 
                : 'rgba(57, 255, 20, 0.25)',
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
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Hero Section */}
          <View style={[styles.heroCard, { 
            backgroundColor: isDark ? currentColors.card : '#FFFFFF',
            borderColor: isDark 
              ? 'rgba(57, 255, 20, 0.2)' 
              : 'rgba(57, 255, 20, 0.15)',
            shadowColor: currentColors.primary,
          }]}>
            <View style={[styles.decorCircle, styles.decorCircle1, {
              backgroundColor: isDark ? 'rgba(57, 255, 20, 0.04)' : 'rgba(57, 255, 20, 0.025)',
            }]} />
            <View style={[styles.decorCircle, styles.decorCircle2, {
              backgroundColor: isDark ? 'rgba(57, 255, 20, 0.06)' : 'rgba(57, 255, 20, 0.04)',
            }]} />
            
            <View style={styles.heroContent}>
              <View style={[styles.iconCircle, { 
                backgroundColor: isDark ? 'rgba(57, 255, 20, 0.15)' : 'rgba(57, 255, 20, 0.08)',
                borderWidth: 3,
                borderColor: isDark ? 'rgba(57, 255, 20, 0.25)' : 'rgba(57, 255, 20, 0.15)',
              }]}>
                <MaterialCommunityIcons name="human" size={46} color={currentColors.primary} />
              </View>
              <Text style={[styles.heroTitle, { color: currentColors.text }]}>
                Discover Your Body Type
              </Text>
              <Text style={[styles.heroSubtitle, { 
                color: isDark 
                  ? 'rgba(255, 255, 255, 0.65)' 
                  : 'rgba(0, 0, 0, 0.6)',
              }]}>
                Choose the right training plan for your genetics
              </Text>
              <View style={[styles.heroBadge, {
                backgroundColor: isDark ? 'rgba(57, 255, 20, 0.12)' : 'rgba(57, 255, 20, 0.08)',
              }]}>
                <Ionicons name="body" size={14} color={currentColors.primary} />
                <Text style={[styles.heroBadgeText, { color: currentColors.primary }]}>
                  {plans.length} Plans Available
                </Text>
              </View>
            </View>
          </View>

          {/* Section Title */}
          <View style={styles.sectionTitleContainer}>
            <View style={[styles.sectionTitleLine, { 
              backgroundColor: isDark 
                ? 'rgba(57, 255, 20, 0.3)' 
                : 'rgba(57, 255, 20, 0.25)',
            }]} />
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
              SELECT YOUR TYPE
            </Text>
            <View style={[styles.sectionTitleLine, { 
              backgroundColor: isDark 
                ? 'rgba(57, 255, 20, 0.3)' 
                : 'rgba(57, 255, 20, 0.25)',
            }]} />
          </View>
          
          {/* Body Types Cards */}
          <FlatList
            data={bodyTypes}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelect(item.name)}
                activeOpacity={0.85}
              >
                <View style={[styles.card, { 
                  backgroundColor: isDark ? currentColors.card : '#FFFFFF',
                  borderColor: isDark 
                    ? item.color + '40' 
                    : item.color + '30',
                  shadowColor: item.color,
                }]}>
                  {/* Glow Effect */}
                  <View style={[styles.cardGlow, { 
                    backgroundColor: item.color,
                    opacity: isDark ? 0.025 : 0.015,
                  }]} />
                  
                  <View style={styles.cardHeader}>
                    <View style={[styles.cardIconContainer, { 
                      backgroundColor: isDark ? item.color + '20' : item.color + '10',
                      borderWidth: 2,
                      borderColor: isDark ? item.color + '40' : item.color + '30',
                    }]}>
                      <Ionicons name={item.icon as any} size={26} color={item.color} />
                    </View>
                    <Text style={[styles.cardTitle, { color: item.color }]}>
                      {item.name}
                    </Text>
                    <TouchableOpacity
                      style={[styles.saveButton, {
                        backgroundColor: savedPlans.includes(item.name) 
                          ? item.color + '20' 
                          : 'transparent',
                        borderWidth: savedPlans.includes(item.name) ? 0 : 1.5,
                        borderColor: savedPlans.includes(item.name) 
                          ? 'transparent' 
                          : item.color + '30',
                      }]}
                      onPress={() => toggleSavePlan(item.name)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={savedPlans.includes(item.name) ? 'bookmark' : 'bookmark-outline'}
                        size={20}
                        color={item.color}
                      />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Characteristics */}
                  <View style={styles.characteristicsRow}>
                    {item.characteristics.map((char, index) => (
                      <View key={index} style={styles.characteristicItem}>
                        <View style={[styles.charIconContainer, { 
                          backgroundColor: isDark ? item.color + '18' : item.color + '0D',
                          borderWidth: 1.5,
                          borderColor: isDark ? item.color + '30' : item.color + '25',
                        }]}>
                          <MaterialCommunityIcons name={char.icon as any} size={20} color={item.color} />
                        </View>
                        <Text style={[styles.charText, { 
                          color: isDark 
                            ? 'rgba(255, 255, 255, 0.85)' 
                            : 'rgba(0, 0, 0, 0.75)',
                        }]}>
                          {char.label}
                        </Text>
                      </View>
                    ))}
                  </View>
                  
                  <View style={[styles.cardDivider, { 
                    backgroundColor: isDark ? item.color + '20' : item.color + '15',
                  }]} />
                  
                  <Text style={[styles.cardDesc, { 
                    color: isDark 
                      ? 'rgba(255, 255, 255, 0.8)' 
                      : 'rgba(0, 0, 0, 0.7)',
                  }]}>
                    {item.desc}
                  </Text>
                  
                  <View style={styles.cardFooter}>
                    <View style={[styles.planCountBadge, { 
                      backgroundColor: isDark ? item.color + '20' : item.color + '10',
                    }]}>
                      <Text style={[styles.planCountText, { color: item.color }]}>
                        {item.planCount || 0} Plans
                      </Text>
                    </View>
                    
                    <TouchableOpacity 
                      style={[styles.cardButton, { 
                        backgroundColor: item.color,
                      }]}
                      onPress={() => handleSelect(item.name)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.cardButtonText}>View Plans</Text>
                      <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />

          {/* Saved Plans Section */}
          {savedPlans.length > 0 && (
            <View style={[styles.savedSection, { 
              backgroundColor: isDark ? currentColors.card : '#FFFFFF',
              borderColor: isDark 
                ? 'rgba(57, 255, 20, 0.2)' 
                : 'rgba(57, 255, 20, 0.12)',
              shadowColor: currentColors.primary,
            }]}>
              <View style={styles.savedHeader}>
                <View style={[styles.savedIconWrapper, { 
                  backgroundColor: isDark ? 'rgba(57, 255, 20, 0.15)' : 'rgba(57, 255, 20, 0.08)',
                  borderWidth: 2,
                  borderColor: isDark ? 'rgba(57, 255, 20, 0.25)' : 'rgba(57, 255, 20, 0.15)',
                }]}>
                  <Ionicons name="bookmark" size={22} color={currentColors.primary} />
                </View>
                <View style={styles.savedHeaderText}>
                  <Text style={[styles.savedTitle, { color: currentColors.text }]}>
                    Saved Body Types
                  </Text>
                  <Text style={[styles.savedSubtitle, {
                    color: isDark 
                      ? 'rgba(255, 255, 255, 0.5)' 
                      : 'rgba(0, 0, 0, 0.45)',
                  }]}>
                    {savedPlans.length} type{savedPlans.length > 1 ? 's' : ''} saved
                  </Text>
                </View>
              </View>
              
              <View style={[styles.divider, { 
                backgroundColor: isDark 
                  ? 'rgba(57, 255, 20, 0.15)' 
                  : 'rgba(57, 255, 20, 0.08)',
              }]} />
              
              {savedPlans.map((plan, index) => {
                const planData = bodyTypes.find(bt => bt.name === plan);
                return (
                  <TouchableOpacity
                    key={plan}
                    style={[styles.savedItem, {
                      borderBottomWidth: index === savedPlans.length - 1 ? 0 : 1,
                      borderBottomColor: isDark 
                        ? 'rgba(255, 255, 255, 0.04)' 
                        : 'rgba(0, 0, 0, 0.04)',
                    }]}
                    onPress={() => handleSelect(plan)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.savedItemLeft}>
                      <View style={[styles.savedItemIcon, {
                        backgroundColor: planData?.color + '20',
                        borderWidth: 1.5,
                        borderColor: planData?.color + '30',
                      }]}>
                        <Ionicons name={planData?.icon as any} size={20} color={planData?.color} />
                      </View>
                      <Text style={[styles.savedText, { color: currentColors.text }]}>
                        {plan}
                      </Text>
                    </View>
                    <View style={[styles.savedChevron, {
                      backgroundColor: isDark 
                        ? 'rgba(57, 255, 20, 0.1)' 
                        : 'rgba(57, 255, 20, 0.06)',
                    }]}>
                      <Ionicons name="chevron-forward" size={18} color={currentColors.primary} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Info Card */}
          <View style={[styles.infoCard, { 
            backgroundColor: isDark ? currentColors.card : '#FFFFFF',
            borderColor: isDark 
              ? 'rgba(57, 255, 20, 0.2)' 
              : 'rgba(57, 255, 20, 0.12)',
            shadowColor: currentColors.primary,
          }]}>
            <View style={styles.infoHeader}>
              <View style={[styles.infoIconWrapper, { 
                backgroundColor: isDark ? 'rgba(57, 255, 20, 0.15)' : 'rgba(57, 255, 20, 0.08)',
                borderWidth: 2,
                borderColor: isDark ? 'rgba(57, 255, 20, 0.25)' : 'rgba(57, 255, 20, 0.15)',
              }]}>
                <Ionicons name="information-circle" size={22} color={currentColors.primary} />
              </View>
              <View style={styles.infoHeaderText}>
                <Text style={[styles.infoTitle, { color: currentColors.text }]}>
                  Body Type Guide
                </Text>
                <Text style={[styles.infoSubtitle, {
                  color: isDark 
                    ? 'rgba(255, 255, 255, 0.5)' 
                    : 'rgba(0, 0, 0, 0.45)',
                }]}>
                  Understanding genetics
                </Text>
              </View>
            </View>
            
            <View style={[styles.divider, { 
              backgroundColor: isDark 
                ? 'rgba(57, 255, 20, 0.15)' 
                : 'rgba(57, 255, 20, 0.08)',
            }]} />
            
            <Text style={[styles.infoText, { 
              color: isDark 
                ? 'rgba(255, 255, 255, 0.8)' 
                : 'rgba(0, 0, 0, 0.65)',
            }]}>
              Each body type responds differently to training and nutrition. Select your type to get a personalized workout plan designed for optimal results.
            </Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity 
            style={[styles.primaryButton, { 
              backgroundColor: currentColors.primary,
              shadowColor: currentColors.primary,
            }]}
            activeOpacity={0.85}
            onPress={() => router.push('/')}
          >
            <MaterialCommunityIcons 
              name="home" 
              size={24} 
              color={isDark ? currentColors.background : '#FFFFFF'} 
            />
            <Text style={[styles.primaryButtonText, { 
              color: isDark ? currentColors.background : '#FFFFFF' 
            }]}>
              Back to Home
            </Text>
            <Ionicons 
              name="arrow-forward" 
              size={20} 
              color={isDark ? currentColors.background : '#FFFFFF'} 
            />
          </TouchableOpacity>
        </Animated.View>
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
    paddingBottom: 18,
    borderBottomWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  themeToggle: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  topRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 52,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backText: {
    fontWeight: '700',
    fontSize: 14,
  },
  scrollContainer: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 28,
    padding: 36,
    marginBottom: 24,
    borderWidth: 1.5,
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 1000,
  },
  decorCircle1: {
    width: 220,
    height: 220,
    top: -60,
    right: -60,
  },
  decorCircle2: {
    width: 160,
    height: 160,
    bottom: -50,
    left: -50,
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  iconCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 22,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
  },
  heroBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  sectionTitleLine: {
    flex: 1,
    height: 2,
    borderRadius: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  grid: {
    gap: 18,
    marginBottom: 20,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    zIndex: 1,
  },
  cardIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    flex: 1,
    letterSpacing: 0.5,
  },
  saveButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  characteristicsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  characteristicItem: {
    alignItems: 'center',
    flex: 1,
  },
  charIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  charText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: 16,
  },
  cardDivider: {
    height: 1.5,
    borderRadius: 1,
    marginBottom: 16,
  },
  cardDesc: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 18,
  },
  cardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 18,
    gap: 8,
  },
  cardButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  savedSection: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 18,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  savedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  savedIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savedHeaderText: {
    flex: 1,
  },
  savedTitle: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  savedSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 3,
  },
  divider: {
    height: 1.5,
    borderRadius: 1,
    marginBottom: 20,
  },
  savedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  savedItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  savedItemIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savedText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  savedChevron: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 20,
    marginTop: 6,
    marginBottom: 20,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 14,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  infoCard: {
    borderRadius: 24,
    padding: 24,
    marginTop: 2,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  infoIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoHeaderText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  infoSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 3,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 23,
    fontWeight: '500',
    marginBottom: 18,
  },
  infoBenefits: {
    gap: 14,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  benefitText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
    loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  planCountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  planCountText: {
    fontSize: 12,
    fontWeight: '700',
  },
});



