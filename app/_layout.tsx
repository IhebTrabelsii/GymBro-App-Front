import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { View } from "react-native";
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
          <View style={{ flex: 1 }}>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="profile" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="signup" options={{ headerShown: false }} />
              <Stack.Screen
                name="forgot-password"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="reset-password"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="verify-email"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="change-password"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="privacy-settings"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="notification-settings"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="edit-profile"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="+not-found" />
              <Stack.Screen name="settings" options={{ headerShown: false }} />
              <Stack.Screen
                name="settings/privacy-policy"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="settings/terms-of-service"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="sleep-mode"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="settings/contact-support"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="form-check"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="Hydration" options={{ headerShown: false }} />
              <Stack.Screen
                name="config/schedule"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="config/progress"
                options={{ headerShown: false }}
              />
            </Stack>
            <StatusBar style="auto" />
          </View>
        </MusicProvider>
      </ThemeProvider>
    </SimpleThemeProvider>
  );
}
