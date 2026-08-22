import { StatusBar } from 'expo-status-bar';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PrayerCard from '../components/PrayerCard';
import ProgressRing from '../components/ProgressRing';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getNextPrayer } from '../utils/nextPrayer';
import { useTheme } from '../utils/ThemeContext';
import { formatDate } from '../utils/streak';
import { calculateStreak, saveCompletionsForDate } from '../utils/streakStorage';
import { loadPrayerTimes } from '../utils/prayerTimes';
import {
  getCompletedToday,
  refreshPrayerNotifications,
} from '../utils/notifications';

// How long a prayer stays highlighted after arriving from a notification tap.
const HIGHLIGHT_MS = 5000;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "2026-08-18" -> "Aug 18". Split by hand rather than using `new Date(...)`,
// which would parse the string as UTC and can land on the wrong day.
function formatStaleDate(isoDate) {
  const [, month, day] = isoDate.split('-');
  return `${MONTHS[Number(month) - 1]} ${Number(day)}`;
}

// What to say when there's nothing to show. Saved times for another city, or
// for a calculation method you've since changed, would be quietly wrong — so
// they're refused, and the reason is worth explaining.
const EMPTY_COPY = {
  empty: {
    title: 'No prayer times yet',
    body: "Connect to the internet once and they'll be saved for offline use.",
  },
  moved: {
    title: "You've moved",
    body: 'The saved times are for somewhere else. Connect once to get times for where you are now.',
  },
  method: {
    title: 'Calculation method changed',
    body: 'The saved times use your previous method. Connect once to recalculate them.',
  },
};

// "in 2h 14m", or just "in 14m" once the hours run out.
function countdownLabel(prayer) {
  if (prayer.hoursLeft === 0) return `in ${prayer.minutesLeft}m`;
  return `in ${prayer.hoursLeft}h ${prayer.minutesLeft}m`;
}

export default function TodayScreen({ route, navigation }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [timings, setTimings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locationName, setLocationName] = useState('Loading location...');
  const [staleDate, setStaleDate] = useState(null); // set when showing cache
  const [noneReason, setNoneReason] = useState('empty');
  const [completed, setCompleted] = useState([]);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [highlighted, setHighlighted] = useState(null);
  const [streak, setStreak] = useState(0);

  // Arrived here from a notification tap — briefly highlight that prayer.
  useEffect(() => {
    const prayer = route.params?.prayer;
    if (!prayer) return;

    setHighlighted(prayer);
    // Clear the param so coming back to this tab doesn't re-highlight.
    navigation.setParams({ prayer: undefined });

    const timer = setTimeout(() => setHighlighted(null), HIGHLIGHT_MS);
    return () => clearTimeout(timer);
  }, [route.params?.prayer, navigation]);

  // Load prayer times — from the network if we can, from the cache if not.
  const refresh = useCallback(async () => {
    const result = await loadPrayerTimes();

    setTimings(result.timings);
    setLocationName(result.locationName);
    // Only call it stale if the cached day isn't today.
    setStaleDate(
      result.source === 'cache' && result.cachedDate !== formatDate(new Date())
        ? result.cachedDate
        : null
    );
    setNoneReason(result.reason ?? 'empty');
    setLoading(false);

    if (!result.timings) return;

    // Keep the reminder schedule in step with the times we're showing.
    // Completions are read from storage rather than state, because this
    // and the effect below load independently.
    await refreshPrayerNotifications(result.timings, await getCompletedToday());
  }, []);

  // Reload every time this screen is focused.
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  async function onPullToRefresh() {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }

  // Load today's saved completions every time this screen is focused.
  useFocusEffect(
    useCallback(() => {
      async function loadCompleted() {
        setCompleted(await getCompletedToday());
        setStreak(await calculateStreak());
      }
      loadCompleted();
    }, [])
  );

  // Figure out which prayer is next, and keep it updated every minute.
  useEffect(() => {
    if (!timings) return;

    const prayerList = [
      { name: 'Fajr', time: timings.Fajr },
      { name: 'Dhuhr', time: timings.Dhuhr },
      { name: 'Asr', time: timings.Asr },
      { name: 'Maghrib', time: timings.Maghrib },
      { name: 'Isha', time: timings.Isha },
    ];

    function update() {
      setNextPrayer(getNextPrayer(prayerList));
    }

    update();
    const timer = setInterval(update, 60000);

    return () => clearInterval(timer);
  }, [timings]);

  // Save to the device, then bring the reminder schedule back in line so
  // completed prayers don't buzz again later today.
  async function saveCompleted(newList) {
    const saved = await saveCompletionsForDate(formatDate(new Date()), newList);
    if (!saved) {
      // The screen would otherwise show something that isn't on the device.
      Alert.alert('Could not save', 'That change was not stored. Try again.');
      setCompleted(await getCompletedToday());
      return;
    }
    if (timings) {
      await refreshPrayerNotifications(timings, newList);
    }
  }

  function toggleCompleted(prayerName) {
    let newList;
    if (completed.includes(prayerName)) {
      newList = completed.filter((n) => n !== prayerName);
    } else {
      newList = [...completed, prayerName];
    }
    setCompleted(newList);
    saveCompleted(newList);
    // Completing (or un-completing) the fifth prayer moves the streak.
    calculateStreak().then(setStreak);
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.date}>Loading prayer times...</Text>
      </View>
    );
  }

  // No network and nothing cached — the only state where we genuinely have
  // nothing to show. Before, this fell through and crashed on `timings.Fajr`.
  if (!timings) {
    return (
      <View style={styles.container}>
        <StatusBar style={colors.statusBar} />
        <View style={styles.header}>
          <Text style={styles.title}>Prayer Times</Text>
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{EMPTY_COPY[noneReason].title}</Text>
          <Text style={styles.emptyText}>{EMPTY_COPY[noneReason].body}</Text>
          <TouchableOpacity style={styles.retry} onPress={onPullToRefresh}>
            <Text style={styles.retryText}>
              {refreshing ? 'Trying...' : 'Try again'}
            </Text>
          </TouchableOpacity>
        </View>
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
      <StatusBar style={colors.statusBar} />
      <View style={styles.header}>
        <Text style={styles.title}>Prayer Times</Text>
        <Text style={styles.subtitle}>{locationName}</Text>
      </View>
      {staleDate && (
        <View style={styles.staleBanner}>
          <Text style={styles.staleText}>
            Offline — showing saved times from {formatStaleDate(staleDate)}.
            Pull down to retry.
          </Text>
        </View>
      )}
      {/* One card answering the three things you open the app for: how far
          through the day you are, what's next, and whether the streak holds. */}
      <View style={styles.summary}>
        <ProgressRing
          progress={completed.length / 5}
          trackColor={colors.accentMuted}
          fillColor={colors.accentText}
        >
          <Text style={styles.ringCount}>{completed.length}</Text>
          <Text style={styles.ringOf}>of 5</Text>
        </ProgressRing>

        <View style={styles.summaryText}>
          {nextPrayer ? (
            <>
              <Text style={styles.nextLabel}>NEXT PRAYER</Text>
              <Text style={styles.nextName}>{nextPrayer.name}</Text>
              <Text style={styles.nextTime}>{countdownLabel(nextPrayer)}</Text>
            </>
          ) : (
            <Text style={styles.nextName}>Prayer times</Text>
          )}
          <Text style={styles.streakLine}>
            {streak > 0
              ? `${streak} day streak`
              : 'Complete all five to start a streak'}
          </Text>
        </View>
      </View>
      <ScrollView
        style={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onPullToRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        {prayers.map((prayer) => (
          <PrayerCard
            key={prayer.id}
            name={prayer.name}
            time={prayer.time}
            completed={completed.includes(prayer.name)}
            highlighted={highlighted === prayer.name}
            onPress={() => toggleCompleted(prayer.name)}
          />
        ))}
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
    header: { marginBottom: 24 },
    title: { fontSize: 34, fontWeight: 'bold', color: colors.title },
    subtitle: { fontSize: 16, color: colors.subtitle, marginTop: 2 },
    date: { fontSize: 14, color: colors.muted, marginTop: 8 },
    list: { flex: 1 },
    staleBanner: {
      backgroundColor: colors.cardCompleted,
      borderWidth: 1,
      borderColor: colors.cardBorderCompleted,
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
    },
    staleText: { fontSize: 13, color: colors.subtitle, lineHeight: 19 },
    empty: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 60,
    },
    emptyTitle: { fontSize: 20, fontWeight: '600', color: colors.text },
    emptyText: {
      fontSize: 15,
      color: colors.subtitle,
      textAlign: 'center',
      lineHeight: 22,
      marginTop: 8,
      paddingHorizontal: 20,
    },
    retry: {
      backgroundColor: colors.accent,
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 28,
      marginTop: 24,
    },
    retryText: { fontSize: 16, fontWeight: '600', color: colors.accentText },
    summary: {
      backgroundColor: colors.accent,
      borderRadius: 22,
      padding: 20,
      marginBottom: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 18,
    },
    summaryText: { flex: 1 },
    ringCount: {
      fontSize: 26,
      fontWeight: 'bold',
      color: colors.accentText,
      fontVariant: ['tabular-nums'],
    },
    ringOf: { fontSize: 11, color: colors.accentMuted, marginTop: -2 },
    nextLabel: {
      fontSize: 11,
      color: colors.accentMuted,
      letterSpacing: 1.2,
    },
    nextName: {
      fontSize: 26,
      fontWeight: 'bold',
      color: colors.accentText,
      marginTop: 2,
    },
    nextTime: {
      fontSize: 15,
      color: colors.accentMuted,
      marginTop: 1,
    },
    streakLine: {
      fontSize: 13,
      color: colors.accentMuted,
      marginTop: 8,
    },
  });
}