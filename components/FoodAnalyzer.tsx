// components/FoodAnalyzer.tsx
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

declare const document: any;
declare const window: any;

interface NutritionData {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize?: string;
}

interface FoodAnalyzerProps {
  onAddFood?: (food: NutritionData) => void;
  theme: any;
  currentColors: any;
  isDark: boolean;
}

interface GroqResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

export default function FoodAnalyzer({
  onAddFood,
  theme,
  currentColors,
  isDark,
}: FoodAnalyzerProps) {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [nutrition, setNutrition] = useState<NutritionData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);

  // Request permissions on mount (mobile only)
  React.useEffect(() => {
    if (Platform.OS !== "web") {
      (async () => {
        const { status: cameraStatus } =
          await ImagePicker.requestCameraPermissionsAsync();
        const { status: libraryStatus } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        console.log("Camera permission:", cameraStatus);
        console.log("Library permission:", libraryStatus);
      })();
    }
  }, []);

  // For web - upload image file directly
  const uploadImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImage(base64String);
      analyzeFood(base64String);
    };
    reader.readAsDataURL(file);
  };

  const pickImage = async () => {
    setShowOptionsModal(false);
    console.log("Pick image from gallery");

    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (file) uploadImageFile(file);
      };
      input.click();
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setImage(result.assets[0].uri);
        analyzeFood(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Gallery error:", error);
      Alert.alert("Error", "Could not open gallery");
    }
  };

  const takePhoto = async () => {
    setShowOptionsModal(false);
    console.log("Take photo with camera");

    if (Platform.OS === "web") {
      // Web fallback - use file input with capture attribute
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.capture = "environment"; // 'user' for front camera, 'environment' for back camera
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (file) uploadImageFile(file);
      };
      input.click();
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setImage(result.assets[0].uri);
        analyzeFood(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("Error", "Could not open camera. Please check permissions.");
    }
  };

  const showOptions = () => {
    console.log("Show options called");
    if (Platform.OS === "web") {
      setShowOptionsModal(true);
    } else {
      Alert.alert("Analyze Food", "Choose an option to get nutrition info", [
        { text: "📷 Take Photo", onPress: () => takePhoto() },
        { text: "🖼️ Choose from Gallery", onPress: () => pickImage() },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

const analyzeFood = async (imageUri: string) => {
  setAnalyzing(true);
  try {
    let imageBase64: string;

    if (Platform.OS === "web") {
      imageBase64 = imageUri.split(",")[1];
    } else {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const reader = new FileReader();

      imageBase64 = await new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }

    const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
    
    console.log('📸 Image base64 length:', imageBase64?.length);
    console.log('📸 Groq API Key exists:', !!apiKey);

    if (!apiKey) {
      throw new Error("Groq API key not configured");
    }

    const prompt = `Analyze this food image and return ONLY valid JSON with these fields:
- foodName: the name of the main food item (string)
- calories: estimated calories per serving (number)
- protein: estimated protein in grams (number)
- carbs: estimated carbohydrates in grams (number)
- fat: estimated fat in grams (number)

Return ONLY the JSON object, no other text. Example: {"foodName":"Grilled Chicken","calories":350,"protein":28,"carbs":15,"fat":12}`;

const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",

        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
              },
            ],
          },
        ],
        temperature: 0.3,
        max_tokens: 200,
        response_format: { type: "json_object" },
      }),
    });

    console.log('📸 Groq response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', errorText);
      throw new Error(`Groq API error: ${response.status}`);
    }

const result = (await response.json()) as GroqResponse;
const content = result.choices?.[0]?.message?.content;
    console.log('📸 Groq response content:', content);

    if (!content) {
      throw new Error("No response from Groq");
    }

    // Clean the response
    let cleanText = content;
    if (cleanText.includes("```json")) {
      cleanText = cleanText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    }
    
    const nutritionData = JSON.parse(cleanText);

    setNutrition({
      foodName: nutritionData.foodName || "Unknown Food",
      calories: nutritionData.calories || 0,
      protein: nutritionData.protein || 0,
      carbs: nutritionData.carbs || 0,
      fat: nutritionData.fat || 0,
    });
    setModalVisible(true);
    
  } catch (error) {
    console.error('📸 Analysis error:', error);
    if (Platform.OS === "web") {
      window.alert(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } else {
      Alert.alert("Error", `Failed to analyze food: ${error instanceof Error ? error.message : 'Please try again'}`);
    }
  } finally {
    setAnalyzing(false);
  }
};

  const handleAddToMeal = () => {
    if (nutrition && onAddFood) {
      onAddFood(nutrition);
    }
    setModalVisible(false);
    setImage(null);
    setNutrition(null);
  };

  return (
    <>
      {/* Camera Button */}
      <TouchableOpacity
        style={[
          styles.cameraButton,
          { backgroundColor: currentColors.primary + "15" },
        ]}
        onPress={showOptions}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[currentColors.primary, currentColors.primary + "cc"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cameraButtonGradient}
        />
        <Ionicons name="camera" size={22} color="#000" />
        <Text style={styles.cameraButtonText}>Food Scanner</Text>
      </TouchableOpacity>

      {/* Options Modal for Web */}
      <Modal
        transparent
        visible={showOptionsModal}
        animationType="fade"
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.optionsCard,
              { backgroundColor: isDark ? "#1a1a1a" : "#fff" },
            ]}
          >
            <Text style={[styles.optionsTitle, { color: currentColors.text }]}>
              Analyze Food
            </Text>
            <Text
              style={[
                styles.optionsSubtitle,
                { color: isDark ? "#888" : "#666" },
              ]}
            >
              Take a photo of your meal or upload one
            </Text>

            <TouchableOpacity style={styles.optionButton} onPress={takePhoto}>
              <View
                style={[
                  styles.optionIcon,
                  { backgroundColor: currentColors.primary + "15" },
                ]}
              >
                <Ionicons
                  name="camera"
                  size={24}
                  color={currentColors.primary}
                />
              </View>
              <View style={styles.optionTextContainer}>
                <Text
                  style={[
                    styles.optionButtonText,
                    { color: currentColors.text },
                  ]}
                >
                  Take Photo
                </Text>
                <Text
                  style={[
                    styles.optionDescription,
                    { color: isDark ? "#666" : "#999" },
                  ]}
                >
                  Use your camera to capture the meal
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionButton} onPress={pickImage}>
              <View
                style={[
                  styles.optionIcon,
                  { backgroundColor: currentColors.primary + "15" },
                ]}
              >
                <Ionicons
                  name="images"
                  size={24}
                  color={currentColors.primary}
                />
              </View>
              <View style={styles.optionTextContainer}>
                <Text
                  style={[
                    styles.optionButtonText,
                    { color: currentColors.text },
                  ]}
                >
                  Choose from Gallery
                </Text>
                <Text
                  style={[
                    styles.optionDescription,
                    { color: isDark ? "#666" : "#999" },
                  ]}
                >
                  Select an existing photo
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.cancelButton,
                { borderColor: currentColors.primary + "50" },
              ]}
              onPress={() => setShowOptionsModal(false)}
            >
              <Text
                style={[
                  styles.cancelButtonText,
                  { color: currentColors.primary },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Loading Modal */}
      <Modal transparent visible={analyzing} animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.loadingCard,
              { backgroundColor: isDark ? "#1a1a1a" : "#fff" },
            ]}
          >
            <ActivityIndicator size="large" color={currentColors.primary} />
            <Text style={[styles.loadingText, { color: currentColors.text }]}>
              Analyzing your meal...
            </Text>
            <Text
              style={[
                styles.loadingSubtext,
                { color: isDark ? "#666" : "#999" },
              ]}
            >
              AI is identifying food and calculating nutrition
            </Text>
          </View>
        </View>
      </Modal>

      {/* Results Modal */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.resultCard,
              { backgroundColor: isDark ? "#1a1a1a" : "#fff" },
            ]}
          >
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons
                name="close"
                size={24}
                color={isDark ? "#fff" : "#000"}
              />
            </TouchableOpacity>

            {image && (
              <Image
                source={{ uri: image }}
                style={styles.previewImage}
                resizeMode="cover"
              />
            )}

            {nutrition && (
              <>
                <Text
                  style={[styles.foodName, { color: currentColors.primary }]}
                >
                  {nutrition.foodName}
                </Text>

                <View style={styles.caloriesContainer}>
                  <Text
                    style={[
                      styles.caloriesValue,
                      { color: currentColors.text },
                    ]}
                  >
                    {nutrition.calories}
                  </Text>
                  <Text
                    style={[
                      styles.caloriesLabel,
                      { color: isDark ? "#666" : "#999" },
                    ]}
                  >
                    calories
                  </Text>
                </View>

                <View style={styles.macroContainer}>
                  <View style={styles.macroItem}>
                    <Text style={[styles.macroValue, { color: "#FF6B6B" }]}>
                      {nutrition.protein}g
                    </Text>
                    <Text
                      style={[
                        styles.macroLabel,
                        { color: isDark ? "#666" : "#999" },
                      ]}
                    >
                      Protein
                    </Text>
                  </View>
                  <View style={styles.macroItem}>
                    <Text style={[styles.macroValue, { color: "#FFC107" }]}>
                      {nutrition.carbs}g
                    </Text>
                    <Text
                      style={[
                        styles.macroLabel,
                        { color: isDark ? "#666" : "#999" },
                      ]}
                    >
                      Carbs
                    </Text>
                  </View>
                  <View style={styles.macroItem}>
                    <Text style={[styles.macroValue, { color: "#FF9500" }]}>
                      {nutrition.fat}g
                    </Text>
                    <Text
                      style={[
                        styles.macroLabel,
                        { color: isDark ? "#666" : "#999" },
                      ]}
                    >
                      Fat
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.addMealButton,
                    { backgroundColor: currentColors.primary },
                  ]}
                  onPress={handleAddToMeal}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#000" />
                  <Text style={styles.addMealButtonText}>Add to Meal Log</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  cameraButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 18,
    marginBottom: 12,
    paddingVertical: 12,
    borderRadius: 16,
    overflow: "hidden",
    gap: 8,
  },
  cameraButtonGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cameraButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingCard: {
    width: "80%",
    padding: 24,
    borderRadius: 24,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "700",
  },
  loadingSubtext: {
    fontSize: 12,
    textAlign: "center",
  },
  resultCard: {
    width: "85%",
    borderRadius: 28,
    padding: 20,
    alignItems: "center",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 8,
    zIndex: 1,
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 20,
    marginBottom: 16,
  },
  foodName: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 12,
    textAlign: "center",
  },
  caloriesContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginBottom: 20,
  },
  caloriesValue: {
    fontSize: 36,
    fontWeight: "900",
  },
  caloriesLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  macroContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 24,
  },
  macroItem: {
    alignItems: "center",
    gap: 4,
  },
  macroValue: {
    fontSize: 20,
    fontWeight: "800",
  },
  macroLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  addMealButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
    width: "100%",
  },
  addMealButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
  },
  optionsCard: {
    width: "80%",
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  optionsTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
  },
  optionsSubtitle: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    width: "100%",
    backgroundColor: "rgba(57,255,20,0.08)",
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  optionTextContainer: {
    flex: 1,
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  optionDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1.5,
    width: "100%",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
