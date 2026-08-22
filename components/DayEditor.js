import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../utils/ThemeContext';
import { PRAYER_NAMES, parseDate } from '../utils/streak';

// "2026-08-19" -> "Wed, 19 Aug"
function readableDate(isoDate) {
  return parseDate(isoDate).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

// A sheet for filling in (or correcting) one past day.
export default function DayEditor({ date, prayers, onToggle, onClear, onClose }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  // `date` doubles as the open/closed flag — there's nothing to show without one.
  const visible = date !== null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Tapping the dimmed area closes the sheet. */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* ...but taps inside it shouldn't. */}
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.title}>
            {visible ? readableDate(date) : ''}
          </Text>
          <Text style={styles.hint}>Tap a prayer to change it</Text>

          {PRAYER_NAMES.map((name) => {
            const done = prayers.includes(name);
            return (
              <TouchableOpacity
                key={name}
                style={[styles.row, done && styles.rowDone]}
                onPress={() => onToggle(name)}
                activeOpacity={0.7}
              >
                <View style={[styles.circle, done && styles.circleFilled]}>
                  {done && <Text style={styles.check}>✓</Text>}
                </View>
                <Text style={[styles.name, done && styles.nameDone]}>
                  {name}
                </Text>
              </TouchableOpacity>
            );
          })}

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.clear}
              onPress={onClear}
              disabled={prayers.length === 0}
            >
              <Text
                style={[
                  styles.clearText,
                  prayers.length === 0 && styles.clearTextOff,
                ]}
              >
                Clear day
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.done} onPress={onClose}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    sheet: {
      backgroundColor: colors.background,
      borderRadius: 24,
      padding: 22,
    },
    title: { fontSize: 20, fontWeight: 'bold', color: colors.title },
    hint: { fontSize: 13, color: colors.muted, marginTop: 2, marginBottom: 16 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      padding: 14,
      marginBottom: 10,
    },
    rowDone: {
      backgroundColor: colors.cardCompleted,
      borderColor: colors.cardBorderCompleted,
    },
    circle: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.circleBorder,
      marginRight: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    circleFilled: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    check: { color: colors.accentText, fontSize: 13, fontWeight: 'bold' },
    name: { fontSize: 16, fontWeight: '600', color: colors.text },
    nameDone: { color: colors.textMuted },
    actions: { flexDirection: 'row', gap: 10, marginTop: 6 },
    clear: {
      flex: 1,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      borderRadius: 14,
      paddingVertical: 13,
      alignItems: 'center',
    },
    clearText: { fontSize: 16, fontWeight: '600', color: colors.subtitle },
    clearTextOff: { color: colors.dot },
    done: {
      flex: 1,
      backgroundColor: colors.accent,
      borderRadius: 14,
      paddingVertical: 13,
      alignItems: 'center',
    },
    doneText: { fontSize: 16, fontWeight: '600', color: colors.accentText },
  });
}
