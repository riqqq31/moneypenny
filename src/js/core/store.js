/* Budget HP — the only mutable application data.
   `db` is a live ES module binding: importers always read the current object,
   and replace() swaps it wholesale after an import. */

import { tick } from './rules.js';
import { load, save } from './storage.js';

export let db = load();

export function persist() {
  save(db);
}

export function commit() {
  tick(db);
  persist();
}

export function replace(next) {
  db = next;
  persist();
}
