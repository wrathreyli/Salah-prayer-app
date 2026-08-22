import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { formatDate } from './streak';
import { checkCache } from './cachePolicy';

// One cache record: the last times we successfully fetched, plus enough
// context to describe them later ("saved times for Istanbul, from Aug 18").
const CACHE_KEY = 'cachedTimings';

const METHOD_KEY = 'calculationMethod';
const DEFAULT_METHOD = 13; // Diyanet

// Give up on the network well before the user does.
const FETCH_TIMEOUT_MS = 8000;

export async function getCachedTimings() {
  try {
    const saved = await AsyncStorage.getItem(CACHE_KEY);
    return saved === null ? null : JSON.parse(saved);
  } catch (error) {
    console.log('Error reading cached times:', error);
    return null;
  }
}

async function saveCache(record) {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(record));
  } catch (error) {
    console.log('Error caching times:', error);
  }
}

// `fetch` has no timeout of its own, so a dead connection can hang forever.
async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// Work out which URL to ask for, based on permission and the saved method.
async function buildRequest() {
  let method = DEFAULT_METHOD;
  const savedMethod = await AsyncStorage.getItem(METHOD_KEY);
  if (savedMethod !== null) {
    method = Number(savedMethod);
  }

  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      return {
        url: `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=${method}`,
        locationName: 'Your location',
        method,
        latitude,
        longitude,
      };
    }
  } catch (error) {
    // GPS can fail or hang on its own — fall through to the city lookup.
    console.log('Location unavailable:', error);
  }

  return {
    url: `https://api.aladhan.com/v1/timingsByCity?city=Istanbul&country=Turkey&method=${method}`,
    locationName: 'Istanbul, Turkey (default)',
    method,
  };
}

// Get today's prayer times, falling back to the cache when the network fails.
//
// Always resolves — never throws — and always says where the data came from:
//   { timings, locationName, source: 'network' | 'cache', cachedDate, reason }
//   { timings: null, ... }  when there's nothing usable to show at all
//
// `reason` says why the cache was rejected — 'empty', 'method' (the
// calculation method changed) or 'moved' (you're too far from where the
// cached times were computed).
//
// `source: 'cache'` with a `cachedDate` that isn't today means the times are
// stale: still roughly right (prayer times move a minute or two a day) but
// worth flagging.
export async function loadPrayerTimes() {
  const today = formatDate(new Date());
  const request = await buildRequest();
  const { url, locationName } = request;

  try {
    const response = await fetchWithTimeout(url);
    const data = await response.json();
    const timings = data?.data?.timings;

    // A 200 with an unexpected body is still a failure.
    if (!timings || !timings.Fajr) {
      throw new Error('Unexpected response shape');
    }

    // Store the context the times were computed for, so a later fallback can
    // tell whether they still apply.
    const record = {
      date: today,
      timings,
      locationName,
      method: request.method,
      latitude: request.latitude,
      longitude: request.longitude,
    };
    await saveCache(record);

    return { timings, locationName, source: 'network', cachedDate: today };
  } catch (error) {
    console.log('Could not fetch prayer times:', error);

    const cached = await getCachedTimings();
    const { usable, reason } = checkCache(cached, request);

    if (!usable) {
      return {
        timings: null,
        locationName,
        source: 'none',
        cachedDate: null,
        reason,
      };
    }

    return {
      timings: cached.timings,
      locationName: cached.locationName ?? locationName,
      source: 'cache',
      cachedDate: cached.date,
      reason: null,
    };
  }
}
