What I set out to do

Learn how to make reusable components
Practice Flexbox to understand layout

What I did

Turned my 5 repeated prayer cards into one reusable PrayerCard component
Passed each prayer's name and time into it as props
Experimented with Flexbox — changed flexDirection from row to column, tried different justifyContent values, and watched the layout rearrange on my phone
Broke the layout on purpose to see what each property does, then reset it to the clean version

What I learned (your own words)

A component is a reusable blueprint for UI you define once and reuse many times
Props are the inputs you pass into a component (like name and time)
flexDirection: 'row' puts items side by side; 'column' stacks them vertically
justifyContent: 'space-between' pushes items to opposite ends
Changing one Flexbox property rearranges the whole layout

Problems & how I solved them

A messy paste scrambled my card styles (missing comma, jumbled shadow lines) → replaced the whole file with a clean version
Git rejected my push because I'd made the Day 1 report on the website → fixed it with git pull, completed the merge, then pushed successfully
My Flexbox experiment left the cards broken (stacked and merged) → reset the card style back to row + space-between
