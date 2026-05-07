import { useFonts } from "expo-font";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { View } from "react-native";
import * as Notifications from 'expo-notifications';
import "react-native-reanimated";
import { SimpleThemeProvider } from "../context/SimpleThemeContext";
import { ThemeProvider } from "../context/ThemeContext";
import { MusicProvider } from "../context/MusicContext";
import { registerForPushNotificationsAsync } from "../services/notificationService";

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    // Register for push notifications on app start
    registerForPushNotificationsAsync();

    // Listen for notifications while app is open
    const notificationSub = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notification received:', notification);
    });

    // Listen for when user taps on notification
    const responseSub = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log('🔔 Notification tapped:', data);
      
      // Navigate based on notification type
      if (data?.type === 'streak' || data?.type === 'mission_complete') {
        router.push('/profile');
      }
    });

    // Cleanup - use the subscription's remove method
    return () => {
      if (notificationSub) {
        notificationSub.remove();
      }
      if (responseSub) {
        responseSub.remove();
      }
    };
  }, []);

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
              <Stack.Screen 
                name="settings" 
                options={{ headerShown: false }} 
              />
              <Stack.Screen
                name="settings/privacy-policy"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="settings/terms-of-service"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="settings/contact-support" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="auto" />
          </View>
        </MusicProvider>
      </ThemeProvider>
    </SimpleThemeProvider>
  );
}