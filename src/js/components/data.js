/* Budget HP — export/import. The file is the only backup and the only way to
   move devices; everything else stays in this browser's localStorage. */

import { APP_NAME } from '../core/config.js';
import { todayKey } from '../core/date.js';
import { slug } from '../core/format.js';
import { normalize } from '../core/storage.js';
import { db, replace } from '../core/store.js';
import { $, announce } from '../ui/dom.js';

export function exportJSON() {
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = slug(APP_NAME) + '-' + todayKey() + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  announce('Exported JSON');
}

/**
 * @param {{ refresh: () => void }} options
 */
export function bindDataActions({ refresh }) {
  const exportBtn = $('export-btn');
  const footExport = $('foot-export');
  const importBtn = $('import-btn');
  const importFile = $('import-file');

  if (exportBtn) exportBtn.addEventListener('click', exportJSON);
  if (footExport) footExport.addEventListener('click', exportJSON);
  if (!importBtn || !importFile) return;

  importBtn.addEventListener('click', () => importFile.click());

  importFile.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const next = normalize(JSON.parse(String(reader.result)));
        const ok = window.confirm('Replace everything in this browser with the imported file?');
        if (!ok) return;
        replace(next);
        announce('Import complete');
        refresh();
      } catch {
        window.alert('That file could not be read as a Budget HP backup.');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  });
}
