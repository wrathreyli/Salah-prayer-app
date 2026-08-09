import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from './theme';

const ThemeContext = createContext();

const STORAGE_KEY = 'themeMode';

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('light');

  // Load the saved theme choice on startup.
  useEffect(() => {
    async function loadTheme() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved !== null) {
          setMode(saved);
        }
      } catch (error) {
        console.log('Error loading theme:', error);
      }
    }
    loadTheme();
  }, []);

  // Flip between light and dark, and save the choice.
  async function toggleTheme() {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, newMode);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  }

  const colors = mode === 'light' ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ mode, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Convenience hook so screens can do: const { colors } = useTheme();
export function useTheme() {
  return useContext(ThemeContext);
}