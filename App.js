import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native/types_generated/index';

export default function App() {
  return (
    <View style={styles.container}>
 <View style="auto" />

 <Text style={styles.title}>Prayer Times</Text>
 <Text style={styles.subtitle}>Istanbul, Turkey</Text>

 <ScrollView style={styles.list}>
  <view style={styles.card}>
    <Text style={styles.cardTitle}>Fajr</Text>
    <Text style={styles.cardTime}>04:12 AM</Text>
  </view>

  <view style={styles.card}>
    <Text style={styles.cardTitle}>Dhuhr</Text>
    <Text style={styles.cardTime}>01:13 PM</Text>
  </view>

  <view style={styles.card}>
    <Text style={styles.cardTitle}>Asr</Text>
    <Text style={styles.cardTime}>05:13 PM</Text>
  </view>

  <view style={styles.card}>
    <Text style={styles.cardTitle}>Maghrib</Text>
    <Text style={styles.cardTime}>08:47 PM</Text>
  </view>

  <view style={styles.card}>
    <Text style={styles.cardTitle}>Isha</Text>
    <Text style={styles.cardTime}>10:37 PM</Text>
  </view>
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
    Subtitile: {
      fontsize: 16,
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
  prayerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6a6a9a',
  },
  prayerTime: {
    fontSize: 18,
    color: '#9a9ac0',
  },
});