function timeToMinutes(timeString) {
  const clean = timeString.split(' ')[0];
  const parts = clean.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  return hours * 60 + minutes;
}

// Work out which prayer is next and how long until it.
export function getNextPrayer(prayers) {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  for (let i = 0; i < prayers.length; i++) {
    const prayerMinutes = timeToMinutes(prayers[i].time);

    if (prayerMinutes > nowMinutes) {
      const diff = prayerMinutes - nowMinutes;
      return {
        name: prayers[i].name,
        hoursLeft: Math.floor(diff / 60),
        minutesLeft: diff % 60,
      };
    }
  }

  // All of today's prayers have passed — next is tomorrow's Fajr.
  const fajrMinutes = timeToMinutes(prayers[0].time);
  const minutesUntilMidnight = 24 * 60 - nowMinutes;
  const diff = minutesUntilMidnight + fajrMinutes;

  return {
    name: prayers[0].name,
    hoursLeft: Math.floor(diff / 60),
    minutesLeft: diff % 60,
  };
}