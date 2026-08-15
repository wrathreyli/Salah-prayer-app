# Day 20 

## Goal
Fix the two issues I logged at the end of Day 19:
1. Tapping a reminder should open the Today tab with that prayer highlighted.
2. A prayer already marked complete shouldn't buzz again later the same day.

## Why This Matters
Day 19 shipped the feature but left the edges rough. Notifications that dump you
on whatever tab you last used, and that nag you about a prayer you already
prayed, are the kind of small wrongness that makes an app feel unfinished.
Today was about finishing rather than adding.

## Part 1 — Tapping a Reminder Opens Today

The problem: a notification tap comes from the OS, not from anything React
Navigation rendered, so there's no `navigation` prop to use.

The fix, in `App.js`:
- **`createNavigationContainerRef()`** — a ref handed to `NavigationContainer`
  so code outside the tree can call `navigationRef.navigate(...)`.
- **`useLastNotificationResponse()`** — the expo-notifications hook that returns
  the most recent tap. It covers both cases in one: the app was already open,
  and the app was launched *by* the tap (cold start).
- **A `NotificationRouter` component that renders `null`** — it just watches
  that hook and navigates to `Today` with the prayer name as a route param.
- **A readiness guard** — `NavigationContainer`'s `onReady` sets state, and the
  effect waits for it. On a cold start the notification response can resolve
  before the navigator exists; navigating then would silently do nothing.
- **A `handled` ref** holding the last notification identifier, so a re-render
  doesn't navigate a second time for the same tap.

Then in `TodayScreen`: it reads `route.params?.prayer`, sets a `highlighted`
prayer, and clears the param immediately with `navigation.setParams`, so
switching away and back doesn't re-trigger the highlight. `PrayerCard` gained a
`highlighted` prop — an accent-colored border — and it fades out after 5s.

## Part 2 — Skipping Prayers Already Prayed

This one looked easy and wasn't. A `DAILY` trigger repeats forever; there's no
"skip just the next one" option. Cancelling it removes tomorrow's reminder too.

The solution: **the trigger type depends on whether the prayer is done.**
- Not yet prayed → `DAILY` at that time, repeating as before.
- Already prayed today → a one-off `DATE` trigger set to *tomorrow* at the same
  time.

So today's reminder is skipped, but the prayer still fires tomorrow even if the
app is never opened again. The next rebuild — which happens on the next Today
screen load, when "completed today" is empty again — turns it back into a
`DAILY`. The one-off is a bridge, not a replacement.

`schedulePrayerNotifications` now takes a `completed` list, and everything that
changes completions rebuilds the whole schedule through a new
`refreshPrayerNotifications(timings, completed)` helper (which also does the
"are reminders even on?" check, so callers don't have to). Rebuilding all five
is cheap and means there's exactly one code path that decides what's scheduled.

## Small Cleanup
`TodayScreen` still had its own private `getTodayKey()` — the duplicate Day 14
was supposed to remove. It's gone now; today's completions are read through a
shared `getCompletedToday()` in `utils/notifications.js`, which uses
`getKeyForDate` from `utils/streak.js`. Three places needed that read (Today,
Settings, the scheduler), which is what finally justified the helper.

## Files Changed
- `App.js` (navigation ref + notification router)
- `screens/TodayScreen.js`
- `screens/SettingsScreen.js`
- `components/PrayerCard.js`
- `utils/notifications.js`

## Result
- Bundles clean (`npx expo export --platform android`, no errors).
- Tapping a reminder lands on Today with that prayer outlined.
- Ticking a prayer off cancels its reminder for the rest of the day.

## Known Issue / Next Step
- The highlight is a plain border swap. A short fade or pulse would read better
  — worth doing when I next touch `Animated` (the Qibla smoothing day).
- If the phone's date rolls over while the app sits open, the schedule isn't
  rebuilt until the next focus. Minor, but real.

## What I Learned
- Navigating from outside the component tree needs a **navigation container
  ref**, and the ref isn't usable until the container reports ready. Cold starts
  are where that ordering actually bites.
- Route params are state you have to clean up. Leaving `prayer` set meant the
  highlight came back every time the tab regained focus.
