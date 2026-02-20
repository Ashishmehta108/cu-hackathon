# Awaaz — Landing Page Theme Guide

> **Inspired by:** Dribbble top AI Voice SaaS designs — RahMan's AI Voice Agent, Fixoria Studio's Voice AI, alice_kau's "A World Without Borders", and QClay's Voice AI System.

---

## 1. Design Direction & Mood

Awaaz's landing page should feel like a **premium civic-tech editorial magazine** — warm, serious, and deeply human. It does *not* feel like a startup dashboard or a gamified app. Think *The Hindu* meets *Linear.app*.

### Mood Keywords
- **Earthen Warmth** — like handmade paper, terracotta, and monsoon soil
- **Editorial Gravity** — long-form typography, asymmetric layouts, generous whitespace
- **Quiet Power** — no screaming gradients; restraint signals trust
- **Cultural Rootedness** — subtle Devanagari letterforms, saffron tones, India-earth palette

---

## 2. Color Palette

### Primary Palette — "Saffron Earth"

| Token | Hex | Usage |
|-------|-----|-------|
| `--cream` | `#FAF7F2` | Page background, primary surface |
| `--parchment` | `#F3EDE3` | Alternate section background |
| `--ink` | `#1C1714` | Primary text, dark cards, nav |
| `--amber` | `#C4874F` | Accent, highlights, CTAs, italic accents |
| `--amber-muted` | `#D4956A` | Hover states for amber elements |
| `--sage` | `#8B9D5E` | Wiki / knowledge feature accent |
| `--sage-dark` | `#5E7A2A` | Wiki feature labels |

### Border & Surface Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--border-light` | `#E8E0D4` | Subtle dividers, card borders |
| `--border-mid` | `#D4B896` | Active/hover borders |
| `--surface-glass` | `rgba(255,255,255,0.5)` | Glass effect cards |
| `--ink-soft` | `#5C5040` | Secondary text |
| `--ink-muted` | `#8B7355` | Tertiary text, labels |
| `--ink-faint` | `#A89880` | Placeholder, caption text |

### Dark Section Palette (used in "How it Works")

| Token | Hex | Usage |
|-------|-----|-------|
| `--dark-bg` | `#1C1714` | Section background |
| `--dark-text` | `#FAF7F2` | Text on dark sections |
| `--dark-muted` | `#A89880` | Secondary text on dark |
| `--dark-border` | `rgba(250,247,242,0.08)` | Borders on dark |
| `--amber-glow` | `rgba(196,135,79,0.25)` | Ambient glows on dark cards |

---

## 3. Typography System

### Font Stack

```
Serif Display: 'Playfair Display', Georgia, serif
  — Used for: all headlines (h1–h3), blockquotes, pull quotes, card titles
  — Weights: 400 (normal), italic for accent words
  — Feel: authoritative, editorial, timeless

Sans UI: 'Instrument Sans', system-ui, sans-serif
  — Used for: nav, labels, CTAs, body text, captions, badges
  — Weights: 400, 500 (medium), 600 (semibold)
  — Feel: clean, modern, functional

Multilingual Script: 'Noto Sans Devanagari', fallback
  — Used for: multilingual ticker, language pills showing Hindi/Bengali/Telugu/etc.
  — Supports all 22 Indian scripts without layout breaking
```

### Type Scale

| Element | Size | Weight | Font | Tracking |
|---------|------|--------|------|---------|
| Hero h1 | `clamp(3.4rem, 8.5vw, 7.5rem)` | 400 (normal) | Serif | `-0.03em` |
| Section h2 | `clamp(2rem, 4vw, 3.5rem)` | 400 | Serif | `-0.025em` |
| Card h3 | `1.7rem – 2rem` | 400 | Serif | `-0.02em` |
| UI Label | `0.65rem` | 600 | Sans | `+0.22em UPPERCASE` |
| Body | `0.85rem` | 400 | Sans | normal |
| Nav links | `0.8rem` | 500 | Sans | normal |
| CTA Buttons | `0.75rem – 0.82rem` | 600 | Sans | `+0.02em` |
| Stats Large | `3.2rem` | 400 | Serif | `-0.04em` |
| Captions | `0.72rem` | 500 | Sans | `+0.2em UPPERCASE` |

---

## 4. Layout System

### Grid Philosophy
- **Max content width**: `max-w-6xl` (72rem / 1152px)
- **Horizontal padding**: `px-6 md:px-10` (24px → 40px)
- **Column grid**: 12-column CSS grid for intentional asymmetry

### Section Rhythm
```
Section padding: py-24 md:py-36  (96px → 144px vertical)
Hero: min-h-screen, content justified to bottom (pb-24 pt-32)
Section gap between blocks: none — sections butt together as color bands
```

### Bento Grid (Features Section)
```
Left card  (7/12 cols): Large dark card — Complaint Portal
Right col  (5/12 cols): Stack of 2 cards
  — Top (flex-1): Wiki / Heritage Knowledge Base (sage-toned)
  — Bottom (auto): Language pill cloud card
```

---

## 5. Component Patterns

### Navigation Bar (Floating, Fixed)
```tsx
Position: fixed top, full-width, z-50
Background: transparent (no blur) — editorial style, not glassy
Logo: [Awaaz icon square] + Serif wordmark
Links: 3 items (About, Issues, Wiki) — underline slide on hover with amber
CTA: Pill-shaped dark button with mic icon — "Report Issue"
Mobile: same layout, hide nav links on mobile
```

### Hero Section
```
Layout: flex-col, justify-end (content anchors to bottom)
Background: cream (#FAF7F2)
Decorative elements:
  1. Large cursor-reactive warm amber orb (480px, position: top-right)
  2. Small sage-green blur circle (64px, position: left-center)
  3. Thin horizontal rule at 44% height (editorial detail)
  4. Giant decorative 'A' letterform (bottom-right, 28vw, barely visible)
  5. SVG noise texture (opacity: 0.022) — adds grain/paper feel

Hero content (max-w-6xl):
  Row 1: Pulsing "live issue count" pill badge (amber, animated dot)
  Row 2: 12-col grid
    - h1 (col 9): "Giving rural India / a formal voice / in governance"
      → "a formal voice" = italic amber text
    - Aside (col 3): short description + "Start now →" link
  Row 3: Bottom stats bar (separated by border-t)
    - Left: 3 large serif stat numbers with labels
    - Right: Two CTA buttons
```

### Marquee Ticker
```
Placement: Between Hero and How-It-Works section
Content: "Every Voice Matters" in 7 Indian languages
Style: cream background, amber letter-spacing labels, border-y separator
Animation: CSS marquee (50% movement, infinite, 28s)
```

### Process Section ("How it Works")
```
Background: Ink dark (#1C1714) — creates strong color band contrast
Content: Dark amber glow top-border + 3-column step grid
Each step:
  - Roman numeral (I, II, III) + thin divider line + icon
  - Serif h3 title (2 lines, white)
  - Sans body text (muted amber-brown)
No numbers, no connective arrows — editorial separation by roman numerals
```

### Features Bento Section
```
Background: Cream
Large left card (dark, #1C1714):
  - Ambient warm orb (top-right, expands on group-hover)
  - Noise texture
  - Microphone icon badge (amber-tinted)
  - Serif title with amber "Portal" accent
  - Muted white body text
  - "Get started →" label (no button, text link)
  - Group-hover: orb scales 150%, subtle translate-y

Small right top card (parchment):
  - Sage icon badge
  - Heritage Knowledge Base title
  - Muted body text
  - "Contribute →" label
  
Small right bottom card (white/glass):
  - Language pills showing 8 Indian scripts + "+92 more"
  - Pill style: cream bg, light border
```

### Testimonial / Blockquote Section
```
Background: Parchment (#F3EDE3)
Large serif opening quote mark (5rem, amber/25 opacity)
Blockquote: 1.4–2.4rem serif, amber italic for key outcome
Attribution: UPPERCASE small-caps sans label
```

### Footer
```
Background: Cream
3-column flex row:
  Left: Logo (icon + wordmark)
  Center: 4 nav links (About, Privacy, Contact, GitHub)
  Right: Tagline italic — "Empowering the silent, one voice at a time."
```

---

## 6. Motion & Animation System

### Principles
- **Ease curve**: `cubic-bezier(0.22, 1, 0.36, 1)` — fast start, graceful settle
- **Duration range**: 0.7s – 0.9s for page-level reveals
- **Stagger**: `0.09s` between sibling elements
- **Only trigger once**: `whileInView` with `{ once: true }`

### Animation Vocabulary

| Animation | Use | Config |
|-----------|-----|--------|
| `fadeUp` | All section content | `y: 22, opacity: 0, blur: 3px → 0` |
| `counterUp` | Stats section | Framer `useMotionValue` from 0 to target |
| `marquee` | Ticker | `x: 0% → -50%`, 28s, linear, infinite |
| `cursorOrb` | Hero amber orb | `x/y` mapped from mouse position |
| `orbExpand` | Feature card hover | `scale: 1 → 1.5` via `group-hover:` |
| `arrowSlide` | CTA "→" icons | `translateX: 0 → 1.5` on `group-hover:` |
| `pingDot` | Live issue badge | `animate-ping` CSS animation |
| `scrollFade` | Hero content on scroll | `opacity: 1 → 0` at 65% scroll |
| `scrollParallax` | Hero text | `y: 0 → 60px` as hero scrolls out |

---

## 7. Micro-Copy & Voice

### Section Labels (all-caps, letter-spaced)
```
"THE PROCESS"
"SUPPORTED LANGUAGES"
"N ISSUES RECORDED TODAY"
```

### Headline Style
```
Always sentence case (not Title Case)
Use line breaks intentionally — each line break = a pause
Italic em-colored words for emotional anchor:
  "Giving rural India / a formal voice / in governance"
  "AI drafts / the petition"
```

### CTA Copy
```
Primary: "Report an Issue" (with mic icon)
Secondary: "Share Wisdom" (with story icon)
Nav CTA: "Report Issue"
Card CTAs: "Get started →" / "Contribute →" / "Start now →"
```

---

## 8. Noise Texture Detail

Every section uses a subtle SVG `feTurbulence` noise overlay:

```tsx
<svg className="pointer-events-none absolute inset-0 h-full w-full" style={{ opacity: 0.025 }}>
  <filter id="n">
    <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
    <feColorMatrix type="saturate" values="0" />
  </filter>
  <rect width="100%" height="100%" filter="url(#n)" />
</svg>
```

Opacity varies by surface:
- Cream sections: `0.018 – 0.022`
- Dark sections: `0.03 – 0.035`
- Card surfaces: `0.02 – 0.035`

---

## 9. Responsiveness Rules

| Breakpoint | Behavior |
|------------|----------|
| `< 768px` (mobile) | Single-column, full-width; aside text hidden; bento stacks vertically |
| `768px+` (md) | 12-col grid activates; aside column appears; nav links visible |
| `1024px+` (lg) | Full layout; orb fully visible; large decorative type visible |

- **Font size**: All headlines use `clamp()` — never breaks at any size
- **Stats bar**: `flex-wrap`, wraps gracefully on mobile
- **Bento cards**: `col-span-12 md:col-span-7/5` — full width on mobile

---

## 10. Dribbble Design Inspirations Applied

| Design Feature | Dribbble Source | Applied In Awaaz As |
|----------------|-----------------|---------------------|
| Bento-box feature grid | RahMan — AI Voice Agent | Features section (7+5 col asymmetric grid) |
| Marquee brand credibility strip | alice_kau — "World Without Borders" | Multilingual ticker (languages instead of logos) |
| Dark section contrast band | Fixoria Studio Voice AI | "The Process" dark section |
| Pull-quote testimonial | QClay Voice AI System | Kamla Devi blockquote section |
| Pulsing live dot badge | Multiple SaaS designs | "N issues recorded today" hero badge |
| Cursor-reactive orb | Modern glassmorphism trend | Hero amber orb (mouse-tracked) |
| Giant background letterform | Editorial/Swiss design | Decorative "A" in hero |
| Roman numeral step system | Editorial magazines | Process steps I, II, III |

---

## 11. What to Avoid (Anti-patterns)

❌ **No gradient fills on hero headlines** — keep typography pure (no gradient text)  
❌ **No colored backgrounds on cards** — only cream, parchment, or ink  
❌ **No heavy drop shadows on cards** — use `shadow-sm` at most, or transparent hover-only shadows  
❌ **No heavy hover transforms** — max `hover:-translate-y-0.5`, never `hover:scale-105`  
❌ **No bright primary colors** — saffron orange (`#FF6B35`) is for icon accents only, not backgrounds  
❌ **No border-radius > `rounded-2xl`** — keep corners precise, not cartoonish  
❌ **No animation loops** — only `marquee` and `animate-ping` are looping; all others are one-shot  
❌ **No placeholder images** — use generated imagery or pure typographic/geometric design elements  

---

## 12. File References

| File | Role |
|------|------|
| `frontend/src/pages/Home.tsx` | Full landing page implementation |
| `frontend/src/index.css` | Global CSS variables + Tailwind utilities |
| `frontend/theme.md` | shadcn/ui component-level theme guide |
| `FRONTEND_CONTEXT.md` | Full app context for all other pages |
| `PLANNING.md` | Product strategy + feature list |

---

*Awaaz — PROTOWAR 1.0 | "The government gets a petition. The village gets its memory back."*
