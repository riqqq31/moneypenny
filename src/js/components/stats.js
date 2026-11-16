/* Budget HP — level, streak and XP in the header. */

import { fmt } from '../core/format.js';
import { levelInfo } from '../core/rules.js';
import { db } from '../core/store.js';
import { $ } from '../ui/dom.js';

export function renderStats() {
  const info = levelInfo(db.game.xp);
  $('stat-level').textContent = info.level;
  $('stat-streak').textContent = db.game.streak;
  $('stat-xp').textContent = fmt(db.game.xp);
  $('stat-next').textContent = '/' + fmt(info.next);
}
