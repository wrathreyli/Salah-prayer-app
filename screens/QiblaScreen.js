import { StyleSheet, Text, View } from 'react-native';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import { useTheme } from '../utils/ThemeContext';
import { getQiblaBearing } from '../utils/qibla';

export default function QiblaScreen() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [qiblaBearing, setQiblaBearing] = useState(null);
  const [heading, setHeading] = useState(0);
  const [error, setError] = useState(null);

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
        setQiblaBearing(bearing);
      } catch (e) {
        setError('Could not determine your location.');
      }
    }
    loadBearing();
  }, []);

  // Listen to the magnetometer to know which way the phone is pointing.
  useEffect(() => {
    Magnetometer.setUpdateInterval(100);
    const subscription = Magnetometer.addListener((data) => {
      // Convert magnetometer x/y into a compass heading in degrees.
      let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
      angle = (angle + 360) % 360;
      setHeading(angle);
    });

    return () => subscription.remove();
  }, []);

  // How much to rotate the arrow: Qibla bearing minus current phone heading.
  const rotation = qiblaBearing !== null ? qiblaBearing - heading : 0;

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
        <Text style={styles.subtitle}>Point the top of your phone forward</Text>
      </View>

      <View style={styles.center}>
        <View style={styles.compass}>
          <View
            style={[styles.arrow, { transform: [{ rotate: `${rotation}deg` }] }]}
          >
            <Text style={styles.arrowIcon}>↑</Text>
            <View style={styles.kaabaDot} />
          </View>
        </View>

        {qiblaBearing !== null && (
          <Text style={styles.bearingText}>
            Qibla is {Math.round(qiblaBearing)}° from North
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
    arrow: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    arrowIcon: {
      fontSize: 120,
      color: colors.accent,
      lineHeight: 120,
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
    errorText: {
      fontSize: 16,
      color: colors.subtitle,
      textAlign: 'center',
      lineHeight: 24,
    },
  });
}