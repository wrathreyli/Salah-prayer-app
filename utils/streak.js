export const PREFIX = 'prayers-';

export const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

// A date as "2026-08-19", in the phone's own timezone.
export function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Build a storage key for a given date.
export function getKeyForDate(date) {
  return `${PREFIX}${formatDate(date)}`;
}

// "2026-08-19" back into a Date at local midnight. Deliberately not
// `new Date(string)`, which parses this format as UTC and can land a day off.
export function parseDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function isComplete(byDate, date) {
  const list = byDate[formatDate(date)];
  return Array.isArray(list) && list.length === PRAYER_NAMES.length;
}

// Consecutive days (going backwards) with all five prayers completed.
//
// Today only counts once it's finished — an unfinished today is still in
// progress, so it neither adds to the streak nor breaks it.
export function currentStreakFrom(byDate, today = new Date()) {
  let streak = 0;
  let cursor = today;

  if (!isComplete(byDate, today)) {
    cursor = addDays(today, -1);
  }

  while (isComplete(byDate, cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

// The longest run of complete days anywhere in the history.
export function bestStreakFrom(byDate) {
  const complete = Object.keys(byDate)
    .filter((date) => byDate[date].length === PRAYER_NAMES.length)
    .sort();

  let best = 0;
  let run = 0;
  let previous = null;

  for (const date of complete) {
    const current = parseDate(date);
    const isNextDay =
      previous !== null &&
      formatDate(addDays(previous, 1)) === date;

    run = isNextDay ? run + 1 : 1;
    if (run > best) best = run;
    previous = current;
  }

  return best;
}

// How many days each individual prayer was completed, across the given dates.
export function prayerBreakdownFrom(byDate, dates) {
  const counts = {};
  for (const name of PRAYER_NAMES) counts[name] = 0;

  for (const date of dates) {
    const list = byDate[date];
    if (!Array.isArray(list)) continue;
    for (const name of list) {
      if (counts[name] !== undefined) counts[name] += 1;
    }
  }

  return counts;
}

// The days of one calendar month, as { date, dayOfMonth, count }.
// `month` is 0-based, matching Date.
export function monthDaysFrom(byDate, year, month) {
  const dayCount = new Date(year, month + 1, 0).getDate();
  const days = [];

  for (let day = 1; day <= dayCount; day++) {
    const date = formatDate(new Date(year, month, day));
    const list = byDate[date];
    days.push({
      date,
      dayOfMonth: day,
      count: Array.isArray(list) ? list.length : 0,
    });
  }

  return days;
}
