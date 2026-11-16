/* Budget HP — the game rules. Every function takes the data it reads, so the
   whole module can be tested without a browser. */

import { XP_MONTH_CAP } from './config.js';
import { dayOfMonth, daysInMonth, monthKey, shiftMonth, todayKey } from './date.js';

export function budgetFor(db, mk) {
  const v = db.settings.budgets[mk];
  return typeof v === 'number' && v > 0 ? v : null;
}

export function dailyBudget(db, mk) {
  const b = budgetFor(db, mk);
  return b === null ? null : Math.floor(b / daysInMonth(mk));
}

export function spendOn(db, k) {
  let s = 0;
  for (let i = 0; i < db.transactions.length; i++) {
    if (db.transactions[i].date === k) s += db.transactions[i].amount;
  }
  return s;
}

export function spendInMonth(db, mk) {
  let s = 0;
  for (let i = 0; i < db.transactions.length; i++) {
    if (db.transactions[i].date.slice(0, 7) === mk) s += db.transactions[i].amount;
  }
  return s;
}

/* HP is the month's budget minus everything spent in it; it may go negative. */
export function hpThisMonth(db, mk) {
  const b = budgetFor(db, mk);
  return b === null ? null : b - spendInMonth(db, mk);
}

/* A month that closes with money left banks a share of the budget as XP. */
export function xpForMonth(leftover, budget) {
  if (leftover <= 0 || budget <= 0) return 0;
  const pct = Math.round((leftover / budget) * 100);
  return Math.max(1, Math.min(XP_MONTH_CAP, pct));
}

export function levelInfo(xp) {
  const level = Math.max(1, Math.floor((1 + Math.sqrt(1 + 0.08 * xp)) / 2));
  const prev = 50 * (level - 1) * level;
  const next = 50 * level * (level + 1);
  return {
    level,
    prev,
    next,
    pct: next > prev ? Math.min(1, Math.max(0, (xp - prev) / (next - prev))) : 0
  };
}

/* Scores every completed month that has a budget and has not been scored yet. */
export function tick(db) {
  const mk = monthKey(todayKey());
  const g = db.game;
  let cur = shiftMonth(g.lastProcessedMonth, 1);

  let guard = 0;
  while (cur < mk && guard++ < 240) {
    const b = budgetFor(db, cur);
    if (b !== null) {
      const left = b - spendInMonth(db, cur);
      if (left > 0) {
        g.xp += xpForMonth(left, b);
        g.streak += 1;
        if (g.streak > g.longestStreak) g.longestStreak = g.streak;
      } else {
        g.streak = 0;
      }
    }
    g.lastProcessedMonth = cur;
    cur = shiftMonth(cur, 1);
  }
}

/* Useful for the "day N of M" copy and for tests. */
export function dayOfMonthLeft(mk, day = todayKey()) {
  return daysInMonth(mk) - dayOfMonth(day) + 1;
}

/* The most recent month holding a purchase, ignoring `exclude`. The current
   month's charts are empty when the ledger lives in another month, and saying
   which month that is turns an empty chart into an explanation. */
export function latestSpendMonth(db, exclude = null) {
  let latest = null;
  for (let i = 0; i < db.transactions.length; i++) {
    const mk = db.transactions[i].date.slice(0, 7);
    if (mk === exclude) continue;
    if (latest === null || mk > latest) latest = mk;
  }
  return latest;
}
