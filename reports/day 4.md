# Day 4 

What I set out to do
Organize my code into separate files instead of keeping everything in App.js, and separate my prayer data from how it's displayed on screen.

What I did

- Moved the PrayerCard component out of App.js into its own file at components/PrayerCard.js
- Stored the 5 prayers as an array of objects (each with an id, name, time, and highlight) instead of writing out each card by hand
- Used .map() to loop through the array and automatically create a PrayerCard for every prayer
- Confirmed the app still looked identical to Day 3, which proved the reorganization worked

What I learned

- Components can live in their own files and get connected using "export default" in one file and "import" in another
- Separating data from presentation is an important programming principle — now if I want to change the prayers, I just edit the data array, not the layout
- .map() loops over a list of data and builds UI for each item automatically
- Every item rendered in a .map() needs a unique "key" prop so React can track them
- A "Render Error: element type is invalid" almost always means a file wasn't saved or a component wasn't exported properly

Problems & how I solved them

- I accidentally created the components folder inside the .claude folder instead of at the top of my project, so I moved it to sit directly next to App.js
- I got a Render Error on my phone because my new files weren't saved yet — the running app couldn't see them. I fixed it by saving every file with Ctrl+S, and learned that unsaved files are invisible to the app

Next steps 

Day 5 (start of Week 2): begin adding navigation and prepare to fetch real prayer times from an API instead of using hardcoded values.