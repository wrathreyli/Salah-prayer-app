What I did

Added useState to store the fetched timings and a loading flag
Saved the API data into state instead of just logging it
Added a "Loading..." screen shown while the data arrives
Built the prayer list from the live data and displayed it with PrayerCard

What I learned

useState stores data that can change; changing it re-renders the screen
A loading state prevents the app crashing while waiting for data
The core data-flow pattern: fetch → save to state → build UI from it → render
Real API times differ slightly from hardcoded ones, which proves the data is live

Problems
Nothing i havent seen before