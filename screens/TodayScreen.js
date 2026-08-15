import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import PrayerCard from '../components/PrayerCard';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNextPrayer } from '../utils/nextPrayer';
import { useTheme } from '../utils/ThemeContext';
import { getKeyForDate } from '../utils/streak';
import {
  LAST_TIMINGS_KEY,
  getCompletedToday,
  refreshPrayerNotifications,
} from '../utils/notifications';

// How long a prayer stays highlighted after arriving from a notification tap.
const HIGHLIGHT_MS = 5000;

export default function TodayScreen({ route, navigation }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [timings, setTimings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState('Loading location...');
  const [completed, setCompleted] = useState([]);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [highlighted, setHighlighted] = useState(null);

  // Arrived here from a notification tap — briefly highlight that prayer.
  useEffect(() => {
    const prayer = route.params?.prayer;
    if (!prayer) return;

    setHighlighted(prayer);
    // Clear the param so coming back to this tab doesn't re-highlight.
    navigation.setParams({ prayer: undefined });

    const timer = setTimeout(() => setHighlighted(null), HIGHLIGHT_MS);
    return () => clearTimeout(timer);
  }, [route.params?.prayer, navigation]);

  // Fetch prayer times every time this screen is focused.
  useFocusEffect(
    useCallback(() => {
      async function loadPrayerTimes() {
        try {
          // Read the user's chosen calculation method (default 13 = Diyanet).
          let method = 13;
          const savedMethod = await AsyncStorage.getItem('calculationMethod');
          if (savedMethod !== null) {
            method = Number(savedMethod);
          }

          const { status } = await Location.requestForegroundPermissionsAsync();

          let url;
          if (status === 'granted') {
            const location = await Location.getCurrentPositionAsync({});
            const lat = location.coords.latitude;
            const lng = location.coords.longitude;
            url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=${method}`;
            setLocationName('Your location');
          } else {
            url = `https://api.aladhan.com/v1/timingsByCity?city=Istanbul&country=Turkey&method=${method}`;
            setLocationName('Istanbul, Turkey (default)');
          }

          const response = await fetch(url);
          const data = await response.json();
          const newTimings = data.data.timings;
          setTimings(newTimings);
          setLoading(false);

          // Keep the reminder schedule in step with today's actual times.
          // Completions are read from storage rather than state, because this
          // effect and the one below load independently.
          await AsyncStorage.setItem(
            LAST_TIMINGS_KEY,
            JSON.stringify(newTimings)
          );
          await refreshPrayerNotifications(
            newTimings,
            await getCompletedToday()
          );
        } catch (error) {
          console.log('Error:', error);
          setLoading(false);
        }
      }
      loadPrayerTimes();
    }, [])
  );

  // Load today's saved completions every time this screen is focused.
  useFocusEffect(
    useCallback(() => {
      async function loadCompleted() {
        setCompleted(await getCompletedToday());
      }
      loadCompleted();
    }, [])
  );

  // Figure out which prayer is next, and keep it updated every minute.
  useEffect(() => {
    if (!timings) return;

    const prayerList = [
      { name: 'Fajr', time: timings.Fajr },
      { name: 'Dhuhr', time: timings.Dhuhr },
      { name: 'Asr', time: timings.Asr },
      { name: 'Maghrib', time: timings.Maghrib },
      { name: 'Isha', time: timings.Isha },
    ];

    function update() {
      setNextPrayer(getNextPrayer(prayerList));
    }

    update();
    const timer = setInterval(update, 60000);

    return () => clearInterval(timer);
  }, [timings]);

  // Save to the device, then bring the reminder schedule back in line so
  // completed prayers don't buzz again later today.
  async function saveCompleted(newList) {
    try {
      await AsyncStorage.setItem(
        getKeyForDate(new Date()),
        JSON.stringify(newList)
      );
      if (timings) {
        await refreshPrayerNotifications(timings, newList);
      }
    } catch (error) {
      console.log('Error saving:', error);
    }
  }

  function toggleCompleted(prayerName) {
    let newList;
    if (completed.includes(prayerName)) {
      newList = completed.filter((n) => n !== prayerName);
    } else {
      newList = [...completed, prayerName];
    }
    setCompleted(newList);
    saveCompleted(newList);
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.date}>Loading prayer times...</Text>
      </View>
    );
  }

  const prayers = [
    { id: 1, name: 'Fajr', time: timings.Fajr },
    { id: 2, name: 'Dhuhr', time: timings.Dhuhr },
    { id: 3, name: 'Asr', time: timings.Asr },
    { id: 4, name: 'Maghrib', time: timings.Maghrib },
    { id: 5, name: 'Isha', time: timings.Isha },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style={colors.statusBar} />
      <View style={styles.header}>
        <Text style={styles.title}>Prayer Times</Text>
        <Text style={styles.subtitle}>{locationName}</Text>
        <Text style={styles.date}>{completed.length} of 5 completed today</Text>
      </View>
      {nextPrayer && (
        <View style={styles.nextCard}>
          <Text style={styles.nextLabel}>NEXT PRAYER</Text>
          <Text style={styles.nextName}>{nextPrayer.name}</Text>
          <Text style={styles.nextTime}>
            in {nextPrayer.hoursLeft}h {nextPrayer.minutesLeft}m
          </Text>
        </View>
      )}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {prayers.map((prayer) => (
          <PrayerCard
            key={prayer.id}
            name={prayer.name}
            time={prayer.time}
            completed={completed.includes(prayer.name)}
            highlighted={highlighted === prayer.name}
            onPress={() => toggleCompleted(prayer.name)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

// Styles are built from the active theme's colors.
function makeStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 60,
      paddingHorizontal: 20,
    },
    header: { marginBottom: 24 },
    title: { fontSize: 34, fontWeight: 'bold', color: colors.title },
    subtitle: { fontSize: 16, color: colors.subtitle, marginTop: 2 },
    date: { fontSize: 14, color: colors.muted, marginTop: 8 },
    list: { flex: 1 },
    nextCard: {
      backgroundColor: colors.accent,
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
      marginBottom: 20,
    },
    nextLabel: {
      fontSize: 12,
      color: colors.accentMuted,
      letterSpacing: 1,
    },
    nextName: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.accentText,
      marginTop: 4,
    },
    nextTime: {
      fontSize: 16,
      color: colors.accentMuted,
      marginTop: 2,
    },
  });
}