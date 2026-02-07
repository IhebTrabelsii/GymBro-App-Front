import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import React, { useEffect, useState } from 'react';
import Clock from '@/components/clock';
import { Colors } from '@/constants/Colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSimpleTheme } from '../context/SimpleThemeContext';
import{
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function Home() {
  const { theme, toggleTheme } = useSimpleTheme();
  const currentColors = Colors[theme]; 
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [username, setUsername] = useState('');
  const isDark = theme === 'dark';

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const storedUsername = await AsyncStorage.getItem('username');
        setIsLoggedIn(!!token);
        if (storedUsername) setUsername(storedUsername);
      } catch (error) {
        Alert.alert('Error', 'Failed to load login status.');
      }
    };
    checkLoginStatus();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('username');
    setIsLoggedIn(false);
    setUsername('');
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

  if (isLoggedIn === null) {
    return (
      <View style={[styles.container, { 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: currentColors.background 
      }]}>
        <Text style={{ color: currentColors.text, fontSize: 16 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      {/* Professional Header */}
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
          <Clock style={{ marginRight: 12 }} />
          
          {isLoggedIn ? (
            <View style={styles.loggedInContainer}>
              <View style={styles.userBadge}>
                <View style={[styles.avatarCircle, { 
                  backgroundColor: isDark ? currentColors.primary : 'rgba(57, 255, 20, 0.15)' 
                }]}>
                  <Text style={[styles.avatarText, { 
                    color: isDark ? currentColors.background : currentColors.primary 
                  }]}>
                    {username.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.username, { color: currentColors.text }]}>
                  {username}
                </Text>
              </View>
              <TouchableOpacity 
                style={[styles.iconButton, { 
                  backgroundColor: isDark ? currentColors.primary : '#F5F5F5',
                  borderWidth: 1.5,
                  borderColor: currentColors.primary,
                }]} 
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <AntDesign name="logout" size={18} color={currentColors.primary} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.loginButtons}>
              <TouchableOpacity 
                style={[styles.iconButton, styles.loginButton, { 
                  backgroundColor: isDark ? currentColors.primary : '#F5F5F5',
                  borderWidth: 1.5,
                  borderColor: currentColors.primary,
                }]} 
                onPress={() => router.push('/login')}
                activeOpacity={0.8}
              >
                <AntDesign name="login" size={18} color={currentColors.primary} />
                <Text style={[styles.iconText, { color: currentColors.primary }]}>
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
            </View>
          </View>
        </MotiView>

        {/* Stats Grid */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 150, duration: 500 }}
        >
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { 
              backgroundColor: isDark ? currentColors.card : '#FFFFFF',
              borderColor: isDark ? 'rgba(57, 255, 20, 0.3)' : 'rgba(57, 255, 20, 0.15)',
              shadowColor: isDark ? currentColors.primary : '#000',
            }]}>
              <View style={[styles.statIconContainer, { 
                backgroundColor: isDark ? 'rgba(255, 107, 107, 0.2)' : 'rgba(255, 107, 107, 0.1)' 
              }]}>
                <Ionicons name="flame" size={24} color="#FF6B6B" />
              </View>
              <Text style={[styles.statNumber, { color: currentColors.text }]}>0</Text>
              <Text style={[styles.statLabel, { 
                color: isDark ? currentColors.text : '#666' 
              }]}>Workouts</Text>
            </View>
            
            <View style={[styles.statCard, { 
              backgroundColor: isDark ? currentColors.card : '#FFFFFF',
              borderColor: isDark ? 'rgba(57, 255, 20, 0.3)' : 'rgba(57, 255, 20, 0.15)',
              shadowColor: isDark ? currentColors.primary : '#000',
            }]}>
              <View style={[styles.statIconContainer, { 
                backgroundColor: isDark ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 193, 7, 0.1)' 
              }]}>
                <Ionicons name="trophy" size={24} color="#FFC107" />
              </View>
              <Text style={[styles.statNumber, { color: currentColors.text }]}>0</Text>
              <Text style={[styles.statLabel, { 
                color: isDark ? currentColors.text : '#666' 
              }]}>Day Streak</Text>
            </View>
            
            <View style={[styles.statCard, { 
              backgroundColor: isDark ? currentColors.card : '#FFFFFF',
              borderColor: isDark ? 'rgba(57, 255, 20, 0.3)' : 'rgba(57, 255, 20, 0.15)',
              shadowColor: isDark ? currentColors.primary : '#000',
            }]}>
              <View style={[styles.statIconContainer, { 
                backgroundColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.1)' 
              }]}>
                <MaterialCommunityIcons name="weight-lifter" size={24} color={currentColors.primary} />
              </View>
              <Text style={[styles.statNumber, { color: currentColors.text }]}>0</Text>
              <Text style={[styles.statLabel, { 
                color: isDark ? currentColors.text : '#666' 
              }]}>Total PRs</Text>
            </View>
          </View>
        </MotiView>

        {/* Daily Mantras */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 300, duration: 500 }}
        >
          <View style={[styles.contentCard, { 
            backgroundColor: isDark ? currentColors.card : '#FFFFFF',
            borderColor: isDark ? 'rgba(57, 255, 20, 0.3)' : 'rgba(57, 255, 20, 0.15)',
            shadowColor: isDark ? currentColors.primary : '#000',
          }]}>
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <View style={[styles.headerIcon, { 
                  backgroundColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.1)' 
                }]}>
                  <MaterialCommunityIcons name="meditation" size={20} color={currentColors.primary} />
                </View>
                <Text style={[styles.cardTitle, { color: currentColors.text }]}>
                  Daily Mantras
                </Text>
              </View>
            </View>
            <View style={[styles.cardDivider, { 
              backgroundColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.1)' 
            }]} />
            {mantras.map((mantra, i) => (
              <View key={i} style={styles.listItem}>
                <View style={[styles.bulletPoint, { backgroundColor: currentColors.primary }]} />
                <Text style={[styles.listText, { 
                  color: isDark ? currentColors.text : '#333' 
                }]}>
                  {mantra}
                </Text>
              </View>
            ))}
          </View>
        </MotiView>
        
        {/* Motivational Quotes */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 450, duration: 500 }}
        >
          <View style={[styles.contentCard, { 
            backgroundColor: isDark ? currentColors.card : '#FFFFFF',
            borderColor: isDark ? 'rgba(57, 255, 20, 0.3)' : 'rgba(57, 255, 20, 0.15)',
            shadowColor: isDark ? currentColors.primary : '#000',
          }]}>
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <View style={[styles.headerIcon, { 
                  backgroundColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.1)' 
                }]}>
                  <Ionicons name="flash" size={20} color={currentColors.primary} />
                </View>
                <Text style={[styles.cardTitle, { color: currentColors.text }]}>
                  Motivation Boost
                </Text>
              </View>
            </View>
            <View style={[styles.cardDivider, { 
              backgroundColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.1)' 
            }]} />
            {quotes.map((quote, i) => (
              <View key={i} style={styles.quoteItem}>
                <View style={[styles.quoteAccent, { backgroundColor: currentColors.primary }]} />
                <Text style={[styles.quoteText, { 
                  color: isDark ? currentColors.text : '#333' 
                }]}>
                  "{quote}"
                </Text>
              </View>
            ))}
          </View>
        </MotiView>

        {/* Action Button */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 600, duration: 500 }}
        >
          <TouchableOpacity 
            style={[styles.primaryButton, { 
              backgroundColor: currentColors.primary,
              shadowColor: currentColors.primary,
            }]}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="play-circle" size={24} color={isDark ? currentColors.background : '#FFFFFF'} />
            <Text style={[styles.primaryButtonText, { 
              color: isDark ? currentColors.background : '#FFFFFF' 
            }]}>
              Start New Workout
            </Text>
          </TouchableOpacity>
        </MotiView>

        {/* Secondary Actions */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 750, duration: 500 }}
        >
          <View style={styles.secondaryActions}>
            <TouchableOpacity 
              style={[styles.secondaryButton, { 
                backgroundColor: isDark ? currentColors.card : '#FFFFFF',
                borderColor: isDark ? 'rgba(57, 255, 20, 0.3)' : 'rgba(57, 255, 20, 0.2)',
              }]}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar-outline" size={20} color={currentColors.primary} />
              <Text style={[styles.secondaryButtonText, { color: currentColors.text }]}>
                View Schedule
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.secondaryButton, { 
                backgroundColor: isDark ? currentColors.card : '#FFFFFF',
                borderColor: isDark ? 'rgba(57, 255, 20, 0.3)' : 'rgba(57, 255, 20, 0.2)',
              }]}
              activeOpacity={0.8}
            >
              <Ionicons name="bar-chart-outline" size={20} color={currentColors.primary} />
              <Text style={[styles.secondaryButtonText, { color: currentColors.text }]}>
                Progress
              </Text>
            </TouchableOpacity>
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
  loggedInContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
    fontSize: 15,
    fontWeight: '600',
  },
  loginButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
    height: 36,
    borderRadius: 18,
  },
  loginButton: {
    paddingHorizontal: 16,
  },
  iconText: {
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
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    opacity: 0.8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 8,
    borderRadius: 20,
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
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contentCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cardDivider: {
    height: 2,
    borderRadius: 1,
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    paddingRight: 4,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    marginRight: 12,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  quoteItem: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingLeft: 4,
  },
  quoteAccent: {
    width: 3,
    borderRadius: 2,
    marginRight: 14,
  },
  quoteText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 12,
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
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
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
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});