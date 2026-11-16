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
  entered in a few seconds. The Board is the landing view, but Add is always one tap away
  in the footer; the entry page opens with the amount focused and the numeric keyboard up.
- **At the end of the week, on a desktop.** The weekly review is read and regret tags
  are applied. Comparatively patient, scanning, comparing.

## Product Purpose

Turn a monthly budget into hit points. Spend under it and the leftover becomes XP
when the month closes; overspend and HP (and the streak) take the hit. The point is
not bookkeeping for its own sake: it is to make this month's spending feel like it
has a consequence in the next.

Success means the owner opens it at the moment of paying without dreading it, and the
weekly review names spending they regret rather than just totalling it.

## Positioning

The monthly budget is treated as a life bar rather than a category total. Overspending
costs HP and breaks a streak; finishing under pays XP. Every transaction also carries a
regret tag, so the weekly review answers "which of this money do I wish I had back"
instead of only "how much did I spend". A spreadsheet or a standard expense tracker
cannot reproduce that loop because it has no cost for the month and no verdict on a
purchase.

## Operating Context

- Entered on a phone at a counter, often one-handed, and reviewed on a desktop later.
  Responsiveness is not cosmetic: the two contexts have different priorities.
- Three views share one document: Board (HP and this month at a glance), Add (the entry
  form), and Week (the trailing seven days). They are hash routes — `#board`, `#add`,
  `#week` — so the browser back button works, a refresh keeps the view, and static
  hosting needs no rewrite rules.
- Money is rupiah (IDR). All amounts are whole rupiah. Display formatting is `id-ID`.
- No network dependency at runtime. Everything works offline by virtue of being local.
- Data lives only in this browser's `localStorage`. Export to a JSON file is the only
  backup and the only way to move devices; import restores it.
- The owner may not open the app for several days at a stretch. Missed days must be
  handled without punishing the user retroactively.
- A month boundary closes the month: leftover budget becomes XP, the streak advances,
  and the new month starts with a bar only once its budget is set.

## Capabilities and Constraints

Confirmed rules:

- `HP this month` = `monthly budget for that month - total spending in that month`; it
  may go negative.
- Monthly XP = `0` when HP <= 0, otherwise
  `clamp(round(HP / monthly budget * 100), 1, 100)`, awarded once when the month closes.
- `dailyAllowance` = `floor(monthly budget / number of days in that month)`. It is
  guidance only — the week strip's over marker, the charts' allowance rule and day bars,
  and the "safe to spend per day" line — never the HP value.
- Level thresholds are cumulative and rising: 100 / 300 / 600 / 1,000 / 1,500 XP
  (100 XP per level step, growing by 100 each level).
- The streak advances for every closed month that ended under budget and resets on a
  closed month at or over budget. Months with no budget set are skipped entirely.
- Monthly budgets are stored per month (`YYYY-MM`), so past months stay correct.
- Transactions may be backdated. XP already awarded for a closed month is never
  recomputed.
- Regret tags: `worth` / `neutral` / `regret` / `null`.
- Weekly review covers the trailing 7 days including today, and shows total spend, the
  share of transactions tagged regret, and the category with the largest regret amount.
- The Board's "This month" section shows three read-only views of the current month:
  a daily-spend line through today with a dashed daily allowance, a category donut
  with a fixed muted pigment per category plus an amount/share legend, and a
  Monday-first calendar with each date's spend,
  over-allowance mark, and today marker. Charts cover the current month only, are static,
  and collapse to one message when nothing has been spent. They do not replace the HP bar,
  zone ramp, week strip, or regret ramp.

Explicit constraints:

- Exactly three files. No service worker, no manifest, not installable as a PWA.
- No charts library, no icon library, no CSS framework, no web fonts from a CDN. The
  month charts are hand-built SVG, HTML tables, and the existing chalk styles.
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
