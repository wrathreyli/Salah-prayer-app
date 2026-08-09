# Day 16 — Auto-Refresh Prayer Times on Screen Focus

## Goal
Close the gap left by Day 15: make the calculation method actually take effect
right away. Previously, changing the method in Settings only updated prayer
times after a full manual app reload — a rough edge for the user.

## The Problem
The Today screen fetched prayer times inside a `useEffect(..., [])`, which runs
only once when the component first mounts. So after a user changed their
calculation method in Settings and navigated back to Today, the screen still
showed the old times until the whole app was restarted.

## What I Did
1. **Converted the fetch to run on focus.** Replaced the mount-only `useEffect`
   with `useFocusEffect(useCallback(() => { ... }, []))` from React Navigation.
   Now `loadPrayerTimes` runs every time the Today tab comes into focus — so
   returning from Settings re-reads the saved method and re-fetches.
2. **Applied the same pattern to completions.** Wrapped the "load today's saved
   completions" logic in `useFocusEffect` too, so prayer check-offs stay in sync
   when switching between tabs (e.g. completing a prayer, viewing History, then
   coming back).
3. **Kept the next-prayer interval on `useEffect`.** The 60-second countdown
   updater still uses a normal `useEffect` keyed on `[timings]` — it doesn't
   need to re-run on focus, just when the times change.

## Import Changes
- Added `useCallback` and `useFocusEffect`.
- Kept `useEffect` (still used by the countdown interval).

## Files Changed
- `screens/TodayScreen.js`

## Result
- Change the method in Settings → return to Today → times refresh automatically,
  no manual reload.
- Completions stay consistent across tab switches.
- The Day 15 method picker now feels instant and complete.

## What I Learned
- `useEffect(..., [])` runs once on mount; `useFocusEffect` runs every time a
  screen is focused. For tab-based apps, focus-based loading is usually what you
  actually want for data that can change elsewhere.
- `useFocusEffect` must be paired with `useCallback` to avoid re-subscribing on
  every render.

## Next Up (Day 17)
 theme toggle (light / dark mode) — centralize colors into a theme
 