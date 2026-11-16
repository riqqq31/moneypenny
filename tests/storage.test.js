import assert from 'node:assert/strict';
import { test } from 'node:test';

import { fresh, normalize } from '../src/js/core/storage.js';

function validBackup() {
  return {
    version: 1,
    settings: { startDate: '2026-01-01', budgets: { '2026-11': 3100000, bad: 100 } },
    transactions: [
      {
        id: 'a',
        amount: 25000,
        category: 'food',
        note: 'warung',
        date: '2026-11-01',
        regretTag: 'worth',
        createdAt: 1
      }
    ],
    game: { xp: 120, streak: 2, longestStreak: 3, lastProcessedMonth: '2026-10' }
  };
}

test('fresh starts at level 1 with the loop at last month', () => {
  const db = fresh();
  assert.equal(db.version, 1);
  assert.equal(db.game.xp, 0);
  assert.equal(db.transactions.length, 0);
  assert.match(db.settings.startDate, /^\d{4}-\d{2}-\d{2}$/);
  assert.match(db.game.lastProcessedMonth, /^\d{4}-\d{2}$/);
});

test('normalize keeps a valid backup intact', () => {
  const db = normalize(validBackup());
  assert.equal(db.settings.startDate, '2026-01-01');
  assert.deepEqual(Object.keys(db.settings.budgets), ['2026-11']);
  assert.equal(db.transactions.length, 1);
  assert.equal(db.transactions[0].note, 'warung');
  assert.equal(db.game.xp, 120);
});

test('normalize rejects junk and falls back to a fresh ledger', () => {
  assert.equal(normalize(null).transactions.length, 0);
  assert.equal(normalize('nope').transactions.length, 0);
  assert.equal(normalize(42).settings.startDate, fresh().settings.startDate);
});

test('normalize repairs an invalid transaction instead of dropping the file', () => {
  const raw = validBackup();
  raw.transactions.push(
    { amount: 0, date: '2026-11-02', category: 'food' },
    { amount: '5000', date: '02-11-2026', category: 'food' },
    { amount: '7500', date: '2026-11-03', category: 'unknown', note: 'x'.repeat(200) }
  );

  const db = normalize(raw);
  assert.equal(db.transactions.length, 2);
  assert.equal(db.transactions[1].category, 'other');
  assert.equal(db.transactions[1].note.length, 80);
  assert.equal(db.transactions[1].regretTag, null);
  assert.ok(db.transactions[1].id);
});

test('normalize tolerates a legacy backup with day-based game fields', () => {
  const raw = validBackup();
  delete raw.game.lastProcessedMonth;
  raw.game.lastProcessedDay = '2026-10-30';

  const db = normalize(raw);
  assert.match(db.game.lastProcessedMonth, /^\d{4}-\d{2}$/);
  assert.equal(db.game.xp, 120);
});

test('normalize clamps negative game counters', () => {
  const raw = validBackup();
  raw.game = { xp: -50, streak: -1, longestStreak: 'x', lastProcessedMonth: '2026-10' };

  const db = normalize(raw);
  assert.equal(db.game.xp, 0);
  assert.equal(db.game.streak, 0);
  assert.equal(db.game.longestStreak, 0);
});
