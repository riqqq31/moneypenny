import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  addDays,
  dateKey,
  dayOfMonth,
  daysInMonth,
  monthKey,
  monthLabel,
  monthName,
  monthShort,
  parseKey,
  shiftMonth,
  todayKey,
  weekdayShort
} from '../src/js/core/date.js';

test('dateKey pads and parses local dates', () => {
  const d = new Date(2026, 0, 5);
  assert.equal(dateKey(d), '2026-01-05');
  assert.equal(parseKey('2026-01-05').getTime(), d.getTime());
  assert.equal(dayOfMonth('2026-11-16'), 16);
});

test('todayKey is a date key', () => {
  assert.match(todayKey(), /^\d{4}-\d{2}-\d{2}$/);
});

test('addDays crosses month and year boundaries', () => {
  assert.equal(addDays('2026-01-31', 1), '2026-02-01');
  assert.equal(addDays('2026-03-01', -1), '2026-02-28');
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
});

test('shiftMonth wraps across years in both directions', () => {
  assert.equal(shiftMonth('2026-01', -1), '2025-12');
  assert.equal(shiftMonth('2026-12', 1), '2027-01');
  assert.equal(shiftMonth('2026-07', -18), '2025-01');
  assert.equal(shiftMonth('2026-07', 12), '2027-07');
});

test('daysInMonth knows leap years', () => {
  assert.equal(daysInMonth('2024-02'), 29);
  assert.equal(daysInMonth('2026-02'), 28);
  assert.equal(daysInMonth('2026-04'), 30);
  assert.equal(daysInMonth('2026-12'), 31);
});

test('month labels are stable for the en-GB locale', () => {
  assert.equal(monthKey('2026-11-16'), '2026-11');
  assert.equal(monthName('2026-11'), 'November');
  assert.equal(monthLabel('2026-11'), 'November 2026');
  assert.equal(monthShort('2026-11'), 'NOV');
  assert.equal(weekdayShort('2026-11-16'), 'MON');
});
