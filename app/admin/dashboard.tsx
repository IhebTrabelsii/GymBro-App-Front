// app/admin/dashboard.tsx - COMPLETE FIXED VERSION
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  SlideInLeft,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    users: 0,
    workouts: 0,
    news: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const scaleValue = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  useEffect(() => {
    fetchStats();
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) setUser(JSON.parse(userData));
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };
// Define the type for your dashboard response
type DashboardResponse = {
  users: number;
  workouts: number;
  news: number;
  error?: string;
};

const fetchStats = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    
    if (!token) {
      setError("No authentication token found");
      setLoading(false);
      return;
    }

    const response = await fetch("http://localhost:3000/api/admin/dashboard", {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Type assertion here
    const data = await response.json() as DashboardResponse;

    if (response.ok) {
      setStats({
        users: data.users ?? 0,
        workouts: data.workouts ?? 0,
        news: data.news ?? 0,
      });
      console.log("DASHBOARD STATS:", data);
    } else {
      setError(data.error || "Failed to fetch dashboard");
      
      if (response.status === 401) {
        Alert.alert("Session Expired", "Please login again");
        await AsyncStorage.multiRemove(["userToken", "username", "userRole"]);
        router.replace("/login");
      }
    }
  } catch (error) {
    console.error("DASHBOARD ERROR:", error);
    setError("Network error occurred");
  } finally {
    setLoading(false);
  }
};

const handleLogout = async () => {
  try {
    // ✅ Clear stored login info
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("username");
    await AsyncStorage.removeItem("userRole");

    console.log("User logged out!");

    // ✅ Redirect to login screen
    router.replace("/login");
  } catch (error) {
    console.log("Logout error:", error);
    Alert.alert("Error", "Failed to logout.");
  }
};


  const handleButtonPress = () => {
    scaleValue.value = withSpring(0.95, {}, () => {
      scaleValue.value = withSpring(1);
    });
  };

  const handleNavigation = (route: string) => {
    // Using type assertion for dynamic routes
    router.push(route as any);
  };

  if (loading) {
    return (
      <LinearGradient
        colors={["#000000", "#0a0a0a", "#000000"]}
        style={styles.loadingContainer}
      >
        <Animated.View entering={FadeInDown.duration(600)}>
          <ActivityIndicator size="large" color="#39FF14" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </Animated.View>
      </LinearGradient>
    );
  }

  const primaryColor = "#39FF14";
  const backgroundColor = "#000000";
  const cardBackground = "rgba(15, 23, 42, 0.7)";
  const textColor = "#FFFFFF";
  const secondaryTextColor = "#888888";
  const borderColor = "rgba(57, 255, 20, 0.2)";

  return (
    <LinearGradient
      colors={[backgroundColor, "#0a0a0a", backgroundColor]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.backgroundOverlay}>
        <View
          style={[
            styles.radialGradient,
            { backgroundColor: "rgba(57, 255, 20, 0.03)" },
          ]}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.contentWrapper}>
          {/* Header */}
          <Animated.View
            entering={FadeInDown.duration(600).springify()}
            style={[
              styles.headerCard,
              {
                backgroundColor: cardBackground,
                borderColor: borderColor,
              },
            ]}
          >
            <LinearGradient
              colors={["rgba(57, 255, 20, 0.1)", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFillObject}
              pointerEvents="none"
            />

            <View style={styles.headerContent}>
              <Animated.View
                entering={SlideInLeft.duration(500).delay(200)}
                style={styles.headerTextContainer}
              >
                <Text style={[styles.welcomeText, { color: textColor }]}>
                  Welcome back, {user?.username || "Admin"}! 👋
                </Text>
                <View style={styles.dateContainer}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: primaryColor },
                    ]}
                  />
                  <Text
                    style={[styles.dateText, { color: secondaryTextColor }]}
                  >
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </View>
              </Animated.View>

              <Animated.View
                entering={SlideInRight.duration(500).delay(300)}
                style={styles.headerButtons}
              >
                <Animated.View style={animatedStyle}>
                  <TouchableOpacity
                    onPressIn={handleButtonPress}
                    onPress={() =>
                      Alert.alert("Info", "Categories management coming soon!")
                    }
                    style={[
                      styles.iconButton,
                      {
                        backgroundColor: "rgba(57, 255, 20, 0.1)",
                        borderColor: "rgba(57, 255, 20, 0.3)",
                      },
                    ]}
                  >
                    <MaterialIcons
                      name="category"
                      size={20}
                      color={primaryColor}
                    />
                    <Text style={[styles.buttonText, { color: primaryColor }]}>
                      Categories
                    </Text>
                  </TouchableOpacity>
                </Animated.View>

                <Animated.View style={animatedStyle}>
                  <TouchableOpacity
                    onPressIn={handleButtonPress}
                    onPress={handleLogout}
                    style={[
                      styles.iconButton,
                      {
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                        borderColor: "rgba(239, 68, 68, 0.3)",
                      },
                    ]}
                  >
                    <Feather name="log-out" size={20} color="#ef4444" />
                    <Text style={[styles.buttonText, { color: "#ef4444" }]}>
                      Logout
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              </Animated.View>
            </View>
          </Animated.View>

          {/* Stats Grid */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(400).springify()}
            style={styles.statsSection}
          >
            <View style={styles.gridContainer}>
              {[
                {
                  title: "Total Users",
                  value: stats.users,
                  icon: "people",
                  color: primaryColor,
                },
                {
                  title: "Workout Plans",
                  value: stats.workouts,
                  icon: "barbell",
                  color: primaryColor,
                },
                {
                  title: "News Articles",
                  value: stats.news,
                  icon: "newspaper",
                  color: primaryColor,
                },
              ].map((stat, index) => (
                <Animated.View
                  key={index}
                  entering={FadeInDown.duration(500)
                    .delay(index * 100)
                    .springify()}
                  style={{ flex: 1, minWidth: width < 768 ? "100%" : "31%" }}
                >
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={[
                      styles.statCard,
                      {
                        backgroundColor: cardBackground,
                        borderColor: borderColor,
                      },
                    ]}
                    onPress={() => console.log(`View ${stat.title}`)}
                  >
                    <View
                      style={[
                        styles.progressBar,
                        { backgroundColor: "rgba(57, 255, 20, 0.1)" },
                      ]}
                    >
                      <Animated.View
                        entering={FadeInUp.duration(800).delay(index * 200)}
                        style={[
                          styles.progressFill,
                          {
                            backgroundColor: stat.color,
                            width: `${Math.min(100, (stat.value / 100) * 100)}%`,
                          },
                        ]}
                      />
                    </View>

                    <View style={styles.statIconContainer}>
                      <Ionicons
                        name={stat.icon as any}
                        size={24}
                        color={stat.color}
                      />
                    </View>

                    <Text style={[styles.statValue, { color: textColor }]}>
                      {stat.value}
                    </Text>

                    <Text
                      style={[styles.statLabel, { color: secondaryTextColor }]}
                    >
                      {stat.title}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* Error Message */}
          {error && (
            <Animated.View
              entering={FadeInUp.duration(500)}
              style={[
                styles.errorContainer,
                {
                  backgroundColor: "rgba(255, 68, 68, 0.1)",
                  borderColor: "rgba(255, 68, 68, 0.3)",
                },
              ]}
            >
              <Ionicons name="warning" size={24} color="#FF4444" />
              <Text style={[styles.errorText, { color: "#FF6B6B" }]}>
                {error}
              </Text>
              <TouchableOpacity onPress={fetchStats} style={styles.retryButton}>
                <Ionicons name="refresh" size={16} color="#FF4444" />
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Management Options */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(600).springify()}
            style={styles.managementSection}
          >
            <Text style={[styles.sectionTitle, { color: primaryColor }]}>
              Management Options
            </Text>

            {[
              {
                title: "Manage Users",
                description: "View and manage user accounts",
                icon: "people-outline",
                route: "/admin/users",
                color: primaryColor,
              },
              {
                title: "Manage Workouts",
                description: "Edit workout plans and exercises",
                icon: "fitness-outline",
                route: "/admin/workouts",
                color: primaryColor,
              },
              {
                title: "Manage News",
                description: "Add or edit fitness news",
                icon: "newspaper-outline",
                route: "/admin/news",
                color: primaryColor,
              },
            ].map((option, index) => (
              <Animated.View
                key={index}
                entering={FadeInDown.duration(400).delay(700 + index * 100)}
              >
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: cardBackground,
                      borderColor: borderColor,
                    },
                  ]}
                  onPress={() => handleNavigation(option.route)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.optionIconContainer,
                      { backgroundColor: "rgba(57, 255, 20, 0.1)" },
                    ]}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={24}
                      color={option.color}
                    />
                  </View>

                  <View style={styles.optionContent}>
                    <Text style={[styles.optionTitle, { color: textColor }]}>
                      {option.title}
                    </Text>
                    <Text
                      style={[
                        styles.optionDescription,
                        { color: secondaryTextColor },
                      ]}
                    >
                      {option.description}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={secondaryTextColor}
                  />
                </TouchableOpacity>
              </Animated.View>
            ))}
          </Animated.View>

          {/* Quick Stats Info Card */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(1000).springify()}
            style={styles.infoSection}
          >
            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: cardBackground,
                  borderColor: borderColor,
                },
              ]}
            >
              <View style={styles.infoHeader}>
                <Ionicons name="stats-chart" size={24} color={primaryColor} />
                <Text style={[styles.infoTitle, { color: textColor }]}>
                  Quick Stats
                </Text>
              </View>
              <View style={styles.infoContent}>
                <View style={styles.infoRow}>
                  <Text
                    style={[styles.infoLabel, { color: secondaryTextColor }]}
                  >
                    Active Today
                  </Text>
                  <Text style={[styles.infoValue, { color: textColor }]}>
                    124 users
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text
                    style={[styles.infoLabel, { color: secondaryTextColor }]}
                  >
                    New This Week
                  </Text>
                  <Text style={[styles.infoValue, { color: textColor }]}>
                    42 workouts
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text
                    style={[styles.infoLabel, { color: secondaryTextColor }]}
                  >
                    System Status
                  </Text>
                  <View style={styles.statusIndicator}>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: primaryColor },
                      ]}
                    />
                    <Text style={[styles.statusText, { color: primaryColor }]}>
                      All Systems Operational
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <Animated.View
        entering={FadeInUp.duration(800).delay(1200)}
        style={styles.fabContainer}
      >
        <TouchableOpacity
          style={[styles.fabButton, { backgroundColor: primaryColor }]}
          activeOpacity={0.9}
          onPress={() =>
            Alert.alert("Quick Action", "What would you like to do?")
          }
        >
          <Ionicons name="add" size={24} color={backgroundColor} />
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#39FF14",
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  radialGradient: {
    position: "absolute",
    top: -width * 0.5,
    right: -width * 0.5,
    width: width * 2,
    height: width * 2,
    borderRadius: width,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  contentWrapper: {
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },

  // Header styles
  headerCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 30,
    borderWidth: 1,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
  },
  headerTextContainer: {
    flex: 1,
    minWidth: 200,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "500",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 12,
  },
  iconButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },

  // Stats section
  statsSection: {
    marginBottom: 30,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "space-between",
  },
  statCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    position: "relative",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  progressBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderRadius: 2,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Error container
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  errorText: {
    marginLeft: 12,
    fontSize: 14,
    flex: 1,
    fontWeight: "500",
  },
  retryButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 68, 68, 0.2)",
  },

  // Management section
  managementSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
  },

  // Info section
  infoSection: {
    marginBottom: 40,
  },
  infoCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  infoContent: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },

  // FAB
  fabContainer: {
    position: "absolute",
    bottom: 30,
    right: 20,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#39FF14",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
});
