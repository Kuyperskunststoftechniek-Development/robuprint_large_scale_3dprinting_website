# RoBuPRINT — Bento Redesign Design Spec

Date: 2026-05-09
Status: Awaiting user review

## 1. Overview

The current site is functional but visually flat — tight typographic palette, single-column rhythm, no visual hooks for the differentiators (envelope size, robot-arm, recyclate). This spec re-skins the entire site into a **bento-grid / soft-modern** direction with **subtle motion** and **schematic SVG illustrations** as a placeholder for real photography (which doesn't exist yet).

The design extends the existing token system rather than replacing it. Existing functionality (i18n, forms, quote upload, Turnstile, JSON-LD) is untouched.

## 2. Goals

- Modernise the look and feel — bento layouts give the site visual rhythm and "hooks" for content
- Make the differentiators legible at a glance — large envelope number, robot-arm + post-mill, recyclate stream
- Be honest with the lack of photography — schematic SVGs that look intentional, not placeholder
- Stay performant — prerendered Nuxt site on Vercel, motion is opt-in via IntersectionObserver
- Preserve all current behaviour: i18n routes, forms, quote upload, sitemap, JSON-LD

## 3. Non-goals

- No new pages, no new backend endpoints, no new data model
- No CMS migration — content stays in i18n JSON files and `content/` markdown
- No real photography sourcing in this spec — handled separately when shoot is scheduled
- No dark-mode toggle — site stays light-mode; "dark surface" tiles are a styling choice, not a theme switch
- No replacement of Tailwind, Inter Tight, or JetBrains Mono — we're extending, not swapping
- No animation library (Framer Motion / GSAP) — small composable + CSS

## 4. Visual system updates

### 4.1 Colour tokens (additions to [tokens.css](robuprint-website/app/assets/css/tokens.css))

Existing tokens stay. We add:

```css
--color-surface-dark: #0B0B0F;       /* same as --color-text — high-contrast dark tile */
--color-surface-muted: #F4F1EB;      /* warmer tile background, between bg and border */
--color-accent-2: #2F6BFF;           /* gradient companion to --color-accent */
--gradient-accent: linear-gradient(135deg, var(--color-accent), var(--color-accent-2));

--shadow-tile: 0 1px 2px rgba(11,11,15,0.04), 0 4px 12px rgba(11,11,15,0.04);
--shadow-tile-hover: 0 2px 4px rgba(11,11,15,0.06), 0 12px 28px rgba(11,11,15,0.08);
```

No existing tokens are renamed or removed — change is purely additive.

### 4.2 Typography

Same families. Adjusted scale for hero/headline tiers:

- Hero h1: 54px → 64px on `≥md`, 40px on mobile, weight 800, tracking -0.025em
- Tile h3: 18–24px depending on tile size, weight 700, tracking -0.01em
- Eyebrow: existing mono `// LABEL` pattern retained, used as tile-section markers
- Hero "accent phrase" pattern: one phrase in the hero gets `color:var(--color-accent)` styled inline (see homepage spec below)

### 4.3 Surfaces & corners

Three tile surface variants:

| Variant   | Background                     | Foreground         | Used for                                           |
|-----------|--------------------------------|--------------------|----------------------------------------------------|
| `default` | `--color-surface` (#FFFFFF)    | text default       | Most informational tiles                           |
| `muted`   | `--color-surface-muted`        | text default       | Secondary tiles, schematic backdrops               |
| `dark`    | `--color-surface-dark` (#0B0B0F)| white             | Hero stat tiles, CTA bands                         |
| `accent`  | `--gradient-accent`            | white              | The single "headline-of-the-page" tile per section |

All tiles use `--radius-xl` (0.875rem). Borders only on `default` and `muted`.

### 4.4 Motion

A single composable handles entrance animation: `useReveal()`. The contract:

- The element to be revealed gets `data-reveal-target` set by the consumer (e.g. `BentoTile` sets it on its root by default).
- `useReveal()` finds these elements via a template ref and observes them with one shared IntersectionObserver.
- On first intersection the composable sets `data-reveal="true"` on that element and unobserves it (one-shot).
- CSS handles the visual transition. Honours `prefers-reduced-motion`.

```ts
// app/composables/useReveal.ts (sketch)
export function useReveal() { /* observe el(s), set data-reveal="true" once */ }
```

```css
[data-reveal-target] { opacity:0; transform: translateY(8px); transition: opacity .5s ease, transform .5s ease; }
[data-reveal-target][data-reveal="true"] { opacity:1; transform:none; }
@media (prefers-reduced-motion: reduce) { [data-reveal-target] { opacity:1; transform:none; transition:none; } }
```

Hover on tiles: `box-shadow` swaps from `--shadow-tile` to `--shadow-tile-hover` over 150ms. No transform on hover (keeps grid alignment).

No parallax. No scroll-driven motion beyond entrance reveal.

## 5. New components

All in [robuprint-website/app/components/](robuprint-website/app/components/). Follow existing folder convention: `base/`, `site/`, `home/`, `forms/`. Bento gets its own folder `bento/`.

### 5.1 `BentoGrid.vue`

CSS-grid wrapper. Breakpoints (Tailwind defaults):

- **Desktop (`≥md` / 768px):** 6 columns. The `span` prop on `BentoTile` is the desktop span, 1–6.
- **Tablet (`sm` to `md`, 640–768px):** 2 columns. Tiles collapse:
  - desktop `span-6` → tablet span-2
  - desktop `span-3`, `span-4` → tablet span-2
  - desktop `span-2` → tablet span-1
  - desktop `span-1` → tablet span-1 (uncommon; flagged in tile review)
- **Mobile (`<sm` / 640px):** 1 column. Every tile spans the full row.

Slot-only. Props: `gap?: 'sm' | 'md'` (default `md` = 14px). The collapse rules are implemented via Tailwind responsive classes inside `BentoTile`, not by reading children — `BentoGrid` itself is just the container.

### 5.2 `BentoTile.vue`

Single tile. Props:

- `span?: 1 | 2 | 3 | 4 | 6` (default 2) — column span on desktop
- `variant?: 'default' | 'muted' | 'dark' | 'accent'` (default `default`)
- `eyebrow?: string` — renders the `// LABEL` mono header
- `to?: string` — if set, the tile is a `<NuxtLink>` and gets hover lift

Slots: `default`, `illustration` (positioned absolutely in the bottom-right corner, used for SVG schematics).

Tile is responsible for its own padding, radius, shadow, hover transition, and reveal-target attribute.

### 5.3 `SchemIllustration.vue`

Single component, accepts `name` prop. Renders one of a small library of inline SVGs. Names (initial set):

- `envelope` — wireframe of the 4×4×8 m build envelope
- `robot-arm` — articulated arm silhouette with extruder tip
- `layer-stack` — stacked horizontal ellipses, evoking print layers
- `post-mill` — milling-bit silhouette over a layered surface
- `recyclate-flow` — pellet → arrow → printed layer pictogram
- `pellet` — single pellet glyph (small, for inline use)

All SVGs are `currentColor`-driven, so they inherit the tile's foreground colour. Defined inline in the component (no asset files) so they tree-shake unused names.

### 5.4 `useReveal.ts`

Composable described in §4.4. Used by `BentoTile.vue` automatically (every tile reveals on scroll).

## 6. Page-by-page intent

All pages keep their URLs and i18n routing. The current page files in [app/pages/](robuprint-website/app/pages/) are rewritten to use bento layouts; their i18n keys stay the same except where new copy is needed.

### 6.1 Home — [pages/index.vue](robuprint-website/app/pages/index.vue)

Replaces current `<HomeHero> + <UspGrid> + <ProjectsTeaser>` with one cohesive bento composition (matches the approved mockup):

1. **Hero block** (above the grid): eyebrow → 2-line h1 with one phrase in accent → subhead → primary CTA button. Asymmetric, max-width 720px, NOT a tile.
2. **Bento grid** (6 tiles):
   - `dark` span-3 — envelope number tile with envelope schematic
   - `accent` span-3 — "print + post-mill" tile with robot-arm schematic
   - `default` span-2 — HDPE/PP materials tile
   - `default` span-2 — recyclate tile
   - `muted` span-2 — "layer voor layer" with layer-stack schematic
   - `default` span-6 — projects teaser row (heading + 3 project preview cards)
3. **CTA band** (below the grid): full-width `dark` panel — "Onderdeel in gedachten? Stuur 'm op." with quote-CTA button.

Existing components `HomeHero.vue`, `UspGrid.vue`, `ProjectsTeaser.vue` are deleted (no longer referenced). Their i18n keys are reorganised under `home.bento.*`.

### 6.2 Wat wij doen — [pages/wat-wij-doen.vue](robuprint-website/app/pages/wat-wij-doen.vue)

The current vertical sections become a vertical sequence of mini bento groups. Each capability becomes a 4-tile bento group:

- 1 large `accent` or `dark` tile with the headline + schematic
- 2–3 supporting `default`/`muted` tiles with sub-points

Existing i18n `wat_wij_doen.sections[]` data stays; the renderer changes.

### 6.3 Materialen — [pages/materialen.vue](robuprint-website/app/pages/materialen.vue)

Bento grid built around materials:

- `dark` span-3 — HDPE specs (key/value list rendered as small mono pairs)
- `dark` span-3 — PP specs
- `accent` span-6 — "Factory-fresh recyclaat" headline tile with `recyclate-flow` schematic
- 3× `default` span-2 — recyclate spec breakdown (existing `recycle_specs[]` data)

### 6.4 Projecten — [pages/projecten/index.vue](robuprint-website/app/pages/projecten/index.vue) and `[slug].vue`

Index becomes a card grid using `BentoTile span-3` cards (2 columns desktop, 1 mobile) with project preview image (placeholder gradient), title, eyebrow tag, short description. Tile is `to=`-linked.

Project detail pages stay markdown-driven from `content/projects/`. Layout updates: a sticky sidebar tile with project meta + a content column; bento not used (long-read prose).

### 6.5 Over ons — [pages/over-ons.vue](robuprint-website/app/pages/over-ons.vue)

Editorial mix:

- Hero block (same pattern as home)
- 3 `default` span-2 story tiles (kept in sync with existing `about.sections[]`)
- 1 `dark` span-6 stat band: KvK / location / parent company info

### 6.6 Contact — [pages/contact.vue](robuprint-website/app/pages/contact.vue)

Form column (existing `<ContactForm>`) stays. We add a side bento column on desktop with 3 small tiles: address (Diamantweg 48, 5527 LC Hapert), KvK + BTW, opening hours (placeholder until provided). Mobile stacks form on top, tiles below.

### 6.7 Offerte — [pages/offerte.vue](robuprint-website/app/pages/offerte.vue)

Form chrome softened to match new tile aesthetic: form sections sit inside `default` tiles instead of plain blocks. Functionality (chunked upload, Turnstile, validation) untouched. The "what to upload" / "how it works" panels become `muted` tiles in a sidebar on desktop.

### 6.8 Site chrome — Header & Footer

- [SiteHeader.vue](robuprint-website/app/components/site/SiteHeader.vue): brand text gets a subtle "R" mark glyph next to the wordmark — a small (20×20) inline SVG matching the favicon (rounded accent square + bold white R, drawn as a path so it doesn't depend on font availability inside the SVG). Lives in `BrandMark.vue` so the same component is reused anywhere we need the mark. No header layout change.
- [SiteFooter.vue](robuprint-website/app/components/site/SiteFooter.vue): keep grid; restyle the company-info block as a small dark mini-tile to echo the bento language.

## 7. Asset & illustration plan

Schematic SVG library lives in `SchemIllustration.vue` (inline). Six initial names listed in §5.3. All drawn with thin lines (`stroke-width: 1.5`), `currentColor` strokes, no fills (or accent-fills only). They sit at ~40–60% opacity inside tiles so text reads on top.

When real photos arrive: each `<SchemIllustration name="..."/>` slot is replaced with `<NuxtImg src="..."/>` on a per-tile basis. The `BentoTile` `illustration` slot is the only thing that changes. No layout work needed.

## 8. Out of file scope (explicit)

- `content/projects/*.md` — case-study content stays as-is; only the layout that displays it changes
- `nuxt.config.ts` — no module additions
- Backend (`robuprint-api`) — untouched
- i18n keys — reorganised only for home (because the components are restructured); other locales preserve existing keys

## 9. Acceptance criteria

The redesign is done when:

1. All pages listed in §6 render with the new bento language and the existing i18n keys (NL + EN) without missing-key warnings
2. `useReveal` triggers fade-in on initial scroll-into-view; `prefers-reduced-motion: reduce` disables it
3. Lighthouse performance score on `/` ≥ 90 on desktop (was already passing — should not regress)
4. All existing forms (contact, quote, newsletter) still submit successfully end-to-end on the dev server
5. `pnpm test` (unit) and `pnpm test:e2e` (Playwright smoke) pass
6. Sitemap, JSON-LD, robots — no changes from current passing state
7. Mobile (≤640px): every page collapses to single-column tile stacking; no horizontal scroll

## 10. Implementation phasing (informational — actual phasing in plan doc)

Suggested order, smallest-blast-radius first:

1. Tokens + composable (`tokens.css`, `useReveal.ts`) — no UI change yet
2. `BentoGrid` + `BentoTile` + `SchemIllustration` — primitives only, with one tile rendered in a sandbox route to verify
3. Home rewrite — most-impact page, validates the system
4. Wat wij doen + Materialen — content-heavy pages
5. Over ons + Projecten index + Contact + Offerte
6. Site chrome polish (header glyph, footer mini-tile)
7. Visual regression check, Playwright e2e, Lighthouse spot-check

## 11. Risks & mitigations

| Risk                                                                 | Mitigation                                                                 |
|----------------------------------------------------------------------|----------------------------------------------------------------------------|
| Schematic illustrations look childish / cheap                        | Keep stroke-width minimal, no fills, use `currentColor` so they pick up tile foreground; review at a real screen size before committing |
| Bento layouts can become busy with too many tiles                    | Hard cap: max 6–7 tiles per section group; "negative space" tiles allowed (an empty `muted` tile is a feature) |
| Motion is disruptive on slow devices                                 | Single composable, IntersectionObserver, `prefers-reduced-motion` honoured, no continuous animations |
| The accent gradient tile becomes a focal-point trap on every page    | One `accent` tile per page, max — hard rule in `BentoTile` review         |
| Removing `HomeHero`/`UspGrid`/`ProjectsTeaser` leaves stale imports  | Plan deletion in the same commit that introduces the new home; ensure tests reference only new components |

## 12. Open questions for the user

None blocking — design is implementable as written. Items the user may still want to weigh in on later (NOT blocking this plan):

- Final illustration set (we can add more names beyond the initial six as content requires)
- Project preview "placeholder" tile look — current spec says gradient block; could be a unique schematic per project
- Whether `BentoTile to=` links should also reveal a hover-arrow icon (current spec: shadow-only hover)
