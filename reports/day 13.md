# Day 13 Report 

## What I set out to do
Add a live countdown showing which prayer is next and how long until it.

## What I did
- Created a nextPrayer.js utility that converts prayer times into minutes and works out which prayer is next
- Handled the case where all of today's prayers have passed, rolling over to tomorrow's Fajr
- Added a purple countdown card at the top of the Today screen
- Set up a timer that recalculates the countdown every minute

## What I learned
- Converting a time like "16:03" into minutes-since-midnight makes times easy to compare
- setInterval runs a function repeatedly on a timer (every 60000ms = 1 minute)
- A cleanup function (return () => clearInterval(timer)) stops the timer when leaving the screen, which prevents memory leaks
- The dependency array [timings] makes the effect re-run whenever the fetched times change
- Conditional rendering with && shows the card only once nextPrayer has a value

## Problems & how I solved them
- I accidentally created a nested utils folder and pasted a wrong self-import line into nextPrayer.js — fixed by moving the file to the right place and deleting the bad line
- My styles got duplicated at first — cleaned them up so each style is defined once