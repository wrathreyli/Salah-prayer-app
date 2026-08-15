import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../utils/ThemeContext';
import {
  LAST_TIMINGS_KEY,
  areRemindersEnabled,
  cancelPrayerNotifications,
  requestNotificationPermission,
  schedulePrayerNotifications,
  setRemindersEnabled,
} from '../utils/notifications';

// The calculation methods we support, with their Aladhan API ids.
const METHODS = [
  { id: 13, name: 'Diyanet', desc: 'Turkey (Presidency of Religious Affairs)' },
  { id: 3, name: 'Muslim World League', desc: 'Widely used worldwide' },
  { id: 2, name: 'ISNA', desc: 'Islamic Society of North America' },
  { id: 4, name: 'Umm al-Qura', desc: 'Makkah, Saudi Arabia' },
  { id: 5, name: 'Egyptian', desc: 'Egyptian General Authority' },
  { id: 1, name: 'University of Karachi', desc: 'Shia Ithna-Ashari, Pakistan' },
];

const STORAGE_KEY = 'calculationMethod';

export default function SettingsScreen() {
  const { colors, mode, toggleTheme } = useTheme();
  const styles = makeStyles(colors);

  const [selected, setSelected] = useState(13); // default: Diyanet
  const [reminders, setReminders] = useState(false);

  // Load the saved method when the screen opens.
  useEffect(() => {
    async function loadMethod() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved !== null) {
          setSelected(Number(saved));
        }
      } catch (error) {
        console.log('Error loading method:', error);
      }
    }
    loadMethod();
  }, []);

  // Load whether prayer reminders are switched on.
  useEffect(() => {
    async function loadReminders() {
      setReminders(await areRemindersEnabled());
    }
    loadReminders();
  }, []);

  // Turn the five daily prayer reminders on or off.
  async function toggleReminders(value) {
    if (!value) {
      setReminders(false);
      await setRemindersEnabled(false);
      await cancelPrayerNotifications();
      return;
    }

    const granted = await requestNotificationPermission();
    if (!granted) {
      Alert.alert(
        'Notifications are off',
        'Allow notifications for this app in your phone settings to get prayer reminders.'
      );
      return;
    }

    setReminders(true);
    await setRemindersEnabled(true);

    // Schedule straight away using the times the Today screen last loaded.
    // If there aren't any yet, the Today screen will schedule them on its
    // next fetch.
    try {
      const saved = await AsyncStorage.getItem(LAST_TIMINGS_KEY);
      if (saved !== null) {
        await schedulePrayerNotifications(JSON.parse(saved));
      }
    } catch (error) {
      console.log('Error scheduling reminders:', error);
    }
  }

  // Save the chosen method to the device.
  async function chooseMethod(id) {
    setSelected(id);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, String(id));
    } catch (error) {
      console.log('Error saving method:', error);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Dark mode toggle */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleText}>
            <Text style={styles.toggleLabel}>Dark Mode</Text>
            <Text style={styles.toggleDesc}>
              {mode === 'dark' ? 'On' : 'Off'}
            </Text>
          </View>
          <Switch
            value={mode === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.dot, true: colors.accent }}
            thumbColor={colors.card}
          />
        </View>

        {/* Prayer reminder toggle */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleText}>
            <Text style={styles.toggleLabel}>Prayer Reminders</Text>
            <Text style={styles.toggleDesc}>
              {reminders
                ? 'A notification at each prayer time'
                : 'Off'}
            </Text>
          </View>
          <Switch
            value={reminders}
            onValueChange={toggleReminders}
            trackColor={{ false: colors.dot, true: colors.accent }}
            thumbColor={colors.card}
          />
        </View>

        <Text style={styles.sectionTitle}>Calculation Method</Text>
        <Text style={styles.hint}>
          Prayer times vary by calculation method. Pick the one used in your region.
        </Text>

        {METHODS.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.card,
              selected === method.id && styles.cardSelected,
            ]}
            onPress={() => chooseMethod(method.id)}
          >
            <View style={styles.cardText}>
              <Text
                style={[
                  styles.methodName,
                  selected === method.id && styles.methodNameSelected,
                ]}
              >
                {method.name}
              </Text>
              <Text style={styles.methodDesc}>{method.desc}</Text>
            </View>
            {selected === method.id && <Text style={styles.check}>✓</Text>}
          </TouchableOpacity>
        ))}

        <Text style={styles.footer}>
          Changes apply the next time prayer times are loaded.
        </Text>
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
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.subtitle,
      marginTop: 8,
      marginBottom: 8,
    },
    hint: { fontSize: 14, color: colors.muted, marginBottom: 16, lineHeight: 20 },
    toggleRow: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 2,
      borderColor: colors.cardBorder,
    },
    toggleText: { flex: 1 },
    toggleLabel: { fontSize: 17, fontWeight: '600', color: colors.text },
    toggleDesc: { fontSize: 13, color: colors.subtitle, marginTop: 2 },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 2,
      borderColor: colors.cardBorder,
    },
    cardSelected: {
      borderColor: colors.accent,
      backgroundColor: colors.cardCompleted,
    },
    cardText: { flex: 1 },
    methodName: { fontSize: 17, fontWeight: '600', color: colors.text },
    methodNameSelected: { color: colors.accent },
    methodDesc: { fontSize: 13, color: colors.subtitle, marginTop: 2 },
    check: { fontSize: 22, color: colors.accent, fontWeight: 'bold', marginLeft: 12 },
    footer: {
      fontSize: 13,
      color: colors.muted,
      textAlign: 'center',
      marginTop: 8,
      marginBottom: 30,
    },
  });
}