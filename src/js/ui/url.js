/* Budget HP — URLs are the only cross-page state. Each page reads its query
   string, and transient UI flags are removed once they have been consumed. */

import { isDateKey } from '../core/date.js';

export function query(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/* Returns a valid `YYYY-MM-DD` from the query string, or null. */
export function queryDay(name = 'day') {
  const value = query(name);
  return isDateKey(value) ? value : null;
}

export function href(page, params = {}) {
  const search = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    const value = params[key];
    if (value !== null && value !== undefined && value !== '') search.set(key, value);
  });
  const qs = search.toString();
  return qs ? `${page}?${qs}` : page;
}

export function go(target) {
  window.location.href = target;
}

/* Rewrites the address bar without adding a history entry or reloading. */
export function setQuery(params) {
  const url = new URL(window.location.href);
  Object.keys(params).forEach((key) => {
    const value = params[key];
    if (value === null || value === undefined || value === '') url.searchParams.delete(key);
    else url.searchParams.set(key, value);
  });
  window.history.replaceState(null, '', url.toString());
}
