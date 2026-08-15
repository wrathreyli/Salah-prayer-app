import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { useTheme } from '../utils/ThemeContext';
import { angleDifference, getQiblaBearing, smoothAngle } from '../utils/qibla';

// How much of each new reading to trust. Lower = smoother but laggier.
const SMOOTHING = 0.15;
// Within this many degrees, we call it "facing the Qibla".
const ALIGNED_WITHIN = 5;

export default function QiblaScreen() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [qiblaBearing, setQiblaBearing] = useState(null);
  const [aligned, setAligned] = useState(false);
  const [needsCalibration, setNeedsCalibration] = useState(false);
  const [error, setError] = useState(null);

  // Values the compass listener needs but that shouldn't trigger re-renders.
  const qiblaRef = useRef(null);
  const smoothedRef = useRef(null);
  const appliedRef = useRef(0); // the rotation currently shown, unwrapped
  const alignedRef = useRef(false);
  const calibrationRef = useRef(false);

  const rotation = useRef(new Animated.Value(0)).current;

  // Get the user's location once, then compute the Qibla bearing.
  useEffect(() => {
    async function loadBearing() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Location permission is needed to find the Qibla.');
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        const bearing = getQiblaBearing(
          location.coords.latitude,
          location.coords.longitude
        );
        qiblaRef.current = bearing;
        setQiblaBearing(bearing);
      } catch (e) {
        setError('Could not determine your location.');
      }
    }
    loadBearing();
  }, []);

  // Watch the compass. `watchHeadingAsync` gives us TRUE north (magnetic
  // north corrected for declination), which is what the Qibla bearing is
  // measured from — the raw magnetometer only knows magnetic north.
  useEffect(() => {
    let subscription;

    async function watchHeading() {
      try {
        subscription = await Location.watchHeadingAsync((reading) => {
          // trueHeading is -1 when location permission is missing.
          const heading =
            reading.trueHeading >= 0 ? reading.trueHeading : reading.magHeading;

          // Nudge the running average toward the new reading instead of
          // jumping to it. This is what kills the jitter.
          if (smoothedRef.current === null) {
            smoothedRef.current = heading;
          } else {
            smoothedRef.current = smoothAngle(
              smoothedRef.current,
              heading,
              SMOOTHING
            );
          }

          const lowAccuracy = reading.accuracy !== undefined && reading.accuracy < 2;
          if (lowAccuracy !== calibrationRef.current) {
            calibrationRef.current = lowAccuracy;
            setNeedsCalibration(lowAccuracy);
          }

          if (qiblaRef.current === null) return;

          // Where the arrow should point, and how far off the user is.
          const target = qiblaRef.current - smoothedRef.current;
          const offBy = Math.abs(angleDifference(smoothedRef.current, qiblaRef.current));

          // Only re-render when the aligned state actually flips, not on
          // every single reading.
          const isAligned = offBy <= ALIGNED_WITHIN;
          if (isAligned !== alignedRef.current) {
            alignedRef.current = isAligned;
            setAligned(isAligned);
          }

          // Animate along the shortest path. Without unwrapping, crossing
          // 359° → 0° would send the arrow the long way round.
          const next =
            appliedRef.current + angleDifference(appliedRef.current, target);
          appliedRef.current = next;

          Animated.timing(rotation, {
            toValue: next,
            duration: 150,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }).start();
        });
      } catch (e) {
        setError('Could not read the compass on this device.');
      }
    }

    watchHeading();

    return () => {
      if (subscription) subscription.remove();
    };
  }, [rotation]);

  // Animated.Value holds a number; the transform needs "123deg".
  const spin = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Qibla</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Qibla</Text>
        <Text style={styles.subtitle}>Hold your phone flat, facing forward</Text>
      </View>

      <View style={styles.center}>
        <View style={[styles.compass, aligned && styles.compassAligned]}>
          <Animated.View
            style={[styles.arrow, { transform: [{ rotate: spin }] }]}
          >
            <Text style={[styles.arrowIcon, aligned && styles.arrowAligned]}>
              ↑
            </Text>
            <View style={styles.kaabaDot} />
          </Animated.View>
        </View>

        {aligned ? (
          <Text style={styles.alignedText}>Facing the Qibla</Text>
        ) : (
          qiblaBearing !== null && (
            <Text style={styles.bearingText}>
              Qibla is {Math.round(qiblaBearing)}° from North
            </Text>
          )
        )}

        {needsCalibration && (
          <Text style={styles.calibrateText}>
            Compass accuracy is low — move your phone in a figure-eight.
          </Text>
        )}
      </View>
    </View>
  );
}

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
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    compass: {
      width: 260,
      height: 260,
      borderRadius: 130,
      borderWidth: 2,
      borderColor: colors.cardBorder,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    compassAligned: {
      borderColor: colors.accent,
      backgroundColor: colors.cardCompleted,
    },
    arrow: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    arrowIcon: {
      fontSize: 120,
      color: colors.subtitle,
      lineHeight: 120,
    },
    arrowAligned: {
      color: colors.accent,
    },
    kaabaDot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: colors.accent,
      marginTop: -8,
    },
    bearingText: {
      fontSize: 16,
      color: colors.subtitle,
      marginTop: 32,
    },
    alignedText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.accent,
      marginTop: 32,
    },
    calibrateText: {
      fontSize: 14,
      color: colors.muted,
      textAlign: 'center',
      marginTop: 12,
      paddingHorizontal: 20,
      lineHeight: 20,
    },
    errorText: {
      fontSize: 16,
      color: colors.subtitle,
      textAlign: 'center',
      lineHeight: 24,
    },
  });
}
