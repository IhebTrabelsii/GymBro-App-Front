import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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

const { width } = Dimensions.get("window");
const API_BASE_URL = "http://192.168.100.143:3000";

// ==================== Types ====================
interface UserProfile {
  username: string;
  email: string;
  fullName?: string;
  bio?: string;
  location?: string;
  birthDate?: string;
  height?: number;
  weight?: number;
  fitnessLevel?: "beginner" | "intermediate" | "advanced";
  goals?: string[];
  preferences: {
    notifications: boolean;
    privacy: "public" | "private";
  };
}

interface ProfileResponse {
  user: UserProfile;
}

interface UpdateResponse {
  user: UserProfile;
  message: string;
}

// ==================== Main Component ====================
export default function EditProfileScreen() {
  const router = useRouter();
  const { theme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === "dark";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [fitnessLevel, setFitnessLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [goals, setGoals] = useState<string[]>([]);
  const [goalInput, setGoalInput] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [privacy, setPrivacy] = useState<"public" | "private">("public");

  // Fetch current profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          router.replace("/login");
          return;
        }

        const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const data = (await res.json()) as ProfileResponse; // ✅ FIXED: Type assertion

        if (res.ok) {
          const user = data.user;
          setProfile(user);
          // Populate form
          setFullName(user.fullName || "");
          setBio(user.bio || "");
          setLocation(user.location || "");
          setHeight(user.height?.toString() || "");
          setWeight(user.weight?.toString() || "");
          setFitnessLevel(user.fitnessLevel || "beginner");
          setGoals(user.goals || []);
          setNotifications(user.preferences?.notifications ?? true);
          setPrivacy(user.preferences?.privacy || "public");
        } else {
          Alert.alert("Error", "Failed to load profile");
        }
      } catch (error) {
        Alert.alert("Network Error", "Could not connect to server");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) throw new Error("No token");

      // ✅ FIXED: Format updates to match backend expectations
      const updates = {
        fullName: fullName.trim() || undefined,
        bio: bio.trim() || undefined,
        location: location.trim() || undefined,
        height: height ? parseFloat(height) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        fitnessLevel,
        goals: goals.length > 0 ? goals : undefined,
        notifications, // ✅ Direct field - backend will map to preferences.notifications
        privacy,       // ✅ Direct field - backend will map to preferences.privacy
      };

      const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = (await res.json()) as UpdateResponse; // ✅ FIXED: Type assertion

      if (res.ok) {
        Alert.alert("Success", data.message || "Profile updated successfully");
        router.back();
      } else {
        Alert.alert("Error", (data as any).message || "Update failed");
      }
    } catch (error) {
      Alert.alert("Network Error", "Could not save changes");
    } finally {
      setSaving(false);
    }
  };

  const addGoal = () => {
    if (goalInput.trim() && goals.length < 5) {
      setGoals([...goals, goalInput.trim()]);
      setGoalInput("");
    }
  };

  const removeGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: currentColors.background }]}>
        <ActivityIndicator size="large" color={currentColors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: isDark ? "rgba(57,255,20,0.2)" : "rgba(57,255,20,0.1)" }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="close" size={24} color={currentColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentColors.text }]}>Edit Profile</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={[styles.saveButton, { opacity: saving ? 0.6 : 1 }]}
        >
          <Text style={[styles.saveText, { color: currentColors.primary }]}>
            {saving ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Avatar placeholder (for future) */}
          <View style={styles.avatarSection}>
            <View
              style={[
                styles.avatarWrapper,
                {
                  backgroundColor: isDark ? "rgba(57,255,20,0.2)" : "rgba(57,255,20,0.1)",
                  borderColor: currentColors.primary,
                },
              ]}
            >
              <Text style={[styles.avatarText, { color: currentColors.primary }]}>
                {profile?.username?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
            <Text style={[styles.avatarHint, { color: isDark ? "rgba(255,255,255,0.5)" : "#999" }]}>
              Tap to change photo (coming soon)
            </Text>
          </View>

          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Basic Information</Text>

            <View style={[styles.inputCard, { backgroundColor: isDark ? currentColors.card : "#FFFFFF" }]}>
              <View style={styles.inputRow}>
                <Text style={[styles.label, { color: isDark ? "rgba(255,255,255,0.7)" : "#666" }]}>Full Name</Text>
                <TextInput
                  style={[styles.input, { color: currentColors.text }]}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your full name"
                  placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "#999"}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.inputRow}>
                <Text style={[styles.label, { color: isDark ? "rgba(255,255,255,0.7)" : "#666" }]}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.bioInput, { color: currentColors.text }]}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Tell us about yourself"
                  placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "#999"}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.inputRow}>
                <Text style={[styles.label, { color: isDark ? "rgba(255,255,255,0.7)" : "#666" }]}>Location</Text>
                <TextInput
                  style={[styles.input, { color: currentColors.text }]}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="City, Country"
                  placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "#999"}
                />
              </View>
            </View>
          </View>

          {/* Body Metrics */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Body Metrics</Text>

            <View style={[styles.inputCard, { backgroundColor: isDark ? currentColors.card : "#FFFFFF" }]}>
              <View style={styles.metricsRow}>
                <View style={styles.metricInput}>
                  <Text style={[styles.label, { color: isDark ? "rgba(255,255,255,0.7)" : "#666" }]}>Height (cm)</Text>
                  <TextInput
                    style={[styles.metricField, { color: currentColors.text }]}
                    value={height}
                    onChangeText={setHeight}
                    placeholder="175"
                    placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "#999"}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricInput}>
                  <Text style={[styles.label, { color: isDark ? "rgba(255,255,255,0.7)" : "#666" }]}>Weight (kg)</Text>
                  <TextInput
                    style={[styles.metricField, { color: currentColors.text }]}
                    value={weight}
                    onChangeText={setWeight}
                    placeholder="70"
                    placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "#999"}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Fitness Level */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Fitness Level</Text>

            <View style={[styles.optionsCard, { backgroundColor: isDark ? currentColors.card : "#FFFFFF" }]}>
              {["beginner", "intermediate", "advanced"].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.optionItem,
                    fitnessLevel === level && {
                      backgroundColor: isDark ? "rgba(57,255,20,0.2)" : "rgba(57,255,20,0.1)",
                    },
                  ]}
                  onPress={() => setFitnessLevel(level as any)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: fitnessLevel === level ? currentColors.primary : currentColors.text,
                        fontWeight: fitnessLevel === level ? "700" : "500",
                      },
                    ]}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Goals */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Fitness Goals</Text>

            <View style={[styles.inputCard, { backgroundColor: isDark ? currentColors.card : "#FFFFFF" }]}>
              <View style={styles.goalsContainer}>
                {goals.map((goal, index) => (
                  <View key={index} style={styles.goalChip}>
                    <Text style={[styles.goalText, { color: currentColors.text }]}>{goal}</Text>
                    <TouchableOpacity onPress={() => removeGoal(index)} style={styles.removeGoal}>
                      <Ionicons name="close-circle" size={18} color={currentColors.primary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              <View style={styles.addGoalRow}>
                <TextInput
                  style={[styles.goalInput, { color: currentColors.text }]}
                  value={goalInput}
                  onChangeText={setGoalInput}
                  placeholder="Add a goal (e.g., lose weight)"
                  placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "#999"}
                  onSubmitEditing={addGoal}
                />
                <TouchableOpacity
                  style={[
                    styles.addGoalButton,
                    { backgroundColor: currentColors.primary },
                    !goalInput.trim() && { opacity: 0.5 },
                  ]}
                  onPress={addGoal}
                  disabled={!goalInput.trim()}
                >
                  <Ionicons name="add" size={20} color={isDark ? "#000" : "#FFF"} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.goalHint, { color: isDark ? "rgba(255,255,255,0.4)" : "#999" }]}>
                {goals.length}/5 goals
              </Text>
            </View>
          </View>

          {/* Preferences */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Preferences</Text>

            <View style={[styles.inputCard, { backgroundColor: isDark ? currentColors.card : "#FFFFFF" }]}>
              <TouchableOpacity style={styles.switchRow} onPress={() => setNotifications(!notifications)}>
                <Text style={[styles.switchLabel, { color: currentColors.text }]}>Enable Notifications</Text>
                <View
                  style={[
                    styles.switch,
                    {
                      backgroundColor: notifications ? currentColors.primary : isDark ? "#333" : "#E0E0E0",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.switchThumb,
                      { transform: [{ translateX: notifications ? 18 : 2 }] },
                    ]}
                  />
                </View>
              </TouchableOpacity>

              <View style={styles.divider} />

              <View style={styles.privacyRow}>
                <Text style={[styles.label, { color: currentColors.text }]}>Profile Privacy</Text>
                <View style={styles.privacyOptions}>
                  <TouchableOpacity
                    style={[
                      styles.privacyOption,
                      privacy === "public" && { backgroundColor: isDark ? "rgba(57,255,20,0.2)" : "rgba(57,255,20,0.1)" },
                    ]}
                    onPress={() => setPrivacy("public")}
                  >
                    <Text
                      style={[
                        styles.privacyText,
                        { color: privacy === "public" ? currentColors.primary : currentColors.text },
                      ]}
                    >
                      Public
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.privacyOption,
                      privacy === "private" && { backgroundColor: isDark ? "rgba(57,255,20,0.2)" : "rgba(57,255,20,0.1)" },
                    ]}
                    onPress={() => setPrivacy("private")}
                  >
                    <Text
                      style={[
                        styles.privacyText,
                        { color: privacy === "private" ? currentColors.primary : currentColors.text },
                      ]}
                    >
                      Private
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Save Button (bottom) */}
          <TouchableOpacity
            style={[
              styles.bottomSaveButton,
              { backgroundColor: currentColors.primary },
              saving && { opacity: 0.6 },
            ]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={[styles.bottomSaveText, { color: isDark ? "#000" : "#FFF" }]}>
              {saving ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: "center",
    marginVertical: 24,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 44,
    fontWeight: "800",
  },
  avatarHint: {
    fontSize: 13,
    fontWeight: "500",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  inputCard: {
    borderRadius: 20,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: "top",
    borderBottomWidth: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginVertical: 16,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metricInput: {
    flex: 1,
  },
  metricField: {
    fontSize: 18,
    fontWeight: "600",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  metricDivider: {
    width: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginHorizontal: 16,
  },
  optionsCard: {
    borderRadius: 20,
    padding: 8,
    flexDirection: "row",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  optionItem: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  optionText: {
    fontSize: 15,
    letterSpacing: 0.3,
  },
  goalsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  goalChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(57,255,20,0.1)",
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  goalText: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
  },
  removeGoal: {
    padding: 2,
  },
  addGoalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  goalInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  addGoalButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  goalHint: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: "500",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  switch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFF",
  },
  privacyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  privacyOptions: {
    flexDirection: "row",
    gap: 8,
  },
  privacyOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  privacyText: {
    fontSize: 14,
    fontWeight: "600",
  },
  bottomSaveButton: {
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 30,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  bottomSaveText: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});