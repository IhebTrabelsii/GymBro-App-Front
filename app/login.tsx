import { Colors } from "../constants/Colors";
import { FontAwesome, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useRef, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
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
import { signInWithApple, signInWithGoogle } from "./utils/socialAuth";

const { width, height } = Dimensions.get("window");

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const isAppleSignInAvailable = (): boolean => Platform.OS === "ios";

// ── Floating particle dot ────────────────────────────────────────────────────
const Particle = ({ color, delay, x, size }: { color: string; delay: number; x: number; size: number }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const opAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const run = () => {
      anim.setValue(0);
      opAnim.setValue(0);
      Animated.parallel([
        Animated.timing(anim, { toValue: 1, duration: 4000 + delay * 600, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(opAnim, { toValue: 0.6, duration: 800, useNativeDriver: true }),
          Animated.timing(opAnim, { toValue: 0, duration: 3200 + delay * 600, useNativeDriver: true }),
        ]),
      ]).start(() => run());
    };
    const t = setTimeout(run, delay * 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <Animated.View style={{
      position: "absolute",
      left: x,
      bottom: -20,
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      opacity: opAnim,
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -(height * 0.55)] }) }],
    }} />
  );
};

export default function LoginScreen() {
  const router = useRouter();
  const { theme, toggleTheme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === "dark";

  // ── Original state (unchanged) ─────────────────────────────────────────────
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure]     = useState(true);
  const [loading, setLoading]   = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "apple" | null>(null);
  const [emailError, setEmailError]       = useState<string | null>(null);
  const [touchedEmail, setTouchedEmail]   = useState(false);

  // ── Animation refs ────────────────────────────────────────────────────────
  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const slideAnim   = useRef(new Animated.Value(60)).current;
  const logoScale   = useRef(new Animated.Value(0.5)).current;
  const logoBounce  = useRef(new Animated.Value(0)).current;
  const glowAnim    = useRef(new Animated.Value(0)).current;
  const cardSlide   = useRef(new Animated.Value(80)).current;
  const cardFade    = useRef(new Animated.Value(0)).current;
  const btnPulse    = useRef(new Animated.Value(1)).current;
  const emailShake  = useRef(new Animated.Value(0)).current;

  // ── Focus states for input highlights ────────────────────────────────────
  const [emailFocused, setEmailFocused]       = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  useEffect(() => {
    // Staggered entrance
    Animated.sequence([
      Animated.spring(logoScale, { toValue: 1, tension: 55, friction: 7, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 9, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(cardFade, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(cardSlide, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
      ]),
    ]).start();

    // Logo float
    Animated.loop(Animated.sequence([
      Animated.timing(logoBounce, { toValue: -8, duration: 2000, useNativeDriver: true }),
      Animated.timing(logoBounce, { toValue: 0, duration: 2000, useNativeDriver: true }),
    ])).start();

    // Glow pulse
    Animated.loop(Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1, duration: 2200, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0, duration: 2200, useNativeDriver: true }),
    ])).start();

    // Button pulse
    Animated.loop(Animated.sequence([
      Animated.timing(btnPulse, { toValue: 1.03, duration: 1500, useNativeDriver: true }),
      Animated.timing(btnPulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
    ])).start();
  }, []);

  const shakeEmail = () => {
    Animated.sequence([
      Animated.timing(emailShake, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(emailShake, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(emailShake, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(emailShake, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(emailShake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  // ── Original handlers (unchanged) ─────────────────────────────────────────
  const handleEmailChange = (text: string) => {
    setEmail(text);
    setTouchedEmail(true);
    if (text.trim() === "") setEmailError("Email is required");
    else if (!validateEmail(text)) setEmailError("Please enter a valid email address");
    else setEmailError(null);
  };

  type UserLoginResponse = {
    success?: boolean; token?: string;
    user?: { username?: string; role?: string; email?: string }; error?: string;
  };
  type AdminLoginResponse = {
    success?: boolean; token?: string;
    admin?: { id?: string; email?: string; lastLogin?: string }; error?: string;
  };

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert("Error", "Please enter both email and password."); return; }
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      setTouchedEmail(true);
      shakeEmail();
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const isAdminLogin = email.includes("admin") || email.endsWith("@gymbro.app");
      const endpoint = isAdminLogin
        ? "http://192.168.100.143:3000/api/admin/login"
        : "http://192.168.100.143:3000/api/users/login";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      console.log("LOGIN RESPONSE:", data);
      if (isAdminLogin) {
        const adminData = data as AdminLoginResponse;
        if (response.ok && adminData.success && adminData.token) {
          await AsyncStorage.setItem("userToken", adminData.token);
          await AsyncStorage.setItem("username", adminData.admin?.email || email);
          await AsyncStorage.setItem("userRole", "admin");
          router.replace("/admin/dashboard");
        } else {
          Alert.alert("Login Failed", adminData.error || "Invalid admin credentials.");
        }
      } else {
        const userData = data as UserLoginResponse;
        if (response.ok && userData.token) {
          await AsyncStorage.setItem("userToken", userData.token);
          await AsyncStorage.setItem("username", userData.user?.username || "");
          await AsyncStorage.setItem("userRole", userData.user?.role || "user");
          await AsyncStorage.setItem("userData", JSON.stringify(userData.user));
          router.replace("/");
        } else {
          Alert.alert("Login Failed", userData.error || "Invalid credentials.");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Network Error", "Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSocialLoading("google");
    const result = await signInWithGoogle();
    if (result.success) router.replace("/");
    else Alert.alert("Google Sign In Failed", result.error || "Something went wrong");
    setSocialLoading(null);
  };

  const handleAppleSignIn = async () => {
    setSocialLoading("apple");
    const result = await signInWithApple();
    if (result.success) router.replace("/");
    else if (result.error !== "Apple Sign In is only available on iOS devices")
      Alert.alert("Apple Sign In Failed", result.error || "Something went wrong");
    setSocialLoading(null);
  };
  // ─────────────────────────────────────────────────────────────────────────

  const isFormValid = !!email && !!password && !emailError;
  const primary = currentColors.primary;

  // Particle positions
  const particles = [
    { x: width * 0.08, size: 5, delay: 0 },
    { x: width * 0.22, size: 3, delay: 1 },
    { x: width * 0.38, size: 6, delay: 2 },
    { x: width * 0.55, size: 4, delay: 0.5 },
    { x: width * 0.70, size: 3, delay: 1.5 },
    { x: width * 0.85, size: 5, delay: 2.5 },
  ];

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>

      {/* ── Floating particles ──────────────────────────────────────────── */}
      {particles.map((p, i) => (
        <Particle key={i} color={primary} delay={p.delay} x={p.x} size={p.size} />
      ))}

      {/* ── Background radial glow ──────────────────────────────────────── */}
      <Animated.View style={[styles.bgGlow, {
        backgroundColor: primary,
        opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.04, 0.10] }),
      }]} />

      {/* ══ TOP BAR ════════════════════════════════════════════════════════ */}
      <View style={[styles.topBar, {
        backgroundColor: isDark ? "rgba(6,6,6,0.95)" : "rgba(255,255,255,0.95)",
        borderBottomColor: isDark ? primary + "18" : primary + "10",
      }]}>
        <LinearGradient
          colors={[primary + "00", primary + "60", primary + "00"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.topBarLine}
        />
        <TouchableOpacity onPress={() => router.replace("/")} activeOpacity={0.7}>
          <View style={styles.logoRow}>
            <LinearGradient colors={[primary + "35", primary + "08"]} style={styles.logoIconWrap}>
              <MaterialCommunityIcons name="dumbbell" size={17} color={primary} />
            </LinearGradient>
            <View>
              <Text style={[styles.logoText, { color: primary }]}>GymBro</Text>
              <View style={[styles.logoUnderline, { backgroundColor: primary }]} />
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={toggleTheme}
          style={[styles.themeBtn, { backgroundColor: primary, shadowColor: primary }]}
          activeOpacity={0.8}
        >
          <Ionicons name={isDark ? "sunny" : "moon"} size={15} color={isDark ? "#000" : "#fff"} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ══ HERO SECTION ════════════════════════════════════════════════ */}
          <Animated.View style={[styles.hero, {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }]}>
            {/* Glow ring behind icon */}
            <Animated.View style={[styles.heroGlowRing, {
              borderColor: primary,
              opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.55] }),
              transform: [{ scale: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }],
            }]} />

            {/* Icon */}
            <Animated.View style={[{ transform: [{ scale: logoScale }, { translateY: logoBounce }] }]}>
              <LinearGradient
                colors={[primary + "30", primary + "08"]}
                style={styles.heroIconOuter}
              >
                <LinearGradient
                  colors={[primary + "45", primary + "15"]}
                  style={styles.heroIconInner}
                >
                  <MaterialCommunityIcons name="arm-flex" size={42} color={primary} />
                </LinearGradient>
              </LinearGradient>
            </Animated.View>

            <Text style={[styles.heroTitle, { color: currentColors.text }]}>
              Welcome{"\n"}
              <Text style={{ color: primary }}>Back</Text>
            </Text>
            <Text style={[styles.heroSub, { color: isDark ? "#444" : "#bbb" }]}>
              Sign in to continue your journey
            </Text>
          </Animated.View>

          {/* ══ FORM CARD ═══════════════════════════════════════════════════ */}
          <Animated.View style={[styles.formCard, {
            backgroundColor: isDark ? "#0c0c0c" : "#fff",
            borderColor: isDark ? primary + "22" : primary + "12",
            opacity: cardFade,
            transform: [{ translateY: cardSlide }],
          }]}>
            {/* Card top accent */}
            <LinearGradient
              colors={[primary + "00", primary + "35", primary + "00"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.cardTopLine}
            />

            {/* ── Email ─────────────────────────────────────────────────── */}
            <Animated.View style={{ transform: [{ translateX: emailShake }] }}>
              <View style={styles.fieldGroup}>
                <View style={styles.fieldLabelRow}>
                  <View style={[styles.fieldIconBox, {
                    backgroundColor: emailFocused ? primary + "20" : (isDark ? "#111" : "#f5f5f5"),
                    borderColor: emailFocused ? primary + "50" : "transparent",
                  }]}>
                    <Ionicons name="mail-outline" size={15}
                      color={emailFocused ? primary : (isDark ? "#444" : "#bbb")} />
                  </View>
                  <Text style={[styles.fieldLabel, { color: isDark ? "#555" : "#bbb" }]}>EMAIL ADDRESS</Text>
                  {emailError && touchedEmail && (
                    <View style={styles.errorBadge}>
                      <Ionicons name="alert-circle" size={11} color="#FF4444" />
                      <Text style={styles.errorBadgeText}>Invalid</Text>
                    </View>
                  )}
                  {!emailError && email && (
                    <View style={[styles.validBadge, { backgroundColor: primary + "15" }]}>
                      <Ionicons name="checkmark-circle" size={11} color={primary} />
                    </View>
                  )}
                </View>
                <TextInput
                  style={[styles.fieldInput, {
                    backgroundColor: isDark ? "#111" : "#f8f8f8",
                    color: currentColors.text,
                    borderColor: emailError && touchedEmail
                      ? "#FF444450"
                      : emailFocused
                      ? primary + "55"
                      : (isDark ? "#1a1a1a" : "#ebebeb"),
                  }]}
                  placeholder="your@email.com"
                  placeholderTextColor={isDark ? "#2a2a2a" : "#ccc"}
                  value={email}
                  onChangeText={handleEmailChange}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => { setEmailFocused(false); setTouchedEmail(true); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  selectionColor={primary}
                />
                {emailError && touchedEmail && (
                  <Text style={styles.errorMsg}>{emailError}</Text>
                )}
              </View>
            </Animated.View>

            {/* ── Password ──────────────────────────────────────────────── */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <View style={[styles.fieldIconBox, {
                  backgroundColor: passwordFocused ? primary + "20" : (isDark ? "#111" : "#f5f5f5"),
                  borderColor: passwordFocused ? primary + "50" : "transparent",
                }]}>
                  <Ionicons name="lock-closed-outline" size={15}
                    color={passwordFocused ? primary : (isDark ? "#444" : "#bbb")} />
                </View>
                <Text style={[styles.fieldLabel, { color: isDark ? "#555" : "#bbb" }]}>PASSWORD</Text>
              </View>
              <View style={[styles.passwordRow, {
                backgroundColor: isDark ? "#111" : "#f8f8f8",
                borderColor: passwordFocused ? primary + "55" : (isDark ? "#1a1a1a" : "#ebebeb"),
              }]}>
                <TextInput
                  style={[styles.passwordInput, { color: currentColors.text }]}
                  placeholder="••••••••"
                  placeholderTextColor={isDark ? "#2a2a2a" : "#ccc"}
                  secureTextEntry={secure}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  selectionColor={primary}
                />
                <TouchableOpacity onPress={() => setSecure(!secure)} style={[styles.eyeBtn, { backgroundColor: isDark ? "#1a1a1a" : "#ebebeb" }]} activeOpacity={0.7}>
                  <Ionicons name={secure ? "eye-off-outline" : "eye-outline"} size={16} color={isDark ? "#555" : "#aaa"} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot password */}
            <TouchableOpacity
              style={styles.forgotRow}
              onPress={() => router.push("/forgot-password")}
              activeOpacity={0.7}
            >
              <Text style={[styles.forgotText, { color: primary }]}>Forgot Password?</Text>
              <Ionicons name="chevron-forward" size={12} color={primary} />
            </TouchableOpacity>

            {/* ── Sign In Button ────────────────────────────────────────── */}
            <Animated.View style={{ transform: [{ scale: isFormValid ? btnPulse : new Animated.Value(1) }] }}>
              <TouchableOpacity
                style={[styles.signInBtn, { shadowColor: primary, opacity: isFormValid ? 1 : 0.45 }]}
                onPress={handleLogin}
                disabled={loading || !isFormValid}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[primary, primary + "cc"]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                {/* Shimmer */}
                <Animated.View style={[styles.btnShimmer, {
                  opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.18] }),
                }]} />
                {loading ? (
                  <ActivityIndicator color={isDark ? "#000" : "#fff"} />
                ) : (
                  <>
                    <View style={[styles.btnIconWrap, { backgroundColor: "rgba(0,0,0,0.15)" }]}>
                      <Ionicons name="log-in-outline" size={18} color={isDark ? "#000" : "#fff"} />
                    </View>
                    <Text style={[styles.signInBtnText, { color: isDark ? "#000" : "#fff" }]}>Sign In</Text>
                    <View style={[styles.btnArrow, { backgroundColor: "rgba(0,0,0,0.12)" }]}>
                      <Ionicons name="arrow-forward" size={14} color={isDark ? "#000" : "#fff"} />
                    </View>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>

          {/* ══ DIVIDER ═════════════════════════════════════════════════════ */}
          <Animated.View style={[styles.dividerRow, { opacity: cardFade }]}>
            <View style={[styles.divLine, { backgroundColor: isDark ? "#1a1a1a" : "#ebebeb" }]} />
            <View style={[styles.divPill, { backgroundColor: isDark ? "#111" : "#f5f5f5", borderColor: isDark ? "#1e1e1e" : "#e8e8e8" }]}>
              <Text style={[styles.divText, { color: isDark ? "#333" : "#ccc" }]}>or continue with</Text>
            </View>
            <View style={[styles.divLine, { backgroundColor: isDark ? "#1a1a1a" : "#ebebeb" }]} />
          </Animated.View>

          {/* ══ SOCIAL CARD ═════════════════════════════════════════════════ */}
          <Animated.View style={[styles.socialCard, {
            backgroundColor: isDark ? "#0c0c0c" : "#fff",
            borderColor: isDark ? primary + "18" : primary + "0c",
            opacity: cardFade,
            transform: [{ translateY: cardSlide }],
          }]}>
            <View style={styles.socialBtns}>
              <TouchableOpacity
                style={[styles.socialBtn, {
                  backgroundColor: isDark ? "#111" : "#f8f8f8",
                  borderColor: isDark ? "#1e1e1e" : "#ebebeb",
                  flex: isAppleSignInAvailable() ? 1 : 2,
                  opacity: socialLoading === "google" ? 0.7 : 1,
                }]}
                onPress={handleGoogleSignIn}
                disabled={socialLoading !== null}
                activeOpacity={0.78}
              >
                {socialLoading === "google" ? (
                  <ActivityIndicator size="small" color={primary} />
                ) : (
                  <FontAwesome name="google" size={18} color="#DB4437" />
                )}
                <Text style={[styles.socialBtnText, { color: isDark ? "#666" : "#aaa" }]}>
                  {socialLoading === "google" ? "Signing in…" : "Google"}
                </Text>
              </TouchableOpacity>

              {isAppleSignInAvailable() && (
                <TouchableOpacity
                  style={[styles.socialBtn, {
                    backgroundColor: isDark ? "#111" : "#f8f8f8",
                    borderColor: isDark ? "#1e1e1e" : "#ebebeb",
                    flex: 1,
                    opacity: socialLoading === "apple" ? 0.7 : 1,
                  }]}
                  onPress={handleAppleSignIn}
                  disabled={socialLoading !== null}
                  activeOpacity={0.78}
                >
                  {socialLoading === "apple" ? (
                    <ActivityIndicator size="small" color={primary} />
                  ) : (
                    <FontAwesome name="apple" size={18} color={isDark ? "#fff" : "#000"} />
                  )}
                  <Text style={[styles.socialBtnText, { color: isDark ? "#666" : "#aaa" }]}>
                    {socialLoading === "apple" ? "Signing in…" : "Apple"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {!isAppleSignInAvailable() && (
              <Text style={[styles.noteText, { color: isDark ? "#2a2a2a" : "#ddd" }]}>
                Apple Sign In available on iOS
              </Text>
            )}
          </Animated.View>

          {/* ══ SIGN UP LINK ════════════════════════════════════════════════ */}
          <Animated.View style={[styles.signupRow, { opacity: cardFade }]}>
            <Text style={[styles.signupText, { color: isDark ? "#333" : "#ccc" }]}>
              Don't have an account?
            </Text>
            <TouchableOpacity onPress={() => router.push("/signup")} activeOpacity={0.7}>
              <View style={[styles.signupLink, { borderColor: primary + "40", backgroundColor: primary + "10" }]}>
                <Text style={[styles.signupLinkText, { color: primary }]}>Sign up now</Text>
                <Ionicons name="arrow-forward-circle" size={14} color={primary} />
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Version */}
          <Text style={[styles.version, { color: isDark ? "#1e1e1e" : "#e8e8e8" }]}>GymBro v1.0.0</Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, overflow: "hidden" },

  // Background glow
  bgGlow: {
    position: "absolute",
    width: width * 1.4,
    height: width * 1.4,
    borderRadius: width * 0.7,
    top: -width * 0.5,
    left: -width * 0.2,
  },

  // ── Top bar ────────────────────────────────────────────────────────────────
  topBar: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 18, paddingTop: Platform.OS === "ios" ? 52 : 42,
    paddingBottom: 13, borderBottomWidth: 1, overflow: "hidden", position: "relative",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  topBarLine: { position: "absolute", top: 0, left: 0, right: 0, height: 2 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  logoIconWrap: { width: 30, height: 30, borderRadius: 9, justifyContent: "center", alignItems: "center" },
  logoText: { fontSize: 19, fontWeight: "900", letterSpacing: 0.3 },
  logoUnderline: { height: 2, width: 20, borderRadius: 1, marginTop: 1 },
  themeBtn: {
    width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center",
    ...Platform.select({
      ios: { shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6 },
      android: { elevation: 5 },
    }),
  },

  // ── Scroll ─────────────────────────────────────────────────────────────────
  scrollContent: { paddingTop: 10, paddingHorizontal: 20, paddingBottom: 40 },

  // ── Hero ───────────────────────────────────────────────────────────────────
  hero: { alignItems: "center", paddingTop: 28, paddingBottom: 32 },
  heroGlowRing: {
    position: "absolute",
    top: 20,
    width: 130, height: 130, borderRadius: 65, borderWidth: 1.5,
  },
  heroIconOuter: {
    width: 110, height: 110, borderRadius: 55,
    justifyContent: "center", alignItems: "center", marginBottom: 22,
  },
  heroIconInner: {
    width: 86, height: 86, borderRadius: 43,
    justifyContent: "center", alignItems: "center",
  },
  heroTitle: {
    fontSize: 38, fontWeight: "900", textAlign: "center",
    letterSpacing: -1, lineHeight: 44, marginBottom: 10,
  },
  heroSub: { fontSize: 14, fontWeight: "500", textAlign: "center" },

  // ── Form card ──────────────────────────────────────────────────────────────
  formCard: {
    borderRadius: 24, padding: 20, marginBottom: 16,
    borderWidth: 1.5, overflow: "hidden", position: "relative",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.07, shadowRadius: 18 },
      android: { elevation: 4 },
    }),
  },
  cardTopLine: { position: "absolute", top: 0, left: 0, right: 0, height: 2 },

  // Field
  fieldGroup: { marginBottom: 16 },
  fieldLabelRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  fieldIconBox: {
    width: 28, height: 28, borderRadius: 9,
    justifyContent: "center", alignItems: "center", borderWidth: 1,
  },
  fieldLabel: { fontSize: 9, fontWeight: "800", letterSpacing: 1.2, flex: 1 },
  errorBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "#FF444415", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8,
  },
  errorBadgeText: { fontSize: 9, fontWeight: "700", color: "#FF4444" },
  validBadge: { width: 18, height: 18, borderRadius: 9, justifyContent: "center", alignItems: "center" },
  fieldInput: {
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14,
    fontSize: 15, fontWeight: "600", borderWidth: 1.5,
  },
  errorMsg: { color: "#FF4444", fontSize: 11, fontWeight: "600", marginTop: 5, marginLeft: 4 },

  // Password
  passwordRow: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 14, paddingHorizontal: 14, borderWidth: 1.5,
  },
  passwordInput: { flex: 1, paddingVertical: 14, fontSize: 15, fontWeight: "600" },
  eyeBtn: { width: 32, height: 32, borderRadius: 10, justifyContent: "center", alignItems: "center" },

  // Forgot
  forgotRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "flex-end",
    gap: 3, marginBottom: 18, marginTop: 4,
  },
  forgotText: { fontSize: 13, fontWeight: "700" },

  // Sign in button
  signInBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: 16, borderRadius: 20, gap: 10,
    overflow: "hidden", position: "relative",
    ...Platform.select({
      ios: { shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.38, shadowRadius: 20 },
      android: { elevation: 10 },
    }),
  },
  btnShimmer: {
    position: "absolute", top: 0, left: "-20%", width: "40%", height: "100%",
    backgroundColor: "#fff", transform: [{ skewX: "-20deg" }],
  },
  btnIconWrap: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  signInBtnText: { fontSize: 16, fontWeight: "900", letterSpacing: 0.3 },
  btnArrow: { width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center" },

  // ── Divider ────────────────────────────────────────────────────────────────
  dividerRow: { flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 10 },
  divLine: { flex: 1, height: 1 },
  divPill: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12, borderWidth: 1,
  },
  divText: { fontSize: 11, fontWeight: "600" },

  // ── Social card ────────────────────────────────────────────────────────────
  socialCard: {
    borderRadius: 20, padding: 16, marginBottom: 20,
    borderWidth: 1.5,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.04, shadowRadius: 10 },
      android: { elevation: 2 },
    }),
  },
  socialBtns: { flexDirection: "row", gap: 10 },
  socialBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: 13, borderRadius: 14, borderWidth: 1.5, gap: 8,
  },
  socialBtnText: { fontSize: 13, fontWeight: "700" },
  noteText: { fontSize: 11, textAlign: "center", marginTop: 10, fontStyle: "italic" },

  // ── Sign up row ────────────────────────────────────────────────────────────
  signupRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 },
  signupText: { fontSize: 14, fontWeight: "500" },
  signupLink: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, borderWidth: 1.5,
  },
  signupLinkText: { fontSize: 13, fontWeight: "800" },

  version: { textAlign: "center", fontSize: 10, fontWeight: "600", letterSpacing: 0.5 },
});