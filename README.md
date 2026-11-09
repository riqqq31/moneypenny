# Budget HP

Your daily budget is a life bar. Spend under it and the leftover banks XP;
overspend, and HP (and the streak) take the hit.

- Enter a purchase in seconds on your phone at the counter; tag purchases
  Worth / Meh / Regret in the weekly review on desktop.
- Daily budget = monthly budget ÷ days in that month. XP is only awarded on
  days you open the app — a missed day costs nothing.
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
