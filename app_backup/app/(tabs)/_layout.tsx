import TabBarBackground from '@/components/ui/TabBarBackground';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor'; 
import { Colors } from '@/constants/Colors'; 
import { useSimpleTheme } from '../context/SimpleThemeContext';

export default function TabLayout() {
  const { theme } = useSimpleTheme(); 
  const currentColors = Colors[theme]; 
  const backgroundColor = useThemeColor({}, 'background');
  const tabBarActive = useThemeColor({}, 'primary');
  const tabBarInactive = useThemeColor({ light: '#fff', dark: '#000' }, 'text');

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: currentColors.background, // CHANGE
          borderTopWidth: 0,
          elevation: 10,
          shadowOpacity: 0.1,
          height: 60,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
        },
        tabBarBackground: () => (
          <TabBarBackground style={{ backgroundColor: currentColors.background }} /> // CHANGE
        ),
        headerShown: false,
        tabBarActiveTintColor: currentColors.primary, // CHANGE
        tabBarInactiveTintColor: theme === 'dark' ? '#888' : '#666', // CHANGE
        tabBarLabelStyle: {
          fontWeight: '700',
          fontSize: 13,
          marginBottom: 6,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calculator"
        options={{
          title: 'Calculator',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calculator" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Workout',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="barbell" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tabs/news"
        options={{
          title: 'Gym News',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="newspaper" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}