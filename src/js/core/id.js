/* Budget HP — transaction ids: sortable by time, unique enough for one device. */

export function uid() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}
