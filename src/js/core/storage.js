/* Budget HP — localStorage boundary: shape, validation, save/load.
   Everything crossing this file is untrusted (imports, old versions, edits). */

import { CAT_LABEL, STORAGE_KEY } from './config.js';
import { isDateKey, monthKey, shiftMonth, todayKey } from './date.js';
import { uid } from './id.js';

export function fresh() {
  const t = todayKey();
  return {
    version: 1,
    settings: { startDate: t, budgets: {} },
    transactions: [],
    game: {
      xp: 0,
      streak: 0,
      longestStreak: 0,
      lastProcessedMonth: shiftMonth(monthKey(t), -1)
    }
  };
}

export function normalize(raw) {
  const base = fresh();
  if (!raw || typeof raw !== 'object') return base;
  const s = raw.settings || {};
  const g = raw.game || {};

  const budgets = {};
  if (s.budgets && typeof s.budgets === 'object') {
    Object.keys(s.budgets).forEach((k) => {
      const v = Number(s.budgets[k]);
      if (/^\d{4}-\d{2}$/.test(k) && isFinite(v) && v > 0) budgets[k] = Math.round(v);
    });
  }

  const txs = Array.isArray(raw.transactions)
    ? raw.transactions
        .filter((t) => t && isDateKey(t.date) && isFinite(Number(t.amount)) && Number(t.amount) > 0)
        .map((t) => ({
          id: String(t.id || uid()),
          amount: Math.round(Number(t.amount)),
          category: CAT_LABEL[t.category] ? t.category : 'other',
          note: String(t.note || '').slice(0, 80),
          date: t.date,
          regretTag:
            t.regretTag === 'worth' || t.regretTag === 'neutral' || t.regretTag === 'regret'
              ? t.regretTag
              : null,
          createdAt: Number(t.createdAt) || 0
        }))
    : [];

  return {
    version: 1,
    settings: {
      startDate: isDateKey(s.startDate) ? s.startDate : base.settings.startDate,
      budgets
    },
    transactions: txs,
    game: {
      xp: Math.max(0, Math.round(Number(g.xp) || 0)),
      streak: Math.max(0, Math.round(Number(g.streak) || 0)),
      longestStreak: Math.max(0, Math.round(Number(g.longestStreak) || 0)),
      /* Legacy backups carried day-based fields; a missing month starts the
         monthly loop at the previous month, so old XP is kept untouched. */
      lastProcessedMonth: /^\d{4}-\d{2}$/.test(g.lastProcessedMonth)
        ? g.lastProcessedMonth
        : shiftMonth(monthKey(base.settings.startDate), -1)
    }
  };
}

export function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? normalize(JSON.parse(raw)) : fresh();
  } catch {
    return fresh();
  }
}

export function save(db) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    /* private mode: the session still works in memory */
  }
}
