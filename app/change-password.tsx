import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

const API_BASE_URL = "http://192.168.100.143:3000";

// ==================== Types ====================
interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

// ==================== Main Component ====================
export default function ChangePasswordScreen() {
  const router = useRouter();
  const { theme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === "dark";

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChangePassword = async () => {
    // ========== VALIDATION ==========
    if (!currentPassword.trim()) {
      Alert.alert("Error", "Please enter your current password");
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert("Error", "Please enter a new password");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert("Error", "New password must be different from current password");
      return;
    }

    setLoading(true);

    try {
      // ========== GET TOKEN ==========
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Session Expired", "Please login again");
        router.replace("/login");
        return;
      }

      // ========== SEND REQUEST ==========
      const response = await fetch(`${API_BASE_URL}/api/users/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = (await response.json()) as ChangePasswordResponse;

      // ========== HANDLE RESPONSE ==========
      if (response.ok && data.success) {
        // Clear password fields
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        
        // Show success message
        Alert.alert(
          "✅ Success", 
          data.message || "Your password has been changed successfully",
          [
            { 
              text: "OK", 
              onPress: () => router.back() 
            }
          ]
        );
      } else {
        // Show error message from server
        Alert.alert(
          "❌ Error", 
          data.message || "Failed to change password. Please try again."
        );
      }
    } catch (error) {
      console.error("Change password error:", error);
      Alert.alert(
        "Network Error", 
        "Could not connect to server. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: isDark ? "rgba(57,255,20,0.2)" : "rgba(57,255,20,0.1)" }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={currentColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentColors.text }]}>Change Password</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Info Card */}
          <View style={[styles.infoCard, { backgroundColor: isDark ? "rgba(57,255,20,0.1)" : "rgba(57,255,20,0.05)" }]}>
            <Ionicons name="shield-checkmark-outline" size={24} color={currentColors.primary} />
            <Text style={[styles.infoText, { color: isDark ? "rgba(255,255,255,0.8)" : "#666" }]}>
              Choose a strong password you don't use elsewhere
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: isDark ? currentColors.card : "#FFFFFF" }]}>
            {/* Current Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: isDark ? "rgba(255,255,255,0.7)" : "#666" }]}>
                CURRENT PASSWORD
              </Text>
              <View style={[styles.passwordContainer, { 
                borderColor: currentPassword ? currentColors.primary : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                borderWidth: currentPassword ? 2 : 1.5,
              }]}>
                <Ionicons name="lock-closed-outline" size={20} color={currentColors.primary} />
                <TextInput
                  style={[styles.input, { color: currentColors.text }]}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "#999"}
                  secureTextEntry={!showCurrent}
                  autoComplete="off"
                  autoCapitalize="none"
                  textContentType="password"
                />
                <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                  <Ionicons 
                    name={showCurrent ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={isDark ? "rgba(255,255,255,0.5)" : "#999"} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: isDark ? "rgba(255,255,255,0.7)" : "#666" }]}>
                NEW PASSWORD
              </Text>
              <View style={[styles.passwordContainer, { 
                borderColor: newPassword ? currentColors.primary : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                borderWidth: newPassword ? 2 : 1.5,
              }]}>
                <Ionicons name="lock-closed-outline" size={20} color={currentColors.primary} />
                <TextInput
                  style={[styles.input, { color: currentColors.text }]}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "#999"}
                  secureTextEntry={!showNew}
                  autoComplete="off"
                  autoCapitalize="none"
                  textContentType="newPassword"
                />
                <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                  <Ionicons 
                    name={showNew ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={isDark ? "rgba(255,255,255,0.5)" : "#999"} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: isDark ? "rgba(255,255,255,0.7)" : "#666" }]}>
                CONFIRM NEW PASSWORD
              </Text>
              <View style={[styles.passwordContainer, { 
                borderColor: confirmPassword && newPassword === confirmPassword 
                  ? currentColors.primary 
                  : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                borderWidth: confirmPassword && newPassword === confirmPassword ? 2 : 1.5,
              }]}>
                <Ionicons name="lock-closed-outline" size={20} color={currentColors.primary} />
                <TextInput
                  style={[styles.input, { color: currentColors.text }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "#999"}
                  secureTextEntry={!showConfirm}
                  autoComplete="off"
                  autoCapitalize="none"
                  textContentType="newPassword"
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                  <Ionicons 
                    name={showConfirm ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={isDark ? "rgba(255,255,255,0.5)" : "#999"} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Password Strength Indicator */}
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBars}>
                {[1, 2, 3].map((level) => (
                  <View
                    key={level}
                    style={[
                      styles.strengthBar,
                      {
                        backgroundColor: newPassword.length >= 6
                          ? newPassword.length >= 8
                            ? newPassword.length >= 10
                              ? currentColors.primary
                              : "#FFC107"
                            : "#FF6B6B"
                          : isDark ? "rgba(255,255,255,0.1)" : "#E0E0E0",
                        opacity: level <= Math.min(3, Math.floor(newPassword.length / 3)) ? 1 : 0.3,
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={[styles.strengthText, { color: isDark ? "rgba(255,255,255,0.5)" : "#999" }]}>
                {newPassword.length === 0 && "Enter a password"}
                {newPassword.length > 0 && newPassword.length < 6 && "Too short"}
                {newPassword.length >= 6 && newPassword.length < 8 && "Weak"}
                {newPassword.length >= 8 && newPassword.length < 10 && "Good"}
                {newPassword.length >= 10 && "Strong"}
              </Text>
            </View>

            {/* Requirements Checklist */}
            <View style={styles.requirements}>
              <Text style={[styles.requirementsTitle, { color: currentColors.text }]}>
                Password requirements:
              </Text>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={newPassword.length >= 6 ? "checkmark-circle" : "ellipse-outline"} 
                  size={18} 
                  color={newPassword.length >= 6 ? currentColors.primary : isDark ? "rgba(255,255,255,0.3)" : "#999"} 
                />
                <Text style={[styles.requirementText, { color: isDark ? "rgba(255,255,255,0.6)" : "#666" }]}>
                  At least 6 characters
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={newPassword === confirmPassword && newPassword ? "checkmark-circle" : "ellipse-outline"} 
                  size={18} 
                  color={newPassword === confirmPassword && newPassword ? currentColors.primary : isDark ? "rgba(255,255,255,0.3)" : "#999"} 
                />
                <Text style={[styles.requirementText, { color: isDark ? "rgba(255,255,255,0.6)" : "#666" }]}>
                  Passwords match
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={currentPassword !== newPassword && newPassword ? "checkmark-circle" : "ellipse-outline"} 
                  size={18} 
                  color={currentPassword !== newPassword && newPassword ? currentColors.primary : isDark ? "rgba(255,255,255,0.3)" : "#999"} 
                />
                <Text style={[styles.requirementText, { color: isDark ? "rgba(255,255,255,0.6)" : "#666" }]}>
                  Different from current password
                </Text>
              </View>
            </View>
          </View>

          {/* Update Button */}
          <TouchableOpacity
            style={[
              styles.updateButton,
              { backgroundColor: currentColors.primary },
              (loading || !currentPassword || !newPassword || !confirmPassword || 
               newPassword !== confirmPassword || newPassword.length < 6 || 
               currentPassword === newPassword) && { opacity: 0.6 },
            ]}
            onPress={handleChangePassword}
            disabled={
              loading || 
              !currentPassword || 
              !newPassword || 
              !confirmPassword || 
              newPassword !== confirmPassword || 
              newPassword.length < 6 ||
              currentPassword === newPassword
            }
          >
            {loading ? (
              <ActivityIndicator color={isDark ? "#000" : "#FFF"} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color={isDark ? "#000" : "#FFF"} />
                <Text style={[styles.updateButtonText, { color: isDark ? "#000" : "#FFF" }]}>
                  Update Password
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={[styles.note, { color: isDark ? "rgba(255,255,255,0.3)" : "#CCC" }]}>
            You'll be able to login with your new password immediately
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderRadius: 14,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  strengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  strengthBars: {
    flexDirection: "row",
    gap: 6,
    flex: 1,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 12,
  },
  requirements: {
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 14,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    fontWeight: "500",
  },
  updateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 20,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  updateButtonText: {
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  note: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 16,
    fontWeight: "500",
  },
});