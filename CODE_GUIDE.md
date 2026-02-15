# DigestiGo — Code Guide

A detailed explanation of every major structural decision in the codebase: why each file exists, what each HTML attribute does, and why the CSS is structured the way it is. Written for someone who can read code but wants to understand the *intent* behind it.

---

## Table of Contents

1. [File Structure Overview](#1-file-structure-overview)
2. [css/variables.css — Design Tokens & Global Reset](#2-cssvariablescss)
3. [css/nav.css — Shared Navigation](#3-cssnavcss)
4. [css/footer.css — Shared Footer](#4-cssfootercss)
5. [css/landing.css — Landing Page Styles](#5-csslandingcss)
6. [css/about.css — About Page Styles](#6-cssaboutcss)
7. [css/features.css — Features Page Styles](#7-cssfeaturescss)
8. [js/nav.js — Shared Interactions](#8-jsnavjs)
9. [index.html — Landing Page Structure](#9-indexhtml)
10. [about.html — About Page Structure](#10-abouthtml)
11. [features.html — Features Page Structure](#11-featureshtml)

---

## 1. File Structure Overview

```
DigesiGoWebsite/
├── index.html          Landing / marketing page
├── about.html          About the team and mission
├── features.html       Deep-dive into every feature
│
├── css/
│   ├── variables.css   CSS custom properties + global reset (loaded first on every page)
│   ├── nav.css         Shared nav styles + shared button/section styles
│   ├── footer.css      Shared footer styles
│   ├── landing.css     index.html-only styles
│   ├── about.css       about.html-only styles
│   └── features.css    features.html-only styles
│
└── js/
    └── nav.js          All interactive behaviour (animations, scroll effects, etc.)
```

**Why split CSS across multiple files?**
Each page loads only what it needs. `variables.css` and `nav.css` are shared across all three pages (same nav, same tokens). The page-specific files (`landing.css`, `about.css`, `features.css`) are only loaded on their respective page, keeping unused rules out of memory. There is no build tool — the browser loads them as plain `<link>` tags.

---

## 2. css/variables.css

This file does two jobs: global reset and design tokens.

### Global Reset
```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
```
- `box-sizing: border-box` makes every element's width and height *include* its padding and border (instead of adding on top). Without this, a box with `width: 200px; padding: 20px` would actually be 240px wide, breaking layouts.
- `margin: 0; padding: 0` strips every browser's built-in spacing so the design starts from a clean slate.
- `*::before, *::after` includes pseudo-elements so they also follow the same box model.

### CSS Custom Properties (`:root`)
All colours, fonts, and sizes are defined here as variables (e.g. `--green: #00e676`). Any CSS file that runs after this one can reference them. Changing a colour in one place updates it everywhere. This is why there are no raw hex codes scattered across the other CSS files.

**Colour tiers explained:**
- `--bg` / `--surface` / `--surface2` / `--surface3` — four shades of dark green-grey. Rather than using `opacity` (which makes stacked elements look muddy), the design uses distinct opaque surface levels. `--bg` is the page background; each higher surface number is one step lighter, used for cards and panels.
- `--border` / `--border2` — two subtle border shades for separators and card outlines.
- `--green`, `--green-mid`, `--green-dark`, `--green-glow`, `--green-glow2` — the full brand green family. `--green-dark` is used as icon backgrounds (a dark tint of the same hue). `--green-glow` and `--green-glow2` are very low opacity and used only for glow/shadow effects.
- `--text` / `--text-dim` / `--text-muted` / `--white` — four text levels. Primary text is `--text` (slightly greenish white). Descriptions and secondary copy use `--text-dim`. Labels and metadata use `--text-muted`. Headings use `--white` for maximum contrast.

**Why `clamp()` in font sizes?**
Many heading sizes use `clamp(min, vw, max)`. This makes the font scale proportionally with the viewport between a floor and ceiling, instead of either being fixed or requiring a media query per breakpoint.

### Scroll Fade-In System
```css
.fade-in {
  opacity: 0;
  transform: translateY(28px) scale(.98);
  transition: opacity .55s cubic-bezier(.22,1,.36,1), transform .55s cubic-bezier(.22,1,.36,1);
  will-change: transform, opacity;
}
.fade-in.visible { opacity: 1; transform: translateY(0) scale(1); }
```
Any element with `class="fade-in"` starts invisible and slightly below/scaled. When JavaScript adds the `visible` class (triggered by the IntersectionObserver in `nav.js`), the transition animates it into place. `cubic-bezier(.22,1,.36,1)` is a "spring" easing — it overshoots slightly and settles, which feels more natural than a linear fade. `will-change: transform, opacity` is a browser hint to prepare a compositing layer, making the animation smoother.

The `.fade-delay-1/2/3` classes add `transition-delay` so grid children reveal in sequence rather than all at once.

### Shared Animations
- `pulse` — used on status indicator dots (the green dot that shows "Online") to gently throb.
- `floatY` — used for decorative floating elements in the hero section.
- `logoEntrance` — fires once on page load to slide the nav logo in from the left. Applied directly on `.nav-logo` rather than via JavaScript.

---

## 3. css/nav.css

Contains all styles for the shared navigation bar, the hamburger menu, shared buttons, and shared section typography.

### Fixed Navigation Bar
```css
nav.site-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  background: rgba(26, 30, 26, .95);
  backdrop-filter: blur(18px);
  height: 64px;
}
```
- `position: fixed` keeps the nav visible while scrolling. `z-index: 100` ensures it sits above all page content (but below the scroll progress bar in `nav.js`, which uses `z-index: 200`).
- `rgba(26, 30, 26, .95)` is `--bg` at 95% opacity — slightly transparent so the page content scrolling underneath is hinted at.
- `backdrop-filter: blur(18px)` blurs what's behind the nav. This is what creates the frosted-glass effect. The `-webkit-` prefix is required for Safari.
- `height: 64px` is explicitly set. On mobile (when the menu is open), this becomes `height: auto; min-height: 64px` so the nav can expand downward to fit the dropdown links.

### Hamburger Menu
The hamburger button contains three `<span>` elements — they are the three lines. They have no text content; the visual is created entirely by CSS.

```html
<button class="nav-hamburger" onclick="this.closest('nav').classList.toggle('open')">
  <span></span><span></span><span></span>
</button>
```
- `this.closest('nav')` walks up the DOM tree to find the nearest `<nav>` ancestor and toggles the `open` class on it. This avoids needing JavaScript to find the nav by ID or class.
- `aria-label="Open menu"` provides accessible text for screen readers since the button has no visible text.

**The × animation:**
When the nav has class `open`, CSS targets the spans directly:
```css
.site-nav.open .nav-hamburger span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.site-nav.open .nav-hamburger span:nth-child(2) { opacity: 0; transform: scaleX(0); }
.site-nav.open .nav-hamburger span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
```
The top line moves down 7px and rotates 45°. The bottom line moves up 7px and rotates −45°. The middle line fades out. The result is a smooth morph from ☰ to ×.

### Mobile Dropdown Animation
```css
.nav-links {
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transform: translateY(-6px);
  transition: max-height .35s, opacity .25s, transform .30s;
  pointer-events: none;
}
.site-nav.open .nav-links {
  max-height: 400px;
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}
```
`display: none` cannot be transitioned — it switches instantly. Instead, `max-height: 0` with `overflow: hidden` creates a collapsible container. When opened, `max-height` jumps to `400px` (a value safely larger than the content). The fade and slide add polish. `pointer-events: none` while closed prevents clicks on invisible links.

### `.active` Nav Link
Links get `class="active"` added to the current page's link (hardcoded in HTML) or to the currently-scrolled section (via `nav.js`). The CSS gives the active link the brand green colour and draws a green underline via `::after` with `transform: scaleX(1)`.

### Shared Buttons
Two button styles are defined here because they appear on every page:
- `.btn-primary` — solid green background, black text. Used for the primary CTA action.
- `.btn-secondary` — transparent with a subtle border. Used for secondary actions like "Explore Features →". On hover the border shifts to green and the background gets a faint green tint (`--green-glow2`).

Both use `display: inline-flex; align-items: center; gap:` to vertically center inline SVG icons next to text without needing relative positioning.

---

## 4. css/footer.css

### Grid Layout
```css
.footer-inner {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr;
  gap: 40px;
}
```
Four columns: the brand column is 1.5× the width of the three link columns. This gives the brand area room for the tagline without wrapping. On tablets it collapses to `1fr 1fr`, and on mobile to a single column.

### Footer Bottom Bar
```css
.footer-bottom {
  display: flex; justify-content: space-between;
  border-top: 1px solid var(--border);
}
```
Copyright on the left, tagline on the right, separated by a top border. On mobile, `flex-direction: column` stacks them and centers both.

---

## 5. css/landing.css

Styles only used on `index.html`.

### Hero Section
```css
.hero {
  min-height: 100vh;
  padding-top: 64px; /* exactly the nav height */
}
```
`min-height: 100vh` ensures the hero fills the full viewport. `padding-top: 64px` offsets the fixed nav (64px tall) so the content is not hidden behind it.

**Hero grid background:**
```css
.hero-grid {
  background-image:
    linear-gradient(var(--border) 1px, transparent 1px),
    linear-gradient(90deg, var(--border) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse at 50% 0%, black 30%, transparent 70%);
}
```
Two overlapping linear gradients at 90° create a grid of 1px lines. The `mask-image` fades the grid out toward the bottom using a radial gradient — the grid is fully visible near the top centre and fades to invisible toward the edges and bottom.

**Hero radial glow:**
```css
.hero::before {
  background: radial-gradient(ellipse, rgba(0,230,118,.12) 0%, transparent 65%);
}
```
A subtle green ambient glow behind the hero content. `pointer-events: none` ensures it never intercepts clicks.

### Feature Cards
```css
.feat-icon {
  width: 40px; height: 40px;
  border-radius: 6px;
  background: var(--green-dark);
  border: 1px solid rgba(0,230,118,.2);
}
```
Each feature card has a small icon container. `--green-dark` is a very dark green, making it a low-contrast backdrop for the bright green SVG icon. The `rgba(0,230,118,.2)` border is 20% opacity green — visible enough to distinguish the icon from the card background without being loud.

### Chat Preview
The `.chat-preview` panel is a mock conversation to show how the app works, styled to look like a simple chat UI:
- `.cp-msg.user` — user messages with right-aligned layout (`flex-direction: row-reverse`)
- `.cp-msg.ai` — AI messages with left-aligned layout
- `.cp-mini-card` — a card inside an AI bubble showing structured data (calories, fiber, etc.) returned from the AI. Uses `var(--surface3)` and a green border to make it visually distinct from the bubble.

### Categories Grid
```css
.cat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
```
The four tracking categories (Diet, Activity, Symptoms, Energy) are in a 4-column grid on desktop, collapsing to 2×2 on tablet and a single column on mobile.

Each card has a `cat-icon` (an SVG at 32px) instead of an emoji. SVGs scale perfectly, stay crisply rendered at any DPI, and can be targeted with CSS — emoji rendering varies between operating systems and can look inconsistent.

### App Store Button
```css
.appstore-btn {
  display: flex; align-items: center; gap: 14px;
  background: var(--white); color: #000;
  padding: 12px 22px;
}
```
The App Store button is white on dark (inverted from the normal `btn-primary`) to match the conventional App Store badge appearance. It contains a logo SVG on the left and two lines of text (small "Download on the" + large "App Store") on the right.

---

## 6. css/about.css

Styles only used on `about.html`.

### Page Hero (shared pattern with features.html)
Both `about.html` and `features.html` use a "page hero" — a full-width section with a centred heading, a grid background, and a radial green glow. The structure is identical; they just have different class names (`.page-hero` vs `.features-hero`) because each is in its own CSS file.

### Mission Statement Layout
```css
.mission-body-only { max-width: 680px; margin: 0 auto; }
```
The mission text is a single centred column rather than a two-column layout. `max-width: 680px` keeps line length comfortable for reading (around 70–80 characters per line at typical font size).

### Values Grid
```css
.values-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
```
Six value cards in a 3-column grid. On tablet (≤860px) it drops to 2 columns; on mobile (≤480px) it goes to 1 column.

### Team Grid
```css
.team-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
```
Four team cards in a single row. On tablet/mobile this collapses to 2 per row. Team cards are `text-align: center` with the avatar at the top — a simple profile card layout.

### CTA Section
The final section (`.science-section` / `.about-cta-inner`) uses `display: flex; flex-direction: column; align-items: center` to stack the label, heading, paragraph, and button row as centred vertical content. This is simpler than a grid for a single-column centred block.

---

## 7. css/features.css

Styles only used on `features.html`.

### Sticky TOC (Table of Contents)
```css
.features-toc {
  position: sticky; top: 64px; z-index: 50;
}
```
The feature navigation bar sticks just below the main nav (`top: 64px` = nav height) as you scroll. `z-index: 50` is below the nav (`z-index: 100`) but above page content.

```css
.toc-inner {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.toc-inner::-webkit-scrollbar { display: none; }
```
On small screens the TOC items may not all fit. `overflow-x: auto` enables horizontal scrolling. `-webkit-overflow-scrolling: touch` enables momentum/inertia scrolling on iOS. Both `scrollbar-width: none` (Firefox) and `::-webkit-scrollbar { display: none }` (Chrome/Safari) hide the scrollbar — the list is still scrollable, just without a visible track.

### Feature Section Layout
```css
.feature-inner {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 70px; align-items: center;
}
.feature-inner.reverse { direction: rtl; }
.feature-inner.reverse > * { direction: ltr; }
```
Each feature section has copy on one side and a visual panel on the other. Alternating sections use `class="reverse"` to swap which side the copy appears on, creating visual variety. This is done using CSS `direction: rtl` (right-to-left) on the grid — which swaps child order — then `direction: ltr` restored on the children so text still reads left-to-right.

### Feature Visual Panels (`.feature-visual`)
Each panel is a card (`background: var(--surface2); border: 1px solid var(--border); border-radius: 8px`) containing mock UI:

- **Chat UI** (`.fv-chat`, `.fv-bubble`) — looks like the app's actual chat interface. User messages have a dark green-tinted background (`#0d2e1a`); AI messages have a dark neutral background (`#0f1f0f`). Both use the same border radius and max-width constraints as a real chat app would.
- **Bar charts** (`.fv-chart`, `.fv-bar`) — simple CSS-only bar charts. Heights are set inline (`style="height: 60px"`) to represent data values. The `.hi` class makes the highest bar the full brand green (`--green`); other bars use `--green-dark` (the dim version).
- **Metrics** (`.fv-metric`) — small stat tiles showing a numeric value in monospace font and a label beneath. Monospace is used for numbers so digits stay the same width and don't shift layout when the value changes.
- **Symptom list** (`.fv-symptom`, `.fv-sym-sev`) — severity badges use colour-coded backgrounds: green for "none", orange for "moderate", light green for "mild". These are defined as `.mild`, `.moderate`, `.none` modifier classes on `.fv-sym-sev`.

### Bullet Points
```css
.feature-bullets li::before {
  content: ''; width: 6px; height: 6px; border-radius: 50%;
  background: var(--green); flex-shrink: 0; margin-top: 6px;
}
```
Custom bullet points — the default browser bullet (`•`) can't be coloured easily and looks inconsistent. Instead, `list-style: none` removes the default bullet and a `::before` pseudo-element creates a small green filled circle. `margin-top: 6px` nudges it down to align with the first line of multi-line items. `flex-shrink: 0` prevents the dot from squashing if the text wraps.

### Comparison Table
```css
.compare-table td.highlight { background: rgba(0,230,118,.03); }
.compare-table th.highlight { color: var(--green); border-bottom-color: var(--green); }
.compare-table .check  { color: var(--green); font-weight: 700; }
.compare-table .cross  { color: var(--text-muted); }
```
The DigestiGo column gets a `.highlight` class on both `<th>` and `<td>` elements to subtly distinguish it from the competitor columns. Checkmarks use green; crosses use the muted text colour (de-emphasised, not aggressive red).

---

## 8. js/nav.js

All JavaScript is in a single file wrapped in an IIFE (`(function() { ... })()`). The IIFE prevents any variable from leaking into the global scope. `'use strict'` at the top catches common mistakes like using undeclared variables.

### 1. Scroll Progress Bar
```javascript
const progressBar = document.createElement('div');
// ... inline styles applied ...
window.addEventListener('scroll', () => {
  const pct = (window.scrollY / (h.scrollHeight - h.clientHeight)) * 100;
  progressBar.style.width = pct + '%';
}, { passive: true });
```
Creates a 2px green bar at the very top of the viewport (above the nav, `z-index: 200`) that grows as you scroll. Width is calculated as scroll position divided by total scrollable distance. `{ passive: true }` on scroll listeners tells the browser this handler never calls `preventDefault()`, allowing it to continue scrolling without waiting for the JS to finish — important for scroll performance.

### 2. IntersectionObserver Fade-in
```javascript
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const delay = parseFloat(e.target.dataset.stagger || 0);
      setTimeout(() => e.target.classList.add('visible'), delay);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
```
`IntersectionObserver` fires a callback when an element enters or leaves the viewport. `threshold: 0.1` means the element needs to be at least 10% visible before it triggers. `rootMargin: '0px 0px -40px 0px'` shrinks the bottom of the trigger zone by 40px — elements only fade in when they're 40px above the bottom edge, preventing elements from popping in right as they enter.

**Auto-stagger for grid children:**
```javascript
document.querySelectorAll('.features-grid, .cat-grid, .values-grid, ...').forEach(grid => {
  Array.from(grid.children).forEach((child, i) => {
    child.dataset.stagger = i * 80;
  });
});
```
Grid items are automatically given a `data-stagger` attribute equal to their index × 80ms. When the observer fires, it reads this attribute and adds `visible` after that many milliseconds — creating a cascading stagger effect without needing `fade-delay-N` classes on every individual item.

### 3. Cursor-following Glow
A `div` is inserted into the hero section and positioned to follow the mouse with a CSS transition. The transition creates smooth lag (0.6s cubic-bezier). On `mouseleave`, the glow drifts back to the centre (`50%, 40%`).

### 4. Magnetic Button Effect
```javascript
btn.addEventListener('mousemove', e => {
  const dx = e.clientX - (r.left + r.width / 2);
  const dy = e.clientY - (r.top + r.height / 2);
  btn.style.transform = `translate(${dx * .15}px, ${dy * .2}px)`;
});
```
Buttons slightly "lean" toward the cursor as it approaches. `dx` and `dy` are the distance from the cursor to the button's centre; multiplied by 0.15–0.2, this moves the button a fraction of that distance. On `mouseleave`, `transform` is cleared, snapping the button back.

### 5. Card 3D Tilt
```javascript
card.style.transform = `perspective(600px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateY(-4px)`;
```
`x` and `y` are the cursor position within the card normalised to −0.5…+0.5. Multiplied by 6°, this creates a subtle 3D tilt. `translateY(-4px)` lifts the card simultaneously. On `mouseleave`, a `transition` is briefly applied to ease it back, then removed so the hover-enter transition doesn't feel sluggish.

### 6. Phone Mockup Parallax
Checks for `.phone-wrap` elements and updates their `translateY` on scroll. The offset is calculated from the distance between the element's centre and the viewport centre, multiplied by 0.04 — a very gentle parallax that doesn't cause motion discomfort.

### 7. Floating Labels Drift
```javascript
function drift() {
  t += 0.012 * speed;
  el.style.transform = `translate(${Math.sin(t) * ampX}px, ${Math.cos(t * 0.8) * ampY}px)`;
  requestAnimationFrame(drift);
}
```
Each `.phone-float` element (floating info labels around the phone mockup) drifts continuously using a `requestAnimationFrame` loop. `Math.sin` and `Math.cos` at slightly different frequencies (`t` vs `t * 0.8`) create an organic figure-8 motion rather than a boring up-down oscillation. Each element gets a different starting phase (`i * 1.5`) and speed/amplitude so they move independently.

### 8. Active Nav Link on Scroll
```javascript
sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) current = s.id; });
navLinks.forEach(a => a.classList.toggle('active', href === `#${current}`));
```
Iterates over sections with `id` attributes. The last one whose top edge is within 120px of the top of the viewport is considered "current". The corresponding `<a href="#sectionId">` link gets the `active` class. The 120px offset accounts for the nav height + some breathing room.

### 9. Smooth Scroll
```javascript
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
```
Prevents the browser's default jump-scroll for anchor links and replaces it with `scrollIntoView({ behavior: 'smooth' })`. `e.preventDefault()` is only called if `target` exists — if the element doesn't exist on the page, normal navigation proceeds.

### 10. Features TOC Active State
A second `IntersectionObserver` watches the individual feature sections (`<section class="feature-section" id="...">`) and toggles `active` on the matching TOC link when a section enters the viewport. `rootMargin: '-100px 0px -50% 0px'` means a section is only considered "active" when it occupies the upper half of the viewport — preventing two sections from being active simultaneously during the transition zone.

### 11. Ripple Effect
On click, a `<span>` is inserted at the exact click coordinates inside the button. A CSS `@keyframes rippleAnim` animation expands it from 0 to 200px while fading to opacity 0. After 500ms the span is removed from the DOM. The keyframe CSS is injected once via `document.createElement('style')` and only if it doesn't already exist (checked by `id="ripple-style"`).

---

## 9. index.html

### Document Head
```html
<meta charset="UTF-8"/>
```
Tells the browser the file is encoded in UTF-8 — covers all special characters. Without this, non-ASCII characters (like `—` or `→`) may render as garbage.

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
```
Prevents mobile browsers from zooming out to show a desktop-width page. `width=device-width` sets the viewport width to the screen width. `initial-scale=1.0` starts at no zoom.

```html
<meta name="description" content="..."/>
```
The text that search engines display under the page title in search results. Not visible on the page itself.

**CSS load order matters:**
```html
<link rel="stylesheet" href="css/variables.css"/>
<link rel="stylesheet" href="css/nav.css"/>
<link rel="stylesheet" href="css/footer.css"/>
<link rel="stylesheet" href="css/landing.css"/>
```
`variables.css` must come first — all other files reference its custom properties. If `nav.css` loaded before `variables.css`, properties like `var(--green)` would be undefined.

### Navigation
```html
<nav class="site-nav">
```
Uses a `<nav>` semantic element (not a `<div>`) so assistive technologies know this region is site navigation.

```html
<a href="index.html" class="nav-logo">
```
The logo is an `<a>` tag — clicking it always goes home. `class="nav-logo"` applies the logo styles from `nav.css`.

```html
<button class="nav-hamburger" aria-label="Open menu"
        onclick="this.closest('nav').classList.toggle('open')">
  <span></span><span></span><span></span>
</button>
```
A `<button>` (not a `<div>`) is used because buttons are keyboard-focusable and triggered by Enter/Space by default, making the hamburger accessible. `aria-label` provides screen reader text.

```html
<a href="about.html" class="active">About</a>
```
`class="active"` is set manually on the current page's link so it's highlighted in green before any JavaScript runs.

### Hero Section
```html
<section class="hero">
  <div class="hero-grid"></div>
  <div class="container">
```
`<section>` is a semantic block element grouping related content (the hero). The empty `<div class="hero-grid">` holds only the background grid — having it as a separate element lets the grid be positioned absolutely without affecting the flow of hero content. `.container` is the shared max-width wrapper.

```html
<h1>Track While<br/><em>Conversing.</em></h1>
```
`<em>` wraps the key word. `nav.css`/`landing.css` styles `em` in headings with `color: var(--green); font-style: normal` to highlight it without italics.

### `id` Attributes on Sections
```html
<section class="landing-section surface" id="features">
<section class="landing-section" id="how">
<section class="cta-section" id="cta">
```
`id` attributes serve two purposes:
1. Nav links (`href="#how"`) jump directly to that section.
2. `nav.js` uses `section[id]` to detect which section is in view and update the active nav link.

The `.surface` class on alternating sections gives them a slightly lighter background (`--surface` instead of `--bg`), creating a visual zebra-stripe rhythm as you scroll.

### Footer `<script>` placement
```html
<script src="js/nav.js"></script>
</body>
```
The script is at the end of `<body>`, not in `<head>`. This means the entire HTML is parsed and the DOM is built before the script runs — so `document.querySelectorAll('.fade-in')` etc. will find elements. Putting it in `<head>` would run the script before the elements exist.

---

## 10. about.html

### `class="active"` on About link
```html
<a href="about.html" class="active">About</a>
```
Each page manually sets `active` on its own link. This highlights the current page in the nav immediately, without waiting for JavaScript.

### Hero `id`-less sections
The about page sections don't have `id` attributes (except for what they inherit via class). This is intentional — the about page doesn't have in-page anchor navigation or a TOC, so no IDs are needed.

### Values Grid
The six `.value-card` elements alternate `fade-in`, `fade-in fade-delay-1`, `fade-in fade-delay-2` in groups of three. The first three cards (`fade-in`, `fade-delay-1`, `fade-delay-2`) stagger at 0ms, 80ms, 160ms. The second row repeats the same delays — both rows reveal simultaneously but each row staggers internally. This is separate from `nav.js`'s auto-stagger, which applies to the grid container's direct children; the delays here are baked into the HTML for fine control.

### CTA Section reusing `.science-section`
The bottom CTA reuses the `.science-section` class name (originally used for the science citations section that was removed). This avoids creating a new CSS class for a section that shares the same background, border, and padding as the old one.

---

## 11. features.html

### TOC `href="#id"` Anchors
```html
<a href="#ai-chat" class="toc-link">AI Chat</a>
<a href="#diet" class="toc-link">Diet &amp; Nutrition</a>
```
Each TOC link uses a hash anchor that matches the `id` on the corresponding `<section>`. `nav.js` listens for scroll to highlight the matching link. The `&amp;` entity is the HTML-safe way to write `&` inside HTML attributes and text.

### `.feature-inner.reverse` Pattern
```html
<div class="feature-inner reverse">
  <div class="feature-copy">...</div>
  <div class="feature-visual">...</div>
</div>
```
Without `reverse`, copy is in the left column and visual in the right. With `reverse`, the `direction: rtl` CSS causes the grid to lay out right-to-left, putting the visual on the left and the copy on the right — without changing the HTML order. This ensures alternating layouts while keeping DOM order logical.

### Feature Visual Panels — Static HTML mock UIs
The visual panels contain hand-authored HTML that *looks* like the app's UI — chat bubbles, bar charts, symptom lists. They are not screenshots; they are raw HTML/CSS. This means they scale perfectly at any resolution, look sharp on retina displays, and load instantly with no image requests.

### Severity Badge Colours
```css
.fv-sym-sev.mild     { background: #1a2e0a; color: #8bc34a; }
.fv-sym-sev.moderate { background: #2e1a0a; color: var(--warn); }
.fv-sym-sev.none     { background: var(--green-dark); color: var(--green); }
```
Rather than using red/amber/green (which are inaccessible to red-green colourblind users and carry a clinical/alarming tone), the severity colours use green/orange/lighter-green. These are still distinguishable and match the dark-green design theme.

### HTML Entity Checkmarks in Comparison Table
```html
<td class="highlight check">&#10003; Estimated from text</td>
<td class="cross">&#10007;</td>
```
`&#10003;` is the Unicode check mark (✓) and `&#10007;` is the ballot X (✗). These render consistently across all browsers and operating systems, unlike emoji tick/cross marks which look different on iOS vs Windows vs Android.

### `<em>` in CTA headings
```html
<h2>Built for you,<br/><em>not your doctor.</em></h2>
```
Same pattern as the landing page — `<em>` in headings is styled as brand green + normal weight (not italic), making it a visual accent rather than a grammatical emphasis.

---

*End of guide. Last updated to reflect the current state of the codebase.*
