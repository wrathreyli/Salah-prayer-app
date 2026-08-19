# Day 23 — Offline Support

## Goal
Make the app work without a connection: cache prayer times, show them when the
network fails, and say clearly when what's on screen is saved rather than live.

## The Bug That Picked Today's Topic
I went looking for what to build and found this in `TodayScreen`:

```js
} catch (error) {
  console.log('Error:', error);
  setLoading(false);      // ← timings is still null
}
```

...followed a few lines later by `timings.Fajr`. So a failed fetch set loading
to false, fell straight through to the render, and **crashed on a null**. The
app didn't degrade without a connection — it died. Every day since Day 7 has
had this in it.

## What I Built

### `utils/prayerTimes.js`
All the fetching moved out of the screen and into one function that **always
resolves and never throws**, returning where the data came from:

```js
{ timings, locationName, source: 'network' | 'cache' | 'none', cachedDate }
```

- On success it caches `{ date, timings, locationName, method }`.
- On failure it returns the cache, tagged with the day it was saved.
- With no cache and no network, `timings` is `null` — an outcome the screen now
  actually handles.

Two things I hadn't thought about before:
- **`fetch` has no timeout.** On a dead connection it can hang indefinitely,
  which looks identical to a frozen app. Added an `AbortController` that aborts
  after 8 seconds.
- **A 200 isn't success.** If the body isn't shaped the way I expect, `timings`
  comes back undefined and everything downstream breaks in a confusing place.
  It now validates the response and treats a wrong shape as a failure, which
  routes it into the same cache fallback.

Location lookup is also wrapped now — GPS can hang or fail on its own, quite
separately from the network, and that used to take the whole load down with it.

### Three real states in `TodayScreen`
1. **Live** — normal.
2. **Stale** — a banner: *"Offline — showing saved times from Aug 18. Pull down
   to retry."* The times are still roughly right (they move a minute or two a
   day), so showing them beats showing nothing, but the user should know.
3. **Nothing** — an empty state with a Try again button, instead of a crash.

Plus **pull-to-refresh** (`RefreshControl`), which is the natural way to retry
once the signal comes back.

### One cache instead of two
Day 19 added a `lastTimings` key so Settings could schedule reminders without
its own network call. That was the same idea as this cache, built worse. Deleted
it; Settings now reads `getCachedTimings()`.

Also pulled `formatDate(date)` out of `getKeyForDate` in `utils/streak.js`,
since the cache needed a plain `YYYY-MM-DD` too.

## Files Changed
- `utils/prayerTimes.js` (new)
- `screens/TodayScreen.js`
- `screens/SettingsScreen.js`
- `utils/notifications.js` (dropped `LAST_TIMINGS_KEY`)
- `utils/streak.js` (`formatDate`)

## Result
- Bundles clean (`npx expo export --platform android`, no errors).
- Airplane mode shows yesterday's times with a banner instead of crashing.
- A first launch with no connection shows an explanation, not a blank screen.

## Known Issue / Next Step
- If the cache is from *today* and the network is down, there's no banner at
  all — deliberate, since the times are correct, but it does mean "offline"
  isn't always visible.
- The cache doesn't record which location it was for. Fly somewhere and you'd
  see the old city's times with no warning.
- Changing the calculation method doesn't invalidate the cache, so offline you'd
  keep seeing times from the old method.

## What I Learned
- **An error path that isn't rendered is an error path that crashes.** Catching
  the exception isn't handling it; I caught this one on Day 7 and still shipped
  a null dereference.
- `fetch` never times out on its own. `AbortController` is the fix, and without
  it "no signal" and "app frozen" look the same to the user.
- A function that can fail is easier to use when it returns *what happened*
  rather than throwing. The screen reads `source` and picks a UI — no
  try/catch, no guessing.
- Caching isn't the hard part. Deciding what to *say* about cached data is —
  silently showing stale times would have been the easy, worse version.
