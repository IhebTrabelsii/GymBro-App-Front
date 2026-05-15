// app/sleep-mode.tsx
import { Ionicons } from "@expo/vector-icons";
import { Audio, ResizeMode, Video } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { useSimpleTheme } from "../../context/SimpleThemeContext";

const { width, height } = Dimensions.get("window");

const PHASES = [
  {
    label: "Inhale",
    instruction: "breathe in slowly",
    duration: 4000,
    scale: 1.35,
  },
  {
    label: "Hold",
    instruction: "hold your breath",
    duration: 7000,
    scale: 1.35,
  },
  {
    label: "Exhale",
    instruction: "release slowly",
    duration: 8000,
    scale: 1.0,
  },
];

type SoundKey = "rain" | "waves" | "fireplace" | "none";

// ── Per-sound visual themes ───────────────────────────────────────────────────
// Each sound gets its own atmosphere: gradient sky + nebula tones + accent color
const THEMES: Record<
  SoundKey,
  {
    gradients: [string, string, string, string];
    nebulaTopColor: string;
    nebulaBottomColor: string;
    accent: string;
    label: string;
  }
> = {
  none: {
    // Default — deep cosmic indigo night
    gradients: ["#03020D", "#08052B", "#0D1040", "#050318"],
    nebulaTopColor: "#8B9FFF",
    nebulaBottomColor: "#5060D0",
    accent: "#8B9FFF",
    label: "Night",
  },
  rain: {
    gradients: ["#020508", "#050C16", "#071522", "#030A12"],
    nebulaTopColor: "#000000",
    nebulaBottomColor: "#1A3860",
    accent: "#01eeff",
    label: "Storm",
  },
  waves: {
    // Oceanic depth — teal abyss
    gradients: ["#010A0D", "#021318", "#041E28", "#010C14"],
    nebulaTopColor: "#0D8090",
    nebulaBottomColor: "#064858",
    accent: "#ffffff",
    label: "Ocean",
  },
  fireplace: {
    // Warm hearth — deep ember, almost black with smouldering reds
    gradients: ["#0D0200", "#220500", "#320800", "#160300"],
    nebulaTopColor: "#CC4400",
    nebulaBottomColor: "#801800",
    accent: "#FF9955",
    label: "Hearth",
  },
};

// ── Star particles ────────────────────────────────────────────────────────────
type Star = {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: Animated.Value;
  animDelay: number;
};
function generateStars(n: number): Star[] {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    x: Math.random() * width,
    y: Math.random() * height * 0.75,
    size: Math.random() * 2 + 0.5,
    opacity: new Animated.Value(Math.random() * 0.5 + 0.1),
    animDelay: Math.random() * 4000,
  }));
}

const RING_SIZE = 200;
const RING_STROKE = 1.5;
const R = RING_SIZE / 2 - RING_STROKE * 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

export default function SleepModeScreen() {
  const router = useRouter();
  const { theme } = useSimpleTheme();
  const fireplaceVideoRef = useRef<Video>(null);
  const rainVideoRef = useRef<Video>(null);
  const wavesVideoRef = useRef<Video>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  // ── Stars ─────────────────────────────────────────────────────────────────
  const [stars] = useState<Star[]>(() => generateStars(80));

  // ── Background crossfade: one Animated.Value per theme ────────────────────
  // Defined as stable refs — never conditionally created
  const bgOpacityNone = useRef(new Animated.Value(1)).current;
  const bgOpacityRain = useRef(new Animated.Value(0)).current;
  const bgOpacityWaves = useRef(new Animated.Value(0)).current;
  const bgOpacityFireplace = useRef(new Animated.Value(0)).current;

  // ── Breathing ─────────────────────────────────────────────────────────────
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [breathingActive, setBreathingActive] = useState(true);
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const phaseProgress = useRef(new Animated.Value(0)).current;
  const phaseAnim = useRef<Animated.CompositeAnimation | null>(null);

  // ── Timer ─────────────────────────────────────────────────────────────────
  const [timerMinutes, setTimerMinutes] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(30 * 60);

  // ── Ambient sound ─────────────────────────────────────────────────────────
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [selectedSound, setSelectedSound] = useState<SoundKey>("none");

  // ── Alarm ─────────────────────────────────────────────────────────────────
  const [showAlarm, setShowAlarm] = useState(false);
  const alarmSoundRef = useRef<Audio.Sound | null>(null);
  const alarmFade = useRef(new Animated.Value(0)).current;
  const alarmPulse = useRef(new Animated.Value(1)).current;
  const alarmPulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  // ── Misc ──────────────────────────────────────────────────────────────────
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const ambientAnim = useRef(new Animated.Value(0.6)).current;

  // Derived: current theme config + accent color
  const activeTheme = THEMES[selectedSound];
  const ACCENT = activeTheme.accent;
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    if (!videoLoaded) return; // ✅ bail out early

    const isFireplace = selectedSound === "fireplace";
    const isRain = selectedSound === "rain";
    const isWaves = selectedSound === "waves";

    fireplaceVideoRef.current?.[isFireplace ? "playAsync" : "pauseAsync"]();
    rainVideoRef.current?.[isRain ? "playAsync" : "pauseAsync"]();
    wavesVideoRef.current?.[isWaves ? "playAsync" : "pauseAsync"]();
  }, [selectedSound, videoLoaded]);

  // ─────────────────────────────────────────────────────────────────────────
  // Init: screen fade, star twinkle, ambient glow loop
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();

    stars.forEach((star) => {
      const twinkle = () =>
        Animated.sequence([
          Animated.delay(star.animDelay),
          Animated.timing(star.opacity, {
            toValue: Math.random() * 0.7 + 0.15,
            duration: 2000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.timing(star.opacity, {
            toValue: Math.random() * 0.2 + 0.05,
            duration: 2000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
        ]).start(twinkle);
      twinkle();
    });

    Animated.loop(
      Animated.sequence([
        Animated.timing(ambientAnim, {
          toValue: 1,
          duration: 5000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(ambientAnim, {
          toValue: 0.5,
          duration: 5000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    return () => {
      soundRef.current?.unloadAsync();
      alarmSoundRef.current?.unloadAsync();
      fireplaceVideoRef.current?.unloadAsync();
      rainVideoRef.current?.unloadAsync();
      wavesVideoRef.current?.unloadAsync();
      Vibration.cancel();
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Background crossfade when sound changes
  // All 4 opacity values animate simultaneously: target→1, others→0
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const opacityMap: Record<SoundKey, Animated.Value> = {
      none: bgOpacityNone,
      rain: bgOpacityRain,
      waves: bgOpacityWaves,
      fireplace: bgOpacityFireplace,
    };
    Animated.parallel(
      (Object.keys(opacityMap) as SoundKey[]).map((key) =>
        Animated.timing(opacityMap[key], {
          toValue: key === selectedSound ? 1 : 0,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ),
    ).start();
  }, [selectedSound]);

  // ─────────────────────────────────────────────────────────────────────────
  // 4-7-8 Breathing cycle
  // ─────────────────────────────────────────────────────────────────────────
  const runBreathingPhase = useCallback(
    (index: number) => {
      const phase = PHASES[index];
      phaseProgress.setValue(0);
      const anim = Animated.parallel([
        Animated.timing(breatheAnim, {
          toValue: phase.scale,
          duration: phase.duration,
          easing: index === 1 ? Easing.linear : Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(phaseProgress, {
          toValue: 1,
          duration: phase.duration,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ]);
      phaseAnim.current = anim;
      anim.start(({ finished }) => {
        if (finished) {
          const next = (index + 1) % PHASES.length;
          setPhaseIndex(next);
          runBreathingPhase(next);
        }
      });
    },
    [breatheAnim, phaseProgress],
  );

  useEffect(() => {
    if (breathingActive) {
      setPhaseIndex(0);
      runBreathingPhase(0);
    } else {
      phaseAnim.current?.stop();
      Animated.spring(breatheAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
    return () => phaseAnim.current?.stop();
  }, [breathingActive]);

  // ─────────────────────────────────────────────────────────────────────────
  // Timer countdown
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerActive && remainingSeconds > 0) {
      interval = setInterval(
        () => setRemainingSeconds((prev) => prev - 1),
        1000,
      );
    } else if (remainingSeconds === 0 && timerActive) {
      setTimerActive(false);
      triggerAlarm();
    }
    return () => clearInterval(interval);
  }, [timerActive, remainingSeconds]);

  // ─────────────────────────────────────────────────────────────────────────
  // Alarm: calm, non-jarring wake-up sequence
  // ─────────────────────────────────────────────────────────────────────────
const triggerAlarm = async () => {
  if (soundRef.current) {   // ← was: if (sound)
    try {
      await soundRef.current.stopAsync();
    } catch (_) {}
  }

    // Gentle repeating vibration pattern (soft pulses, not harsh buzz)
    Vibration.vibrate([0, 700, 900, 700, 900, 700], true);

    // Load and play calm alarm on loop at moderate volume
    // Place a soft chime / gentle bell at: @/assets/sounds/alarm.mp3
    try {
      const { sound: alarmS } = await Audio.Sound.createAsync(
        require("../assets/sounds/alarm.mp3"),
        { isLooping: true, volume: 0.5 },
      );
      alarmSoundRef.current = alarmS;
      await alarmS.playAsync();
    } catch (e) {
      console.error("Alarm sound error:", e);
    }

    // Show overlay with slow fade-in
    setShowAlarm(true);
    Animated.timing(alarmFade, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();

    // Calm, slow sun pulse — not urgent, just gently waking
    alarmPulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(alarmPulse, {
          toValue: 1.12,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(alarmPulse, {
          toValue: 0.92,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    alarmPulseLoop.current.start();
  };

  const dismissAlarm = async () => {
    Vibration.cancel();
    alarmPulseLoop.current?.stop();
    if (alarmSoundRef.current) {
      try {
        await alarmSoundRef.current.stopAsync();
        await alarmSoundRef.current.unloadAsync();
        alarmSoundRef.current = null;
      } catch (_) {}
    }
    Animated.timing(alarmFade, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start(() => {
      setShowAlarm(false);
      alarmPulse.setValue(1);
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Sound controls
  // ─────────────────────────────────────────────────────────────────────────
  const playSound = async (name: "rain" | "waves" | "fireplace") => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
      } catch (_) {}
      setSound(null);
    }
    const map = {
      rain: require("../assets/sounds/rain.mp3"),
      waves: require("../assets/sounds/waves.mp3"),
      fireplace: require("../assets/sounds/fireplace.mp3"),
    };
    try {
      const { sound: s } = await Audio.Sound.createAsync(map[name], {
        isLooping: true,
        volume: 0.6,
      });
      soundRef.current = s;
      setSound(s);
      setSelectedSound(name);
      await s.playAsync();
    } catch (e) {
      console.error("Sound error:", e);
    }
  };

  const stopSound = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (_) {}
      soundRef.current = null;
      setSound(null);
      setSelectedSound("none");
    }
  };

  const toggleSound = (name: "rain" | "waves" | "fireplace") => {
    if (selectedSound === name) stopSound();
    else playSound(name);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Timer helpers
  // ─────────────────────────────────────────────────────────────────────────
  const adjustTimer = (delta: number) => {
    if (timerActive) return;
    const v = Math.min(120, Math.max(1, timerMinutes + delta));
    setTimerMinutes(v);
    setRemainingSeconds(v * 60);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60),
      sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const timerProgress = 1 - remainingSeconds / (timerMinutes * 60);

  const exitSleepMode = () => {
    soundRef.current?.stopAsync().then(() => soundRef.current?.unloadAsync());
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }).start(() => router.back());
  };

  const phase = PHASES[phaseIndex];

  const SOUNDS: {
    id: "rain" | "waves" | "fireplace";
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
  }[] = [
    { id: "rain", icon: "rainy", label: "Rain" },
    { id: "waves", icon: "water", label: "Ocean" },
    { id: "fireplace", icon: "flame", label: "Fire" },
  ];

  // Stable render array for background layers
  const bgLayers: { key: SoundKey; opacity: Animated.Value }[] = [
    { key: "none", opacity: bgOpacityNone },
    { key: "rain", opacity: bgOpacityRain },
    { key: "waves", opacity: bgOpacityWaves },
    { key: "fireplace", opacity: bgOpacityFireplace },
  ];

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* ────────────────────────────────────────────────────────────────────
          BACKGROUNDS: 4 gradient layers stacked, crossfading between them.
          Each layer owns its gradient + nebula blobs for that theme.
          Only one layer is opaque at a time; selecting a sound triggers a
          2-second smooth crossfade to the matching atmosphere.
      ──────────────────────────────────────────────────────────────────── */}
      {bgLayers.map(({ key, opacity }) => {
        const t = THEMES[key];
        if (key === "fireplace") {
          return (
            <Animated.View
              key={key}
              style={[StyleSheet.absoluteFill, { opacity }]}
            >
              <Video
                ref={fireplaceVideoRef}
                source={require("../assets/videos/fire.mp4")}
                style={StyleSheet.absoluteFill}
                shouldPlay={false}
                isLooping
                resizeMode={ResizeMode.COVER}
                isMuted
                onLoad={() => setVideoLoaded(true)}
              />
            </Animated.View>
          );
        }
        if (key === "rain") {
          return (
            <Animated.View
              key={key}
              style={[StyleSheet.absoluteFill, { opacity }]}
            >
              <Video
                ref={rainVideoRef}
                source={require("../assets/videos/rain.mp4")}
                style={StyleSheet.absoluteFill}
                shouldPlay={false}
                isLooping
                resizeMode={ResizeMode.COVER}
                isMuted
                onLoad={() => setVideoLoaded(true)}
              />
            </Animated.View>
          );
        }
        if (key === "waves") {
          return (
            <Animated.View
              key={key}
              style={[StyleSheet.absoluteFill, { opacity }]}
            >
              <Video
                ref={wavesVideoRef}
                source={require("../assets/videos/ocean.mp4")} // your file name
                style={StyleSheet.absoluteFill}
                shouldPlay={false}
                isLooping
                resizeMode={ResizeMode.COVER}
                isMuted
                onLoad={() => setVideoLoaded(true)}
              />
            </Animated.View>
          );
        }
        // Default (none) – keep gradient
        return (
          <Animated.View
            key={key}
            style={[StyleSheet.absoluteFill, { opacity }]}
          >
            <LinearGradient
              colors={t.gradients}
              locations={[0, 0.3, 0.65, 1]}
              style={StyleSheet.absoluteFill}
            />
            <Animated.View
              style={[
                styles.nebulaBlob,
                styles.nebulaTop,
                {
                  backgroundColor: t.nebulaTopColor,
                  opacity: ambientAnim.interpolate({
                    inputRange: [0.5, 1],
                    outputRange: [0.05, 0.13],
                  }),
                },
              ]}
            />
            <Animated.View
              style={[
                styles.nebulaBlob,
                styles.nebulaBottom,
                {
                  backgroundColor: t.nebulaBottomColor,
                  opacity: ambientAnim.interpolate({
                    inputRange: [0.5, 1],
                    outputRange: [0.04, 0.1],
                  }),
                },
              ]}
            />
          </Animated.View>
        );
      })}

      {/* ── Stars ─────────────────────────────────────────────────────────── */}
      {stars.map((star) => (
        <Animated.View
          key={star.id}
          style={{
            position: "absolute",
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
            borderRadius: star.size,
            backgroundColor: "#ffffff",
            opacity: star.opacity,
          }}
        />
      ))}

      {/* ── Main UI ───────────────────────────────────────────────────────── */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Top bar: active theme label + exit */}
        <View style={styles.topBar}>
          <View style={[styles.themeBadge, { borderColor: ACCENT + "55" }]}>
            <Text style={[styles.themeBadgeText, { color: ACCENT }]}>
              {activeTheme.label}
            </Text>
          </View>
          <TouchableOpacity
            onPress={exitSleepMode}
            style={styles.exitBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={18} color="rgba(255,255,255,0.35)" />
          </TouchableOpacity>
        </View>

        {/* ── Breathing orb ───────────────────────────────────────────────── */}
        <View style={styles.breathSection}>
          {/* Ambient glow ring */}
          <Animated.View
            style={[
              styles.glowRing,
              {
                borderColor: ACCENT,
                shadowColor: ACCENT,
                opacity: ambientAnim.interpolate({
                  inputRange: [0.5, 1],
                  outputRange: [0.12, 0.28],
                }),
              },
            ]}
          />

          {/* SVG decorative arc track */}
          <View style={styles.svgWrap} pointerEvents="none">
            <Svg
              width={RING_SIZE}
              height={RING_SIZE}
              viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
            >
              <Defs>
                <RadialGradient id="cg" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor={ACCENT} stopOpacity="0.18" />
                  <Stop offset="100%" stopColor={ACCENT} stopOpacity="0.03" />
                </RadialGradient>
              </Defs>
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={R}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={RING_STROKE}
                fill="url(#cg)"
              />
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={R}
                stroke={ACCENT}
                strokeWidth={RING_STROKE + 0.5}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${CIRCUMFERENCE}`}
                strokeDashoffset={CIRCUMFERENCE * 0.3}
                transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
                opacity={0.5}
              />
            </Svg>
          </View>

          {/* Pulsing orb */}
          <Animated.View
            style={[
              styles.breathOrb,
              {
                transform: [{ scale: breatheAnim }],
                shadowColor: ACCENT,
              },
            ]}
          >
            <LinearGradient
              colors={[`${ACCENT}40`, `${ACCENT}08`]}
              style={[
                StyleSheet.absoluteFill,
                { borderRadius: (RING_SIZE - 40) / 2 },
              ]}
            />
            <Ionicons
              name="moon"
              size={28}
              color={ACCENT}
              style={{ opacity: 0.9 }}
            />
          </Animated.View>

          {/* Phase label */}
          <View style={styles.phaseBlock}>
            <Text style={styles.phaseLabel}>{phase.label}</Text>
            <Text style={styles.phaseInstruction}>{phase.instruction}</Text>
          </View>

          <TouchableOpacity
            style={[styles.breathToggle, { borderColor: ACCENT + "45" }]}
            onPress={() => setBreathingActive((v) => !v)}
            activeOpacity={0.7}
          >
            <Text style={[styles.breathToggleText, { color: ACCENT + "CC" }]}>
              {breathingActive ? "pause guide" : "start guide"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* ── Sleep timer ──────────────────────────────────────────────────── */}
        <View style={styles.timerSection}>
          {/* Circular progress arc */}
          <View style={styles.timerRingWrap} pointerEvents="none">
            <Svg width={120} height={120} viewBox="0 0 120 120">
              <Circle
                cx={60}
                cy={60}
                r={52}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={2}
                fill="none"
              />
              <Circle
                cx={60}
                cy={60}
                r={52}
                stroke={ACCENT}
                strokeWidth={2}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 52}`}
                strokeDashoffset={2 * Math.PI * 52 * (1 - timerProgress)}
                transform="rotate(-90 60 60)"
                opacity={0.55}
              />
            </Svg>
          </View>

          <View style={styles.timerFace}>
            <Text style={styles.timerValue}>
              {formatTime(remainingSeconds)}
            </Text>
            <Text style={styles.timerSub}>sleep timer</Text>
          </View>

          {!timerActive ? (
            <View style={styles.timerRow}>
              <TouchableOpacity
                style={[styles.timerAdjBtn, { borderColor: ACCENT + "30" }]}
                onPress={() => adjustTimer(-5)}
              >
                <Text style={[styles.timerAdjText, { color: ACCENT + "AA" }]}>
                  −5m
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.timerPlayBtn, { borderColor: ACCENT + "55" }]}
                onPress={() => setTimerActive(true)}
              >
                <Ionicons name="play" size={16} color={ACCENT} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.timerAdjBtn, { borderColor: ACCENT + "30" }]}
                onPress={() => adjustTimer(5)}
              >
                <Text style={[styles.timerAdjText, { color: ACCENT + "AA" }]}>
                  +5m
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.timerRow}>
              <TouchableOpacity
                style={[
                  styles.timerAdjBtn,
                  { borderColor: "rgba(255,80,80,0.3)" },
                ]}
                onPress={() => {
                  setTimerActive(false);
                  setRemainingSeconds(timerMinutes * 60);
                }}
              >
                <Ionicons
                  name="refresh"
                  size={14}
                  color="rgba(255,120,120,0.8)"
                />
                <Text
                  style={[
                    styles.timerAdjText,
                    { color: "rgba(255,120,120,0.8)" },
                  ]}
                >
                  reset
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.timerPlayBtn,
                  { borderColor: "rgba(255,80,80,0.4)" },
                ]}
                onPress={() => setTimerActive(false)}
              >
                <Ionicons
                  name="stop"
                  size={16}
                  color="rgba(255,120,120,0.85)"
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* ── Ambient sounds ───────────────────────────────────────────────── */}
        <View style={styles.soundSection}>
          <Text style={styles.soundTitle}>ambient sounds</Text>
          <View style={styles.soundRow}>
            {SOUNDS.map(({ id, icon, label }) => {
              const active = selectedSound === id;
              return (
                <TouchableOpacity
                  key={id}
                  style={[
                    styles.soundPill,
                    {
                      borderColor: active ? ACCENT : ACCENT + "30",
                      backgroundColor: active ? ACCENT : ACCENT + "0A",
                    },
                  ]}
                  onPress={() => toggleSound(id)}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name={icon}
                    size={20}
                    color={active ? "#03020D" : ACCENT}
                    style={{ opacity: active ? 1 : 0.75 }}
                  />
                  <Text
                    style={[
                      styles.soundPillLabel,
                      { color: active ? "#03020D" : ACCENT + "BB" },
                    ]}
                  >
                    {label}
                  </Text>
                  {active && <View style={styles.soundDot} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Text style={styles.hint}>
          4 · 7 · 8 breathing • calm alarm when timer ends
        </Text>
      </Animated.View>

      {/* ────────────────────────────────────────────────────────────────────
          ALARM OVERLAY
          Fades in when timer hits zero. Warm golden palette contrasts with
          the cool sleep-mode tones, gently signalling morning.
          Three concentric rings pulse outward from a soft sun orb.
      ──────────────────────────────────────────────────────────────────── */}
      {showAlarm && (
        <Animated.View style={[styles.alarmOverlay, { opacity: alarmFade }]}>
          {/* Deep warm backdrop */}
          <LinearGradient
            colors={["rgba(8,3,0,0.97)", "rgba(20,8,0,0.99)"]}
            style={StyleSheet.absoluteFill}
          />

          {/* Three concentric pulsing rings */}
          {[1.0, 1.5, 2.0].map((baseScale, i) => (
            <Animated.View
              key={i}
              style={[
                styles.alarmRing,
                {
                  borderColor: "#FFD070",
                  transform: [
                    {
                      scale: alarmPulse.interpolate({
                        inputRange: [0.92, 1.12],
                        outputRange: [baseScale, baseScale + 0.1],
                      }),
                    },
                  ],
                  opacity: alarmPulse.interpolate({
                    inputRange: [0.92, 1.12],
                    outputRange: [0.13 - i * 0.04, 0.04],
                  }),
                },
              ]}
            />
          ))}

          {/* Sun orb */}
          <Animated.View
            style={[
              styles.sunOrb,
              {
                transform: [{ scale: alarmPulse }],
                shadowColor: "#FFD070",
              },
            ]}
          >
            <LinearGradient
              colors={["rgba(255,220,100,0.22)", "rgba(255,150,40,0.06)"]}
              style={[StyleSheet.absoluteFill, { borderRadius: 60 }]}
            />
            <Ionicons name="sunny" size={44} color="#FFD070" />
          </Animated.View>

          <Text style={styles.alarmTitle}>Good Morning</Text>
          <Text style={styles.alarmSub}>Your sleep session has ended</Text>

          {/* Dismiss button */}
          <TouchableOpacity
            style={styles.alarmDismiss}
            onPress={dismissAlarm}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["rgba(255,215,100,0.2)", "rgba(255,145,30,0.1)"]}
              style={[StyleSheet.absoluteFill, { borderRadius: 40 }]}
            />
            <Ionicons name="sunny-outline" size={18} color="#FFD070" />
            <Text style={styles.alarmDismissText}>Wake Up</Text>
          </TouchableOpacity>

          <Text style={styles.alarmHint}>tap to dismiss</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#03020D" },

  // Nebula blobs (rendered inside each bg layer)
  nebulaBlob: { position: "absolute", borderRadius: 999 },
  nebulaTop: {
    width: width * 1.1,
    height: width * 1.1,
    top: -width * 0.55,
    left: -width * 0.05,
  },
  nebulaBottom: {
    width: width * 0.9,
    height: width * 0.9,
    bottom: -width * 0.4,
    right: -width * 0.2,
  },

  // Main layout
  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: 56,
    paddingBottom: 44,
    paddingHorizontal: 28,
  },

  topBar: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  themeBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 0.5,
  },
  themeBadgeText: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontWeight: "500",
  },
  exitBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Breathing
  breathSection: { alignItems: "center", marginTop: 8, marginBottom: 32 },
  glowRing: {
    position: "absolute",
    width: RING_SIZE + 40,
    height: RING_SIZE + 40,
    borderRadius: (RING_SIZE + 40) / 2,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
  },
  svgWrap: { position: "absolute", width: RING_SIZE, height: RING_SIZE },
  breathOrb: {
    width: RING_SIZE - 40,
    height: RING_SIZE - 40,
    borderRadius: (RING_SIZE - 40) / 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    marginBottom: 28,
  },
  phaseBlock: { alignItems: "center", marginBottom: 16 },
  phaseLabel: {
    fontSize: 22,
    fontWeight: "300",
    color: "#FFFFFF",
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  phaseInstruction: {
    fontSize: 13,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 1.5,
  },
  breathToggle: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 0.5,
  },
  breathToggleText: { fontSize: 11, letterSpacing: 1.5 },

  divider: {
    width: "100%",
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  // Timer
  timerSection: { alignItems: "center", paddingVertical: 28, width: "100%" },
  timerRingWrap: { position: "absolute", alignSelf: "center" },
  timerFace: {
    alignItems: "center",
    marginBottom: 20,
    height: 120,
    justifyContent: "center",
  },
  timerValue: {
    fontSize: 40,
    fontWeight: "200",
    color: "#FFFFFF",
    letterSpacing: 3,
    fontVariant: ["tabular-nums"],
  },
  timerSub: {
    fontSize: 10,
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 2.5,
    textTransform: "uppercase",
    marginTop: 4,
  },
  timerRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  timerAdjBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 0.5,
  },
  timerAdjText: { fontSize: 12, letterSpacing: 1 },
  timerPlayBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },

  // Sounds
  soundSection: { alignItems: "center", paddingVertical: 28, width: "100%" },
  soundTitle: {
    fontSize: 10,
    color: "rgba(255,255,255,0.25)",
    letterSpacing: 2.5,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  soundRow: { flexDirection: "row", gap: 12 },
  soundPill: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 24,
    borderWidth: 0.5,
    gap: 6,
    minWidth: 76,
  },
  soundPillLabel: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontWeight: "500",
  },
  soundDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#03020D",
    opacity: 0.5,
  },

  hint: {
    fontSize: 10,
    color: "rgba(255,255,255,0.18)",
    letterSpacing: 1.5,
    textAlign: "center",
    marginTop: "auto",
  },

  // Alarm overlay
  alarmOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  alarmRing: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
  },
  sunOrb: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 40,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 45,
  },
  alarmTitle: {
    fontSize: 32,
    fontWeight: "200",
    color: "#FFFFFF",
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  alarmSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.35)",
    letterSpacing: 1.5,
    marginBottom: 52,
  },
  alarmDismiss: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 40,
    borderWidth: 0.5,
    borderColor: "rgba(255,210,100,0.4)",
    overflow: "hidden",
    marginBottom: 20,
  },
  alarmDismissText: {
    fontSize: 16,
    fontWeight: "300",
    color: "#FFD070",
    letterSpacing: 2.5,
    textTransform: "uppercase",
  },
  alarmHint: { fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: 2 },
});
