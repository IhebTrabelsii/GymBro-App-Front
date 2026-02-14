import { Colors } from '@/constants/Colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSimpleTheme } from '../../context/SimpleThemeContext';

const { width } = Dimensions.get('window');

// Define types for API response
type PlanResponse = {
  success: boolean;
  plan?: string;
  premiumSince?: string;
  error?: string;
};

type UserData = {
  plan?: string;
  [key: string]: any;
};

export default function AICoachTab() {
  const router = useRouter();
  const { theme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === 'dark';
  const [userPlan, setUserPlan] = useState<string>('free');
  const [loading, setLoading] = useState(true);

  const primaryColor = '#39FF14';

  useEffect(() => {
    checkUserPlan();
  }, []);

  const checkUserPlan = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      let localUser: UserData | null = null;
      
      if (userData) {
        localUser = JSON.parse(userData) as UserData;
        setUserPlan(localUser.plan || 'free');
      }
      
      // Also check from backend for real-time status
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        const response = await fetch('http://192.168.100.143:3000/api/users/plan', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        const data = (await response.json()) as PlanResponse;
        
        if (data.success && data.plan) {
          setUserPlan(data.plan);
          // Update local storage
          if (localUser) {
            localUser.plan = data.plan;
            await AsyncStorage.setItem('userData', JSON.stringify(localUser));
          }
        }
      }
    } catch (error) {
      console.error('Error checking plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradePress = () => {
    router.push('/premium');
  };

  const handleAskQuestion = () => {
    if (userPlan === 'free') {
      Alert.alert(
        'Premium Feature',
        'AI Coach is a premium feature. Upgrade to Pro to get personalized coaching!',
        [
          { text: 'Not Now', style: 'cancel' },
          { text: 'Upgrade Now', onPress: handleUpgradePress }
        ]
      );
    } else {
      // Premium user - will implement real AI later
      Alert.alert('Coming Soon', 'AI Coach will be available in the next update!');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#f5f5f5' }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#f5f5f5' }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
          <View style={[styles.aiIconContainer, { backgroundColor: primaryColor + '20' }]}>
            <MaterialCommunityIcons name="robot" size={60} color={primaryColor} />
          </View>
          
          <Text style={[styles.title, { color: isDark ? '#FFF' : '#000' }]}>
            AI Fitness Coach
          </Text>
          
          <Text style={[styles.subtitle, { color: isDark ? '#888' : '#666' }]}>
            Your personal AI assistant for workout and nutrition advice
          </Text>

          {userPlan !== 'free' && (
            <View style={[styles.premiumBadge, { backgroundColor: primaryColor + '20' }]}>
              <MaterialCommunityIcons name="crown" size={16} color={primaryColor} />
              <Text style={[styles.premiumBadgeText, { color: primaryColor }]}>
                PRO ACTIVE
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Upgrade Banner for Free Users */}
        {userPlan === 'free' && (
          <Animated.View entering={FadeInUp.delay(200)} style={styles.upgradeBanner}>
            <View style={styles.upgradeBannerContent}>
              <MaterialCommunityIcons name="crown" size={32} color="#FFD700" />
              <Text style={styles.upgradeBannerTitle}>Unlock AI Coach</Text>
              <Text style={styles.upgradeBannerText}>
                Get personalized workout plans, nutrition advice, and 24/7 coaching
              </Text>
              <TouchableOpacity
                style={[styles.upgradeButton, { backgroundColor: primaryColor }]}
                onPress={handleUpgradePress}
              >
                <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
                <Ionicons name="arrow-forward" size={18} color="#000" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Chat Preview */}
        <Animated.View entering={FadeInUp.delay(300)} style={styles.chatPreview}>
          <View style={styles.chatHeader}>
            <Ionicons name="chatbubbles" size={20} color={primaryColor} />
            <Text style={[styles.chatHeaderText, { color: isDark ? '#FFF' : '#000' }]}>
              Try asking me...
            </Text>
          </View>

          {/* Sample Questions */}
          <View style={styles.sampleQuestions}>
            {[
              'What workout is best for chest?',
              'How many calories should I eat?',
              'Create a beginner workout plan',
              'Tips for weight loss',
            ].map((question, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.questionChip, { 
                  backgroundColor: isDark ? '#222' : '#F0F0F0',
                  borderColor: primaryColor + '30',
                }]}
                onPress={handleAskQuestion}
              >
                <Text style={[styles.questionText, { color: isDark ? '#FFF' : '#000' }]}>
                  {question}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Chat Input Simulator */}
          <TouchableOpacity 
            style={[styles.chatInput, { 
              backgroundColor: isDark ? '#222' : '#F0F0F0',
              borderColor: primaryColor + '30',
            }]}
            onPress={handleAskQuestion}
          >
            <Text style={[styles.chatInputText, { color: isDark ? '#888' : '#666' }]}>
              Ask me anything about fitness...
            </Text>
            <View style={[styles.sendButton, { backgroundColor: primaryColor }]}>
              <Ionicons name="send" size={18} color="#000" />
            </View>
          </TouchableOpacity>

          {userPlan === 'free' && (
            <Text style={[styles.freeNote, { color: isDark ? '#888' : '#666' }]}>
              💡 Upgrade to Pro to ask unlimited questions
            </Text>
          )}
        </Animated.View>

        {/* Features List */}
        <Animated.View entering={FadeInUp.delay(400)} style={styles.featuresSection}>
          <Text style={[styles.featuresTitle, { color: isDark ? '#FFF' : '#000' }]}>
            What AI Coach can do for you:
          </Text>

          {[
            { icon: 'barbell', text: 'Personalized workout recommendations' },
            { icon: 'restaurant', text: 'Meal planning and nutrition advice' },
            { icon: 'stats-chart', text: 'Progress tracking and adjustments' },
            { icon: 'time', text: '24/7 instant responses' },
            { icon: 'calendar', text: 'Workout schedule optimization' },
            { icon: 'bulb', text: 'Form tips and exercise guidance' },
          ].map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Ionicons name={feature.icon as any} size={20} color={primaryColor} />
              <Text style={[styles.featureText, { color: isDark ? '#CCC' : '#666' }]}>
                {feature.text}
              </Text>
            </View>
          ))}
        </Animated.View>

        {/* For Premium Users - Coming Soon Message */}
        {userPlan !== 'free' && (
          <Animated.View entering={FadeInUp.delay(500)} style={styles.comingSoon}>
            <MaterialCommunityIcons name="robot" size={48} color={primaryColor} />
            <Text style={[styles.comingSoonTitle, { color: isDark ? '#FFF' : '#000' }]}>
              AI Coach Coming Soon!
            </Text>
            <Text style={[styles.comingSoonText, { color: isDark ? '#888' : '#666' }]}>
              We're training your personal AI coach. Check back in the next update!
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  aiIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  premiumBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  upgradeBanner: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    borderWidth: 2,
    borderColor: '#39FF14',
  },
  upgradeBannerContent: {
    padding: 24,
    alignItems: 'center',
  },
  upgradeBannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#39FF14',
    marginTop: 12,
    marginBottom: 8,
  },
  upgradeBannerText: {
    fontSize: 14,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
  },
  upgradeButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  chatPreview: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  chatHeaderText: {
    fontSize: 18,
    fontWeight: '600',
  },
  sampleQuestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  questionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  questionText: {
    fontSize: 14,
  },
  chatInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 8,
    borderRadius: 25,
    borderWidth: 1,
  },
  chatInputText: {
    flex: 1,
    fontSize: 15,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  freeNote: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 13,
    fontStyle: 'italic',
  },
  featuresSection: {
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: 'rgba(57, 255, 20, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 20, 0.2)',
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    flex: 1,
  },
  comingSoon: {
    marginHorizontal: 20,
    padding: 30,
    alignItems: 'center',
    backgroundColor: 'rgba(57, 255, 20, 0.05)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(57, 255, 20, 0.3)',
    borderStyle: 'dashed',
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});