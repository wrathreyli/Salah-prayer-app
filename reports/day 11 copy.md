# Day 11

## What I set out to do
Turn the empty History tab into a real screen showing my prayer completion over the last 7 days.

## What I did
- Wrote a function that builds a storage key for any given date
- Looped backwards through the last 7 days and read each day's saved record from storage
- Displayed each day as a row with the date, five dots showing progress, and a count out of 5
- Made the screen reload its data every time I switch to the History tab

## What I learned
- useFocusEffect runs every time a screen comes into view, unlike useEffect which only runs once — needed here because the data changes on another tab
- Date arithmetic: setDate(getDate() - i) steps backwards one day at a time
- I can read multiple saved records by looping through different storage keys
- toLocaleDateString formats dates in a readable way
- Days with no saved data return null, so I treat that as an empty list instead of letting it crash
- Showing progress as filled dots communicates faster than numbers alone

## Problems & how I solved them
- Got a syntax error on the styles section because my paste was cut off partway through — the StyleSheet was never closed. Fixed it by pasting the missing styles and the closing bracket

