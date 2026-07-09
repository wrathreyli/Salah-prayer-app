Today's goal

Was to learn how to fetch real data from an API instead of using fake times

What I did

Found the Aladhan API that returns prayer times for a city
Added a useEffect hook to TodayScreen that runs when the screen loads
Used fetch() to call the API and got back real Istanbul prayer times
Logged the data to the console to confirm it worked

What I learned

An API is a service you request data from over the internet
fetch() makes the request; async/await waits for the data since it isn't instant
.json() turns the raw response into a usable JavaScript object
useEffect with an empty [] runs code once when the screen loads — good for fetching on startup
try/catch handles errors if the request fails
console.log prints data to the terminal so I can inspect it while building

Problems & how I solved them

At first I only added the useEffect import but not the actual block, i added the fetch code between the function opening and the return

