/* Budget HP — month calendar heat grid, one cell per day. */

import { dayLabel, monthLabel, pad, parseKey, todayKey } from '../../core/date.js';
import { fmt, fmtShort } from '../../core/format.js';
import { clear, el } from '../../ui/dom.js';

function calendarCell(mk, day, data, today) {
  const key = mk + '-' + pad(day);
  const spent = data.byDay[day];
  const future = key > today;
  const isToday = key === today;
  const over = data.allow !== null && spent > data.allow;

  const td = el('td');
  const cls = [];
  if (isToday) {
    cls.push('is-today');
    td.setAttribute('aria-current', 'date');
  }
  if (future) cls.push('is-future');
  if (over) cls.push('is-over');
  if (!spent) cls.push('is-zero');
  if (cls.length) td.className = cls.join(' ');

  const sr = el('span', 'sr-only');
  sr.textContent =
    dayLabel(key) +
    ': ' +
    (future
      ? 'upcoming'
      : spent
        ? 'spent ' + fmt(spent) + (over ? ', over allowance' : '')
        : 'no spending') +
    (isToday ? ', today' : '');
  td.appendChild(sr);

  const number = el('span', 'cal-d', String(day));
  number.setAttribute('aria-hidden', 'true');
  td.appendChild(number);

  if (spent) {
    const amt = el('span', 'cal-amt', fmtShort(spent));
    amt.setAttribute('aria-hidden', 'true');
    td.appendChild(amt);
    if (data.allow !== null) {
      const bar = el('span', 'cal-bar');
      bar.setAttribute('aria-hidden', 'true');
      const fill = el('i');
      fill.style.width = Math.min(100, (spent / data.allow) * 100).toFixed(1) + '%';
      bar.appendChild(fill);
      td.appendChild(bar);
    }
  } else if (!future) {
    const dash = el('span', 'cal-amt', '·');
    dash.setAttribute('aria-hidden', 'true');
    td.appendChild(dash);
  }

  return td;
}

/**
 * @param {HTMLElement} host
 * @param {string} mk
 * @param {ReturnType<import('../insights.js').monthData>} data
 */
export function renderCalendar(host, mk, data) {
  clear(host);

  const table = el('table', 'cal');
  const cap = el('caption', 'sr-only');
  cap.textContent =
    'Spending by date, ' +
    monthLabel(mk) +
    '. ' +
    (data.allow === null
      ? 'No monthly budget, so no daily allowance.'
      : 'Daily allowance ' + fmt(data.allow) + ' rupiah.');
  table.appendChild(cap);

  const thead = el('thead');
  const headRow = el('tr');
  ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].forEach((name) => {
    const th = el('th');
    th.scope = 'col';
    th.setAttribute('aria-label', name);
    const letter = el('span', null, name.slice(0, 1));
    letter.setAttribute('aria-hidden', 'true');
    th.appendChild(letter);
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = el('tbody');
  const today = todayKey();
  const used = (parseKey(mk + '-01').getDay() + 6) % 7;
  let row = el('tr');

  for (let b = 0; b < used; b++) {
    const blank = el('td', 'cal-blank');
    blank.setAttribute('aria-hidden', 'true');
    row.appendChild(blank);
  }

  for (let day = 1; day <= data.days; day++) {
    if (day > 1 && (used + day - 1) % 7 === 0) {
      tbody.appendChild(row);
      row = el('tr');
    }
    row.appendChild(calendarCell(mk, day, data, today));
  }
  tbody.appendChild(row);
  table.appendChild(tbody);
  host.appendChild(table);
}
