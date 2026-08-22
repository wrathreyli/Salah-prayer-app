// Assertions for the app's pure logic.
//
// These modules deliberately import nothing native, so node can run them
// directly — no bundler, no simulator, no mocking. `npm test`.
import assert from 'node:assert/strict';

import {
  addDays,
  bestStreakFrom,
  currentStreakFrom,
  formatDate,
  monthDaysFrom,
  parseDate,
  prayerBreakdownFrom,
} from '../utils/streak.js';
import { angleDifference, smoothAngle, adaptiveWeight } from '../utils/qibla.js';
import { checkCache, distanceKm } from '../utils/cachePolicy.js';
import { getNextPrayer, parsePrayerTime } from '../utils/nextPrayer.js';

const ALL = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
let run = 0;

function test(name, fn) {
  run += 1;
  try {
    fn();
  } catch (error) {
    console.error('FAIL  ' + name + '\n      ' + error.message);
    process.exitCode = 1;
  }
}

// ---------------------------------------------------------------- dates ----
test('formatDate uses local time, not UTC', () => {
  assert.equal(formatDate(new Date(2026, 0, 5)), '2026-01-05');
  assert.equal(formatDate(parseDate('2026-08-19')), '2026-08-19');
  assert.equal(parseDate('2026-08-19').getDate(), 19);
});

test('addDays crosses month and year boundaries', () => {
  assert.equal(formatDate(addDays(parseDate('2026-08-31'), 1)), '2026-09-01');
  assert.equal(formatDate(addDays(parseDate('2026-01-01'), -1)), '2025-12-31');
  assert.equal(formatDate(addDays(parseDate('2028-02-28'), 1)), '2028-02-29');
});

// -------------------------------------------------------------- streaks ----
test('a finished today counts toward the streak', () => {
  const history = { '2026-08-19': ALL, '2026-08-18': ALL, '2026-08-17': ALL };
  assert.equal(currentStreakFrom(history, parseDate('2026-08-19')), 3);
});

test('an unfinished today neither counts nor breaks', () => {
  const history = {
    '2026-08-19': ['Fajr'],
    '2026-08-18': ALL,
    '2026-08-17': ALL,
  };
  assert.equal(currentStreakFrom(history, parseDate('2026-08-19')), 2);
});

test('a gap ends the streak', () => {
  const history = { '2026-08-18': ALL, '2026-08-16': ALL };
  assert.equal(currentStreakFrom(history, parseDate('2026-08-19')), 1);
  assert.equal(currentStreakFrom({}, parseDate('2026-08-19')), 0);
});

test('best streak takes the longest run, not the latest', () => {
  assert.equal(
    bestStreakFrom({
      '2026-08-01': ALL,
      '2026-08-02': ALL,
      '2026-08-03': ALL,
      '2026-08-05': ALL,
      '2026-08-06': ALL,
    }),
    3
  );
  assert.equal(bestStreakFrom({}), 0);
});

test('partial days never count toward the best streak', () => {
  const history = {
    '2026-08-01': ALL,
    '2026-08-02': ['Fajr'],
    '2026-08-03': ALL,
  };
  assert.equal(bestStreakFrom(history), 1);
});

test('streaks span month ends and leap days', () => {
  assert.equal(
    bestStreakFrom({ '2026-08-31': ALL, '2026-09-01': ALL, '2026-09-02': ALL }),
    3
  );
  assert.equal(
    bestStreakFrom({ '2028-02-28': ALL, '2028-02-29': ALL, '2028-03-01': ALL }),
    3
  );
});

// ---------------------------------------------------------------- month ----
test('monthDaysFrom gets the length of the month right', () => {
  assert.equal(monthDaysFrom({}, 2028, 1).length, 29); // leap February
  assert.equal(monthDaysFrom({}, 2026, 1).length, 28);
  assert.equal(monthDaysFrom({}, 2026, 3).length, 30); // April
});

test('monthDaysFrom counts each day', () => {
  const august = monthDaysFrom({ '2026-08-19': ALL }, 2026, 7);
  assert.equal(august[18].dayOfMonth, 19);
  assert.equal(august[18].count, 5);
  assert.equal(august[0].count, 0);
});

test('the per-prayer breakdown only counts the dates asked for', () => {
  const breakdown = prayerBreakdownFrom(
    { '2026-08-01': ['Fajr', 'Isha'], '2026-08-02': ['Fajr'] },
    ['2026-08-01', '2026-08-02', '2026-08-03']
  );
  assert.equal(breakdown.Fajr, 2);
  assert.equal(breakdown.Isha, 1);
  assert.equal(breakdown.Asr, 0);
});

// --------------------------------------------------------------- angles ----
test('angleDifference takes the short way round', () => {
  assert.equal(angleDifference(350, 10), 20);
  assert.equal(angleDifference(10, 350), -20);
  assert.equal(angleDifference(90, 90), 0);
});

test('an exact half-turn lands on the bottom of the range', () => {
  // [-180, 180), so 180 comes back as -180. Same rotation either way, but
  // worth pinning down so the comment and the code agree.
  assert.equal(angleDifference(0, 180), -180);
  assert.equal(angleDifference(0, 181), -179);
  assert.ok(Math.abs(angleDifference(0, 179.9) - 179.9) < 1e-9);
});

test('smoothing never spins through the 0/360 seam', () => {
  const next = smoothAngle(355, 5, 0.5);
  assert.ok(next > 355 || next < 5, 'expected a short hop, got ' + next);
  assert.ok(next >= 0 && next < 360);
});

test('the smoothing weight rises with how far the reading moved', () => {
  assert.ok(adaptiveWeight(0) < adaptiveWeight(6));
  assert.ok(adaptiveWeight(6) < adaptiveWeight(30));
  // ...and stays inside its bounds at the extremes
  assert.ok(adaptiveWeight(1000) <= 0.45);
  assert.ok(adaptiveWeight(-1000) >= 0.06);
});

// ---------------------------------------------------------------- times ----
test('prayer times parse with or without a timezone suffix', () => {
  assert.deepEqual(parsePrayerTime('05:23'), { hours: 5, minutes: 23 });
  assert.deepEqual(parsePrayerTime('19:07 (+03)'), { hours: 19, minutes: 7 });
});

test('the next prayer is always a real one with a sane wait', () => {
  const times = [
    { name: 'Fajr', time: '05:00' },
    { name: 'Dhuhr', time: '13:00' },
    { name: 'Asr', time: '16:30' },
    { name: 'Maghrib', time: '20:00' },
    { name: 'Isha', time: '21:30' },
  ];
  // getNextPrayer reads the clock itself, so this holds whenever it runs.
  const next = getNextPrayer(times);
  assert.ok(times.some((p) => p.name === next.name));
  assert.ok(next.hoursLeft >= 0 && next.minutesLeft >= 0);
  assert.ok(next.minutesLeft < 60);
});

// ---------------------------------------------------------------- cache ----
test('distanceKm matches known separations', () => {
  // Istanbul to Ankara is roughly 350km.
  const apart = distanceKm(41.0082, 28.9784, 39.9334, 32.8597);
  assert.ok(apart > 330 && apart < 370, 'got ' + apart);
  assert.equal(Math.round(distanceKm(41.0082, 28.9784, 41.0082, 28.9784)), 0);
});

test('a cache from the same place and method is usable', () => {
  const cached = {
    timings: { Fajr: '05:00' },
    method: 13,
    latitude: 41,
    longitude: 29,
  };
  assert.deepEqual(
    checkCache(cached, { method: 13, latitude: 41.01, longitude: 29.01 }),
    { usable: true, reason: null }
  );
});

test('an empty or timings-less cache is refused', () => {
  assert.equal(checkCache(null, { method: 13 }).reason, 'empty');
  assert.equal(checkCache({ method: 13 }, { method: 13 }).reason, 'empty');
});

test('changing the calculation method invalidates the cache', () => {
  const cached = { timings: { Fajr: '05:00' }, method: 13 };
  assert.equal(checkCache(cached, { method: 2 }).usable, false);
  assert.equal(checkCache(cached, { method: 2 }).reason, 'method');
});

test('moving far enough invalidates the cache', () => {
  const cached = {
    timings: { Fajr: '05:00' },
    method: 13,
    latitude: 41.0082,
    longitude: 28.9784,
  };
  const ankara = { method: 13, latitude: 39.9334, longitude: 32.8597 };
  assert.equal(checkCache(cached, ankara).reason, 'moved');

  // ...but a trip across town does not.
  const acrossTown = { method: 13, latitude: 41.05, longitude: 29.05 };
  assert.equal(checkCache(cached, acrossTown).usable, true);
});

test('records saved before coordinates existed are still trusted', () => {
  const legacy = { timings: { Fajr: '05:00' }, method: 13 };
  const request = { method: 13, latitude: 41, longitude: 29 };
  assert.equal(checkCache(legacy, request).usable, true);
});

if (process.exitCode) {
  console.error('\n' + run + ' checks run, with failures above.');
} else {
  console.log('All ' + run + ' checks passed.');
}
