/* Budget HP — category donut plus its labelled legend. */

import { CAT_COLORS, CATEGORIES, CAT_LABEL } from '../../core/config.js';
import { fmt } from '../../core/format.js';
import { clear, el } from '../../ui/dom.js';
import { svgInto } from './svg.js';

/**
 * @param {HTMLElement} host
 * @param {HTMLElement} legend
 * @param {HTMLElement} center
 * @param {ReturnType<import('../insights.js').monthData>} data
 */
export function renderDonut(host, legend, center, data) {
  clear(host);
  clear(legend);

  const rows = CATEGORIES.map((c) => {
    return { cat: c[0], sum: data.byCat[c[0]] || 0 };
  })
    .filter((r) => r.sum > 0)
    .sort((a, b) => b.sum - a.sum);

  const size = 220;
  const c = size / 2;
  const r = 74;
  const width = 24;
  const circumference = 2 * Math.PI * r;

  const svg = svgInto(host, 'svg', {
    viewBox: '0 0 ' + size + ' ' + size,
    width: size,
    height: size,
    'aria-hidden': 'true',
    focusable: 'false'
  });
  const ring = svgInto(svg, 'g', {
    transform: 'rotate(-90 ' + c + ' ' + c + ')'
  });
  svgInto(ring, 'circle', {
    cx: c,
    cy: c,
    r,
    fill: 'none',
    stroke: 'rgba(242,240,230,.10)',
    'stroke-width': width
  });

  let offset = 0;
  rows.forEach((row) => {
    const len = (row.sum / data.total) * circumference;
    svgInto(ring, 'circle', {
      cx: c,
      cy: c,
      r,
      fill: 'none',
      stroke: CAT_COLORS[row.cat] || CAT_COLORS.other,
      'stroke-width': width,
      'stroke-dasharray': Math.max(0.5, len - 2).toFixed(2) + ' ' + circumference.toFixed(2),
      'stroke-dashoffset': (-offset).toFixed(2)
    });
    offset += len;
  });

  center.innerHTML = data.total
    ? '<small>Rp spent</small><b>' + fmt(data.total) + '</b>'
    : '<small>Rp spent</small><b>—</b>';

  rows.forEach((row) => {
    const li = el('li');
    li.appendChild(el('span', 'sw cat-' + row.cat));
    li.appendChild(el('span', 'dl', CAT_LABEL[row.cat]));
    li.appendChild(el('span', 'dv', fmt(row.sum)));
    li.appendChild(el('span', 'dp', Math.round((row.sum / data.total) * 100) + '%'));
    legend.appendChild(li);
  });
}
