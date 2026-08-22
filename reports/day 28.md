# Day 28 — Making the Logic Testable

## Goal
Clear the correctness debt: finish Day 23's cache invalidation, stop silently
swallowing failed writes, add a "clear day" button, delete a dead dependency —
and turn the throwaway node script from Day 24 into a real `npm test`.

## The Refactor That Made The Rest Possible

`utils/streak.js` had pure maths *and* three functions that talked to
AsyncStorage. That one import is why Day 24's tests needed a hacky script that
stripped the import line before running.

So: **`utils/streak.js` is now pure**, and the three storage functions moved to
`utils/streakStorage.js`. Nothing native in the maths file means node can import
it directly. No bundler, no simulator, no mocking.

`tests/checks.mjs` covers `utils/streak.js`, `utils/qibla.js`,
`utils/cachePolicy.js` and `utils/nextPrayer.js` — 23 assertions, run with
`npm test`.

### It found something on the first run
```
FAIL  angleDifference takes the short way round
      Expected values to be strictly equal:  -180 !== 180
```
The comment claimed a range of `(-180, 180]`; the code actually returns
`[-180, 180)`. An exact half-turn comes back as `-180`.

It's harmless — a 180° turn is the same rotation either way, and the compass
doesn't care. But the code and its documentation disagreed, and I'd have
believed the comment. Fixed the comment, and pinned the boundary with a test so
it can't drift again.

## Cache Invalidation (finishing Day 23)
Day 23 shipped with two holes I wrote down and didn't fix: the cache didn't
record *where* or *with which method* the times were computed. Fly to another
country and you'd be shown the old city's times with no warning.

`utils/cachePolicy.js` — pure, therefore tested — answers one question:

```js
checkCache(cached, request) // -> { usable, reason }
```

- The cached record now stores `method`, `latitude` and `longitude`.
- A different calculation method → `reason: 'method'`.
- More than **75km** from where the times were computed → `reason: 'moved'`,
  using a haversine distance.
- Records saved before this existed have no coordinates, and are still trusted
  — discarding someone's cache to introduce a check would be a worse bug than
  the one being fixed.

The screen turns `reason` into different words: *"You've moved"* and *"Calculation
method changed"* say something useful; a generic "no times available" doesn't.

## Failed Writes Are Now Visible
`saveCompletionsForDate` has always returned a boolean, and nothing ever read
it. A failed write left the screen showing a tick that wasn't on the device.

Both writers now check it. `HistoryScreen` goes further: because the optimistic
update happens first, a failure **rolls the map back** to what's actually stored
and recomputes the streak from it, then says so.

## Smaller Things
- **Clear day** in the day editor, disabled when the day is already empty.
- **`expo-sensors` deleted.** Unused since Day 21, flagged twice in reports,
  never removed. It's gone.

## Files Changed
- `utils/streak.js` (now pure) and `utils/streakStorage.js` (new)
- `utils/cachePolicy.js` (new)
- `tests/checks.mjs` (new) and the `npm test` script
- `utils/prayerTimes.js`, `utils/qibla.js`
- `screens/TodayScreen.js`, `screens/HistoryScreen.js`
- `components/DayEditor.js`
- `package.json` (`expo-sensors` removed)

## Result
- `npm test` — all 23 checks pass.
- Bundles clean (`npx expo export --platform android`, no errors).

## Known Issue / Next Step
- The tests cover the pure logic only. Nothing exercises a screen, and the
  Day 23 crash was a *rendering* bug that none of this would have caught.
- 75km is a judgement call, not a derived number. It's wrong for someone who
  lives near a timezone edge.
- `getNextPrayer` reads the clock directly, so it can only be tested loosely.
  It should take "now" as an argument like `currentStreakFrom` does.

## What I Learned
- **A single native import is the difference between testable and not.** The
  maths never needed AsyncStorage; it just happened to live next to it.
- **Write the test even when you're sure.** The first run disagreed with a
  comment I'd written a week ago and believed since.
- A return value nobody reads is the same as no return value. `saveCompletions`
  had reported failure honestly for three days into a void.
- An error message that names the cause — *you've moved* — is a different
  product from one that says *something went wrong*. Same code path, different
  amount of thought.
- Cleanup has a deadline. `expo-sensors` sat unused through two reports that
  both said "worth removing" — noting it isn't doing it.
