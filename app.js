/* ============================================================
   Budget HP — rules engine + UI
   Storage: localStorage under STORAGE_KEY. No network, no deps.
   ============================================================ */
(function () {
  'use strict';

  /* The one place the display name lives. UI, title and export all read it. */
  var APP_NAME = 'Budget HP';
  /* Stable storage id, deliberately independent of APP_NAME. */
  var STORAGE_KEY = 'budget-hp.v1';

  var XP_MONTH_CAP = 100;       // a perfect month is worth one level step

  var CATEGORIES = [
    ['food', 'Food'], ['transport', 'Transport'], ['shopping', 'Shopping'],
    ['fun', 'Fun'], ['bills', 'Bills'], ['other', 'Other']
  ];
  var CAT_LABEL = CATEGORIES.reduce(function (m, c) { m[c[0]] = c[1]; return m; }, {});

  var TAGS = [['worth', 'Worth it'], ['neutral', 'Meh'], ['regret', 'Regret']];
  var TAG_LABEL = TAGS.reduce(function (m, t) { m[t[0]] = t[1]; return m; }, {});

  /* ---------------- dates ---------------- */

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function dateKey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function todayKey() { return dateKey(new Date()); }
  function parseKey(k) {
    var p = k.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }
  function addDays(k, n) {
    var d = parseKey(k);
    d.setDate(d.getDate() + n);
    return dateKey(d);
  }
  function monthKey(k) { return k.slice(0, 7); }
  function dayOfMonth(k) { return +k.slice(8, 10); }
  function shiftMonth(mk, n) {
    var p = mk.split('-');
    var m = +p[1] - 1 + n;
    var y = +p[0] + Math.floor(m / 12);
    m = ((m % 12) + 12) % 12;
    return y + '-' + pad(m + 1);
  }
  function daysInMonth(mk) {
    var p = mk.split('-');
    return new Date(+p[0], +p[1], 0).getDate();
  }
  function monthName(mk) {
    var p = mk.split('-');
    return new Date(+p[0], +p[1] - 1, 1).toLocaleDateString('en-GB', { month: 'long' });
  }
  function monthLabel(mk) {
    var p = mk.split('-');
    return new Date(+p[0], +p[1] - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  }
  function monthShort(mk) {
    var p = mk.split('-');
    return new Date(+p[0], +p[1] - 1, 1).toLocaleDateString('en-GB', { month: 'short' }).toUpperCase();
  }
  function dayLabel(k) {
    var d = parseKey(k);
    return d.toLocaleDateString('en-GB', { weekday: 'short' }) + ' ' + d.getDate() + ' ' +
      d.toLocaleDateString('en-GB', { month: 'short' });
  }
  function weekdayShort(k) {
    return parseKey(k).toLocaleDateString('en-GB', { weekday: 'short' }).replace('.', '').toUpperCase();
  }

  /* ---------------- numbers ---------------- */

  var nf = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });
  function fmt(n) { return nf.format(Math.round(n)); }
  function slug(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  function fmtShort(n) {
    var a = Math.abs(n);
    if (a >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '').replace('.', ',') + 'M';
    if (a >= 1000) return Math.round(n / 1000) + 'K';
    return String(Math.round(n));
  }
  function digits(v) { return String(v == null ? '' : v).replace(/\D/g, ''); }
  function toAmount(v) { var d = digits(v); return d ? parseInt(d, 10) : 0; }

  /* Groups a typed amount as it is entered, keeping the caret on the same
     digit so the field reads like the price board: 25000 -> 25.000. */
  function formatAmountInput(input) {
    var caret = input.selectionStart == null ? input.value.length : input.selectionStart;
    var before = 0;
    for (var i = 0; i < caret && i < input.value.length; i++) {
      if (input.value.charAt(i) >= '0' && input.value.charAt(i) <= '9') before++;
    }
    var d = digits(input.value);
    var out = d ? nf.format(parseInt(d, 10)) : '';
    if (out === input.value) return;
    input.value = out;

    var pos = 0, seen = 0;
    while (pos < out.length && seen < before) {
      var ch = out.charAt(pos);
      if (ch >= '0' && ch <= '9') seen++;
      pos++;
    }
    try { input.setSelectionRange(pos, pos); } catch (e) { /* no selection support */ }
  }

  function categoryInputs(form) {
    return form.querySelectorAll('input[name="category"]');
  }
  function setCategory(form, value) {
    var inputs = categoryInputs(form);
    for (var i = 0; i < inputs.length; i++) inputs[i].checked = inputs[i].value === value;
  }
  function getCategory(form) {
    var inputs = categoryInputs(form);
    for (var i = 0; i < inputs.length; i++) if (inputs[i].checked) return inputs[i].value;
    return CATEGORIES[0][0];
  }

  /* ---------------- storage ---------------- */

  function fresh() {
    var t = todayKey();
    return {
      version: 1,
      settings: { startDate: t, budgets: {} },
      transactions: [],
      game: {
        xp: 0, streak: 0, longestStreak: 0,
        lastProcessedMonth: shiftMonth(monthKey(t), -1)
      }
    };
  }

  function normalize(raw) {
    var base = fresh();
    if (!raw || typeof raw !== 'object') return base;
    var s = raw.settings || {};
    var g = raw.game || {};
    var budgets = {};
    if (s.budgets && typeof s.budgets === 'object') {
      Object.keys(s.budgets).forEach(function (k) {
        var v = Number(s.budgets[k]);
        if (/^\d{4}-\d{2}$/.test(k) && isFinite(v) && v > 0) budgets[k] = Math.round(v);
      });
    }
    var txs = Array.isArray(raw.transactions) ? raw.transactions.filter(function (t) {
      return t && /^\d{4}-\d{2}-\d{2}$/.test(t.date) && isFinite(Number(t.amount)) && Number(t.amount) > 0;
    }).map(function (t) {
      return {
        id: String(t.id || uid()),
        amount: Math.round(Number(t.amount)),
        category: CAT_LABEL[t.category] ? t.category : 'other',
        note: String(t.note || '').slice(0, 80),
        date: t.date,
        regretTag: (t.regretTag === 'worth' || t.regretTag === 'neutral' || t.regretTag === 'regret') ? t.regretTag : null,
        createdAt: Number(t.createdAt) || 0
      };
    }) : [];

    return {
      version: 1,
      settings: {
        startDate: /^\d{4}-\d{2}-\d{2}$/.test(s.startDate) ? s.startDate : base.settings.startDate,
        budgets: budgets
      },
      transactions: txs,
      game: {
        xp: Math.max(0, Math.round(Number(g.xp) || 0)),
        streak: Math.max(0, Math.round(Number(g.streak) || 0)),
        longestStreak: Math.max(0, Math.round(Number(g.longestStreak) || 0)),
        /* Legacy backups carried day-based fields; a missing month starts the
           monthly loop at the previous month, so old XP is kept untouched. */
        lastProcessedMonth: /^\d{4}-\d{2}$/.test(g.lastProcessedMonth)
          ? g.lastProcessedMonth
          : shiftMonth(monthKey(base.settings.startDate), -1)
      }
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? normalize(JSON.parse(raw)) : fresh();
    } catch (e) {
      return fresh();
    }
  }

  var db = load();

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) { /* private mode: the session still works in memory */ }
  }

  /* ---------------- rules ---------------- */

  function budgetFor(mk) {
    var v = db.settings.budgets[mk];
    return (typeof v === 'number' && v > 0) ? v : null;
  }
  function dailyBudget(mk) {
    var b = budgetFor(mk);
    return b === null ? null : Math.floor(b / daysInMonth(mk));
  }
  function spendOn(k) {
    var s = 0;
    for (var i = 0; i < db.transactions.length; i++) {
      if (db.transactions[i].date === k) s += db.transactions[i].amount;
    }
    return s;
  }
  function spendInMonth(mk) {
    var s = 0;
    for (var i = 0; i < db.transactions.length; i++) {
      if (db.transactions[i].date.slice(0, 7) === mk) s += db.transactions[i].amount;
    }
    return s;
  }
  /* HP is the month's budget minus everything spent in it; it may go negative. */
  function hpThisMonth(mk) {
    var b = budgetFor(mk);
    return b === null ? null : b - spendInMonth(mk);
  }
  /* A month that closes with money left banks a share of the budget as XP. */
  function xpForMonth(leftover, budget) {
    if (leftover <= 0 || budget <= 0) return 0;
    var pct = Math.round((leftover / budget) * 100);
    return Math.max(1, Math.min(XP_MONTH_CAP, pct));
  }
  function levelInfo(xp) {
    var level = Math.max(1, Math.floor((1 + Math.sqrt(1 + 0.08 * xp)) / 2));
    var prev = 50 * (level - 1) * level;
    var next = 50 * level * (level + 1);
    return {
      level: level, prev: prev, next: next,
      pct: next > prev ? Math.min(1, Math.max(0, (xp - prev) / (next - prev))) : 0
    };
  }

  /* Scores every completed month that has a budget and has not been scored yet. */
  function tick() {
    var mk = monthKey(todayKey());
    var g = db.game;
    var cur = shiftMonth(g.lastProcessedMonth, 1);

    var guard = 0;
    while (cur < mk && guard++ < 240) {
      var b = budgetFor(cur);
      if (b !== null) {
        var left = b - spendInMonth(cur);
        if (left > 0) {
          g.xp += xpForMonth(left, b);
          g.streak += 1;
          if (g.streak > g.longestStreak) g.longestStreak = g.streak;
        } else {
          g.streak = 0;
        }
      }
      g.lastProcessedMonth = cur;
      cur = shiftMonth(cur, 1);
    }
  }

  /* ---------------- dom helpers ---------------- */

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }
  function uid() {
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  var state = {
    view: 'board',
    selectedDay: todayKey(),
    editingId: null,
    lastAddedId: null,
    focusOnEnter: false,
    pendingScroll: null,
    lastProjection: null
  };

  /* Explicit JS scrolls ignore the CSS reduced-motion rule, so ask here. */
  function motion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto' : 'smooth';
  }

  /* ---------------- rendering ---------------- */

  function render() {
    tick();
    persist();
    var dateInput = $('entry').date;
    if (dateInput) dateInput.max = todayKey();
    renderStats();
    renderHP();
    renderBoardToday();
    renderToday();
    renderInsights();
    renderWeek();
    renderBudget();
    renderEntryAfter();
    if (state.lastAddedId) state.lastAddedId = null;
  }

  function renderStats() {
    var info = levelInfo(db.game.xp);
    $('stat-level').textContent = info.level;
    $('stat-streak').textContent = db.game.streak;
    $('stat-xp').textContent = fmt(db.game.xp);
    $('stat-next').textContent = '/' + fmt(info.next);
  }

  /* #hp-num is a live region: repaint only when the value or state really changes,
     so tagging and day selection do not re-announce the HP total. */
  function paintHp(num, html, opts) {
    opts = opts || {};
    num.classList.toggle('neg', !!opts.neg);
    num.classList.toggle('unset', !!opts.unset);
    var key = html.replace(/<[^>]*>/g, '') + (opts.neg ? '|neg' : '') + (opts.unset ? '|unset' : '');
    if (num.dataset.painted !== key) {
      num.dataset.painted = key;
      num.innerHTML = html;
    }
    fitHp(num);
  }

  /* The numeral is nowrap. If the formatted value plus its Rp prefix would
     overflow the column, scale it down through --hp-size instead of shrinking
     every HP numeral. */
  function fitHp(num) {
    if (!num || !num.clientWidth) return;
    num.style.removeProperty('--hp-size');
    var text = num.querySelector('span');
    if (!text) return;
    var width = text.getBoundingClientRect().width;
    var small = num.querySelector('small');
    if (small) {
      width += small.getBoundingClientRect().width +
        (parseFloat(window.getComputedStyle(small).marginRight) || 0);
    }
    var avail = num.clientWidth;
    if (width <= avail) return;
    var size = parseFloat(window.getComputedStyle(num).fontSize);
    var next = Math.max(24, Math.floor(size * (avail - 2) / width));
    num.style.setProperty('--hp-size', next + 'px');
  }

  function renderHP() {
    var today = todayKey();
    var mk = monthKey(today);
    var budget = budgetFor(mk);
    var spent = spendInMonth(mk);

    var num = $('hp-num');
    var math = $('hp-math');
    var note = $('hp-note');
    var bar = $('bar');
    var fill = $('bar-fill');
    var edge = $('bar-edge');
    var ramp = $('ramp');

    $('hp-date').textContent = monthLabel(mk);

    if (budget === null) {
      paintHp(num, '<small>Rp</small><span>—</span>', { unset: true });
      math.textContent = 'No budget set for ' + monthLabel(mk) + ' yet.';
      $('bar-spent').textContent = spent ? 'spent ' + fmt(spent) : 'nothing spent yet';
      $('bar-budget').textContent = 'no monthly budget';
      $('bar-spent').classList.remove('bad');
      bar.classList.remove('over');
      bar.classList.add('is-unset');
      bar.setAttribute('aria-label', 'Monthly budget bar. No budget set for ' + monthLabel(mk) + '.');
      fill.style.width = '0%';
      edge.style.left = '0%';
      note.innerHTML = 'Set this month’s budget below and the bar fills immediately.';
      buildRamp(ramp, -1, 'no budget');
      return;
    }

    bar.classList.remove('is-unset');

    var hp = hpThisMonth(mk);
    var ratio = budget > 0 ? Math.max(0, Math.min(1, hp / budget)) : 0;

    if (hp < 0) {
      paintHp(num, '<small>Rp</small><span>−' + fmt(-hp) + '</span>', { neg: true });
    } else {
      paintHp(num, '<small>Rp</small><span>' + fmt(hp) + '</span>');
    }

    math.innerHTML = '<b>' + fmt(budget) + '</b> monthly budget &nbsp;−&nbsp; <s>' +
      fmt(spent) + '</s> spent';

    $('bar-spent').textContent = hp < 0 ? 'over by ' + fmt(-hp) : 'erased ' + fmt(spent);
    $('bar-budget').textContent = 'budget ' + fmt(budget);

    bar.classList.toggle('over', hp < 0);
    $('bar-spent').classList.toggle('bad', hp < 0);
    fill.style.width = (ratio * 100).toFixed(2) + '%';
    edge.style.left = (ratio * 100).toFixed(2) + '%';

    var zone = hp <= 0 ? -1 : Math.round(ratio * 10);
    var zoneText = hp < 0 ? 'over' : (hp === 0 ? 'empty' : 'zone ' + zone + '/10');
    bar.setAttribute('aria-label', hp < 0
      ? 'Monthly budget bar, over budget. Over by ' + fmt(-hp) + ' rupiah against a ' + fmt(budget) + ' monthly budget.'
      : 'Monthly budget bar, ' + (hp === 0 ? 'empty' : 'zone ' + zone + ' of 10') + '. ' +
        fmt(hp) + ' rupiah left of a ' + fmt(budget) + ' monthly budget.');

    buildRamp(ramp, zone, zoneText);

    var daysLeft = daysInMonth(mk) - dayOfMonth(today) + 1;
    var pace = hp > 0 ? Math.floor(hp / daysLeft) : 0;
    var potential = xpForMonth(hp, budget);

    if (hp < 0) {
      note.innerHTML = '<span class="bad">Over by ' + fmt(-hp) +
        '. No XP this month, and the streak ends when ' + monthName(mk) + ' closes.</span>';
    } else if (hp === 0) {
      note.innerHTML = '<span class="bad">The bar is empty. A month that closes at zero banks no XP and ends the streak.</span>';
    } else {
      note.innerHTML = '<b>+' + potential + ' XP</b> if ' + monthName(mk) +
        ' closes here. Streak ' + db.game.streak + ' → ' + (db.game.streak + 1) +
        '.<br>Safe to spend <b>' + fmt(pace) + '</b> per day over the ' +
        daysLeft + ' day' + (daysLeft === 1 ? '' : 's') + ' left.';
    }
  }

  function buildRamp(host, lit, label) {
    clear(host);
    for (var i = 0; i < 11; i++) {
      var b = el('i');
      if (i === lit) b.className = 'on';
      host.appendChild(b);
    }
    host.appendChild(el('span', null, label));
  }

  function txTodaySort(a, b) {
    return (a.createdAt - b.createdAt) || (a.id < b.id ? -1 : 1);
  }

  function renderBoardToday() {
    var host = $('board-today');
    if (!host) return;
    var today = todayKey();
    var txs = db.transactions.filter(function (t) { return t.date === today; });
    if (!txs.length) {
      host.textContent = 'Nothing logged today yet.';
      return;
    }
    var sum = txs.reduce(function (s, t) { return s + t.amount; }, 0);
    host.innerHTML = '<b>' + txs.length + ' purchase' + (txs.length === 1 ? '' : 's') +
      '</b> today · <b>' + fmt(sum) + '</b>';
  }

  function renderToday() {
    var today = todayKey();
    var list = $('today-lines');
    var txs = db.transactions.filter(function (t) { return t.date === today; }).sort(txTodaySort);

    clear(list);
    $('lines-count').textContent = txs.length
      ? txs.length + (txs.length === 1 ? ' purchase' : ' purchases')
      : '';

    if (!txs.length) {
      var empty = el('li', 'empty');
      empty.innerHTML = budgetFor(monthKey(today)) === null
        ? 'No purchases yet. <b>Set a monthly budget to fill the bar.</b>'
        : 'No purchases yet. <b>The bar is still whole.</b>';
      list.appendChild(empty);
      return;
    }

    txs.forEach(function (t) {
      var li = el('li', 'line' + (t.regretTag === 'regret' ? ' is-regret' : '') +
        (t.id === state.lastAddedId ? ' is-new' : ''));

      li.appendChild(el('span', 'l-cat', CAT_LABEL[t.category]));
      li.appendChild(el('span', 'l-note', t.note));
      li.appendChild(el('span', 'l-lead'));
      li.appendChild(el('span', 'l-amt', fmt(t.amount)));

      if (t.regretTag) {
        li.appendChild(el('span', 'l-tag ' + t.regretTag, TAG_LABEL[t.regretTag]));
      }

      var edit = el('button', 'l-edit', 'edit');
      edit.type = 'button';
      edit.setAttribute('aria-label', 'Edit purchase, ' + fmt(t.amount) + ' rupiah');
      edit.addEventListener('click', function () { startEdit(t.id); });
      li.appendChild(edit);

      list.appendChild(li);
    });
  }

  /* ---------------- insights: line, donut, calendar ---------------- */

  var SVGNS = 'http://www.w3.org/2000/svg';
  /* Fixed per-category pigments. Identity only: status still uses amber and rust. */
  var CAT_COLORS = {
    food: '#A8B98D',
    transport: '#83A9BE',
    shopping: '#C98E7E',
    fun: '#B79BC6',
    bills: '#CFB06B',
    other: '#9DA096'
  };

  function svgInto(parent, name, attrs) {
    var node = document.createElementNS(SVGNS, name);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    }
    parent.appendChild(node);
    return node;
  }

  /* One pass over the month: per-day totals, per-category totals, peaks. */
  function monthData(mk) {
    var n = daysInMonth(mk);
    var byDay = [];
    for (var i = 0; i <= n; i++) byDay[i] = 0;
    var byCat = {};
    CATEGORIES.forEach(function (c) { byCat[c[0]] = 0; });

    var count = 0;
    db.transactions.forEach(function (t) {
      if (monthKey(t.date) !== mk) return;
      byDay[dayOfMonth(t.date)] += t.amount;
      byCat[t.category] = (byCat[t.category] || 0) + t.amount;
      count++;
    });

    var total = 0, peak = 0, peakDay = 0;
    for (var d = 1; d <= n; d++) {
      total += byDay[d];
      if (byDay[d] > peak) { peak = byDay[d]; peakDay = d; }
    }

    var allow = dailyBudget(mk);
    var over = 0;
    if (allow !== null) {
      for (var o = 1; o <= n; o++) if (byDay[o] > allow) over++;
    }

    return {
      days: n, byDay: byDay, byCat: byCat, count: count, total: total,
      peak: peak, peakDay: peakDay, allow: allow, over: over
    };
  }

  function lineSummary(mk, data, last) {
    var s = 'Daily spending in ' + monthLabel(mk) + ', through day ' + last + '. ' +
      data.count + ' purchase' + (data.count === 1 ? '' : 's') +
      ' totalling ' + fmt(data.total) + ' rupiah.';
    if (data.peakDay) s += ' Highest day ' + data.peakDay + ' at ' + fmt(data.peak) + ' rupiah.';
    if (data.allow !== null) s += ' Daily allowance ' + fmt(data.allow) + ' rupiah.';
    if (data.over) s += ' ' + data.over + ' day' + (data.over === 1 ? '' : 's') + ' over allowance.';
    return s;
  }

  function renderLine(host, mk, data, today) {
    var W = Math.floor(host.clientWidth || 0);
    if (W < 120) return;
    clear(host);

    var H = W < 460 ? 150 : 196;
    var padL = 4, padR = 4, padT = 14, padB = 20;
    var last = Math.min(dayOfMonth(today), data.days);
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;

    var scaleTo = 0;
    for (var i = 1; i <= last; i++) if (data.byDay[i] > scaleTo) scaleTo = data.byDay[i];
    if (data.allow !== null) scaleTo = Math.max(scaleTo, data.allow);
    var top = scaleTo > 0 ? scaleTo * 1.15 : 1;

    function x(day) {
      return padL + (last <= 1 ? plotW / 2 : (day - 1) * plotW / (last - 1));
    }
    function y(v) { return padT + (1 - v / top) * plotH; }

    var svg = svgInto(host, 'svg', {
      viewBox: '0 0 ' + W + ' ' + H,
      width: W, height: H,
      role: 'img', 'aria-label': lineSummary(mk, data, last)
    });

    svgInto(svg, 'line', {
      x1: padL, y1: y(0), x2: W - padR, y2: y(0), 'class': 'axis-line'
    });

    if (data.allow !== null && data.allow < top) {
      svgInto(svg, 'line', {
        x1: padL, y1: y(data.allow), x2: W - padR, y2: y(data.allow), 'class': 'allow-line'
      });
    }

    var d = '';
    for (var day = 1; day <= last; day++) {
      d += (day === 1 ? 'M' : 'L') + x(day).toFixed(1) + ' ' + y(data.byDay[day]).toFixed(1);
    }
    if (last > 1) svgInto(svg, 'path', { d: d, 'class': 'spend-line' });

    for (var overDay = 1; overDay <= last; overDay++) {
      if (data.allow !== null && data.byDay[overDay] > data.allow) {
        svgInto(svg, 'circle', {
          cx: x(overDay).toFixed(1), cy: y(data.byDay[overDay]).toFixed(1),
          r: 3, 'class': 'dot-over'
        });
      }
    }
    svgInto(svg, 'circle', {
      cx: x(last).toFixed(1), cy: y(data.byDay[last]).toFixed(1),
      r: 3.6, 'class': 'dot-today'
    });

    var marks = [1, Math.round(last / 2), last].filter(function (v, idx, arr) {
      return v >= 1 && v <= last && arr.indexOf(v) === idx;
    });
    marks.forEach(function (day, idx) {
      var anchor = marks.length === 1 ? 'middle' : (idx === 0 ? 'start' : (idx === marks.length - 1 ? 'end' : 'middle'));
      var t = svgInto(svg, 'text', {
        x: x(day).toFixed(1), y: H - 5, 'text-anchor': anchor
      });
      t.textContent = day;
    });
  }

  function renderDonut(host, legend, center, data) {
    clear(host);
    clear(legend);

    var rows = CATEGORIES.map(function (c) {
      return { cat: c[0], sum: data.byCat[c[0]] || 0 };
    }).filter(function (r) { return r.sum > 0; })
      .sort(function (a, b) { return b.sum - a.sum; });

    var size = 220, c = size / 2, r = 74, width = 24;
    var circumference = 2 * Math.PI * r;

    var svg = svgInto(host, 'svg', {
      viewBox: '0 0 ' + size + ' ' + size,
      width: size, height: size,
      'aria-hidden': 'true', focusable: 'false'
    });
    var ring = svgInto(svg, 'g', {
      transform: 'rotate(-90 ' + c + ' ' + c + ')'
    });
    svgInto(ring, 'circle', {
      cx: c, cy: c, r: r, fill: 'none',
      stroke: 'rgba(242,240,230,.10)', 'stroke-width': width
    });

    var offset = 0;
    rows.forEach(function (row) {
      var len = (row.sum / data.total) * circumference;
      svgInto(ring, 'circle', {
        cx: c, cy: c, r: r, fill: 'none',
        stroke: CAT_COLORS[row.cat] || CAT_COLORS.other,
        'stroke-width': width,
        'stroke-dasharray': Math.max(0.5, len - 2).toFixed(2) + ' ' + circumference.toFixed(2),
        'stroke-dashoffset': (-offset).toFixed(2)
      });
      offset += len;
    });

    center.innerHTML = '<small>Rp spent</small><b>' + fmt(data.total) + '</b>';

    rows.forEach(function (row) {
      var li = el('li');
      li.appendChild(el('span', 'sw cat-' + row.cat));
      li.appendChild(el('span', 'dl', CAT_LABEL[row.cat]));
      li.appendChild(el('span', 'dv', fmt(row.sum)));
      li.appendChild(el('span', 'dp', Math.round((row.sum / data.total) * 100) + '%'));
      legend.appendChild(li);
    });
  }

  function calendarCell(mk, day, data, today) {
    var key = mk + '-' + pad(day);
    var spent = data.byDay[day];
    var future = key > today;
    var isToday = key === today;
    var over = data.allow !== null && spent > data.allow;

    var td = el('td');
    var cls = [];
    if (isToday) { cls.push('is-today'); td.setAttribute('aria-current', 'date'); }
    if (future) cls.push('is-future');
    if (over) cls.push('is-over');
    if (!spent) cls.push('is-zero');
    if (cls.length) td.className = cls.join(' ');

    var sr = el('span', 'sr-only');
    sr.textContent = dayLabel(key) + ': ' + (future
      ? 'upcoming'
      : (spent
        ? 'spent ' + fmt(spent) + (over ? ', over allowance' : '')
        : 'no spending')) + (isToday ? ', today' : '');
    td.appendChild(sr);

    td.appendChild(el('span', 'cal-d', String(day))).setAttribute('aria-hidden', 'true');

    if (spent) {
      var amt = el('span', 'cal-amt', fmtShort(spent));
      amt.setAttribute('aria-hidden', 'true');
      td.appendChild(amt);
      if (data.allow !== null) {
        var bar = el('span', 'cal-bar');
        bar.setAttribute('aria-hidden', 'true');
        var fill = el('i');
        fill.style.width = Math.min(100, (spent / data.allow) * 100).toFixed(1) + '%';
        bar.appendChild(fill);
        td.appendChild(bar);
      }
    } else if (!future) {
      var dash = el('span', 'cal-amt', '·');
      dash.setAttribute('aria-hidden', 'true');
      td.appendChild(dash);
    }

    return td;
  }

  function renderCalendar(host, mk, data) {
    clear(host);

    var table = el('table', 'cal');
    var cap = el('caption', 'sr-only');
    cap.textContent = 'Spending by date, ' + monthLabel(mk) + '. ' + (data.allow === null
      ? 'No monthly budget, so no daily allowance.'
      : 'Daily allowance ' + fmt(data.allow) + ' rupiah.');
    table.appendChild(cap);

    var thead = el('thead');
    var headRow = el('tr');
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      .forEach(function (name) {
        var th = el('th');
        th.scope = 'col';
        th.setAttribute('aria-label', name);
        var letter = el('span', null, name.slice(0, 1));
        letter.setAttribute('aria-hidden', 'true');
        th.appendChild(letter);
        headRow.appendChild(th);
      });
    thead.appendChild(headRow);
    table.appendChild(thead);

    var tbody = el('tbody');
    var today = todayKey();
    var used = (parseKey(mk + '-01').getDay() + 6) % 7;
    var row = el('tr');

    for (var b = 0; b < used; b++) {
      var blank = el('td', 'cal-blank');
      blank.setAttribute('aria-hidden', 'true');
      row.appendChild(blank);
    }

    for (var day = 1; day <= data.days; day++) {
      if (day > 1 && (used + day - 1) % 7 === 0) {
        tbody.appendChild(row);
        row = el('tr');
      }
      row.appendChild(calendarCell(mk, day, data, today));
    }
    tbody.appendChild(row);
    table.appendChild(tbody);
    host.appendChild(table);
  }

  function renderInsights() {
    var lineHost = $('chart-line');
    if (!lineHost) return;

    var today = todayKey();
    var mk = monthKey(today);
    var data = monthData(mk);
    var charts = $('charts');
    var empty = $('insights-empty');
    var note = $('insights-note');

    $('insights-month').textContent = monthLabel(mk);

    if (!data.total) {
      charts.hidden = true;
      empty.hidden = false;
      note.innerHTML = '';
      empty.innerHTML = data.allow === null
        ? 'Nothing spent in ' + monthLabel(mk) + ' yet. <b>Set a budget</b> and add purchases to fill these charts.'
        : 'Nothing spent in ' + monthLabel(mk) + ' yet. <b>Add a purchase</b> and the charts fill in.';
      return;
    }

    charts.hidden = false;
    empty.hidden = true;

    var bits = [
      '<b>' + data.count + '</b> purchase' + (data.count === 1 ? '' : 's'),
      '<b>' + fmt(data.total) + '</b> spent'
    ];
    if (data.peakDay) {
      bits.push('peak <b>' + fmt(data.peak) + '</b> on ' + data.peakDay + ' ' + monthName(mk));
    }
    if (data.over) {
      bits.push('<span class="bad">' + data.over + ' day' + (data.over === 1 ? '' : 's') +
        ' over allowance</span>');
    }
    if (data.allow === null) bits.push('no budget, so no allowance');
    note.innerHTML = bits.join(' · ');

    var allowKey = $('line-allow');
    allowKey.hidden = data.allow === null;
    if (data.allow !== null) allowKey.textContent = 'allowance ' + fmtShort(data.allow);

    renderLine(lineHost, mk, data, today);
    renderDonut($('chart-donut'), $('donut-legend'), $('donut-center'), data);
    renderCalendar($('chart-calendar'), mk, data);
  }

  function renderWeek() {
    var today = todayKey();
    var days = [];
    for (var i = 6; i >= 0; i--) days.push(addDays(today, -i));

    if (days.indexOf(state.selectedDay) === -1) state.selectedDay = today;

    var strip = $('strip');
    var active = document.activeElement;
    var focusDay = active && strip.contains(active) && active.dataset.day ? active.dataset.day : null;
    clear(strip);

    days.forEach(function (k) {
      var budget = dailyBudget(monthKey(k));
      var spent = spendOn(k);
      var over = budget !== null && spent > budget;

      var b = el('button');
      b.type = 'button';
      b.dataset.day = k;
      b.setAttribute('aria-pressed', k === state.selectedDay ? 'true' : 'false');
      var label = dayLabel(k) + ', spent ' + (spent ? fmt(spent) : 'nothing');
      if (k === today) label += ', today';
      if (budget === null) label += ', no budget for this month';
      else if (over) label += ', over budget';
      b.setAttribute('aria-label', label);
      if (over) b.className = 'is-over';
      if (k === today) b.className += ' is-today';
      if (!budget) b.title = 'No budget for this month';

      b.appendChild(el('span', 's-d', weekdayShort(k)));
      b.appendChild(el('span', 's-v', spent ? fmtShort(spent) : '—'));
      b.addEventListener('click', function () {
        state.selectedDay = k;
        renderWeek();
        renderRegret();
        if (window.matchMedia('(max-width:1023px)').matches) {
          $('day').scrollIntoView({ behavior: motion(), block: 'start' });
        }
      });
      strip.appendChild(b);
    });

    renderDay();
    renderRegret();

    if (focusDay) {
      var next = strip.querySelector('button[data-day="' + focusDay + '"]');
      if (next) next.focus({ preventScroll: true });
    }
  }

  function renderDay() {
    var host = $('day');
    clear(host);

    var k = state.selectedDay;
    var budget = dailyBudget(monthKey(k));
    var spent = spendOn(k);
    var txs = db.transactions.filter(function (t) { return t.date === k; }).sort(txTodaySort);

    var head = el('div', 'day-head');
    head.appendChild(el('span', 'd-date', dayLabel(k)));

    var stateLabel = budget === null ? 'no budget' : (spent > budget ? 'over' : (spent === 0 ? 'untouched' : 'under'));
    var chip = el('span', 'd-state' + (spent > budget ? ' over' : ''), stateLabel);
    head.appendChild(chip);

    var total = el('span', 'd-total' + (spent > budget ? ' over' : ''), spent ? fmt(spent) : '—');
    head.appendChild(total);
    host.appendChild(head);

    if (!txs.length) {
      host.appendChild(el('p', 'empty', 'Nothing recorded on this day.'));
      return;
    }

    txs.forEach(function (t) {
      var item = el('div', 'item' + (t.regretTag === 'regret' ? ' is-regret' : ''));

      var top = el('div', 'item-top');
      top.appendChild(el('span', 'item-cat', CAT_LABEL[t.category]));
      top.appendChild(el('span', 'item-note', t.note || '—'));
      top.appendChild(el('span', 'item-amt', fmt(t.amount)));
      item.appendChild(top);

      var tags = el('div', 'i-tags');
      tags.setAttribute('role', 'group');
      tags.setAttribute('aria-label', 'Regret tag for ' + (t.note || CAT_LABEL[t.category]));

      TAGS.forEach(function (tag) {
        var btn = el('button', 'tag-btn', tag[1]);
        btn.type = 'button';
        btn.dataset.tag = tag[0];
        btn.dataset.tagId = t.id;
        btn.setAttribute('aria-pressed', t.regretTag === tag[0] ? 'true' : 'false');
        btn.addEventListener('click', function () { setTag(t.id, tag[0]); });
        tags.appendChild(btn);
      });

      item.appendChild(tags);
      host.appendChild(item);
    });
  }

  function renderRegret() {
    var host = $('regret');
    clear(host);

    var today = todayKey();
    var from = addDays(today, -6);
    var txs = db.transactions.filter(function (t) { return t.date >= from && t.date <= today; });
    var regrets = txs.filter(function (t) { return t.regretTag === 'regret'; });
    var untagged = txs.filter(function (t) { return !t.regretTag; }).length;
    var total = txs.reduce(function (s, t) { return s + t.amount; }, 0);

    host.appendChild(el('h2', null, 'Regret · last 7 days'));

    if (!txs.length) {
      host.appendChild(el('p', 'empty', 'Nothing recorded in the last 7 days.'));
      return;
    }

    var pct = Math.round((regrets.length / txs.length) * 100);

    var top = el('div', 'regret-top');
    top.appendChild(el('div', 'regret-num', pct + '%'));

    var cap = el('div', 'regret-cap');
    cap.innerHTML = '<b>' + regrets.length + ' of ' + txs.length + '</b> purchases you’d take back';
    top.appendChild(cap);
    host.appendChild(top);

    var byCat = {};
    regrets.forEach(function (t) { byCat[t.category] = (byCat[t.category] || 0) + t.amount; });
    var ranked = Object.keys(byCat).map(function (c) {
      return { cat: c, sum: byCat[c] };
    }).sort(function (a, b) { return b.sum - a.sum; }).slice(0, 3);

    if (ranked.length) {
      var ramp = el('div', 'ramp-cats');
      var sizes = ['30px', '23px', '18px'];
      ranked.forEach(function (r, i) {
        var row = el('div', 'rc');
        var amt = el('b', null, fmt(r.sum));
        amt.style.setProperty('--sz', sizes[i]);
        row.appendChild(amt);
        row.appendChild(el('span', null, CAT_LABEL[r.cat]));
        ramp.appendChild(row);
      });
      host.appendChild(ramp);
    }

    var fine = el('p', 'fine');
    fine.innerHTML = fmt(total) + ' spent across ' + txs.length + ' purchases · ' +
      (untagged ? untagged + ' still untagged' : 'every purchase tagged');
    host.appendChild(fine);
  }

  function renderBudget() {
    var mk = monthKey(todayKey());
    var b = budgetFor(mk);
    $('budget-month').textContent = monthLabel(mk);
    $('foot-meta').textContent = monthShort(mk) + ' ' + mk.slice(0, 4) + ' · ' +
      daysInMonth(mk) + ' DAYS';
    var meta = $('budget-meta');

    if (b === null) {
      meta.textContent = 'No budget for ' + monthLabel(mk) + '. Nothing earns XP until it is set.';
      return;
    }

    var spent = spendInMonth(mk);
    var left = b - spent;
    meta.innerHTML = '<b>' + fmt(spent) + '</b> spent · ' + fmt(b) + ' budget · ' +
      (left < 0 ? '<span class="bad">' + fmt(-left) + ' over</span>' : fmt(left) + ' left');
  }

  function renderEntryAfter() {
    var host = $('entry-after');
    var form = $('entry');
    if (!host || !form || !form.amount) return;

    host.classList.remove('over');
    var amount = toAmount(form.amount.value);
    var mk = monthKey(form.date.value || todayKey());
    var budget = budgetFor(mk);

    if (budget === null) {
      host.textContent = amount ? 'No budget for ' + monthLabel(mk) + ', so HP cannot be projected.' : '';
      return;
    }
    if (!amount) {
      host.textContent = '';
      return;
    }

    var spent = spendInMonth(mk);
    if (state.editingId) {
      var tx = db.transactions.find(function (t) { return t.id === state.editingId; });
      if (tx && monthKey(tx.date) === mk) spent -= tx.amount;
    }
    var after = budget - spent - amount;
    if (after < 0) {
      host.classList.add('over');
      host.textContent = 'After this: ' + fmt(-after) + ' over budget.';
    } else if (after === 0) {
      host.textContent = 'After this: HP 0, the bar is empty.';
    } else {
      host.textContent = 'After this: HP ' + fmt(after) + ', still under budget.';
    }
  }

  /* ---------------- actions ---------------- */

  function setTag(id, tag) {
    var tx = db.transactions.find(function (t) { return t.id === id; });
    if (!tx) return;
    var active = document.activeElement;
    var restore = active && active.classList && active.classList.contains('tag-btn')
      ? { id: active.dataset.tagId, tag: active.dataset.tag } : null;
    tx.regretTag = tx.regretTag === tag ? null : tag;
    tick();
    persist();
    renderDay();
    renderRegret();
    renderToday();
    if (restore) {
      var next = document.querySelector('.tag-btn[data-tag-id="' + restore.id +
        '"][data-tag="' + restore.tag + '"]');
      if (next) next.focus({ preventScroll: true });
    }
    announce(tx.regretTag ? 'Tagged ' + tx.regretTag : 'Tag removed');
  }

  function startEdit(id) {
    var tx = db.transactions.find(function (t) { return t.id === id; });
    if (!tx) return;

    state.editingId = id;
    state.focusOnEnter = true;
    state.lastProjection = null;
    navigate('add');

    var form = $('entry');
    form.amount.value = nf.format(tx.amount);
    setCategory(form, tx.category);
    form.note.value = tx.note;
    form.date.value = tx.date;
    form.classList.add('is-editing');

    $('entry-h').textContent = 'Edit purchase · ' + dayLabel(tx.date);
    $('entry-submit').textContent = 'Save changes';
    $('entry-cancel').hidden = false;
    $('entry-delete').hidden = false;
    $('entry-error').textContent = '';
    form.amount.removeAttribute('aria-invalid');
    renderEntryAfter();
  }

  function resetEntry() {
    state.editingId = null;
    state.lastProjection = null;
    var form = $('entry');
    form.reset();
    setCategory(form, CATEGORIES[0][0]);
    form.date.value = todayKey();
    form.date.max = todayKey();
    form.classList.remove('is-editing');
    form.amount.removeAttribute('aria-invalid');

    $('entry-h').textContent = 'Add a purchase';
    $('entry-submit').textContent = 'Add purchase';
    $('entry-cancel').hidden = true;
    $('entry-delete').hidden = true;
    $('entry-error').textContent = '';
    renderEntryAfter();
  }

  function announce(msg) {
    $('status').textContent = msg;
  }

  /* Read the projection on blur rather than on every keystroke. */
  function announceProjection() {
    var after = $('entry-after');
    var text = (after.textContent || '').trim();
    if (!text || text === state.lastProjection) return;
    state.lastProjection = text;
    announce(text);
  }

  function exportJSON() {
    var blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = slug(APP_NAME) + '-' + todayKey() + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    announce('Exported JSON');
  }

  function viewFromHash() {
    var hash = window.location && window.location.hash ? window.location.hash : '';
    var v = hash.replace(/^#\/?/, '');
    if (v === 'main') return state.view || 'board';
    return v === 'add' || v === 'week' || v === 'board' ? v : 'board';
  }

  function applyView(v, opts) {
    opts = opts || {};
    var prev = state.view;
    state.view = v;
    document.body.dataset.view = v;
    if (v === 'board') {
      requestAnimationFrame(function () {
        fitHp($('hp-num'));
        renderInsights();
      });
    }

    var btns = document.querySelectorAll('[data-view-btn]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute('aria-pressed', btns[i].dataset.viewBtn === v ? 'true' : 'false');
    }

    if (prev === 'add' && v !== 'add') {
      resetEntry();
      setTimeout(function () { focusViewHeading(v); }, 0);
    }

    if (!opts.initial && !opts.keepScroll && !state.pendingScroll &&
        window.matchMedia('(max-width:1023px)').matches) {
      window.scrollTo({ top: 0, behavior: motion() });
    }

    if (v === 'add') {
      if (state.focusOnEnter) {
        state.focusOnEnter = false;
        setTimeout(function () { $('entry').amount.focus(); }, 60);
      } else {
        setTimeout(function () { $('entry-h').focus({ preventScroll: true }); }, 0);
      }
      renderEntryAfter();
    }

    if (state.pendingScroll === 'budget' && v === 'board') {
      state.pendingScroll = null;
      setTimeout(function () {
        $('budget-block').scrollIntoView({ behavior: motion(), block: 'center' });
        $('budget-form').budget.focus({ preventScroll: true });
      }, 60);
    }
  }

  /* Focus the heading of the view that is actually visible. */
  function focusViewHeading(v) {
    var id = v === 'week' ? 'week-h' : (v === 'add' ? 'entry-h' : 'today-h');
    var node = $(id);
    if (node && node.offsetParent !== null) node.focus({ preventScroll: true });
  }

  function navigate(v, opts) {
    opts = opts || {};
    if (window.location && window.location.hash !== undefined) {
      var target = '#' + v;
      if (window.location.hash !== target) {
        window.location.hash = target;
        return;
      }
    }
    applyView(v, opts);
  }

  /* ---------------- events ---------------- */

  function init() {
    document.title = APP_NAME + ' — monthly budget as hit points';
    var nameEls = document.querySelectorAll('[data-app-name]');
    for (var n = 0; n < nameEls.length; n++) nameEls[n].textContent = APP_NAME;

    var form = $('entry');

    var chips = $('cat-chips');
    CATEGORIES.forEach(function (c, i) {
      var input = el('input');
      input.type = 'radio';
      input.name = 'category';
      input.value = c[0];
      input.id = 'cat-' + c[0];
      if (i === 0) input.setAttribute('checked', 'checked');

      var label = el('label', null, c[1]);
      label.setAttribute('for', input.id);

      chips.appendChild(input);
      chips.appendChild(label);
    });

    form.amount.addEventListener('input', function () {
      formatAmountInput(form.amount);
      form.amount.removeAttribute('aria-invalid');
      renderEntryAfter();
    });
    form.amount.addEventListener('blur', announceProjection);

    var today = todayKey();
    form.date.value = today;
    form.date.max = today;
    form.date.addEventListener('change', function () {
      form.date.removeAttribute('aria-invalid');
      renderEntryAfter();
    });
    form.date.addEventListener('blur', announceProjection);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var err = $('entry-error');
      var amount = toAmount(form.amount.value);
      var date = form.date.value || todayKey();
      var note = String(form.note.value || '').trim().slice(0, 80);

      if (!amount) {
        err.textContent = 'Enter an amount greater than zero.';
        form.amount.setAttribute('aria-invalid', 'true');
        form.amount.focus();
        return;
      }
      if (date > todayKey()) {
        err.textContent = 'A purchase can’t be dated in the future.';
        form.date.setAttribute('aria-invalid', 'true');
        form.date.focus();
        return;
      }
      err.textContent = '';
      form.amount.removeAttribute('aria-invalid');
      form.date.removeAttribute('aria-invalid');

      if (state.editingId) {
        var tx = db.transactions.find(function (t) { return t.id === state.editingId; });
        if (tx) {
          tx.amount = amount;
          tx.category = getCategory(form);
          tx.note = note;
          tx.date = date;
        }
        announce('Purchase updated');
      } else {
        var id = uid();
        db.transactions.push({
          id: id,
          amount: amount,
          category: getCategory(form),
          note: note,
          date: date,
          regretTag: null,
          createdAt: Date.now()
        });
        state.lastAddedId = id;
        announce('Purchase added, ' + fmt(amount) + ' rupiah');
      }

      tick();
      persist();
      resetEntry();
      render();
      state.pendingScroll = null;
      navigate('board');
    });

    $('entry-cancel').addEventListener('click', function () {
      resetEntry();
      render();
      navigate('board');
    });

    $('entry-delete').addEventListener('click', function () {
      if (!state.editingId) return;
      if (!window.confirm('Delete this purchase? This cannot be undone.')) return;
      db.transactions = db.transactions.filter(function (t) { return t.id !== state.editingId; });
      resetEntry();
      tick();
      persist();
      render();
      announce('Purchase deleted');
      navigate('board');
    });

    var budgetForm = $('budget-form');
    var budgetErr = $('budget-error');
    budgetForm.budget.addEventListener('input', function () {
      budgetForm.budget.removeAttribute('aria-invalid');
      budgetErr.textContent = '';
    });
    budgetForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = toAmount(budgetForm.budget.value);
      if (!v) {
        budgetErr.textContent = 'Enter a budget greater than zero.';
        budgetForm.budget.setAttribute('aria-invalid', 'true');
        budgetForm.budget.focus();
        return;
      }
      budgetErr.textContent = '';
      budgetForm.budget.removeAttribute('aria-invalid');
      var mk = monthKey(todayKey());
      db.settings.budgets[mk] = v;
      if (!db.settings.startDate || db.settings.startDate > todayKey()) {
        db.settings.startDate = todayKey();
      }
      tick();
      persist();
      render();
      announce('Monthly budget set to ' + fmt(v) + ' rupiah');
    });

    var viewBtns = document.querySelectorAll('[data-view-btn]');
    for (var i = 0; i < viewBtns.length; i++) {
      viewBtns[i].addEventListener('click', function () { navigate(this.dataset.viewBtn); });
    }

    function armAdd() { state.focusOnEnter = true; }
    $('board-add').addEventListener('click', armAdd);
    $('foot-add').addEventListener('click', armAdd);

    $('export-btn').addEventListener('click', exportJSON);
    $('foot-export').addEventListener('click', exportJSON);

    $('foot-budget').addEventListener('click', function () {
      if (state.view === 'board') {
        $('budget-block').scrollIntoView({ behavior: motion(), block: 'center' });
        $('budget-form').budget.focus({ preventScroll: true });
        return;
      }
      state.pendingScroll = 'budget';
      navigate('board', { keepScroll: true });
    });

    $('import-btn').addEventListener('click', function () { $('import-file').click(); });

    $('import-file').addEventListener('change', function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var next = normalize(JSON.parse(String(reader.result)));
          var ok = window.confirm('Replace everything in this browser with the imported file?');
          if (!ok) return;
          db = next;
          tick();
          persist();
          resetEntry();
          render();
          announce('Import complete');
        } catch (err) {
          window.alert('That file could not be read as a Budget HP backup.');
        }
        e.target.value = '';
      };
      reader.readAsText(file);
    });

    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) render();
    });

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        fitHp($('hp-num'));
        renderInsights();
      }, 120);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && state.view === 'add') {
        var wasEditing = !!state.editingId;
        resetEntry();
        render();
        navigate('board');
        if (wasEditing) announce('Edit cancelled');
      }
    });

    resetEntry();
    render();

    if (window.location && window.history && window.history.replaceState &&
        !window.location.hash) {
      window.history.replaceState(null, '', '#board');
    }
    applyView(viewFromHash(), { initial: true });

    if (window.addEventListener) {
      window.addEventListener('hashchange', function () {
        if (window.location.hash === '#main') return;
        applyView(viewFromHash());
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
