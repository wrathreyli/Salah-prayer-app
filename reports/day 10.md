# Day 10 Report — Saving Data on the Device

## What I set out to do
Make the completed prayers save permanently so they don't disappear when the app closes.

## What I did
- Installed AsyncStorage, which stores data on the device
- Wrote a function that generates a key based on today's date, so each day gets its own record
- Added a second useEffect that loads today's saved completions when the screen opens
- Made the toggle function save the updated list to storage every time I tap a prayer
- Tested it by checking off prayers, fully closing the app, and reopening it — the checkmarks were still there

## What I learned
- AsyncStorage saves data as key-value pairs on the device
- setItem writes data and getItem reads it back
- AsyncStorage only stores text, so I use JSON.stringify to save an array and JSON.parse to read it back
- Using a date-based key means tomorrow automatically starts fresh instead of showing today's checkmarks
- It's cleaner to have separate useEffects that each do one job — one fetches prayer times, one loads saved data

## Problems & how I solved them
- (write anything you hit here)

## Next steps
Day 11: build the History screen to show past days and start calculating streaks.