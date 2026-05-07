// app/settings/privacy-policy.tsx
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSimpleTheme } from "../../context/SimpleThemeContext";

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const { theme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === "dark";

  const sections = [
    {
      title: "Information We Collect",
      content: "We collect information you provide directly to us, such as when you create an account, update your profile, use the AI Coach, or communicate with us. This may include your name, email address, fitness data, workout history, and body measurements.",
    },
    {
      title: "How We Use Your Information",
      content: "We use your information to provide, maintain, and improve GymBro services, including: personalizing workout plans, generating AI fitness advice, tracking your progress, and sending you important notifications about your account.",
    },
    {
      title: "Data Storage & Security",
      content: "Your data is stored securely on MongoDB servers with industry-standard encryption. We implement appropriate technical and organizational measures to protect your personal information against unauthorized access.",
    },
    {
      title: "AI Coach Data",
      content: "Your conversations with the AI Coach are processed by Groq API to generate responses. These interactions are not permanently stored after processing and are used only to provide you with fitness advice.",
    },
    {
      title: "Payment Information",
      content: "All payments are processed securely through Stripe. We do not store your full credit card details on our servers. Stripe handles all payment data according to PCI standards.",
    },
    {
      title: "Your Rights",
      content: "You have the right to access, correct, or delete your personal data. You can do this through the app settings or by contacting us directly.",
    },
    {
      title: "Contact Us",
      content: "If you have questions about this Privacy Policy, please contact us at: privacy@gymbro.app",
    },
  ];

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
        <Text style={[styles.headerTitle, { color: currentColors.text }]}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Last Updated */}
        <View style={styles.lastUpdated}>
          <Text style={[styles.lastUpdatedText, { color: isDark ? "#777" : "#aaa" }]}>
            Last Updated: April 23, 2026
          </Text>
        </View>

        {/* Introduction */}
        <View
          style={[
            styles.introCard,
            {
              backgroundColor: isDark ? "rgba(15,23,42,0.7)" : "#fff",
              borderColor: isDark ? "rgba(57,255,20,0.15)" : "rgba(57,255,20,0.08)",
            },
          ]}
        >
          <LinearGradient
            colors={isDark ? [currentColors.primary + "08", "transparent"] : [currentColors.primary + "05", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={[styles.introText, { color: currentColors.text }]}>
            GymBro is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our fitness application.
          </Text>
        </View>

        {/* Sections */}
        {sections.map((section, index) => (
          <View
            key={index}
            style={[
              styles.sectionCard,
              {
                backgroundColor: isDark ? "rgba(15,23,42,0.5)" : "#fff",
                borderColor: isDark ? "rgba(57,255,20,0.1)" : "rgba(57,255,20,0.06)",
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: currentColors.primary + "15" },
                ]}
              >
                <Ionicons name="document-text" size={18} color={currentColors.primary} />
              </View>
              <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
                {section.title}
              </Text>
            </View>
            <Text style={[styles.sectionContent, { color: isDark ? "#ccc" : "#555" }]}>
              {section.content}
            </Text>
          </View>
        ))}

        {/* Footer */}
        <Text style={[styles.footerText, { color: isDark ? "#333" : "#ddd" }]}>
          GymBro - Your Fitness Journey
        </Text>
      </ScrollView>
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
  lastUpdated: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 12,
  },
  lastUpdatedText: {
    fontSize: 12,
  },
  introCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  introText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
  },
  sectionCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  sectionContent: {
    fontSize: 13,
    lineHeight: 20,
    paddingLeft: 46,
  },
  footerText: {
    textAlign: "center",
    fontSize: 11,
    marginTop: 24,
    marginBottom: 20,
  },
});