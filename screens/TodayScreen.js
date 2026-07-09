import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import PrayerCard from '../components/PrayerCard';
import { useEffect, useState } from 'react';

export default function TodayScreen() {
  const [timings, setTimings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrayerTimes() {
      try {
        const url =
          'https://api.aladhan.com/v1/timingsByCity?city=Istanbul&country=Turkey&method=13';
        const response = await fetch(url);
        const data = await response.json();
        setTimings(data.data.timings);
        setLoading(false);
      } catch (error) {
        console.log('Error fetching prayer times:', error);
        setLoading(false);
      }
    }
    fetchPrayerTimes();
  }, []);

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
        <Text style={styles.subtitle}>Istanbul, Turkey</Text>
        <Text style={styles.date}>Today</Text>
      </View>
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {prayers.map((prayer) => (
          <PrayerCard key={prayer.id} name={prayer.name} time={prayer.time} />
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
});