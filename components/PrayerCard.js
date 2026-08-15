import { Animated, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useEffect, useRef } from 'react';
import { useTheme } from '../utils/ThemeContext';

export default function PrayerCard({
  name,
  time,
  completed,
  highlighted,
  onPress,
}) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  // Fade the highlight ring in and out instead of snapping it on.
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(glow, {
      toValue: highlighted ? 1 : 0,
      duration: highlighted ? 250 : 600,
      useNativeDriver: true,
    }).start();
  }, [highlighted, glow]);

  return (
    <TouchableOpacity
      style={[styles.card, completed && styles.cardCompleted]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Sits on top of the card, so its opacity can animate on the native
          driver — border colors can't. */}
      <Animated.View
        pointerEvents="none"
        style={[styles.highlightRing, { opacity: glow }]}
      />
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

// Styles are built from the active theme's colors.
function makeStyles(colors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderRadius: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      shadowColor: '#c8c4e0',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 2,
    },
    cardCompleted: {
      backgroundColor: colors.cardCompleted,
      borderColor: colors.cardBorderCompleted,
    },
    // Fades in briefly when the user arrives from a notification tap.
    highlightRing: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.accent,
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
      borderColor: colors.circleBorder,
      marginRight: 14,
      justifyContent: 'center',
      alignItems: 'center',
    },
    circleFilled: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    check: {
      color: colors.accentText,
      fontSize: 14,
      fontWeight: 'bold',
    },
    prayerName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    prayerTime: {
      fontSize: 18,
      fontWeight: '500',
      color: colors.subtitle,
    },
    textMuted: {
      color: colors.textMuted,
    },
  });
}