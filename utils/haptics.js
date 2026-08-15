import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const HAPTICS_KEY = 'hapticsEnabled';

// On by default — the user has to opt out, not in.
export async function areHapticsEnabled() {
  try {
    const saved = await AsyncStorage.getItem(HAPTICS_KEY);
    return saved !== 'false';
  } catch (error) {
    console.log('Error reading haptics setting:', error);
    return true;
  }
}

export async function setHapticsEnabled(enabled) {
  try {
    await AsyncStorage.setItem(HAPTICS_KEY, String(enabled));
  } catch (error) {
    console.log('Error saving haptics setting:', error);
  }
}

// A short confirmation buzz — used when the compass lines up with the Qibla.
// Reads the setting on every call, which is fine because this only fires on a
// state change, not on every sensor reading.
export async function alignedFeedback() {
  if (!(await areHapticsEnabled())) return;

  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    // Some devices have no vibration hardware — not worth surfacing.
    console.log('Haptics unavailable:', error);
  }
}
