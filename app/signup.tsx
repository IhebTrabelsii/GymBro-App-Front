import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SignUpScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

// ...existing code...
const isFormValid = fullName.trim() && phone.trim() && email.trim() && password.trim();
// ...existing code...

  const handleSignUp = async () => {
    if (!isFormValid) {
      alert('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);

// ...existing code...
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

  alert('Signup successful! You can now log in.');
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
    <ScrollView contentContainerStyle={styles.container}>
      <Ionicons name="barbell" size={40} color="#D0FF00" style={styles.icon} />
      <Text style={styles.title}>Sign up</Text>

      {!!error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.inputContainer}>
        <Feather name="user" size={18} color="#888" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Full name"
          placeholderTextColor="#888"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
          autoComplete="name"
        />
      </View>

      <View style={styles.inputContainer}>
        <Feather name="phone" size={18} color="#888" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Phone number"
          placeholderTextColor="#888"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          autoComplete="tel"
        />
      </View>

      <View style={styles.inputContainer}>
        <Feather name="mail" size={18} color="#888" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
        />
      </View>

      <View style={styles.inputContainer}>
        <Feather name="lock" size={18} color="#888" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          autoComplete="password"
          textContentType="password"
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
        >
          <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color="#888" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, (!isFormValid || loading) && { opacity: 0.6 }]}
        onPress={handleSignUp}
        disabled={!isFormValid || loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <Text style={styles.buttonText}>Get Started →</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.orText}>or</Text>

      <View style={styles.socialIcons}>
        <FontAwesome name="google" size={24} color="#D0FF00" style={styles.socialIcon} />
        <FontAwesome name="instagram" size={24} color="#D0FF00" style={styles.socialIcon} />
        <FontAwesome name="facebook" size={24} color="#D0FF00" style={styles.socialIcon} />
      </View>

      <Text style={styles.footerText}>
        Already have an account?{' '}
        <Text style={styles.linkText} onPress={() => router.push('/login')}>
          Sign In
        </Text>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0E0E0E',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    width: '100%',
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  eyeIcon: {
    position: 'absolute',
    right: 14,
  },
  input: {
    flex: 1,
    color: '#FFF',
  },
  button: {
    backgroundColor: '#D0FF00',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 36,
    marginTop: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  orText: {
    color: '#888',
    marginVertical: 16,
  },
  socialIcons: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 24,
  },
  socialIcon: {
    backgroundColor: '#1A1A1A',
    padding: 10,
    borderRadius: 12,
  },
  footerText: {
    color: '#888',
  },
  linkText: {
    color: '#D0FF00',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF4136',
    marginBottom: 10,
    textAlign: 'center',
  },
});
