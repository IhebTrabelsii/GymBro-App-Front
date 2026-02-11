import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';
import { SimpleThemeProvider } from '../context/SimpleThemeContext';
import { ThemeProvider } from '../context/ThemeContext';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <SimpleThemeProvider>
      <ThemeProvider> 
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{}}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </View>
      </ThemeProvider>
    </SimpleThemeProvider>
  );
}