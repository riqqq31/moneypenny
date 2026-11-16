/* Budget HP — the board page: life bar, today's lines, insights, budget. */

import { bindBudgetForm, renderBudget } from '../components/budget.js';
import { bindDataActions } from '../components/data.js';
import { fitHp, renderHP } from '../components/hp.js';
import { renderInsights } from '../components/insights.js';
import { renderBoardToday, renderToday } from '../components/lines.js';
import { createWeekRail } from '../components/week.js';
import { todayKey } from '../core/date.js';
import { fmt } from '../core/format.js';
import { db } from '../core/store.js';
import { $, announce, motion } from '../ui/dom.js';
import { boot, onVisible } from '../ui/boot.js';
import { href, query, queryDay, setQuery } from '../ui/url.js';

boot({ page: 'board' });

const rail = createWeekRail({
  selectedDay: queryDay() || todayKey(),
  onChange: () => renderToday({ lastAddedId: null, onEdit })
});

/* The "added" flag survives the page navigation, then is consumed. */
let lastAddedId = query('added') || null;
let flash = query('deleted') ? 'Purchase deleted' : '';

function onEdit(id) {
  window.location.href = href('add.html', { id });
}

function refresh() {
  renderHP();
  renderBoardToday();
  renderToday({ lastAddedId, onEdit });
  renderInsights();
  renderBudget();
  rail.render();
}

function focusBudget() {
  const block = $('budget-block');
  if (!block) return;
  block.scrollIntoView({ behavior: motion(), block: 'center' });
  $('budget-form').budget.focus({ preventScroll: true });
}

refresh();

const deleted = query('deleted');
if (deleted) flash = 'Purchase deleted';
if (lastAddedId) {
  const tx = db.transactions.find((t) => t.id === lastAddedId);
  if (tx) flash = 'Purchase added, ' + fmt(tx.amount) + ' rupiah';
}
if (lastAddedId || deleted) setQuery({ added: null, deleted: null });
lastAddedId = null;
if (flash) announce(flash);

bindBudgetForm({ afterSave: refresh });
bindDataActions({ refresh });

const footBudget = $('foot-budget');
if (footBudget) {
  footBudget.addEventListener('click', (e) => {
    e.preventDefault();
    focusBudget();
  });
}
if (window.location.hash === '#budget') focusBudget();

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    fitHp($('hp-num'));
    renderInsights();
  }, 120);
});

onVisible(refresh);
