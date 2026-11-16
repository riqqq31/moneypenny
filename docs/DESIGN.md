---
name: Budget HP
description: A monthly budget as hit points, chalked on a warung price board.
colors:
  amber: "#E8B33A"
  rust: "#E05A44"
  rust-text: "#E46450"
  board-black: "#14150F"
  board-raised: "#1E2016"
  board-warm: "#1B1D14"
  chalk: "#F2F0E6"
  chalk-dim: "#A8A69B"
  chalk-placeholder: "#8F8D82"
  chalk-rule: "rgba(242, 240, 230, 0.16)"
  chalk-rule-strong: "rgba(242, 240, 230, 0.30)"
  chalk-control: "rgba(242, 240, 230, 0.36)"
  chalk-control-strong: "rgba(242, 240, 230, 0.55)"
  chart-food: "#A8B98D"
  chart-transport: "#83A9BE"
  chart-shopping: "#C98E7E"
  chart-fun: "#B79BC6"
  chart-bills: "#CFB06B"
  chart-other: "#9DA096"
typography:
  display:
    fontFamily: "Oswald, Arial Narrow, Helvetica Neue, sans-serif"
    fontSize: "clamp(72px, 8.4vw, 118px)"
    fontWeight: 600
    lineHeight: 0.9
    letterSpacing: "-0.02em"
  display-compact:
    fontFamily: "Oswald, Arial Narrow, Helvetica Neue, sans-serif"
    fontSize: "clamp(54px, 17vw, 84px)"
    fontWeight: 600
    lineHeight: 0.9
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Oswald, Arial Narrow, Helvetica Neue, sans-serif"
    fontSize: "62px"
    fontWeight: 600
    lineHeight: 0.86
    letterSpacing: "-0.02em"
  headline-compact:
    fontFamily: "Oswald, Arial Narrow, Helvetica Neue, sans-serif"
    fontSize: "54px"
    fontWeight: 600
    lineHeight: 0.86
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Oswald, Arial Narrow, Helvetica Neue, sans-serif"
    fontSize: "23px"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "0.03em"
  title-compact:
    fontFamily: "Oswald, Arial Narrow, Helvetica Neue, sans-serif"
    fontSize: "19px"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "0.03em"
  amount:
    fontFamily: "Oswald, Arial Narrow, Helvetica Neue, sans-serif"
    fontSize: "clamp(28px, 8vw, 36px)"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "0em"
  amount-compact:
    fontFamily: "Oswald, Arial Narrow, Helvetica Neue, sans-serif"
    fontSize: "clamp(26px, 7vw, 32px)"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "0em"
  amount-desktop:
    fontFamily: "Oswald, Arial Narrow, Helvetica Neue, sans-serif"
    fontSize: "26px"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "0em"
  amount-prefix:
    fontFamily: "Oswald, Arial Narrow, Helvetica Neue, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.04em"
  brand:
    fontFamily: "Oswald, Arial Narrow, Helvetica Neue, sans-serif"
    fontSize: "26px"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "0.16em"
  brand-compact:
    fontFamily: "Oswald, Arial Narrow, Helvetica Neue, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "0.16em"
  body:
    fontFamily: "Source Sans 3, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  label:
    fontFamily: "Oswald, Arial Narrow, Helvetica Neue, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.22em"
rounded:
  none: "0px"
spacing:
  xxs: "4px"
  xs: "8px"
  sm: "12px"
  md: "18px"
  lg: "24px"
  xl: "32px"
  2xl: "44px"
components:
  button-primary:
    backgroundColor: "rgba(242, 240, 230, 0.05)"
    textColor: "{colors.chalk}"
    rounded: "{rounded.none}"
    padding: "14px 22px"
  button-primary-hover:
    backgroundColor: "rgba(242, 240, 230, 0.14)"
    textColor: "{colors.chalk}"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.chalk-dim}"
    borderColor: "{colors.chalk-control}"
    rounded: "{rounded.none}"
    padding: "14px 22px"
  button-danger:
    backgroundColor: "transparent"
    textColor: "{colors.rust-text}"
    borderColor: "rgba(224, 90, 68, 0.50)"
    rounded: "{rounded.none}"
    padding: "14px 22px"
  tab-active:
    backgroundColor: "transparent"
    textColor: "{colors.chalk}"
    padding: "6px 0"
  field-underline:
    backgroundColor: "transparent"
    textColor: "{colors.chalk}"
    rounded: "{rounded.none}"
    padding: "8px 0"
  tag-worth:
    backgroundColor: "rgba(232, 179, 58, 0.13)"
    textColor: "{colors.amber}"
    rounded: "{rounded.none}"
    padding: "7px 9px"
  tag-regret:
    backgroundColor: "transparent"
    textColor: "{colors.rust-text}"
    borderColor: "{colors.rust-text}"
    rounded: "{rounded.none}"
    padding: "7px 9px"
  day-cell:
    backgroundColor: "transparent"
    textColor: "{colors.chalk}"
    rounded: "{rounded.none}"
    padding: "11px 3px 9px"
  hp-bar:
    backgroundColor: "{colors.chalk}"
    rounded: "{rounded.none}"
    height: "30px"
    width: "100%"
---

# Design System: Budget HP

## Overview

**Creative North Star: "The Warung Chalkboard."**

Budget HP is one continuous chalkboard behind a warung counter, not a finance dashboard wearing a theme. The month is read as a single chalk numeral before anything else: what is left of this month's budget. The arithmetic that produced it sits directly beneath, with the spent amount struck through like a corrected price. The bar is the same money as a physical quantity of chalk, and spending erases it from the right. Purchases below are a price board: category, note, a dotted leader, and a right-aligned amount in tabular figures.

Nothing floats above the board. There are no cards, panels, filled surfaces, rounded corners, or drop shadows. Grouping comes from spacing, 1px hairlines, and dashed rules that deliberately stop short of the right edge, so the composition reads as one board rather than a stack of containers. Depth is tonal, not lifted: the ground is almost black with a green-warm radial light that moves from the top-left to the bottom-right.

Three views share one board. On a phone at the counter the Board is the landing view: HP, the arithmetic, the bar, and one full-width Add purchase button. Add is a separate focused view with the form, reached in one tap and opened with the amount focused. Week becomes a segmented control. On desktop the board keeps the hero on the left and adds a 370–430px review rail with the week strip, the selected day's purchases, and the regret verdict; Add keeps that rail for context.

**Key Characteristics:**
- One continuous board; no cards, panels, radii, or shadows.
- HP numeral first, always followed by the arithmetic that produced it.
- Chalk is money remaining; amber is earned status; rust is cost and regret.
- Condensed signwriter labels and numerals over humanist prose.
- Rules stop 6–8% short of the right edge; dashed dividers and dotted leaders carry the ledger.
- Flat at rest; depth is tonal light on the board, never elevation.

## Colors

A near-black green board, two chalk whites, and two signal chalks that carry every piece of meaning. The palette stays within the board's own materials: no color appears that chalk or a painted sign could not produce.

### Primary
- **Signal Amber** (#E8B33A): Level, streak, XP, the leading edge of the bar, the active zone step, worth tags, focus rings, caret, and text selection. Amber is earned status; its scarcity is what makes it read.

### Secondary
- **Rust Chalk** (#E05A44): Overspend, negative HP, the over-budget hatch, and the 62px regret percentage. Large display marks only. Rust is always a cost signal, never decoration.
- **Rust Text** (#E46450): The small-text rust. Regret tags, struck regret amounts, over-budget strip values, day-state "over", error sentences, and danger button labels. It measures 5.45:1 on Board Black and 4.90:1 on Board Raised, so 11–13px rust copy clears 4.5:1 where #E05A44 does not.

### Neutral
- **Board Black** (#14150F): The page ground. Fixed radial light lifts the field toward Board Raised at the top-left and toward Board Warm at the bottom-right.
- **Board Raised** (#1E2016): The lighter stop of the ground's top-left radial.
- **Board Warm** (#1B1D14): The bottom-right radial stop, a half-step warmer than the ground.
- **Chalk** (#F2F0E6): Primary text, the HP numeral, purchase notes, and the remaining chalk in the bar.
- **Chalk Dim** (#A8A69B): Labels, secondary copy, unlit ramp steps, and inactive navigation.
- **Chalk Placeholder** (#8F8D82): Input placeholders, one step darker than dim so an empty field never reads as an entered value.
- **Chalk Rule** (rgba(242, 240, 230, 0.16)): Dashed ledger dividers, section rules, and other purely decorative hairlines. 1.55:1, never an interactive boundary.
- **Chalk Rule Strong** (rgba(242, 240, 230, 0.30)): The bar's top and bottom edges and other non-interactive 1.5px marks. 2.52:1, still not an interactive boundary.
- **Chalk Control** (rgba(242, 240, 230, 0.36)): The boundary of anything you can operate: field underlines, chips, tags, day cells, quiet buttons, the mobile tab group, and the back link. 3.05–3.08:1 against the board.
- **Chalk Control Strong** (rgba(242, 240, 230, 0.55)): The hover step for those same control boundaries.

### Chart Pigments
Six muted, chalk-mixed pigments identify the six purchase categories in the month donut and its legend:

- **Sage** (#A8B98D): Food.
- **Dusty Blue** (#83A9BE): Transport.
- **Clay** (#C98E7E): Shopping.
- **Mauve** (#B79BC6): Fun.
- **Ochre** (#CFB06B): Bills.
- **Stone** (#9DA096): Other.

They are identity, not status. A category keeps its pigment across months even when slice order changes, and no pigment leaves the chart: buttons, tags, rules, bars, and day states stay chalk, amber, or rust. The colors are desaturated so they sit on the board as pigment rather than as a second interface palette.

### Named Rules
**The Two Chalk Rule.** Only amber and rust carry meaning. Amber marks what was earned or is at stake; rust marks money spent against you. Everything else is chalk on board, apart from the six category pigments, which carry identity inside the donut only.

**The Amber Is Earned Rule.** Amber never becomes a background wash or a decorative accent. If it appears, it is reporting level, streak, XP, worth, focus, or the bar's current edge.

**The 3:1 Boundary Rule.** A border that is the only visible edge of a control must clear 3:1. Decorative rules may stay faint, so interactive controls use Chalk Control (3.05–3.08:1), never Chalk Rule or Chalk Rule Strong. Hover states use Chalk Control Strong.

**The Two Rusts Rule.** `--rust` (#E05A44) is for large display marks: the HP numeral when negative, the regret percentage, the hatch, and the over-budget bar. Anything set at 11–13px uses `--rust-text` (#E46450). Never put small rust text on a rust-tinted fill; the tint lifts the background and spends the contrast gain, so selected regret tags are transparent with a rust border.

## Typography

**Display Font:** Oswald (with Arial Narrow and Helvetica Neue fallbacks)
**Body Font:** Source Sans 3 (with system-ui fallbacks)

**Character:** A condensed signwriter face carries every number, label, and button; a humanist sans carries the owner's notes and prose. The board speaks in shouted, tracked-out capitals and tabular figures; the person speaks in quiet sentences.

### Hierarchy
- **Display** (600, clamp(72px, 8.4vw, 118px), 0.9, -0.02em): The HP numeral only. It shrinks to clamp(54px, 17vw, 84px) under 720px. When the formatted value plus its `Rp` prefix would overflow the column, JavaScript measures the nowrap line and sets `--hp-size` to the largest size that fits. The numeral is never shrunk pre-emptively, so an ordinary budget keeps the full display size. The small `Rp` prefix is weight 300 at clamp(14px, 0.3em, 40px), aligned to the numeral's upper third.
- **Headline** (600, 62px, 0.86, -0.02em): The regret percentage in the weekly review; 54px on mobile.
- **Title** (600, 23px, 1.05, 0.03em): Level, streak, and XP values in the header, plus day totals in the rail; 19px on phones. Amounts in the ledger use the same face at 19px.
- **Amount** (500, clamp(28px, 8vw, 36px), 1.25): The entry form's amount — the largest type below the HP numeral. It drops to 26px from 720px up and to clamp(26px, 7vw, 32px) below 390px, always with tabular figures and a 15px `Rp` prefix.
- **Brand** (600, 26px, 1.05, 0.16em, uppercase): The wordmark; 22px under 720px and 19px below 360px on the compact step.
- **Body** (400, 16px, 1.5): Purchase notes, form values, and explanatory copy. Fine print drops to 12px/1.6 and holds a 64ch measure; notes cap at 34ch on the ledger.
- **Label** (500, 11px, 1.4, 0.22–0.26em, uppercase): Section headers, field labels, tags, buttons, strip days, and footer actions. Buttons use 0.20em; section headers use 0.24–0.26em.

### Named Rules
**The Tabular Numeral Rule.** Every amount, percentage, count, and date uses `font-variant-numeric: tabular-nums` in Oswald. Columns must line up on the board; proportional figures break the price-board read.

**The One Voice Rule.** Prose never sets in Oswald, and figures never set in Source Sans 3. A number belongs to the board; a sentence belongs to the owner.

## Layout

The board is full-bleed and has no maximum width. On desktop the header runs 26px from the top with 40px side padding; the main area splits into a fluid left column and a review rail of `minmax(370px, 430px)`, separated by a 1px vertical rule with 44px of padding and margin. Below 1024px the rail folds behind the Week tab and the page becomes a single column.

The Board reads top to bottom: HP numeral, arithmetic, bar and scale, zone ramp, XP note, today's summary and the Add purchase button, today's ledger, this month's charts, monthly budget, and data actions. The bar is what the next purchase changes, so the button that logs it sits directly beneath the note. The charts sit after the ledger and before the budget: they answer "how did this month get here" without displacing the bar or the weekly review.

Add is its own view behind `#add`. It carries a Back to board link, then the entry form, then a projection line — "After this: HP 2.045.000, still under budget" — computed from the amount being typed. The form has no ledger or budget blocks competing with it, and the footer is hidden so the task owns the screen.

The form is ordered by what the hand does. On phones the amount takes the full width and leads the block, the category chips follow on their own full-width row, then note and date share a row, then a full-width submit. From 720px up the amount, note, and date sit in one row at `1.1fr 1.7fr .9fr` with the chip row spanning beneath them. The grid uses named areas, so the DOM order never changes between the two layouts.

Page gutters are 40px on desktop and 18px on phones. On the Board and Week, main content reserves 118px at the bottom (108px on phones) for the fixed footer, which keeps Add purchase, Export JSON, and Set budget one tap away. The same reserve is declared as `scroll-padding-bottom` on `html` (118px, 108px under 720px), so a focused control is never scrolled underneath the fixed footer. Add reserves only 52px because its footer is hidden. Vertical rhythm is deliberately uneven: 28–30px between related blocks, 44–54px before a new section. The fixed footer carries a 22px gradient scrim into the board so ledger lines fade rather than collide with it.

`viewport-fit=cover` is on, so the header and skip link add `env(safe-area-inset-top)` to their top padding and the footer adds `env(safe-area-inset-bottom)` to its bottom padding. The fixed background attachment is dropped under 720px, where it causes scroll jank on mobile Safari; the radial ground still fills the viewport.

Views are hash routes: `#board` (default), `#add`, `#week`. The back button, refresh, and deep links all work without a server. On phones only one view is visible; desktop shows Board and Week side by side, and Add replaces Board while keeping the Week rail.

Breakpoints, in use:
- **359px and below:** tighter wordmark, smaller stat values, reduced header gaps, and tighter footer gaps.
- **719px and below:** stacked header with segmented Month/Week control, phone gutters, compact ledger rows, 40px tag targets. The amount spans the form, chips sit in a 3×2 grid, the submit is full width at 48px, the zone ramp is hidden, and Add hides the footer entirely.
- **389px and below:** tighter main padding, section margins, and form gaps so the submit still clears the footer on small phones.
- **Short phones (≤640px tall):** tighter Board CTA spacing so the button clears the fixed footer without shrinking the HP numeral.
- **1023px / 1024px:** the single-column/mobile mode changes to the two-column desktop board; tabs disappear. Add keeps the Week rail and hides only the Board.
- **720–1023px:** the line chart spans the board; the donut and calendar sit side by side at 210–270px plus the remaining width.
- **1024–1279px:** the line spans the board, the donut turns ring-plus-legend at 240px + 1fr, and the calendar stacks beneath.
- **1280px and up:** the line spans the board; the donut takes 230–290px with the calendar beside it.
- **719px and below:** all three charts stack; the calendar keeps 40px cells and 9px compact amounts.
- **720px and up:** amount, note, and date share one row; the six chips return to a single wrapping flex row.

## Elevation & Depth

The system is flat by default and uses no drop shadows. Depth is tonal: a fixed two-radial ground lightens the board at the top-left and warms a corner at the bottom-right; 1px hairlines and dashed rules separate without lifting; the fixed footer uses a 22px gradient scrim. The bar's amber edge carries a small radial glow, but it reads as a light source on the board, not as elevation.

The one `box-shadow` in the stylesheet is `inset 0 -3px 0` on today's day cell. It is a state marker, not depth, and should not be copied as an elevation recipe.

### Named Rules
**The No-Card Rule.** Nothing is a card. There is no panel surface, no radius, no shadow, and no container border. Grouping is spacing plus a rule.

**The Flat Board Rule.** If something needs to separate from the board, lighten the ground by a few percent or draw a hairline. Never add a drop shadow.

## Shapes

The form language is square and ruled. Every interactive shape is a rectangle with a 0px radius: buttons, tags, day cells, inputs, and the bar. Borders are 1px or 1.5px; state marks are 3px bars; ledger rows are separated by 1px dashed rules; amounts connect to their labels with a 2px dotted leader. Tags are compact outlined boxes, never pills; category chips are the same box at form size.

Horizontal rules stop short of the right edge by design: 6% on the header rule and 8% on section rules, so the board never looks boxed in. The only round marks are the 1px dots of the bar track; everything else is rectilinear apart from the browser's native date-picker glyph.

**The Hairline That Stops Short Rule.** A full-width rule turns the page into a table. End horizontal rules 6–8% before the right edge so the board remains one field.

## Components

### Buttons
- **Shape:** Square, 0px radius, 1.5px border, uppercase Oswald 11px with 0.20em tracking, 14px × 22px padding.
- **Primary:** Chalk border with a 5% chalk wash; hover raises the wash to 14% and turns the label white.
- **Quiet:** 36% chalk control border and dim label; hover restores the chalk label and strengthens the border to 55%.
- **Danger:** 50% rust border and rust-text label; hover adds a 12% rust wash.
- **Hover / Focus:** Background, border, and color transition over 180ms with cubic-bezier(0.16, 1, 0.3, 1); active state presses down 1px. Focus is a 2px amber outline with a 3px offset.

### Inputs / Fields
- **Style:** No box and no fill. A single 1.5px Chalk Control underline under an Oswald 11px tracked label. The amount is the hero field: Oswald 26px tabular figures on desktop, `clamp(28px, 8vw, 36px)` on phones, with a 15px `Rp` prefix on the baseline. Every other field sets Source Sans 3 16px.
- **Amount entry:** Digits group live into `id-ID` thousands as they are typed — `25000` reads `25.000` — and the caret stays on the same digit, so the field matches the price board and the ledger before submission.
- **Focus:** The underline turns chalk and the `Rp` prefix brightens from dim to chalk; the caret is amber and the browser outline is removed because the underline carries focus.
- **Error:** A rust-text sentence sits between the grid and the action row, full width, so it is never squeezed beside a button. It occupies no space when empty and is announced with `role="alert"`. The invalid field is marked `aria-invalid`, turns rust-text, is linked through `aria-describedby`, and takes focus. The budget field follows the same pattern with its own error line.
- **Edit state:** The form takes a 2px chalk left rule and 14px of left padding, and the heading turns chalk, so an edit never looks like a fresh entry.
- **Date:** Native picker on a `color-scheme: dark` root, so the glyph and panel are drawn dark without a filter; dates cannot exceed today. Note carries a small dim `optional` label instead of an `optional` placeholder.
- **Phone actions:** The primary button is full width and 48px tall; Cancel and Delete split the row beneath it at 44px. Delete asks for confirmation before removing anything.

### Category Chips
- **Shape:** Six outlined rectangles — Food, Transport, Shopping, Fun, Bills, Other — 1px Chalk Control border, 0px radius, Oswald 11px uppercase at 0.12em, 40px minimum height. These are the same object language as tags.
- **Selected:** Chalk label, chalk border, and an 8% chalk wash. Hover lifts the label and border to Chalk Control Strong.
- **Mechanism:** Native radios, visually hidden but still focusable, with the label drawn as the chip. Arrow keys move the selection and the checked chip takes a 2px amber outline at a 3px offset.
- **Layout:** Three equal columns in a 3×2 grid on phones; a single wrapping flex row from 720px up. One tap selects, replacing the old native dropdown.

### Navigation
- **Desktop:** Level, streak, and XP sit at the far right of the header; Month/Week tabs are hidden because both columns are visible.
- **Tablet / Phone:** Month/Week becomes a two-column segmented control below the header. Oswald 12px, 0.22em tracking, dim at rest, chalk when pressed, with a 3px amber top rule and a 5% chalk wash on the active segment; each hit area is at least 44px tall. Add is not a tab: it is a route reached from the CTA, and its header tabs are hidden so there is one clear way out.
- **Day strip:** Seven equal cells with 1px Chalk Control borders in the review rail. The selected day takes a chalk border and 6% wash; today gets an inset 3px amber bottom rule; an over-budget day gets a rust bottom bar and rust-text value. Rebuilding the strip preserves keyboard focus on the chosen day.

### Board CTA
- **Shape:** A full-width primary button under the HP note, capped at 420px on wide screens, 54px minimum height on desktop and 56px on phones. Chalk border, 5% chalk wash, Oswald 11px at 0.24em.
- **Context line:** Above the button, "2 purchases today · 325.000" in 13px muted body type, with counts and amounts in chalk. Empty days read "Nothing logged today yet."
- **Behavior:** Opens `#add` and focuses the amount, so the numeric keyboard comes up in the same tap.

### Add View
- **Shape:** Back to board link, a 12px tracked page label, then the form. No ledger, budget block, or data actions.
- **Back link:** Text only, Oswald 11px at 0.18em, dim with a 1px underline; 44px hit area. Browser back and Esc do the same thing.
- **Projection:** A single dim sentence under the fields that recalculates on every keystroke: "After this: HP 2.045.000, still under budget", "After this: HP 0, the bar is empty", or "After this: 870.000 over budget" in rust-text. Editing a purchase excludes its old amount from the calculation. It is not a live region; it is read once on blur so typing is not narrated digit by digit.
- **Footer:** Hidden in this view. The form's own submit is the only primary action.

### Persistent Footer
- **Shape:** A fixed full-width band with a 1px top rule and a 22px gradient scrim rising above it. Add purchase is an outlined button at 40px minimum height; Export JSON and Set budget are plain text buttons; the month and day count sit at the right and disappear on phones. Below 360px the action type tightens and the Add padding narrows so all three actions still fit one row.
- **Behavior:** All three stay reachable while the Board or Week scrolls. Set budget returns to the Board, scrolls the budget block into view, and focuses the field. The footer is hidden on Add.

### Tags
- **Style:** Outlined rectangles, 1px Chalk Control border, Oswald 11px uppercase with 0.12em tracking, no radius.
- **State:** Selected Worth It = amber label, amber border, 13% amber wash. Selected Regret = rust-text label, rust-text border, transparent fill. Selected Meh = chalk label, chalk border, 10% chalk wash. On phones each tag is at least 40px tall. Tag clicks preserve keyboard focus on the same tag after the day re-renders.

### HP Bar (Signature)
- **Shape:** A 30px band with 1.5px Chalk Rule Strong top and bottom edges and no side borders; a 10px dotted chalk track runs behind the fill.
- **Fill:** Chalk, with two soft radial highlights that suggest chalk dust. The fill is the HP that remains, so it retreats from the right as spending grows; a 2px amber edge marker with a radial glow sits at the fill's end.
- **Over budget:** The fill and edge disappear and the entire band becomes a rust diagonal hatch at 34% opacity, with rust labels beneath. No partial fill is shown, because a partial fill would imply remaining money.
- **Scale:** Eleven zone steps below the bar, one lit amber at the current zone; an in-rail label reads `zone 4/10`, `over`, `empty`, or `no budget`. The zone is also spoken in the bar's `aria-label`, since the ramp itself is `aria-hidden`.

### Ledger Line (Signature)
- **Shape:** A six-column row: 86px category, note, dotted leader, right-aligned amount, 84px tag, edit action. Rows are separated by a 1px dashed Chalk Rule.
- **Type:** Category and tag in Oswald 11px uppercase; note in Source Sans 3 15px capped at 34ch; amount in Oswald 19px tabular.
- **State:** A regret-tagged row strikes its amount in rust-text. New rows animate in with a 550ms left-to-right chalk wipe.
- **Note overflow:** Notes wrap rather than truncate, at any width. The note distinguishes one purchase from another, so it is never clipped to a single ellipsised line. Long unbroken strings break with `overflow-wrap: anywhere`.
- **Edit target:** The desktop Edit action is at least 24×24px with 6px vertical padding, meeting the WCAG 2.2 target minimum without enlarging the visible type; phones use a 40×40 target.
- **Phone:** Reflows to two rows: note, leader, and amount on the first line; category, tag, and edit on the second, with no boxes around the tag.

### Regret Block (Signature)
- **Shape:** A rust percentage at 62px, followed by "n of n purchases you'd take back" in 12px muted body type.
- **Category ramp:** Up to three categories ranked by regret amount, each a full-width row with a rust bottom border. Amounts step down 30px / 23px / 18px, with the category label right-aligned in Oswald 11px.
- **Copy:** Reports patterns, never scolds. "Every purchase tagged" replaces the untagged count when the week is complete.

### Month Insights (Signature)
- **Placement:** A "This month" section after Today's lines and before Monthly budget. It never replaces the bar, the zone ramp, the week strip, or the regret ramp; it is a read-only layer beneath them.
- **Header:** A dim 12px line reports purchases, total spent, the peak day, and any days over the daily allowance, with figures in chalk and the over count in rust-text. When no budget exists it says so in words instead of drawing a misleading allowance.
- **Daily line:** A full-width hand-built SVG polyline in chalk from day 1 through today. The daily allowance is a 1.5px dashed 42% chalk rule; days over it are 3px rust dots; today is a 3.6px amber dot. There is no fill and no animation. Only day 1, the midpoint, and today are labelled, in 9px Oswald. The line stops at today, so the future is never implied.
- **Category donut:** A 220-unit SVG ring (r 74, 24px stroke) split clockwise by category, largest first. Each category keeps a fixed muted pigment — sage, dusty blue, clay, mauve, ochre, stone — so color maps to category and never to slice rank; 2px gaps separate neighbours. The center carries "Rp spent" and the exact total. The legend below is the accessible source of truth: a pigment swatch, the category, the full amount, and the rounded share. Swatch color is decorative reinforcement; the label always carries the meaning.
- **Calendar:** A real table with a screen-reader caption, Monday-first weeks, and one-letter weekday headers backed by full `aria-label`s. Each day shows its number and a compact `fmtShort` amount; a 2px bar tracks spend against the daily allowance. Days over allowance take rust text and a rust bar; today takes an amber number and a 2px amber top rule; future days dim their number and show no amount. Every cell carries an `sr-only` sentence with the full date, amount, and status. It is static in this version — no selection or drill-down.
- **Empty state:** When the month has no spending, the three frames are hidden and one sentence takes their place. A blank chart grid is never shown.
- **Responsive:** The line always spans the board. The donut and calendar pair from 720–1023px and from 1280px up; at 1024–1279px the ring and legend sit side by side with the calendar beneath; below 720px everything stacks. At 320px the calendar keeps roughly 38px of usable cell width with 9px amounts, and the page never scrolls sideways.

## Accessibility

The board is dark, tracked, and condensed, so the accessibility floor is explicit rather than implied.

- **Contrast:** Chalk, dim, placeholder, amber, rust, and rust-text all clear 4.5:1 on both board stops. Chalk Rule and Chalk Rule Strong are decorative only; every interactive boundary uses Chalk Control at 3.05–3.08:1.
- **Focus:** Every control takes a 2px amber outline at a 3px offset through `:focus-visible`. Routed headings (`#today-h`, `#entry-h`, `#week-h`) are programmatically focusable with `tabindex="-1"` and keep a visible ring; only `<main>` suppresses the ring on a skip-link landing.
- **Focus persistence:** Re-rendering never drops focus. The week strip restores focus to the selected day, and tag clicks restore focus to the same tag, using `data-day` and `data-tag-id`.
- **Target size:** Phones use 40–48px targets; the desktop Edit action uses the WCAG 2.2 24×24px minimum.
- **Errors:** Invalid fields take `aria-invalid`, an `aria-describedby` link to a `role="alert"` sentence, and focus. The budget form matches the purchase form.
- **Live regions:** `#status` carries polite announcements. `#hp-num` repaints only when the HP value or state actually changes, so tagging and day selection do not repeat the total.
- **Charts:** The daily line is a single `role="img"` SVG whose `aria-label` states the period, purchase count, total, peak, allowance, and over-allowance days. The donut is `aria-hidden`; its legend lists every category with its swatch, amount, and share. The calendar is a table with a caption, `scope="col"` headers, and a full-sentence `sr-only` label in each cell, so the visual glyphs are never the only source of the date, amount, or over-allowance state.
- **Chart updates:** Charts re-render from the same `render()` pass as the ledger after add, edit, delete, and import. They redraw on resize and when the Board becomes visible again, without moving focus or announcing the whole dataset.
- **Motion:** The CSS reduced-motion rule collapses transitions and animations; JavaScript scrolls ask `matchMedia('(prefers-reduced-motion: reduce)')` and fall back to `auto`.
- **Safe areas and obstruction:** `scroll-padding-bottom` mirrors the fixed footer's reserve, and the header, skip link, and footer respect `env(safe-area-inset-*)`.
- **No-script:** A short `<noscript>` line states that the app needs JavaScript; the interface never pretends to work without it.

## Do's and Don'ts

### Do:
- **Do** keep one continuous board. Group with 24–54px of spacing and a hairline, never with a container.
- **Do** put the HP numeral first on every screen and the arithmetic directly beneath it.
- **Do** set every figure in Oswald with tabular numerals; keep prose in Source Sans 3.
- **Do** reserve amber for earned status and rust for overspend or regret.
- **Do** draw the bar as remaining chalk and let spending erase it from the right.
- **Do** end horizontal rules 6–8% before the right edge.
- **Do** keep Add one tap from the Board and open it with the amount focused, so a purchase still takes seconds.
- **Do** keep the projection line on Add current; the consequence of the purchase must be visible before it is saved.
- **Do** let the amount lead the form: full width on phones, largest type in the block, digits grouped as they are typed.
- **Do** treat category chips and regret tags as the same object: square outlined labels, one tap, no dropdown.
- **Do** keep mobile tap targets at least 40px, the Month/Week control at least 44px tall, and desktop icon-sized actions at least 24×24px.
- **Do** use Chalk Control for any border that is a control's only visible edge, and `--rust-text` for rust copy at 11–13px.
- **Do** draw month charts by hand in SVG and table markup, give each category its fixed muted pigment in the donut and legend, and let the calendar carry per-date detail.
- **Do** keep the charts below the today ledger and above the budget; they explain the month, they do not replace the bar.

### Don't:
- **Don't** add cards, panels, rounded corners, filled surfaces, or drop shadows.
- **Don't** use amber or rust as general-purpose accents, backgrounds, or decoration.
- **Don't** use the six category pigments outside the donut and its legend, or reassign a category's color when the slice order changes.
- **Don't** replace the bar, zone ramp, week strip, or category ramp with charts, or let charts push them out of first view.
- **Don't** use icon libraries, glyph icons, or emoji in the interface; the native date-picker glyph is the only exception.
- **Don't** use Chalk Rule as a control border, or set small text in `--rust` on a rust-tinted fill.
- **Don't** soften HP, XP, level, streak, worth, or regret into generic finance language.
- **Don't** merge the three pages back into a hash router; the board, add and week documents are the navigation contract.
- **Don't** set a number in Source Sans 3 or a sentence in Oswald.
- **Don't** fill the bar left-to-right as money is spent; the visible chalk is what is left.
- **Don't** show a partial over-budget fill; the hatch must read as a full, failed bar.
