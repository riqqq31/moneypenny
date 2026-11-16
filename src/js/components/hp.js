/* Budget HP — the life bar: HP numeral, budget bar, ramp and projection note. */

import {
  dayOfMonth,
  daysInMonth,
  monthKey,
  monthLabel,
  monthName,
  todayKey
} from '../core/date.js';
import { fmt } from '../core/format.js';
import { budgetFor, hpThisMonth, spendInMonth, xpForMonth } from '../core/rules.js';
import { db } from '../core/store.js';
import { $, clear, el } from '../ui/dom.js';

export function renderHP() {
  const today = todayKey();
  const mk = monthKey(today);
  const budget = budgetFor(db, mk);
  const spent = spendInMonth(db, mk);

  const num = $('hp-num');
  const math = $('hp-math');
  const note = $('hp-note');
  const bar = $('bar');
  const fill = $('bar-fill');
  const edge = $('bar-edge');
  const ramp = $('ramp');

  $('hp-date').textContent = monthLabel(mk);

  if (budget === null) {
    paintHp(num, '<small>Rp</small><span>—</span>', { unset: true });
    math.textContent = 'No budget set for ' + monthLabel(mk) + ' yet.';
    $('bar-spent').textContent = spent ? 'spent ' + fmt(spent) : 'nothing spent yet';
    $('bar-budget').textContent = 'no monthly budget';
    $('bar-spent').classList.remove('bad');
    bar.classList.remove('over');
    bar.classList.add('is-unset');
    bar.setAttribute('aria-label', 'Monthly budget bar. No budget set for ' + monthLabel(mk) + '.');
    fill.style.width = '0%';
    edge.style.left = '0%';
    note.innerHTML = 'Set this month’s budget below and the bar fills immediately.';
    buildRamp(ramp, -1, 'no budget');
    return;
  }

  bar.classList.remove('is-unset');

  const hp = hpThisMonth(db, mk);
  const ratio = budget > 0 ? Math.max(0, Math.min(1, hp / budget)) : 0;

  if (hp < 0) {
    paintHp(num, '<small>Rp</small><span>−' + fmt(-hp) + '</span>', { neg: true });
  } else {
    paintHp(num, '<small>Rp</small><span>' + fmt(hp) + '</span>');
  }

  math.innerHTML =
    '<b>' + fmt(budget) + '</b> monthly budget &nbsp;−&nbsp; <s>' + fmt(spent) + '</s> spent';

  $('bar-spent').textContent = hp < 0 ? 'over by ' + fmt(-hp) : 'erased ' + fmt(spent);
  $('bar-budget').textContent = 'budget ' + fmt(budget);

  bar.classList.toggle('over', hp < 0);
  $('bar-spent').classList.toggle('bad', hp < 0);
  fill.style.width = (ratio * 100).toFixed(2) + '%';
  edge.style.left = (ratio * 100).toFixed(2) + '%';

  const zone = hp <= 0 ? -1 : Math.round(ratio * 10);
  const zoneText = hp < 0 ? 'over' : hp === 0 ? 'empty' : 'zone ' + zone + '/10';
  bar.setAttribute(
    'aria-label',
    hp < 0
      ? 'Monthly budget bar, over budget. Over by ' +
          fmt(-hp) +
          ' rupiah against a ' +
          fmt(budget) +
          ' monthly budget.'
      : 'Monthly budget bar, ' +
          (hp === 0 ? 'empty' : 'zone ' + zone + ' of 10') +
          '. ' +
          fmt(hp) +
          ' rupiah left of a ' +
          fmt(budget) +
          ' monthly budget.'
  );

  buildRamp(ramp, zone, zoneText);

  const daysLeft = daysInMonth(mk) - dayOfMonth(today) + 1;
  const pace = hp > 0 ? Math.floor(hp / daysLeft) : 0;
  const potential = xpForMonth(hp, budget);

  if (hp < 0) {
    note.innerHTML =
      '<span class="bad">Over by ' +
      fmt(-hp) +
      '. No XP this month, and the streak ends when ' +
      monthName(mk) +
      ' closes.</span>';
  } else if (hp === 0) {
    note.innerHTML =
      '<span class="bad">The bar is empty. A month that closes at zero banks no XP and ends the streak.</span>';
  } else {
    note.innerHTML =
      '<b>+' +
      potential +
      ' XP</b> if ' +
      monthName(mk) +
      ' closes here. Streak ' +
      db.game.streak +
      ' → ' +
      (db.game.streak + 1) +
      '.<br>Safe to spend <b>' +
      fmt(pace) +
      '</b> per day over the ' +
      daysLeft +
      ' day' +
      (daysLeft === 1 ? '' : 's') +
      ' left.';
  }
}

/* #hp-num is a live region: repaint only when the value or state really changes,
   so tagging and day selection do not re-announce the HP total. */
function paintHp(num, html, opts = {}) {
  num.classList.toggle('neg', !!opts.neg);
  num.classList.toggle('unset', !!opts.unset);
  const key =
    html.replace(/<[^>]*>/g, '') + (opts.neg ? '|neg' : '') + (opts.unset ? '|unset' : '');
  if (num.dataset.painted !== key) {
    num.dataset.painted = key;
    num.innerHTML = html;
  }
  fitHp(num);
}

/* The numeral is nowrap. If the formatted value plus its Rp prefix would
   overflow the column, scale it down through --hp-size instead of shrinking
   every HP numeral. */
export function fitHp(num) {
  if (!num || !num.clientWidth) return;
  num.style.removeProperty('--hp-size');
  const text = num.querySelector('span');
  if (!text) return;
  let width = text.getBoundingClientRect().width;
  const small = num.querySelector('small');
  if (small) {
    width +=
      small.getBoundingClientRect().width +
      (parseFloat(window.getComputedStyle(small).marginRight) || 0);
  }
  const avail = num.clientWidth;
  if (width <= avail) return;
  const size = parseFloat(window.getComputedStyle(num).fontSize);
  const next = Math.max(24, Math.floor((size * (avail - 2)) / width));
  num.style.setProperty('--hp-size', next + 'px');
}

function buildRamp(host, lit, label) {
  clear(host);
  for (let i = 0; i < 11; i++) {
    const b = el('i');
    if (i === lit) b.className = 'on';
    host.appendChild(b);
  }
  host.appendChild(el('span', null, label));
}
