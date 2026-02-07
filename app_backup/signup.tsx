import { Feather, FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useSimpleTheme } from './context/SimpleThemeContext';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

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
  const [error, setError] = useState('');

  const isFormValid = fullName.trim() && phone.trim() && email.trim() && password.trim();

  const handleSignUp = async () => {
    if (!isFormValid) {
      Alert.alert('Error', 'Please fill in all fields');
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
        throw new Error(data.error || 'Signup failed');
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
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 600 }}
          >
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
          </MotiView>

          {/* Error Message */}
          {!!error && (
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 300 }}
            >
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
            </MotiView>
          )}

          {/* Sign Up Form */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 150, duration: 500 }}
          >
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

              {/* Email Input */}
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
                  style={[styles.input, { 
                    backgroundColor: isDark ? currentColors.background : '#F8F9FA',
                    color: currentColors.text,
                    borderColor: isDark ? currentColors.border : '#E0E0E0',
                  }]}
                  placeholder="Enter your email"
                  placeholderTextColor={isDark ? '#999' : '#888'}
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                />
              </View>

              {/* Password Input */}
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
                <View style={[styles.passwordContainer, { 
                  backgroundColor: isDark ? currentColors.background : '#F8F9FA',
                  borderColor: isDark ? currentColors.border : '#E0E0E0',
                }]}>
                  <TextInput
                    style={[styles.passwordInput, { color: currentColors.text }]}
                    placeholder="Create a strong password"
                    placeholderTextColor={isDark ? '#999' : '#888'}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
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
              </View>

              {/* Sign Up Button */}
              <MotiView
                from={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 300, duration: 500 }}
              >
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
              </MotiView>
            </View>
          </MotiView>

          {/* Divider */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 450, duration: 500 }}
          >
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
          </MotiView>

          {/* Social Sign Up */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 600, duration: 500 }}
          >
            <View style={[styles.socialCard, { 
              backgroundColor: isDark ? currentColors.card : '#FFFFFF',
              borderColor: isDark ? 'rgba(57, 255, 20, 0.3)' : 'rgba(57, 255, 20, 0.15)',
              shadowColor: isDark ? currentColors.primary : '#000',
            }]}>
              <Text style={[styles.socialTitle, { color: currentColors.text }]}>
                Social Sign Up
              </Text>
              <View style={styles.socialButtons}>
                <TouchableOpacity 
                  style={[styles.socialButton, { 
                    backgroundColor: isDark ? currentColors.background : '#F8F9FA',
                    borderColor: isDark ? currentColors.border : '#E0E0E0',
                  }]}
                  activeOpacity={0.7}
                >
                  <FontAwesome name="google" size={22} color="#DB4437" />
                  <Text style={[styles.socialButtonText, { color: currentColors.text }]}>
                    Google
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.socialButton, { 
                    backgroundColor: isDark ? currentColors.background : '#F8F9FA',
                    borderColor: isDark ? currentColors.border : '#E0E0E0',
                  }]}
                  activeOpacity={0.7}
                >
                  <FontAwesome name="apple" size={22} color={currentColors.text} />
                  <Text style={[styles.socialButtonText, { color: currentColors.text }]}>
                    Apple
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </MotiView>

          {/* Login Link */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 750, duration: 500 }}
          >
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
          </MotiView>

          {/* Back to Home */}
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 900, duration: 500 }}
          >
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
          </MotiView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
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