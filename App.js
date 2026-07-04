import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

// Reusable prayer card. "highlight" makes the next prayer stand out.
function PrayerCard({ name, time, highlight }) {
  return (
    <View style={[styles.card, highlight && styles.cardHighlight]}>
      <View>
        <Text style={[styles.prayerName, highlight && styles.textLight]}>
          {name}
        </Text>
        {highlight && <Text style={styles.nextLabel}>Next prayer</Text>}
      </View>
      <Text style={[styles.prayerTime, highlight && styles.textLight]}>
        {time}
      </Text>
    </View>
  );
}

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.title}>Prayer Times</Text>
        <Text style={styles.subtitle}>Istanbul, Turkey</Text>
        <Text style={styles.date}>Friday, 3 July</Text>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        <PrayerCard name="Fajr" time="03:31" />
        <PrayerCard name="Dhuhr" time="13:15" />
        <PrayerCard name="Asr" time="17:14" highlight={true} />
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
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#3a3a5a',
  },
  subtitle: {
    fontSize: 16,
    color: '#9a9ac0',
    marginTop: 2,
  },
  date: {
    fontSize: 14,
    color: '#b0b0c8',
    marginTop: 8,
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
  cardHighlight: {
    backgroundColor: '#6a6ac0',
    borderColor: '#6a6ac0',
  },
  prayerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4a4a6a',
  },
  prayerTime: {
    fontSize: 18,
    fontWeight: '500',
    color: '#9a9ac0',
  },
  textLight: {
    color: '#ffffff',
  },
  nextLabel: {
    fontSize: 12,
    color: '#dcdcf5',
    marginTop: 2,
  },
});
