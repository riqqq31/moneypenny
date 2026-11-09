---
name: Budget HP
description: A daily budget as hit points, chalked on a warung price board.
colors:
  amber: "#E8B33A"
  rust: "#E05A44"
  board-black: "#14150F"
  board-raised: "#1E2016"
  chalk: "#F2F0E6"
  chalk-dim: "#A8A69B"
  chalk-placeholder: "#8F8D82"
  chalk-rule: "rgba(242, 240, 230, 0.16)"
  chalk-rule-strong: "rgba(242, 240, 230, 0.30)"
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
    rounded: "{rounded.none}"
    padding: "14px 22px"
  button-danger:
    backgroundColor: "transparent"
    textColor: "{colors.rust}"
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
    backgroundColor: "rgba(224, 90, 68, 0.15)"
    textColor: "{colors.rust}"
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

Budget HP is one continuous chalkboard behind a warung counter, not a finance dashboard wearing a theme. The day is read as a single chalk numeral before anything else: what is left of today's budget. The arithmetic that produced it sits directly beneath, with the spent amount struck through like a corrected price. The bar is the same money as a physical quantity of chalk, and spending erases it from the right. Purchases below are a price board: category, note, a dotted leader, and a right-aligned amount in tabular figures.

Nothing floats above the board. There are no cards, panels, filled surfaces, rounded corners, or drop shadows. Grouping comes from spacing, 1px hairlines, and dashed rules that deliberately stop short of the right edge, so the composition reads as one board rather than a stack of containers. Depth is tonal, not lifted: the ground is almost black with a green-warm radial light that moves from the top-left to the bottom-right.

Two contexts share one DOM. On a phone at the counter the order stacks, the HP numeral drops in size, the entry form stays above the lines, and Today/Week becomes a segmented control. On desktop the board keeps the hero and form on the left and adds a 370–430px review rail with the week strip, the selected day's purchases, and the regret verdict.

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
- **Rust Chalk** (#E05A44): Overspend, negative HP, the over-budget hatch, regret tags, struck regret amounts, and the regret percentage. Rust is always a cost signal, never decoration.

### Neutral
- **Board Black** (#14150F): The page ground. Fixed radial light lifts the field toward Board Raised at the top-left and toward a slightly warmer dark at the bottom-right.
- **Board Raised** (#1E2016): The lighter stop of the ground's top-left radial.
- **Chalk** (#F2F0E6): Primary text, the HP numeral, purchase notes, and the remaining chalk in the bar.
- **Chalk Dim** (#A8A69B): Labels, secondary copy, unlit ramp steps, and inactive navigation.
- **Chalk Placeholder** (#8F8D82): Input placeholders, one step darker than dim so an empty field never reads as an entered value.
- **Chalk Rule** (rgba(242, 240, 230, 0.16)): Dashed ledger dividers, tag borders, and quiet button borders.
- **Chalk Rule Strong** (rgba(242, 240, 230, 0.30)): Field underlines, button borders, and the bar's top and bottom edges.

### Named Rules
**The Two Chalk Rule.** Only amber and rust carry meaning. Amber marks what was earned or is at stake; rust marks money spent against you. Everything else is chalk on board.

**The Amber Is Earned Rule.** Amber never becomes a background wash or a decorative accent. If it appears, it is reporting level, streak, XP, worth, focus, or the bar's current edge.

## Typography

**Display Font:** Oswald (with Arial Narrow and Helvetica Neue fallbacks)
**Body Font:** Source Sans 3 (with system-ui fallbacks)

**Character:** A condensed signwriter face carries every number, label, and button; a humanist sans carries the owner's notes and prose. The board speaks in shouted, tracked-out capitals and tabular figures; the person speaks in quiet sentences.

### Hierarchy
- **Display** (600, clamp(72px, 8.4vw, 118px), 0.9, -0.02em): The HP numeral only. It shrinks to clamp(54px, 17vw, 84px) under 720px. The small `Rp` prefix is weight 300 at clamp(14px, 0.3em, 40px), aligned to the numeral's upper third.
- **Headline** (600, 62px, 0.86, -0.02em): The regret percentage in the weekly review; 54px on mobile.
- **Title** (600, 23px, 1.05, 0.03em): Level, streak, and XP values in the header, plus day totals in the rail; 19px on phones. Amounts in the ledger use the same face at 19px.
- **Brand** (600, 26px, 1.05, 0.16em, uppercase): The wordmark; 22px under 720px and 19px below 360px on the compact step.
- **Body** (400, 16px, 1.5): Purchase notes, form values, and explanatory copy. Fine print drops to 12px/1.6 and holds a 64ch measure; notes cap at 34ch on the ledger.
- **Label** (500, 11px, 1.4, 0.22–0.26em, uppercase): Section headers, field labels, tags, buttons, strip days, and footer actions. Buttons use 0.20em; section headers use 0.24–0.26em.

### Named Rules
**The Tabular Numeral Rule.** Every amount, percentage, count, and date uses `font-variant-numeric: tabular-nums` in Oswald. Columns must line up on the board; proportional figures break the price-board read.

**The One Voice Rule.** Prose never sets in Oswald, and figures never set in Source Sans 3. A number belongs to the board; a sentence belongs to the owner.

## Layout

The board is full-bleed and has no maximum width. On desktop the header runs 26px from the top with 40px side padding; the main area splits into a fluid left column and a review rail of `minmax(370px, 430px)`, separated by a 1px vertical rule with 44px of padding and margin. Below 1024px the rail folds behind the Week tab and the page becomes a single column.

The left column reads top to bottom: HP numeral, arithmetic, bar and scale, zone ramp, XP note, entry form, today's ledger, monthly budget, and data actions. The form sits directly under the bar because the bar is what the purchase is about to change. At 1280px and up the four entry fields sit in one row at `1.1fr 1.1fr 1.7fr 0.9fr`; below that they stay in two columns.

Page gutters are 40px on desktop and 18px on phones. Main content reserves 118px at the bottom (108px on phones) for the fixed footer, which always keeps Export JSON and Set budget one tap away. Vertical rhythm is deliberately uneven: 28–30px between related blocks, 44–54px before a new section. The fixed footer carries a 22px gradient scrim into the board so ledger lines fade rather than collide with it.

Breakpoints, in use:
- **359px and below:** tighter wordmark, smaller stat values, reduced header gaps.
- **719px and below:** stacked header with segmented Today/Week control, phone gutters, two-column entry grid, compact ledger rows, 40px tag targets.
- **1023px / 1024px:** the single-column/mobile mode changes to the two-column desktop board; tabs disappear.
- **1280px and up:** four-column entry row.

## Elevation & Depth

The system is flat by default and uses no drop shadows. Depth is tonal: a fixed two-radial ground lightens the board at the top-left and warms a corner at the bottom-right; 1px hairlines and dashed rules separate without lifting; the fixed footer uses a 22px gradient scrim. The bar's amber edge carries a small radial glow, but it reads as a light source on the board, not as elevation.

The one `box-shadow` in the stylesheet is `inset 0 -3px 0` on today's day cell. It is a state marker, not depth, and should not be copied as an elevation recipe.

### Named Rules
**The No-Card Rule.** Nothing is a card. There is no panel surface, no radius, no shadow, and no container border. Grouping is spacing plus a rule.

**The Flat Board Rule.** If something needs to separate from the board, lighten the ground by a few percent or draw a hairline. Never add a drop shadow.

## Shapes

The form language is square and ruled. Every interactive shape is a rectangle with a 0px radius: buttons, tags, day cells, inputs, and the bar. Borders are 1px or 1.5px; state marks are 3px bars; ledger rows are separated by 1px dashed rules; amounts connect to their labels with a 2px dotted leader. Tags are compact outlined boxes, never pills.

Horizontal rules stop short of the right edge by design: 6% on the header rule and 8% on section rules, so the board never looks boxed in. The only round marks are the 1px dots of the bar track; everything else is rectilinear apart from the browser's native date-picker glyph.

**The Hairline That Stops Short Rule.** A full-width rule turns the page into a table. End horizontal rules 6–8% before the right edge so the board remains one field.

## Components

### Buttons
- **Shape:** Square, 0px radius, 1.5px border, uppercase Oswald 11px with 0.20em tracking, 14px × 22px padding.
- **Primary:** Chalk border with a 5% chalk wash; hover raises the wash to 14% and turns the label white.
- **Quiet:** 16% chalk border and dim label; hover restores the chalk label and strengthens the border.
- **Danger:** 50% rust border and rust label; hover adds a 12% rust wash.
- **Hover / Focus:** Background, border, and color transition over 180ms with cubic-bezier(0.16, 1, 0.3, 1); active state presses down 1px. Focus is a 2px amber outline with a 3px offset.

### Inputs / Fields
- **Style:** No box and no fill. A single 1.5px Chalk Rule Strong underline under an Oswald 11px tracked label; the amount field sets its value in Oswald 21px tabular figures, every other field in Source Sans 3 16px.
- **Focus:** The underline turns chalk; the caret is amber; the browser outline is removed because the underline carries focus.
- **Error:** A rust sentence sits beside the submit button; it occupies no space when empty.
- **Date:** Native picker, inverted to chalk on the dark board; dates cannot exceed today.

### Navigation
- **Desktop:** Level, streak, and XP sit at the far right of the header; Today/Week tabs are hidden because both columns are visible.
- **Tablet / Phone:** Today/Week becomes a two-column segmented control below the header. Oswald 12px, 0.22em tracking, dim at rest, chalk when pressed, with a 3px amber top rule and a 5% chalk wash on the active segment; each hit area is at least 44px tall.
- **Day strip:** Seven equal cells with 1px borders in the review rail. The selected day takes a chalk border and 6% wash; today gets an inset 3px amber bottom rule; an over-budget day gets a rust bottom bar and rust value.

### Persistent Footer
- **Shape:** A fixed full-width band with a 1px top rule and a 22px gradient scrim rising above it. Export JSON and Set budget are plain text buttons with 40px minimum touch height; the month and day count sit at the right and disappear on phones.
- **Behavior:** Export and Set budget stay reachable while the ledger scrolls. Set budget switches to Today, scrolls the budget block into view, and focuses the field.

### Tags
- **Style:** Outlined rectangles, 1px Chalk Rule border, Oswald 11px uppercase with 0.12em tracking, no radius.
- **State:** Selected Worth It = amber label, amber border, 13% amber wash. Selected Regret = rust label, rust border, 15% rust wash. Selected Meh = chalk label, chalk border, 10% chalk wash. On phones each tag is at least 40px tall.

### HP Bar (Signature)
- **Shape:** A 30px band with 1.5px Chalk Rule Strong top and bottom edges and no side borders; a 10px dotted chalk track runs behind the fill.
- **Fill:** Chalk, with two soft radial highlights that suggest chalk dust. The fill is the HP that remains, so it retreats from the right as spending grows; a 2px amber edge marker with a radial glow sits at the fill's end.
- **Over budget:** The fill and edge disappear and the entire band becomes a rust diagonal hatch at 34% opacity, with rust labels beneath. No partial fill is shown, because a partial fill would imply remaining money.
- **Scale:** Eleven zone steps below the bar, one lit amber at the current zone; an in-rail label reads `zone 4/10`, `over`, or `no budget`.

### Ledger Line (Signature)
- **Shape:** A six-column row: 86px category, note, dotted leader, right-aligned amount, 84px tag, edit action. Rows are separated by a 1px dashed Chalk Rule.
- **Type:** Category and tag in Oswald 11px uppercase; note in Source Sans 3 15px capped at 34ch; amount in Oswald 19px tabular.
- **State:** A regret-tagged row strikes its amount in rust. New rows animate in with a 550ms left-to-right chalk wipe.
- **Phone:** Reflows to two rows: note, leader, and amount on the first line; category, tag, and edit on the second, with no boxes around the tag.

### Regret Block (Signature)
- **Shape:** A rust percentage at 62px, followed by "n of n purchases you'd take back" in 12px muted body type.
- **Category ramp:** Up to three categories ranked by regret amount, each a full-width row with a rust bottom border. Amounts step down 30px / 23px / 18px, with the category label right-aligned in Oswald 11px.
- **Copy:** Reports patterns, never scolds. "Every purchase tagged" replaces the untagged count when the week is complete.

## Do's and Don'ts

### Do:
- **Do** keep one continuous board. Group with 24–54px of spacing and a hairline, never with a container.
- **Do** put the HP numeral first on every screen and the arithmetic directly beneath it.
- **Do** set every figure in Oswald with tabular numerals; keep prose in Source Sans 3.
- **Do** reserve amber for earned status and rust for overspend or regret.
- **Do** draw the bar as remaining chalk and let spending erase it from the right.
- **Do** end horizontal rules 6–8% before the right edge.
- **Do** keep the entry form directly under the bar and the footer's Export JSON / Set budget visible.
- **Do** keep mobile tap targets at least 40px and the Today/Week control at least 44px tall.

### Don't:
- **Don't** add cards, panels, rounded corners, filled surfaces, or drop shadows.
- **Don't** use amber or rust as general-purpose accents, backgrounds, or decoration.
- **Don't** replace the bar, zone ramp, week strip, or category ramp with charts.
- **Don't** use icon libraries, glyph icons, or emoji in the interface; the native date-picker glyph is the only exception.
- **Don't** soften HP, XP, level, streak, worth, or regret into generic finance language.
- **Don't** set a number in Source Sans 3 or a sentence in Oswald.
- **Don't** fill the bar left-to-right as money is spent; the visible chalk is what is left.
- **Don't** show a partial over-budget fill; the hatch must read as a full, failed bar.
