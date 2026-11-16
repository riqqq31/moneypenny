import assert from 'node:assert/strict';
import { test } from 'node:test';

import { digits, fmt, fmtShort, formatAmountInput, slug, toAmount } from '../src/js/core/format.js';

test('fmt groups rupiah with Indonesian separators', () => {
  assert.equal(fmt(25000), '25.000');
  assert.equal(fmt(3100000), '3.100.000');
  assert.equal(fmt(0), '0');
  assert.equal(fmt(24999.6), '25.000');
});

test('fmtShort abbreviates thousands and millions', () => {
  assert.equal(fmtShort(950), '950');
  assert.equal(fmtShort(25000), '25K');
  assert.equal(fmtShort(1250000), '1,3M');
  assert.equal(fmtShort(-25000), '-25K');
});

test('toAmount accepts grouped input and rejects non-digits', () => {
  assert.equal(toAmount('25.000'), 25000);
  assert.equal(toAmount('Rp 1.250.000'), 1250000);
  assert.equal(toAmount(''), 0);
  assert.equal(toAmount(null), 0);
  assert.equal(digits('a1b2c3'), '123');
});

test('slug produces a file-name safe app id', () => {
  assert.equal(slug('Budget HP'), 'budget-hp');
});

test('formatAmountInput regroups and keeps the caret on the same digit', () => {
  const input = {
    value: '25000',
    selectionStart: 5,
    setSelectionRange(start, end) {
      this.selectionStart = start;
      this.selectionEnd = end;
    }
  };

  formatAmountInput(input);

  assert.equal(input.value, '25.000');
  assert.equal(input.selectionStart, 6);
});
