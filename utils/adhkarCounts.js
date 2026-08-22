import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatDate } from './streak';

// Counts are per day: yesterday's tasbih shouldn't still be sitting there
// half-finished this morning. One record per date, keyed by dhikr id.
const PREFIX = 'adhkar-';

function keyFor(date) {
  return `${PREFIX}${formatDate(date)}`;
}

export async function loadCounts(date = new Date()) {
  try {
    const saved = await AsyncStorage.getItem(keyFor(date));
    return saved === null ? {} : JSON.parse(saved);
  } catch (error) {
    console.log('Error reading dhikr counts:', error);
    return {};
  }
}

export async function saveCounts(counts, date = new Date()) {
  try {
    await AsyncStorage.setItem(keyFor(date), JSON.stringify(counts));
    return true;
  } catch (error) {
    console.log('Error saving dhikr counts:', error);
    return false;
  }
}
