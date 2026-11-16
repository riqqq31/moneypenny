/* Budget HP — Indonesian rupiah formatting and amount parsing. */

const nf = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });

export function fmt(n) {
  return nf.format(Math.round(n));
}

export function slug(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function fmtShort(n) {
  const a = Math.abs(n);
  if (a >= 1000000) {
    return (n / 1000000).toFixed(1).replace('.0', '').replace('.', ',') + 'M';
  }
  if (a >= 1000) return Math.round(n / 1000) + 'K';
  return String(Math.round(n));
}

export function digits(v) {
  return String(v == null ? '' : v).replace(/\D/g, '');
}

export function toAmount(v) {
  const d = digits(v);
  return d ? parseInt(d, 10) : 0;
}

/* Groups a typed amount as it is entered, keeping the caret on the same
   digit so the field reads like the price board: 25000 -> 25.000. */
export function formatAmountInput(input) {
  const caret = input.selectionStart == null ? input.value.length : input.selectionStart;
  let before = 0;
  for (let i = 0; i < caret && i < input.value.length; i++) {
    if (input.value.charAt(i) >= '0' && input.value.charAt(i) <= '9') before++;
  }
  const d = digits(input.value);
  const out = d ? nf.format(parseInt(d, 10)) : '';
  if (out === input.value) return;
  input.value = out;

  let pos = 0;
  let seen = 0;
  while (pos < out.length && seen < before) {
    const ch = out.charAt(pos);
    if (ch >= '0' && ch <= '9') seen++;
    pos++;
  }
  try {
    input.setSelectionRange(pos, pos);
  } catch {
    /* no selection support */
  }
}
