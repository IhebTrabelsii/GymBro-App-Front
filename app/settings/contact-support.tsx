// app/settings/contact-support.tsx
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
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
import { LinearGradient } from "expo-linear-gradient";
import { useSimpleTheme } from "../../context/SimpleThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define response types
type SupportResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

export default function ContactSupportScreen() {
  const router = useRouter();
  const { theme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === "dark";

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Load user email when component mounts
  React.useEffect(() => {
    loadUserEmail();
  }, []);

  const loadUserEmail = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const user = JSON.parse(userData);
        if (user.email) {
          setUserEmail(user.email);
        }
      }
    } catch (error) {
      console.error("Error loading user email:", error);
    }
  };

  const handleSendEmail = async () => {
    if (!subject.trim()) {
      Alert.alert("Error", "Please enter a subject");
      return;
    }
    if (!message.trim()) {
      Alert.alert("Error", "Please enter your message");
      return;
    }

    setSending(true);

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Not Logged In", "Please log in to contact support");
        router.push("/login");
        return;
      }

      const response = await fetch("https://gymbro-api-sn0e.onrender.com/api/users/contact-support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: subject,
          message: message,
        }),
      });

      const data = (await response.json()) as SupportResponse;

      if (response.ok && data.success) {
        Alert.alert(
          "Message Sent!",
          data.message || "Your support request has been sent. We'll get back to you within 24-48 hours.",
          [
            {
              text: "OK",
              onPress: () => {
                setSubject("");
                setMessage("");
                router.back();
              },
            },
          ]
        );
      } else {
        Alert.alert("Error", data.error || "Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error sending support request:", error);
      Alert.alert("Error", "Could not connect to server. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleOpenFAQ = () => {
    Alert.alert(
      "FAQ",
      "Common questions:\n\n1. How do I reset my password?\n   Go to Login → Forgot Password\n\n2. How do I upgrade to Premium?\n   Go to Premium tab in the app\n\n3. How do I earn more AI messages?\n   Complete missions in your Profile\n\n4. How do I change my body type?\n   Go to Workout → Select your type → Set Mine\n\nFor more help, please email us."
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: isDark ? "rgba(10,10,10,0.97)" : "rgba(255,255,255,0.97)",
            borderBottomColor: isDark ? "rgba(57,255,20,0.12)" : "rgba(57,255,20,0.08)",
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={currentColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentColors.text }]}>Contact Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Info Card */}
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: isDark ? "rgba(15,23,42,0.7)" : "#fff",
                borderColor: isDark ? "rgba(57,255,20,0.15)" : "rgba(57,255,20,0.08)",
              },
            ]}
          >
            <View style={styles.infoIconContainer}>
              <Ionicons name="mail" size={32} color={currentColors.primary} />
            </View>
            <Text style={[styles.infoTitle, { color: currentColors.text }]}>
              Need Help?
            </Text>
            <Text style={[styles.infoText, { color: isDark ? "#aaa" : "#666" }]}>
              Fill out the form below and we'll get back to you within 24-48 hours.
            </Text>
          </View>

          {/* Form */}
          <View
            style={[
              styles.formCard,
              {
                backgroundColor: isDark ? "rgba(15,23,42,0.5)" : "#fff",
                borderColor: isDark ? "rgba(57,255,20,0.1)" : "rgba(57,255,20,0.06)",
              },
            ]}
          >
            {/* Subject Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: isDark ? "#ccc" : "#555" }]}>
                Subject <Text style={{ color: "#FF4444" }}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5",
                    color: currentColors.text,
                    borderColor: isDark ? "#333" : "#e0e0e0",
                  },
                ]}
                placeholder="e.g., Account Issue, Billing Question, Feature Request"
                placeholderTextColor={isDark ? "#666" : "#999"}
                value={subject}
                onChangeText={setSubject}
              />
            </View>

            {/* Message Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: isDark ? "#ccc" : "#555" }]}>
                Message <Text style={{ color: "#FF4444" }}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5",
                    color: currentColors.text,
                    borderColor: isDark ? "#333" : "#e0e0e0",
                  },
                ]}
                placeholder="Describe your issue in detail..."
                placeholderTextColor={isDark ? "#666" : "#999"}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            {/* User Email Display */}
            {userEmail ? (
              <View style={styles.emailInfo}>
                <Ionicons name="information-circle" size={16} color={currentColors.primary} />
                <Text style={[styles.emailInfoText, { color: isDark ? "#777" : "#999" }]}>
                  We'll reply to: {userEmail}
                </Text>
              </View>
            ) : null}

            {/* Send Button */}
            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: currentColors.primary, opacity: sending ? 0.7 : 1 },
              ]}
              onPress={handleSendEmail}
              disabled={sending}
              activeOpacity={0.8}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <>
                  <Ionicons name="send" size={20} color="#000" />
                  <Text style={styles.sendButtonText}>Send Message</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* FAQ Section */}
          <TouchableOpacity
            style={[
              styles.faqButton,
              {
                backgroundColor: isDark ? "rgba(15,23,42,0.5)" : "#fff",
                borderColor: isDark ? "rgba(57,255,20,0.1)" : "rgba(57,255,20,0.06)",
              },
            ]}
            onPress={handleOpenFAQ}
            activeOpacity={0.8}
          >
            <View style={styles.faqLeft}>
              <View
                style={[
                  styles.faqIcon,
                  { backgroundColor: currentColors.primary + "15" },
                ]}
              >
                <Ionicons name="help-circle" size={22} color={currentColors.primary} />
              </View>
              <View>
                <Text style={[styles.faqTitle, { color: currentColors.text }]}>
                  Frequently Asked Questions
                </Text>
                <Text style={[styles.faqSubtitle, { color: isDark ? "#777" : "#aaa" }]}>
                  Check our FAQ for quick answers
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? "#555" : "#ccc"} />
          </TouchableOpacity>

          {/* Alternative Contact */}
          <View
            style={[
              styles.alternativeCard,
              {
                backgroundColor: isDark ? "rgba(15,23,42,0.3)" : "#f8f8f8",
                borderColor: isDark ? "rgba(57,255,20,0.08)" : "rgba(57,255,20,0.04)",
              },
            ]}
          >
            <Text style={[styles.alternativeTitle, { color: isDark ? "#aaa" : "#666" }]}>
              Or reach us directly at:
            </Text>
            <Text style={[styles.alternativeEmail, { color: currentColors.primary }]}>
              iheb.trabelsi.gd@gmail.com
            </Text>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  infoCard: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
  },
  infoIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(57,255,20,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  formCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
  },
  textArea: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    minHeight: 120,
  },
  emailInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
    paddingVertical: 8,
  },
  emailInfoText: {
    fontSize: 12,
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 30,
    gap: 10,
  },
  sendButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
  },
  faqButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  faqLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  faqIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  faqTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  faqSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  alternativeCard: {
    marginHorizontal: 20,
    marginTop: 8,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  alternativeTitle: {
    fontSize: 13,
    marginBottom: 8,
  },
  alternativeEmail: {
    fontSize: 16,
    fontWeight: "600",
  },
});