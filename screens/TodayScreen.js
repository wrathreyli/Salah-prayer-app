import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import PrayerCard from '../components/PrayerCard';

const prayers = [
  { id: 1, name: 'Fajr', time: '03:31', highlight: false },
  { id: 2, name: 'Dhuhr', time: '13:15', highlight: false },
  { id: 3, name: 'Asr', time: '17:14', highlight: true },
  { id: 4, name: 'Maghrib', time: '20:47', highlight: false },
  { id: 5, name: 'Isha', time: '22:36', highlight: false },
];

export default function TodayScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Prayer Times</Text>
        <Text style={styles.subtitle}>Istanbul, Turkey</Text>
        <Text style={styles.date}>Friday, 3 July</Text>
      </View>
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {prayers.map((prayer) => (
          <PrayerCard
            key={prayer.id}
            name={prayer.name}
            time={prayer.time}
            highlight={prayer.highlight}
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
});