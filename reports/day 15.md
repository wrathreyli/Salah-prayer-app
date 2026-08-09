# Day 15

## Goal
Turn the placeholder Settings screen into a working feature: let the user
choose which prayer-time calculation method the app uses, and have that
choice actually drive the Aladhan API request.

## What I Built
1. **Method picker UI** in `SettingsScreen.js` — a scrollable list of 6
   calculation methods, each as a tappable card showing its name and a short
   description. The selected method is highlighted with a border and a
   checkmark.
2. **Persistence** — the chosen method is saved to AsyncStorage under the key
   `calculationMethod`, and reloaded when the screen opens so the selection
   sticks between app launches.
3. **Wired it into the API** — updated `TodayScreen.js` so `loadPrayerTimes`
   reads the saved method from AsyncStorage (defaulting to 13 = Diyanet) and
   injects it into both the by-location and by-city Aladhan URLs via
   `&method=${method}`.

## Cleanup
- Removed a duplicated `useEffect` in `TodayScreen.js` that was a leftover
  copy of the next-prayer logic (mislabeled with a "Toggle a prayer" comment).
  It was running the same 60-second interval twice. Now there's one.

## Files Changed
- `screens/SettingsScreen.js` (rebuilt from placeholder)
- `screens/TodayScreen.js` (method wiring + duplicate removal)

## How It Works End to End
1. User opens Settings, taps a method → saved to AsyncStorage.
2. Next time Today loads prayer times, it reads that saved method.
3. The Aladhan request uses the chosen method → times reflect the user's region.

## What I Learned
- The same AsyncStorage read/write pattern used for prayer completions works
  cleanly for user preferences too — one key, string in / number out.
- A single hardcoded value (`method=13`) was quietly limiting the app; exposing
  it as a setting is a small change with a real correctness payoff.
- Duplicated `useEffect` blocks don't throw errors — they just silently do the
  work twice. Worth watching for when copy-pasting hooks.

## Next Up (Day 16)
- Add a small confirmation or auto-refresh so changing the method updates the
  Today screen without a manual reload.
- Consider adding theme (light/dark) and notification toggles to Settings.