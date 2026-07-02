import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

// A reusable component — one blueprint for every prayer card.
// It receives "name" and "time" as props (inputs) and displays them.
function PrayerCard({ name, time }) {
  return (
    <View style={styles.card}>
      <Text style={styles.prayerName}>{name}</Text>
      <Text style={styles.prayerTime}>{time}</Text>
    </View>
  );
}

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <Text style={styles.title}>Prayer Times</Text>
      <Text style={styles.subtitle}>Istanbul, Turkey</Text>

      <ScrollView style={styles.list}>
        <PrayerCard name="Fajr" time="03:31" />
        <PrayerCard name="Dhuhr" time="13:15" />
        <PrayerCard name="Asr" time="17:14" />
        <PrayerCard name="Maghrib" time="20:47" />
        <PrayerCard name="Isha" time="22:36" />
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#5a5a8a',
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0b8',
    marginBottom: 20,
  },
  list: {
    flex: 1,
  },
  card: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0eef8',
    shadowColor: '#c8c4e0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 2,
  },
});