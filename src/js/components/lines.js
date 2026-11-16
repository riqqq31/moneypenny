/* Budget HP — today's purchases on the board and its one-line summary. */

import { CAT_LABEL, TAG_LABEL } from '../core/config.js';
import { monthKey, todayKey } from '../core/date.js';
import { fmt } from '../core/format.js';
import { budgetFor } from '../core/rules.js';
import { db } from '../core/store.js';
import { $, clear, el } from '../ui/dom.js';

export function txTodaySort(a, b) {
  return a.createdAt - b.createdAt || (a.id < b.id ? -1 : 1);
}

export function renderBoardToday() {
  const host = $('board-today');
  if (!host) return;
  const today = todayKey();
  const txs = db.transactions.filter((t) => t.date === today);
  if (!txs.length) {
    host.textContent = 'Nothing logged today yet.';
    return;
  }
  const sum = txs.reduce((s, t) => s + t.amount, 0);
  host.innerHTML =
    '<b>' +
    txs.length +
    ' purchase' +
    (txs.length === 1 ? '' : 's') +
    '</b> today · <b>' +
    fmt(sum) +
    '</b>';
}

/**
 * @param {{ lastAddedId?: string | null, onEdit: (id: string) => void }} options
 */
export function renderToday({ lastAddedId = null, onEdit }) {
  const today = todayKey();
  const list = $('today-lines');
  if (!list) return;

  const txs = db.transactions.filter((t) => t.date === today).sort(txTodaySort);

  clear(list);
  $('lines-count').textContent = txs.length
    ? txs.length + (txs.length === 1 ? ' purchase' : ' purchases')
    : '';

  if (!txs.length) {
    const empty = el('li', 'empty');
    empty.innerHTML =
      budgetFor(db, monthKey(today)) === null
        ? 'No purchases yet. <b>Set a monthly budget to fill the bar.</b>'
        : 'No purchases yet. <b>The bar is still whole.</b>';
    list.appendChild(empty);
    return;
  }

  txs.forEach((t) => {
    const li = el(
      'li',
      'line' +
        (t.regretTag === 'regret' ? ' is-regret' : '') +
        (t.id === lastAddedId ? ' is-new' : '')
    );

    li.appendChild(el('span', 'l-cat', CAT_LABEL[t.category]));
    li.appendChild(el('span', 'l-note', t.note));
    li.appendChild(el('span', 'l-lead'));
    li.appendChild(el('span', 'l-amt', fmt(t.amount)));

    if (t.regretTag) {
      li.appendChild(el('span', 'l-tag ' + t.regretTag, TAG_LABEL[t.regretTag]));
    }

    const edit = el('button', 'l-edit', 'edit');
    edit.type = 'button';
    edit.setAttribute('aria-label', 'Edit purchase, ' + fmt(t.amount) + ' rupiah');
    edit.addEventListener('click', () => onEdit(t.id));
    li.appendChild(edit);

    list.appendChild(li);
  });
}
