import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../utils/ThemeContext';
import {
  PRAYER_NAMES,
  bestStreakFrom,
  currentStreakFrom,
  formatDate,
  loadAllCompletions,
  monthDaysFrom,
  prayerBreakdownFrom,
} from '../utils/streak';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Monday-first, matching the en-GB dates used elsewhere in the app.
const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// JS weeks start on Sunday (0); shift so Monday is 0.
function mondayIndex(date) {
  return (date.getDay() + 6) % 7;
}

export default function HistoryScreen() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const today = new Date();
  const [byDate, setByDate] = useState({});
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  // Which month the grid is showing.
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  // Reload everything whenever this tab is opened. One read of all history,
  // then every number on the screen is derived from it in memory.
  useFocusEffect(
    useCallback(() => {
      async function load() {
        const all = await loadAllCompletions();
        setByDate(all);
        setStreak(currentStreakFrom(all));
        setBest(bestStreakFrom(all));
      }
      load();
    }, [])
  );

  const days = monthDaysFrom(byDate, year, month);
  const todayKey = formatDate(today);
  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();

  // Only count days that have actually happened, so the current month isn't
  // scored against days that haven't arrived yet.
  const elapsed = days.filter((day) => day.date <= todayKey);
  const breakdown = prayerBreakdownFrom(
    byDate,
    elapsed.map((day) => day.date)
  );
  const perfectDays = elapsed.filter((day) => day.count === 5).length;

  // Blank cells so the 1st lands under the right weekday.
  const leadingBlanks = mondayIndex(new Date(year, month, 1));

  function changeMonth(step) {
    const target = new Date(year, month + step, 1);
    setYear(target.getFullYear());
    setMonth(target.getMonth());
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.streakRow}>
          <View style={styles.streakCard}>
            <Text style={styles.streakNumber}>{streak}</Text>
            <Text style={styles.streakLabel}>day streak</Text>
          </View>
          <View style={[styles.streakCard, styles.bestCard]}>
            <Text style={[styles.streakNumber, styles.bestNumber]}>{best}</Text>
            <Text style={[styles.streakLabel, styles.bestLabel]}>best ever</Text>
          </View>
        </View>

        {/* Month picker */}
        <View style={styles.monthRow}>
          <TouchableOpacity
            style={styles.arrow}
            onPress={() => changeMonth(-1)}
            hitSlop={10}
          >
            <Text style={styles.arrowText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthLabel}>
            {MONTH_NAMES[month]} {year}
          </Text>
          <TouchableOpacity
            style={styles.arrow}
            onPress={() => changeMonth(1)}
            disabled={isCurrentMonth}
            hitSlop={10}
          >
            <Text style={[styles.arrowText, isCurrentMonth && styles.arrowOff]}>
              ›
            </Text>
          </TouchableOpacity>
        </View>

        {/* Calendar grid */}
        <View style={styles.calendar}>
          <View style={styles.weekRow}>
            {WEEKDAYS.map((label, i) => (
              <Text key={i} style={styles.weekday}>
                {label}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {Array.from({ length: leadingBlanks }).map((_, i) => (
              <View key={`blank-${i}`} style={styles.cell} />
            ))}

            {days.map((day) => {
              const isFuture = day.date > todayKey;
              return (
                <View key={day.date} style={styles.cell}>
                  <View
                    style={[
                      styles.dayDot,
                      // Fade the fill by how much of the day was completed.
                      day.count > 0 && {
                        backgroundColor: colors.accent,
                        opacity: 0.25 + (day.count / 5) * 0.75,
                      },
                      isFuture && styles.dayFuture,
                      day.date === todayKey && styles.dayToday,
                    ]}
                  />
                  <Text style={styles.dayNumber}>{day.dayOfMonth}</Text>
                </View>
              );
            })}
          </View>

          <Text style={styles.perfect}>
            {perfectDays} complete {perfectDays === 1 ? 'day' : 'days'} this
            month
          </Text>
        </View>

        {/* Which prayer gets missed most */}
        <Text style={styles.sectionTitle}>By prayer</Text>
        {PRAYER_NAMES.map((name) => {
          const done = breakdown[name];
          const share = elapsed.length > 0 ? done / elapsed.length : 0;
          return (
            <View key={name} style={styles.breakdownRow}>
              <Text style={styles.breakdownName}>{name}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[styles.barFill, { width: `${Math.round(share * 100)}%` }]}
                />
              </View>
              <Text style={styles.breakdownCount}>
                {done}/{elapsed.length}
              </Text>
            </View>
          );
        })}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

// Styles are built from the active theme's colors.
function makeStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 60,
      paddingHorizontal: 20,
    },
    header: { marginBottom: 20 },
    title: { fontSize: 34, fontWeight: 'bold', color: colors.title },
    streakRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    streakCard: {
      flex: 1,
      backgroundColor: colors.accent,
      borderRadius: 20,
      paddingVertical: 22,
      alignItems: 'center',
    },
    streakNumber: { fontSize: 40, fontWeight: 'bold', color: colors.accentText },
    streakLabel: { fontSize: 13, color: colors.accentMuted, marginTop: 2 },
    bestCard: {
      backgroundColor: colors.card,
      borderWidth: 2,
      borderColor: colors.cardBorder,
    },
    bestNumber: { color: colors.accent },
    bestLabel: { color: colors.subtitle },
    monthRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    arrow: { paddingHorizontal: 14, paddingVertical: 4 },
    arrowText: { fontSize: 28, color: colors.accent, lineHeight: 32 },
    arrowOff: { color: colors.dot },
    monthLabel: { fontSize: 17, fontWeight: '600', color: colors.text },
    calendar: {
      backgroundColor: colors.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      paddingVertical: 16,
      paddingHorizontal: 8,
      marginBottom: 24,
    },
    weekRow: { flexDirection: 'row', marginBottom: 8 },
    weekday: {
      width: `${100 / 7}%`,
      textAlign: 'center',
      fontSize: 12,
      color: colors.muted,
    },
    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    cell: {
      width: `${100 / 7}%`,
      alignItems: 'center',
      paddingVertical: 6,
    },
    dayDot: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: colors.dot,
    },
    dayFuture: { backgroundColor: 'transparent' },
    dayToday: { borderWidth: 2, borderColor: colors.accent },
    dayNumber: { fontSize: 11, color: colors.muted, marginTop: 3 },
    perfect: {
      fontSize: 13,
      color: colors.subtitle,
      textAlign: 'center',
      marginTop: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.subtitle,
      marginBottom: 12,
    },
    breakdownRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    breakdownName: { fontSize: 15, color: colors.text, width: 72 },
    barTrack: {
      flex: 1,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.dot,
      overflow: 'hidden',
    },
    barFill: {
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.accent,
    },
    breakdownCount: {
      fontSize: 13,
      color: colors.subtitle,
      width: 52,
      textAlign: 'right',
    },
    bottomSpace: { height: 30 },
  });
}
