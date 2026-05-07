import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Track = {
  id: number;
  name: string;
  file: any;
  isValid: boolean;
};

type MusicContextType = {
  isPlaying: boolean;
  currentTrack: Track;
  volume: number;
  isAdmin: boolean;
  hasValidTracks: boolean;
  playMusic: () => Promise<void>;
  pauseMusic: () => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  setVolume: (volume: number) => void;
  stopMusic: () => Promise<void>;
  availableTracks: Track[];
};

const MusicContext = createContext<MusicContextType | undefined>(undefined);

const track1 = (() => { try { return require('../assets/music/track1.mp3'); } catch { return null; } })();
const track2 = (() => { try { return require('../assets/music/track2.mp3'); } catch { return null; } })();
const track3 = (() => { try { return require('../assets/music/track3.mp3'); } catch { return null; } })();
const track4 = (() => { try { return require('../assets/music/track4.mp3'); } catch { return null; } })();
const track5 = (() => { try { return require('../assets/music/track5.mp3'); } catch { return null; } })();

const allTracks: Track[] = [
  { id: 1, name: "Relaxing Ambient",  file: track1, isValid: track1 !== null },
  { id: 2, name: "Workout Energy",    file: track2, isValid: track2 !== null },
  { id: 3, name: "Focus Mode",        file: track3, isValid: track3 !== null },
  { id: 4, name: "Chill Lo-Fi",       file: track4, isValid: track4 !== null },
  { id: 5, name: "Morning Stretch",   file: track5, isValid: track5 !== null },
];

const tracks: Track[] = allTracks.filter(t => t.isValid);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying]           = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolumeState]            = useState(0.5);
  const [isAdmin, setIsAdmin]               = useState(false);
  const soundRef                            = useRef<Audio.Sound | null>(null);
  const volumeRef = useRef(0.5);

  const hasValidTracks = tracks.length > 0;
  const currentTrack   = hasValidTracks
    ? tracks[currentTrackIndex]
    : { id: 0, name: "No Tracks", file: null, isValid: false };

  useEffect(() => { checkUserRole(); }, []);

  const checkUserRole = async () => {
    try {
      const role = await AsyncStorage.getItem('userRole');
      setIsAdmin(role === 'admin');
    } catch (error) {
      console.error('Failed to check user role:', error);
    }
  };

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: 1,
    });
    return () => {
      if (soundRef.current) {
        soundRef.current.stopAsync();
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const playTrackByIndex = async (index: number) => {
    if (isAdmin || !hasValidTracks) return;
    const track = tracks[index];
    if (!track?.isValid || !track?.file) return;

    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        track.file,
        { isLooping: true, volume: volumeRef.current, shouldPlay: true }
      );
      soundRef.current = sound;
      setCurrentTrackIndex(index);
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to play track:', error);
    }
  };

  const playMusic = async () => {
    if (isAdmin || !hasValidTracks) return;
    if (isPlaying && soundRef.current) return;
    if (!isPlaying && soundRef.current) {
      try {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      } catch (error) {
        console.error('Failed to resume music:', error);
      }
      return;
    }
    await playTrackByIndex(currentTrackIndex);
  };

  const pauseMusic = async () => {
    if (soundRef.current && isPlaying) {
      try {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } catch (error) {
        console.error('Failed to pause music:', error);
      }
    }
  };

  const stopMusic = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (_) {}
      soundRef.current = null;
      setIsPlaying(false);
    }
  };

  const nextTrack = async () => {
    if (!hasValidTracks) return;
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    if (isPlaying) {
      await playTrackByIndex(nextIndex);   
    } else {
      setCurrentTrackIndex(nextIndex);     
    }
  };

  const previousTrack = async () => {
    if (!hasValidTracks) return;
    const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    if (isPlaying) {
      await playTrackByIndex(prevIndex);
    } else {
      setCurrentTrackIndex(prevIndex);
    }
  };

  const setVolume = (newVolume: number) => {
    volumeRef.current = newVolume;
    setVolumeState(newVolume);
    if (soundRef.current) {
      soundRef.current.setVolumeAsync(newVolume);
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      const role = await AsyncStorage.getItem('userRole');
      const newIsAdmin = role === 'admin';
      if (newIsAdmin && !isAdmin) await stopMusic();
      setIsAdmin(newIsAdmin);
    }, 1000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  useEffect(() => {
    console.log(`🎵 Music tracks available: ${tracks.length}`);
    if (tracks.length === 0) console.log('⚠️ No music files found.');
  }, []);

  return (
    <MusicContext.Provider value={{
      isPlaying,
      currentTrack,
      volume,
      isAdmin,
      hasValidTracks,
      playMusic,
      pauseMusic,
      nextTrack,
      previousTrack,
      setVolume,
      stopMusic,
      availableTracks: tracks,
    }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) throw new Error('useMusic must be used within MusicProvider');
  return context;
}