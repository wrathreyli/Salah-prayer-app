# Day 12 Report

## What I set out to do
Calculate how many days in a row I've completed all five prayers, and display it on the History screen.

## What I did
- Created a utils folder with a streak.js file to keep the logic separate from the UI
- Wrote a function that reads how many prayers were completed on any given date
- Wrote the streak algorithm: walk backwards day by day and count consecutive days with all 5 completed, stopping as soon as a day breaks the chain
- Handled the edge case where today isn't finished yet, so an incomplete today doesn't wrongly break the streak
- Added a large purple streak card at the top of the History screen

## What I learned
- Logic that isn't UI belongs in its own file so it can be reused and tested separately
- Named exports (export function) let one file export several things, unlike export default
- Designing an algorithm means thinking through the rules first: what continues the streak, what breaks it, and what edge cases exist
- Using break in a loop exits early instead of pointlessly checking all 365 day