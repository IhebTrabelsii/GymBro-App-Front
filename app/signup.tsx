import { Colors } from '@/constants/Colors';
import { Feather, FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
import { useSimpleTheme } from '../context/SimpleThemeContext';
import { signInWithApple, signInWithGoogle } from "./utils/socialAuth";

Dimensions.get('window');

// Email validation function
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// Password validation function
const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (!password || password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters' };
  }
  return { isValid: true, message: '' };
};

// Helper to check if Apple Sign In is available
const isAppleSignInAvailable = (): boolean => {
  return Platform.OS === 'ios';
};

export default function SignUpScreen() {
  const router = useRouter();
  const { theme, toggleTheme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === 'dark';
  
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "apple" | null>(null);
  const [error, setError] = useState('');
  
  // Validation states
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [touchedEmail, setTouchedEmail] = useState(false);
  const [touchedPassword, setTouchedPassword] = useState(false);

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setTouchedEmail(true);
    if (text.trim() === '') {
      setEmailError('Email is required');
    } else if (!validateEmail(text)) {
      setEmailError('Please enter a valid email (e.g., name@example.com)');
    } else {
      setEmailError(null);
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setTouchedPassword(true);
    const { isValid, message } = validatePassword(text);
    setPasswordError(isValid ? null : message);
  };

  const isFormValid = fullName.trim() && phone.trim() && email.trim() && password.trim() && !emailError && !passwordError;

  const handleSignUp = async () => {
    // Mark fields as touched to show validation errors
    setTouchedEmail(true);
    setTouchedPassword(true);
    
    // Validate email
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
    }
    
    // Validate password
    const { isValid: isPasswordValid, message: passwordMessage } = validatePassword(password);
    if (!isPasswordValid) {
      setPasswordError(passwordMessage);
    }

    if (!isFormValid) {
      Alert.alert('Error', 'Please fix the errors before continuing');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://192.168.100.143:3000/api/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: fullName, phone, email, password })
      });

      let data;
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error((data as { error?: string }).error || 'Signup failed');
      }

      Alert.alert('Success', 'Signup successful! You can now log in.');
      router.push('/login');
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message || 'Something went wrong');
      } else {
        setError('Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSocialLoading("google");
    const result = await signInWithGoogle();

    if (result.success) {
      router.replace("/");
    } else {
      Alert.alert(
        "Google Sign In Failed",
        result.error || "Something went wrong",
      );
    }
    setSocialLoading(null);
  };

  const handleAppleSignIn = async () => {
    setSocialLoading("apple");
    const result = await signInWithApple();

    if (result.success) {
      router.replace("/");
    } else {
      // Don't show error for platform unavailability
      if (result.error !== 'Apple Sign In is only available on iOS devices') {
        Alert.alert(
          "Apple Sign In Failed",
          result.error || "Something went wrong",
        );
      }
    }
    setSocialLoading(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      {/* Professional Header - Matching Homepage */}
      <View style={[styles.topBar, { 
        backgroundColor: isDark ? currentColors.background : '#FFFFFF',
        borderBottomColor: isDark ? currentColors.border : 'rgba(57, 255, 20, 0.15)',
      }]}>
        <TouchableOpacity onPress={() => router.replace('/')} activeOpacity={0.7}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="dumbbell" size={28} color={currentColors.primary} />
            <Text style={[styles.logo, { color: currentColors.primary }]}>
              GymBro
            </Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.topRightSection}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={[styles.backButton, { 
              backgroundColor: isDark ? currentColors.card : '#F5F5F5',
              borderWidth: 1.5,
              borderColor: currentColors.primary,
            }]}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={18} color={currentColors.primary} />
            <Text style={[styles.backText, { color: currentColors.primary }]}>
              Back
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          onPress={toggleTheme}
          style={[styles.themeToggle, {
            backgroundColor: currentColors.primary,
            shadowColor: currentColors.primary,
          }]}
          activeOpacity={0.8}
        >
          <Ionicons 
            name={isDark ? 'sunny' : 'moon'} 
            size={20} 
            color={isDark ? currentColors.background : '#FFFFFF'} 
          />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Hero Section */}
          <View>
            <View style={[styles.heroCard, { 
              backgroundColor: isDark ? currentColors.card : '#FFFFFF',
              borderColor: isDark ? currentColors.primary : 'rgba(57, 255, 20, 0.2)',
              shadowColor: isDark ? currentColors.primary : '#000',
            }]}>
              <View style={styles.heroContent}>
                <View style={[styles.iconCircle, { 
                  backgroundColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.1)' 
                }]}>
                  <MaterialCommunityIcons name="account-plus" size={40} color={currentColors.primary} />
                </View>
                <Text style={[styles.heroTitle, { color: currentColors.text }]}>
                  Join GymBro
                </Text>
                <Text style={[styles.heroSubtitle, { 
                  color: isDark ? currentColors.text : '#666' 
                }]}>
                  Start your fitness journey with us today
                </Text>
              </View>
            </View>
          </View>

          {/* Error Message */}
          {!!error && (
            <View>
              <View style={[styles.errorCard, { 
                backgroundColor: isDark ? currentColors.card : '#FFFFFF',
                borderColor: isDark ? '#FF444440' : '#FF444420',
              }]}>
                <View style={[styles.errorIcon, { backgroundColor: '#FF444420' }]}>
                  <Ionicons name="warning" size={20} color="#FF4444" />
                </View>
                <Text style={[styles.errorText, { color: isDark ? '#FF6B6B' : '#D32F2F' }]}>
                  {error}
                </Text>
              </View>
            </View>
          )}

          {/* Sign Up Form */}
          <View>
            <View style={[styles.formCard, { 
              backgroundColor: isDark ? currentColors.card : '#FFFFFF',
              borderColor: isDark ? 'rgba(57, 255, 20, 0.3)' : 'rgba(57, 255, 20, 0.15)',
              shadowColor: isDark ? currentColors.primary : '#000',
            }]}>
              {/* Full Name Input */}
              <View style={styles.inputGroup}>
                <View style={styles.inputLabelContainer}>
                  <View style={[styles.inputIcon, { 
                    backgroundColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.1)' 
                  }]}>
                    <Feather name="user" size={18} color={currentColors.primary} />
                  </View>
                  <Text style={[styles.inputLabel, { color: currentColors.text }]}>
                    Full Name
                  </Text>
                </View>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: isDark ? currentColors.background : '#F8F9FA',
                    color: currentColors.text,
                    borderColor: isDark ? currentColors.border : '#E0E0E0',
                  }]}
                  placeholder="Enter your full name"
                  placeholderTextColor={isDark ? '#999' : '#888'}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  autoComplete="name"
                  autoCorrect={false}
                />
              </View>

              {/* Phone Input */}
              <View style={styles.inputGroup}>
                <View style={styles.inputLabelContainer}>
                  <View style={[styles.inputIcon, { 
                    backgroundColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.1)' 
                  }]}>
                    <Feather name="phone" size={18} color={currentColors.primary} />
                  </View>
                  <Text style={[styles.inputLabel, { color: currentColors.text }]}>
                    Phone Number
                  </Text>
                </View>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: isDark ? currentColors.background : '#F8F9FA',
                    color: currentColors.text,
                    borderColor: isDark ? currentColors.border : '#E0E0E0',
                  }]}
                  placeholder="Enter your phone number"
                  placeholderTextColor={isDark ? '#999' : '#888'}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  autoComplete="tel"
                />
              </View>

              {/* Email Input - With Validation */}
              <View style={styles.inputGroup}>
                <View style={styles.inputLabelContainer}>
                  <View style={[styles.inputIcon, { 
                    backgroundColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.1)' 
                  }]}>
                    <Feather name="mail" size={18} color={currentColors.primary} />
                  </View>
                  <Text style={[styles.inputLabel, { color: currentColors.text }]}>
                    Email Address
                  </Text>
                </View>
                <TextInput
                  style={[
                    styles.input, 
                    { 
                      backgroundColor: isDark ? currentColors.background : '#F8F9FA',
                      color: currentColors.text,
                      borderColor: emailError && touchedEmail 
                        ? '#FF4444' 
                        : (isDark ? currentColors.border : '#E0E0E0'),
                    }
                  ]}
                  placeholder="Enter your email"
                  placeholderTextColor={isDark ? '#999' : '#888'}
                  keyboardType="email-address"
                  value={email}
                  onChangeText={handleEmailChange}
                  onBlur={() => setTouchedEmail(true)}
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                />
                {emailError && touchedEmail && (
                  <Text style={styles.errorMessage}>
                    {emailError}
                  </Text>
                )}
              </View>

              {/* Password Input - With Validation */}
              <View style={styles.inputGroup}>
                <View style={styles.inputLabelContainer}>
                  <View style={[styles.inputIcon, { 
                    backgroundColor: isDark ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.1)' 
                  }]}>
                    <Feather name="lock" size={18} color={currentColors.primary} />
                  </View>
                  <Text style={[styles.inputLabel, { color: currentColors.text }]}>
                    Password
                  </Text>
                </View>
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
                    placeholder="Create a strong password"
                    placeholderTextColor={isDark ? '#999' : '#888'}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={handlePasswordChange}
                    onBlur={() => setTouchedPassword(true)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="newPassword"
                  />
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                    activeOpacity={0.7}
                  >
                    <Feather
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={isDark ? '#999' : '#666'}
                    />
                  </TouchableOpacity>
                </View>
                {passwordError && touchedPassword && (
                  <Text style={styles.errorMessage}>
                    {passwordError}
                  </Text>
                )}
                {password.length > 0 && password.length < 6 && (
                  <Text style={styles.passwordHint}>
                    {6 - password.length} more characters needed
                  </Text>
                )}
              </View>

              {/* Sign Up Button */}
              <View>
                <TouchableOpacity
                  style={[styles.signupButton, { 
                    backgroundColor: currentColors.primary,
                    shadowColor: currentColors.primary,
                    opacity: !isFormValid || loading ? 0.6 : 1,
                  }]}
                  onPress={handleSignUp}
                  disabled={!isFormValid || loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color={isDark ? currentColors.background : '#FFFFFF'} />
                  ) : (
                    <>
                      <Text style={[styles.signupButtonText, { 
                        color: isDark ? currentColors.background : '#FFFFFF' 
                      }]}>
                        Create Account
                      </Text>
                      <Ionicons 
                        name="arrow-forward" 
                        size={20} 
                        color={isDark ? currentColors.background : '#FFFFFF'} 
                      />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Divider */}
          <View>
            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { 
                backgroundColor: isDark ? currentColors.border : '#E0E0E0' 
              }]} />
              <Text style={[styles.dividerText, { 
                color: isDark ? currentColors.text : '#666' 
              }]}>
                Or sign up with
              </Text>
              <View style={[styles.divider, { 
                backgroundColor: isDark ? currentColors.border : '#E0E0E0' 
              }]} />
            </View>
          </View>

          {/* Social Sign Up */}
          <View>
            <View style={[styles.socialCard, { 
              backgroundColor: isDark ? currentColors.card : '#FFFFFF',
              borderColor: isDark ? 'rgba(57, 255, 20, 0.3)' : 'rgba(57, 255, 20, 0.15)',
              shadowColor: isDark ? currentColors.primary : '#000',
            }]}>
              <Text style={[styles.socialTitle, { color: currentColors.text }]}>
                Social Sign Up
              </Text>
              <View style={styles.socialButtons}>
                {/* Google Button - Works on ALL platforms */}
                <TouchableOpacity 
                  style={[styles.socialButton, { 
                    backgroundColor: isDark ? currentColors.background : '#F8F9FA',
                    borderColor: isDark ? currentColors.border : '#E0E0E0',
                    opacity: socialLoading === "google" ? 0.7 : 1,
                    flex: isAppleSignInAvailable() ? 1 : 2,
                  }]}
                  activeOpacity={0.7}
                  onPress={handleGoogleSignIn}
                  disabled={socialLoading !== null}
                >
                  {socialLoading === "google" ? (
                    <ActivityIndicator size="small" color={currentColors.primary} />
                  ) : (
                    <FontAwesome name="google" size={22} color="#DB4437" />
                  )}
                  <Text style={[styles.socialButtonText, { color: currentColors.text }]}>
                    {socialLoading === "google" ? "Signing in..." : "Google"}
                  </Text>
                </TouchableOpacity>

                {/* Apple Button - iOS ONLY */}
                {isAppleSignInAvailable() && (
                  <TouchableOpacity 
                    style={[styles.socialButton, { 
                      backgroundColor: isDark ? currentColors.background : '#F8F9FA',
                      borderColor: isDark ? currentColors.border : '#E0E0E0',
                      opacity: socialLoading === "apple" ? 0.7 : 1,
                      flex: 1,
                    }]}
                    activeOpacity={0.7}
                    onPress={handleAppleSignIn}
                    disabled={socialLoading !== null}
                  >
                    {socialLoading === "apple" ? (
                      <ActivityIndicator size="small" color={currentColors.primary} />
                    ) : (
                      <FontAwesome name="apple" size={22} color={currentColors.text} />
                    )}
                    <Text style={[styles.socialButtonText, { color: currentColors.text }]}>
                      {socialLoading === "apple" ? "Signing in..." : "Apple"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {/* Optional note for Android users */}
              {!isAppleSignInAvailable() && (
                <Text style={[styles.noteText, { color: isDark ? '#888' : '#666' }]}>
                  Apple Sign In is available on iOS devices
                </Text>
              )}
            </View>
          </View>

          {/* Login Link */}
          <View>
            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: isDark ? currentColors.text : '#666' }]}>
                Already have an account?
              </Text>
              <TouchableOpacity 
                onPress={() => router.push('/login')}
                activeOpacity={0.7}
              >
                <Text style={[styles.loginLink, { color: currentColors.primary }]}>
                  Sign in now
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Back to Home */}
          <View>
            <TouchableOpacity 
              style={[styles.homeButton, { 
                backgroundColor: isDark ? currentColors.card : '#FFFFFF',
                borderColor: isDark ? 'rgba(57, 255, 20, 0.3)' : 'rgba(57, 255, 20, 0.2)',
              }]}
              activeOpacity={0.8}
              onPress={() => router.push('/')}
            >
              <MaterialCommunityIcons name="home" size={20} color={currentColors.primary} />
              <Text style={[styles.homeButtonText, { color: currentColors.text }]}>
                Back to Home
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// Add these new styles to your existing StyleSheet
const styles = StyleSheet.create({
  // ... keep all your existing styles above
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    borderBottomWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  themeToggle: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  topRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  backText: {
    fontWeight: '600',
    fontSize: 14,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 24,
    padding: 28,
    marginBottom: 20,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  heroContent: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    opacity: 0.8,
    textAlign: 'center',
  },
  errorCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  errorIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
  formCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  inputIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  input: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    fontSize: 15,
    fontWeight: '500',
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
    fontSize: 15,
    fontWeight: '500',
  },
  eyeButton: {
    padding: 4,
  },
  // New styles for validation
  errorMessage: {
    color: '#FF4444',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 8,
    fontWeight: '500',
  },
  passwordHint: {
    color: '#FFA500',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 8,
    fontStyle: 'italic',
  },
  signupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  signupButtonText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    borderRadius: 0.5,
  },
  dividerText: {
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 16,
    opacity: 0.7,
  },
  socialCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  socialTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  noteText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    gap: 6,
  },
  loginText: {
    fontSize: 15,
    fontWeight: '500',
  },
  loginLink: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  homeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});