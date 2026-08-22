# Day 27 — The Summary Card

## Goal
Replace the Today screen's stacked header and next-prayer card with one card
that answers the three things you actually open the app for: how far through the
day you are, what's next, and whether the streak still holds.

## Why This Matters
The old top of the screen was three separate pieces of furniture — a title
block, a line of text saying "3 of 5 completed today", and a big purple card
with the next prayer. Three boxes, one question each, and the streak wasn't
there at all: you had to go to History to find out whether today mattered.

## What I Built

### `components/ProgressRing.js`
First use of `react-native-svg` (`npx expo install react-native-svg` — it ships
in Expo Go). A ring drawn as two circles: a track, and an arc on top of it.

The arc trick is `strokeDasharray` / `strokeDashoffset`. Set the dash length to
the full circumference so there's exactly one dash and one gap, then animate the
*offset* from `circumference` (nothing showing) to `0` (full circle). The whole
`<Svg>` is rotated -90° so it starts at 12 o'clock instead of 3.

Two things worth writing down:
- **Animating an SVG prop needs `Animated.createAnimatedComponent(Circle)`.** A
  plain `Circle` won't accept an `Animated.Value`.
- **`useNativeDriver: false`** here. Day 21 taught me only `opacity` and
  `transform` go on the native driver — `strokeDashoffset` is neither, so this
  animation runs on the JS thread. It's one value over 550ms, so that's fine,
  but it's a real constraint and not a mistake.

The component takes `trackColor` and `fillColor` rather than reading them from
the theme, because it sits on the accent-colored card where the defaults would
be invisible. A component that assumes its own background is a component you
can only use once.

### The card
Ring on the left with `3 / of 5` inside it, and on the right the next prayer,
its countdown, and the streak line. One card, three answers.

Small things:
- The countdown reads **"in 14m"** rather than "in 0h 14m" once the hours run
  out.
- With no next prayer the card doesn't collapse — it keeps its shape and just
  drops the countdown.
- The streak recalculates immediately when you tick the fifth prayer, rather
  than waiting until you next open History.

## Files Changed
- `components/ProgressRing.js` (new)
- `screens/TodayScreen.js`
- `package.json` (`react-native-svg`)

## Result
- Bundles clean (`npx expo export --platform android`, no errors).
- Bundle grew from 2.5MB to 2.71MB — that's what the SVG library costs.

## Known Issue / Next Step
- The ring animates from 0 every time the screen mounts, so switching tabs
  replays it. It should animate from wherever it already was.
- 210KB of bundle for one ring is a lot. Worth keeping an eye on whether
  `react-native-svg` earns its place or whether the ring could be two rotated
  half-circles made of plain views.
- The streak is recalculated by reading all history on every toggle. Cheap now,
  lazy later.

## What I Learned
- **A progress ring is a dashed line with one dash.** Once `strokeDasharray` is
  the full circumference, `strokeDashoffset` *is* the progress value.
- `Animated.createAnimatedComponent` is how animation reaches libraries that
  don't know about `Animated`.
- Yesterday's native-driver rule has a corollary: when the property can't go
  native, that's a reason to keep the animation short and singular, not a reason
  to avoid it.
- **Components shouldn't assume their background.** Passing the two stroke
  colors in took thirty seconds and made the ring reusable anywhere.
