/* Budget HP — daily spend line with the daily allowance as a reference. */

import { dayOfMonth, monthLabel } from '../../core/date.js';
import { fmt } from '../../core/format.js';
import { clear } from '../../ui/dom.js';
import { svgInto } from './svg.js';

function lineSummary(mk, data, last) {
  let s =
    'Daily spending in ' +
    monthLabel(mk) +
    ', through day ' +
    last +
    '. ' +
    data.count +
    ' purchase' +
    (data.count === 1 ? '' : 's') +
    ' totalling ' +
    fmt(data.total) +
    ' rupiah.';
  if (data.peakDay) s += ' Highest day ' + data.peakDay + ' at ' + fmt(data.peak) + ' rupiah.';
  if (data.allow !== null) s += ' Daily allowance ' + fmt(data.allow) + ' rupiah.';
  if (data.over) s += ' ' + data.over + ' day' + (data.over === 1 ? '' : 's') + ' over allowance.';
  return s;
}

/**
 * @param {HTMLElement} host
 * @param {string} mk
 * @param {ReturnType<import('../insights.js').monthData>} data
 * @param {string} today
 */
export function renderLine(host, mk, data, today) {
  const W = Math.floor(host.clientWidth || 0);
  if (W < 120) return;
  clear(host);

  const H = W < 460 ? 150 : 196;
  const padL = 4;
  const padR = 4;
  const padT = 14;
  const padB = 20;
  const last = Math.min(dayOfMonth(today), data.days);
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  let scaleTo = 0;
  for (let i = 1; i <= last; i++) if (data.byDay[i] > scaleTo) scaleTo = data.byDay[i];
  if (data.allow !== null) scaleTo = Math.max(scaleTo, data.allow);
  const top = scaleTo > 0 ? scaleTo * 1.15 : 1;

  function x(day) {
    return padL + (last <= 1 ? plotW / 2 : ((day - 1) * plotW) / (last - 1));
  }
  function y(v) {
    return padT + (1 - v / top) * plotH;
  }

  const svg = svgInto(host, 'svg', {
    viewBox: '0 0 ' + W + ' ' + H,
    width: W,
    height: H,
    role: 'img',
    'aria-label': lineSummary(mk, data, last)
  });

  svgInto(svg, 'line', {
    x1: padL,
    y1: y(0),
    x2: W - padR,
    y2: y(0),
    class: 'axis-line'
  });

  if (data.allow !== null && data.allow < top) {
    svgInto(svg, 'line', {
      x1: padL,
      y1: y(data.allow),
      x2: W - padR,
      y2: y(data.allow),
      class: 'allow-line'
    });
  }

  let d = '';
  for (let day = 1; day <= last; day++) {
    d += (day === 1 ? 'M' : 'L') + x(day).toFixed(1) + ' ' + y(data.byDay[day]).toFixed(1);
  }
  if (last > 1) svgInto(svg, 'path', { d, class: 'spend-line' });

  for (let overDay = 1; overDay <= last; overDay++) {
    if (data.allow !== null && data.byDay[overDay] > data.allow) {
      svgInto(svg, 'circle', {
        cx: x(overDay).toFixed(1),
        cy: y(data.byDay[overDay]).toFixed(1),
        r: 3,
        class: 'dot-over'
      });
    }
  }
  svgInto(svg, 'circle', {
    cx: x(last).toFixed(1),
    cy: y(data.byDay[last]).toFixed(1),
    r: 3.6,
    class: 'dot-today'
  });

  const marks = [1, Math.round(last / 2), last].filter((v, idx, arr) => {
    return v >= 1 && v <= last && arr.indexOf(v) === idx;
  });
  marks.forEach((day, idx) => {
    const anchor =
      marks.length === 1
        ? 'middle'
        : idx === 0
          ? 'start'
          : idx === marks.length - 1
            ? 'end'
            : 'middle';
    const t = svgInto(svg, 'text', {
      x: x(day).toFixed(1),
      y: H - 5,
      'text-anchor': anchor
    });
    t.textContent = day;
  });
}
