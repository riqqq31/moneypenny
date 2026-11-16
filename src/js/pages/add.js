/* Budget HP — the add page: one focused form, with the week rail on desktop. */

import { createEntryForm } from '../components/entry-form.js';
import { createWeekRail } from '../components/week.js';
import { todayKey } from '../core/date.js';
import { $ } from '../ui/dom.js';
import { boot } from '../ui/boot.js';
import { go, href, query, queryDay } from '../ui/url.js';

const editId = query('id');
const fromWeek = query('from') === 'week';
const returnDay = queryDay() || todayKey();
const backHref = fromWeek ? href('week.html', { day: returnDay }) : 'index.html';

boot({ page: 'add', title: editId ? 'Edit purchase' : 'Add a purchase' });

const back = $('add-back');
if (back) back.href = backHref;

const rail = createWeekRail({ selectedDay: returnDay });
rail.render();

const form = createEntryForm({
  onFinish(result) {
    if (result.action === 'cancelled') {
      go(backHref);
      return;
    }
    if (result.action === 'deleted') {
      go(href('index.html', { deleted: 1 }));
      return;
    }
    if (fromWeek) {
      go(href('week.html', { day: result.date || returnDay, added: result.id }));
      return;
    }
    go(href('index.html', { added: result.id }));
  }
});

const editing = editId ? form.edit(editId) : false;
if (!editing) form.reset();

/* Opening the form from "edit" lands on the amount; a fresh entry lands on the
   heading first, so a screen reader hears the task before the fields. */
if (editing) {
  setTimeout(() => $('entry').amount.focus(), 60);
} else {
  setTimeout(() => $('entry-h').focus({ preventScroll: true }), 0);
}
