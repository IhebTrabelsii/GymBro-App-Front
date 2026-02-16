import { Colors } from '@/constants/Colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSimpleTheme } from '../../context/SimpleThemeContext';
const { width } = Dimensions.get('window');

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { theme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === 'dark';

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [touchedEmail, setTouchedEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const primaryColor = '#39FF14';

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setTouchedEmail(true);
    if (text.trim() === '') {
      setEmailError('Email is required');
    } else if (!validateEmail(text)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError(null);
    }
  };

  const handleSendResetLink = async () => {
    if (!email || !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      setTouchedEmail(true);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://192.168.100.143:3000/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json() as { success?: boolean; error?: string };

      if (response.ok && data.success) {
        setEmailSent(true);
      } else {
        Alert.alert('Error', data.error || 'Something went wrong');
      }
    } catch (error) {
      Alert.alert('Network Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      <View style={[styles.topBar, { 
        backgroundColor: isDark ? currentColors.background : '#FFFFFF',
        borderBottomColor: isDark ? currentColors.border : 'rgba(57, 255, 20, 0.15)',
      }]}>
        <TouchableOpacity onPress={() => router.replace('/')} activeOpacity={0.7}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="dumbbell" size={28} color={currentColors.primary} />
            <Text style={[styles.logo, { color: currentColors.primary }]}>GymBro</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={currentColors.primary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.card, { 
            backgroundColor: isDark ? currentColors.card : '#FFFFFF',
            borderColor: primaryColor + '40',
          }]}>
            
            {!emailSent ? (
              <>
                <View style={styles.iconContainer}>
                  <View style={[styles.iconCircle, { backgroundColor: primaryColor + '20' }]}>
                    <Ionicons name="lock-open" size={40} color={primaryColor} />
                  </View>
                </View>
                
                <Text style={[styles.title, { color: currentColors.text }]}>
                  Forgot Password?
                </Text>
                
                <Text style={[styles.subtitle, { color: isDark ? '#888' : '#666' }]}>
                  Enter your email address and we'll send you a link to reset your password.
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: currentColors.text }]}>Email Address</Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: isDark ? currentColors.background : '#F8F9FA',
                        color: currentColors.text,
                        borderColor: emailError && touchedEmail 
                          ? '#FF4444' 
                          : (isDark ? currentColors.border : '#E0E0E0'),
                      },
                    ]}
                    placeholder="Enter your email"
                    placeholderTextColor={isDark ? '#999' : '#888'}
                    value={email}
                    onChangeText={handleEmailChange}
                    onBlur={() => setTouchedEmail(true)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {emailError && touchedEmail && (
                    <Text style={styles.errorMessage}>{emailError}</Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.button, { 
                    backgroundColor: primaryColor,
                    opacity: loading ? 0.7 : 1,
                  }]}
                  onPress={handleSendResetLink}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <Text style={styles.buttonText}>Send Reset Link</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.iconContainer}>
                  <View style={[styles.iconCircle, { backgroundColor: primaryColor + '20' }]}>
                    <Ionicons name="mail" size={40} color={primaryColor} />
                  </View>
                </View>
                
                <Text style={[styles.title, { color: currentColors.text }]}>
                  Check Your Email
                </Text>
                
                <Text style={[styles.subtitle, { color: isDark ? '#888' : '#666' }]}>
                  We've sent a password reset link to:
                </Text>
                
                <Text style={[styles.emailDisplay, { color: primaryColor }]}>
                  {email}
                </Text>
                
                <Text style={[styles.subtitle, { color: isDark ? '#888' : '#666', marginTop: 10 }]}>
                  Click the link in the email to reset your password.
                </Text>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: primaryColor, marginTop: 20 }]}
                  onPress={() => router.push('/login')}
                >
                  <Text style={styles.buttonText}>Back to Login</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resendLink}
                  onPress={() => setEmailSent(false)}
                >
                  <Text style={[styles.resendText, { color: primaryColor }]}>
                    Didn't receive the email? Try again
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={styles.backToLogin}
              onPress={() => router.push('/login')}
            >
              <Ionicons name="arrow-back" size={16} color={primaryColor} />
              <Text style={[styles.backToLoginText, { color: primaryColor }]}>
                Back to Login
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { fontSize: 24, fontWeight: '700' },
  closeButton: { padding: 8 },
  keyboardContainer: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
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
      android: { elevation: 5 },
    }),
  },
  iconContainer: { alignItems: 'center', marginBottom: 24 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  inputGroup: { marginBottom: 24 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    fontSize: 16,
  },
  errorMessage: {
    color: '#FF4444',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 8,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  emailDisplay: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 10,
  },
  resendLink: { alignItems: 'center', marginTop: 10 },
  resendText: { fontSize: 14, fontWeight: '600' },
  backToLogin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  backToLoginText: { fontSize: 14, fontWeight: '600' },
});