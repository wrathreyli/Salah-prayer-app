import { StyleSheet, Text, View } from 'react-native';

export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>History</Text>
      <Text style={styles.subtitle}>Your prayer tracking will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfcff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#3a3a5a', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#9a9ac0', textAlign: 'center' },
});