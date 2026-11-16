# Architecture

Budget HP is three static pages sharing one small component library. There is no
framework and no backend: the browser holds the data, and the build only bundles
what is already plain JavaScript and CSS.

## Layers

| Layer | Location | Responsibility |
| --- | --- | --- |
| Pages | `src/js/pages/*.js` | Vite entry points. Boot the page, read the URL, render, wire navigation. |
| Components | `src/js/components/**` | Render one piece of UI and report back through callbacks. No routing. |
| UI helpers | `src/js/ui/**` | DOM access, announcements, page boot, query-string helpers. |
| Core | `src/js/core/**` | Constants, dates, formatting, storage validation, game rules, the store. |
| Styles | `src/css/**` | Tokens, base, layout, one file per component, responsive rules last. |

Dependencies point downward only: pages import components, components import
core and ui, core imports nothing from the UI.

## Data flow

```
localStorage ──load()──► store.db ──► rules (pure) ──► components ──► DOM
                              ▲                                        │
                              └──────── commit() / replace() ◄─────────┘
                                      tick + save
```

- `core/store.js` exports `db` as a **live ES module binding**. Importers always
  read the current object; `replace()` swaps it after an import.
- Mutations happen in components (`entry-form`, `week` tags, `budget`), then call
  `commit()` from the store. `commit()` runs `tick(db)` and persists.
- `core/rules.js` never imports the store. Every function takes the ledger it
  reads (`budgetFor(db, mk)`), which keeps the rules testable in Node.

## Page lifecycle

1. The page module calls `boot({ page, title })` from `ui/boot.js`. This sets the
   title, fills `[data-app-name]`, marks the current nav link, runs the
   month-closing `tick`, and renders the header stats.
2. The page reads its query string with `ui/url.js` and renders its components.
3. Transient flags (`?added`, `?deleted`) are announced once and then removed
   with `history.replaceState`.

There is no global application state. The selected week day, the edit target,
and the "just added" highlight all live in the URL or in a page-local variable.

## URLs

| Page | Parameters | Notes |
| --- | --- | --- |
| `index.html` | `added`, `deleted`, `#budget` | `added` highlights a line and announces it, then is consumed. |
| `add.html` | `id`, `from=week`, `day` | `id` opens the edit mode; `from=week` returns to the week page after saving. |
| `week.html` | `day` | Rewritten with `replaceState` when another day is selected. |

Links are relative (`add.html`, `index.html#budget`) so the same build works at a
domain root and under a GitHub Pages project path.

## Storage

One key, `budget-hp.v1`, holding:

```json
{
  "version": 1,
  "settings": { "startDate": "2026-11-16", "budgets": { "2026-11": 3100000 } },
  "transactions": [
    {
      "id": "m3k9-4f2a1c",
      "amount": 25000,
      "category": "food",
      "note": "warung",
      "date": "2026-11-16",
      "regretTag": "worth",
      "createdAt": 1763270400000
    }
  ],
  "game": { "xp": 120, "streak": 2, "longestStreak": 3, "lastProcessedMonth": "2026-10" }
}
```

`core/storage.js#normalize` is the only place that trusts imported data. It
validates months, transactions and counters, and falls back to `fresh()` for a
malformed file. The export format is the same object, so old backups keep
working.

## Game rules

- `hpThisMonth = budget - spendInMonth`; it may go negative.
- A closed month banks `xpForMonth(leftover, budget)`: the leftover percentage,
  clamped to 1–100 (one level step per perfect month).
- `levelInfo(xp)` follows `level = floor((1 + sqrt(1 + 0.08·xp)) / 2)`, with
  thresholds `50·(n−1)·n` and `50·n·(n+1)`.
- `tick(db)` scores every completed month that has a budget and has not been
  scored, advancing `lastProcessedMonth`. A fresh ledger starts at the previous
  month so legacy XP is not rescored.

## Adding a page

1. Create `pages/<name>.js` calling `boot({ page: '<name>', title: '…' })`.
2. Create `<name>.html` at the repository root with the shared partials and a
   `<script type="module" src="/src/js/pages/<name>.js">`.
3. Register it in `vite.config.js` under `build.rollupOptions.input`.
4. Add `body.page-<name>` rules to `src/css/responsive.css` if the layout
   differs, and a nav link with `data-nav="<name>"` if it belongs in the tabs.

## Adding a chart

Charts live in `components/charts/` and receive already-computed data from
`components/insights.js`. Keep them stateless: take a host element and numbers,
draw, return nothing. Add the markup to `index.html` and the CSS to
`components/insights.css`.

## CSS

`src/css/main.css` imports the modules in cascade order; there is no preprocessor.
Tokens are plain custom properties in `tokens.css`. Component files follow the
markup order, and all media queries live in `responsive.css` so breakpoints can
be reviewed together. Page-specific layout is keyed on `body.page-board`,
`body.page-add` and `body.page-week`.

## Testing

`npm test` runs `node --test` against the pure modules: date math, formatting,
rules and storage normalization. Components are thin DOM writers, so they are
covered end to end instead: `npm run test:smoke` drives the built site in
headless Chrome/Edge with CDP (board render, add, edit, delete, week selection,
mobile layout, console errors) and writes screenshots to `tooling/smoke/output/`.

## Conventions

- ES modules, named exports, no default exports.
- Two-space indent, single quotes, semicolons; Prettier owns JS/JSON formatting.
- CSS stays hand-tuned, one rule per line, and is excluded from Prettier.
- Comments explain intent or a constraint, not the syntax.
