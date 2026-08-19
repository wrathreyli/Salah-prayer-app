# Day 25 — Editing Past Days

## Goal
Make the calendar tappable. Open any past day, tick off prayers you forgot to
log, and watch every stat on the screen update as you do.

## Why This Matters
Yesterday's calendar was read-only, which quietly made the whole app punishing:
forget to open it one evening and that day is a permanent hole, streak broken,
nothing you can do. Habit trackers that can't be corrected stop being used,
because the record stops matching reality. The storage format already supported
this — one key per day, a list of prayer names — so it was only ever a UI gap.

## What I Built

### `components/DayEditor.js`
A modal sheet listing the five prayers for one date, each tappable, styled like
the cards on the Today screen so it feels like the same object.

Two details that took a minute to get right:
- **`date` is the visibility flag.** There's no separate `visible` prop — the
  sheet is open when a date is set, closed when it's `null`. One piece of state
  instead of two that can disagree.
- **Nested `Pressable`s for the backdrop.** The dimmed area closes the sheet on
  tap, but the sheet itself sits inside it, so it needs its own `Pressable` with
  an empty handler to stop the tap reaching the backdrop. Without it, every tap
  inside the sheet closes it.

### Optimistic updates in `HistoryScreen`
Tapping a prayer updates the in-memory map *first*, then writes to storage:

```js
const next = { ...byDate, [date]: updated };
setByDate(next);
setStreak(currentStreakFrom(next));
setBest(bestStreakFrom(next));
await saveCompletionsForDate(date, updated);
```

This is where yesterday's refactor paid off. Because every number on the screen
is a pure function of that one map, filling in a day from three weeks ago
instantly recalculates the streak, the best streak, the month's completion
count, and the per-prayer bars — with no re-read and no extra plumbing. If the
stats still lived behind their own storage queries, this feature would have
meant invalidating four of them by hand.

### Editing today from History
If the day you edit happens to be today, the reminder schedule is now rebuilt
too — otherwise ticking off Asr in History would still leave its notification
armed. It reuses the cached times from Day 23, so it costs nothing.

### One writer for the storage key
`TodayScreen` was still building the key itself with `getKeyForDate` and calling
`AsyncStorage.setItem` directly. Both writers now go through
`saveCompletionsForDate(isoDate, prayers)` in `utils/streak.js`, so the key
format lives in exactly one place. `TodayScreen` no longer imports AsyncStorage
at all.

## Files Changed
- `components/DayEditor.js` (new)
- `screens/HistoryScreen.js`
- `screens/TodayScreen.js`
- `utils/streak.js` (`saveCompletionsForDate`)

## Result
- Bundles clean (`npx expo export --platform android`, no errors).
- Streak helper assertions still pass after the refactor.
- Tapping any past day opens it; future days are disabled.

## Known Issue / Next Step
- Nothing distinguishes a prayer you logged at the time from one you filled in
  three weeks later. Storing a timestamp per entry would allow it, and it's
  arguably the more honest record.
- There's no undo. Tapping wrong is easy to fix by tapping again, but there's no
  "reset this day".
- The write isn't checked — `saveCompletionsForDate` returns a boolean nobody
  reads, so a failed save would leave the screen showing something that isn't
  stored.

## What I Learned
- **Optimistic updates fall out of derived state for free.** Update the source,
  and everything computed from it follows. The refactor that made this trivial
  happened yesterday, for unrelated reasons.
- A nested `Pressable` inside a backdrop `Pressable` needs an empty `onPress` to
  swallow the tap. Obvious once you've seen your own modal close every time you
  touch it.
- Using one nullable value as both "which item" and "is it open" removes a whole
  class of bug where the two disagree.
- Features that look like UI work are often data-model questions in disguise.
  This one was already possible on Day 10; it just had no button.
