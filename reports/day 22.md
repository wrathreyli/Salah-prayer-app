# Day 22 — Qibla Haptics and Adaptive Smoothing

## Goal
Finish the two notes I left at the end of Day 21: a buzz when the compass lines
up with the Qibla, and a smoothing weight that isn't just a number I guessed.

## Why This Matters
The Qibla screen has a problem no amount of visual polish fixes: to use it you
have to hold the phone flat and turn slowly, which means you're looking down at
a screen while rotating your whole body. Feeling the moment you line up is
better than watching for it. That's the actual job haptics does here — it's not
a flourish.

## Part 1 — Haptics

`npx expo install expo-haptics`, then `Haptics.notificationAsync(Success)` on the
moment alignment becomes true.

The interesting part wasn't the buzz, it was **not** buzzing:

### Hysteresis
Alignment was a single 5° threshold. Hovering right on the boundary — which is
exactly what you do when lining up — flipped the state back and forth several
times a second. Visually that's a flicker; with haptics it's a machine-gun.

So there are now two thresholds:
- You have to get within **5°** to count as facing the Qibla.
- You don't lose it until you drift past **8°**.

The gap between them means the state can only change once per real movement.
This is the same trick a thermostat uses so it doesn't click on and off around
the set point.

The buzz only fires on the way *in*. Leaving needs no announcement.

### A Vibration toggle in Settings
Following the pattern the other preferences already use — stored in
AsyncStorage, on by default so the user opts out rather than in. `utils/haptics.js`
reads the setting on every call, which is cheap because alignment changes are
rare events, and it means changing the setting takes effect immediately without
the Qibla screen needing to reload anything.

## Part 2 — Adaptive Smoothing

Day 21 used a fixed weight of 0.15. The problem with any single value:
- Heavy smoothing is calm when you hold still, but the arrow lags behind when
  you turn.
- Light smoothing tracks your turn nicely, but twitches when you're still.

You can't win, because the two situations want opposite things. The fix is to
notice which situation you're in: **if the reading barely moved, that movement
is noise — filter it hard. If the reading moved a lot, that movement is real —
barely filter it at all.**

`adaptiveWeight(turnDegrees)` in `utils/qibla.js` maps the size of each jump
onto a weight: under 1° of movement gets 0.06 (very heavy filtering), 12° or
more gets 0.45 (nearly raw), linear in between.

## New Package
- `expo-haptics` (via `npx expo install expo-haptics`). Adds the Android
  `VIBRATE` permission automatically.

## Files Changed
- `utils/haptics.js` (new)
- `utils/qibla.js` (`adaptiveWeight`)
- `screens/QiblaScreen.js`
- `screens/SettingsScreen.js`

## Result
- Bundles clean (`npx expo export --platform android`, no errors).
- One buzz when you line up, none when you hover on the edge.
- The arrow holds still when the phone does, and keeps up when it doesn't.

## Known Issue / Next Step
- All four constants (5°, 8°, 0.06, 0.45) are still tuned by feel rather than
  measured. They're at least *principled* now instead of arbitrary, but they
  want testing on a real device.
- `expo-sensors` is still installed and unused — same note as yesterday.
- iOS won't vibrate in Low Power Mode, and the app has no way to tell the user
  why nothing happened.

## What I Learned
- **Hysteresis**: any boolean derived from a continuous measurement needs two
  thresholds, not one, or it chatters at the boundary. Obvious in hindsight,
  and it applies far beyond compasses.
- A filter constant doesn't have to be constant. Deriving it from the signal
  itself sidesteps a tradeoff instead of splitting the difference.
- Feedback that fires on a *state change* is cheap to compute, which is what
  made reading the setting from storage on every buzz acceptable. Worth
  checking how often something actually runs before optimising it.
