import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../utils/ThemeContext';
import { SECTIONS } from '../data/adhkar';
import { loadCounts, saveCounts } from '../utils/adhkarCounts';
import { successFeedback, tapFeedback } from '../utils/haptics';

export default function AdhkarScreen() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [section, setSection] = useState('tasbih');
  const [counts, setCounts] = useState({});

  // Writing on every tap would mean 100 storage writes to finish one dhikr,
  // so the count lives in state and is flushed on a short delay instead.
  const flushTimer = useRef(null);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        setCounts(await loadCounts());
      }
      load();

      // Leaving the tab shouldn't lose an unflushed count.
      return () => {
        if (flushTimer.current) clearTimeout(flushTimer.current);
      };
    }, [])
  );

  function scheduleSave(next) {
    if (flushTimer.current) clearTimeout(flushTimer.current);
    flushTimer.current = setTimeout(() => saveCounts(next), 600);
  }

  function count(item) {
    const current = counts[item.id] ?? 0;
    // Stop at the target rather than counting past it.
    if (current >= item.target) return;

    const next = { ...counts, [item.id]: current + 1 };
    setCounts(next);
    scheduleSave(next);

    if (current + 1 === item.target) {
      successFeedback();
    } else {
      tapFeedback();
    }
  }

  function reset(item) {
    const next = { ...counts, [item.id]: 0 };
    setCounts(next);
    scheduleSave(next);
  }

  const items = SECTIONS.find((s) => s.key === section).items;
  const finished = items.filter(
    (item) => (counts[item.id] ?? 0) >= item.target
  ).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Adhkar</Text>
        <Text style={styles.subtitle}>
          {finished} of {items.length} finished today
        </Text>
      </View>

      {/* Which list you're on */}
      <View style={styles.tabs}>
        {SECTIONS.map((s) => (
          <TouchableOpacity
            key={s.key}
            style={[styles.tab, section === s.key && styles.tabActive]}
            onPress={() => setSection(s.key)}
          >
            <Text
              style={[
                styles.tabLabel,
                section === s.key && styles.tabLabelActive,
              ]}
            >
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {items.map((item) => {
          const done = counts[item.id] ?? 0;
          const complete = done >= item.target;

          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.card, complete && styles.cardDone]}
              onPress={() => count(item)}
              onLongPress={() => reset(item)}
              activeOpacity={0.75}
            >
              {/* Arabic has to be laid out right-to-left explicitly; RN
                  won't infer it from the characters. */}
              <Text style={styles.arabic}>{item.arabic}</Text>
              <Text style={styles.latin}>{item.latin}</Text>
              <Text style={styles.meaning}>{item.meaning}</Text>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(done / item.target) * 100}%` },
                  ]}
                />
              </View>

              <View style={styles.footer}>
                <Text style={[styles.count, complete && styles.countDone]}>
                  {done} / {item.target}
                </Text>
                <Text style={styles.hint}>
                  {complete ? 'Hold to reset' : 'Tap to count'}
                </Text>
              </View>
            </TouchableOpacity>
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
    header: { marginBottom: 16 },
    title: { fontSize: 34, fontWeight: 'bold', color: colors.title },
    subtitle: { fontSize: 15, color: colors.subtitle, marginTop: 2 },
    tabs: {
      flexDirection: 'row',
      backgroundColor: colors.dot,
      borderRadius: 14,
      padding: 4,
      marginBottom: 18,
    },
    tab: {
      flex: 1,
      paddingVertical: 9,
      borderRadius: 10,
      alignItems: 'center',
    },
    tabActive: { backgroundColor: colors.card },
    tabLabel: { fontSize: 14, fontWeight: '600', color: colors.subtitle },
    tabLabelActive: { color: colors.accent },
    card: {
      backgroundColor: colors.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      padding: 18,
      marginBottom: 14,
    },
    cardDone: {
      backgroundColor: colors.cardCompleted,
      borderColor: colors.cardBorderCompleted,
    },
    arabic: {
      fontSize: 24,
      lineHeight: 42,
      color: colors.title,
      textAlign: 'right',
      writingDirection: 'rtl',
      marginBottom: 8,
    },
    latin: { fontSize: 15, fontWeight: '600', color: colors.text },
    meaning: {
      fontSize: 13,
      color: colors.subtitle,
      marginTop: 3,
      lineHeight: 19,
    },
    progressTrack: {
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.dot,
      overflow: 'hidden',
      marginTop: 14,
    },
    progressFill: {
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.accent,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10,
    },
    count: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      fontVariant: ['tabular-nums'],
    },
    countDone: { color: colors.accent },
    hint: { fontSize: 12, color: colors.muted },
    bottomSpace: { height: 30 },
  });
}
