import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSimpleTheme } from "../../context/SimpleThemeContext";

const { width: SCREEN_W } = Dimensions.get("window");
const STORAGE_KEY = "gymBro_weeklySchedule";

const DAYS = [
  {
    key: "mon",
    label: "Monday",
    short: "M",
    full: "MON",
    emoji: "🔥",
    tag: "STRENGTH",
  },
  {
    key: "tue",
    label: "Tuesday",
    short: "T",
    full: "TUE",
    emoji: "🚴",
    tag: "CARDIO",
  },
  {
    key: "wed",
    label: "Wednesday",
    short: "W",
    full: "WED",
    emoji: "💪",
    tag: "PUSH",
  },
  {
    key: "thu",
    label: "Thursday",
    short: "T",
    full: "THU",
    emoji: "🦵",
    tag: "PULL",
  },
  {
    key: "fri",
    label: "Friday",
    short: "F",
    full: "FRI",
    emoji: "⚡",
    tag: "HIIT",
  },
  {
    key: "sat",
    label: "Saturday",
    short: "S",
    full: "SAT",
    emoji: "🏃",
    tag: "ACTIVE",
  },
  {
    key: "sun",
    label: "Sunday",
    short: "S",
    full: "SUN",
    emoji: "😴",
    tag: "REST",
  },
] as const;

type DayKey = (typeof DAYS)[number]["key"];
type Schedule = Record<DayKey, string>;

const EMPTY: Schedule = {
  mon: "",
  tue: "",
  wed: "",
  thu: "",
  fri: "",
  sat: "",
  sun: "",
};

// ─────────────────────────────────────────────────────────────────────────────
// Animated Day Number Indicator (the vertical sidebar)
// ─────────────────────────────────────────────────────────────────────────────
function DayNumber({
  index,
  filled,
  primary,
}: {
  index: number;
  filled: boolean;
  primary: string;
}) {
  return (
    <View style={sideStyles.container}>
      <View
        style={[
          sideStyles.line,
          { backgroundColor: filled ? primary : "#222" },
        ]}
      />
      <View
        style={[
          sideStyles.circle,
          {
            backgroundColor: filled ? primary : "transparent",
            borderColor: filled ? primary : "#333",
          },
        ]}
      >
        <Text style={[sideStyles.num, { color: filled ? "#000" : "#444" }]}>
          {String(index + 1).padStart(2, "0")}
        </Text>
      </View>
      <View
        style={[
          sideStyles.line,
          {
            backgroundColor:
              index < 6 ? (filled ? primary + "40" : "#1a1a1a") : "transparent",
          },
        ]}
      />
    </View>
  );
}

const sideStyles = StyleSheet.create({
  container: { alignItems: "center", width: 36, paddingTop: 2 },
  line: { width: 1.5, height: 14, marginBottom: 4 },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  num: { fontSize: 9, fontWeight: "900", letterSpacing: 0.5 },
});

// ─────────────────────────────────────────────────────────────────────────────
// Stat Pill
// ─────────────────────────────────────────────────────────────────────────────
function StatPill({
  value,
  label,
  primary,
}: {
  value: string | number;
  label: string;
  primary: string;
}) {
  return (
    <View style={pillStyles.wrap}>
      <Text style={[pillStyles.value, { color: primary }]}>{value}</Text>
      <Text style={pillStyles.label}>{label}</Text>
    </View>
  );
}

const pillStyles = StyleSheet.create({
  wrap: { alignItems: "center", flex: 1 },
  value: { fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
  label: {
    fontSize: 9,
    fontWeight: "700",
    color: "#444",
    letterSpacing: 1.2,
    marginTop: 2,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────────────────────
export default function ScheduleScreen() {
  const { theme } = useSimpleTheme();
  const colors = Colors[theme];
  const isDark = theme === "dark";
  const router = useRouter();
  const primary = colors.primary;

  const [schedule, setSchedule] = useState<Schedule>(EMPTY);
  const [editing, setEditing] = useState<DayKey | null>(null);
  const [saved, setSaved] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // ── load ──────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setSchedule({ ...EMPTY, ...JSON.parse(raw) });
      } catch {}
    })();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ── pulse on save ──────────────────────────────────────────────────────
  const triggerPulse = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 0.95,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // ── save ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    triggerPulse();
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
      setSaved(true);
      setEditing(null);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      Alert.alert("Error", "Could not save schedule.");
    }
  };

  // ── reset all fields ───────────────────────────────────────────────────
  const handleReset = () => {
    Alert.alert(
      "Reset Schedule",
      "This will wipe every planned day. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            setSchedule(EMPTY);
            setEditing(null);
            await AsyncStorage.removeItem(STORAGE_KEY);
          },
        },
      ],
    );
  };

  // ── download plan as .txt file ─────────────────────────────────────────
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const filledDays = DAYS.filter((d) => schedule[d.key]);
      const totalDays = filledDays.length;
      const restDays =
        DAYS.filter((d) => !schedule[d.key])
          .map((d) => d.label)
          .join(", ") || "None";

      const lines: string[] = [
        "╔══════════════════════════════════════════╗",
        "║         GYM BRO — WEEKLY PLAN            ║",
        "╚══════════════════════════════════════════╝",
        "",
        `Generated: ${new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`,
        `Training days: ${totalDays} / 7`,
        `Rest / off days: ${restDays}`,
        "",
        "──────────────────────────────────────────",
        "",
      ];

      DAYS.forEach((d, i) => {
        const val = schedule[d.key];
        lines.push(`DAY ${i + 1}  ·  ${d.label.toUpperCase()}  ${d.emoji}`);
        if (val) {
          val.split("\n").forEach((l) => lines.push(`  ${l}`));
        } else {
          lines.push("  — Rest / Recovery —");
        }
        lines.push("");
      });

      lines.push("──────────────────────────────────────────");
      lines.push("Keep grinding. Built with GymBro 💪");
      lines.push("──────────────────────────────────────────");

      const content = lines.join("\n");
      const filename = `GymBro_WeeklyPlan_${Date.now()}.txt`;
      const fileUri = (FileSystem as any).documentDirectory + filename;
      await FileSystem.writeAsStringAsync(fileUri, content, {
        encoding: "utf8",
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/plain",
          dialogTitle: "Your GymBro Weekly Plan",
        });
      } else {
        Alert.alert("Saved!", `Plan saved to:\n${filename}`);
      }
    } catch (e) {
      Alert.alert("Error", "Could not export your plan.");
    } finally {
      setDownloading(false);
    }
  };

  // ── derived stats ──────────────────────────────────────────────────────
  const filledCount = Object.values(schedule).filter(Boolean).length;
  const totalChars = Object.values(schedule).reduce((s, v) => s + v.length, 0);
  const progressPct = (filledCount / 7) * 100;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: "#080808" }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.header,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* back */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.iconBtn, { borderColor: "#222" }]}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={18} color="#fff" />
        </TouchableOpacity>

        {/* title block */}
        <View style={styles.titleBlock}>
          <Text style={styles.headerEyebrow}>WEEK PLANNER</Text>
          <Text style={[styles.headerTitle, { color: primary }]}>
            TRAINING{"\n"}SCHEDULE
          </Text>
        </View>

        {/* actions */}
        <View style={{ gap: 8 }}>
          <TouchableOpacity
            onPress={handleReset}
            style={[styles.iconBtn, { borderColor: "#FF3B3040" }]}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh-outline" size={17} color="#FF3B30" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDownload}
            style={[styles.iconBtn, { borderColor: primary + "40" }]}
            activeOpacity={0.7}
            disabled={downloading}
          >
            <Ionicons
              name={downloading ? "hourglass-outline" : "download-outline"}
              size={17}
              color={primary}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* ── STATS BAR ──────────────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.statsBar,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <StatPill value={filledCount} label="DAYS PLANNED" primary={primary} />
        <View style={styles.statDivider} />
        <StatPill value={7 - filledCount} label="DAYS OPEN" primary={primary} />
        <View style={styles.statDivider} />
        <StatPill
          value={`${Math.round(progressPct)}%`}
          label="COMPLETE"
          primary={primary}
        />
      </Animated.View>

      {/* ── PROGRESS TRACK ─────────────────────────────────────────────── */}
      <View style={styles.progressTrack}>
        {DAYS.map((d, i) => (
          <View
            key={d.key}
            style={[
              styles.progressSegment,
              {
                backgroundColor: schedule[d.key] ? primary : "#1a1a1a",
                marginRight: i < 6 ? 3 : 0,
              },
            ]}
          />
        ))}
      </View>

      {/* ── SCROLL CONTENT ─────────────────────────────────────────────── */}
      <Animated.ScrollView
        style={{ opacity: fadeAnim, flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── WEEK STRIP ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.weekStrip}
        >
          {DAYS.map((d) => {
            const active = editing === d.key;
            const filled = !!schedule[d.key];
            return (
              <TouchableOpacity
                key={d.key}
                onPress={() => setEditing(active ? null : d.key)}
                activeOpacity={0.8}
                style={[
                  styles.weekDot,
                  {
                    backgroundColor: active
                      ? primary
                      : filled
                        ? primary + "25"
                        : "#111",
                    borderColor: active
                      ? primary
                      : filled
                        ? primary + "60"
                        : "#222",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.weekDotLetter,
                    { color: active ? "#000" : filled ? primary : "#333" },
                  ]}
                >
                  {d.full}
                </Text>
                {filled && !active && (
                  <View
                    style={[styles.weekDotDot, { backgroundColor: primary }]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── DAY CARDS ── */}
        {DAYS.map((day, idx) => {
          const isEditing = editing === day.key;
          const value = schedule[day.key];
          const filled = !!value;

          return (
            <View key={day.key} style={styles.cardRow}>
              {/* sidebar */}
              <DayNumber index={idx} filled={filled} primary={primary} />

              {/* card body */}
              <View
                style={[
                  styles.card,
                  {
                    borderColor: isEditing
                      ? primary + "80"
                      : filled
                        ? primary + "30"
                        : "#161616",
                    backgroundColor: isEditing
                      ? "#0f0f0f"
                      : filled
                        ? "#0d0d0d"
                        : "#0a0a0a",
                  },
                ]}
              >
                {/* top strip when filled */}
                {filled && (
                  <View
                    style={[styles.cardTopStrip, { backgroundColor: primary }]}
                  />
                )}

                {/* header row */}
                <Pressable
                  style={styles.cardHeader}
                  onPress={() => setEditing(isEditing ? null : day.key)}
                >
                  {/* emoji badge */}
                  <View
                    style={[
                      styles.emojiBadge,
                      { backgroundColor: filled ? primary + "18" : "#111" },
                    ]}
                  >
                    <Text style={styles.emojiText}>{day.emoji}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={styles.dayTitleRow}>
                      <Text style={styles.dayLabel}>
                        {day.label.toUpperCase()}
                      </Text>
                      <View
                        style={[
                          styles.tagPill,
                          {
                            backgroundColor: filled
                              ? primary + "20"
                              : "#161616",
                            borderColor: filled ? primary + "50" : "#222",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.tagText,
                            { color: filled ? primary : "#333" },
                          ]}
                        >
                          {day.tag}
                        </Text>
                      </View>
                    </View>

                    {!isEditing && (
                      <Text
                        style={[
                          styles.dayPreview,
                          {
                            color: filled
                              ? "rgba(255,255,255,0.45)"
                              : "#2a2a2a",
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {filled ? value : "— tap to plan —"}
                      </Text>
                    )}
                  </View>

                  <Ionicons
                    name={isEditing ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={isEditing ? primary : "#2a2a2a"}
                  />
                </Pressable>

                {/* expandable editor */}
                {isEditing && (
                  <View style={styles.editorWrap}>
                    <View
                      style={[
                        styles.editorAccent,
                        { backgroundColor: primary },
                      ]}
                    />
                    <TextInput
                      style={[
                        styles.textInput,
                        { color: "#fff", borderColor: primary + "20" },
                      ]}
                      placeholder={`e.g. Chest & Triceps\nBench Press 4×8\nDips 3×12\nCable Fly 3×15`}
                      placeholderTextColor="#2a2a2a"
                      multiline
                      value={schedule[day.key]}
                      onChangeText={(t) =>
                        setSchedule((prev) => ({ ...prev, [day.key]: t }))
                      }
                      autoFocus
                      textAlignVertical="top"
                    />
                  </View>
                )}
              </View>
            </View>
          );
        })}

        {/* ── SAVE BUTTON ── */}
        <Animated.View
          style={{ transform: [{ scale: pulseAnim }], marginTop: 24 }}
        >
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[primary, primary + "99"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Ionicons
              name={saved ? "checkmark-done" : "save-outline"}
              size={22}
              color="#000"
            />
            <Text style={styles.saveBtnText}>
              {saved ? "SAVED ✓" : "SAVE SCHEDULE"}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── DOWNLOAD PLAN CTA ── */}
        <TouchableOpacity
          style={[styles.downloadBtn, { borderColor: primary + "40" }]}
          onPress={handleDownload}
          activeOpacity={0.8}
          disabled={downloading}
        >
          <Ionicons
            name={downloading ? "hourglass-outline" : "document-text-outline"}
            size={18}
            color={primary}
          />
          <Text style={[styles.downloadBtnText, { color: primary }]}>
            {downloading ? "EXPORTING…" : "DOWNLOAD PLAN"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </Animated.ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },

  // ── header
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 18,
    paddingTop: Platform.OS === "ios" ? 56 : 44,
    paddingBottom: 16,
    gap: 14,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0e0e0e",
  },
  titleBlock: { flex: 1 },
  headerEyebrow: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 3,
    color: "#333",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 30,
    letterSpacing: -1,
  },

  // ── stats bar
  statsBar: {
    flexDirection: "row",
    marginHorizontal: 18,
    marginBottom: 14,
    backgroundColor: "#0d0d0d",
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#1a1a1a",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#1a1a1a",
    marginVertical: 4,
  },

  // ── progress
  progressTrack: {
    flexDirection: "row",
    marginHorizontal: 18,
    marginBottom: 20,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressSegment: {
    flex: 1,
    borderRadius: 2,
  },

  // ── scroll
  scroll: { paddingHorizontal: 18, paddingTop: 4, paddingBottom: 32 },

  // ── week strip
  weekStrip: {
    paddingRight: 4,
    gap: 8,
    marginBottom: 24,
  },
  weekDot: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 52,
  },
  weekDotLetter: { fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  weekDotDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },

  // ── card row
  cardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 12,
  },

  // ── card
  card: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  cardTopStrip: { height: 2.5, opacity: 0.9 },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  emojiBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  emojiText: { fontSize: 20 },
  dayTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 3,
  },
  dayLabel: {
    fontSize: 13,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 0.8,
  },
  tagPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  tagText: { fontSize: 8, fontWeight: "900", letterSpacing: 1 },
  dayPreview: { fontSize: 11, fontWeight: "500" },

  // ── editor
  editorWrap: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 10,
  },
  editorAccent: { width: 2, borderRadius: 1, opacity: 0.7 },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 22,
    minHeight: 110,
    backgroundColor: "#060606",
  },

  // ── save button
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 24,
    gap: 10,
    overflow: "hidden",
    position: "relative",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
      android: { elevation: 12 },
    }),
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#000",
    letterSpacing: 1.5,
  },

  // ── download button
  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 24,
    gap: 10,
    borderWidth: 1.5,
    marginTop: 12,
    backgroundColor: "#0a0a0a",
  },
  downloadBtnText: { fontSize: 13, fontWeight: "900", letterSpacing: 1.5 },
});
