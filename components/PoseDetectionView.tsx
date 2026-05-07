import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import * as VideoThumbnails from "expo-video-thumbnails";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface PoseDetectionViewProps {
  exerciseType: string;
  onResult?: (feedback: string, score: number) => void;
}

interface GroqResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

interface AnalysisResult {
  score: number;
  feedback: string;
  issues: string[];
  tips: string[];
}

const EXERCISE_CONFIG: Record<
  string,
  {
    name: string;
    instructions: string;
    checkPoints: string[];
    idealAngle?: { joint: string; min: number; max: number };
  }
> = {
  squat: {
    name: "Squat",
    instructions: "Stand sideways, lower like sitting in a chair",
    checkPoints: [
      "Knee angle ~90°",
      "Back straight",
      "Depth - thighs parallel to ground",
      "Knees NOT past toes",
      "Chest up, core braced",
    ],
    idealAngle: { joint: "knee", min: 85, max: 105 },
  },
  pushup: {
    name: "Pushup",
    instructions: "Side view, full body visible",
    checkPoints: [
      "Elbow angle ~90° at bottom",
      "Body in straight line (no sagging)",
      "Chest touches or hovers just above ground",
      "Shoulders over hands",
    ],
    idealAngle: { joint: "elbow", min: 80, max: 100 },
  },
  lunge: {
    name: "Lunge",
    instructions: "Side view, step forward",
    checkPoints: [
      "Front knee bent to 90°",
      "Back knee hovering just above ground",
      "Torso upright, not leaning forward",
      "Front knee NOT past toes",
    ],
    idealAngle: { joint: "knee", min: 80, max: 100 },
  },
  deadlift: {
    name: "Deadlift",
    instructions: "Side view, full body",
    checkPoints: [
      "Back completely straight (no rounding)",
      "Hips hinging back",
      "Shoulders over bar",
      "Bar close to shins",
    ],
    idealAngle: { joint: "hip", min: 30, max: 60 },
  },
  "bench press": {
    name: "Bench Press",
    instructions: "Side or top view",
    checkPoints: [
      "Elbows at 45° to body (not flared)",
      "Bar touches chest",
      "Controlled descent",
      "Full lockout at top",
    ],
    idealAngle: { joint: "elbow", min: 70, max: 90 },
  },
  "pull-up": {
    name: "Pull-up",
    instructions: "Side or front view",
    checkPoints: [
      "Full range of motion",
      "Chin clears bar",
      "Controlled descent (no dropping)",
      "No swinging/kicking",
    ],
  },
};

// STRICT, CRITICAL prompt for accurate scoring
const getAnalysisPrompt = (exerciseType: string): string => {
  const config = EXERCISE_CONFIG[exerciseType];
  const checkPoints = config?.checkPoints.join("\n  • ") || "Proper form";

  return `You are a VERY STRICT professional fitness coach. Analyze this exercise video frame of someone doing a ${exerciseType}.

EXPECTED FORM CHECKPOINTS:
  • ${checkPoints}

SCORING RULES (BE HARSH - MOST PEOPLE SCORE 40-60):
- Person NOT visible or too far → Score 0-15
- Major form errors (dangerous) → Score 15-35  
- Multiple form errors → Score 35-50
- Minor form issues → Score 50-70
- Good form with small improvements → Score 70-85
- Near PERFECT form (rare) → Score 85-95
- Professional/Competition level → Score 95-100

RETURN ONLY VALID JSON (no markdown, no extra text):
{
  "score": number (0-100, BE HONEST AND STRICT),
  "feedback": "string (2-3 sentences, be direct about what's wrong)",
  "issues": ["specific problem 1", "specific problem 2", "specific problem 3"],
  "tips": ["actionable fix 1", "actionable fix 2", "actionable fix 3"]
}`;
};

export default function PoseDetectionView({
  exerciseType,
  onResult,
}: PoseDetectionViewProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recordVideo = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Needed",
        "Camera access is required to check your form",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["videos"],
      allowsEditing: true,
      quality: 0.2,
      videoMaxDuration: 4,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setVideoUri(result.assets[0].uri);
      setError(null);
      analyzeVideo(result.assets[0].uri);
    }
  }, []);

  const pickVideo = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Needed", "Gallery access is required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      allowsEditing: false,
      quality: 0.3,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setVideoUri(result.assets[0].uri);
      setError(null);
      analyzeVideo(result.assets[0].uri);
    }
  }, []);

const analyzeVideo = async (uri: string) => {
  setIsAnalyzing(true);
  setFeedback("🤖 AI analyzing your form...");
  setError(null);

  try {
    const { uri: thumbnailUri } = await VideoThumbnails.getThumbnailAsync(
      uri,
      { time: 1000, quality: 0.3 }
    );

    const manipulatedImage = await ImageManipulator.manipulateAsync(
      thumbnailUri,
      [{ resize: { width: 640 } }],
      {
        compress: 0.4,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      }
    );

    const base64 = manipulatedImage.base64;
    if (!base64) throw new Error("Failed to convert image to base64");

    const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
    if (!apiKey) throw new Error("API key not configured");

    // NEW: Enhanced prompt with exercise validation
    const prompt = `You are a VERY STRICT professional fitness coach. Analyze this image.

FIRST, determine if this image shows a person exercising:
- If NO person is visible → Score: 0-10, Feedback: "No person detected", Issues: ["No person in frame"], Tips: ["Position yourself in front of camera"]

SECOND, if a person is visible, identify what exercise they are doing:
- Expected exercise: ${exerciseType}
- If they are doing a DIFFERENT exercise → Score: 0-15, Feedback: "Wrong exercise detected", Issues: ["Expected ${exerciseType} but detected different movement"], Tips: ["Select the correct exercise for analysis"]

THIRD, if they are doing the CORRECT exercise (${exerciseType}), then analyze form using these checkpoints:
${EXERCISE_CONFIG[exerciseType]?.checkPoints.map(p => `  • ${p}`).join('\n') || "  • Proper form required"}

SCORING RULES:
- No person → 0-10
- Wrong exercise → 0-15  
- Correct exercise with major errors → 15-35
- Correct exercise with multiple errors → 35-50
- Correct exercise with minor issues → 50-70
- Correct exercise with good form → 70-85
- Correct exercise with perfect form → 85-100

RETURN ONLY VALID JSON:
{
  "isPersonVisible": true/false,
  "detectedExercise": "exercise name or null",
  "isCorrectExercise": true/false,
  "score": number,
  "feedback": "string",
  "issues": ["issue1", "issue2"],
  "tips": ["tip1", "tip2"]
}`;

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
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
                  image_url: { url: `data:image/jpeg;base64,${base64}` },
                },
              ],
            },
          ],
          temperature: 0.1,
          max_tokens: 800,
        }),
      }
    );

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error("Groq API Error:", errorText);
      throw new Error(`API error: ${groqResponse.status}`);
    }

    const result = (await groqResponse.json()) as GroqResponse;
    let content = result.choices?.[0]?.message?.content;

    if (!content) throw new Error("No response from AI");

    // Clean and parse JSON
    let cleanText = content.trim();
    cleanText = cleanText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) cleanText = jsonMatch[0];

    let analysis;
    try {
      analysis = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("JSON Parse failed, raw:", cleanText.substring(0, 200));
      const scoreMatch = cleanText.match(/"score":\s*(\d+)/);
      const feedbackMatch = cleanText.match(/"feedback":\s*"([^"]+)"/);
      analysis = {
        isPersonVisible: false,
        detectedExercise: null,
        isCorrectExercise: false,
        score: scoreMatch ? parseInt(scoreMatch[1]) : 0,
        feedback: feedbackMatch ? feedbackMatch[1] : "Unable to analyze",
        issues: ["Could not analyze image properly"],
        tips: ["Please try again with a clearer video"],
      };
    }

    // Apply strict validation rules
    let finalScore = analysis.score || 0;
    let finalFeedback = "";
    let finalIssues: string[] = [];
    let finalTips: string[] = [];

    // Case 1: No person visible
    if (!analysis.isPersonVisible) {
      finalScore = Math.min(finalScore, 10);
      finalFeedback = "❌ No person detected in the video";
      finalIssues = ["No person visible in frame", "Camera may be pointing at wrong angle"];
      finalTips = [
        "Position yourself in front of the camera",
        "Make sure your full body is visible",
        "Ensure good lighting",
      ];
    }
    // Case 2: Wrong exercise detected
    else if (!analysis.isCorrectExercise) {
      finalScore = Math.min(finalScore, 15);
      finalFeedback = `❌ Wrong exercise detected. Expected: ${exerciseType}, Detected: ${analysis.detectedExercise || "unknown movement"}`;
      finalIssues = [`You are not doing ${exerciseType}`, `Detected movement: ${analysis.detectedExercise || "different exercise"}`];
      finalTips = [
        `Please select the correct exercise (${exerciseType}) for form analysis`,
        "Record yourself doing the selected exercise",
      ];
    }
    // Case 3: Correct exercise - use AI feedback
    else {
      finalScore = analysis.score || 50;
      finalFeedback = analysis.feedback || "Form analysis completed";
      finalIssues = analysis.issues || [];
      finalTips = analysis.tips || [];
      
      // Additional harshness adjustments
      if (finalScore > 70 && finalIssues.length > 1) {
        finalScore = Math.max(50, finalScore - 15);
      }
    }

    // Ensure score is in reasonable range
    finalScore = Math.min(100, Math.max(0, Math.round(finalScore)));

    setScore(finalScore);

    let formattedFeedback = finalFeedback;

    if (finalIssues.length > 0) {
      formattedFeedback += `\n\n⚠️ ISSUES:\n• ${finalIssues.join("\n• ")}`;
    }

    if (finalTips.length > 0) {
      formattedFeedback += `\n\n✅ TIPS:\n• ${finalTips.join("\n• ")}`;
    }

    setFeedback(formattedFeedback);
    onResult?.(formattedFeedback, finalScore);
  } catch (err) {
    console.error("Analysis Error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    setError(errorMessage);
    setFeedback(`❌ Analysis failed: ${errorMessage}`);
    setScore(0);
  } finally {
    setIsAnalyzing(false);
  }
};
  const resetAnalysis = useCallback(() => {
    setVideoUri(null);
    setScore(0);
    setFeedback("");
    setError(null);
  }, []);

  // Render Video Preview with Results
  if (videoUri) {
    const exerciseConfig = EXERCISE_CONFIG[exerciseType] || {
      name: exerciseType,
      instructions: "",
      checkPoints: [],
    };

    return (
      <View style={styles.container}>
        <Video
          source={{ uri: videoUri }}
          style={styles.videoPreview}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          isLooping
        />
        {isAnalyzing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#39FF14" />
            <Text style={styles.loadingTitle}>Analyzing Your Form</Text>
            <Text style={styles.loadingSubtext}>
              AI is checking your {exerciseConfig.name} technique...
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.resultContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.resultContent}
          >
            <Text style={styles.scoreLabel}>FORM SCORE</Text>
            <Text
              style={[
                styles.scoreValue,
                {
                  color:
                    score >= 80
                      ? "#39FF14"
                      : score >= 60
                      ? "#FFC107"
                      : "#FF6B6B",
                },
              ]}
            >
              {score}%
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${score}%`,
                    backgroundColor:
                      score >= 80
                        ? "#39FF14"
                        : score >= 60
                        ? "#FFC107"
                        : "#FF6B6B",
                  },
                ]}
              />
            </View>

            <View style={styles.feedbackWrapper}>
              <Text style={styles.sectionTitle}>📝 Assessment</Text>
              <Text style={styles.feedbackText}>{feedback}</Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={resetAnalysis}
              >
                <Ionicons name="refresh" size={20} color="#000" />
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
    );
  }

  // Render Camera Options
  const exerciseConfig = EXERCISE_CONFIG[exerciseType] || {
    name: exerciseType,
    instructions: "Position yourself in frame",
    checkPoints: [],
  };

  return (
    <View style={styles.container}>
      <View style={styles.instructionsCard}>
        <Ionicons name="information-circle" size={22} color="#39FF14" />
        <View style={styles.instructionsContent}>
          <Text style={styles.instructionsTitle}>
            How to {exerciseConfig.name}
          </Text>
          <Text style={styles.instructionsText}>
            {exerciseConfig.instructions}
          </Text>
          <View style={styles.checkPointsContainer}>
            {exerciseConfig.checkPoints.map((point, i) => (
              <View key={i} style={styles.checkPoint}>
                <Ionicons name="checkmark-circle" size={14} color="#39FF14" />
                <Text style={styles.checkPointText}>{point}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.recordButton} onPress={recordVideo}>
          <Ionicons name="videocam" size={28} color="#000" />
          <Text style={styles.buttonText}>Record</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.uploadButton} onPress={pickVideo}>
          <Ionicons name="cloud-upload" size={28} color="#39FF14" />
          <Text style={styles.uploadButtonText}>Upload</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.noteText}>
        📹 Record a 3-4 second video of yourself doing {exerciseConfig.name}s
      </Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

// ==================== Styles ====================
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  videoPreview: {
    width: "100%",
    height: 350,
    borderRadius: 24,
    marginBottom: 20,
    backgroundColor: "#000",
  },
  instructionsCard: {
    flexDirection: "row",
    backgroundColor: "rgba(57,255,20,0.1)",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  instructionsContent: { flex: 1 },
  instructionsTitle: {
    color: "#39FF14",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  instructionsText: {
    color: "#ccc",
    fontSize: 13,
    marginBottom: 8,
  },
  checkPointsContainer: { gap: 4 },
  checkPoint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  checkPointText: {
    color: "#aaa",
    fontSize: 11,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 16,
  },
  recordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#39FF14",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    gap: 8,
    flex: 1,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#39FF14",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    gap: 8,
    flex: 1,
  },
  uploadButtonText: { color: "#39FF14", fontSize: 16, fontWeight: "600" },
  buttonText: { color: "#000", fontSize: 16, fontWeight: "600" },
  noteText: { textAlign: "center", color: "#666", fontSize: 12 },
  loadingContainer: { alignItems: "center", padding: 24, gap: 12 },
  loadingTitle: { color: "#39FF14", fontSize: 18, fontWeight: "700" },
  loadingSubtext: { color: "#888", fontSize: 14 },
  resultContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 24,
    maxHeight: 450,
  },
  resultContent: { padding: 20 },
  scoreLabel: {
    color: "#888",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 4,
  },
  scoreValue: { fontSize: 56, fontWeight: "900" },
  progressBar: {
    width: "100%",
    height: 6,
    backgroundColor: "#333",
    borderRadius: 3,
    marginVertical: 16,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 3 },
  feedbackText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#39FF14",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 25,
    gap: 8,
  },
  retryButtonText: { color: "#000", fontSize: 14, fontWeight: "600" },
  errorText: { color: "#FF6B6B", textAlign: "center", marginTop: 12, fontSize: 12 },
  feedbackWrapper: { marginTop: 16, marginBottom: 20, width: "100%" },
  sectionTitle: {
    color: "#39FF14",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
    letterSpacing: 0.5,
  },
});