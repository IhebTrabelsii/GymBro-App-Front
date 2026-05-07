// app/settings/terms-of-service.tsx
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

export default function TermsOfServiceScreen() {
  const router = useRouter();
  const { theme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === "dark";

  const sections = [
    {
      title: "Acceptance of Terms",
      content: "By downloading, accessing, or using GymBro, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our application.",
    },
    {
      title: "Account Registration",
      content: "You must create an account to access certain features. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.",
    },
    {
      title: "User Responsibilities",
      content: "You agree to use GymBro only for lawful purposes and in accordance with these Terms. You are responsible for ensuring your physical readiness before attempting any workout routines. Consult a physician before starting any fitness program.",
    },
    {
      title: "AI Coach Disclaimer",
      content: "The AI Coach provides general fitness advice and should not replace professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider before making any decisions about your health.",
    },
    {
      title: "Subscription & Payments",
      content: "Certain features require a premium subscription. Subscriptions auto-renew unless canceled at least 24 hours before the end of the current period. You can manage your subscription in your app store settings.",
    },
    {
      title: "Intellectual Property",
      content: "All content, features, and functionality of GymBro, including but not limited to workout plans, exercises, and AI-generated content, are owned by GymBro and are protected by copyright laws.",
    },
    {
      title: "Limitation of Liability",
      content: "GymBro shall not be liable for any injuries, damages, or losses resulting from your use of the application. You assume full responsibility for your physical activities and wellbeing.",
    },
    {
      title: "Modifications to Service",
      content: "We reserve the right to modify, suspend, or discontinue any part of GymBro at any time, with or without notice. We may also update these Terms from time to time.",
    },
    {
      title: "Termination",
      content: "We may terminate or suspend your account immediately without notice if you violate these Terms. You may delete your account at any time through the app settings.",
    },
    {
      title: "Contact Information",
      content: "For questions about these Terms, please contact us at: legal@gymbro.app",
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
        <Text style={[styles.headerTitle, { color: currentColors.text }]}>Terms of Service</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Last Updated */}
        <View style={styles.lastUpdated}>
          <Text style={[styles.lastUpdatedText, { color: isDark ? "#777" : "#aaa" }]}>
            Effective Date: April 23, 2026
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
            Welcome to GymBro! These Terms of Service govern your use of our fitness application. Please read them carefully before using the app.
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