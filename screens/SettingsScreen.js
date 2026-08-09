import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [selected, setSelected] = useState(13); // default: Diyanet

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
        <Text style={styles.subtitle}>Calculation Method</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfcff',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: { marginBottom: 20 },
  title: { fontSize: 34, fontWeight: 'bold', color: '#3a3a5a' },
  subtitle: { fontSize: 16, color: '#9a9ac0', marginTop: 2 },
  hint: { fontSize: 14, color: '#b0b0c8', marginBottom: 16, lineHeight: 20 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#f0f0f5',
  },
  cardSelected: {
    borderColor: '#6a6ac0',
    backgroundColor: '#f4f4ff',
  },
  cardText: { flex: 1 },
  methodName: { fontSize: 17, fontWeight: '600', color: '#3a3a5a' },
  methodNameSelected: { color: '#6a6ac0' },
  methodDesc: { fontSize: 13, color: '#9a9ac0', marginTop: 2 },
  check: { fontSize: 22, color: '#6a6ac0', fontWeight: 'bold', marginLeft: 12 },
  footer: {
    fontSize: 13,
    color: '#b0b0c8',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 30,
  },
});