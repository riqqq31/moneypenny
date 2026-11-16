/* Budget HP — this-month insights: one pass over the month, three charts. */

import { CATEGORIES } from '../core/config.js';
import {
  dayOfMonth,
  daysInMonth,
  monthKey,
  monthLabel,
  monthName,
  todayKey
} from '../core/date.js';
import { fmt, fmtShort } from '../core/format.js';
import { dailyBudget } from '../core/rules.js';
import { db } from '../core/store.js';
import { $ } from '../ui/dom.js';
import { renderCalendar } from './charts/calendar.js';
import { renderDonut } from './charts/donut.js';
import { renderLine } from './charts/line.js';

/* One pass over the month: per-day totals, per-category totals, peaks. */
export function monthData(ledger, mk) {
  const n = daysInMonth(mk);
  const byDay = [];
  for (let i = 0; i <= n; i++) byDay[i] = 0;
  const byCat = {};
  CATEGORIES.forEach((c) => {
    byCat[c[0]] = 0;
  });

  let count = 0;
  ledger.transactions.forEach((t) => {
    if (monthKey(t.date) !== mk) return;
    byDay[dayOfMonth(t.date)] += t.amount;
    byCat[t.category] = (byCat[t.category] || 0) + t.amount;
    count++;
  });

  let total = 0;
  let peak = 0;
  let peakDay = 0;
  for (let d = 1; d <= n; d++) {
    total += byDay[d];
    if (byDay[d] > peak) {
      peak = byDay[d];
      peakDay = d;
    }
  }

  const allow = dailyBudget(ledger, mk);
  let over = 0;
  if (allow !== null) {
    for (let o = 1; o <= n; o++) if (byDay[o] > allow) over++;
  }

  return {
    days: n,
    byDay,
    byCat,
    count,
    total,
    peak,
    peakDay,
    allow,
    over
  };
}

export function renderInsights() {
  const lineHost = $('chart-line');
  if (!lineHost) return;

  const today = todayKey();
  const mk = monthKey(today);
  const data = monthData(db, mk);
  const charts = $('charts');
  const empty = $('insights-empty');
  const note = $('insights-note');

  $('insights-month').textContent = monthLabel(mk);

  if (!data.total) {
    charts.hidden = true;
    empty.hidden = false;
    note.innerHTML = '';
    empty.innerHTML =
      data.allow === null
        ? 'Nothing spent in ' +
          monthLabel(mk) +
          ' yet. <b>Set a budget</b> and add purchases to fill these charts.'
        : 'Nothing spent in ' +
          monthLabel(mk) +
          ' yet. <b>Add a purchase</b> and the charts fill in.';
    return;
  }

  charts.hidden = false;
  empty.hidden = true;

  const bits = [
    '<b>' + data.count + '</b> purchase' + (data.count === 1 ? '' : 's'),
    '<b>' + fmt(data.total) + '</b> spent'
  ];
  if (data.peakDay) {
    bits.push('peak <b>' + fmt(data.peak) + '</b> on ' + data.peakDay + ' ' + monthName(mk));
  }
  if (data.over) {
    bits.push(
      '<span class="bad">' +
        data.over +
        ' day' +
        (data.over === 1 ? '' : 's') +
        ' over allowance</span>'
    );
  }
  if (data.allow === null) bits.push('no budget, so no allowance');
  note.innerHTML = bits.join(' · ');

  const allowKey = $('line-allow');
  allowKey.hidden = data.allow === null;
  if (data.allow !== null) allowKey.textContent = 'allowance ' + fmtShort(data.allow);

  renderLine(lineHost, mk, data, today);
  renderDonut($('chart-donut'), $('donut-legend'), $('donut-center'), data);
  renderCalendar($('chart-calendar'), mk, data);
}
