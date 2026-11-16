# Budget HP

Your monthly budget is a life bar. Spend under it and the leftover banks XP when
the month closes; overspend, and HP (and the streak) take the hit.

- Enter a purchase in seconds on your phone at the counter; tag purchases
  Worth / Meh / Regret in the weekly review on desktop.
- The Board is the landing view: HP, the bar, and today's lines, then three
  this-month charts (daily line, category donut, spend calendar) and the budget.
  Add purchase opens a focused entry view (`#add`) with the amount already focused;
  the footer keeps it one tap away, and `#week` holds the trailing seven days.
- HP = this month's budget − everything spent this month. XP is banked when a
  month closes, so a missed day costs nothing.
- No accounts, no network, no tracking. Data stays in this browser's
  `localStorage`; Export JSON is the backup and the way to move devices
  (Import restores it).

## Run

Static — no build step, no dependencies. Open `index.html`, or host the
folder on any static host.

## Deploy (GitHub Pages)

Push this repo, then: **Settings → Pages → Deploy from a branch → `main` / root.**

## Structure

Three files only, on purpose:

- `index.html` — markup
- `style.css` — the whole visual system (see `DESIGN.md`)
- `app.js` — rules engine, storage, export/import

The app's display name lives in one place (`APP_NAME` in `app.js`).
