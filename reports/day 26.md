# Day 26 — Adhkar and Tasbih

## Goal
A fifth tab: the tasbih after prayer, plus the morning and evening adhkar, each
card counting your repetitions and remembering them for the day.

## Why This Matters
Everything the app does so far is *about* prayer — times, direction, whether you
prayed. Nothing helps you do something. The tasbih after salah is the obvious
gap: it's counted, it's repetitive, and counting on your fingers while holding
a phone is exactly the thing a phone should take over.

## What I Built

### `data/adhkar.js`
Three lists — tasbih, morning, evening — as plain data, each entry carrying a
stable `id`, the Arabic, a transliteration, a plain-English meaning, and the
traditional repeat count. Keeping it as data means the screen is only about
presentation, and adding a dhikr later is a data edit, not a code change.

The `id` matters more than it looks: it's the storage key for that dhikr's
count, so it has to stay stable even if the text is edited later.

### The counter
Each card is the counter. Tap anywhere on it to increment, long-press to reset.
No separate counter screen, no mode switch — the list *is* the interface.

Counting stops at the target rather than running past it, and the two haptics
are different on purpose:
- every tap is a **light** tick
- hitting the target is a **success** notification

So you can keep your eyes off the screen and still know when you've finished 33.

### Not writing to storage 100 times
The obvious version saves on every tap, which for `Astaghfirullah` x100 means a
hundred AsyncStorage writes for one dhikr. Instead the count lives in state and
a **debounced flush** writes 600ms after you stop tapping. The timer is cleared
when the tab loses focus so a half-finished count isn't lost.

### Counts reset daily
Stored under `adhkar-YYYY-MM-DD`, same shape as the prayer records. Yesterday's
half-finished tasbih shouldn't still be sitting there this morning.

### Refactoring haptics
Day 22 had a single `alignedFeedback()`. Now there are two kinds of buzz, so
both go through one private `buzz(run)` helper that owns the on/off check and
the "device has no vibration hardware" guard. `tapFeedback` and
`successFeedback` are just the two calls; `alignedFeedback` is now an alias, so
the Qibla screen didn't change at all.

## A Rendering Detail
React Native does **not** infer direction from the characters. Arabic needs
`writingDirection: 'rtl'` and `textAlign: 'right'` set explicitly, or the
punctuation lands on the wrong side.

## Files Changed
- `data/adhkar.js` (new)
- `utils/adhkarCounts.js` (new)
- `screens/AdhkarScreen.js` (new)
- `utils/haptics.js` (`tapFeedback` / `successFeedback`)
- `App.js`

## Result
- Bundles clean (`npx expo export --platform android`, no errors).
- Arabic verified as real Arabic-block codepoints after the file round-tripped
  through the shell — worth checking rather than assuming.

## Known Issue / Next Step
- The morning/evening lists are short and I've kept to adhkar I'm confident
  about. Worth expanding from a proper source rather than from memory.
- Nothing distinguishes morning from evening automatically — it's a manual tab,
  when the app already knows the time and could default to the right one.
- No Arabic font is bundled, so rendering depends on the device's default. It
  looks fine on Android but is worth checking on iOS.

## What I Learned
- **Debounce writes that follow taps.** A per-tap save is invisible at 5 taps
  and wrong at 100. State is the live value; storage is the backup.
- RTL is explicit in React Native. The text being Arabic isn't enough.
- When a helper grows a second variant, that's the moment to pull the shared
  guard out — not before. `buzz()` only earned its existence today.
- Content as data, not markup, means tomorrow's edit is a data edit.
