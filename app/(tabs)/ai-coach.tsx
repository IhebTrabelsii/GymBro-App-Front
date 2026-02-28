import { Colors } from "@/constants/Colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  TextInput,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSimpleTheme } from "../../context/SimpleThemeContext";

const { width } = Dimensions.get("window");

// Define types
type PlanResponse = {
  success: boolean;
  plan?: string;
  premiumSince?: string;
  error?: string;
};

type UserData = {
  plan?: string;
  [key: string]: any;
};

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

type AIChatResponse = {
  success: boolean;
  reply?: string;
  error?: string;
  requiresUpgrade?: boolean;
  limit?: {
    used: number;
    total: number;
    remaining: number;
  };
};

type LimitResponse = {
  success: boolean;
  plan?: string;
  unlimited?: boolean;
  limit?: number;
  used?: number;
  remaining?: number;
  error?: string;
};

export default function AICoachTab() {
  const router = useRouter();
  const { theme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === "dark";
  const flatListRef = useRef<FlatList>(null);
  
  const [userPlan, setUserPlan] = useState<string>("free");
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [messageCount, setMessageCount] = useState({ used: 0, total: 10, remaining: 10 });
  const [showChat, setShowChat] = useState(false);

  const primaryColor = "#39FF14";

  // Load chat history from storage
  useEffect(() => {
    loadChatHistory();
  }, []);

  // Check plan and load limits
  useEffect(() => {
    checkUserPlan();
  }, []);

  // Show chat interface for premium users or free users who have started
  useEffect(() => {
    if (userPlan !== "free" && messages.length === 0) {
      // Add welcome message for premium users
      setMessages([
        {
          id: "welcome",
          text: "Hi! I'm your GymBro AI Coach. I'm here to help you crush your fitness goals! Whether you need workout plans, nutrition advice, or motivation, I've got your back. What are you working on today? 💪",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
      setShowChat(true);
    } else if (messages.length > 0) {
      setShowChat(true);
    }
  }, [userPlan, messages]);

  const loadChatHistory = async () => {
    try {
      const savedMessages = await AsyncStorage.getItem("aiChatHistory");
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        // Convert string dates back to Date objects
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(messagesWithDates);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  };

  const saveChatHistory = async (newMessages: Message[]) => {
    try {
      await AsyncStorage.setItem("aiChatHistory", JSON.stringify(newMessages));
    } catch (error) {
      console.error("Error saving chat history:", error);
    }
  };

  const checkUserPlan = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      let localUser: UserData | null = null;

      if (userData) {
        localUser = JSON.parse(userData) as UserData;
        setUserPlan(localUser.plan || "free");
      }

      const token = await AsyncStorage.getItem("userToken");
      if (token) {
        // Check plan
        const planResponse = await fetch(
          "http://192.168.100.143:3000/api/users/plan",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const planData = (await planResponse.json()) as PlanResponse;

        if (planData.success && planData.plan) {
          setUserPlan(planData.plan);
          if (localUser) {
            localUser.plan = planData.plan;
            await AsyncStorage.setItem("userData", JSON.stringify(localUser));
          }
        }

        // Check message limits
        await checkRemainingMessages();
      }
    } catch (error) {
      console.error("Error checking plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkRemainingMessages = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      const response = await fetch("http://192.168.100.143:3000/api/ai-coach/limits", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = (await response.json()) as LimitResponse;
      
      if (data.success) {
        if (data.unlimited) {
          setMessageCount({ used: 0, total: 999, remaining: 999 });
        } else {
          setMessageCount({
            used: data.used || 0,
            total: data.limit || 10,
            remaining: data.remaining || 0
          });
        }
      }
    } catch (error) {
      console.error("Error checking limits:", error);
    }
  };

  const handleUpgradePress = () => {
    router.push("/premium");
  };

const sendMessage = async (questionText?: string) => {
  const textToSend = questionText || inputText;
  
  if (!textToSend.trim() || isWaiting) return;

  // Check if free user has reached limit
  if (userPlan === "free" && messageCount.remaining <= 0) {
    Alert.alert(
      "Daily Limit Reached",
      "You've used all your free messages for today. Upgrade to Pro for unlimited access!",
      [
        { text: "Not Now", style: "cancel" },
        { text: "Upgrade Now", onPress: handleUpgradePress },
      ]
    );
    return;
  }

  // Add user message
  const userMessage: Message = {
    id: Date.now().toString(),
    text: textToSend,
    isUser: true,
    timestamp: new Date(),
  };

  const updatedMessages = [...messages, userMessage];
  setMessages(updatedMessages);
  saveChatHistory(updatedMessages);
  setInputText("");
  setIsWaiting(true);

  // Scroll to bottom
  setTimeout(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, 100);

  try {
    const token = await AsyncStorage.getItem("userToken");
    
    // 🔍 DEBUG: Check if token exists
    console.log("🔍 Token from storage:", token ? "Token exists" : "No token found");
    
    if (!token) {
      Alert.alert("Not Logged In", "Please log in to use the AI Coach");
      router.push("/login");
      return;
    }

    const response = await fetch("http://192.168.100.143:3000/api/ai-coach/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // Make sure this format is correct
      },
      body: JSON.stringify({ message: textToSend }),
    });

    console.log("🔍 Response status:", response.status);

    const data = (await response.json()) as AIChatResponse;

    if (response.ok && data.success) {
      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.reply || "I'm here to help with your fitness journey!",
        isUser: false,
        timestamp: new Date(),
      };
      
      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
      
      // Update remaining count for free users
      if (data.limit) {
        setMessageCount({
          used: data.limit.used,
          total: data.limit.total,
          remaining: data.limit.remaining
        });
      } else {
        await checkRemainingMessages();
      }
    } else {
      // Handle specific errors
      if (response.status === 401) {
        Alert.alert("Session Expired", "Please log in again");
        await AsyncStorage.multiRemove(["userToken", "userData"]);
        router.push("/login");
      } else if (data.requiresUpgrade) {
        Alert.alert(
          "Premium Feature",
          "AI Coach requires a premium subscription. Upgrade to Pro to continue!",
          [
            { text: "Not Now", style: "cancel" },
            { text: "Upgrade Now", onPress: handleUpgradePress },
          ]
        );
      } else {
        Alert.alert("Error", data.error || "Failed to get response");
      }
    }
  } catch (error) {
    console.error("🔍 Fetch error:", error);
    Alert.alert("Network Error", "Could not connect to server");
  } finally {
    setIsWaiting(false);
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }
};

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageRow,
        item.isUser ? styles.userRow : styles.aiRow,
      ]}
    >
      {!item.isUser && (
        <View style={[styles.aiAvatar, { backgroundColor: primaryColor + "20" }]}>
          <MaterialCommunityIcons name="robot" size={20} color={primaryColor} />
        </View>
      )}
      
      <View
        style={[
          styles.messageBubble,
          item.isUser
            ? [styles.userBubble, { backgroundColor: primaryColor }]
            : [styles.aiBubble, { 
                backgroundColor: isDark ? "#222" : "#F0F0F0",
                borderColor: primaryColor + "30",
              }],
        ]}
      >
        <Text
          style={[
            styles.messageText,
            item.isUser
              ? { color: "#000" }
              : { color: isDark ? "#FFF" : "#000" },
          ]}
        >
          {item.text}
        </Text>
        <Text
          style={[
            styles.timestamp,
            item.isUser
              ? { color: "#00000080" }
              : { color: isDark ? "#888" : "#666" },
          ]}
        >
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>

      {item.isUser && (
        <View style={[styles.userAvatar, { backgroundColor: primaryColor + "20" }]}>
          <Ionicons name="person" size={20} color={primaryColor} />
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: isDark ? "#000" : "#f5f5f5" },
        ]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      </View>
    );
  }

  // If no messages yet and user is free, show upgrade UI
  if (!showChat && userPlan === "free") {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: isDark ? "#000" : "#f5f5f5" },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
            <View
              style={[
                styles.aiIconContainer,
                { backgroundColor: primaryColor + "20" },
              ]}
            >
              <MaterialCommunityIcons
                name="robot"
                size={60}
                color={primaryColor}
              />
            </View>

            <Text style={[styles.title, { color: isDark ? "#FFF" : "#000" }]}>
              AI Fitness Coach
            </Text>

            <Text style={[styles.subtitle, { color: isDark ? "#888" : "#666" }]}>
              Your personal AI assistant for workout and nutrition advice
            </Text>

            {/* Message Counter for Free Users */}
            <View style={[styles.messageCounter, { backgroundColor: primaryColor + "20" }]}>
              <Ionicons name="chatbubble" size={16} color={primaryColor} />
              <Text style={[styles.counterText, { color: primaryColor }]}>
                {messageCount.used}/{messageCount.total} messages today
              </Text>
            </View>
          </Animated.View>

          {/* Upgrade Banner */}
          <Animated.View
            entering={FadeInUp.delay(200)}
            style={styles.upgradeBanner}
          >
            <View style={styles.upgradeBannerContent}>
              <MaterialCommunityIcons name="crown" size={32} color="#FFD700" />
              <Text style={styles.upgradeBannerTitle}>Unlock Unlimited Access</Text>
              <Text style={styles.upgradeBannerText}>
                Get unlimited messages, personalized workout plans, and 24/7 coaching
              </Text>
              <TouchableOpacity
                style={[
                  styles.upgradeButton,
                  { backgroundColor: primaryColor },
                ]}
                onPress={handleUpgradePress}
              >
                <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
                <Ionicons name="arrow-forward" size={18} color="#000" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Start Chatting Button */}
          {messageCount.remaining > 0 && (
            <Animated.View entering={FadeInUp.delay(300)} style={styles.startChatContainer}>
              <TouchableOpacity
                style={[styles.startChatButton, { backgroundColor: primaryColor }]}
                onPress={() => setShowChat(true)}
              >
                <Ionicons name="chatbubbles" size={20} color="#000" />
                <Text style={styles.startChatText}>Start Chatting</Text>
              </TouchableOpacity>
              <Text style={[styles.freeNote, { color: isDark ? "#888" : "#666" }]}>
                You have {messageCount.remaining} free messages remaining today
              </Text>
            </Animated.View>
          )}

          {/* Features List */}
          <Animated.View
            entering={FadeInUp.delay(400)}
            style={styles.featuresSection}
          >
            <Text
              style={[styles.featuresTitle, { color: isDark ? "#FFF" : "#000" }]}
            >
              What AI Coach can do for you:
            </Text>

            {[
              { icon: "barbell", text: "Personalized workout recommendations" },
              { icon: "restaurant", text: "Meal planning and nutrition advice" },
              { icon: "stats-chart", text: "Progress tracking and adjustments" },
              { icon: "time", text: "24/7 instant responses" },
              { icon: "calendar", text: "Workout schedule optimization" },
              { icon: "bulb", text: "Form tips and exercise guidance" },
            ].map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <Ionicons
                  name={feature.icon as any}
                  size={20}
                  color={primaryColor}
                />
                <Text
                  style={[
                    styles.featureText,
                    { color: isDark ? "#CCC" : "#666" },
                  ]}
                >
                  {feature.text}
                </Text>
              </View>
            ))}
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  // Chat Interface (for both free users who started and premium users)
  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: isDark ? "#000" : "#f5f5f5" }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* Header */}
      <View style={[styles.chatHeader, { borderBottomColor: primaryColor + "20" }]}>
        <View style={styles.chatHeaderLeft}>
          <View style={[styles.headerAvatar, { backgroundColor: primaryColor + "20" }]}>
            <MaterialCommunityIcons name="robot" size={24} color={primaryColor} />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: isDark ? "#FFF" : "#000" }]}>
              AI Coach
            </Text>
            <Text style={[styles.headerStatus, { color: primaryColor }]}>
              ● Online
            </Text>
          </View>
        </View>
        
        {/* Message Counter for Free Users */}
        {userPlan === "free" && (
          <View style={[styles.headerCounter, { backgroundColor: primaryColor + "20" }]}>
            <Text style={[styles.headerCounterText, { color: primaryColor }]}>
              {messageCount.remaining}/{messageCount.total}
            </Text>
          </View>
        )}
        
        {userPlan !== "free" && (
          <View style={[styles.premiumBadge, { backgroundColor: primaryColor + "20" }]}>
            <MaterialCommunityIcons name="crown" size={16} color={primaryColor} />
            <Text style={[styles.premiumBadgeText, { color: primaryColor }]}>
              PRO
            </Text>
          </View>
        )}
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />

      {/* Upgrade Banner for Free Users (when limit is low) */}
      {userPlan === "free" && messageCount.remaining <= 2 && messageCount.remaining > 0 && (
        <View style={styles.limitWarning}>
          <Text style={[styles.limitWarningText, { color: primaryColor }]}>
            ⚡ Only {messageCount.remaining} messages left today
          </Text>
          <TouchableOpacity onPress={handleUpgradePress}>
            <Text style={[styles.upgradeLink, { color: primaryColor }]}>Upgrade</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Input Bar */}
      <View style={[styles.inputContainer, { borderTopColor: primaryColor + "20" }]}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? "#222" : "#F0F0F0",
              color: isDark ? "#FFF" : "#000",
              borderColor: primaryColor + "30",
            },
          ]}
          placeholder="Ask me anything about fitness..."
          placeholderTextColor={isDark ? "#888" : "#666"}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          editable={!isWaiting && (userPlan !== "free" || messageCount.remaining > 0)}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: primaryColor },
            (!inputText.trim() || isWaiting || (userPlan === "free" && messageCount.remaining <= 0)) && styles.sendButtonDisabled,
          ]}
          onPress={() => sendMessage()}
          disabled={!inputText.trim() || isWaiting || (userPlan === "free" && messageCount.remaining <= 0)}
        >
          {isWaiting ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Ionicons name="send" size={20} color="#000" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  aiIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  premiumBadgeText: {
    fontSize: 14,
    fontWeight: "700",
  },
  upgradeBanner: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "rgba(57, 255, 20, 0.1)",
    borderWidth: 2,
    borderColor: "#39FF14",
  },
  upgradeBannerContent: {
    padding: 24,
    alignItems: "center",
  },
  upgradeBannerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#39FF14",
    marginTop: 12,
    marginBottom: 8,
  },
  upgradeBannerText: {
    fontSize: 14,
    color: "#FFF",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
  },
  upgradeButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
  },
  chatPreview: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  chatHeaderText: {
    fontSize: 18,
    fontWeight: "600",
  },
  sampleQuestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  questionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  questionText: {
    fontSize: 14,
  },
  chatInput: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 8,
    borderRadius: 25,
    borderWidth: 1,
  },
  chatInputText: {
    flex: 1,
    fontSize: 15,
  },
  freeNote: {
    textAlign: "center",
    marginTop: 12,
    fontSize: 13,
    fontStyle: "italic",
  },
  featuresSection: {
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: "rgba(57, 255, 20, 0.05)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(57, 255, 20, 0.2)",
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    flex: 1,
  },
  comingSoon: {
    marginHorizontal: 20,
    padding: 30,
    alignItems: "center",
    backgroundColor: "rgba(57, 255, 20, 0.05)",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(57, 255, 20, 0.3)",
    borderStyle: "dashed",
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
   messageCounter: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
    marginTop: 8,
  },
  counterText: {
    fontSize: 12,
    fontWeight: "600",
  },
  startChatContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    alignItems: "center",
  },
  startChatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    gap: 8,
    width: "100%",
  },
  startChatText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  chatHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  headerStatus: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  headerCounter: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  headerCounterText: {
    fontSize: 12,
    fontWeight: "700",
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
  },
  userRow: {
    justifyContent: "flex-end",
  },
  aiRow: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 18,
    marginHorizontal: 8,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    maxHeight: 100,
    borderWidth: 1,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  limitWarning: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 8,
  },
  limitWarningText: {
    fontSize: 13,
    fontWeight: "600",
  },
  upgradeLink: {
    fontSize: 13,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
