import { Colors } from '@/constants/Colors';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
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

const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (!password || password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters' };
  }
  return { isValid: true, message: '' };
};

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { theme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === 'dark';
  const params = useLocalSearchParams();
  const { token } = params;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [touchedPassword, setTouchedPassword] = useState(false);
  const [touchedConfirm, setTouchedConfirm] = useState(false);

  const primaryColor = '#39FF14';

  useEffect(() => {
    // Check if token exists
    if (!token) {
      setTokenValid(false);
      Alert.alert(
        'Invalid Link', 
        'This password reset link is invalid. Please request a new one.',
        [{ text: 'OK', onPress: () => router.push('/forgot-password') }]
      );
    }
  }, [token]);

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setTouchedPassword(true);
    const { isValid, message } = validatePassword(text);
    setPasswordError(isValid ? null : message);
    
    // Also check if confirm password matches
    if (confirmPassword && text !== confirmPassword) {
      setConfirmError('Passwords do not match');
    } else if (confirmPassword && text === confirmPassword) {
      setConfirmError(null);
    }
  };

  const handleConfirmChange = (text: string) => {
    setConfirmPassword(text);
    setTouchedConfirm(true);
    if (password !== text) {
      setConfirmError('Passwords do not match');
    } else {
      setConfirmError(null);
    }
  };

  const handleResetPassword = async () => {
    setTouchedPassword(true);
    setTouchedConfirm(true);
    
    const { isValid } = validatePassword(password);
    
    if (!isValid) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      setConfirmError('Passwords do not match');
      return;
    }

    if (!token) {
      Alert.alert('Error', 'Invalid reset link');
      return;
    }

    setLoading(true);

    try {
      // For web, token comes as string, for mobile it might be array
      const tokenValue = Array.isArray(token) ? token[0] : token;
      
      const response = await fetch(`http://192.168.100.143:3000/api/users/reset-password/${tokenValue}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json() as { success?: boolean; error?: string };

      if (response.ok && data.success) {
        setResetSuccess(true);
      } else {
        Alert.alert('Error', data.error || 'Failed to reset password');
      }
    } catch (error) {
      Alert.alert('Network Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return null; // Will redirect via the Alert above
  }

  if (resetSuccess) {
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
        </View>
        
        <View style={styles.successContainer}>
          <View style={[styles.iconCircle, { backgroundColor: primaryColor + '20' }]}>
            <Ionicons name="checkmark-circle" size={60} color={primaryColor} />
          </View>
          <Text style={[styles.successTitle, { color: currentColors.text }]}>
            Password Reset!
          </Text>
          <Text style={[styles.successText, { color: isDark ? '#888' : '#666' }]}>
            Your password has been successfully reset. You can now log in with your new password.
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: primaryColor }]}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.buttonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
            
            <View style={styles.iconContainer}>
              <View style={[styles.iconCircle, { backgroundColor: primaryColor + '20' }]}>
                <Ionicons name="lock-open" size={40} color={primaryColor} />
              </View>
            </View>
            
            <Text style={[styles.title, { color: currentColors.text }]}>
              Reset Password
            </Text>
            
            <Text style={[styles.subtitle, { color: isDark ? '#888' : '#666' }]}>
              Enter your new password below.
            </Text>

            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: currentColors.text }]}>New Password</Text>
              <View style={[
                styles.passwordContainer,
                {
                  backgroundColor: isDark ? currentColors.background : '#F8F9FA',
                  borderColor: passwordError && touchedPassword 
                    ? '#FF4444' 
                    : (isDark ? currentColors.border : '#E0E0E0'),
                }
              ]}>
                <TextInput
                  style={[styles.passwordInput, { color: currentColors.text }]}
                  placeholder="Enter new password"
                  placeholderTextColor={isDark ? '#999' : '#888'}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={handlePasswordChange}
                  onBlur={() => setTouchedPassword(true)}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Feather
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={isDark ? '#999' : '#666'}
                  />
                </TouchableOpacity>
              </View>
              {passwordError && touchedPassword && (
                <Text style={styles.errorMessage}>{passwordError}</Text>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: currentColors.text }]}>Confirm Password</Text>
              <View style={[
                styles.passwordContainer,
                {
                  backgroundColor: isDark ? currentColors.background : '#F8F9FA',
                  borderColor: confirmError && touchedConfirm 
                    ? '#FF4444' 
                    : (isDark ? currentColors.border : '#E0E0E0'),
                }
              ]}>
                <TextInput
                  style={[styles.passwordInput, { color: currentColors.text }]}
                  placeholder="Confirm new password"
                  placeholderTextColor={isDark ? '#999' : '#888'}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={handleConfirmChange}
                  onBlur={() => setTouchedConfirm(true)}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Feather
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={isDark ? '#999' : '#666'}
                  />
                </TouchableOpacity>
              </View>
              {confirmError && touchedConfirm && (
                <Text style={styles.errorMessage}>{confirmError}</Text>
              )}
            </View>

            {password && confirmPassword && password === confirmPassword && password.length >= 6 && (
              <View style={styles.matchIndicator}>
                <Ionicons name="checkmark-circle" size={16} color={primaryColor} />
                <Text style={[styles.matchText, { color: primaryColor }]}>Passwords match</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, { 
                backgroundColor: primaryColor,
                opacity: loading ? 0.7 : 1,
              }]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.buttonText}>Reset Password</Text>
              )}
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
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
  },
  errorMessage: {
    color: '#FF4444',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 8,
  },
  matchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
    marginLeft: 4,
  },
  matchText: {
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  successText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
});