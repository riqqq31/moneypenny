# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML, CSS, and vanilla JavaScript. No framework, no backend, no third-party
libraries, no build step. Three files: `index.html`, `style.css`, `app.js`.
Deploys to any static host (Vercel, Netlify, GitHub Pages).

## Users

One person: the owner of the app. No accounts, no sharing, no other roles.

Two distinct contexts, both confirmed:

- **At the point of payment, on a phone, standing, one-handed.** One transaction is
  entered in a few seconds. Big tap targets, numeric keyboard, form already open.
- **At the end of the week, on a desktop.** The weekly review is read and regret tags
  are applied. Comparatively patient, scanning, comparing.

## Product Purpose

Turn a daily budget into hit points. Spend under the budget and the leftover becomes
XP; overspend and HP (and the streak) take the hit. The point is not bookkeeping for
its own sake: it is to make today's spending feel like it has a consequence tomorrow.

Success means the owner opens it at the moment of paying without dreading it, and the
weekly review names spending they regret rather than just totalling it.

## Positioning

The daily budget is treated as a life bar rather than a category total. Overspending
costs HP and breaks a streak; staying under pays XP. Every transaction also carries a
regret tag, so the weekly review answers "which of this money do I wish I had back"
instead of only "how much did I spend". A spreadsheet or a standard expense tracker
cannot reproduce that loop because it has no cost for today and no verdict on a
purchase.

## Operating Context

- Entered on a phone at a counter, often one-handed, and reviewed on a desktop later.
  Responsiveness is not cosmetic: the two contexts have different priorities.
- Money is rupiah (IDR). All amounts are whole rupiah. Display formatting is `id-ID`.
- No network dependency at runtime. Everything works offline by virtue of being local.
- Data lives only in this browser's `localStorage`. Export to a JSON file is the only
  backup and the only way to move devices; import restores it.
- The owner may not open the app for several days at a stretch. Missed days must be
  handled without punishing the user retroactively.
- A month boundary changes the daily budget (different day count) and requires the
  monthly budget to be set again.

## Capabilities and Constraints

Confirmed rules:

- `dailyBudget` = `floor(monthly budget for that month / number of days in that month)`
- `HP today` = `dailyBudget - total spending today`; it may go negative.
- Daily XP = `min(floor(max(HP, 0) / 1000), 100)`, awarded only on days the app was opened.
- Level thresholds are cumulative and rising: 100 / 300 / 600 / 1,000 / 1,500 XP
  (100 XP per level step, growing by 100 each level).
- The streak breaks only when HP <= 0 on a day the app was opened. Days the app was
  not opened neither award XP nor break the streak.
- Monthly budgets are stored per month (`YYYY-MM`), so past months stay correct.
- Transactions may be backdated. XP already awarded for a past day is never recomputed.
- Regret tags: `worth` / `neutral` / `regret` / `null`.
- Weekly review covers the trailing 7 days including today, and shows total spend, the
  share of transactions tagged regret, and the category with the largest regret amount.

Explicit constraints:

- Exactly three files. No service worker, no manifest, not installable as a PWA.
- No charts library, no icon library, no CSS framework, no web fonts from a CDN.
- No analytics, no network calls, no accounts.

Undecided:

- The app's name. "Budget HP" is a working title only and must live in one place in the
  code so it can be changed without a search-and-replace through the UI.
- Whether synthetic demo data is used for visual verification.

## Brand Commitments

- UI copy is English.
- The game framing is binding: HP, XP, level, and streak are the product's vocabulary
  and may not be softened into generic progress bars or "savings goals".
- Currency stays IDR.
- No invented financial claims, testimonials, benchmarks, or user counts.

## Evidence on Hand

None. There are no real users, testimonials, press, screenshots, or historical data.
Any demonstration data authored for verification must be labelled synthetic.

## Product Principles

1. **The bar is the product.** HP is the first thing read, at a glance, before any list.
2. **Fast in, honest out.** Entering a purchase must never cost more taps than the
   purchase's consequence is worth; the review must never flatter.
3. **No punishment for absence.** Forgetting to open the app is not a financial failure.
4. **Regret is data, not shame.** The review reports patterns and names categories; it
   never scolds the owner.
5. **Local and portable.** The data belongs to the browser, and the exit door (export)
   is always visible.
