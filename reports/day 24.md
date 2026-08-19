# Day 24 — Monthly Stats

## Goal
Turn History from a seven-row list into something worth opening: a month
calendar, an all-time best streak, and a per-prayer breakdown that shows which
prayer actually gets missed.

## Why This Matters
The old screen answered one question — "did I pray yesterday?" — which you
already know. The useful questions are the ones you can't hold in your head:
*am I better this month than last? which prayer do I keep missing?* Fajr being
the answer is the point of building it.

## The Data Layer First
Every number on the screen comes from the same AsyncStorage records the app has
been writing since Day 10. The work was in reading them properly.

### One round trip instead of hundreds
`calculateStreak` used to loop up to 365 times, awaiting a separate `getItem`
for each day, just to produce one number. And the History screen ran its own
seven-`getItem` loop on top.

Both are gone. `loadAllCompletions()` does:
```js
const keys = await AsyncStorage.getAllKeys();
const prayerKeys = keys.filter((key) => key.startsWith(PREFIX));
const pairs = await AsyncStorage.multiGet(prayerKeys);
```
One read of everything, into a plain `{ '2026-08-19': ['Fajr', ...] }` map.
The screen loads that once and derives *everything* from it in memory — streak,
best streak, the calendar, the breakdown.

### Pure functions, and actual tests
Because the map is just data, the logic became pure functions that don't touch
storage at all: `currentStreakFrom`, `bestStreakFrom`, `prayerBreakdownFrom`,
`monthDaysFrom`.

Which meant I could **run them in node** rather than squinting at my phone. I
wrote a throwaway script that strips the AsyncStorage import and asserts against
hand-made history. It caught the cases I'd otherwise have shipped wrong:
- an unfinished today must not break the streak *or* count toward it
- streaks crossing a month boundary (`2026-08-31` → `2026-09-01`)
- leap-year February — `2028-02-29` is a real day and `monthDaysFrom` has to
  return 29
- partial days must not count toward the best streak

All passing. That's the first time in this project I've verified logic instead
of just checking that it bundles.

### A date-parsing trap
`new Date('2026-08-19')` parses as **UTC midnight**, which in a negative-offset
timezone is the 18th. Anywhere I turn a stored key back into a date I now split
the string by hand into `new Date(year, month - 1, day)`. There's a test for it.

## The Screen
- **Two stat cards** — current streak, and best ever.
- **A month calendar**, Monday-first, one dot per day. The dot's opacity is the
  fraction of prayers completed, so a partial day is visibly partial. Today gets
  a ring; future days are empty outlines.
- **Month arrows**, with forward disabled at the current month.
- **A per-prayer bar chart** for the displayed month, scored only against days
  that have actually happened — otherwise the 1st of the month would read as
  3% completion.

## Files Changed
- `utils/streak.js` (rewritten around the map + pure helpers)
- `screens/HistoryScreen.js` (rewritten)

## Result
- Helper logic verified in node — all assertions pass.
- Bundles clean (`npx expo export --platform android`, no errors).
- History now loads all of its data in a single storage read.

## Known Issue / Next Step
- The calendar is read-only. Tapping a past day to fix a forgotten prayer is the
  obvious next thing, and the storage format already supports it.
- The breakdown covers the displayed month only; an all-time version would be
  more telling but needs a different layout.
- `loadAllCompletions` reads every key on every focus. Fine at a year of data,
  worth revisiting at several.

## What I Learned
- **`AsyncStorage.multiGet` + `getAllKeys` exist**, and a loop of `await
  getItem` is the wrong shape. Read once, compute in memory.
- **Separating "get the data" from "compute the answer" makes the answer
  testable.** The moment the streak logic stopped touching storage, I could run
  it in node — and it found real bugs.
- Date strings are a trap in both directions: `new Date(iso)` is UTC, but
  `new Date(y, m, d)` is local. Mixing them silently moves things by a day.
- Percentages need an honest denominator. Dividing by the whole month instead of
  elapsed days would make every month look like a failure until the 28th.
