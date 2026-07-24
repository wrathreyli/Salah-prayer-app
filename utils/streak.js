import AsyncStorage from '@react-native-async-storage/async-storage';

// Build a storage key for a given date.
export function getKeyForDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `prayers-${year}-${month}-${day}`;
}

// Read how many prayers were completed on a given date.
async function getCountForDate(date) {
  try {
    const saved = await AsyncStorage.getItem(getKeyForDate(date));
    if (saved === null) return 0;
    return JSON.parse(saved).length;
  } catch (error) {
    return 0;
  }
}

// Count consecutive days (going backwards) with all 5 prayers completed.
export async function calculateStreak() {
  let streak = 0;
  let startOffset = 0;

  // If today isn't complete yet, don't let it break the streak —
  // start counting from yesterday instead.
  const todayCount = await getCountForDate(new Date());
  if (todayCount < 5) {
    startOffset = 1;
  }

  // Walk backwards day by day, up to a year.
  for (let i = startOffset; i < 365; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const count = await getCountForDate(date);

    if (count === 5) {
      streak = streak + 1;
    } else {
      break; // streak is broken, stop counting
    }
  }

  return streak;
}