import AsyncStorage from '@react-native-async-storage/async-storage';
import { PREFIX, currentStreakFrom } from './streak';

// Everything in this file talks to the device. The maths lives in
// `utils/streak.js`, which imports nothing native and so can be run — and
// tested — in plain node.

// Read every day the user has ever recorded, in one round trip.
//
// `multiGet` matters here: the old code did one `getItem` per day in a loop,
// which was 365 awaits just to draw a streak number.
export async function loadAllCompletions() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const prayerKeys = keys.filter((key) => key.startsWith(PREFIX));
    const pairs = await AsyncStorage.multiGet(prayerKeys);

    const byDate = {};
    for (const [key, value] of pairs) {
      if (!value) continue;
      try {
        byDate[key.slice(PREFIX.length)] = JSON.parse(value);
      } catch (error) {
        // One corrupt entry shouldn't lose the whole history.
        console.log('Skipping unreadable entry:', key);
      }
    }
    return byDate;
  } catch (error) {
    console.log('Error loading history:', error);
    return {};
  }
}

// Write the completed list for one day. Everything that records a prayer goes
// through here, so the key format lives in exactly one place.
export async function saveCompletionsForDate(isoDate, prayers) {
  try {
    await AsyncStorage.setItem(`${PREFIX}${isoDate}`, JSON.stringify(prayers));
    return true;
  } catch (error) {
    console.log('Error saving completions:', error);
    return false;
  }
}

// Kept for callers that just want the number.
export async function calculateStreak() {
  return currentStreakFrom(await loadAllCompletions());
}
