/* Budget HP — calendar keys are local `YYYY-MM-DD` strings, never Date objects. */

export function pad(n) {
  return n < 10 ? '0' + n : '' + n;
}

export function dateKey(d) {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

export function todayKey() {
  return dateKey(new Date());
}

export function parseKey(k) {
  const p = k.split('-');
  return new Date(+p[0], +p[1] - 1, +p[2]);
}

export function addDays(k, n) {
  const d = parseKey(k);
  d.setDate(d.getDate() + n);
  return dateKey(d);
}

export function monthKey(k) {
  return k.slice(0, 7);
}

export function dayOfMonth(k) {
  return +k.slice(8, 10);
}

export function shiftMonth(mk, n) {
  const p = mk.split('-');
  let m = +p[1] - 1 + n;
  const y = +p[0] + Math.floor(m / 12);
  m = ((m % 12) + 12) % 12;
  return y + '-' + pad(m + 1);
}

export function daysInMonth(mk) {
  const p = mk.split('-');
  return new Date(+p[0], +p[1], 0).getDate();
}

export function monthName(mk) {
  const p = mk.split('-');
  return new Date(+p[0], +p[1] - 1, 1).toLocaleDateString('en-GB', { month: 'long' });
}

export function monthLabel(mk) {
  const p = mk.split('-');
  return new Date(+p[0], +p[1] - 1, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric'
  });
}

export function monthShort(mk) {
  const p = mk.split('-');
  return new Date(+p[0], +p[1] - 1, 1)
    .toLocaleDateString('en-GB', { month: 'short' })
    .toUpperCase();
}

export function dayLabel(k) {
  const d = parseKey(k);
  return (
    d.toLocaleDateString('en-GB', { weekday: 'short' }) +
    ' ' +
    d.getDate() +
    ' ' +
    d.toLocaleDateString('en-GB', { month: 'short' })
  );
}

export function weekdayShort(k) {
  return parseKey(k)
    .toLocaleDateString('en-GB', { weekday: 'short' })
    .replace('.', '')
    .toUpperCase();
}

export function isDateKey(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}
