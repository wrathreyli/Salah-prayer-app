import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateStreak, getKeyForDate } from '../utils/streak';

// Format a date like "Fri, 24 Jul".
function formatDate(date) {
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [streak, setStreak] = useState(0);

  // Reload the history every time this tab is opened.
  useFocusEffect(
    useCallback(() => {
      async function loadHistory() {
        const days = [];

        // Look at the last 7 days, starting with today.
        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);

          try {
            const saved = await AsyncStorage.getItem(getKeyForDate(date));
            const completedList = saved !== null ? JSON.parse(saved) : [];

            days.push({
              key: getKeyForDate(date),
              label: i === 0 ? 'Today' : formatDate(date),
              count: completedList.length,
            });
          } catch (error) {
            console.log('Error reading history:', error);
          }
        }

        setHistory(days);
        const currentStreak = await calculateStreak();
        setStreak(currentStreak);
      }

      loadHistory();
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>Your last 7 days</Text>
      </View>
      <View style={styles.streakCard}>
        <Text style={styles.streakNumber}>{streak}</Text>
        <Text style={styles.streakLabel}>day streak</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {history.map((day) => (
          <View key={day.key} style={styles.row}>
            <Text style={styles.dayLabel}>{day.label}</Text>
            <View style={styles.right}>
              <View style={styles.dots}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <View
                    key={i}
                    style={[styles.dot, i < day.count && styles.dotFilled]}
                  />
                ))}
              </View>
              <Text style={styles.count}>{day.count}/5</Text>
            </View>
          </View>
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
  row: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0eef8',
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a4a6a',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    marginRight: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#eae7f5',
    marginLeft: 5,
  },
  dotFilled: {
    backgroundColor: '#6a6ac0',
  },
  count: {
    fontSize: 15,
    color: '#9a9ac0',
    minWidth: 34,
    textAlign: 'right',
  },
  streakCard: {
    backgroundColor: '#6a6ac0',
    borderRadius: 20,
    paddingVertical: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  streakLabel: {
    fontSize: 14,
    color: '#dcdcf5',
    marginTop: 2,
  },
});