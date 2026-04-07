import { Colors } from '@/constants/Colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState, useRef } from 'react';
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

// ── Types (unchanged) ─────────────────────────────────────────────────────────
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

type PlansResponse = { success: boolean; data: Plan[] };
type SetBodyTypeResponse = { success: boolean; message: string; missions?: any[]; error?: string };
type LogWorkoutResponse = {
  success: boolean;
  message: string;
  weeklyProgress?: { weekStart: Date; completedWorkouts: number; weeklyGoal: number; rewardClaimed: boolean };
  completedMissions?: Array<{ id: string; title: string; reward: number }>;
  aiMessagesRemaining?: number;
  error?: string;
};

// ── Body type metadata ────────────────────────────────────────────────────────
const BODY_TYPE_META: Record<string, { emoji: string; tagline: string }> = {
  Ectomorph: { emoji: '⚡', tagline: 'Fast metabolism · Built to endure' },
  Mesomorph: { emoji: '🏆', tagline: 'Naturally athletic · Built to perform' },
  Endomorph: { emoji: '🔥', tagline: 'High power output · Built to grind' },
};

export default function WorkoutScreen() {
  const router = useRouter();
  const { theme, toggleTheme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === 'dark';

  const [savedPlans, setSavedPlans] = useState<string[]>([]);
  const [bodyTypes, setBodyTypes] = useState<BodyType[]>([
    {
      id: '1', name: 'Ectomorph',
      desc: 'Lean, fast metabolism. Focus on heavy weights + carbs.',
      icon: 'leaf-outline', color: '#39FF14',
      characteristics: [
        { icon: 'weight', label: 'Heavy Weights' },
        { icon: 'food-apple', label: 'High Carbs' },
        { icon: 'dumbbell', label: 'Strength' },
      ],
      planCount: 0,
    },
    {
      id: '2', name: 'Mesomorph',
      desc: 'Naturally muscular. Balanced strength/cardio works best.',
      icon: 'fitness-outline', color: '#00F0FF',
      characteristics: [
        { icon: 'weight', label: 'Balanced' },
        { icon: 'food-apple', label: 'Balanced' },
        { icon: 'dumbbell', label: 'Hybrid' },
      ],
      planCount: 0,
    },
    {
      id: '3', name: 'Endomorph',
      desc: 'Gains fat easily. Prioritize cardio + circuit training.',
      icon: 'flash-outline', color: '#6c7deb',
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

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(32)).current;
  const stagger1 = useRef(new Animated.Value(0)).current;
  const stagger2 = useRef(new Animated.Value(0)).current;
  const stagger3 = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 48, friction: 9, useNativeDriver: true }),
    ]).start();

    setTimeout(() => Animated.spring(stagger1, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }).start(), 150);
    setTimeout(() => Animated.spring(stagger2, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }).start(), 300);
    setTimeout(() => Animated.spring(stagger3, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }).start(), 440);

    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.04, duration: 1600, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 1600, useNativeDriver: true }),
    ])).start();

    Animated.loop(Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1, duration: 2200, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0, duration: 2200, useNativeDriver: true }),
    ])).start();

    fetchPlans();
    loadSavedPlans();
  }, []);

  // ── All original functions intact ─────────────────────────────────────────
  const fetchPlans = async () => {
    try {
      const response = await fetch('http://192.168.100.143:3000/api/plans');
      const data = (await response.json()) as PlansResponse;
      if (response.ok && data.success) {
        setPlans(data.data);
        const updatedBodyTypes = bodyTypes.map(bodyType => ({
          ...bodyType,
          planCount: data.data.filter(plan => plan.bodyType === bodyType.name).length,
        }));
        setBodyTypes(updatedBodyTypes);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedPlans = async () => {
    try {
      const saved = await AsyncStorage.getItem('savedPlans');
      if (saved) setSavedPlans(JSON.parse(saved));
    } catch (error) {
      console.error('Error loading saved plans:', error);
    }
  };

  const saveSavedPlans = async (plans: string[]) => {
    try {
      await AsyncStorage.setItem('savedPlans', JSON.stringify(plans));
    } catch (error) {
      console.error('Error saving plans:', error);
    }
  };

  const handleSelect = (type: string) => {
    const plansForType = plans.filter(plan => plan.bodyType === type);
    router.push({ pathname: '/config/plan', params: { type, plans: JSON.stringify(plansForType) } });
  };

  const setUserBodyType = async (bodyType: string) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) { Alert.alert('Not Logged In', 'Please log in to set your body type'); router.push('/login'); return; }
      const response = await fetch('http://192.168.100.143:3000/api/users/set-body-type', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bodyType }),
      });
      const data = (await response.json()) as SetBodyTypeResponse;
      if (response.ok && data.success) {
        Alert.alert('✅ Body Type Set!', `Your body type is now ${bodyType}. Missions have been generated! Check your profile.`);
      } else {
        Alert.alert('Error', data.error || 'Failed to set body type');
      }
    } catch (error) {
      console.error('Set body type error:', error);
      Alert.alert('Error', 'Could not set body type');
    }
  };

  const logWorkout = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) { Alert.alert('Not Logged In', 'Please log in to log workouts'); router.push('/login'); return; }
      const response = await fetch('http://192.168.100.143:3000/api/users/log-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ workoutId: 'manual', duration: 30 }),
      });
      const data = (await response.json()) as LogWorkoutResponse;
      if (response.ok && data.success) {
        let message = '✅ Workout logged!';
        if (data.completedMissions && data.completedMissions.length > 0) {
          message += `\n\n🎉 Mission Complete: ${data.completedMissions[0].title}\n+${data.completedMissions[0].reward} AI Messages!`;
        }
        Alert.alert('Success', message);
      } else {
        Alert.alert('Error', data.error || 'Failed to log workout');
      }
    } catch (error) {
      console.error('Log workout error:', error);
      Alert.alert('Error', 'Could not log workout');
    }
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
  // ─────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: currentColors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentColors.primary} />
          <Text style={[styles.loadingText, { color: currentColors.text }]}>Loading workout plans...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>

      {/* ── TOP BAR ──────────────────────────────────────────────────────── */}
      <View style={[styles.topBar, {
        backgroundColor: isDark ? 'rgba(8,8,8,0.98)' : 'rgba(255,255,255,0.98)',
        borderBottomColor: isDark ? currentColors.primary + '18' : currentColors.primary + '10',
      }]}>
        {/* Accent line */}
        <LinearGradient
          colors={[currentColors.primary + '00', currentColors.primary, currentColors.primary + '00']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.topBarLine}
        />
        <TouchableOpacity onPress={() => router.replace('/')} activeOpacity={0.7}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={[currentColors.primary + '30', currentColors.primary + '10']}
              style={styles.logoIconWrapper}
            >
              <MaterialCommunityIcons name="dumbbell" size={18} color={currentColors.primary} />
            </LinearGradient>
            <View>
              <Text style={[styles.logo, { color: currentColors.primary }]}>GymBro</Text>
              <View style={[styles.logoUnderline, { backgroundColor: currentColors.primary }]} />
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.topRightSection}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, {
              backgroundColor: isDark ? currentColors.primary + '12' : currentColors.primary + '08',
              borderColor: isDark ? currentColors.primary + '35' : currentColors.primary + '25',
            }]}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={16} color={currentColors.primary} />
            <Text style={[styles.backText, { color: currentColors.primary }]}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleTheme}
            style={[styles.themeToggle, { backgroundColor: currentColors.primary, shadowColor: currentColors.primary }]}
            activeOpacity={0.8}
          >
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={16} color={isDark ? currentColors.background : '#FFF'} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ backgroundColor: currentColors.background }}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* ── HERO ───────────────────────────────────────────────────────── */}
          <View style={[styles.heroCard, {
            backgroundColor: isDark ? '#0c0c0c' : '#fff',
            borderColor: isDark ? currentColors.primary + '35' : currentColors.primary + '18',
          }]}>
            {/* Corner bracket */}
            <View style={[styles.heroCorner, { borderColor: currentColors.primary + '50' }]} />
            {/* Ambient glows */}
            <Animated.View style={[styles.heroGlow1, {
              backgroundColor: currentColors.primary,
              opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.05, 0.12] }),
            }]} />
            <Animated.View style={[styles.heroGlow2, {
              backgroundColor: '#FF10F0',
              opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.03, 0.08] }),
            }]} />

            <View style={styles.heroContent}>
              {/* Icon */}
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <View style={[styles.heroRingOuter, { borderColor: currentColors.primary + '30' }]}>
                  <View style={[styles.heroRingInner, { borderColor: currentColors.primary + '60' }]}>
                    <LinearGradient
                      colors={[currentColors.primary + '28', currentColors.primary + '08']}
                      style={styles.heroIconCore}
                    >
                      <MaterialCommunityIcons name="human" size={44} color={currentColors.primary} />
                    </LinearGradient>
                  </View>
                </View>
              </Animated.View>

              {/* Tag */}
              <View style={[styles.heroTag, {
                backgroundColor: currentColors.primary + '12',
                borderColor: currentColors.primary + '30',
              }]}>
                <View style={[styles.heroPulse, { backgroundColor: currentColors.primary }]} />
                <Text style={[styles.heroTagText, { color: currentColors.primary }]}>
                  FIND YOUR GENETIC BLUEPRINT
                </Text>
              </View>

              <Text style={[styles.heroTitle, { color: currentColors.text }]}>
                Discover Your{'\n'}
                <Text style={{ color: currentColors.primary }}>Body Type</Text>
              </Text>
              <Text style={[styles.heroSubtitle, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }]}>
                Train smarter with a plan built for your genetics
              </Text>

              {/* Stats row */}
              <View style={styles.heroStats}>
                <View style={styles.heroStatItem}>
                  <Text style={[styles.heroStatNum, { color: currentColors.text }]}>{plans.length}</Text>
                  <Text style={[styles.heroStatLabel, { color: isDark ? '#555' : '#bbb' }]}>Plans</Text>
                </View>
                <View style={[styles.heroStatDivider, { backgroundColor: isDark ? '#222' : '#eee' }]} />
                <View style={styles.heroStatItem}>
                  <Text style={[styles.heroStatNum, { color: currentColors.text }]}>3</Text>
                  <Text style={[styles.heroStatLabel, { color: isDark ? '#555' : '#bbb' }]}>Types</Text>
                </View>
                <View style={[styles.heroStatDivider, { backgroundColor: isDark ? '#222' : '#eee' }]} />
                <View style={styles.heroStatItem}>
                  <Text style={[styles.heroStatNum, { color: currentColors.text }]}>{savedPlans.length}</Text>
                  <Text style={[styles.heroStatLabel, { color: isDark ? '#555' : '#bbb' }]}>Saved</Text>
                </View>
              </View>
            </View>
          </View>

          {/* ── SECTION LABEL ──────────────────────────────────────────────── */}
          <View style={styles.sectionLabelRow}>
            <View style={[styles.sectionLine, { backgroundColor: isDark ? '#222' : '#eee' }]} />
            <Text style={[styles.sectionLabel, { color: isDark ? '#444' : '#ccc' }]}>SELECT YOUR TYPE</Text>
            <View style={[styles.sectionLine, { backgroundColor: isDark ? '#222' : '#eee' }]} />
          </View>

          {/* ── BODY TYPE CARDS ─────────────────────────────────────────────── */}
          <FlatList
            data={bodyTypes}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.grid}
            renderItem={({ item, index }) => {
              const meta = BODY_TYPE_META[item.name];
              const staggerAnims = [stagger1, stagger2, stagger3];
              const anim = staggerAnims[index] ?? stagger1;
              return (
                <Animated.View style={{
                  opacity: anim,
                  transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [28, 0] }) }],
                }}>
                  <TouchableOpacity onPress={() => handleSelect(item.name)} activeOpacity={0.88}>
                    <View style={[styles.card, {
                      backgroundColor: isDark ? '#0e0e0e' : '#fff',
                      borderColor: isDark ? item.color + '35' : item.color + '20',
                    }]}>
                      {/* Color top strip */}
                      <View style={[styles.cardStrip, { backgroundColor: item.color }]} />

                      {/* Ambient glow */}
                      <Animated.View style={[styles.cardGlow, {
                        backgroundColor: item.color,
                        opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.02, 0.06] }),
                      }]} />

                      {/* Header row */}
                      <View style={styles.cardHeader}>
                        <View style={[styles.cardIconBox, { backgroundColor: item.color + '15' }]}>
                          <Ionicons name={item.icon as any} size={24} color={item.color} />
                        </View>
                        <View style={styles.cardTitleBlock}>
                          <Text style={[styles.cardTitle, { color: item.color }]}>{item.name}</Text>
                          <Text style={[styles.cardTagline, { color: isDark ? '#555' : '#bbb' }]}>{meta.emoji} {meta.tagline}</Text>
                        </View>
                        <TouchableOpacity
                          style={[styles.bookmarkBtn, {
                            backgroundColor: savedPlans.includes(item.name) ? item.color + '18' : 'transparent',
                            borderColor: savedPlans.includes(item.name) ? item.color + '50' : (isDark ? '#2a2a2a' : '#e8e8e8'),
                          }]}
                          onPress={() => toggleSavePlan(item.name)}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={savedPlans.includes(item.name) ? 'bookmark' : 'bookmark-outline'}
                            size={18}
                            color={savedPlans.includes(item.name) ? item.color : (isDark ? '#444' : '#ccc')}
                          />
                        </TouchableOpacity>
                      </View>

                      {/* Characteristics */}
                      <View style={styles.charsRow}>
                        {item.characteristics.map((char, i) => (
                          <View key={i} style={[styles.charPill, {
                            backgroundColor: isDark ? item.color + '10' : item.color + '08',
                            borderColor: isDark ? item.color + '28' : item.color + '18',
                          }]}>
                            <MaterialCommunityIcons name={char.icon as any} size={14} color={item.color} />
                            <Text style={[styles.charText, { color: item.color }]}>{char.label}</Text>
                          </View>
                        ))}
                      </View>

                      {/* Divider */}
                      <View style={[styles.cardDivider, { backgroundColor: isDark ? item.color + '15' : item.color + '10' }]} />

                      {/* Description */}
                      <Text style={[styles.cardDesc, { color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.65)' }]}>
                        {item.desc}
                      </Text>

                      {/* Footer actions */}
                      <View style={styles.cardFooter}>
                        {/* Plan count */}
                        <View style={[styles.planCountPill, { backgroundColor: item.color + '12', borderColor: item.color + '28' }]}>
                          <View style={[styles.planDot, { backgroundColor: item.color }]} />
                          <Text style={[styles.planCountText, { color: item.color }]}>{item.planCount ?? 0} Plans</Text>
                        </View>

                        {/* Set as my type */}
                        <TouchableOpacity
                          style={[styles.setTypeBtn, { borderColor: item.color + '50', backgroundColor: item.color + '10' }]}
                          onPress={() => {
                            Alert.alert(
                              'Set Body Type',
                              `Set your body type to ${item.name}? This will generate personalized missions for you.`,
                              [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Confirm', onPress: () => setUserBodyType(item.name) },
                              ]
                            );
                          }}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="person-outline" size={14} color={item.color} />
                          <Text style={[styles.setTypeText, { color: item.color }]}>Set Mine</Text>
                        </TouchableOpacity>

                        {/* View plans CTA */}
                        <TouchableOpacity
                          style={[styles.viewPlansBtn, { backgroundColor: item.color }]}
                          onPress={() => handleSelect(item.name)}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.viewPlansBtnText}>View Plans</Text>
                          <Ionicons name="arrow-forward" size={14} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            }}
          />

          {/* ── LOG WORKOUT CTA ─────────────────────────────────────────────── */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[styles.logWorkoutButton, { shadowColor: currentColors.primary }]}
              onPress={logWorkout}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[currentColors.primary, currentColors.primary + 'cc']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Animated.View style={[styles.btnShimmer, {
                opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.14] }),
              }]} />
              <View style={[styles.logBtnIcon, { backgroundColor: 'rgba(0,0,0,0.15)' }]}>
                <Ionicons name="barbell-outline" size={20} color={isDark ? '#000' : '#fff'} />
              </View>
              <Text style={[styles.logWorkoutButtonText, { color: isDark ? '#000' : '#fff' }]}>
                Log Today's Workout
              </Text>
              <View style={[styles.logBtnCheck, { backgroundColor: 'rgba(0,0,0,0.12)' }]}>
                <Ionicons name="checkmark-circle" size={16} color={isDark ? '#000' : '#fff'} />
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* ── SAVED PLANS ─────────────────────────────────────────────────── */}
          {savedPlans.length > 0 && (
            <View style={[styles.savedSection, {
              backgroundColor: isDark ? '#0e0e0e' : '#fff',
              borderColor: isDark ? currentColors.primary + '20' : currentColors.primary + '10',
            }]}>
              <View style={styles.savedHeader}>
                <View style={[styles.savedIconBox, { backgroundColor: currentColors.primary + '12' }]}>
                  <Ionicons name="bookmark" size={18} color={currentColors.primary} />
                </View>
                <View>
                  <Text style={[styles.savedTitle, { color: currentColors.text }]}>Saved Types</Text>
                  <Text style={[styles.savedSubtitle, { color: isDark ? '#555' : '#bbb' }]}>
                    {savedPlans.length} saved
                  </Text>
                </View>
              </View>

              <View style={[styles.savedDivider, { backgroundColor: isDark ? '#1a1a1a' : '#f0f0f0' }]} />

              {savedPlans.map((plan, index) => {
                const planData = bodyTypes.find(bt => bt.name === plan);
                return (
                  <TouchableOpacity
                    key={plan}
                    style={[styles.savedItem, {
                      borderBottomWidth: index === savedPlans.length - 1 ? 0 : 1,
                      borderBottomColor: isDark ? '#141414' : '#f5f5f5',
                    }]}
                    onPress={() => handleSelect(plan)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.savedItemLeft}>
                      <View style={[styles.savedItemIcon, {
                        backgroundColor: (planData?.color ?? '#fff') + '15',
                        borderColor: (planData?.color ?? '#fff') + '30',
                      }]}>
                        <Ionicons name={planData?.icon as any} size={18} color={planData?.color} />
                      </View>
                      <View>
                        <Text style={[styles.savedItemName, { color: currentColors.text }]}>{plan}</Text>
                        <Text style={[styles.savedItemSub, { color: isDark ? '#444' : '#ccc' }]}>
                          {planData?.planCount ?? 0} plans available
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.savedChevron, { backgroundColor: currentColors.primary + '12' }]}>
                      <Ionicons name="chevron-forward" size={16} color={currentColors.primary} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* ── INFO CARD ───────────────────────────────────────────────────── */}
          <View style={[styles.infoCard, {
            backgroundColor: isDark ? '#0e0e0e' : '#fff',
            borderColor: isDark ? currentColors.primary + '18' : currentColors.primary + '10',
          }]}>
            <LinearGradient
              colors={isDark ? [currentColors.primary + '08', 'transparent'] : [currentColors.primary + '05', 'transparent']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.infoHeader}>
              <View style={[styles.infoIconBox, { backgroundColor: currentColors.primary + '12' }]}>
                <Ionicons name="information-circle" size={18} color={currentColors.primary} />
              </View>
              <View>
                <Text style={[styles.infoTitle, { color: currentColors.text }]}>Body Type Guide</Text>
                <Text style={[styles.infoSub, { color: isDark ? '#555' : '#bbb' }]}>Understanding genetics</Text>
              </View>
            </View>
            <Text style={[styles.infoText, { color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.6)' }]}>
              Each body type responds differently to training and nutrition. Select your type to get a personalized workout plan designed for optimal results.
            </Text>
          </View>

          {/* ── BACK HOME ───────────────────────────────────────────────────── */}
          <TouchableOpacity
            style={[styles.primaryButton, {
              backgroundColor: isDark ? '#141414' : '#f5f5f5',
              borderColor: isDark ? '#222' : '#e8e8e8',
            }]}
            activeOpacity={0.8}
            onPress={() => router.push('/')}
          >
            <MaterialCommunityIcons name="home" size={20} color={isDark ? '#555' : '#aaa'} />
            <Text style={[styles.primaryButtonText, { color: isDark ? '#555' : '#aaa' }]}>Back to Home</Text>
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 15, fontWeight: '600' },

  // ── Top bar ────────────────────────────────────────────────────────────────
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'ios' ? 52 : 42,
    paddingBottom: 14,
    borderBottomWidth: 1,
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  topBarLine: { position: 'absolute', top: 0, left: 0, right: 0, height: 2 },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  logoIconWrapper: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  logo: { fontSize: 20, fontWeight: '900', letterSpacing: 0.4 },
  logoUnderline: { height: 2, width: 22, borderRadius: 1, marginTop: 1 },
  topRightSection: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backButton: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 18, borderWidth: 1.5,
  },
  backText: { fontSize: 13, fontWeight: '700' },
  themeToggle: {
    width: 34, height: 34, borderRadius: 17,
    justifyContent: 'center', alignItems: 'center',
    ...Platform.select({
      ios: { shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.28, shadowRadius: 7 },
      android: { elevation: 5 },
    }),
  },

  // ── Scroll ─────────────────────────────────────────────────────────────────
  scrollContainer: { paddingTop: 20, paddingHorizontal: 18, paddingBottom: 44 },

  // ── Hero ───────────────────────────────────────────────────────────────────
  heroCard: {
    borderRadius: 28, minHeight: 300, padding: 22,
    marginBottom: 20, borderWidth: 1.5,
    position: 'relative', overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 22 },
      android: { elevation: 8 },
    }),
  },
  heroCorner: {
    position: 'absolute', top: 0, right: 0,
    width: 72, height: 72,
    borderRightWidth: 2, borderTopWidth: 2,
    borderTopRightRadius: 28,
  },
  heroGlow1: {
    position: 'absolute', width: 240, height: 240,
    borderRadius: 120, top: -80, right: -80,
  },
  heroGlow2: {
    position: 'absolute', width: 180, height: 180,
    borderRadius: 90, bottom: -60, left: -60,
  },
  heroContent: { alignItems: 'center', zIndex: 1, paddingTop: 8 },
  heroRingOuter: {
    width: 108, height: 108, borderRadius: 54,
    borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  heroRingInner: {
    width: 92, height: 92, borderRadius: 46,
    borderWidth: 1.5, justifyContent: 'center', alignItems: 'center',
  },
  heroIconCore: {
    width: 78, height: 78, borderRadius: 39,
    justifyContent: 'center', alignItems: 'center',
  },
  heroTag: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    paddingHorizontal: 13, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, marginBottom: 14,
  },
  heroPulse: { width: 6, height: 6, borderRadius: 3 },
  heroTagText: { fontSize: 9, fontWeight: '800', letterSpacing: 1.3 },
  heroTitle: {
    fontSize: 30, fontWeight: '900', textAlign: 'center',
    letterSpacing: 0.2, lineHeight: 38, marginBottom: 10,
  },
  heroSubtitle: { fontSize: 13, fontWeight: '500', textAlign: 'center', marginBottom: 22 },
  heroStats: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 28,
    borderRadius: 18, backgroundColor: 'rgba(128,128,128,0.07)', gap: 20,
  },
  heroStatItem: { alignItems: 'center', gap: 3 },
  heroStatNum: { fontSize: 22, fontWeight: '900' },
  heroStatLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  heroStatDivider: { width: 1, height: 28 },

  // ── Section label ──────────────────────────────────────────────────────────
  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionLine: { flex: 1, height: 1 },
  sectionLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },

  // ── Body type cards ────────────────────────────────────────────────────────
  grid: { gap: 14, marginBottom: 16 },
  card: {
    borderRadius: 24, padding: 18, borderWidth: 1.5,
    position: 'relative', overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 14 },
      android: { elevation: 4 },
    }),
  },
  cardStrip: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  cardGlow: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8, marginBottom: 14 },
  cardIconBox: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  cardTitleBlock: { flex: 1 },
  cardTitle: { fontSize: 20, fontWeight: '900', letterSpacing: 0.3 },
  cardTagline: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  bookmarkBtn: {
    width: 34, height: 34, borderRadius: 17,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1.5,
  },

  // Characteristic pills
  charsRow: { flexDirection: 'row', gap: 7, marginBottom: 14, flexWrap: 'wrap' },
  charPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 9, paddingVertical: 5,
    borderRadius: 14, borderWidth: 1,
  },
  charText: { fontSize: 11, fontWeight: '700' },

  cardDivider: { height: 1, marginBottom: 12 },
  cardDesc: { fontSize: 13, lineHeight: 20, fontWeight: '500', marginBottom: 16 },

  // Footer
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  planCountPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 9, paddingVertical: 5, borderRadius: 12, borderWidth: 1,
  },
  planDot: { width: 5, height: 5, borderRadius: 2.5 },
  planCountText: { fontSize: 11, fontWeight: '700' },
  setTypeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 9, paddingVertical: 7,
    borderRadius: 13, borderWidth: 1.5,
  },
  setTypeText: { fontSize: 11, fontWeight: '700' },
  viewPlansBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 14, marginLeft: 'auto',
  },
  viewPlansBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' },

  // ── Log workout button ─────────────────────────────────────────────────────
  logWorkoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 17, borderRadius: 22, marginBottom: 14,
    gap: 10, overflow: 'hidden', position: 'relative',
    ...Platform.select({
      ios: { shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 18 },
      android: { elevation: 10 },
    }),
  },
  btnShimmer: {
    position: 'absolute', top: 0, left: '-20%', width: '40%', height: '100%',
    backgroundColor: '#fff', transform: [{ skewX: '-20deg' }],
  },
  logBtnIcon: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  logWorkoutButtonText: { fontSize: 16, fontWeight: '900', letterSpacing: 0.3 },
  logBtnCheck: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },

  // ── Saved section ──────────────────────────────────────────────────────────
  savedSection: {
    borderRadius: 22, padding: 18, marginBottom: 14, borderWidth: 1.5,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.04, shadowRadius: 10 },
      android: { elevation: 2 },
    }),
  },
  savedHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  savedIconBox: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  savedTitle: { fontSize: 15, fontWeight: '800' },
  savedSubtitle: { fontSize: 11, fontWeight: '500', marginTop: 1 },
  savedDivider: { height: 1, marginBottom: 4 },
  savedItem: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 12,
  },
  savedItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  savedItemIcon: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1.5,
  },
  savedItemName: { fontSize: 14, fontWeight: '700' },
  savedItemSub: { fontSize: 11, fontWeight: '500', marginTop: 1 },
  savedChevron: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },

  // ── Info card ──────────────────────────────────────────────────────────────
  infoCard: {
    borderRadius: 22, padding: 18, marginBottom: 14,
    borderWidth: 1.5, overflow: 'hidden', position: 'relative',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  infoIconBox: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  infoTitle: { fontSize: 15, fontWeight: '800' },
  infoSub: { fontSize: 11, fontWeight: '500', marginTop: 1 },
  infoText: { fontSize: 13, lineHeight: 21, fontWeight: '500' },

  // ── Primary (home) button ──────────────────────────────────────────────────
  primaryButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 18, marginBottom: 8,
    gap: 8, borderWidth: 1.5,
  },
  primaryButtonText: { fontSize: 14, fontWeight: '700' },
});