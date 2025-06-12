import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';


export default function Home() {
  
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        setIsLoggedIn(!!token);
      } catch (error) {
        Alert.alert('Error', 'Failed to load login status.');
      }
    };
    checkLoginStatus();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    setIsLoggedIn(false);
  };

  const quotes = [
    '   No pain, no gain.',
    '   Push harder than yesterday if you want a different tomorrow.',
    '   Your body can stand almost anything. It’s your mind you have to convince.',
  ];

  if (isLoggedIn === null) {
    // Loading state while checking AsyncStorage
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#39FF14' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#0f0c29', '#302b63', '#24243e']}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Top Row: Logo + Buttons or Logout */}
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => router.replace('/')}>
            <Text style={styles.logo}>GymBro</Text>
          </TouchableOpacity>

          {isLoggedIn ? (
            <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
              <AntDesign name="logout" size={20} color="#0f0c29" />
              <Text style={styles.iconText}>Logout</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.topButtons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => router.push('/login')}
              >
                <AntDesign name="login" size={20} color="#0f0c29" />
                <Text style={styles.iconText}>Login</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => router.push('/signup')}
              >
                <AntDesign name="adduser" size={20} color="#0f0c29" />
                <Text style={styles.iconText}>Sign Up</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => router.push('/admin/login')}
              >
                <AntDesign name="lock" size={20} color="#0f0c29" />
                <Text style={styles.iconText}>Admin</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Animated Welcome Text */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 800 }}
        >
          <Text style={styles.welcome}>🏋️ Welcome to your journey</Text>
        </MotiView>

        {/* Quotes */}
        <View style={styles.quoteSection}>
          {quotes.map((quote, i) => (
            <Text key={i} style={styles.quoteText}>
              {quote}
            </Text>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#39FF14',
    textShadowColor: 'rgba(0, 255, 100, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  topButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C6FF00',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  iconText: {
    color: '#0f0c29',
    marginLeft: 6,
    fontWeight: 'bold',
  },
  welcome: {
    fontSize: 22,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  quoteSection: {
    backgroundColor: '#1A1A1A',
    borderRadius: 25,
    padding: 20,
    borderColor: '#39FF14',
    borderWidth: 1.2,
  },
  quoteText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 14,
  },
});
