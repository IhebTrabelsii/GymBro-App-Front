import { Colors } from "@/constants/Colors";
import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSimpleTheme } from "../context/SimpleThemeContext";

Dimensions.get("window");

export default function LoginScreen() {
  const router = useRouter();
  const { theme, toggleTheme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  

const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert("Error", "Please enter both email and password.");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch("http://localhost:3000/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = (await response.json()) as {
      success?: boolean;
      token?: string;
      user?: {
        username?: string;
        role?: string;
      };
      error?: string;
    };

    console.log("LOGIN RESPONSE:", data);

    if (response.ok && data.token && data.user) {
      const role = data.user.role || "user";

      await AsyncStorage.setItem("userToken", data.token);
      await AsyncStorage.setItem("username", data.user.username || "");
      await AsyncStorage.setItem("userRole", role);

      // ✅ Redirect correctly
      if (role === "admin") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/");
      }
    } else {
      Alert.alert("Login Failed", data.error || "Invalid credentials.");
    }
  } catch (error) {
    Alert.alert("Network Error", "Failed to connect to the server.");
  } finally {
    setLoading(false);
  }
};





  return (
    <View
      style={[styles.container, { backgroundColor: currentColors.background }]}
    >
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: isDark ? currentColors.background : "#FFFFFF",
            borderBottomColor: isDark
              ? currentColors.border
              : "rgba(57, 255, 20, 0.15)",
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.replace("/")}
          activeOpacity={0.7}
        >
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons
              name="dumbbell"
              size={28}
              color={currentColors.primary}
            />
            <Text style={[styles.logo, { color: currentColors.primary }]}>
              GymBro
            </Text>
          </View>
        </TouchableOpacity>


        <TouchableOpacity
          onPress={toggleTheme}
          style={[
            styles.themeToggle,
            {
              backgroundColor: currentColors.primary,
              shadowColor: currentColors.primary,
            },
          ]}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isDark ? "sunny" : "moon"}
            size={20}
            color={isDark ? currentColors.background : "#FFFFFF"}
          />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
     

          {/* Login Form */}
          <View>
            <View
              style={[
                styles.formCard,
                {
                  backgroundColor: isDark ? currentColors.card : "#FFFFFF",
                  borderColor: isDark
                    ? "rgba(57, 255, 20, 0.3)"
                    : "rgba(57, 255, 20, 0.15)",
                  shadowColor: isDark ? currentColors.primary : "#000",
                },
              ]}
            >
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <View style={styles.inputLabelContainer}>
                  <View
                    style={[
                      styles.inputIcon,
                      {
                        backgroundColor: isDark
                          ? "rgba(57, 255, 20, 0.2)"
                          : "rgba(57, 255, 20, 0.1)",
                      },
                    ]}
                  >
                    <Ionicons
                      name="mail"
                      size={18}
                      color={currentColors.primary}
                    />
                  </View>
                  <Text
                    style={[styles.inputLabel, { color: currentColors.text }]}
                  >
                    Email Address
                  </Text>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark
                        ? currentColors.background
                        : "#F8F9FA",
                      color: currentColors.text,
                      borderColor: isDark ? currentColors.border : "#E0E0E0",
                    },
                  ]}
                  placeholder="Enter your email"
                  placeholderTextColor={isDark ? "#999" : "#888"}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <View style={styles.inputLabelContainer}>
                  <View
                    style={[
                      styles.inputIcon,
                      {
                        backgroundColor: isDark
                          ? "rgba(57, 255, 20, 0.2)"
                          : "rgba(57, 255, 20, 0.1)",
                      },
                    ]}
                  >
                    <Ionicons
                      name="lock-closed"
                      size={18}
                      color={currentColors.primary}
                    />
                  </View>
                  <Text
                    style={[styles.inputLabel, { color: currentColors.text }]}
                  >
                    Password
                  </Text>
                </View>
                <View
                  style={[
                    styles.passwordContainer,
                    {
                      backgroundColor: isDark
                        ? currentColors.background
                        : "#F8F9FA",
                      borderColor: isDark ? currentColors.border : "#E0E0E0",
                    },
                  ]}
                >
                  <TextInput
                    style={[
                      styles.passwordInput,
                      { color: currentColors.text },
                    ]}
                    placeholder="Enter your password"
                    placeholderTextColor={isDark ? "#999" : "#888"}
                    secureTextEntry={secure}
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setSecure(!secure)}
                    style={styles.eyeButton}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={secure ? "eye-off" : "eye"}
                      size={20}
                      color={isDark ? "#999" : "#666"}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login Button */}
              <View>
                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    {
                      backgroundColor: currentColors.primary,
                      shadowColor: currentColors.primary,
                    },
                  ]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator
                      color={isDark ? currentColors.background : "#FFFFFF"}
                    />
                  ) : (
                    <>
                      <Text
                        style={[
                          styles.loginButtonText,
                          {
                            color: isDark
                              ? currentColors.background
                              : "#FFFFFF",
                          },
                        ]}
                      >
                        Sign In
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={20}
                        color={isDark ? currentColors.background : "#FFFFFF"}
                      />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Divider */}
          <View>
            <View style={styles.dividerContainer}>
              <View
                style={[
                  styles.divider,
                  {
                    backgroundColor: isDark ? currentColors.border : "#E0E0E0",
                  },
                ]}
              />
              <Text
                style={[
                  styles.dividerText,
                  {
                    color: isDark ? currentColors.text : "#666",
                  },
                ]}
              >
                Or continue with
              </Text>
              <View
                style={[
                  styles.divider,
                  {
                    backgroundColor: isDark ? currentColors.border : "#E0E0E0",
                  },
                ]}
              />
            </View>
          </View>

          {/* Social Login */}
          <View>
            <View
              style={[
                styles.socialCard,
                {
                  backgroundColor: isDark ? currentColors.card : "#FFFFFF",
                  borderColor: isDark
                    ? "rgba(57, 255, 20, 0.3)"
                    : "rgba(57, 255, 20, 0.15)",
                  shadowColor: isDark ? currentColors.primary : "#000",
                },
              ]}
            >
              <Text style={[styles.socialTitle, { color: currentColors.text }]}>
                Social Login
              </Text>
              <View style={styles.socialButtons}>
                <TouchableOpacity
                  style={[
                    styles.socialButton,
                    {
                      backgroundColor: isDark
                        ? currentColors.background
                        : "#F8F9FA",
                      borderColor: isDark ? currentColors.border : "#E0E0E0",
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <FontAwesome name="google" size={22} color="#DB4437" />
                  <Text
                    style={[
                      styles.socialButtonText,
                      { color: currentColors.text },
                    ]}
                  >
                    Google
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.socialButton,
                    {
                      backgroundColor: isDark
                        ? currentColors.background
                        : "#F8F9FA",
                      borderColor: isDark ? currentColors.border : "#E0E0E0",
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <FontAwesome
                    name="apple"
                    size={22}
                    color={currentColors.text}
                  />
                  <Text
                    style={[
                      styles.socialButtonText,
                      { color: currentColors.text },
                    ]}
                  >
                    Apple
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Sign Up Link */}
          <View>
            <View style={styles.signupContainer}>
              <Text
                style={[
                  styles.signupText,
                  { color: isDark ? currentColors.text : "#666" },
                ]}
              >
                Don't have an account?
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/signup")}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.signupLink, { color: currentColors.primary }]}
                >
                  Sign up now
                </Text>
              </TouchableOpacity>
            </View>
          </View>


        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 16,
    borderBottomWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
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
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logo: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  themeToggle: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 40,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
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
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  backText: {
    fontWeight: "600",
    fontSize: 14,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
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
    alignItems: "center",
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: 0.3,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: "500",
    opacity: 0.8,
    textAlign: "center",
  },
  formCard: {
    borderRadius: 20,
    padding: 24,
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
  inputGroup: {
    marginBottom: 20,
  },
  inputLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  inputIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  input: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    fontSize: 15,
    fontWeight: "500",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 15,
    fontWeight: "500",
  },
  eyeButton: {
    padding: 4,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
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
  loginButtonText: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    borderRadius: 0.5,
  },
  dividerText: {
    fontSize: 14,
    fontWeight: "500",
    marginHorizontal: 16,
    opacity: 0.7,
  },
  socialCard: {
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
  socialTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    gap: 6,
  },
  signupText: {
    fontSize: 15,
    fontWeight: "500",
  },
  signupLink: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  homeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  homeButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
