import {
  Feather,
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
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
  Animated,
} from "react-native";
import { useSimpleTheme } from "../../context/SimpleThemeContext";
import { Colors } from "../../constants/Colors";
import { LineChart, PieChart } from "react-native-chart-kit";

const { width, height } = Dimensions.get("window");

const Particle = ({
  color,
  delay,
  x,
  size,
}: {
  color: string;
  delay: number;
  x: number;
  size: number;
}) => {
  const anim = useRef(new Animated.Value(0)).current;
  const opAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const run = () => {
      anim.setValue(0);
      opAnim.setValue(0);
      Animated.parallel([
        Animated.timing(anim, {
          toValue: 1,
          duration: 4000 + delay * 600,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(opAnim, {
            toValue: 0.6,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(opAnim, {
            toValue: 0,
            duration: 3200 + delay * 600,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => run());
    };
    const t = setTimeout(run, delay * 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x,
        bottom: -20,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: opAnim,
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -(height * 0.55)],
            }),
          },
        ],
      }}
    />
  );
};

type DashboardResponse = {
  users: number;
  workouts: number;
  food: number;
  error?: string;
};

export default function AdminDashboard() {
  const router = useRouter();
  const { theme, toggleTheme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === "dark";
  const primary = currentColors.primary;

  const [stats, setStats] = useState({ users: 0, workouts: 0, food: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [activeChart, setActiveChart] = useState<"users" | "workouts">("users");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const userGrowthData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [{ data: [45, 52, 68, 85, 102, stats.users] }],
  };

  const workoutActivityData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{ data: [12, 19, 15, 17, 14, 22, stats.workouts] }],
  };

  const pieData = [
    {
      name: "Users",
      population: stats.users,
      color: primary,
      legendFontColor: isDark ? "#fff" : "#333",
      legendFontSize: 12,
    },
    {
      name: "Workouts",
      population: stats.workouts,
      color: "#FFA726",
      legendFontColor: isDark ? "#fff" : "#333",
      legendFontSize: 12,
    },
    {
      name: "Food",
      population: stats.food,
      color: "#42A5F5",
      legendFontColor: isDark ? "#fff" : "#333",
      legendFontSize: 12,
    },
  ];

  const chartConfig = {
    backgroundColor: isDark ? "#0c0c0c" : "#fff",
    backgroundGradientFrom: isDark ? "#0c0c0c" : "#fff",
    backgroundGradientTo: isDark ? "#0c0c0c" : "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => primary,
    labelColor: (opacity = 1) =>
      isDark
        ? `rgba(255, 255, 255, ${opacity * 0.7})`
        : `rgba(0, 0, 0, ${opacity * 0.7})`,
    style: { borderRadius: 16 },
    propsForDots: { r: "5", strokeWidth: "2", stroke: primary },
  };

  useEffect(() => {
    fetchStats();
    loadUserData();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 9,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2200,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) setUser(JSON.parse(userData));
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      const apiUrl =
        Platform.OS === "web"
          ? "http://localhost:3000/api/admin/dashboard"
          : "http://192.168.100.143:3000/api/admin/dashboard";

      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = (await response.json()) as DashboardResponse;

      if (response.ok) {
        setStats({
          users: data.users ?? 0,
          workouts: data.workouts ?? 0,
          food: data.food ?? 0,
        });
      } else {
        setError(data.error || "Failed to fetch dashboard");
        if (response.status === 401) {
          Alert.alert("Session Expired", "Please login again");
          await AsyncStorage.multiRemove(["userToken", "username", "userRole"]);
          router.replace("/login");
        }
      }
    } catch (error) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

const handleLogout = async () => {
  try {
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("username");
    await AsyncStorage.removeItem("userRole");
    
    console.log("User logged out!");
    
    router.replace("/login");  
    
  } catch (error) {
    console.log("Logout error:", error);
    Alert.alert("Error", "Failed to logout.");
  }
};
  const handleNavigation = (route: string) => router.push(route as any);

  const particles = [
    { x: width * 0.05, size: 4, delay: 0 },
    { x: width * 0.15, size: 3, delay: 1 },
    { x: width * 0.25, size: 5, delay: 2 },
    { x: width * 0.75, size: 3, delay: 0.5 },
    { x: width * 0.85, size: 4, delay: 1.5 },
    { x: width * 0.95, size: 3, delay: 2.5 },
  ];

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: currentColors.background },
        ]}
      >
        <ActivityIndicator size="large" color={primary} />
        <Text style={[styles.loadingText, { color: primary }]}>
          Loading dashboard...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: currentColors.background }]}
    >
      {particles.map((p, i) => (
        <Particle
          key={i}
          color={primary}
          delay={p.delay}
          x={p.x}
          size={p.size}
        />
      ))}

      <Animated.View
        style={[
          styles.bgGlow,
          {
            backgroundColor: primary,
            opacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.03, 0.08],
            }),
          },
        ]}
      />

      {}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: isDark
              ? "rgba(6,6,6,0.95)"
              : "rgba(255,255,255,0.95)",
            borderBottomColor: isDark ? primary + "18" : primary + "10",
          },
        ]}
      >
        <LinearGradient
          colors={[primary + "00", primary + "60", primary + "00"] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.topBarLine}
        />
        <TouchableOpacity
          onPress={() => router.replace("/")}
          activeOpacity={0.7}
        >
          <View style={styles.logoRow}>
            <LinearGradient
              colors={[primary + "35", primary + "08"] as const}
              style={styles.logoIconWrap}
            >
              <MaterialCommunityIcons
                name="dumbbell"
                size={17}
                color={primary}
              />
            </LinearGradient>
            <View>
              <Text style={[styles.logoText, { color: primary }]}>GymBro</Text>
              <View
                style={[styles.logoUnderline, { backgroundColor: primary }]}
              />
            </View>
          </View>
        </TouchableOpacity>
        <View style={styles.topRightSection}>
          <View
            style={[
              styles.adminBadge,
              { borderColor: primary + "30", backgroundColor: primary + "15" },
            ]}
          >
            <Text style={[styles.adminBadgeText, { color: primary }]}>
              Admin
            </Text>
          </View>
          <TouchableOpacity
            onPress={toggleTheme}
            style={[styles.themeBtn, { backgroundColor: primary }]}
          >
            <Ionicons
              name={isDark ? "sunny" : "moon"}
              size={15}
              color={isDark ? "#000" : "#fff"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          {}
          <View style={styles.welcomeSection}>
            <Text style={[styles.welcomeText, { color: currentColors.text }]}>
              Welcome back, {user?.username || "Admin"} 👋
            </Text>
            <Text
              style={[
                styles.welcomeSubtext,
                { color: isDark ? "#444" : "#bbb" },
              ]}
            >
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </View>

          {}
          <View style={styles.statsRow}>
            <TouchableOpacity
              style={[
                styles.statCard,
                {
                  backgroundColor: isDark ? "#0c0c0c" : "#fff",
                  borderColor: isDark ? primary + "22" : primary + "12",
                },
              ]}
              onPress={() => setActiveChart("users")}
            >
              <LinearGradient
                colors={[primary + "15", primary + "05"] as const}
                style={StyleSheet.absoluteFillObject}
                pointerEvents="none"
              />
              <View style={styles.statIconContainer}>
                <Ionicons name="people" size={28} color={primary} />
              </View>
              <Text style={[styles.statValue, { color: currentColors.text }]}>
                {stats.users.toLocaleString()}
              </Text>
              <Text
                style={[styles.statTitle, { color: isDark ? "#555" : "#bbb" }]}
              >
                Total Users
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.statCard,
                {
                  backgroundColor: isDark ? "#0c0c0c" : "#fff",
                  borderColor: isDark ? primary + "22" : primary + "12",
                },
              ]}
              onPress={() => setActiveChart("workouts")}
            >
              <LinearGradient
                colors={[primary + "15", primary + "05"] as const}
                style={StyleSheet.absoluteFillObject}
                pointerEvents="none"
              />
              <View style={styles.statIconContainer}>
                <Ionicons name="barbell" size={28} color={primary} />
              </View>
              <Text style={[styles.statValue, { color: currentColors.text }]}>
                {stats.workouts.toLocaleString()}
              </Text>
              <Text
                style={[styles.statTitle, { color: isDark ? "#555" : "#bbb" }]}
              >
                Workout Plans
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.statCard,
                {
                  backgroundColor: isDark ? "#0c0c0c" : "#fff",
                  borderColor: isDark ? primary + "22" : primary + "12",
                },
              ]}
            >
              <LinearGradient
                colors={[primary + "15", primary + "05"] as const}
                style={StyleSheet.absoluteFillObject}
                pointerEvents="none"
              />
              <View style={styles.statIconContainer}>
                <Ionicons name="restaurant" size={28} color={primary} />
              </View>
              <Text style={[styles.statValue, { color: currentColors.text }]}>
                {stats.food.toLocaleString()}
              </Text>
              <Text
                style={[styles.statTitle, { color: isDark ? "#555" : "#bbb" }]}
              >
                Nutrition Items
              </Text>
            </TouchableOpacity>
          </View>

          {}
          <View
            style={[
              styles.chartCard,
              {
                backgroundColor: isDark ? "#0c0c0c" : "#fff",
                borderColor: isDark ? primary + "22" : primary + "12",
              },
            ]}
          >
            <LinearGradient
              colors={[primary + "08", "transparent"] as const}
              style={StyleSheet.absoluteFillObject}
              pointerEvents="none"
            />

            <View style={styles.chartHeader}>
              <View style={styles.chartTitleRow}>
                <MaterialCommunityIcons
                  name="chart-line"
                  size={22}
                  color={primary}
                />
                <Text
                  style={[styles.chartTitle, { color: currentColors.text }]}
                >
                  Analytics
                </Text>
              </View>
              <View style={styles.chartTabs}>
                <TouchableOpacity
                  style={[
                    styles.chartTab,
                    activeChart === "users" && {
                      backgroundColor: primary + "20",
                      borderColor: primary,
                    },
                  ]}
                  onPress={() => setActiveChart("users")}
                >
                  <Text
                    style={[
                      styles.chartTabText,
                      {
                        color:
                          activeChart === "users"
                            ? primary
                            : isDark
                              ? "#888"
                              : "#aaa",
                      },
                    ]}
                  >
                    Users
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.chartTab,
                    activeChart === "workouts" && {
                      backgroundColor: primary + "20",
                      borderColor: primary,
                    },
                  ]}
                  onPress={() => setActiveChart("workouts")}
                >
                  <Text
                    style={[
                      styles.chartTabText,
                      {
                        color:
                          activeChart === "workouts"
                            ? primary
                            : isDark
                              ? "#888"
                              : "#aaa",
                      },
                    ]}
                  >
                    Activity
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {activeChart === "users" ? (
              <LineChart
                data={userGrowthData}
                width={width - 60}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                withDots={false}
                withInnerLines={false}
                withOuterLines={true}
                withVerticalLines={false}
                withHorizontalLines={true}
                formatYLabel={(value) => Math.floor(Number(value)).toString()}
              />
            ) : (
              <LineChart
                data={workoutActivityData}
                width={width - 60}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                withDots={false}
                withInnerLines={false}
                withOuterLines={true}
                withVerticalLines={false}
                withHorizontalLines={true}
                formatYLabel={(value) => Math.floor(Number(value)).toString()}
              />
            )}

            <View style={styles.pieContainer}>
              <PieChart
                data={pieData}
                width={width - 60}
                height={160}
                chartConfig={chartConfig}
                accessor={"population"}
                backgroundColor={"transparent"}
                paddingLeft={"15"}
                absolute
              />
            </View>
          </View>

          {}
          {error && (
            <View
              style={[
                styles.errorCard,
                {
                  backgroundColor: isDark ? "#0c0c0c" : "#fff",
                  borderColor: "#FF444440",
                },
              ]}
            >
              <View
                style={[styles.errorIcon, { backgroundColor: "#FF444420" }]}
              >
                <Ionicons name="warning" size={16} color="#FF4444" />
              </View>
              <Text style={[styles.errorText, { color: "#FF4444", flex: 1 }]}>
                {error}
              </Text>
              <TouchableOpacity onPress={fetchStats} style={styles.retryBtn}>
                <Ionicons name="refresh" size={18} color={primary} />
              </TouchableOpacity>
            </View>
          )}

          {}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <MaterialCommunityIcons
                name="view-dashboard"
                size={20}
                color={primary}
              />
              <Text
                style={[styles.sectionTitle, { color: currentColors.text }]}
              >
                Management
              </Text>
            </View>
            <View
              style={[styles.sectionLine, { backgroundColor: primary + "30" }]}
            />
          </View>

          {[
            {
              title: "Manage Users",
              icon: "people-outline" as const,
              route: "/admin/users",
              description: "View, edit, and manage user accounts",
            },
            {
              title: "Manage Workouts",
              icon: "fitness-outline" as const,
              route: "/admin/workouts",
              description: "Create and edit workout plans",
            },
            {
              title: "Manage Foods",
              icon: "restaurant-outline" as const,
              route: "/admin/foods",
              description: "Add, edit, or delete food items",
            },
            {
              title: "Manage Exercises",
              icon: "barbell-outline" as const,
              route: "/admin/manage-exercises",
              description: "Add, edit, or delete exercises",
            },
            {
              title: "Plan Exercises",
              icon: "swap-horizontal" as const,
              route: "/admin/manage-plan-exercises",
              description: "Link exercises to workout plans",
            },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.managementCard,
                {
                  backgroundColor: isDark ? "#0c0c0c" : "#fff",
                  borderColor: isDark ? primary + "22" : primary + "12",
                },
              ]}
              onPress={() => handleNavigation(item.route)}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.managementIcon,
                  { backgroundColor: primary + "15" },
                ]}
              >
                <Ionicons name={item.icon} size={22} color={primary} />
              </View>
              <View style={styles.managementContent}>
                <Text
                  style={[
                    styles.managementTitle,
                    { color: currentColors.text },
                  ]}
                >
                  {item.title}
                </Text>
                <Text
                  style={[
                    styles.managementDesc,
                    { color: isDark ? "#555" : "#bbb" },
                  ]}
                >
                  {item.description}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={isDark ? "#444" : "#ccc"}
              />
            </TouchableOpacity>
          ))}

          {}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <MaterialCommunityIcons
                name="lightning-bolt"
                size={20}
                color={primary}
              />
              <Text
                style={[styles.sectionTitle, { color: currentColors.text }]}
              >
                Quick Actions
              </Text>
            </View>
            <View
              style={[styles.sectionLine, { backgroundColor: primary + "30" }]}
            />
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[
                styles.actionCard,
                {
                  backgroundColor: isDark ? "#0c0c0c" : "#fff",
                  borderColor: isDark ? primary + "22" : primary + "12",
                },
              ]}
              onPress={() =>
                Alert.alert("Coming Soon", "Export feature coming soon!")
              }
            >
              <View
                style={[styles.actionIcon, { backgroundColor: primary + "10" }]}
              >
                <Ionicons name="download-outline" size={22} color={primary} />
              </View>
              <Text style={[styles.actionText, { color: currentColors.text }]}>
                Export Data
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionCard,
                {
                  backgroundColor: isDark ? "#0c0c0c" : "#fff",
                  borderColor: isDark ? primary + "22" : primary + "12",
                },
              ]}
              onPress={() =>
                Alert.alert("Coming Soon", "Reports feature coming soon!")
              }
            >
              <View
                style={[styles.actionIcon, { backgroundColor: primary + "10" }]}
              >
                <Ionicons
                  name="document-text-outline"
                  size={22}
                  color={primary}
                />
              </View>
              <Text style={[styles.actionText, { color: currentColors.text }]}>
                Generate Report
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionCard,
                {
                  backgroundColor: isDark ? "#0c0c0c" : "#fff",
                  borderColor: isDark ? primary + "22" : primary + "12",
                },
              ]}
              onPress={fetchStats}
            >
              <View
                style={[styles.actionIcon, { backgroundColor: primary + "10" }]}
              >
                <Ionicons name="refresh-outline" size={22} color={primary} />
              </View>
              <Text style={[styles.actionText, { color: currentColors.text }]}>
                Refresh
              </Text>
            </TouchableOpacity>
          </View>

          {}
          <TouchableOpacity
            style={[styles.logoutButton, { borderColor: "#FF444460" }]}
            onPress={handleLogout}
          >
            <LinearGradient
              colors={["#FF444415", "#FF444408"] as const}
              style={StyleSheet.absoluteFillObject}
              pointerEvents="none"
            />
            <Ionicons name="log-out-outline" size={20} color="#FF4444" />
            <Text style={[styles.logoutText, { color: "#FF4444" }]}>
              Logout
            </Text>
          </TouchableOpacity>

          <Text
            style={[styles.version, { color: isDark ? "#1e1e1e" : "#e8e8e8" }]}
          >
            GymBro Admin Dashboard v1.0.0
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: "hidden" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, fontSize: 16, fontWeight: "600" },
  bgGlow: {
    position: "absolute",
    width: width * 1.4,
    height: width * 1.4,
    borderRadius: width * 0.7,
    top: -width * 0.5,
    left: -width * 0.2,
  },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "web" ? 20 : Platform.OS === "ios" ? 52 : 42,
    paddingBottom: 16,
    borderBottomWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  topBarLine: { position: "absolute", top: 0, left: 0, right: 0, height: 2 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: { fontSize: 20, fontWeight: "900", letterSpacing: 0.3 },
  logoUnderline: { height: 2, width: 22, borderRadius: 1, marginTop: 1 },
  topRightSection: { flexDirection: "row", alignItems: "center", gap: 12 },
  adminBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 22,
    borderWidth: 1,
  },
  adminBadgeText: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
  themeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 20 },
  welcomeSection: { marginBottom: 28, paddingTop: 8 },
  welcomeText: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  welcomeSubtext: { fontSize: 14, fontWeight: "500" },

  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 60) / 3 - 10,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    overflow: "hidden",
    alignItems: "center",
  },
  statIconContainer: { marginBottom: 12 },
  statValue: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 4,
    textAlign: "center",
  },
  statTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    textAlign: "center",
  },

  chartCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 10,
  },
  chartTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  chartTitle: { fontSize: 18, fontWeight: "700", letterSpacing: 0.3 },
  chartTabs: { flexDirection: "row", gap: 8 },
  chartTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "transparent",
  },
  chartTabText: { fontSize: 13, fontWeight: "600" },
  chart: { borderRadius: 16, marginVertical: 8, alignSelf: "center" },
  pieContainer: {
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(57, 255, 20, 0.1)",
  },

  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1.5,
  },
  errorIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  errorText: { fontSize: 13, fontWeight: "600" },
  retryBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  sectionHeader: { marginBottom: 16, marginTop: 8 },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", letterSpacing: 0.3 },
  sectionLine: { height: 2, width: 50, borderRadius: 1 },

  managementCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
  },
  managementIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  managementContent: { flex: 1 },
  managementTitle: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  managementDesc: { fontSize: 12, fontWeight: "500" },

  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 28,
  },
  actionCard: {
    flex: 1,
    minWidth: (width - 60) / 3 - 10,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    borderWidth: 1.5,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: { fontSize: 13, fontWeight: "600" },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 20,
  },
  logoutText: { fontSize: 15, fontWeight: "700" },
  version: {
    textAlign: "center",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginTop: 10,
  },
});
