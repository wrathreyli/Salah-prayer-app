import { StyleSheet, Text, View } from 'react-native';

// The PrayerCard component now lives in its own file.
// "export default" lets other files import and use it.
export default function PrayerCard({ name, time, highlight }) {
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

const styles = StyleSheet.create({
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