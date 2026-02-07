import Clock from '@/components/clock';
import { Colors } from '@/constants/Colors';
import { AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSimpleTheme } from '../../context/SimpleThemeContext';

const { width } = Dimensions.get('window');

export default function Home() {
  const { theme, toggleTheme } = useSimpleTheme();
  const currentColors = Colors[theme]; 
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [username, setUsername] = useState('');
  const isDark = theme === 'dark';
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  
  const checkLoginStatus = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const storedUsername = await AsyncStorage.getItem('username');
      
      console.log('Checking login status...');
      console.log('Token exists:', !!token);
      console.log('Username:', storedUsername);
      
      const loggedIn = !!token;
      setIsLoggedIn(loggedIn);
      
      if (storedUsername) {
        setUsername(storedUsername);
      } else {
        setUsername('');
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  }, []);

  // Check login status on mount
  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);



  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  

  const handleLogout = async () => {
    console.log('Logout button pressed');
    
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { 
          text: 'Cancel', 
          style: 'cancel'
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Starting logout process...');
              
              // Clear ALL AsyncStorage to be sure
              const keys = await AsyncStorage.getAllKeys();
              console.log('Keys to remove:', keys);
              
              // Remove all user-related keys
              for (const key of keys) {
                if (key.includes('user') || key.includes('token') || key.includes('auth')) {
                  await AsyncStorage.removeItem(key);
                  console.log('Removed key:', key);
                }
              }
              
              // Reset state immediately
              setIsLoggedIn(false);
              setUsername('');
              
              console.log('Navigation options:');
              console.log('1. /login (root login)');
              console.log('2. /admin/login (admin login)');
              console.log('3. /signup (signup page)');
              
              // Try to navigate to login - try ALL possible paths
              // First, let's check what login files you have
              setTimeout(() => {
                // Try the most common paths based on your file structure
                try {
                  // Option 1: Root login (most common)
                  router.replace('/login');
                } catch (e) {
                  console.log('Path /login failed, trying /admin/login');
                  try {
                    // Option 2: Admin login
                    router.replace('/admin/login');
                  } catch (e2) {
                    console.log('Path /admin/login failed, trying /signup');
                    try {
                      // Option 3: Signup page
                      router.replace('/signup');
                    } catch (e3) {
                      console.log('All navigation attempts failed');
                      // Last resort: reload the app
                      Alert.alert('Logged Out', 'Please restart the app');
                    }
                  }
                }
              }, 100);
              
              // Show success message
              setTimeout(() => {
                Alert.alert('Success', 'Logged out successfully!');
              }, 200);
              
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };


  // DIRECT TEST - Shows exactly what's happening
  const testNavigation = async () => {
    console.log('=== TESTING NAVIGATION ===');
    
    // Test different paths
    const testPaths = ['/login', '/admin/login', '/signup', '/admin/signup'];
    
    for (const path of testPaths) {
      console.log(`Testing navigation to: ${path}`);
      try {
        // Try to push
        router.push('/login');
        console.log(`✓ Navigation to ${path} initiated`);
        return; // Stop at first success
      } catch (error) {
        console.log(`✗ Failed to navigate to ${path}:`, error);
      }
    }
    
    console.log('All navigation paths failed');
    Alert.alert('Navigation Test', 'All paths failed. Check console.');
  };

  // Admin panel access
  const handleAdminAccess = () => {
    Alert.alert(
      'Admin Access',
      'Go to admin login panel?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Go to Admin',
          onPress: () => router.push('/admin/login'),
        },
      ]
    );
  };

  const quotes = [
    'No pain, no gain.',
    'Push harder than yesterday if you want a different tomorrow.',
    'Your body can stand almost anything. It\'s your mind you have to convince.',
  ];
  
  const mantras = [
    'Respect yourself and trust your power but be humble',
    'Consistency beats perfection every single time',
    'Progress is progress, no matter how small',
  ];

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
          <Clock style={{ marginRight: 12 }} />
          
          {isLoggedIn ? (
            <View style={styles.loggedInContainer}>
              <View style={styles.userBadge}>
                <View style={[styles.avatarCircle, { 
                  backgroundColor: isDark ? currentColors.primary : 'rgba(57, 255, 20, 0.15)',
                  borderWidth: 2,
                  borderColor: isDark ? 'rgba(57, 255, 20, 0.3)' : currentColors.primary,
                }]}>
                  <Text style={[styles.avatarText, { 
                    color: isDark ? currentColors.background : currentColors.primary 
                  }]}>
                    {username.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
                <Text style={[styles.username, { color: currentColors.text }]}>
                  {username || 'User'}
                </Text>
              </View>
              
              {/* Admin Access Button */}

              
         
              
              {/* NAVIGATION TEST BUTTON */}
              <TouchableOpacity 
                style={[styles.testButton, { 
                  backgroundColor: '#3bf63e',
                }]} 
                onPress={testNavigation}
                activeOpacity={0.7}
              >
                <Text style={styles.testButtonText}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.loginButtons}>
              <TouchableOpacity 
                style={[styles.loginButton, { 
                  backgroundColor: currentColors.primary,
                }]} 
                onPress={() => {
                  console.log('Login button pressed, trying /login');
                  router.push('/login');
                }}
                activeOpacity={0.85}
              >
                <AntDesign name="login" size={18} color={isDark ? currentColors.background : '#FFFFFF'} />
                <Text style={[styles.loginButtonText, { 
                  color: isDark ? currentColors.background : '#FFFFFF' 
                }]}>
                  Login
                </Text>
              </TouchableOpacity>
            </View>
          )}
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
        <Animated.View style={{ 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}>
          {/* Rest of your content remains exactly the same */}
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
                <MaterialCommunityIcons name="arm-flex" size={40} color={currentColors.primary} />
              </View>
              <Text style={[styles.heroTitle, { color: currentColors.text }]}>
                Your Fitness Journey
              </Text>
              <Text style={[styles.heroSubtitle, { 
                color: isDark ? currentColors.text : '#666' 
              }]}>
                Transform your body, elevate your mind
              </Text>
              <View style={[styles.heroBadge, {
                backgroundColor: isDark ? 'rgba(57, 255, 20, 0.15)' : 'rgba(57, 255, 20, 0.1)',
              }]}>
                <Ionicons name="star" size={14} color={currentColors.primary} />
                <Text style={[styles.heroBadgeText, { color: currentColors.primary }]}>
                  Track • Train • Transform
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.statsGrid}>
            <TouchableOpacity 
              activeOpacity={0.8}
              style={[styles.statCard, { 
                backgroundColor: isDark ? currentColors.card : '#FFFFFF',
                borderColor: isDark ? 'rgba(255, 107, 107, 0.3)' : 'rgba(255, 107, 107, 0.2)',
                shadowColor: '#FF6B6B',
              }]}
            >
              <View style={[styles.statIconContainer, { 
                backgroundColor: isDark ? 'rgba(255, 107, 107, 0.2)' : 'rgba(255, 107, 107, 0.1)',
                borderWidth: 2,
                borderColor: 'rgba(255, 107, 107, 0.3)',
              }]}>
                <Ionicons name="flame" size={24} color="#FF6B6B" />
              </View>
              <Text style={[styles.statNumber, { color: currentColors.text }]}>0</Text>
              <Text style={[styles.statLabel, { 
                color: isDark ? currentColors.text : '#666' 
              }]}>Workouts</Text>
              <View style={[styles.statProgress, { backgroundColor: 'rgba(255, 107, 107, 0.2)' }]}>
                <View style={[styles.statProgressBar, { backgroundColor: '#FF6B6B', width: '0%' }]} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              activeOpacity={0.8}
              style={[styles.statCard, { 
                backgroundColor: isDark ? currentColors.card : '#FFFFFF',
                borderColor: isDark ? 'rgba(255, 193, 7, 0.3)' : 'rgba(255, 193, 7, 0.2)',
                shadowColor: '#FFC107',
              }]}
            >
              <View style={[styles.statIconContainer, { 
                backgroundColor: isDark ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 193, 7, 0.1)',
                borderWidth: 2,
                borderColor: 'rgba(255, 193, 7, 0.3)',
              }]}>
                <Ionicons name="trophy" size={24} color="#FFC107" />
              </View>
              <Text style={[styles.statNumber, { color: currentColors.text }]}>0</Text>
              <Text style={[styles.statLabel, { 
                color: isDark ? currentColors.text : '#666' 
              }]}>Day Streak</Text>
              <View style={[styles.statProgress, { backgroundColor: 'rgba(255, 193, 7, 0.2)' }]}>
                <View style={[styles.statProgressBar, { backgroundColor: '#FFC107', width: '0%' }]} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              activeOpacity={0.8}
              style={[styles.statCard, { 
                backgroundColor: isDark ? currentColors.card : '#FFFFFF',
                borderColor: currentColors.primary,
                shadowColor: currentColors.primary,
              }]}
            >
              <View style={[styles.statIconContainer, { 
                backgroundColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.1)',
                borderWidth: 2,
                borderColor: isDark ? 'rgba(57, 255, 20, 0.3)' : currentColors.primary,
              }]}>
                <MaterialCommunityIcons name="weight-lifter" size={24} color={currentColors.primary} />
              </View>
              <Text style={[styles.statNumber, { color: currentColors.text }]}>0</Text>
              <Text style={[styles.statLabel, { 
                color: isDark ? currentColors.text : '#666' 
              }]}>Total PRs</Text>
              <View style={[styles.statProgress, { 
                backgroundColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.15)' 
              }]}>
                <View style={[styles.statProgressBar, { 
                  backgroundColor: currentColors.primary, 
                  width: '0%' 
                }]} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={[styles.contentCard, { 
            backgroundColor: isDark ? currentColors.card : '#FFFFFF',
            borderColor: currentColors.primary,
            shadowColor: currentColors.primary,
          }]}>
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <View style={[styles.headerIcon, { 
                  backgroundColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.1)',
                  borderWidth: 2,
                  borderColor: isDark ? 'rgba(57, 255, 20, 0.3)' : 'rgba(57, 255, 20, 0.2)',
                }]}>
                  <MaterialCommunityIcons name="meditation" size={20} color={currentColors.primary} />
                </View>
                <View>
                  <Text style={[styles.cardTitle, { color: currentColors.text }]}>
                    Daily Mantras
                  </Text>
                  <Text style={[styles.cardSubtitle, { 
                    color: isDark ? 'rgba(255, 255, 255, 0.5)' : '#999' 
                  }]}>
                    Mindset & Focus
                  </Text>
                </View>
              </View>
            </View>
            <View style={[styles.cardDivider, { 
              backgroundColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.1)' 
            }]} />
            {mantras.map((mantra, i) => (
              <View key={i} style={styles.listItem}>
                <View style={[styles.bulletPoint, { 
                  backgroundColor: currentColors.primary,
                }]} />
                <Text style={[styles.listText, { 
                  color: isDark ? currentColors.text : '#333' 
                }]}>
                  {mantra}
                </Text>
              </View>
            ))}
          </View>
        
          <View style={[styles.contentCard, { 
            backgroundColor: isDark ? currentColors.card : '#FFFFFF',
            borderColor: currentColors.primary,
            shadowColor: currentColors.primary,
          }]}>
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <View style={[styles.headerIcon, { 
                  backgroundColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.1)',
                  borderWidth: 2,
                  borderColor: isDark ? 'rgba(57, 255, 20, 0.3)' : 'rgba(57, 255, 20, 0.2)',
                }]}>
                  <Ionicons name="flash" size={20} color={currentColors.primary} />
                </View>
                <View>
                  <Text style={[styles.cardTitle, { color: currentColors.text }]}>
                    Motivation Boost
                  </Text>
                  <Text style={[styles.cardSubtitle, { 
                    color: isDark ? 'rgba(255, 255, 255, 0.5)' : '#999' 
                  }]}>
                    Stay Inspired
                  </Text>
                </View>
              </View>
            </View>
            <View style={[styles.cardDivider, { 
              backgroundColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.1)' 
            }]} />
            {quotes.map((quote, i) => (
              <TouchableOpacity 
                key={i} 
                activeOpacity={0.7}
                style={[styles.quoteItem, {
                  backgroundColor: isDark ? 'rgba(57, 255, 20, 0.05)' : 'rgba(57, 255, 20, 0.03)',
                }]}
              >
                <View style={[styles.quoteAccent, { backgroundColor: currentColors.primary }]} />
                <View style={styles.quoteContent}>
                  <Text style={[styles.quoteText, { 
                    color: isDark ? currentColors.text : '#333' 
                  }]}>
                    "{quote}"
                  </Text>
                  <Ionicons 
                    name="heart-outline" 
                    size={16} 
                    color={isDark ? 'rgba(255, 255, 255, 0.3)' : '#CCC'} 
                    style={styles.quoteIcon}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            style={[styles.primaryButton, { 
              backgroundColor: currentColors.primary,
              shadowColor: currentColors.primary,
            }]}
            onPress={() => router.push('/plan')}
            activeOpacity={0.85}
          >
            <View style={[styles.buttonGlow, {
              backgroundColor: currentColors.primary,
            }]} />
            <MaterialCommunityIcons 
              name="play-circle" 
              size={26} 
              color={isDark ? currentColors.background : '#FFFFFF'} 
            />
            <Text style={[styles.primaryButtonText, { 
              color: isDark ? currentColors.background : '#FFFFFF' 
            }]}>
              Start New Workout
            </Text>
            <Ionicons 
              name="arrow-forward" 
              size={20} 
              color={isDark ? currentColors.background : '#FFFFFF'} 
            />
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
            <TouchableOpacity 
              style={[styles.secondaryButton, { 
                backgroundColor: isDark ? currentColors.card : '#FFFFFF',
                borderColor: currentColors.primary,
              }]}
              activeOpacity={0.8}
            >
              <View style={[styles.secondaryIconWrapper, {
                backgroundColor: isDark ? 'rgba(57, 255, 20, 0.15)' : 'rgba(57, 255, 20, 0.1)',
              }]}>
                <Ionicons name="calendar-outline" size={20} color={currentColors.primary} />
              </View>
              <Text style={[styles.secondaryButtonText, { color: currentColors.text }]}>
                Schedule
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.secondaryButton, { 
                backgroundColor: isDark ? currentColors.card : '#FFFFFF',
                borderColor: currentColors.primary,
              }]}
              activeOpacity={0.8}
            >
              <View style={[styles.secondaryIconWrapper, {
                backgroundColor: isDark ? 'rgba(57, 255, 20, 0.15)' : 'rgba(57, 255, 20, 0.1)',
              }]}>
                <Ionicons name="bar-chart-outline" size={20} color={currentColors.primary} />
              </View>
              <Text style={[styles.secondaryButtonText, { color: currentColors.text }]}>
                Progress
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={[styles.quickActionCard, {
                backgroundColor: isDark ? currentColors.card : '#FFFFFF',
                borderColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.15)',
              }]}
              onPress={() => router.push('/calculator')}
              activeOpacity={0.8}
            >
              <Ionicons name="calculator" size={24} color={currentColors.primary} />
              <Text style={[styles.quickActionText, { color: currentColors.text }]}>
                Calculator
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.quickActionCard, {
                backgroundColor: isDark ? currentColors.card : '#FFFFFF',
                borderColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.15)',
              }]}
              activeOpacity={0.8}
            >
              <Ionicons name="water-outline" size={24} color={currentColors.primary} />
              <Text style={[styles.quickActionText, { color: currentColors.text }]}>
                Hydration
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.quickActionCard, {
                backgroundColor: isDark ? currentColors.card : '#FFFFFF',
                borderColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.15)',
              }]}
              activeOpacity={0.8}
            >
              <Ionicons name="moon-outline" size={24} color={currentColors.primary} />
              <Text style={[styles.quickActionText, { color: currentColors.text }]}>
                Sleep
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.quickActionCard, {
                backgroundColor: isDark ? currentColors.card : '#FFFFFF',
                borderColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.15)',
              }]}
              activeOpacity={0.8}
            >
              <Ionicons name="settings-outline" size={24} color={currentColors.primary} />
              <Text style={[styles.quickActionText, { color: currentColors.text }]}>
                Settings
              </Text>
            </TouchableOpacity>
          </View>
         </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 2,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
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
  loggedInContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    maxWidth: 80,
  },
  loginButtons: {
    flexDirection: 'row',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 18,
    gap: 6,
  },
  loginButtonText: {
    fontWeight: '700',
    fontSize: 13,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 18,
    gap: 4,
  },
  adminButtonText: {
    fontWeight: '700',
    fontSize: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 18,
    gap: 4,
  },
  logoutButtonText: {
    fontWeight: '700',
    fontSize: 12,
    color: '#FFFFFF',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    height: 30,
    borderRadius: 15,
  },
  testButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 11,
  },
  scrollContainer: {
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 28,
    padding: 32,
    marginBottom: 24,
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
    marginBottom: 16,
    textAlign: 'center',
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
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 8,
    borderRadius: 24,
    borderWidth: 2,
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
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  statProgress: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  statProgressBar: {
    height: '100%',
    borderRadius: 2,
  },
  contentCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  cardDivider: {
    height: 2,
    borderRadius: 1,
    marginBottom: 18,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingRight: 4,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 7,
    marginRight: 14,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500',
  },
  quoteItem: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingLeft: 4,
    paddingVertical: 12,
    paddingRight: 12,
    borderRadius: 16,
  },
  quoteAccent: {
    width: 4,
    borderRadius: 2,
    marginRight: 16,
  },
  quoteContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  quoteText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  quoteIcon: {
    marginLeft: 8,
    marginTop: 4,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 20,
    marginTop: 8,
    marginBottom: 16,
    gap: 12,
    position: 'relative',
    overflow: 'hidden',
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
  buttonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 18,
    borderWidth: 2,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  secondaryIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  quickActionCard: {
    width: (width - 52) / 2,
    aspectRatio: 1.5,
    borderRadius: 20,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '700',
  },
});