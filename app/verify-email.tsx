import { Colors } from '@/constants/Colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSimpleTheme } from '../context/SimpleThemeContext';

const { width } = Dimensions.get('window');

// Define types for API response
type VerifyEmailResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { theme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === 'dark';
  const { token } = useLocalSearchParams();
  
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  const primaryColor = '#39FF14';

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setVerifying(false);
      setError('No verification token provided');
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await fetch(`http://192.168.100.143:3000/api/users/verify-email/${token}`);
      const data = await response.json() as VerifyEmailResponse;

      if (response.ok && data.success) {
        setVerified(true);
        Alert.alert(
          'Success! 🎉',
          'Your email has been verified! You can now log in.',
          [{ text: 'Go to Login', onPress: () => router.push('/login') }]
        );
      } else {
        setError(data.error || 'Verification failed');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      // You might want to pass email from signup or store it
      Alert.alert('Info', 'Please go to signup to resend verification email');
      router.push('/signup');
    } catch (error) {
      console.error('Resend error:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#f5f5f5' }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, { 
          backgroundColor: isDark ? '#111' : '#FFF',
          borderColor: primaryColor + '40',
        }]}>
          {verifying ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color={primaryColor} />
              <Text style={[styles.message, { color: isDark ? '#FFF' : '#000' }]}>
                Verifying your email...
              </Text>
            </View>
          ) : verified ? (
            <View style={styles.centerContent}>
              <View style={[styles.iconCircle, { backgroundColor: primaryColor + '20' }]}>
                <Ionicons name="checkmark-circle" size={60} color={primaryColor} />
              </View>
              <Text style={[styles.title, { color: isDark ? '#FFF' : '#000' }]}>
                Email Verified! 🎉
              </Text>
              <Text style={[styles.message, { color: isDark ? '#888' : '#666' }]}>
                Your email has been successfully verified. You can now log in to your account.
              </Text>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: primaryColor }]}
                onPress={() => router.push('/login')}
              >
                <Text style={styles.buttonText}>Go to Login</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.centerContent}>
              <View style={[styles.iconCircle, { backgroundColor: '#FF444420' }]}>
                <Ionicons name="warning" size={60} color="#FF4444" />
              </View>
              <Text style={[styles.title, { color: isDark ? '#FFF' : '#000' }]}>
                Verification Failed
              </Text>
              <Text style={[styles.message, { color: isDark ? '#888' : '#666' }]}>
                {error || 'The verification link is invalid or has expired.'}
              </Text>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: primaryColor }]}
                onPress={handleResendEmail}
              >
                <Text style={styles.buttonText}>Resend Verification Email</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: primaryColor }]}
                onPress={() => router.push('/signup')}
              >
                <Text style={[styles.secondaryButtonText, { color: primaryColor }]}>
                  Back to Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 24,
    padding: 32,
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  centerContent: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});