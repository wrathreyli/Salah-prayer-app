What I did

Installed React Navigation and its supporting packages using expo install
Created a screens folder with three screen files: Today, History, Settings
Moved the prayer-times UI into TodayScreen
Set up a bottom tab navigator in App.js so I can switch between the three screens

What I learned

Navigation lets users move between multiple screens
A bottom tab navigator creates the tab bar; each Tab.Screen is one tab
NavigationContainer must wrap the whole app for navigation to work
Relative imports use ../ to go up a folder, which just screens importing from components
expo install picks package versions that match the SDK, avoiding dependency conflicts

Problems & how I solved them

npm install failed with a dependency version conflict → fixed by installing through expo install instead, which matches compatible versions
App didn't show tabs at first → needed a full reload for navigation to take effect