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

// Every buzz goes through here, so the on/off check and the "some devices
// have no vibration hardware" guard only exist once.
async function buzz(run) {
  if (!(await areHapticsEnabled())) return;

  try {
    await run();
  } catch (error) {
    console.log('Haptics unavailable:', error);
  }
}

// A light tick — for something that repeats, like counting dhikr.
export function tapFeedback() {
  return buzz(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

// A fuller confirmation — for finishing something.
export function successFeedback() {
  return buzz(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  );
}

// Used when the compass lines up with the Qibla.
export const alignedFeedback = successFeedback;
