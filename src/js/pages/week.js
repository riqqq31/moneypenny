/* Budget HP — the week page: trailing seven days as the whole view. */

import { renderFooterMeta } from '../components/budget.js';
import { bindDataActions } from '../components/data.js';
import { createWeekRail } from '../components/week.js';
import { todayKey } from '../core/date.js';
import { fmt } from '../core/format.js';
import { db } from '../core/store.js';
import { $, announce } from '../ui/dom.js';
import { boot, onVisible } from '../ui/boot.js';
import { href, query, queryDay, setQuery } from '../ui/url.js';

const rail = createWeekRail({
  selectedDay: queryDay() || todayKey(),
  onSelectDay(day) {
    setQuery({ day });
    syncAddLink();
  }
});

boot({ page: 'week', title: 'Last 7 days' });
rail.render();
renderFooterMeta();

function syncAddLink() {
  const add = $('foot-add');
  if (add) add.href = href('add.html', { from: 'week', day: rail.day });
}

syncAddLink();

const added = query('added');
if (added) {
  const tx = db.transactions.find((t) => t.id === added);
  announce(tx ? 'Purchase added, ' + fmt(tx.amount) + ' rupiah' : 'Purchase added');
  setQuery({ added: null });
}

function refresh() {
  rail.render();
  renderFooterMeta();
}

bindDataActions({ refresh });

onVisible(refresh);
