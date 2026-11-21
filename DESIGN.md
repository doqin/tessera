---
name: Tessera
description: AI Agent UI assembled at runtime from independently deployed micro frontends
colors:
  signal-vermilion: "#b4371c"
  vermilion-soft: "#f6e3dd"
  vermilion-ink: "#3a2a24"
  on-accent: "#ffffff"
  ink: "#14161a"
  ink-muted: "#5b6270"
  paper: "#f6f7f8"
  surface: "#ffffff"
  surface-sunken: "#f1f3f5"
  surface-raised: "#e8ebef"
  hairline: "#e1e4e8"
  emerald: "#1f6f4a"
  amber: "#8a5a12"
  crimson: "#b3261e"
  crimson-ink: "#8f1d16"
  status-bg: "#14161a"
  status-fg: "#f6f7f8"
  status-muted: "#9aa1ad"
  status-signal: "#e07a55"
typography:
  display:
    fontFamily: "Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.02rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.04em"
  mono:
    fontFamily: "Roboto Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  xs: "6px"
  sm: "8px"
  md: "10px"
  lg: "14px"
  xl: "16px"
  pill: "999px"
spacing:
  space-1: "4px"
  space-2: "8px"
  space-3: "12px"
  space-4: "16px"
  space-5: "20px"
  space-6: "24px"
  space-8: "32px"
components:
  button-primary:
    backgroundColor: "{colors.signal-vermilion}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "9px 12px"
  nav-item:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.md}"
    padding: "9px 12px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "16px 20px"
  badge:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  chat-bubble-agent:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "10px 14px"
  chat-bubble-user:
    backgroundColor: "{colors.signal-vermilion}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.lg}"
    padding: "10px 14px"
  status-bar:
    backgroundColor: "{colors.status-bg}"
    textColor: "{colors.status-fg}"
    rounded: "0"
    padding: "0 20px"
---

# Design System: Tessera

## Overview

**Creative North Star: "The Instrument"**

Tessera is an instrument for watching an agent work. The interface is neutral by design: a light grey
field, white surfaces, hairline rules, and one vermilion signal that appears only when something
happens. The chrome never competes with the transcript and the tool data — those are the product.
Every region answers a question the operator would ask mid-demo: where am I (status bar), what did the
agent do (transcript, tool result card), is it alive (streaming cursor, live counters).

The mood is modern and technical, not archival. One grotesk carries display and body; Roboto Mono is
reserved for machine output. The **category-interchangeable test** is the gate: remove the Vietnamese
copy and the screenshot should still read as a console for observing an agent's tool calls — the ink
status strip, the inline tool result, the shell/remote split and the stacked architecture page are
what keep it specific.

Both themes are first-class and neutral. Light is the default for a lit demo room; dark is dimmed
(warm charcoal, ~11:1 body contrast) so a long session does not strain the eye.

**Key Characteristics:**

- Neutral grey + white surfaces; hairline borders do the structural work; no gradients, no glass.
- One vermilion signal accent; success/warning/danger only as small status marks.
- One family (Be Vietnam Pro) for display and UI; Roboto Mono for ids, routes, timings, payloads.
- A centred search field is the only thing in the top bar besides the settings entry.
- Collapsible icon rail for navigation; no session/telemetry panels in the sidebar.
- Flat surfaces at rest; shadow only answers "how far off the page is this".

## Colors

A neutral field (page → surface → sunken) with one committed vermilion signal and three semantic marks
kept small.

### Primary

- **Signal Vermilion** (#b4371c): the only saturated colour on screen. Primary buttons, the active
  navigation item, the user chat bubble, focus rings, links. It marks action and state; never a
  decorative wash.
- **Vermilion Soft** (#f6e3dd): tinted rest state — active nav fill, soft badges, selected row.
  Always with Ink text.
- **Vermilion Ink** (#3a2a24): text on tinted surfaces; dark enough for AA.
- **On Accent** (#ffffff): text on Signal Vermilion.

### Neutral

- **Ink** (#14161a): body copy, headings, tool names, numeric readouts.
- **Ink Muted** (#5b6270): labels, timestamps, secondary metadata, placeholder, inactive nav — ≥5.9:1
  on both page and surface.
- **Paper** (#f6f7f8): the page field behind every card.
- **Surface** (#ffffff): cards, header, sidebar, composer, palette.
- **Surface Sunken** (#f1f3f5): agent chat bubbles, metadata tiles, inset code, tool result panels.
- **Surface Raised** (#e8ebef): hover wash, inline code chips.
- **Hairline** (#e1e4e8): every 1 px border.

### Status strip

- **Status BG** (#14161a) / **Status FG** (#f6f7f8): the ink band at the bottom of every route; the
  same band in both themes, which is what makes it the identity anchor.
- **Status Muted** (#9aa1ad): keys and separators.
- **Status Signal** (#e07a55): the last tool name — the only coloured element on the strip.

### Semantic

- **Emerald** (#1f6f4a): success, connection dot.
- **Amber** (#8a5a12): running / waiting.
- **Crimson** (#b3261e) with **Crimson Ink** (#8f1d16): failed calls, error banners, destructive.

### Named Rules

**The One Signal Rule.** Signal Vermilion covers at most ~10 % of any screen: one primary button, one
active nav item, one user bubble side, key figures. Its rarity is what makes it read as signal.

**The Two-Theme Parity Rule.** Every colour resolves through a token with a dark counterpart (dark
anchors: page `#17181b`, surface `#1e1f23`, primary `#e28663`). A raw hex inside a component is a
defect.

**The No-Gradient Rule.** No gradient, no `backdrop-filter`, no dot-grid, no decorative texture. The
only depth cue is a hairline; the only colour event is the signal.

## Typography

**Display / Body:** Be Vietnam Pro (with `ui-sans-serif, system-ui, sans-serif`)
**Label / Mono:** Roboto Mono (with `ui-monospace, SFMono-Regular, Menlo, monospace`)

**Character:** Be Vietnam Pro is a contemporary geometric grotesk drawn for Vietnamese — the copy
language and the type system agree, and the product reads as current software rather than as a
document. Hierarchy comes from size, weight and tracking on a single family; monospace is a signal
for machine output, not a costume for "technical".

> Load font variables on `<html>`, not `<body>`: the token layer defines `--dq-font-base` on `:root`,
> and a `var()` reference to a body-scoped font variable makes that whole custom property invalid at
> the root (silent fallback to Times New Roman).

### Hierarchy

- **Display** (600, 1.75 rem / 28 px, 1.12, −0.03 em): page titles — one per screen, sentence case.
- **Title** (600, 1.02 rem / 16.3 px, 1.25, −0.01 em): card and empty-state titles, chat header.
- **Body** (400, 0.9375 rem / 15 px, 1.55): messages, descriptions, prose; measure ~72 ch max.
- **Label** (500, 0.75 rem / 12 px, 0.04–0.08 em, uppercase): KPI labels, field labels, status-bar
  keys. 12 px is the floor for functional micro-text.
- **Mono** (400, 0.75 rem, 1.6): ids, route paths, timings, JSON payloads, keyboard hints.

### Named Rules

**The Machine Data Rule.** Monospace is a signal, not a costume: if a human would read it aloud as a
sentence, it is Be Vietnam Pro. Figures use tabular numerals so a KPI never jitters.

**The 12 px Floor Rule.** Functional micro-text never goes below 0.75 rem.

**The One Family Rule.** No second display face. Emphasis comes from weight, size and tracking; a
serif or a second grotesk would read as decoration on a control surface.

## Layout

A fixed application shell, not a centred landing page. The app is exactly `100dvh`; only the content
area scrolls, so no page-level scrollbar ever appears behind a panel.

- **Top bar:** 64 px, three slots (`1fr · minmax(0, 520px) · 1fr`; below 900 px `auto · 1fr · auto`).
  Centre holds the search field that opens the command palette; right holds one settings icon button;
  left holds the hamburger on mobile and is empty on desktop. No brand, no breadcrumb, no
  theme/language toggles.
- **Sidebar:** 248 px rail, hairline on its right, its own scroll. Collapses to a 72 px icon rail
  (labels hidden, `aria-label` retained, state persisted). Nav only — session id and tool count live
  on `/settings`, not in the rail.
- **Main:** flexes to fill, 24 px padding, inner column capped at 1240 px, `overflow-y: auto`.
- **Status bar:** 34 px ink strip, mono figures, hidden below 900 px.
- **Chat:** fills the content box (`height: 100%`), composer pinned at the bottom, only the message
  list scrolls.
- **Dashboard:** KPI band (hero figure + three readouts), then timeline rail `minmax(260px, 340px)`
  and detail `minmax(0, 1fr)`; one column below 1100 px.
- **Overview:** one sequenced stack (host → remotes → shared), a four-step flow band, then a numbered
  decision list.
- **Settings:** a single column of hairline cards (appearance, language, session), max 720 px.
- **Breakpoints:** 1100 px (dashboard to one column), 900 px (sidebar to drawer + hamburger + scrim,
  status bar and rail collapse hidden), 760 px (flow band stacks), 640 px (chat header actions
  icon-only, model badge hidden, KPI band stacks, bubble width 86 %).

## Elevation & Depth

Structure is carried by 1 px hairlines. Shadows are ambient: separate a card from the page, never
imply floating chrome.

- **Rest** (`0 1px 0 rgb(20 22 26 / 4%)`): cards and timeline containers.
- **Lift** (`0 1px 0 rgb(20 22 26 / 4%), 0 10px 30px -18px rgb(20 22 26 / 20%)`): chat surface and
  detail panel.
- **Overlay** (`0 28px 70px -28px rgb(20 22 26 / 30%), 0 2px 0 rgb(20 22 26 / 5%)`): palette only,
  over a 42 % ink scrim with no blur.

### Named Rules

**The Border Does the Work Rule.** Distinguish a surface with a hairline before a shadow. Shadows may
only answer "how far off the page is this", never "what is this".

## Shapes

Small, engineered geometry.

- **Controls:** 10 px radius.
- **Surfaces:** 14 px; chat surface and palette 16 px.
- **Micro:** 6–8 px.
- **Chat bubbles:** 14 px with one 4 px speaker corner.
- **Badges:** fully rounded, 1 px tinted border, ~10 % tint.
- **Borders:** always 1 px; no one-sided accent bars.

## Components

### Top bar and search

- **Search field:** 38 px high, hairline, `Surface Sunken` fill, muted placeholder, `⌘K` hint at the
  end; hover tints the border toward vermilion. It is a button, not an input — it opens the palette.
- **Hamburger:** 36 px icon button in the left slot, only below 900 px; opens the navigation drawer.
- **Settings:** 36 px icon button on the right. Always present, including on a phone — the grid must
  give it its own `auto` column, never squeeze it behind the search field.

### Navigation

- **Style:** vertical rail, 10 px radius rows, icon + label + muted 0.75 rem description.
- **States:** muted on transparent → ink on `Surface Raised` → vermilion on `Vermilion Soft`.
- **Collapsed:** 72 px, labels hidden, icons centred, tooltips via `title`; the collapse control sits
  at the bottom of the rail and states "Thu gọn menu".
- **Mobile:** off-canvas drawer at ≤900 px, opened by the hamburger, closed by the scrim, Escape, or
  a route change; labels visible, drawer starts below the header, collapsed rail ignored.

### Chat

- **Surface:** one 16 px card filling the column.
- **Bubbles:** agent on `Surface Sunken` with a hairline; user on Signal Vermilion.
- **Tool result card:** a sunken panel directly under the agent bubble with the tool name in mono,
  status + duration, and the result rendered for reading — weather as `city · 28°C · condition`,
  document search as a list, anything else as formatted JSON. The answer lives in the transcript;
  Dashboard remains the history/metrics view.
- **Meta row:** role, time, tool badge, duration.
- **Actions:** copy / regenerate / retry on hover or focus; icon-only below 640 px.
- **Streaming:** blinking vermilion caret; stop becomes a crimson send button.

### Readouts

- **KPI band:** hero figure with a 0.75 rem uppercase label and muted hint, separated by a hairline
  from three compact readouts. Not four equal tiles.
- **Timeline row:** 10 px radius, status dot on a 1 px rail, selected row takes `Vermilion Soft`.
- **Detail panel:** mono tool name, four metadata tiles, params and result as key/value grids.

### Settings

- **Rows:** hairline card, label + hint on the left, segmented control on the right; stack below
  640 px.
- **Theme / language:** segmented buttons with `aria-pressed`, applied immediately.
- **Session:** definition list with mono id and tool count.

### Command palette

- **Surface:** 16 px card, 560 px max width, overlay shadow over a 42 % ink scrim (no blur).
- **Rows:** 10 px radius; active row takes `Vermilion Soft`; group headings 0.75 rem uppercase muted.

### Status bar

- **Surface:** 34 px ink band, mono 0.6875 rem, paper text, muted keys.
- **Signal:** the last tool name is the only coloured element; the connection dot shares its colour.
- **Content:** route, session id, tool count, last tool, stack; hidden ≤900 px.
- **A11y:** the tool-count cell is `aria-live="polite"`.

## Do's and Don'ts

### Do:

- **Do** express every colour through a token (light + dark pair).
- **Do** let the 1 px hairline carry structure, then add the rest or lift shadow step.
- **Do** keep Signal Vermilion for action and state, under ~10 % of the screen.
- **Do** set numbers in tabular figures and machine strings in Roboto Mono.
- **Do** load font variables on `<html>` so root-level token definitions resolve.
- **Do** keep the shell at `100dvh` and scroll only the content area.
- **Do** give destructive actions an in-place confirm step.
- **Do** answer a tool call in the transcript, not with a pointer to another page.
- **Do** honour `prefers-reduced-motion`.

### Don't:

- **Don't** bring back the base library's hard 8 px offset shadows or 0 px radius.
- **Don't** uppercase a page heading.
- **Don't** introduce a second accent hue.
- **Don't** use monospace for sentences, labels, or buttons.
- **Don't** put a gradient, blur or dot-grid anywhere.
- **Don't** stack two shadow steps on the same surface, or use shadow to signal hover.
- **Don't** build page structure from equal-sized card grids.
- **Don't** put brand, breadcrumb, language or theme controls in the top bar.
- **Don't** hard-code `#fff`/`#000` in components; use Surface / On Accent / Ink.
