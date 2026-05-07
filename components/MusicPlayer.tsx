import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useMusic } from "@/context/MusicContext";
import { useSimpleTheme } from "@/context/SimpleThemeContext";
import { Colors } from "@/constants/Colors";
import Slider from "@react-native-community/slider";

function WaveBar({ delay, isPlaying }: { delay: number; isPlaying: boolean }) {
  const height = useRef(new Animated.Value(3)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isPlaying) {
      loopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(height, {
            toValue: 6 + Math.random() * 10,
            duration: 280 + delay * 90,
            useNativeDriver: false,
          }),
          Animated.timing(height, {
            toValue: 3,
            duration: 280 + delay * 90,
            useNativeDriver: false,
          }),
        ])
      );
      setTimeout(() => loopRef.current?.start(), delay * 55);
    } else {
      loopRef.current?.stop();
      Animated.timing(height, { toValue: 3, duration: 200, useNativeDriver: false }).start();
    }
    return () => loopRef.current?.stop();
  }, [isPlaying]);

  return <Animated.View style={[styles.waveBar, { height }]} />;
}

function VinylDisc({
  isPlaying,
  primaryColor,
  isDark,
}: {
  isPlaying: boolean;
  primaryColor: string;
  isDark: boolean;
}) {
  const spin = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const currentAngle = useRef(0);

  useEffect(() => {
    spin.addListener(({ value }) => { currentAngle.current = value; });
    return () => spin.removeAllListeners();
  }, []);

  useEffect(() => {
    animRef.current?.stop();
    if (isPlaying) {
      spin.setValue(currentAngle.current % 1);
      animRef.current = Animated.loop(
        Animated.timing(spin, {
          toValue: currentAngle.current % 1 + 1,
          duration: 4000,
          useNativeDriver: true,
        })
      );
      animRef.current.start();
    }
  }, [isPlaying]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View style={[styles.vinyl, { transform: [{ rotate }] }]}>
      {}
      <View
        style={[
          styles.vinylOuter,
          { borderColor: primaryColor + "35", backgroundColor: isDark ? "#111" : "#f0f0f0" },
        ]}
      >
        {}
        <View style={[styles.vinylGroove, { borderColor: primaryColor + "18", width: 52, height: 52, borderRadius: 26 }]} />
        <View style={[styles.vinylGroove, { borderColor: primaryColor + "12", width: 40, height: 40, borderRadius: 20 }]} />
        {}
        <LinearGradient
          colors={[primaryColor + "55", primaryColor + "22"]}
          style={styles.vinylLabel}
        >
          <MaterialCommunityIcons name="music-note" size={14} color={primaryColor} />
        </LinearGradient>
      </View>
    </Animated.View>
  );
}

export default function MusicPlayer() {
  const { theme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === "dark";

  const {
    isPlaying,
    currentTrack,
    volume,
    playMusic,
    pauseMusic,
    nextTrack,
    previousTrack,
    setVolume,
    isAdmin,
    hasValidTracks,
  } = useMusic();

  const playScale = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslate = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(cardTranslate, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
    ]).start();
  }, []);

  const handlePlayPress = () => {
    Animated.sequence([
      Animated.timing(playScale, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.spring(playScale, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }),
    ]).start();
    isPlaying ? pauseMusic() : playMusic();
  };

  if (isAdmin || !hasValidTracks) return null;

  const primary = currentColors.primary;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity: cardOpacity,
          transform: [{ translateY: cardTranslate }],
        },
      ]}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: isDark ? currentColors.card ?? "#111" : "#fff",
            borderColor: isDark ? primary + "28" : primary + "18",
          },
        ]}
      >
        {}
        <View style={[styles.topStrip, { backgroundColor: primary }]} />

        {}
        <View
          style={[
            styles.glowBlob,
            { backgroundColor: primary, opacity: isDark ? 0.06 : 0.04 },
          ]}
        />

        {}
        <View style={styles.mainRow}>

          {}
          <VinylDisc isPlaying={isPlaying} primaryColor={primary} isDark={isDark} />

          {}
          <View style={styles.trackSection}>
            {}
            <View style={[styles.labelPill, { backgroundColor: primary + "15", borderColor: primary + "30" }]}>
              <View style={[styles.labelDot, { backgroundColor: primary }]} />
              <Text style={[styles.labelText, { color: primary }]}>
                {isPlaying ? "NOW PLAYING" : "PAUSED"}
              </Text>
            </View>

            <Text
              style={[styles.trackName, { color: currentColors.text }]}
              numberOfLines={1}
            >
              {currentTrack?.name || "No Track"}
            </Text>

            <Text style={[styles.trackSub, { color: isDark ? "#555" : "#bbb" }]}>
              GymBro · Workout Mix
            </Text>

            {}
            <View style={styles.waveform}>
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <WaveBar key={i} delay={i} isPlaying={isPlaying} />
              ))}
            </View>
          </View>

          {}
          <View style={styles.controlsCol}>
            <TouchableOpacity
              style={[styles.skipBtn, { backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5", borderColor: isDark ? "#2a2a2a" : "#e8e8e8" }]}
              onPress={() => previousTrack()}
              activeOpacity={0.7}
            >
              <Ionicons name="play-skip-back" size={14} color={isDark ? "#666" : "#aaa"} />
            </TouchableOpacity>

            <Animated.View style={{ transform: [{ scale: playScale }] }}>
              <TouchableOpacity onPress={handlePlayPress} activeOpacity={0.9}>
                <LinearGradient
                  colors={[primary, primary + "cc"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.playBtn,
                    Platform.OS === "ios"
                      ? { shadowColor: primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.45, shadowRadius: 10 }
                      : { elevation: 8 },
                  ]}
                >
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={22}
                    color={isDark ? "#000" : "#000"}
                    style={isPlaying ? undefined : { marginLeft: 2 }}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
              style={[styles.skipBtn, { backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5", borderColor: isDark ? "#2a2a2a" : "#e8e8e8" }]}
              onPress={() => nextTrack()}
              activeOpacity={0.7}
            >
              <Ionicons name="play-skip-forward" size={14} color={isDark ? "#666" : "#aaa"} />
            </TouchableOpacity>
          </View>
        </View>

        {}
        <View style={[styles.volumeRow, { borderTopColor: isDark ? primary + "14" : primary + "0e" }]}>
          <Ionicons name="volume-low" size={12} color={isDark ? "#444" : "#ccc"} />
          <Slider
            style={styles.slider}
            value={volume}
            onValueChange={setVolume}
            minimumValue={0}
            maximumValue={1}
            step={0.01}
            minimumTrackTintColor={primary}
            maximumTrackTintColor={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}
            thumbTintColor={primary}
          />
          <Ionicons name="volume-high" size={12} color={isDark ? "#444" : "#ccc"} />
          <Text style={[styles.volumePct, { color: isDark ? "#444" : "#ccc" }]}>
            {Math.round(volume * 100)}%
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
    marginTop: 2,
    borderRadius: 22,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
    }),
  },
  card: {
    borderRadius: 22,
    borderWidth: 1.5,
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 4,
    position: "relative",
  },
  topStrip: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0.7,
  },
  glowBlob: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    top: -40,
    right: -30,
  },

  mainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 12,
    marginTop: 6,
  },

  vinyl: {
    width: 64,
    height: 64,
  },
  vinylOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  vinylGroove: {
    position: "absolute",
    borderWidth: 1,
  },
  vinylLabel: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },

  trackSection: {
    flex: 1,
    gap: 4,
  },
  labelPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 2,
  },
  labelDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  labelText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.0,
  },
  trackName: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.1,
  },
  trackSub: {
    fontSize: 11,
    fontWeight: "500",
  },
  waveform: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
    height: 18,
    marginTop: 4,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: "#39FF14",
    opacity: 0.65,
  },

  controlsCol: {
    alignItems: "center",
    gap: 8,
  },
  skipBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  playBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },

  volumeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderTopWidth: 1,
    paddingTop: 4,
    paddingBottom: 8,
  },
  slider: {
    flex: 1,
    height: 32,
  },
  volumePct: {
    fontSize: 10,
    fontWeight: "600",
    minWidth: 28,
    textAlign: "right",
  },
});