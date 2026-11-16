/* Budget HP — shared page boot: title, app name, nav state, stats, and the
   month-closing tick that every page must run before it renders. */

import { renderStats } from '../components/stats.js';
import { APP_NAME } from '../core/config.js';
import { commit } from '../core/store.js';

/**
 * @param {{ page: 'board' | 'add' | 'week', title?: string }} options
 */
export function boot({ page, title }) {
  document.body.classList.add(`page-${page}`);
  document.title = title ? `${title} — ${APP_NAME}` : `${APP_NAME} — monthly budget as hit points`;

  document.querySelectorAll('[data-app-name]').forEach((node) => {
    node.textContent = APP_NAME;
  });

  const current = document.querySelector(`[data-nav="${page}"]`);
  if (current) current.setAttribute('aria-current', 'page');

  commit();
  renderStats();
}

/* Repaint on returning to a tab: budgets and "today" may have moved on. */
export function onVisible(refresh) {
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refresh();
  });
}
