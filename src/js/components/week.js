/* Budget HP — the trailing seven days: strip, selected day, regret panel.
   Desktop shows this rail beside the board and the entry form; the week page
   shows the same rail as its whole content. */

import { CAT_LABEL, TAGS } from '../core/config.js';
import { addDays, dayLabel, monthKey, todayKey, weekdayShort } from '../core/date.js';
import { fmt, fmtShort } from '../core/format.js';
import { dailyBudget, spendOn } from '../core/rules.js';
import { commit, db } from '../core/store.js';
import { $, announce, clear, el, motion } from '../ui/dom.js';
import { txTodaySort } from './lines.js';

/**
 * @param {{
 *   selectedDay: string,
 *   onSelectDay?: (day: string) => void,
 *   onChange?: () => void
 * }} options
 */
export function createWeekRail({ selectedDay, onSelectDay, onChange }) {
  let day = selectedDay;

  function render() {
    renderStrip();
    renderDay();
    renderRegret();
  }

  function select(k) {
    day = k;
    render();
    if (onSelectDay) onSelectDay(k);
    scrollToDay();
  }

  function renderStrip() {
    const strip = $('strip');
    if (!strip) return;

    const today = todayKey();
    const days = [];
    for (let i = 6; i >= 0; i--) days.push(addDays(today, -i));
    if (!days.includes(day)) day = today;

    const active = document.activeElement;
    const focusDay =
      active && strip.contains(active) && active.dataset.day ? active.dataset.day : null;
    clear(strip);

    days.forEach((k) => {
      const budget = dailyBudget(db, monthKey(k));
      const spent = spendOn(db, k);
      const over = budget !== null && spent > budget;

      const b = el('button');
      b.type = 'button';
      b.dataset.day = k;
      b.setAttribute('aria-pressed', k === day ? 'true' : 'false');
      let label = dayLabel(k) + ', spent ' + (spent ? fmt(spent) : 'nothing');
      if (k === today) label += ', today';
      if (budget === null) label += ', no budget for this month';
      else if (over) label += ', over budget';
      b.setAttribute('aria-label', label);
      if (over) b.className = 'is-over';
      if (k === today) b.className += ' is-today';
      if (!budget) b.title = 'No budget for this month';

      b.appendChild(el('span', 's-d', weekdayShort(k)));
      b.appendChild(el('span', 's-v', spent ? fmtShort(spent) : '—'));
      b.addEventListener('click', () => select(k));
      strip.appendChild(b);
    });

    if (focusDay) {
      const next = strip.querySelector('button[data-day="' + focusDay + '"]');
      if (next) next.focus({ preventScroll: true });
    }
  }

  function renderDay() {
    const host = $('day');
    if (!host) return;
    clear(host);

    const k = day;
    const budget = dailyBudget(db, monthKey(k));
    const spent = spendOn(db, k);
    const txs = db.transactions.filter((t) => t.date === k).sort(txTodaySort);

    const head = el('div', 'day-head');
    head.appendChild(el('span', 'd-date', dayLabel(k)));

    const stateLabel =
      budget === null ? 'no budget' : spent > budget ? 'over' : spent === 0 ? 'untouched' : 'under';
    const chip = el('span', 'd-state' + (spent > budget ? ' over' : ''), stateLabel);
    head.appendChild(chip);

    const total = el('span', 'd-total' + (spent > budget ? ' over' : ''), spent ? fmt(spent) : '—');
    head.appendChild(total);
    host.appendChild(head);

    if (!txs.length) {
      host.appendChild(el('p', 'empty', 'Nothing recorded on this day.'));
      return;
    }

    txs.forEach((t) => {
      const item = el('div', 'item' + (t.regretTag === 'regret' ? ' is-regret' : ''));

      const top = el('div', 'item-top');
      top.appendChild(el('span', 'item-cat', CAT_LABEL[t.category]));
      top.appendChild(el('span', 'item-note', t.note || '—'));
      top.appendChild(el('span', 'item-amt', fmt(t.amount)));
      item.appendChild(top);

      const tags = el('div', 'i-tags');
      tags.setAttribute('role', 'group');
      tags.setAttribute('aria-label', 'Regret tag for ' + (t.note || CAT_LABEL[t.category]));

      TAGS.forEach((tag) => {
        const btn = el('button', 'tag-btn', tag[1]);
        btn.type = 'button';
        btn.dataset.tag = tag[0];
        btn.dataset.tagId = t.id;
        btn.setAttribute('aria-pressed', t.regretTag === tag[0] ? 'true' : 'false');
        btn.addEventListener('click', () => setTag(t.id, tag[0]));
        tags.appendChild(btn);
      });

      item.appendChild(tags);
      host.appendChild(item);
    });
  }

  function setTag(id, tag) {
    const tx = db.transactions.find((t) => t.id === id);
    if (!tx) return;

    const active = document.activeElement;
    const restore =
      active && active.classList && active.classList.contains('tag-btn')
        ? { id: active.dataset.tagId, tag: active.dataset.tag }
        : null;

    tx.regretTag = tx.regretTag === tag ? null : tag;
    commit();
    render();

    if (restore) {
      const next = document.querySelector(
        '.tag-btn[data-tag-id="' + restore.id + '"][data-tag="' + restore.tag + '"]'
      );
      if (next) next.focus({ preventScroll: true });
    }

    announce(tx.regretTag ? 'Tagged ' + tx.regretTag : 'Tag removed');
    if (onChange) onChange();
  }

  function renderRegret() {
    const host = $('regret');
    if (!host) return;
    clear(host);

    const today = todayKey();
    const from = addDays(today, -6);
    const txs = db.transactions.filter((t) => t.date >= from && t.date <= today);
    const regrets = txs.filter((t) => t.regretTag === 'regret');
    const untagged = txs.filter((t) => !t.regretTag).length;
    const total = txs.reduce((s, t) => s + t.amount, 0);

    host.appendChild(el('h2', null, 'Regret · last 7 days'));

    if (!txs.length) {
      host.appendChild(el('p', 'empty', 'Nothing recorded in the last 7 days.'));
      return;
    }

    const pct = Math.round((regrets.length / txs.length) * 100);

    const top = el('div', 'regret-top');
    top.appendChild(el('div', 'regret-num', pct + '%'));

    const cap = el('div', 'regret-cap');
    cap.innerHTML = '<b>' + regrets.length + ' of ' + txs.length + '</b> purchases you’d take back';
    top.appendChild(cap);
    host.appendChild(top);

    const byCat = {};
    regrets.forEach((t) => {
      byCat[t.category] = (byCat[t.category] || 0) + t.amount;
    });
    const ranked = Object.keys(byCat)
      .map((c) => {
        return { cat: c, sum: byCat[c] };
      })
      .sort((a, b) => b.sum - a.sum)
      .slice(0, 3);

    if (ranked.length) {
      const ramp = el('div', 'ramp-cats');
      const sizes = ['30px', '23px', '18px'];
      ranked.forEach((r, i) => {
        const row = el('div', 'rc');
        const amt = el('b', null, fmt(r.sum));
        amt.style.setProperty('--sz', sizes[i]);
        row.appendChild(amt);
        row.appendChild(el('span', null, CAT_LABEL[r.cat]));
        ramp.appendChild(row);
      });
      host.appendChild(ramp);
    }

    const fine = el('p', 'fine');
    fine.innerHTML =
      fmt(total) +
      ' spent across ' +
      txs.length +
      ' purchases · ' +
      (untagged ? untagged + ' still untagged' : 'every purchase tagged');
    host.appendChild(fine);
  }

  return {
    render,
    select,
    get day() {
      return day;
    }
  };
}

/* The strip is the only place that scrolls: on phones the day panel follows. */
export function scrollToDay() {
  const host = $('day');
  if (!host) return;
  if (window.matchMedia('(max-width:1023px)').matches) {
    host.scrollIntoView({ behavior: motion(), block: 'start' });
  }
}
