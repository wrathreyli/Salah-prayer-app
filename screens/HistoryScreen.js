import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Build a storage key for a given date.
function getKeyForDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `prayers-${year}-${month}-${day}`;
}

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
});