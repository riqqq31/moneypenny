/* Budget HP — single source of truth for names, keys and vocabularies. */

/* The one place the display name lives. UI, title and export all read it. */
export const APP_NAME = 'Budget HP';

/* Stable storage id, deliberately independent of APP_NAME. */
export const STORAGE_KEY = 'budget-hp.v1';

/* A perfect month is worth one level step. */
export const XP_MONTH_CAP = 100;

export const CATEGORIES = [
  ['food', 'Food'],
  ['transport', 'Transport'],
  ['shopping', 'Shopping'],
  ['fun', 'Fun'],
  ['bills', 'Bills'],
  ['other', 'Other']
];

export const CAT_LABEL = Object.fromEntries(CATEGORIES);

export const TAGS = [
  ['worth', 'Worth it'],
  ['neutral', 'Meh'],
  ['regret', 'Regret']
];

export const TAG_LABEL = Object.fromEntries(TAGS);

/* Fixed per-category pigments. Identity only: status still uses amber and rust. */
export const CAT_COLORS = {
  food: '#A8B98D',
  transport: '#83A9BE',
  shopping: '#C98E7E',
  fun: '#B79BC6',
  bills: '#CFB06B',
  other: '#9DA096'
};
