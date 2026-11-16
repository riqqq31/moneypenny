# Budget HP

Your monthly budget is a life bar. Spend under it and the leftover banks XP when
the month closes; overspend, and HP (and the streak) take the hit.

- Enter a purchase in seconds on your phone at the counter; tag purchases
  Worth / Meh / Regret in the weekly review on desktop.
- The board is the landing page: HP, the bar, and today's lines, then three
  this-month charts (daily line, category donut, spend calendar) and the budget.
  A focused entry page keeps adding one tap away; the week page holds the
  trailing seven days.
- HP = this month's budget − everything spent this month. XP is banked when a
  month closes, so a missed day costs nothing.
- No accounts, no network, no tracking. Data stays in this browser's
  `localStorage`; Export JSON is the backup and the way to move devices
  (Import restores it).

## Run

```sh
npm install
npm run dev      # http://localhost:5173
```

The app is built with Vite, so it needs a local server; opening the HTML files
directly from disk will not resolve the ES modules.

## Build and test

```sh
npm run build        # static site in dist/
npm run preview      # serve dist/ locally
npm test             # rules, dates, formatting, storage normalization
npm run lint         # ESLint
npm run format:check # Prettier (JS and JSON)
```

`npm run test:smoke` drives the built app in headless Chrome or Edge: it seeds a
month of data and checks the board, add/edit/delete, week selection, the mobile
layout, and console errors. Run `npm run preview` in another terminal first.
Screenshots land in `tooling/smoke/output/`.

## Structure

```
index.html, add.html, week.html   three pages, one job each
src/
  partials/                       header, footer, week rail (inlined at build)
  css/                            tokens, base, layout, components, responsive
  js/
    core/                         config, date, format, id, storage, rules, store
    ui/                           dom, url, boot
    components/                   hp, lines, insights, charts/, budget, data, week, entry-form
    pages/                        board, add, week (Vite entry points)
tests/                            node --test
tooling/                          small Vite plugin for HTML partials
docs/                             architecture, design, product
```

`src/js/core/rules.js` holds the game rules as pure functions; nothing there
touches the DOM. `src/js/core/store.js` owns the one mutable `db` object.
Everything else renders or wires events. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
for the data flow and conventions.

## URLs

| Page | Purpose | State |
| --- | --- | --- |
| `index.html` | board | `?added=<id>`, `?deleted=1`, `#budget` |
| `add.html` | add / edit a purchase | `?id=<id>`, `?from=week&day=YYYY-MM-DD` |
| `week.html` | trailing seven days | `?day=YYYY-MM-DD` |

Query flags are transient: the page that consumes them removes them from the
address bar, so a reload does not repeat the announcement.

## Deploy (GitHub Pages)

The repository ships a workflow at `.github/workflows/pages.yml`. In the
repository settings set **Pages → Build and deployment → Source: GitHub Actions**,
then push to `main`. The build uses relative asset URLs (`base: './'`), so it
works from a project path such as `/moneypenny/` without extra configuration.

Any other static host works too: upload `dist/` after `npm run build`.

## Docs

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — layers, data flow, adding a page
- [docs/DESIGN.md](docs/DESIGN.md) — the visual system and its rules
- [docs/PRODUCT.md](docs/PRODUCT.md) — scope, users, and constraints
