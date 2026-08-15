import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { parsePrayerTime } from './nextPrayer';

export const NOTIFICATIONS_KEY = 'notificationsEnabled';

// The Today screen stores the last prayer times it fetched here, so Settings
// can schedule reminders without doing its own network + location work.
export const LAST_TIMINGS_KEY = 'lastTimings';

const CHANNEL_ID = 'prayer-reminders';

// Decides what happens when a notification arrives while the app is open.
// All four fields are required by expo-notifications in SDK 54.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Android needs a channel before anything can be shown.
async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Prayer Reminders',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#6a6ac0',
  });
}

// Ask for permission, but only prompt if we don't already have an answer.
export async function requestNotificationPermission() {
  const settings = await Notifications.getPermissionsAsync();

  if (settings.status === 'granted') return true;
  if (!settings.canAskAgain) return false;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// Has the user turned reminders on in Settings?
export async function areRemindersEnabled() {
  try {
    const saved = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
    return saved === 'true';
  } catch (error) {
    console.log('Error reading reminder setting:', error);
    return false;
  }
}

export async function setRemindersEnabled(enabled) {
  try {
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, String(enabled));
  } catch (error) {
    console.log('Error saving reminder setting:', error);
  }
}

export async function cancelPrayerNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Schedule one repeating daily notification per prayer.
//
// `timings` is the Aladhan response object ({ Fajr: "05:23", ... }).
// Prayer times drift by a minute or two each day, so we clear and re-schedule
// every time fresh times are loaded rather than trusting yesterday's schedule.
export async function schedulePrayerNotifications(timings) {
  const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  await ensureAndroidChannel();
  await cancelPrayerNotifications();

  for (const name of prayers) {
    const time = timings[name];
    if (!time) continue;

    const { hours, minutes } = parsePrayerTime(time);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${name} time`,
        body: `It's time for ${name}. Open Streak to mark it complete.`,
        data: { prayer: name },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
        channelId: CHANNEL_ID,
      },
    });
  }
}

// Used by the Settings screen to show how many reminders are actually queued.
export async function getScheduledCount() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.length;
}
