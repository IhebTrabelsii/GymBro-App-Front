import Clock from '@/components/clock';
import { Colors } from '@/constants/Colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
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
} from 'react-native';
import { useSimpleTheme } from '../context/SimpleThemeContext';

const { width } = Dimensions.get('window');

interface NewsItem {
  id: number;
  title: string;
  description: string;
  category: string;
  source: string;
  date: string;
}

const GymNewsScreen: React.FC = () => {
  const router = useRouter();
  const { theme, toggleTheme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === 'dark';
  
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [countdown, setCountdown] = useState<number>(300);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.143:3000';
      console.log(`Fetching news from ${apiUrl}/api/news`);
      const response = await fetch(`${apiUrl}/api/news`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('NEWS RESPONSE:', data);
      if (response.ok) {
        setNews(data);
        setLastUpdated(new Date());
        setCountdown(300);
        setError(null);
      } else {
        setError(data.error || `Failed to load news (Status: ${response.status})`);
      }
    } catch (error) {
      console.log('Fetch error:', error);
      if (error instanceof Error) {
        setError(`Network Error: ${error.message}`);
      } else {
        setError('Network Error: An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 300000);
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 300));
    }, 1000);
    return () => {
      clearInterval(interval);
      clearInterval(countdownInterval);
    };
  }, []);

  const handleRefresh = () => {
    fetchNews();
  };

  const groupedNews = news.reduce<Record<string, NewsItem[]>>((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      {/* Professional Header - Matching Homepage */}
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
        contentContainerStyle={styles.scrollContainer}
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
                <Ionicons name="newspaper" size={40} color={currentColors.primary} />
              </View>
              <Text style={[styles.heroTitle, { color: currentColors.text }]}>
                Latest Fitness News
              </Text>
              <Text style={[styles.heroSubtitle, { 
                color: isDark ? currentColors.text : '#666' 
              }]}>
                Stay updated with the latest in fitness, nutrition, and wellness
              </Text>
            </View>
          </View>
        </MotiView>

        {/* Refresh Controls */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 150, duration: 500 }}
        >
          <View style={[styles.refreshCard, { 
            backgroundColor: isDark ? currentColors.card : '#FFFFFF',
            borderColor: isDark ? 'rgba(57, 255, 20, 0.3)' : 'rgba(57, 255, 20, 0.15)',
            shadowColor: isDark ? currentColors.primary : '#000',
          }]}>
            <View style={styles.refreshHeader}>
              <View style={[styles.refreshIcon, { 
                backgroundColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.1)' 
              }]}>
                <Ionicons name="time" size={20} color={currentColors.primary} />
              </View>
              <View style={styles.refreshInfo}>
                <Text style={[styles.refreshTitle, { color: currentColors.text }]}>
                  Auto-refresh in {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                </Text>
                <Text style={[styles.refreshSubtitle, { 
                  color: isDark ? currentColors.text : '#666' 
                }]}>
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.refreshButton, { 
                  backgroundColor: currentColors.primary,
                  shadowColor: currentColors.primary,
                }]}
                onPress={handleRefresh}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={isDark ? currentColors.background : '#FFFFFF'} />
                ) : (
                  <>
                    <Ionicons 
                      name="refresh" 
                      size={18} 
                      color={isDark ? currentColors.background : '#FFFFFF'} 
                    />
                    <Text style={[styles.refreshButtonText, { 
                      color: isDark ? currentColors.background : '#FFFFFF' 
                    }]}>
                      Refresh
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </MotiView>

        {/* Loading State */}
        {loading && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 300 }}
          >
            <View style={[styles.loadingCard, { 
              backgroundColor: isDark ? currentColors.card : '#FFFFFF',
              borderColor: isDark ? 'rgba(57, 255, 20, 0.3)' : 'rgba(57, 255, 20, 0.15)',
            }]}>
              <View style={[styles.loadingIcon, { 
                backgroundColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.1)' 
              }]}>
                <ActivityIndicator size="large" color={currentColors.primary} />
              </View>
              <Text style={[styles.loadingText, { color: currentColors.text }]}>
                Loading latest news...
              </Text>
            </View>
          </MotiView>
        )}

        {/* Error State */}
        {error && (
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 300 }}
          >
            <View style={[styles.errorCard, { 
              backgroundColor: isDark ? currentColors.card : '#FFFFFF',
              borderColor: isDark ? '#FF444440' : '#FF444420',
            }]}>
              <View style={[styles.errorIcon, { backgroundColor: '#FF444420' }]}>
                <Ionicons name="warning" size={24} color="#FF4444" />
              </View>
              <Text style={[styles.errorTitle, { color: currentColors.text }]}>
                Connection Error
              </Text>
              <Text style={[styles.errorText, { color: isDark ? '#FF6B6B' : '#D32F2F' }]}>
                {error}
              </Text>
              <TouchableOpacity
                style={[styles.retryButton, { 
                  backgroundColor: currentColors.primary,
                  shadowColor: currentColors.primary,
                }]}
                onPress={handleRefresh}
              >
                <Ionicons 
                  name="refresh" 
                  size={18} 
                  color={isDark ? currentColors.background : '#FFFFFF'} 
                />
                <Text style={[styles.retryButtonText, { 
                  color: isDark ? currentColors.background : '#FFFFFF' 
                }]}>
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          </MotiView>
        )}

        {/* News Content */}
        {!loading && !error && news.length > 0 && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 300, duration: 500 }}
          >
            {Object.entries(groupedNews).map(([category, items], index) => (
              <View style={styles.section} key={category}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.categoryIcon, { 
                    backgroundColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.1)' 
                  }]}>
                    <Ionicons 
                      name={
                        category === 'Nutrition' ? 'restaurant' :
                        category === 'Workout' ? 'barbell' :
                        category === 'Science' ? 'flask' :
                        'information-circle'
                      } 
                      size={20} 
                      color={currentColors.primary} 
                    />
                  </View>
                  <Text style={[styles.sectionTitle, { color: currentColors.primary }]}>
                    {category}
                  </Text>
                </View>
                
                {items.map((item, itemIndex) => (
                  <MotiView
                    key={item.id}
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 400 + (index * 100) + (itemIndex * 50), duration: 500 }}
                  >
                    <View style={[styles.newsCard, { 
                      backgroundColor: isDark ? currentColors.card : '#FFFFFF',
                      borderColor: isDark ? 'rgba(57, 255, 20, 0.3)' : 'rgba(57, 255, 20, 0.15)',
                      shadowColor: isDark ? currentColors.primary : '#000',
                    }]}>
                      <View style={styles.newsHeader}>
                        <View style={styles.sourceContainer}>
                          <Ionicons name="document-text" size={16} color={currentColors.primary} />
                          <Text style={[styles.sourceText, { 
                            color: isDark ? currentColors.text : '#666' 
                          }]}>
                            {item.source}
                          </Text>
                        </View>
                        <Text style={[styles.dateText, { 
                          color: isDark ? currentColors.text : '#666' 
                        }]}>
                          {item.date}
                        </Text>
                      </View>
                      
                      <Text style={[styles.newsTitle, { color: currentColors.text }]}>
                        {item.title}
                      </Text>
                      
                      <View style={[styles.divider, { 
                        backgroundColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.1)' 
                      }]} />
                      
                      <Text style={[styles.newsDescription, { 
                        color: isDark ? currentColors.text : '#333' 
                      }]}>
                        {item.description}
                      </Text>
                    </View>
                  </MotiView>
                ))}
              </View>
            ))}
          </MotiView>
        )}

        {/* Empty State */}
        {!loading && !error && news.length === 0 && (
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 300, duration: 500 }}
          >
            <View style={[styles.emptyCard, { 
              backgroundColor: isDark ? currentColors.card : '#FFFFFF',
              borderColor: isDark ? 'rgba(57, 255, 20, 0.3)' : 'rgba(57, 255, 20, 0.15)',
            }]}>
              <View style={[styles.emptyIcon, { 
                backgroundColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.1)' 
              }]}>
                <Ionicons name="newspaper-outline" size={40} color={currentColors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: currentColors.text }]}>
                No News Available
              </Text>
              <Text style={[styles.emptyText, { 
                color: isDark ? currentColors.text : '#666' 
              }]}>
                Check your connection or try refreshing
              </Text>
            </View>
          </MotiView>
        )}

        {/* Back to Home Button */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 600, duration: 500 }}
        >
          <TouchableOpacity 
            style={[styles.homeButton, { 
              backgroundColor: currentColors.primary,
              shadowColor: currentColors.primary,
            }]}
            activeOpacity={0.85}
            onPress={() => router.push('/')}
          >
            <MaterialCommunityIcons name="home" size={24} color={isDark ? currentColors.background : '#FFFFFF'} />
            <Text style={[styles.homeButtonText, { 
              color: isDark ? currentColors.background : '#FFFFFF' 
            }]}>
              Back to Home
            </Text>
          </TouchableOpacity>
        </MotiView>
      </ScrollView>
    </View>
  );
};

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
  refreshCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
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
  refreshHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  refreshIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshInfo: {
    flex: 1,
  },
  refreshTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  refreshSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.8,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingCard: {
    borderRadius: 20,
    padding: 30,
    marginBottom: 20,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  loadingIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  errorIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  newsCard: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sourceText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.7,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    borderRadius: 0.5,
    marginBottom: 12,
  },
  newsDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  emptyCard: {
    borderRadius: 20,
    padding: 40,
    marginBottom: 20,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  homeButton: {
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
  homeButtonText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default GymNewsScreen;