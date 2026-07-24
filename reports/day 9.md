Day 9 

What I set out to do

Make the prayer cards interactive so I can tap to mark a prayer as completed.

What I did

- Rebuilt PrayerCard using TouchableOpacity so it responds to taps
- Added a checkmark circle that fills in when a prayer is completed
- Added state in TodayScreen to keep a list of completed prayers
- Wrote a toggle function that adds or removes a prayer from that list
- Added a counter in the header showing how many prayers are done today

## What I learned
- TouchableOpacity makes any element tappable using onPress
- State can hold an array, not just a single value
- React needs a NEW array to detect a change — I create one with [...current, item] to add or .filter() to remove, instead of changing the array directly
- Passing a function as a prop lets the parent decide what happens when a child is tapped
- The counter is derived from state (completed.length) rather than stored separately

## Problems & how I solved them
- (write anything you hit here)

## Next steps
Day 10: make the completed prayers save on the device so they don't reset when the app closes.