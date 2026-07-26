# Day 14 — Refactor: Centralizing `getKeyForDate`

## Goal
Remove duplicated logic across the codebase by establishing a single source
of truth for the date-to-storage-key function, `getKeyForDate`.

## The Problem
`getKeyForDate` was defined in two places:
- `utils/streak.js` (exported)
- `screens/HistoryScreen.js` (a local duplicate)

`HistoryScreen.js` also imported the function from utils while simultaneously
redefining it locally — meaning the import was shadowed and effectively dead
code. Two copies of the same logic is a maintenance risk: change the key
format in one place and forget the other, and history/streak data silently
breaks.

## What I Did
1. Confirmed the exported `getKeyForDate` in `utils/streak.js` was correct and
   matched the local copy exactly.
2. Deleted the duplicate `getKeyForDate` definition from `HistoryScreen.js`.
3. Kept the single import: `import { calculateStreak, getKeyForDate } from '../utils/streak';`
4. Merged two separate `react` imports (`useState` and `useCallback`) into one line.
5. Cleaned up a stray duplicate `formatDate` block introduced during editing.

## Result
- `getKeyForDate` now lives in exactly one file (`utils/streak.js`).
- `HistoryScreen.js` imports it cleanly — no shadowing, no dead code.
- Behavior is unchanged (verified the History tab still loads correctly in Expo),
  since the logic was identical — this was a pure structural cleanup.

## Files Changed
- `utils/streak.js`
- `screens/HistoryScreen.js`

## What I Learned
- When a function is used in more than one screen, it belongs in `utils/`,
  imported where needed — not copy-pasted.
- A local definition will silently shadow an import of the same name, so
  duplicates can hide in plain sight without throwing an error.
- Small refactors like this keep the codebase DRY and prevent subtle bugs
  where two copies of "the same" logic drift apart over time.

## Next Up (Day 15)
- Review other screens (TodayScreen, SettingsScreen) for similar duplication.
- Consider whether `formatDate` should also move to `utils/` if another screen
  needs it.