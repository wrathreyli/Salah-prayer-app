# Day 17 — Dark Mode

## Goal
Add a light/dark theme toggle that recolors the entire app instantly and
remembers the user's choice between launches.

## Why This Matters
A prayer app is often opened before dawn (Fajr) and late at night (Isha) — a
dark mode is genuinely practical, not just cosmetic, for low-light use. It also
makes the app feel finished and modern.

## The Challenge
Every screen had hardcoded hex colors (`#fdfcff`, `#3a3a5a`, `#6a6ac0`, etc.).
React Native's `StyleSheet.create` produces static styles, so switching colors
at runtime meant restructuring how styles are built across the whole app.

## What I Built
1. **`utils/theme.js`** — two palettes, `lightColors` and `darkColors`, using
   identical key names (`background`, `card`, `accent`, `text`, etc.) so screens
   never care which mode is active. The old colors became the light palette.
2. **`utils/ThemeContext.js`** — a React Context providing the current `mode`,
   the active `colors` object, and a `toggleTheme` function. It loads the saved
   choice from AsyncStorage on startup and saves on every toggle.
3. **`makeStyles(colors)` pattern** — every screen and `PrayerCard` now builds
   its stylesheet from the active palette inside the component, after reading
   `const { colors } = useTheme()`. Static styles became theme-driven.
4. **Themed the navigation shell** — wrapped the app in