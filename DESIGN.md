---
name: PBDesign
description: Portfolio of Przemysław Borkowski, set as a live design-tool canvas where every artboard is a working site.
colors:
  accent: "#D6006F"
  accent-deep: "#B0005B"
  accent-soft: "#FDE7F1"
  accent-on-dark: "#FF5AA8"
  canvas: "#EFEFEC"
  canvas-dot: "#CFCFC8"
  board: "#FFFFFF"
  ink: "#0E0E10"
  ink-2: "#4A4B52"
  line: "#DADAD4"
  line-2: "#BDBDB6"
typography:
  display:
    fontFamily: "Anybody, Arial Narrow, sans-serif"
    fontSize: "clamp(3rem, 7.4vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.035em"
    fontVariation: "\"wdth\" 50..150 (live, driven by --wdth)"
  headline:
    fontFamily: "Anybody, Arial Narrow, sans-serif"
    fontSize: "clamp(2.6rem, 6vw, 5rem)"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Anybody, Arial Narrow, sans-serif"
    fontSize: "clamp(1.9rem, 3.2vw, 2.7rem)"
    fontWeight: 750
    lineHeight: 1
    letterSpacing: "-0.03em"
  title-card:
    fontFamily: "Anybody, Arial Narrow, sans-serif"
    fontSize: "clamp(1.35rem, 1.9vw, 1.6rem)"
    fontWeight: 750
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
  body-lead:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "clamp(19px, 1.8vw, 23px)"
    fontWeight: 500
    lineHeight: 1.45
  label:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.25
  mono:
    fontFamily: "Spline Sans Mono, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.2
rounded:
  badge: "3px"
  control: "6px"
  panel: "8px"
  phone-sm: "14px"
  phone: "18px"
  pill: "999px"
spacing:
  gutter: "clamp(16px, 4vw, 48px)"
  bar: "64px"
  grid-dot: "24px"
  section: "clamp(80px, 11vw, 140px)"
  container: "1360px"
components:
  button-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.board}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "52px"
  button-accent-hover:
    backgroundColor: "{colors.accent-deep}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "52px"
  button-ghost-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.board}"
  button-sm:
    padding: "0 16px"
    height: "40px"
  button-lg:
    padding: "0 28px"
    height: "60px"
  nav-link:
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "8px 14px"
  nav-link-active:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-deep}"
  layers-panel:
    backgroundColor: "{colors.board}"
    rounded: "{rounded.panel}"
    padding: "10px"
    width: "250px"
  tag:
    backgroundColor: "{colors.board}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    padding: "3px 11px"
  dimension-badge:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.board}"
    typography: "{typography.mono}"
    rounded: "{rounded.badge}"
    padding: "4px 8px"
  flow-node:
    backgroundColor: "{colors.board}"
    rounded: "{rounded.panel}"
    padding: "26px 24px 28px"
---

# Design System: PBDesign

## Overview

**Creative North Star: "The Working Canvas"**

The site is a design tool's canvas, not a brochure. A light dotted workspace holds pure-white artboards; each artboard carries a monospaced frame name above it, a soft shadow beneath it, and, on hover or focus, a magenta selection box with square handles and a small badge. The chrome of the tool (rulers, frame names, a layers panel, dimension badges, prototype connectors) is the whole ornament vocabulary. Nothing decorative is imported from outside that world.

Density is calm and editorial: huge, tight, width-shifting display type against generous section padding, with the real screenshots doing the visual work. The system is monochrome ink-on-paper plus exactly one hue, a hot magenta that means "selected, measured, or actionable". One dark band (the contact section) inverts the canvas to ink with a dim dot grid, so the page ends on its strongest contrast.

**Key Characteristics:**
- Light tool canvas (dotted 24px grid) with white artboards on top.
- One accent hue, magenta, reserved for selection, redlines and primary action.
- Variable-width display face whose `wdth` axis is part of the expression (hero resize, per-heading stretch).
- Tool chrome as ornament: frame names, 8-handle selection boxes, dimension badges, connectors, layers panel.
- Soft, ambient two-layer shadows; lift on hover, never hard offsets.

## Colors

Ink on a warm-gray tool canvas, white artboards, and a single magenta that belongs to the tool's selection layer.

### Primary
- **Selection Magenta** (accent): fills primary buttons, draws selection outlines and handles, dimension badges, the cursor, prototype connectors and the hero's "live." word. It is the colour of the tool acting on the page.
- **Pressed Magenta** (accent-deep): accent hover state, and the accent whenever it must be small text (client names, "Otwórz stronę" links, active nav and layer items) for legibility on white and canvas.
- **Selection Tint** (accent-soft): background of active nav links and active layer items; halo around the live dot.
- **Magenta on Ink** (accent-on-dark): the accent's substitute inside the dark contact band (second headline line, focus ring, accent-button hover, code highlight).

### Neutral
- **Tool Canvas** (canvas): page background and the hover fill for nav links and layer rows.
- **Canvas Dot** (canvas-dot): the 1px dots of the 24px grid in the hero canvas.
- **Artboard White** (board): every surface that represents a frame, panel or card; the about band.
- **Ink** (ink): body text, headlines, ghost-button border, device bezels on phone mockups, the contact band.
- **Secondary Ink** (ink-2): supporting copy, descriptions, ruler numerals, frame names, counts.
- **Hairline** (line): 1px borders on boards, panels, header and section dividers.
- **Strong Hairline** (line-2): tag borders, group dividers, ruler ticks, facts dividers, scrollbar thumb.

### Named Rules
**The One Hue Rule.** Magenta is the only chromatic colour in the chrome. Colour elsewhere comes only from the project screenshots, which is what keeps the work louder than the frame.

**The Small-Text-Goes-Deep Rule.** Accent-coloured text below display size uses Pressed Magenta, not Selection Magenta; the bright accent is for fills, outlines and display-size words.

## Typography

**Display Font:** Anybody (variable, wdth 50–150, wght 400–900; fallback Arial Narrow)
**Body Font:** Schibsted Grotesk (fallback system-ui)
**Label/Mono Font:** Spline Sans Mono (fallback ui-monospace)

**Character:** A heavy, width-elastic grotesque for headings, a sturdy news-grotesk for reading, and a mono that speaks only in the tool's voice (frame names, measurements, counts, code).

### Hierarchy
- **Display** (800, clamp(3rem, 7.4vw, 6rem), 0.9): the hero headline only, set line-per-span, its width axis live under the selection handle.
- **Headline** (800, clamp(2.6rem, 6vw, 5rem) up to clamp(3rem, 8vw, 6rem), 0.9–0.95, -0.035 to -0.04em): section titles. Each section sets its own `font-stretch` (92% about, 112% contact, 118% work, 120% process), so width is a per-section voice, not a constant.
- **Title** (750, clamp(1.9rem, 3.2vw, 2.7rem), 1): project group headings; the count sits after it as a superscript mono number in magenta.
- **Card Title** (750, clamp(1.35rem, 1.9vw, 1.6rem), 1.1): project names; lead cards scale to clamp(1.8rem, 2.8vw, 2.5rem) at 108% stretch.
- **Body** (400, 17px, 1.6): all reading copy; descriptions cap at 54–62ch, section leads at 46–52ch.
- **Lead** (500, clamp(19px, 1.8vw, 23px), 1.45): the opening paragraph of the about text; the hero lede uses clamp(17px, 1.45vw, 19.5px).
- **Label** (600, 14–15.5px): nav, layer rows, client names, text links.
- **Mono** (500, 10–12px): frame names, ruler numerals, dimension and "Live" badges, counts, code.

### Named Rules
**The Width Is Voice Rule.** Headings use Anybody's width axis deliberately (92–120% stretch); don't leave every heading at 100%.

**The Mono Means Tool Rule.** Spline Sans Mono appears only where a design tool would print text itself: frame names, measurements, counts, file names, code. Never for editorial copy or headings.

## Layout

Content sits in a 1360px container with a fluid gutter (clamp(16px, 4vw, 48px)). Sections breathe on clamp(80px, 11vw, 140px) vertical padding (contact: clamp(88px, 12vw, 160px)). The header is a 64px sticky bar; anchors offset by bar height + 16px.

The hero is an asymmetric two-column grid (1.18fr / 1fr) on a dotted canvas with 22px rulers top and left; rulers disappear below 900px. The work section pairs a sticky 250px layers panel with a two-column project grid (56px row / 36px column gaps). Each group opens with a full-width lead artboard laid out 1.55fr image / 1fr text; an odd final item mirrors it (text left) above 1100px. Process is a four-node flow (2 columns under 980px, 1 under 600px, connectors turning vertical). About is 5fr / 7fr.

Breakpoints actually used: 1100, 1020, 980, 900, 860, 760, 640, 600, 560, 520px. Below 900px the layers panel becomes a sticky, horizontally scrolling chip bar under the header. Below 760px the nav hides and only the brand and the CTA remain.

## Elevation & Depth

Depth is a hybrid: tonal layering does most of the work (white artboards over the gray canvas, hairline borders on every board), and one soft, two-layer ambient shadow grounds every artboard and panel. Elevation increases only as a response to hover or focus.

### Shadow Vocabulary
- **Artboard rest** (`box-shadow: 0 1px 2px rgba(14,14,16,.06), 0 18px 40px -18px rgba(14,14,16,.22)`): every board, layers panel and flow node.
- **Artboard lift** (`box-shadow: 0 2px 4px rgba(14,14,16,.06), 0 28px 60px -22px rgba(14,14,16,.32)`): phone mockups at rest, and any artboard on hover/focus together with translateY(-5px).

### Named Rules
**The Lift-On-Select Rule.** An artboard rises and gains its selection box in the same gesture; shadow never changes without the selection layer appearing.

## Shapes

Artboards and screenshots are square-cornered, as frames in a design tool are. Rounding is reserved for UI chrome, scaled by role: 3px for badges, 6px for buttons, nav links and layer rows, 8px for floating panels and process nodes, a full pill for tags, and 14–18px only on phone mockups (with a 4–5px ink bezel). Selection outlines are 1.5px magenta strokes offset 7–12px outside the object, with 9–11px square white handles.

## Components

### Buttons
Confident, flat and tactile.
- **Shape:** gently squared (6px), 1.5px border slot, 52px minimum height (40px small, 60px large).
- **Primary:** Selection Magenta fill, white 600 16px Schibsted Grotesk, 24px horizontal padding; icons trail at 1.15em.
- **Hover / Focus:** fill deepens to Pressed Magenta over 0.2s on the house ease; press nudges down 1px; focus is a 3px magenta outline at 3px offset.
- **Ghost:** ink 1.5px outline, transparent fill; inverts to ink fill with white text on hover. On the dark band the outline and text turn white and hover inverts to white.

### Chips (tags)
- **Style:** white pill, Strong Hairline border, 13px 500 Secondary Ink, 3px 11px padding. Informational only, not interactive.

### Cards / Containers (artboards)
- **Corner Style:** square.
- **Background:** Artboard White, 16:10 screenshot cropped from the top, with a phone mockup overlapping the lower right corner (20% width, 24% on small screens).
- **Shadow Strategy:** Artboard rest, lifting to Artboard lift on hover/focus.
- **Border:** 1px Hairline.
- **Above:** a mono frame name (the live URL) in Secondary Ink, ellipsised.
- **Below:** card title, client in Pressed Magenta, description, tags, and an "Otwórz stronę" text link.

### Navigation
- **Header bar:** 64px, white at 92% with saturate+blur backdrop, hairline bottom border; brand wordmark in Anybody 800 at 112% stretch ("Design" dropped to 500).
- **Links:** 500 15.5px ink, 8px 14px padding, 6px radius; hover fills Tool Canvas; the current section fills Selection Tint with Pressed Magenta text.
- **Mobile:** links hide below 760px; the small accent CTA stays.

### Layers Panel (signature)
A floating white panel (8px radius, rest shadow) that mirrors a design tool's layers list: category rows with a 16px stroke icon and a mono count, nested project links hanging off a 1px left rule that turns magenta when active. Collapses to a scrolling chip row below 900px.

### Selection Box (signature)
The 1.5px magenta outline with white square handles and a magenta mono badge. In the hero it wraps the headline, shows live W × H, and its right handle is a real button that changes the headline's width axis by drag or arrow keys. On artboards it appears on hover/focus with a "Live · otwórz" badge, and snaps in once as each artboard enters the viewport.

### Flow Node (signature)
A white 8px-radius node with a small "artefact" preview on top (brief, wireframe, code, live URL), joined to the next node by a 2px magenta connector with an arrowhead that draws in on scroll.

### Motion
One ease for everything, `cubic-bezier(.16, 1, .3, 1)`: 0.2s for control states, 0.45–0.55s for artboard lift, 0.8–0.9s for scroll reveal (opacity + 22px rise), 1.1s for the hero clip-path reveal from wireframe to headline. All of it is skipped under `prefers-reduced-motion`.

## Do's and Don'ts

### Do:
- **Do** put every piece of work on a white, square-cornered artboard with a hairline border, the rest shadow, and a mono frame name above it.
- **Do** use magenta only for selection, measurement, connectors and the primary action; use Pressed Magenta when it is small text.
- **Do** vary Anybody's width per heading (92–120% stretch) and keep headings at 750–800 weight with tight tracking (-0.02 to -0.04em).
- **Do** reveal the selection layer (outline, handles, badge) together with lift on hover and on keyboard focus.
- **Do** keep all motion on the single house ease and honour reduced-motion.

### Don't:
- **Don't** introduce a second accent hue or tinted section backgrounds; the only non-canvas bands are white (about) and ink (contact).
- **Don't** round artboards or screenshots; rounding belongs to controls, panels and phone bezels.
- **Don't** use hard offset shadows; depth is the soft two-layer ambient shadow only.
- **Don't** use Spline Sans Mono for headings or reading copy.
- **Don't** add ornament from outside the tool world (gradients, blobs, glyph icons); new chrome should be something a design tool would draw.
