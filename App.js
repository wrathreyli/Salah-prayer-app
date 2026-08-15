import { useEffect, useRef, useState } from 'react';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as Notifications from 'expo-notifications';
import TodayScreen from './screens/TodayScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';
import { ThemeProvider, useTheme } from './utils/ThemeContext';
import QiblaScreen from './screens/QiblaScreen';

const Tab = createBottomTabNavigator();

// Lets us navigate from outside a screen — needed because notification taps
// arrive from the OS, not from anything React Navigation rendered.
const navigationRef = createNavigationContainerRef();

// The tab navigator, themed from context.
function AppTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.cardBorder,
        },
      }}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
      <Tab.Screen name="Qibla" component={QiblaScreen} />
    </Tab.Navigator>
  );
}

// Renders nothing — it just sends the user to the Today tab when they tap a
// prayer reminder. `useLastNotificationResponse` covers both cases: the app
// was already running, and the app was launched by the tap.
function NotificationRouter({ navReady }) {
  const response = Notifications.useLastNotificationResponse();
  const handled = useRef(null);

  useEffect(() => {
    if (!navReady || !response) return;

    // Don't re-navigate for a tap we've already handled.
    const id = response.notification.request.identifier;
    if (handled.current === id) return;

    const prayer = response.notification.request.content.data?.prayer;
    if (!prayer) return;

    handled.current = id;
    navigationRef.navigate('Today', { prayer });
  }, [navReady, response]);

  return null;
}

export default function App() {
  const [navReady, setNavReady] = useState(false);

  return (
    <ThemeProvider>
      <NavigationContainer
        ref={navigationRef}
        onReady={() => setNavReady(true)}
      >
        <AppTabs />
      </NavigationContainer>
      <NotificationRouter navReady={navReady} />
    </ThemeProvider>
  );
}
