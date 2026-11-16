/* Budget HP — small DOM helpers shared by every view. */

export function $(id) {
  return document.getElementById(id);
}

export function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined && text !== null) n.textContent = text;
  return n;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export function announce(msg) {
  const status = $('status');
  if (status) status.textContent = msg;
}

/* Explicit JS scrolls ignore the CSS reduced-motion rule, so ask here. */
export function motion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth';
}
