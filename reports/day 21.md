# Day 21 

## Goal
Two open loops, one theme. Smooth the jittery Qibla arrow from Day 18, and make
the notification highlight from Day 20 fade instead of snapping on. First real
use of `Animated`.

## Why This Matters
Both issues are the same underlying mistake: I was letting state change instantly
and letting React re-render on every tick. Animation isn't decoration here — a
compass needle that twitches is genuinely hard to use, and a border that pops in
and out looks like a bug.

## Part 1 — The Qibla Compass

### The accuracy bug I found along the way
The old screen read the raw magnetometer and did `atan2(y, x)` to get a heading.
That gives **magnetic** north. But `getQiblaBearing` computes a great-circle
bearing from **true** north — so the arrow was off by the local magnetic
declination the whole time (about 6° in Istanbul, much worse elsewhere).

Fix: swapped `expo-sensors`' `Magnetometer` for `expo-location`'s
`watchHeadingAsync`, which returns `trueHeading` — magnetic north already
corrected for declination — and falls back to `magHeading` (`trueHeading` is
`-1` without location permission). It also reports an `accuracy` level, so the
screen can now say "move your phone in a figure-eight" when the compass needs
calibrating.

### The smoothing
Two helpers in `utils/qibla.js`:
- **`angleDifference(from, to)`** — the shortest signed turn between two angles,
  in (-180, 180]. 350° → 10° is `+20`, not `-340`.
- **`smoothAngle(current, target, weight)`** — a low-pass filter that moves the
  running value a fraction of the way toward each new reading.

Both have to work on the *shortest* turn. A naive average across the 359°/0°
boundary sends the needle spinning all the way around the dial.

### Rendering it
- The smoothed heading lives in a **ref**, not state. Readings arrive constantly;
  storing them in state re-rendered the whole screen every time, which was half
  the jank.
- Rotation is an **`Animated.Value`** driven by `Animated.timing` with
  `useNativeDriver: true`, so the animation runs off the JS thread entirely.
- The rotation value is **unwrapped**: each new target is reached by *adding*
  the shortest difference to the value already applied, so it can run past 360°
  or below 0° rather than snapping backwards through the dial.
- The only things that trigger a re-render are the two flags that rarely change:
  "am I facing the Qibla" (within 5°) and "is the compass badly calibrated".

Aligned state also recolors the dial and the arrow, so it's obvious without
reading anything.

## Part 2 — The Fading Highlight

The Day 20 highlight was a border-color swap. Border colors **can't** animate on
the native driver — only `opacity` and `transform` can.

So instead of animating the card's border, the card now contains an absolutely
positioned `Animated.View` ring (`StyleSheet.absoluteFillObject` + the accent
border) sitting on top, with `pointerEvents="none"` so it doesn't eat taps. Only
its opacity animates: 250ms in, 600ms out — quicker to appear than to leave,
which reads as intentional rather than laggy.

## Files Changed
- `screens/QiblaScreen.js` (rewritten)
- `utils/qibla.js` (`angleDifference`, `smoothAngle`)
- `components/PrayerCard.js`

## Result
- Bundles clean (`npx expo export --platform android`, no errors).
- The arrow now glides instead of twitching, and points to true north.
- The notification highlight fades in and out.

## Known Issue / Next Step
- `expo-sensors` is still installed but no longer imported anywhere. Left it in
  for now in case I want a sensor feature later; worth removing if not.
- The smoothing weight (0.15) is a guess that feels right on my phone. A slower
  filter when the phone is still and a faster one when it's turning would be
  better, but that's a real signal-processing job.
- No haptic feedback when you line up with the Qibla. `expo-haptics` would be a
  nice touch.

## What I Learned
- **Only `opacity` and `transform` work with `useNativeDriver: true`.** Anything
  that changes layout or colors has to run on the JS thread. Designing around
  that constraint — an overlay instead of a border — is usually better anyway.
- **High-frequency sensor data doesn't belong in state.** Refs for the values,
  state only for the flags a human would actually notice changing.
- **Angles need circular math.** Averaging, comparing, and interpolating them
  all break at the 0°/360° seam unless you go through a shortest-difference
  helper.
- Magnetic north ≠ true north, and mixing them silently gives you an answer
  that's plausible but wrong. Worth checking which one an API returns.
