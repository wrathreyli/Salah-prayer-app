import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function PrayerCard({ name, time, completed, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.card, completed && styles.cardCompleted]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <View style={[styles.circle, completed && styles.circleFilled]}>
          {completed && <Text style={styles.check}>✓</Text>}
        </View>
        <Text style={[styles.prayerName, completed && styles.textMuted]}>
          {name}
        </Text>
      </View>
      <Text style={[styles.prayerTime, completed && styles.textMuted]}>
        {time}
      </Text>
    </TouchableOpacity>
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
  cardCompleted: {
    backgroundColor: '#f6f5fc',
    borderColor: '#e4e0f4',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d8d4ec',
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleFilled: {
    backgroundColor: '#6a6ac0',
    borderColor: '#6a6ac0',
  },
  check: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
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
  textMuted: {
    color: '#b8b4d0',
  },
});