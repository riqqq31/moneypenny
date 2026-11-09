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

  var HORIZON = 120;            // days of opened-date history kept
  var XP_PER_1000 = 1;
  var XP_DAILY_CAP = 100;

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

  /* ---------------- storage ---------------- */

  function fresh() {
    var t = todayKey();
    return {
      version: 1,
      settings: { startDate: t, budgets: {} },
      transactions: [],
      game: {
        xp: 0, streak: 0, longestStreak: 0,
        lastProcessedDate: addDays(t, -1),
        openedDates: [t]
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
        lastProcessedDate: /^\d{4}-\d{2}-\d{2}$/.test(g.lastProcessedDate) ? g.lastProcessedDate : base.game.lastProcessedDate,
        openedDates: Array.isArray(g.openedDates) ? g.openedDates.filter(function (d) {
          return /^\d{4}-\d{2}-\d{2}$/.test(d);
        }) : base.game.openedDates
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
  function hpOn(k) {
    var d = dailyBudget(monthKey(k));
    return d === null ? null : d - spendOn(k);
  }
  function xpFor(hp) {
    if (hp <= 0) return 0;
    return Math.min(Math.floor(hp / 1000) * XP_PER_1000, XP_DAILY_CAP);
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

  function pruneOpened(today) {
    var floor = addDays(today, -HORIZON);
    db.game.openedDates = db.game.openedDates.filter(function (d) { return d >= floor; });
  }

  /* Awards XP for every closed day between lastProcessedDate and today. */
  function tick() {
    var today = todayKey();
    var g = db.game;

    if (g.openedDates.indexOf(today) === -1) g.openedDates.push(today);

    var cur = g.lastProcessedDate ? addDays(g.lastProcessedDate, 1) : db.settings.startDate;
    if (cur < db.settings.startDate) cur = db.settings.startDate;

    var guard = 0;
    while (cur < today && guard++ < 1000) {
      if (g.openedDates.indexOf(cur) !== -1) {
        var hp = hpOn(cur);
        if (hp !== null) {
          if (hp > 0) {
            g.xp += xpFor(hp);
            g.streak += 1;
            if (g.streak > g.longestStreak) g.longestStreak = g.streak;
          } else {
            g.streak = 0;
          }
        }
      }
      g.lastProcessedDate = cur;
      cur = addDays(cur, 1);
    }

    var yest = addDays(today, -1);
    if (!g.lastProcessedDate || g.lastProcessedDate > yest) g.lastProcessedDate = yest;

    pruneOpened(today);
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
    view: 'today',
    selectedDay: todayKey(),
    editingId: null,
    lastAddedId: null
  };

  /* ---------------- rendering ---------------- */

  function render() {
    tick();
    persist();
    var dateInput = $('entry').date;
    if (dateInput) dateInput.max = todayKey();
    renderStats();
    renderHP();
    renderToday();
    renderWeek();
    renderBudget();
    if (state.lastAddedId) state.lastAddedId = null;
  }

  function renderStats() {
    var info = levelInfo(db.game.xp);
    $('stat-level').textContent = info.level;
    $('stat-streak').textContent = db.game.streak;
    $('stat-xp').textContent = fmt(db.game.xp);
    $('stat-next').textContent = '/' + fmt(info.next);
  }

  function renderHP() {
    var today = todayKey();
    var mk = monthKey(today);
    var budget = dailyBudget(mk);
    var spent = spendOn(today);

    var num = $('hp-num');
    var math = $('hp-math');
    var note = $('hp-note');
    var bar = $('bar');
    var fill = $('bar-fill');
    var edge = $('bar-edge');
    var ramp = $('ramp');

    $('hp-date').textContent = dayLabel(today);
    num.classList.remove('neg', 'unset');

    if (budget === null) {
      num.classList.add('unset');
      num.innerHTML = '<small>Rp</small><span>—</span>';
      math.textContent = 'No budget set for ' + monthLabel(mk) + ' yet.';
      $('bar-spent').textContent = spent ? 'erased ' + fmt(spent) : 'nothing erased yet';
      $('bar-budget').textContent = 'no daily budget';
      $('bar-spent').classList.remove('bad');
      bar.classList.remove('over');
      bar.classList.add('is-unset');
      bar.setAttribute('aria-label', 'Daily budget bar. No budget set for ' + monthLabel(mk) + '.');
      fill.style.width = '0%';
      edge.style.left = '0%';
      note.innerHTML = 'Set a monthly budget below and today’s HP starts immediately.';
      buildRamp(ramp, -1, 'no budget');
      return;
    }

    bar.classList.remove('is-unset');

    var hp = budget - spent;
    var ratio = budget > 0 ? Math.max(0, Math.min(1, hp / budget)) : 0;

    if (hp < 0) {
      num.classList.add('neg');
      num.innerHTML = '<small>Rp</small><span>−' + fmt(-hp) + '</span>';
    } else {
      num.innerHTML = '<small>Rp</small><span>' + fmt(hp) + '</span>';
    }

    math.innerHTML = '<b>' + fmt(budget) + '</b> daily budget &nbsp;−&nbsp; <s>' +
      fmt(spent) + '</s> spent';

    $('bar-spent').textContent = hp < 0 ? 'over by ' + fmt(-hp) : 'erased ' + fmt(spent);
    $('bar-budget').textContent = 'budget ' + fmt(budget);

    bar.classList.toggle('over', hp < 0);
    $('bar-spent').classList.toggle('bad', hp < 0);
    fill.style.width = (ratio * 100).toFixed(2) + '%';
    edge.style.left = (ratio * 100).toFixed(2) + '%';
    bar.setAttribute('aria-label', hp < 0
      ? 'Daily budget bar. Over by ' + fmt(-hp) + ' rupiah against a ' + fmt(budget) + ' daily budget.'
      : fmt(hp) + ' rupiah left of a ' + fmt(budget) + ' daily budget.');

    var zone = hp <= 0 ? -1 : Math.round(ratio * 10);
    buildRamp(ramp, zone, hp < 0 ? 'over' : 'zone ' + zone + '/10');

    var potential = xpFor(hp);
    if (hp < 0) {
      note.innerHTML = '<span class="bad">Over by ' + fmt(-hp) +
        '. No XP today, and the streak ends at midnight.</span>';
    } else if (hp === 0) {
      note.innerHTML = '<span class="bad">The bar is empty. A day that closes at zero banks no XP and ends the streak.</span>';
    } else {
      note.innerHTML = '<b>+' + potential + ' XP</b> if the day closes here. Streak ' +
        db.game.streak + ' → ' + (db.game.streak + 1) + '.';
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
        ? 'No purchases yet. <b>Set a monthly budget to give today a bar.</b>'
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

  function renderWeek() {
    var today = todayKey();
    var days = [];
    for (var i = 6; i >= 0; i--) days.push(addDays(today, -i));

    if (days.indexOf(state.selectedDay) === -1) state.selectedDay = today;

    var strip = $('strip');
    clear(strip);

    days.forEach(function (k) {
      var budget = dailyBudget(monthKey(k));
      var spent = spendOn(k);
      var over = budget !== null && spent > budget;

      var b = el('button');
      b.type = 'button';
      b.setAttribute('aria-pressed', k === state.selectedDay ? 'true' : 'false');
      b.setAttribute('aria-label', dayLabel(k) + ', spent ' + (spent ? fmt(spent) : 'nothing'));
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
          $('day').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
      strip.appendChild(b);
    });

    renderDay();
    renderRegret();
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

    var daily = dailyBudget(mk);
    meta.innerHTML = '<b>' + fmt(daily) + '</b> per day · ' + fmt(b) + ' over ' +
      daysInMonth(mk) + ' days · ' + monthName(mk) + ' ' + mk.slice(0, 4);
  }

  /* ---------------- actions ---------------- */

  function setTag(id, tag) {
    var tx = db.transactions.find(function (t) { return t.id === id; });
    if (!tx) return;
    tx.regretTag = tx.regretTag === tag ? null : tag;
    tick();
    persist();
    renderDay();
    renderRegret();
    renderToday();
    announce(tx.regretTag ? 'Tagged ' + tx.regretTag : 'Tag removed');
  }

  function startEdit(id) {
    var tx = db.transactions.find(function (t) { return t.id === id; });
    if (!tx) return;

    state.editingId = id;
    setView('today', true);

    var form = $('entry');
    form.amount.value = tx.amount;
    form.category.value = tx.category;
    form.note.value = tx.note;
    form.date.value = tx.date;

    $('entry-h').textContent = 'Edit purchase · ' + dayLabel(tx.date);
    $('entry-submit').textContent = 'Save changes';
    $('entry-cancel').hidden = false;
    $('entry-delete').hidden = false;
    $('entry-error').textContent = '';

    form.amount.focus();
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function resetEntry() {
    state.editingId = null;
    var form = $('entry');
    form.reset();
    form.category.value = 'food';
    form.date.value = todayKey();
    form.date.max = todayKey();

    $('entry-h').textContent = 'Add a purchase';
    $('entry-submit').textContent = 'Add purchase';
    $('entry-cancel').hidden = true;
    $('entry-delete').hidden = true;
    $('entry-error').textContent = '';
  }

  function announce(msg) {
    $('status').textContent = msg;
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

  function setView(v, keepScroll) {
    state.view = v;
    document.body.dataset.view = v;
    var btns = document.querySelectorAll('[data-view-btn]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute('aria-pressed', btns[i].dataset.viewBtn === v ? 'true' : 'false');
    }
    if (!keepScroll && window.matchMedia('(max-width:1023px)').matches) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /* ---------------- events ---------------- */

  function init() {
    document.title = APP_NAME + ' — daily budget as hit points';
    var nameEls = document.querySelectorAll('[data-app-name]');
    for (var n = 0; n < nameEls.length; n++) nameEls[n].textContent = APP_NAME;

    var form = $('entry');
    var catSelect = form.category;

    CATEGORIES.forEach(function (c) {
      var o = document.createElement('option');
      o.value = c[0];
      o.textContent = c[1];
      catSelect.appendChild(o);
    });

    var today = todayKey();
    form.date.value = today;
    form.date.max = today;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var err = $('entry-error');
      var amount = toAmount(form.amount.value);
      var date = form.date.value || todayKey();
      var note = String(form.note.value || '').trim().slice(0, 80);

      if (!amount) {
        err.textContent = 'Enter an amount greater than zero.';
        form.amount.focus();
        return;
      }
      if (date > todayKey()) {
        err.textContent = 'A purchase can’t be dated in the future.';
        return;
      }
      err.textContent = '';

      if (state.editingId) {
        var tx = db.transactions.find(function (t) { return t.id === state.editingId; });
        if (tx) {
          tx.amount = amount;
          tx.category = form.category.value;
          tx.note = note;
          tx.date = date;
        }
        announce('Purchase updated');
      } else {
        var id = uid();
        db.transactions.push({
          id: id,
          amount: amount,
          category: form.category.value,
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
      form.amount.focus();
    });

    $('entry-cancel').addEventListener('click', function () {
      resetEntry();
      render();
      form.amount.focus();
    });

    $('entry-delete').addEventListener('click', function () {
      if (!state.editingId) return;
      db.transactions = db.transactions.filter(function (t) { return t.id !== state.editingId; });
      resetEntry();
      tick();
      persist();
      render();
      announce('Purchase deleted');
      form.amount.focus();
    });

    var budgetForm = $('budget-form');
    budgetForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = toAmount(budgetForm.budget.value);
      if (!v) {
        budgetForm.budget.focus();
        return;
      }
      var mk = monthKey(todayKey());
      db.settings.budgets[mk] = v;
      if (!db.settings.startDate || db.settings.startDate > todayKey()) {
        db.settings.startDate = todayKey();
      }
      tick();
      persist();
      render();
      announce('Daily budget set to ' + fmt(Math.floor(v / daysInMonth(mk))) + ' rupiah');
    });

    var viewBtns = document.querySelectorAll('[data-view-btn]');
    for (var i = 0; i < viewBtns.length; i++) {
      viewBtns[i].addEventListener('click', function () { setView(this.dataset.viewBtn); });
    }

    $('export-btn').addEventListener('click', exportJSON);
    $('foot-export').addEventListener('click', exportJSON);

    $('foot-budget').addEventListener('click', function () {
      setView('today', true);
      $('budget-block').scrollIntoView({ behavior: 'smooth', block: 'center' });
      $('budget-form').budget.focus({ preventScroll: true });
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
          announce('That file could not be read as a Budget HP backup');
          window.alert('That file could not be read as a Budget HP backup.');
        }
        e.target.value = '';
      };
      reader.readAsText(file);
    });

    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) render();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && state.editingId) {
        resetEntry();
        render();
      }
    });

    resetEntry();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
