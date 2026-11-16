/* Budget HP — monthly budget form, its meta line, and the footer month stamp. */

import { daysInMonth, monthKey, monthLabel, monthShort, todayKey } from '../core/date.js';
import { fmt, formatAmountInput, toAmount } from '../core/format.js';
import { budgetFor, spendInMonth } from '../core/rules.js';
import { commit, db } from '../core/store.js';
import { $, announce } from '../ui/dom.js';

export function renderFooterMeta() {
  const host = $('foot-meta');
  if (!host) return;
  const mk = monthKey(todayKey());
  host.textContent = monthShort(mk) + ' ' + mk.slice(0, 4) + ' · ' + daysInMonth(mk) + ' DAYS';
}

export function renderBudget() {
  const mk = monthKey(todayKey());
  const b = budgetFor(db, mk);

  const month = $('budget-month');
  if (month) month.textContent = monthLabel(mk);

  renderFooterMeta();

  /* The field shows the budget that is actually set, grouped like every other
     amount on the board. It is left alone while focused so a render cannot
     overwrite a half-typed number. */
  const form = $('budget-form');
  if (form && document.activeElement !== form.budget) {
    form.budget.value = b === null ? '' : fmt(b);
  }

  const meta = $('budget-meta');
  if (!meta) return;

  if (b === null) {
    meta.textContent = 'No budget for ' + monthLabel(mk) + '. Nothing earns XP until it is set.';
    return;
  }

  const spent = spendInMonth(db, mk);
  const left = b - spent;
  meta.innerHTML =
    '<b>' +
    fmt(spent) +
    '</b> spent · ' +
    fmt(b) +
    ' budget · ' +
    (left < 0 ? '<span class="bad">' + fmt(-left) + ' over</span>' : fmt(left) + ' left');
}

/**
 * @param {{ afterSave?: () => void }} [options]
 */
export function bindBudgetForm({ afterSave } = {}) {
  const form = $('budget-form');
  if (!form) return;

  const err = $('budget-error');

  form.budget.addEventListener('input', () => {
    formatAmountInput(form.budget);
    form.budget.removeAttribute('aria-invalid');
    err.textContent = '';
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = toAmount(form.budget.value);
    if (!v) {
      err.textContent = 'Enter a budget greater than zero.';
      form.budget.setAttribute('aria-invalid', 'true');
      form.budget.focus();
      return;
    }

    err.textContent = '';
    form.budget.removeAttribute('aria-invalid');
    const today = todayKey();
    const mk = monthKey(today);
    db.settings.budgets[mk] = v;
    if (!db.settings.startDate || db.settings.startDate > today) {
      db.settings.startDate = today;
    }
    commit();
    announce('Monthly budget set to ' + fmt(v) + ' rupiah');
    if (afterSave) afterSave();
  });
}
