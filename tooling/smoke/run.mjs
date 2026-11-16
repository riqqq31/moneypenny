/* Browser smoke test: drives the real pages over CDP, seeds a month of data,
   and checks render, add/edit/delete, week selection and the mobile layout.
   Needs a running server (npm run preview) and Chrome or Edge.

   Usage: npm run build && npm run preview  (in another terminal)
          npm run test:smoke
   Override with SMOKE_BASE, SMOKE_PORT and BROWSER. */

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(HERE, 'output');

const BROWSER = [
  process.env.BROWSER,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium'
]
  .filter(Boolean)
  .find((path) => existsSync(path));

if (!BROWSER) {
  console.error('No Chrome or Edge binary found. Set BROWSER to the executable path.');
  process.exit(1);
}

const BASE = process.env.SMOKE_BASE || 'http://localhost:4173';
const PORT = Number(process.env.SMOKE_PORT || 9333);

mkdirSync(OUTPUT, { recursive: true });
const profile = mkdtempSync(join(tmpdir(), 'budget-hp-smoke-'));
const browser = spawn(
  BROWSER,
  [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--window-size=1280,1000',
    'about:blank'
  ],
  { stdio: 'ignore' }
);

process.on('exit', () => browser.kill());

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function targetUrl() {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await res.json();
      const page = list.find((t) => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      /* browser still starting */
    }
    await sleep(200);
  }
  throw new Error('Browser did not expose a debugging target');
}

class CDP {
  constructor(url) {
    this.url = url;
    this.id = 0;
    this.pending = new Map();
    this.listeners = new Map();
    this.events = [];
  }

  async connect() {
    this.ws = new WebSocket(this.url);
    await new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
    });
    this.ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
        return;
      }
      if (msg.method) {
        this.events.push(msg);
        const list = this.listeners.get(msg.method) || [];
        list.forEach((fn) => fn(msg.params));
      }
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.id;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  once(method, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout waiting for ' + method)), timeout);
      const fn = (params) => {
        clearTimeout(timer);
        const list = this.listeners.get(method) || [];
        this.listeners.set(
          method,
          list.filter((f) => f !== fn)
        );
        resolve(params);
      };
      this.listeners.set(method, [...(this.listeners.get(method) || []), fn]);
    });
  }

  async evaluate(expression) {
    const { result, exceptionDetails } = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true
    });
    if (exceptionDetails) {
      throw new Error(
        exceptionDetails.exception?.description || exceptionDetails.text || 'evaluate failed'
      );
    }
    return result.value;
  }

  async goto(path) {
    const loaded = this.once('Page.loadEventFired');
    await this.send('Page.navigate', { url: BASE + path });
    await loaded;
    await sleep(150);
  }

  async reload() {
    const loaded = this.once('Page.loadEventFired');
    await this.send('Page.reload', { ignoreCache: true });
    await loaded;
    await sleep(200);
  }
}

const failures = [];
function check(name, condition, detail) {
  if (condition) console.log('ok   ' + name);
  else {
    console.log('FAIL ' + name + (detail === undefined ? '' : ' -> ' + JSON.stringify(detail)));
    failures.push(name);
  }
}

const cdp = new CDP(await targetUrl());
await cdp.connect();
await cdp.send('Page.enable');
await cdp.send('Runtime.enable');
await cdp.send('Log.enable');
cdp.send('Emulation.setDeviceMetricsOverride', {
  width: 1280,
  height: 1000,
  deviceScaleFactor: 1,
  mobile: false
});

const runtimeErrors = [];
const errorEvents = ['Runtime.exceptionThrown', 'Log.entryAdded', 'Runtime.consoleAPICalled'];
for (const name of errorEvents) {
  cdp.listeners.set(name, [
    (params) => {
      if (name === 'Runtime.exceptionThrown') runtimeErrors.push(params.exceptionDetails.text);
      if (name === 'Log.entryAdded' && params.entry.level === 'error')
        runtimeErrors.push(params.entry.text);
      if (name === 'Runtime.consoleAPICalled' && params.type === 'error')
        runtimeErrors.push(params.args.map((a) => a.value || a.description).join(' '));
    }
  ]);
}

/* Seed a realistic month in the same profile the pages will use. */
await cdp.goto('/index.html');
const seed = await cdp.evaluate(`(() => {
  const now = new Date();
  const y = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const today = y + '-' + mm + '-' + dd;
  const mk = y + '-' + mm;
  const prev = new Date(y, now.getMonth() - 1, 1);
  const lastProcessed = prev.getFullYear() + '-' + String(prev.getMonth() + 1).padStart(2, '0');
  const db = {
    version: 1,
    settings: { startDate: today, budgets: { [mk]: 3100000 } },
    transactions: [
      { id: 't1', amount: 25000, category: 'food', note: 'warung', date: today, regretTag: null, createdAt: 1 },
      { id: 't2', amount: 80000, category: 'fun', note: 'cinema', date: today, regretTag: 'regret', createdAt: 2 }
    ],
    game: { xp: 0, streak: 0, longestStreak: 0, lastProcessedMonth: lastProcessed }
  };
  localStorage.setItem('budget-hp.v1', JSON.stringify(db));
  return { today, mk };
})()`);
console.log('seeded for', seed.today);

await cdp.reload();

const board = await cdp.evaluate(`(() => ({
  hp: document.querySelector('#hp-num span').textContent,
  math: document.querySelector('#hp-math').textContent,
  lines: document.querySelectorAll('#today-lines li.line').length,
  level: document.querySelector('#stat-level').textContent,
  strip: document.querySelectorAll('#strip button').length,
  lineSvg: !!document.querySelector('#chart-line svg'),
  donut: !!document.querySelectorAll('#chart-donut svg circle').length,
  calendar: !!document.querySelector('#chart-calendar table'),
  budgetMeta: document.querySelector('#budget-meta').textContent,
  railDisplay: getComputedStyle(document.querySelector('.rail')).display,
  tabsDisplay: getComputedStyle(document.querySelector('.tabs')).display,
  bodyClass: document.body.className,
  navCurrent: document.querySelector('[data-nav="board"]').getAttribute('aria-current')
}))()`);

check('board HP = budget - spend', board.hp === '2.995.000', board.hp);
check(
  'board shows the spent math',
  board.math.includes('3.100.000') && board.math.includes('105.000'),
  board.math
);
check('board lists today purchases', board.lines === 2, board.lines);
check('header level renders', board.level === '1', board.level);
check('week strip renders seven days', board.strip === 7, board.strip);
check('line chart renders', board.lineSvg === true);
check('donut renders', board.donut === true);
check('calendar renders', board.calendar === true);
check('budget meta renders', board.budgetMeta.includes('105.000 spent'), board.budgetMeta);
check('desktop shows week rail', board.railDisplay === 'block', board.railDisplay);
check('desktop hides tabs', board.tabsDisplay === 'none', board.tabsDisplay);
check('board gets page class', board.bodyClass.includes('page-board'), board.bodyClass);
check('nav marks current page', board.navCurrent === 'page', board.navCurrent);

/* Add flow. */
await cdp.goto('/add.html');
const addReady = await cdp.evaluate(`(() => ({
  focused: document.activeElement.id,
  chips: document.querySelectorAll('#cat-chips input').length,
  title: document.querySelector('#entry-h').textContent,
  rail: getComputedStyle(document.querySelector('.rail')).display
}))()`);
check('add page focuses the heading', addReady.focused === 'entry-h', addReady.focused);
check('add page builds six category chips', addReady.chips === 6, addReady.chips);
check('add page keeps desktop rail', addReady.rail === 'block', addReady.rail);

const addNavigation = cdp.once('Page.loadEventFired');
await cdp.evaluate(`(() => {
  const form = document.querySelector('#entry');
  form.amount.value = '15000';
  form.amount.dispatchEvent(new Event('input', { bubbles: true }));
  form.note.value = 'kopi';
  form.querySelector('[type="submit"]').click();
  return true;
})()`);
await addNavigation;
await sleep(250);

const afterAdd = await cdp.evaluate(`(() => ({
  url: location.pathname + location.search,
  hp: document.querySelector('#hp-num span').textContent,
  lines: document.querySelectorAll('#today-lines li.line').length,
  status: document.querySelector('#status').textContent
}))()`);
check(
  'saving returns to the board with added flag',
  afterAdd.url.startsWith('/index.html'),
  afterAdd.url
);
check('saved purchase updates HP', afterAdd.hp === '2.980.000', afterAdd.hp);
check('saved purchase appears in today lines', afterAdd.lines === 3, afterAdd.lines);
check(
  'arrival announces the new purchase',
  afterAdd.status.includes('Purchase added'),
  afterAdd.status
);

/* Edit flow: open the newest line, change the amount, save. */
const editNavigation = cdp.once('Page.loadEventFired');
await cdp.evaluate(`document.querySelectorAll('.l-edit')[2].click()`);
await editNavigation;
await sleep(200);

const editReady = await cdp.evaluate(`(() => ({
  title: document.querySelector('#entry-h').textContent,
  amount: document.querySelector('#entry').amount.value,
  deleteVisible: !document.querySelector('#entry-delete').hidden
}))()`);
check(
  'edit opens the entry page in edit mode',
  editReady.title.startsWith('Edit purchase'),
  editReady.title
);
check('edit prefills the amount', editReady.amount === '15.000', editReady.amount);
check('edit exposes delete', editReady.deleteVisible === true);

const saveNavigation = cdp.once('Page.loadEventFired');
await cdp.evaluate(`(() => {
  const form = document.querySelector('#entry');
  form.amount.value = '30000';
  form.amount.dispatchEvent(new Event('input', { bubbles: true }));
  form.querySelector('[type="submit"]').click();
  return true;
})()`);
await saveNavigation;
await sleep(250);

const afterEdit = await cdp.evaluate(`(() => ({
  hp: document.querySelector('#hp-num span').textContent,
  lines: document.querySelectorAll('#today-lines li.line').length
}))()`);
check('editing rewrites the transaction', afterEdit.hp === '2.965.000', afterEdit.hp);
check('editing keeps one line for the purchase', afterEdit.lines === 3, afterEdit.lines);

/* Delete flow with a native confirm. */
cdp.send('Page.enable');
cdp.listeners.set('Page.javascriptDialogOpening', [
  () => cdp.send('Page.handleJavaScriptDialog', { accept: true })
]);
const editAgain = cdp.once('Page.loadEventFired');
await cdp.evaluate(`document.querySelectorAll('.l-edit')[2].click()`);
await editAgain;
await sleep(200);
const deleteNavigation = cdp.once('Page.loadEventFired');
await cdp.evaluate(`document.querySelector('#entry-delete').click()`);
await deleteNavigation;
await sleep(250);

const afterDelete = await cdp.evaluate(`(() => ({
  lines: document.querySelectorAll('#today-lines li.line').length,
  status: document.querySelector('#status').textContent,
  url: location.search
}))()`);
check('delete removes the purchase', afterDelete.lines === 2, afterDelete.lines);
check('delete is announced', afterDelete.status.includes('deleted'), afterDelete.status);
check('delete flag is consumed from the URL', afterDelete.url === '', afterDelete.url);

/* Week page: day selection through the query string. */
await cdp.goto('/week.html');
const week = await cdp.evaluate(`(() => ({
  strip: document.querySelectorAll('#strip button').length,
  selected: document.querySelector('#strip button[aria-pressed="true"]').dataset.day,
  add: document.querySelector('#foot-add').getAttribute('href'),
  regret: document.querySelector('.regret-block').textContent.length,
  title: document.querySelector('#week-h').textContent,
  current: document.querySelector('[data-nav="week"]').getAttribute('aria-current')
}))()`);
check('week page renders the strip', week.strip === 7, week.strip);
check('week page marks today', week.selected === seed.today, week.selected);
check(
  'week add link carries the day',
  week.add.includes('from=week') && week.add.includes(seed.today),
  week.add
);
check('regret panel renders', week.regret > 0, week.regret);
check('week nav marks current page', week.current === 'page', week.current);

const otherDay = await cdp.evaluate(`(() => {
  const buttons = document.querySelectorAll('#strip button');
  buttons[0].click();
  return buttons[0].dataset.day;
})()`);
await sleep(200);
const weekAfterSelect = await cdp.evaluate(`(() => ({
  search: location.search,
  heading: document.querySelector('#day .d-date').textContent,
  add: document.querySelector('#foot-add').getAttribute('href')
}))()`);
check(
  'selecting a day updates the URL',
  weekAfterSelect.search.includes('day=' + otherDay),
  weekAfterSelect.search
);
check(
  'selecting a day rerenders the panel',
  weekAfterSelect.heading.length > 0,
  weekAfterSelect.heading
);
check(
  'add link follows the selected day',
  weekAfterSelect.add.includes(otherDay),
  weekAfterSelect.add
);

/* Mobile layout: rail is off-canvas, tabs are the navigation. */
await cdp.send('Emulation.setDeviceMetricsOverride', {
  width: 390,
  height: 844,
  deviceScaleFactor: 2,
  mobile: true
});
await cdp.goto('/index.html');
const mobile = await cdp.evaluate(`(() => ({
  rail: getComputedStyle(document.querySelector('.rail')).display,
  tabs: getComputedStyle(document.querySelector('.tabs')).display,
  tabsAtTop: (() => {
    const t = document.querySelector('.tabs').getBoundingClientRect();
    const m = document.querySelector('.meta').getBoundingClientRect();
    return t.top > m.top;
  })(),
  overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
}))()`);
check('mobile hides the week rail', mobile.rail === 'none', mobile.rail);
check('mobile shows the tabs', mobile.tabs === 'grid', mobile.tabs);
check('mobile tabs sit under the stats', mobile.tabsAtTop === true);
check('mobile has no horizontal overflow', mobile.overflow <= 1, mobile.overflow);

const shot = await cdp.send('Page.captureScreenshot', {
  format: 'png',
  captureBeyondViewport: true
});
writeFileSync(join(OUTPUT, 'mobile.png'), Buffer.from(shot.data, 'base64'));

await cdp.send('Emulation.setDeviceMetricsOverride', {
  width: 1280,
  height: 1000,
  deviceScaleFactor: 1,
  mobile: false
});
await cdp.goto('/index.html');
const desktopShot = await cdp.send('Page.captureScreenshot', {
  format: 'png',
  captureBeyondViewport: true
});
writeFileSync(join(OUTPUT, 'desktop.png'), Buffer.from(desktopShot.data, 'base64'));

check('no runtime errors in the console', runtimeErrors.length === 0, runtimeErrors);

console.log(failures.length ? `\n${failures.length} failure(s)` : '\nall smoke checks passed');
process.exit(failures.length ? 1 : 0);
