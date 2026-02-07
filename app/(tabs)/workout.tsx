import { Colors } from '@/constants/Colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSimpleTheme } from '../../context/SimpleThemeContext';

const { width } = Dimensions.get('window');

const bodyTypes = [
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
  },
];

export default function WorkoutScreen() {
  const router = useRouter();
  const { theme, toggleTheme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === 'dark';
  
  const [savedPlans, setSavedPlans] = useState<string[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

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
        backgroundColor: isDark ? 'rgba(18, 18, 18, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        borderBottomColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.15)',
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
              backgroundColor: isDark ? 'rgba(57, 255, 20, 0.15)' : '#F5F5F5',
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
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Hero Section */}
          <View style={[styles.heroCard, { 
            backgroundColor: isDark ? currentColors.card : '#FFFFFF',
            borderColor: currentColors.primary,
            shadowColor: currentColors.primary,
          }]}>
            <View style={[styles.decorCircle, styles.decorCircle1, {
              backgroundColor: isDark ? 'rgba(57, 255, 20, 0.05)' : 'rgba(57, 255, 20, 0.03)',
            }]} />
            <View style={[styles.decorCircle, styles.decorCircle2, {
              backgroundColor: isDark ? 'rgba(57, 255, 20, 0.08)' : 'rgba(57, 255, 20, 0.05)',
            }]} />
            
            <View style={styles.heroContent}>
              <View style={[styles.iconCircle, { 
                backgroundColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.1)',
                borderWidth: 3,
                borderColor: isDark ? 'rgba(57, 255, 20, 0.3)' : 'rgba(57, 255, 20, 0.2)',
              }]}>
                <MaterialCommunityIcons name="human" size={44} color={currentColors.primary} />
              </View>
              <Text style={[styles.heroTitle, { color: currentColors.text }]}>
                Discover Your Body Type
              </Text>
              <Text style={[styles.heroSubtitle, { 
                color: isDark ? currentColors.text : '#666' 
              }]}>
                Choose the right training plan for your genetics
              </Text>
              <View style={[styles.heroBadge, {
                backgroundColor: isDark ? 'rgba(57, 255, 20, 0.15)' : 'rgba(57, 255, 20, 0.1)',
              }]}>
                <Ionicons name="body" size={14} color={currentColors.primary} />
                <Text style={[styles.heroBadgeText, { color: currentColors.primary }]}>
                  3 Body Types Available
                </Text>
              </View>
            </View>
          </View>

          {/* Section Title */}
          <View style={styles.sectionTitleContainer}>
            <View style={[styles.sectionTitleLine, { backgroundColor: currentColors.primary }]} />
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
              SELECT YOUR TYPE
            </Text>
            <View style={[styles.sectionTitleLine, { backgroundColor: currentColors.primary }]} />
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
                  borderColor: item.color,
                  shadowColor: item.color,
                }]}>
                  {/* Glow Effect */}
                  <View style={[styles.cardGlow, { backgroundColor: item.color }]} />
                  
                  <View style={styles.cardHeader}>
                    <View style={[styles.cardIconContainer, { 
                      backgroundColor: isDark ? item.color + '20' : item.color + '10',
                      borderWidth: 2,
                      borderColor: item.color + '40',
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
                      }]}
                      onPress={() => toggleSavePlan(item.name)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={savedPlans.includes(item.name) ? 'bookmark' : 'bookmark-outline'}
                        size={22}
                        color={item.color}
                      />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Characteristics Grid */}
                  <View style={styles.characteristicsRow}>
                    {item.characteristics.map((char, index) => (
                      <View key={index} style={styles.characteristicItem}>
                        <View style={[styles.charIconContainer, { 
                          backgroundColor: isDark ? item.color + '20' : item.color + '10',
                          borderWidth: 1,
                          borderColor: item.color + '30',
                        }]}>
                          <MaterialCommunityIcons name={char.icon as any} size={20} color={item.color} />
                        </View>
                        <Text style={[styles.charText, { 
                          color: isDark ? currentColors.text : '#333' 
                        }]}>
                          {char.label}
                        </Text>
                      </View>
                    ))}
                  </View>
                  
                  <View style={[styles.cardDivider, { backgroundColor: item.color + '20' }]} />
                  
                  <Text style={[styles.cardDesc, { 
                    color: isDark ? currentColors.text : '#333' 
                  }]}>
                    {item.desc}
                  </Text>
                  
                  <TouchableOpacity 
                    style={[styles.cardButton, { 
                      backgroundColor: item.color,
                    }]}
                    onPress={() => handleSelect(item.name)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.cardButtonText}>View Plan</Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
          />

          {/* Saved Plans Section */}
          {savedPlans.length > 0 && (
            <View style={[styles.savedSection, { 
              backgroundColor: isDark ? currentColors.card : '#FFFFFF',
              borderColor: currentColors.primary,
              shadowColor: currentColors.primary,
            }]}>
              <View style={styles.savedHeader}>
                <View style={[styles.savedIconWrapper, { 
                  backgroundColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.1)',
                  borderWidth: 2,
                  borderColor: isDark ? 'rgba(57, 255, 20, 0.3)' : 'rgba(57, 255, 20, 0.2)',
                }]}>
                  <Ionicons name="bookmark" size={22} color={currentColors.primary} />
                </View>
                <View style={styles.savedHeaderText}>
                  <Text style={[styles.savedTitle, { color: currentColors.text }]}>
                    Saved Plans
                  </Text>
                  <Text style={[styles.savedSubtitle, {
                    color: isDark ? 'rgba(255, 255, 255, 0.5)' : '#999',
                  }]}>
                    {savedPlans.length} plan{savedPlans.length > 1 ? 's' : ''} saved
                  </Text>
                </View>
              </View>
              
              <View style={[styles.divider, { 
                backgroundColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.15)' 
              }]} />
              
              {savedPlans.map((plan, index) => {
                const planData = bodyTypes.find(bt => bt.name === plan);
                return (
                  <TouchableOpacity
                    key={plan}
                    style={[styles.savedItem, {
                      borderBottomWidth: index === savedPlans.length - 1 ? 0 : 1,
                      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                    }]}
                    onPress={() => handleSelect(plan)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.savedItemLeft}>
                      <View style={[styles.savedItemIcon, {
                        backgroundColor: planData?.color + '20',
                      }]}>
                        <Ionicons name={planData?.icon as any} size={20} color={planData?.color} />
                      </View>
                      <Text style={[styles.savedText, { color: currentColors.text }]}>
                        {plan}
                      </Text>
                    </View>
                    <View style={[styles.savedChevron, {
                      backgroundColor: isDark ? 'rgba(57, 255, 20, 0.1)' : 'rgba(57, 255, 20, 0.08)',
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
            borderColor: currentColors.primary,
            shadowColor: currentColors.primary,
          }]}>
            <View style={styles.infoHeader}>
              <View style={[styles.infoIconWrapper, { 
                backgroundColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.1)',
                borderWidth: 2,
                borderColor: isDark ? 'rgba(57, 255, 20, 0.3)' : 'rgba(57, 255, 20, 0.2)',
              }]}>
                <Ionicons name="information-circle" size={22} color={currentColors.primary} />
              </View>
              <View style={styles.infoHeaderText}>
                <Text style={[styles.infoTitle, { color: currentColors.text }]}>
                  Body Type Guide
                </Text>
                <Text style={[styles.infoSubtitle, {
                  color: isDark ? 'rgba(255, 255, 255, 0.5)' : '#999',
                }]}>
                  Understanding genetics
                </Text>
              </View>
            </View>
            
            <View style={[styles.divider, { 
              backgroundColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.15)' 
            }]} />
            
            <Text style={[styles.infoText, { 
              color: isDark ? currentColors.text : '#666' 
            }]}>
              Each body type responds differently to training and nutrition. Select your type to get a personalized workout plan designed for optimal results.
            </Text>
            
            <View style={styles.infoBenefits}>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={18} color={currentColors.primary} />
                <Text style={[styles.benefitText, { 
                  color: isDark ? currentColors.text : '#666' 
                }]}>
                  Customized workout plans
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={18} color={currentColors.primary} />
                <Text style={[styles.benefitText, { 
                  color: isDark ? currentColors.text : '#666' 
                }]}>
                  Nutrition guidance
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={18} color={currentColors.primary} />
                <Text style={[styles.benefitText, { 
                  color: isDark ? currentColors.text : '#666' 
                }]}>
                  Optimized for your genetics
                </Text>
              </View>
            </View>
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
            <MaterialCommunityIcons name="home" size={24} color={isDark ? currentColors.background : '#FFFFFF'} />
            <Text style={[styles.primaryButtonText, { 
              color: isDark ? currentColors.background : '#FFFFFF' 
            }]}>
              Back to Home
            </Text>
            <Ionicons name="arrow-forward" size={20} color={isDark ? currentColors.background : '#FFFFFF'} />
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
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
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
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
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  backText: {
    fontWeight: '700',
    fontSize: 14,
  },
  scrollContainer: {
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 28,
    padding: 32,
    marginBottom: 28,
    borderWidth: 2,
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 1000,
  },
  decorCircle1: {
    width: 200,
    height: 200,
    top: -50,
    right: -50,
  },
  decorCircle2: {
    width: 150,
    height: 150,
    bottom: -40,
    left: -40,
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 16,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
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
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  grid: {
    gap: 20,
    marginBottom: 24,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  cardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.03,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
    zIndex: 1,
  },
  cardIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  characteristicsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    gap: 8,
  },
  characteristicItem: {
    alignItems: 'center',
    flex: 1,
  },
  charIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  charText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  cardDivider: {
    height: 2,
    borderRadius: 1,
    marginBottom: 14,
  },
  cardDesc: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 16,
  },
  cardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
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
    marginBottom: 20,
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
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
    marginTop: 2,
  },
  divider: {
    height: 2,
    borderRadius: 1,
    marginBottom: 18,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savedText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  savedChevron: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 20,
    marginTop: 8,
    marginBottom: 20,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
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
    marginTop: 4,
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
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
    marginTop: 2,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 16,
  },
  infoBenefits: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});