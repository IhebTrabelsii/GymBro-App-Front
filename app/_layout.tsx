import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import "react-native-reanimated";
import { MusicProvider } from "../context/MusicContext";
import { SimpleThemeProvider } from "../context/SimpleThemeContext";
import { ThemeProvider } from "../context/ThemeContext";

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <SimpleThemeProvider>
      <ThemeProvider>
        <MusicProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
            <Stack.Screen name="forgot-password" />
            <Stack.Screen name="reset-password" />
            <Stack.Screen name="verify-email" />
            <Stack.Screen name="change-password" />
            <Stack.Screen name="privacy-settings" />
            <Stack.Screen name="notification-settings" />
            <Stack.Screen name="edit-profile" />
            <Stack.Screen name="+not-found" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="settings/privacy-policy" />
            <Stack.Screen name="settings/terms-of-service" />
            <Stack.Screen name="settings/contact-support" />
            <Stack.Screen name="form-check" />
            <Stack.Screen name="Hydration" />
            <Stack.Screen name="config/schedule" />
            <Stack.Screen name="sleep" />
            <Stack.Screen name="config/progress" />
            <Stack.Screen name="config/sleep-mode" />
            <Stack.Screen name="config/test" />
          </Stack>
          <StatusBar style="auto" />
        </MusicProvider>
      </ThemeProvider>
    </SimpleThemeProvider>
  );
}
