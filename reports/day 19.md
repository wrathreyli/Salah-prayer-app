# Day 19 

## Goal
Send a local notification at each of the five prayer times, with an on/off
toggle in Settings that remembers the user's choice, Until now the app only worked if you opened it. A prayer app that can't remind
you is missing the point — the reminder is the whole reason to install it. This
also turns the streak feature from something you have to remember into
something the phone prompts you to keep.

## What I Built
1. **`utils/notifications.js`** — all the notification logic in one place:
   - `setNotificationHandler` so a notification arriving while the app is open
     still shows a banner (SDK 54 requires all four fields: `shouldPlaySound`,
     `shouldSetBadge`, `shouldShowBanner`, `shouldShowList`).
   - `requestNotificationPermission()` — checks existing permission first and
     only prompts if we haven't been answered yet.
   - `schedulePrayerNotifications(timings)` — cancels everything, then schedules
     five `DAILY` notifications, one per prayer, at that prayer's hour/minute.
   - `cancelPrayerNotifications()`, plus small AsyncStorage helpers for the
     on/off flag.
   - An Android notification channel (`prayer-reminders`), which Android
     requires before anything can be shown.
2. **Settings toggle** — a "Prayer Reminders" switch above the calculation
   method list. Turning it on asks for permission and schedules immediately;
   turning it off cancels everything. If permission is denied, an `Alert`
   explains how to fix it instead of silently flipping back.
3. **Auto-rescheduling in `TodayScreen`** — every time fresh prayer times are
   fetched, they're saved to AsyncStorage (`lastTimings`) and, if reminders are
   on, the schedule is rebuilt from them.
4. **`parsePrayerTime()` in `utils/nextPrayer.js`** — pulled the `"05:23 (+03)"`
   → hours/minutes parsing out of the private `timeToMinutes` so the
   notification code could reuse it instead of duplicating it.

## The Tricky Part: Prayer Times Move
A `DAILY` trigger repeats at a fixed clock time forever. But prayer times drift
by a minute or two every day and change a lot across seasons — so a schedule set
once in August would be badly wrong by November.

The fix: treat the schedule as disposable. Every time the Today screen loads
fresh times from the API, it cancels all five and re-schedules them. So the
reminders are never more than one app-open stale, and the `DAILY` repeat is just
a safety net for days the app isn't opened at all.

That's also why Settings stores `lastTimings` — the toggle can schedule
straight away without doing its own location + network work.

## Result
- Bundles clean (`npx expo export --platform android`, 1000 modules, no errors).
- Toggling reminders on schedules five daily notifications; toggling off
  cancels them.

## Issue 
- Tapping a notification just opens the app on whatever tab was last open. It
  should deep-link to Today and ideally pre-select that prayer. That needs a
  `addNotificationResponseReceivedListener` plus a navigation ref in `App.js` —
  noted for a later day.
- Reminders fire even for prayers already marked complete. Skipping those would
  be a nice touch.

## What I Learned
- Local notifications work in Expo Go, but **remote/push** notifications don't
  on Android since SDK 53 — those need a development build. Good to know before
  planning anything push-based.
- Android needs a notification *channel* before it will display anything; iOS
  has no such concept. Same code, different platform requirement.
