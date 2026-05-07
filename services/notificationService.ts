// services/notificationService.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification handler - using correct return type
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,  // ← Add this property

  }),
});

export type NotificationType = 
  | 'streak' 
  | 'mission_complete' 
  | 'workout_reminder' 
  | 'achievement'
  | 'daily_checkin';

// Register for push notifications
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#39FF14',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token');
      return;
    }
    
    token = await Notifications.getExpoPushTokenAsync();
    console.log('Push token:', token);
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  if (token) {
    await saveTokenToBackend(token.data);
  }

  return token;
}

async function saveTokenToBackend(token: string) {
  try {
    const userToken = await AsyncStorage.getItem('userToken');
    if (!userToken) return;

    await fetch('http://192.168.100.143:3000/api/users/push-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify({ pushToken: token }),
    });
  } catch (error) {
    console.error('Error saving push token:', error);
  }
}

// Send local notification
export async function sendLocalNotification(title: string, body: string, data?: any) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data, sound: true },
    trigger: null,
  });
}

// Schedule a reminder
export async function scheduleReminder(title: string, body: string, seconds: number, data?: any) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data, sound: true },
    trigger: {
      seconds: seconds,
      repeats: false,
      channelId: 'default',
    } as Notifications.TimeIntervalTriggerInput,
  });
}

// Streak notifications
export async function notifyStreakUpdate(streak: number) {
  if (streak === 7) {
    await sendLocalNotification(
      '🔥 7-Day Streak!',
      `Amazing! You've worked out for 7 days in a row! Keep it up! 💪`,
      { type: 'streak', streak }
    );
  } else if (streak === 14) {
    await sendLocalNotification(
      '💪 2 Weeks Strong!',
      `14-day streak! You're building an unstoppable habit! 🔥`,
      { type: 'streak', streak }
    );
  } else if (streak === 30) {
    await sendLocalNotification(
      '👑 Monthly Master!',
      `Incredible! 30-day streak achieved! You're a true champion! 🏆`,
      { type: 'streak', streak }
    );
  } else if (streak === 100) {
    await sendLocalNotification(
      '💎 Century Club!',
      `100 DAYS! You're a legend! 👑`,
      { type: 'streak', streak }
    );
  }
}

// Mission complete notification
export async function notifyMissionComplete(missionTitle: string, reward: number) {
  await sendLocalNotification(
    '🎉 Mission Complete!',
    `${missionTitle} completed! You earned +${reward} AI messages!`,
    { type: 'mission_complete', mission: missionTitle, reward }
  );
}

// Daily reminder
export async function scheduleDailyReminder(hour: number, minute: number) {
  const now = new Date();
  const scheduled = new Date(now);
  scheduled.setHours(hour, minute, 0, 0);
  
  if (scheduled < now) {
    scheduled.setDate(scheduled.getDate() + 1);
  }
  
  const secondsUntil = Math.floor((scheduled.getTime() - now.getTime()) / 1000);
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '💪 Don\'t Break Your Streak!',
      body: 'Log your workout today to keep your streak alive! 🔥',
      sound: true,
    },
    trigger: {
      seconds: secondsUntil,
      repeats: true,
      channelId: 'default',
    } as Notifications.TimeIntervalTriggerInput,
  });
}

// Cancel all notifications
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}