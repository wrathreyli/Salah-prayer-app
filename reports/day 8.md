Day 8 

Goals to be completed

Make the app fetch prayer times for the user's actual location instead of being hardcoded to Istanbul.

What I did
- Installed the expo-location package
- Added code that asks the user for permission to use their location
- Got the device's GPS coordinates and fetched prayer times using those coordinates
- Added a fallback to Istanbul if the user denies permission

What I learned
- Apps must ask the user for permission before accessing location
- expo-location gets the device's latitude and longitude
- The API can take coordinates instead of a city name, so it works anywhere
- Always add a fallback so the app still works if permission is denied

Problems & how I solved them
- I first added the location import to App.js by mistake — it belonged in TodayScreen.js where the fetching happens
- Got a red error saying expo-location couldn't be found, because the package wasn't installed yet — fixed it by running expo install expo-location and restarting with a cleared cache

## Next steps
Day 9: start tracking which prayers I've completed and save it on the device.