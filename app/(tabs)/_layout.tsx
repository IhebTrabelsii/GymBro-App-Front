import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';

const NEON_GREEN = '#00ff6a';
const INACTIVE_GRAY = '#666';
const TAB_BAR_BG = '#121212';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: NEON_GREEN,
        tabBarInactiveTintColor: NEON_GREEN ,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          backgroundColor: TAB_BAR_BG,
          borderTopWidth: 0,
          shadowColor: NEON_GREEN,
          shadowOpacity: 0.3,
          shadowRadius: 10,
          elevation: 10,
          position: Platform.OS === 'ios' ? 'absolute' : 'relative',
          height: 60,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
        },
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
            <IconSymbol size={size} name="house.fill" color={color} />
          ),
        }}
      />
<Tabs.Screen
  name="calculator"
  options={{
    title: 'Calculator',
    tabBarIcon: () => (
      <IconSymbol size={24} name="house.fill" color="#00ff6a" />
    ),
  }}
/>



      <Tabs.Screen
        name="workout"
        options={{
          title: 'Workout',
     tabBarIcon: ({ color }) => (  // <-- No colon here!
  <IconSymbol size={24} name="house.fill" color={color} />
),

        }}
      />
    </Tabs>
  );
}
  