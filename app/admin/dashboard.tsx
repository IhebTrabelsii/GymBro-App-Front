import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


const BACKEND_URL = 'http://192.168.100.143:3000/api/admins/stats';
 // <-- your backend URL here

export default function AdminDashboard() {
  const router = useRouter();
const [stats, setStats] = React.useState({ users: 0, plans: 0, admins: 0 });
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    // TODO: Add logout logic here (e.g., clear token)
    router.push('/admin/login');
  };

  // Fetch stats on component mount
useEffect(() => {
  fetch(BACKEND_URL)
    .then(res => res.json())
    .then(data => {
      setStats(data);
      setLoading(false);
    })
    .catch(err => {
      console.error('Failed to load stats:', err);
      setLoading(false);
    });
}, []);


  if (loading) {
    return (
      <LinearGradient colors={['#0E0E0E', '#1A1A1A', '#0E0E0E']} style={styles.container}>
        <ActivityIndicator size="large" color="#39FF14" style={{ marginTop: 50 }} />
      </LinearGradient>
    );
  }

  if (!stats) {
    return (
      <LinearGradient colors={['#0E0E0E', '#1A1A1A', '#0E0E0E']} style={styles.container}>
        <Text style={{ color: 'white', marginTop: 50, textAlign: 'center' }}>
          Failed to load stats.
        </Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0E0E0E', '#1A1A1A', '#0E0E0E']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>GymBro Admin</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#D0FF00" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={[styles.card, { borderColor: '#39FF14' }]}>
          <Text style={styles.cardTitle}>Users</Text>
          <Text style={styles.cardValue}>{stats.users}</Text>
        </View>
        <View style={[styles.card, { borderColor: '#00F0FF' }]}>
          <Text style={styles.cardTitle}>Plans</Text>
          <Text style={styles.cardValue}>{stats.plans}</Text>
        </View>
        <View style={[styles.card, { borderColor: '#FF10F0' }]}>
          <Text style={styles.cardTitle}>Admins</Text>
          <Text style={styles.cardValue}>{stats.admins}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    color: '#39FF14',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    color: '#D0FF00',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 16,
    backgroundColor: '#1A1A1A',
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  cardTitle: {
    color: '#D0FF00',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  cardValue: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
});
