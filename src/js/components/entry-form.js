/* Budget HP — purchase form: add, edit and delete, plus the live "after this"
   projection. Only the add page mounts this component. */

import { CATEGORIES } from '../core/config.js';
import { dayLabel, monthKey, monthLabel, todayKey } from '../core/date.js';
import { fmt, formatAmountInput, toAmount } from '../core/format.js';
import { uid } from '../core/id.js';
import { budgetFor, spendInMonth } from '../core/rules.js';
import { commit, db } from '../core/store.js';
import { $, announce } from '../ui/dom.js';

function categoryInputs(form) {
  return form.querySelectorAll('input[name="category"]');
}

function setCategory(form, value) {
  const inputs = categoryInputs(form);
  for (let i = 0; i < inputs.length; i++) inputs[i].checked = inputs[i].value === value;
}

function getCategory(form) {
  const inputs = categoryInputs(form);
  for (let i = 0; i < inputs.length; i++) if (inputs[i].checked) return inputs[i].value;
  return CATEGORIES[0][0];
}

/**
 * @param {{ onFinish: (result: { action: 'saved' | 'deleted' | 'cancelled', id?: string, date?: string }) => void }} options
 */
export function createEntryForm({ onFinish }) {
  const form = $('entry');
  if (!form) return null;

  let editingId = null;
  let lastProjection = null;

  buildChips();
  bindEvents();

  function buildChips() {
    const chips = $('cat-chips');
    CATEGORIES.forEach((c, i) => {
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'category';
      input.value = c[0];
      input.id = 'cat-' + c[0];
      if (i === 0) input.setAttribute('checked', 'checked');

      const label = document.createElement('label');
      label.textContent = c[1];
      label.setAttribute('for', input.id);

      chips.appendChild(input);
      chips.appendChild(label);
    });
  }

  function bindEvents() {
    form.amount.addEventListener('input', () => {
      formatAmountInput(form.amount);
      form.amount.removeAttribute('aria-invalid');
      renderAfter();
    });
    form.amount.addEventListener('blur', announceProjection);

    form.date.addEventListener('change', () => {
      form.date.removeAttribute('aria-invalid');
      renderAfter();
    });
    form.date.addEventListener('blur', announceProjection);

    form.addEventListener('submit', submit);
    $('entry-cancel').addEventListener('click', cancel);
    $('entry-delete').addEventListener('click', remove);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') cancel();
    });
  }

  function submit(e) {
    e.preventDefault();

    const err = $('entry-error');
    const amount = toAmount(form.amount.value);
    const date = form.date.value || todayKey();
    const note = String(form.note.value || '')
      .trim()
      .slice(0, 80);

    if (!amount) {
      err.textContent = 'Enter an amount greater than zero.';
      form.amount.setAttribute('aria-invalid', 'true');
      form.amount.focus();
      return;
    }
    if (date > todayKey()) {
      err.textContent = 'A purchase can’t be dated in the future.';
      form.date.setAttribute('aria-invalid', 'true');
      form.date.focus();
      return;
    }

    err.textContent = '';
    form.amount.removeAttribute('aria-invalid');
    form.date.removeAttribute('aria-invalid');

    let id = editingId;
    if (editingId) {
      const tx = db.transactions.find((t) => t.id === editingId);
      if (tx) {
        tx.amount = amount;
        tx.category = getCategory(form);
        tx.note = note;
        tx.date = date;
      }
      announce('Purchase updated');
    } else {
      id = uid();
      db.transactions.push({
        id,
        amount,
        category: getCategory(form),
        note,
        date,
        regretTag: null,
        createdAt: Date.now()
      });
      announce('Purchase added, ' + fmt(amount) + ' rupiah');
    }

    commit();
    onFinish({ action: 'saved', id, date });
  }

  function cancel() {
    const wasEditing = !!editingId;
    reset();
    if (wasEditing) announce('Edit cancelled');
    onFinish({ action: 'cancelled' });
  }

  function remove() {
    if (!editingId) return;
    if (!window.confirm('Delete this purchase? This cannot be undone.')) return;
    db.transactions = db.transactions.filter((t) => t.id !== editingId);
    reset();
    commit();
    announce('Purchase deleted');
    onFinish({ action: 'deleted' });
  }

  function reset() {
    editingId = null;
    lastProjection = null;
    form.reset();
    setCategory(form, CATEGORIES[0][0]);
    form.date.value = todayKey();
    form.date.max = todayKey();
    form.classList.remove('is-editing');
    form.amount.removeAttribute('aria-invalid');

    $('entry-h').textContent = 'Add a purchase';
    $('entry-submit').textContent = 'Add purchase';
    $('entry-cancel').hidden = true;
    $('entry-delete').hidden = true;
    $('entry-error').textContent = '';
    renderAfter();
  }

  function edit(id) {
    const tx = db.transactions.find((t) => t.id === id);
    if (!tx) return false;

    editingId = id;
    lastProjection = null;

    form.amount.value = fmt(tx.amount);
    setCategory(form, tx.category);
    form.note.value = tx.note;
    form.date.value = tx.date;
    form.classList.add('is-editing');

    $('entry-h').textContent = 'Edit purchase · ' + dayLabel(tx.date);
    $('entry-submit').textContent = 'Save changes';
    $('entry-cancel').hidden = false;
    $('entry-delete').hidden = false;
    $('entry-error').textContent = '';
    form.amount.removeAttribute('aria-invalid');
    renderAfter();
    return true;
  }

  function renderAfter() {
    const host = $('entry-after');
    if (!host) return;

    host.classList.remove('over');
    const amount = toAmount(form.amount.value);
    const mk = monthKey(form.date.value || todayKey());
    const budget = budgetFor(db, mk);

    if (budget === null) {
      host.textContent = amount
        ? 'No budget for ' + monthLabel(mk) + ', so HP cannot be projected.'
        : '';
      return;
    }
    if (!amount) {
      host.textContent = '';
      return;
    }

    let spent = spendInMonth(db, mk);
    if (editingId) {
      const tx = db.transactions.find((t) => t.id === editingId);
      if (tx && monthKey(tx.date) === mk) spent -= tx.amount;
    }
    const after = budget - spent - amount;
    if (after < 0) {
      host.classList.add('over');
      host.textContent = 'After this: ' + fmt(-after) + ' over budget.';
    } else if (after === 0) {
      host.textContent = 'After this: HP 0, the bar is empty.';
    } else {
      host.textContent = 'After this: HP ' + fmt(after) + ', still under budget.';
    }
  }

  /* Read the projection on blur rather than on every keystroke. */
  function announceProjection() {
    const after = $('entry-after');
    const text = (after.textContent || '').trim();
    if (!text || text === lastProjection) return;
    lastProjection = text;
    announce(text);
  }

  return {
    reset,
    edit,
    renderAfter,
    get editingId() {
      return editingId;
    }
  };
}
