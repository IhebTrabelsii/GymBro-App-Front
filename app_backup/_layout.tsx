import { useColorScheme } from '@/hooks/useColorScheme';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';
import { ThemeProvider } from './context/ThemeContext';
import { SimpleThemeProvider } from './context/SimpleThemeContext'; // CHANGE THIS

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <SimpleThemeProvider> 
      {/* REMOVE hardcoded backgroundColor from View */}
      <View style={{ flex: 1 }}>
        <Stack
          // REMOVE hardcoded colors from screenOptions
          screenOptions={{}}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </View>
    </SimpleThemeProvider>
  );
}