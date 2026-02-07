import { FontAwesome, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { jwtDecode } from 'jwt-decode'; // Fixed import
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    // Basic email validation
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://192.168.100.143:3000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (!data.token) {
        throw new Error('No token received');
      }

      await AsyncStorage.setItem('adminToken', data.token);
      
      // Enhanced token verification
      const decoded = jwtDecode<{ role?: string }>(data.token);
      if (decoded.role !== 'admin') {
        await AsyncStorage.removeItem('adminToken');
        throw new Error('Admin privileges required');
      }

      // Success - navigate to dashboard
      router.replace('/admin/dashboard');
      
    } catch (error) {
      Alert.alert(
        'Login Error', 
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="barbell" size={48} color="#D1FF3C" />
        <Text style={styles.title}>Admin Portal</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Admin Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.inputPassword}
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry={secure}
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity 
          onPress={() => setSecure(!secure)}
          style={styles.eyeIcon}
        >
          <Ionicons
            name={secure ? 'eye-off' : 'eye'}
            size={20}
            color="#888"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleAdminLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.buttonText}>Login →</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.or}>or</Text>

      <View style={styles.socialContainer}>
        {['google', 'instagram', 'facebook'].map((social) => (
          <FontAwesome 
            key={social}
            name={social as any} 
            size={24} 
            color="#D1FF3C" 
            style={styles.icon} 
          />
        ))}
      </View>

      <Text style={styles.footerText}>
        Need help?{' '}
        <Text style={styles.link} onPress={() => router.push('/support')}>
          Contact support
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  input: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  inputPassword: {
    flex: 1,
    color: '#fff',
    paddingVertical: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  button: {
    backgroundColor: '#D1FF3C',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  or: {
    color: '#888',
    textAlign: 'center',
    marginVertical: 12,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 24,
  },
  icon: {
    marginHorizontal: 12,
  },
  footerText: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 8,
  },
  link: {
    color: '#D1FF3C',
    fontWeight: 'bold',
  },
});
