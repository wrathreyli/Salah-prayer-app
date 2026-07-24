import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import PrayerCard from '../components/PrayerCard';
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNextPrayer } from '../utils/nextPrayer';

// Returns today's date as a string like "2026-07-24".
function getTodayKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `prayers-${year}-${month}-${day}`;
}

export default function TodayScreen() {
  const [timings, setTimings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState('Loading location...');
  const [completed, setCompleted] = useState([]);
  const [nextPrayer, setNextPrayer] = useState(null);

  // Fetch prayer times on load.
  useEffect(() => {
    async function loadPrayerTimes() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        let url;
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          const lat = location.coords.latitude;
          const lng = location.coords.longitude;
          url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=13`;
          setLocationName('Your location');
        } else {
          url =
            'https://api.aladhan.com/v1/timingsByCity?city=Istanbul&country=Turkey&method=13';
          setLocationName('Istanbul, Turkey (default)');
        }

        const response = await fetch(url);
        const data = await response.json();
        setTimings(data.data.timings);
        setLoading(false);
      } catch (error) {
        console.log('Error:', error);
        setLoading(false);
      }
    }
    loadPrayerTimes();
  }, []);

  // Load today's saved completions from the device.
  useEffect(() => {
    async function loadCompleted() {
      try {
        const saved = await AsyncStorage.getItem(getTodayKey());
        if (saved !== null) {
          setCompleted(JSON.parse(saved));
        }
      } catch (error) {
        console.log('Error loading saved data:', error);
      }
    }
    loadCompleted();
  }, []);

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

  // Save to the device.
  async function saveCompleted(newList) {
    try {
      await AsyncStorage.setItem(getTodayKey(), JSON.stringify(newList));
    } catch (error) {
      console.log('Error saving:', error);
    }
  }

  // Toggle a prayer, then save the result.
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
      <StatusBar style="dark" />
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
            onPress={() => toggleCompleted(prayer.name)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfcff',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: { marginBottom: 24 },
  title: { fontSize: 34, fontWeight: 'bold', color: '#3a3a5a' },
  subtitle: { fontSize: 16, color: '#9a9ac0', marginTop: 2 },
  date: { fontSize: 14, color: '#b0b0c8', marginTop: 8 },
  list: { flex: 1 },
  nextCard: {
    backgroundColor: '#6a6ac0',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  nextLabel: {
    fontSize: 12,
    color: '#dcdcf5',
    letterSpacing: 1,
  },
  nextName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 4,
  },
  nextTime: {
    fontSize: 16,
    color: '#dcdcf5',
    marginTop: 2,
  },
});