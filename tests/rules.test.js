import assert from 'node:assert/strict';
import { test } from 'node:test';

import { monthKey, shiftMonth, todayKey } from '../src/js/core/date.js';
import {
  budgetFor,
  dailyBudget,
  hpThisMonth,
  levelInfo,
  spendInMonth,
  spendOn,
  tick,
  xpForMonth
} from '../src/js/core/rules.js';
import { fresh } from '../src/js/core/storage.js';

function ledger() {
  const db = fresh();
  db.settings.budgets = { '2026-11': 3100000 };
  db.transactions = [
    {
      id: 'a',
      amount: 50000,
      date: '2026-11-01',
      category: 'food',
      note: '',
      regretTag: null,
      createdAt: 1
    },
    {
      id: 'b',
      amount: 25000,
      date: '2026-11-01',
      category: 'fun',
      note: '',
      regretTag: null,
      createdAt: 2
    },
    {
      id: 'c',
      amount: 200000,
      date: '2026-11-02',
      category: 'bills',
      note: '',
      regretTag: null,
      createdAt: 3
    },
    {
      id: 'd',
      amount: 999999,
      date: '2026-10-31',
      category: 'other',
      note: '',
      regretTag: null,
      createdAt: 4
    }
  ];
  return db;
}

test('budgetFor ignores missing, zero and non-numeric budgets', () => {
  const db = ledger();
  db.settings.budgets['2026-12'] = 0;
  db.settings.budgets['2027-01'] = 'nope';

  assert.equal(budgetFor(db, '2026-11'), 3100000);
  assert.equal(budgetFor(db, '2026-12'), null);
  assert.equal(budgetFor(db, '2026-10'), null);
  assert.equal(budgetFor(db, '2027-01'), null);
});

test('dailyBudget floors the monthly budget over the month length', () => {
  const db = ledger();
  assert.equal(dailyBudget(db, '2026-11'), 103333);
  assert.equal(dailyBudget(db, '2026-10'), null);
});

test('spendOn and spendInMonth only count their window', () => {
  const db = ledger();
  assert.equal(spendOn(db, '2026-11-01'), 75000);
  assert.equal(spendOn(db, '2026-11-03'), 0);
  assert.equal(spendInMonth(db, '2026-11'), 275000);
  assert.equal(spendInMonth(db, '2026-10'), 999999);
});

test('HP may go negative and is null without a budget', () => {
  const db = ledger();
  assert.equal(hpThisMonth(db, '2026-11'), 3100000 - 275000);

  db.settings.budgets['2026-11'] = 100000;
  assert.equal(hpThisMonth(db, '2026-11'), -175000);
  assert.equal(hpThisMonth(db, '2026-10'), null);
});

test('xpForMonth keeps a quarter of the month as XP, capped at 100', () => {
  assert.equal(xpForMonth(500000, 1000000), 50);
  assert.equal(xpForMonth(1000000, 1000000), 100);
  assert.equal(xpForMonth(1, 1000000), 1);
  assert.equal(xpForMonth(0, 1000000), 0);
  assert.equal(xpForMonth(-1, 1000000), 0);
});

test('levelInfo follows the triangular XP curve', () => {
  assert.deepEqual(
    { level: levelInfo(0).level, prev: levelInfo(0).prev, next: levelInfo(0).next },
    { level: 1, prev: 0, next: 100 }
  );
  assert.equal(levelInfo(99).level, 1);
  assert.equal(levelInfo(100).level, 2);
  assert.equal(levelInfo(100).prev, 100);
  assert.equal(levelInfo(100).next, 300);
  assert.equal(levelInfo(1000).level, 5);
  assert.ok(levelInfo(200).pct > 0 && levelInfo(200).pct < 1);
});

test('tick banks XP for a closed month under budget', () => {
  const db = fresh();
  const lastMonth = shiftMonth(monthKey(todayKey()), -1);
  const beforeThat = shiftMonth(lastMonth, -1);
  db.game.lastProcessedMonth = beforeThat;
  db.settings.budgets[lastMonth] = 1000000;
  db.transactions = [
    {
      id: 'a',
      amount: 500000,
      date: lastMonth + '-01',
      category: 'food',
      note: '',
      regretTag: null,
      createdAt: 1
    }
  ];

  tick(db);

  assert.equal(db.game.xp, 50);
  assert.equal(db.game.streak, 1);
  assert.equal(db.game.longestStreak, 1);
  assert.equal(db.game.lastProcessedMonth, lastMonth);
});

test('tick resets the streak when a closed month overspends', () => {
  const db = fresh();
  const lastMonth = shiftMonth(monthKey(todayKey()), -1);
  const beforeThat = shiftMonth(lastMonth, -1);
  db.game.lastProcessedMonth = beforeThat;
  db.settings.budgets[lastMonth] = 100000;
  db.transactions = [
    {
      id: 'a',
      amount: 150000,
      date: lastMonth + '-01',
      category: 'food',
      note: '',
      regretTag: null,
      createdAt: 1
    }
  ];
  db.game.streak = 4;
  db.game.longestStreak = 4;

  tick(db);

  assert.equal(db.game.streak, 0);
  assert.equal(db.game.longestStreak, 4);
  assert.equal(db.game.xp, 0);
});

test('tick skips months without a budget but still advances', () => {
  const db = fresh();
  const lastMonth = shiftMonth(monthKey(todayKey()), -1);
  db.game.lastProcessedMonth = shiftMonth(lastMonth, -1);
  db.game.streak = 2;

  tick(db);

  assert.equal(db.game.streak, 2);
  assert.equal(db.game.lastProcessedMonth, lastMonth);
});

test('a fresh ledger treats last month as already processed', () => {
  const db = fresh();
  tick(db);

  assert.equal(db.game.lastProcessedMonth, shiftMonth(monthKey(todayKey()), -1));
  assert.equal(db.game.xp, 0);
});
