# Bento Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-skin the entire RoBuPRINT site into the bento/soft-modern direction described in [2026-05-09-bento-redesign-design.md](../specs/2026-05-09-bento-redesign-design.md), without changing functionality, content sources, or backend behaviour.

**Architecture:** New presentational primitives (`BentoGrid`, `BentoTile`, `SchemIllustration`, `BrandMark`) and one composable (`useReveal`). Existing tokens are extended (additive only). Each existing page is rewritten to compose these primitives; existing forms, i18n, sitemap, and JSON-LD are preserved. No new modules in `nuxt.config.ts`, no new backend endpoints.

**Tech Stack:** Nuxt 4, Vue 3, Tailwind CSS v4, TypeScript, vitest 4 (happy-dom), Playwright. Adds one dev dep: `@vue/test-utils`.

---

## File Structure

**New files:**

| Path                                                                  | Responsibility                                                                       |
|-----------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| `app/composables/useReveal.ts`                                        | Single shared IntersectionObserver, sets `data-reveal="true"` on first visibility    |
| `app/components/bento/BentoGrid.vue`                                  | 6/2/1-column responsive CSS grid wrapper, slot only                                  |
| `app/components/bento/BentoTile.vue`                                  | Tile primitive — variant, span, eyebrow, optional `to=` link, illustration slot      |
| `app/components/bento/SchemIllustration.vue`                          | Inline SVG schematic dispatch by `name` prop                                         |
| `app/components/site/BrandMark.vue`                                   | Inline SVG R-monogram glyph (path-based, font-independent)                           |
| `app/pages/_sandbox/bento.vue`                                        | Visual sandbox route to verify primitives — deleted before Phase 3 finishes          |
| `tests/unit/useReveal.test.ts`                                        | Composable behaviour                                                                 |
| `tests/unit/SchemIllustration.test.ts`                                | Name → element dispatch                                                              |
| `tests/unit/BentoTile.test.ts`                                        | Variant classes + `to` prop branching                                                |

**Modified files:**

| Path                                            | Why                                                                  |
|-------------------------------------------------|----------------------------------------------------------------------|
| `app/assets/css/tokens.css`                     | Add new tokens, reveal-target CSS                                    |
| `nuxt.config.ts`                                | Register `~/components/bento` folder                                 |
| `app/pages/index.vue`                           | Full rewrite — bento home                                            |
| `app/pages/wat-wij-doen.vue`                    | Bento layout                                                         |
| `app/pages/materialen.vue`                      | Bento layout                                                         |
| `app/pages/over-ons.vue`                        | Editorial + bento stat band                                          |
| `app/pages/projecten/index.vue`                 | Card grid using BentoTile                                            |
| `app/pages/contact.vue`                         | Form + side bento                                                    |
| `app/pages/offerte.vue`                         | Form chrome softened to tiles                                        |
| `app/components/site/SiteHeader.vue`            | BrandMark glyph next to wordmark                                     |
| `app/components/site/SiteFooter.vue`            | Mini dark tile for company info                                      |
| `i18n/locales/nl/home.json`, `en/home.json`     | Reorganised under `home.bento.*`                                     |
| `package.json`                                  | Add `@vue/test-utils` dev dep                                        |

**Deleted files:**

- `app/components/home/HomeHero.vue`
- `app/components/home/UspGrid.vue`
- `app/components/home/ProjectsTeaser.vue`

---

## Phase 1 — Setup & foundation

### Task 1: Add `@vue/test-utils` dev dependency

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install dev dep**

```bash
cd robuprint-website
pnpm add -D @vue/test-utils
```

Expected: `package.json` gains `@vue/test-utils` under `devDependencies`, lockfile updated.

- [ ] **Step 2: Verify install**

```bash
pnpm exec vitest --version
```

Expected: prints a version string, no errors.

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(test): add @vue/test-utils for component tests"
```

---

### Task 2: Extend `tokens.css` with new colour and shadow tokens

**Files:**
- Modify: `app/assets/css/tokens.css`

- [ ] **Step 1: Add tokens (additive only — do not change existing values)**

Replace the `@theme { ... }` block in `app/assets/css/tokens.css` with:

```css
@theme {
  --color-bg: #FBFAF8;
  --color-surface: #FFFFFF;
  --color-surface-muted: #F4F1EB;
  --color-surface-dark: #0B0B0F;
  --color-text: #0B0B0F;
  --color-text-muted: #5B6470;
  --color-border: #E5E2DA;
  --color-accent: #1652F0;
  --color-accent-2: #2F6BFF;
  --color-accent-soft: rgba(22, 82, 240, 0.08);

  --gradient-accent: linear-gradient(135deg, var(--color-accent), var(--color-accent-2));

  --shadow-tile: 0 1px 2px rgba(11,11,15,0.04), 0 4px 12px rgba(11,11,15,0.04);
  --shadow-tile-hover: 0 2px 4px rgba(11,11,15,0.06), 0 12px 28px rgba(11,11,15,0.08);

  --font-sans: 'Inter Tight', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace;

  --radius-md: 0.625rem;
  --radius-lg: 0.75rem;
  --radius-xl: 0.875rem;
  --radius-pill: 9999px;
}
```

- [ ] **Step 2: Append the reveal CSS at the end of the file**

Append below `html, body { ... }`:

```css
[data-reveal-target] {
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
[data-reveal-target][data-reveal="true"] {
  opacity: 1;
  transform: none;
}
@media (prefers-reduced-motion: reduce) {
  [data-reveal-target] {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

- [ ] **Step 3: Run dev server to confirm no parse errors**

```bash
pnpm dev
```

Expected: Nuxt boots, no Tailwind/CSS errors in terminal. Open `http://localhost:3000/` — site renders unchanged. Stop server with Ctrl-C.

- [ ] **Step 4: Commit**

```bash
git add app/assets/css/tokens.css
git commit -m "feat(tokens): add bento surface, accent-2, gradient, shadow, reveal CSS"
```

---

### Task 3: `useReveal` composable (TDD)

**Files:**
- Create: `app/composables/useReveal.ts`
- Test: `tests/unit/useReveal.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/useReveal.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useReveal } from '~/composables/useReveal'

describe('useReveal', () => {
  let observed: Element[]
  let observerCb: IntersectionObserverCallback | null

  beforeEach(() => {
    observed = []
    observerCb = null

    class MockIO implements Partial<IntersectionObserver> {
      constructor(cb: IntersectionObserverCallback) { observerCb = cb }
      observe(el: Element) { observed.push(el) }
      unobserve = vi.fn()
      disconnect = vi.fn()
    }
    // @ts-expect-error happy-dom doesn't ship IntersectionObserver
    globalThis.IntersectionObserver = MockIO
  })

  it('observes elements with data-reveal-target', () => {
    document.body.innerHTML = `
      <div data-reveal-target id="a"></div>
      <div id="b"></div>
      <div data-reveal-target id="c"></div>
    `
    const { observeAll } = useReveal()
    observeAll(document.body)
    expect(observed.map((el) => (el as HTMLElement).id)).toEqual(['a', 'c'])
  })

  it('sets data-reveal="true" on intersecting element and unobserves it', () => {
    document.body.innerHTML = `<div data-reveal-target id="a"></div>`
    const { observeAll } = useReveal()
    observeAll(document.body)

    const el = document.getElementById('a')!
    expect(el.getAttribute('data-reveal')).toBeNull()

    observerCb!(
      [{ target: el, isIntersecting: true } as IntersectionObserverEntry],
      // @ts-expect-error mock observer
      {},
    )

    expect(el.getAttribute('data-reveal')).toBe('true')
  })

  it('does nothing when an entry is not intersecting', () => {
    document.body.innerHTML = `<div data-reveal-target id="a"></div>`
    const { observeAll } = useReveal()
    observeAll(document.body)
    const el = document.getElementById('a')!

    observerCb!(
      [{ target: el, isIntersecting: false } as IntersectionObserverEntry],
      // @ts-expect-error mock observer
      {},
    )

    expect(el.getAttribute('data-reveal')).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test tests/unit/useReveal.test.ts
```

Expected: FAIL — module `~/composables/useReveal` does not exist.

- [ ] **Step 3: Implement `useReveal`**

Create `app/composables/useReveal.ts`:

```ts
export function useReveal() {
  let observer: IntersectionObserver | null = null

  function ensure() {
    if (observer) return observer
    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          ;(entry.target as HTMLElement).setAttribute('data-reveal', 'true')
          observer!.unobserve(entry.target)
        }
      }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 })
    return observer
  }

  function observeAll(root: ParentNode = document) {
    const obs = ensure()
    root.querySelectorAll('[data-reveal-target]').forEach((el) => obs.observe(el))
  }

  return { observeAll }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test tests/unit/useReveal.test.ts
```

Expected: PASS — 3 tests passing.

- [ ] **Step 5: Commit**

```bash
git add app/composables/useReveal.ts tests/unit/useReveal.test.ts
git commit -m "feat(motion): useReveal composable with shared IntersectionObserver"
```

---

## Phase 2 — Bento primitives

### Task 4: `SchemIllustration` component (TDD)

**Files:**
- Create: `app/components/bento/SchemIllustration.vue`
- Test: `tests/unit/SchemIllustration.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/SchemIllustration.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SchemIllustration from '~/components/bento/SchemIllustration.vue'

const NAMES = ['envelope', 'robot-arm', 'layer-stack', 'post-mill', 'recyclate-flow', 'pellet'] as const

describe('SchemIllustration', () => {
  for (const name of NAMES) {
    it(`renders an svg for name="${name}"`, () => {
      const w = mount(SchemIllustration, { props: { name } })
      const svg = w.find('svg')
      expect(svg.exists()).toBe(true)
      expect(svg.attributes('data-schem')).toBe(name)
    })
  }

  it('renders nothing for an unknown name', () => {
    const w = mount(SchemIllustration, { props: { name: 'nope' as never } })
    expect(w.find('svg').exists()).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test tests/unit/SchemIllustration.test.ts
```

Expected: FAIL — component does not exist.

- [ ] **Step 3: Implement `SchemIllustration`**

Create `app/components/bento/SchemIllustration.vue`:

```vue
<script setup lang="ts">
type SchemName = 'envelope' | 'robot-arm' | 'layer-stack' | 'post-mill' | 'recyclate-flow' | 'pellet'
defineProps<{ name: SchemName }>()
</script>

<template>
  <svg v-if="name === 'envelope'" data-schem="envelope" viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
    <path d="M30 60 L30 170 L130 170 L130 60 L30 60 Z" />
    <path d="M30 60 L70 30 L170 30 L170 140 L130 170" />
    <path d="M130 60 L170 30" />
    <path d="M70 30 L70 140 L170 140 M70 140 L30 170" stroke-dasharray="3 3" />
  </svg>

  <svg v-else-if="name === 'robot-arm'" data-schem="robot-arm" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
    <circle cx="20" cy="80" r="8" />
    <line x1="20" y1="80" x2="50" y2="40" />
    <circle cx="50" cy="40" r="6" />
    <line x1="50" y1="40" x2="80" y2="20" />
    <circle cx="80" cy="20" r="4" />
    <line x1="80" y1="20" x2="86" y2="14" />
  </svg>

  <svg v-else-if="name === 'layer-stack'" data-schem="layer-stack" viewBox="0 0 140 140" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
    <ellipse cx="70" cy="115" rx="50" ry="8" />
    <ellipse cx="70" cy="100" rx="50" ry="8" />
    <ellipse cx="70" cy="85" rx="46" ry="7" />
    <ellipse cx="70" cy="72" rx="42" ry="6" />
    <ellipse cx="70" cy="60" rx="36" ry="5" />
    <ellipse cx="70" cy="50" rx="28" ry="4" />
  </svg>

  <svg v-else-if="name === 'post-mill'" data-schem="post-mill" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
    <line x1="60" y1="10" x2="60" y2="60" />
    <path d="M50 60 L70 60 L65 78 L55 78 Z" />
    <line x1="60" y1="78" x2="60" y2="92" />
    <path d="M20 100 L100 100" />
    <path d="M20 92 L100 92" stroke-dasharray="2 4" />
    <path d="M20 84 L100 84" stroke-dasharray="2 4" opacity="0.6" />
  </svg>

  <svg v-else-if="name === 'recyclate-flow'" data-schem="recyclate-flow" viewBox="0 0 160 80" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
    <circle cx="20" cy="40" r="5" /><circle cx="32" cy="40" r="5" /><circle cx="44" cy="40" r="5" />
    <line x1="58" y1="40" x2="100" y2="40" />
    <path d="M94 34 L100 40 L94 46" />
    <ellipse cx="130" cy="50" rx="22" ry="3" />
    <ellipse cx="130" cy="42" rx="20" ry="3" />
    <ellipse cx="130" cy="34" rx="16" ry="3" />
  </svg>

  <svg v-else-if="name === 'pellet'" data-schem="pellet" viewBox="0 0 24 16" fill="currentColor" aria-hidden="true">
    <ellipse cx="12" cy="8" rx="10" ry="6" />
  </svg>
</template>
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test tests/unit/SchemIllustration.test.ts
```

Expected: PASS — 7 tests passing (6 names + unknown).

- [ ] **Step 5: Commit**

```bash
git add app/components/bento/SchemIllustration.vue tests/unit/SchemIllustration.test.ts
git commit -m "feat(bento): SchemIllustration with 6 schematic SVGs"
```

---

### Task 5: `BentoGrid` component

**Files:**
- Create: `app/components/bento/BentoGrid.vue`

(No tests — pure CSS-grid wrapper with no logic. Verified visually in the sandbox route in Task 7.)

- [ ] **Step 1: Implement `BentoGrid`**

Create `app/components/bento/BentoGrid.vue`:

```vue
<script setup lang="ts">
withDefaults(defineProps<{ gap?: 'sm' | 'md' }>(), { gap: 'md' })
</script>

<template>
  <div
    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6"
    :class="gap === 'sm' ? 'gap-2' : 'gap-3.5'"
  >
    <slot />
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add app/components/bento/BentoGrid.vue
git commit -m "feat(bento): BentoGrid responsive 6/2/1-column wrapper"
```

---

### Task 6: `BentoTile` component (TDD)

**Files:**
- Create: `app/components/bento/BentoTile.vue`
- Test: `tests/unit/BentoTile.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/BentoTile.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BentoTile from '~/components/bento/BentoTile.vue'

describe('BentoTile', () => {
  it('renders as <div> by default', () => {
    const w = mount(BentoTile, { slots: { default: 'Hi' } })
    expect(w.element.tagName).toBe('DIV')
    expect(w.text()).toContain('Hi')
  })

  it('renders as a link when "to" is given', () => {
    const w = mount(BentoTile, {
      props: { to: '/projecten' },
      slots: { default: 'Hi' },
      global: { stubs: { NuxtLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } } },
    })
    expect(w.find('a').exists()).toBe(true)
    expect(w.find('a').attributes('href')).toBe('/projecten')
  })

  it('applies the dark variant class', () => {
    const w = mount(BentoTile, { props: { variant: 'dark' } })
    expect(w.attributes('data-variant')).toBe('dark')
  })

  it('applies the accent variant class', () => {
    const w = mount(BentoTile, { props: { variant: 'accent' } })
    expect(w.attributes('data-variant')).toBe('accent')
  })

  it('exposes data-reveal-target by default', () => {
    const w = mount(BentoTile)
    expect(w.attributes('data-reveal-target')).toBe('')
  })

  it('renders the eyebrow when given', () => {
    const w = mount(BentoTile, { props: { eyebrow: 'Materialen' } })
    expect(w.text()).toContain('// Materialen')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test tests/unit/BentoTile.test.ts
```

Expected: FAIL — component does not exist.

- [ ] **Step 3: Implement `BentoTile`**

Create `app/components/bento/BentoTile.vue`:

```vue
<script setup lang="ts">
type Variant = 'default' | 'muted' | 'dark' | 'accent'
type Span = 1 | 2 | 3 | 4 | 6

const props = withDefaults(
  defineProps<{
    variant?: Variant
    span?: Span
    eyebrow?: string
    to?: string
  }>(),
  { variant: 'default', span: 2 },
)

const SPAN_CLASS: Record<Span, string> = {
  1: 'md:col-span-1',
  2: 'sm:col-span-1 md:col-span-2',
  3: 'sm:col-span-2 md:col-span-3',
  4: 'sm:col-span-2 md:col-span-4',
  6: 'sm:col-span-2 md:col-span-6',
}

const VARIANT_CLASS: Record<Variant, string> = {
  default: 'bg-surface border border-border text-text',
  muted: 'bg-[var(--color-surface-muted)] border border-border text-text',
  dark: 'bg-[var(--color-surface-dark)] text-white',
  accent: 'bg-[image:var(--gradient-accent)] text-white',
}

const tag = props.to ? 'NuxtLink' : 'div'
</script>

<template>
  <component
    :is="tag"
    :to="to"
    data-reveal-target
    :data-variant="variant"
    class="relative overflow-hidden rounded-[var(--radius-xl)] p-6 min-h-[180px] flex flex-col gap-2 transition-shadow duration-150"
    :class="[
      SPAN_CLASS[span],
      VARIANT_CLASS[variant],
      to ? 'shadow-[var(--shadow-tile)] hover:shadow-[var(--shadow-tile-hover)] cursor-pointer' : 'shadow-[var(--shadow-tile)]',
    ]"
  >
    <p
      v-if="eyebrow"
      class="font-mono text-[10px] tracking-[0.18em] uppercase"
      :class="variant === 'dark' || variant === 'accent' ? 'text-[#7CA1FF]' : 'text-accent'"
    >// {{ eyebrow }}</p>

    <slot />

    <div class="absolute right-3 bottom-3 pointer-events-none opacity-50">
      <slot name="illustration" />
    </div>
  </component>
</template>
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test tests/unit/BentoTile.test.ts
```

Expected: PASS — 6 tests passing.

- [ ] **Step 5: Register the bento components folder in nuxt config**

Modify `nuxt.config.ts` — find the `components: [...]` array and add the bento entry:

```ts
  components: [
    { path: '~/components/base', pathPrefix: false },
    { path: '~/components/site', pathPrefix: false },
    { path: '~/components/home', pathPrefix: false },
    { path: '~/components/forms', pathPrefix: false },
    { path: '~/components/bento', pathPrefix: false },
  ],
```

- [ ] **Step 6: Commit**

```bash
git add app/components/bento/BentoTile.vue tests/unit/BentoTile.test.ts nuxt.config.ts
git commit -m "feat(bento): BentoTile primitive with variant + to-link branching"
```

---

### Task 7: Sandbox route to verify primitives visually

**Files:**
- Create: `app/pages/_sandbox/bento.vue`

- [ ] **Step 1: Implement sandbox**

Create `app/pages/_sandbox/bento.vue`:

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
const { observeAll } = useReveal()
onMounted(() => observeAll())
definePageMeta({ layout: false })
</script>

<template>
  <div class="max-w-[1200px] mx-auto px-6 py-12">
    <h1 class="text-2xl font-bold mb-6">Bento sandbox</h1>

    <BentoGrid>
      <BentoTile span="3" variant="dark" eyebrow="Build envelope">
        <h2 class="text-5xl font-extrabold tracking-tight">4×4×8</h2>
        <p class="font-mono text-[10px] text-[#9aa3b0]">METER (W × D × H) — 128 m³</p>
        <template #illustration><SchemIllustration name="envelope" class="w-44 h-44 text-[#7CA1FF]" /></template>
      </BentoTile>

      <BentoTile span="3" variant="accent" eyebrow="Print + post-mill">
        <h2 class="text-2xl font-bold">Dezelfde robot frees de finish strak na.</h2>
        <template #illustration><SchemIllustration name="robot-arm" class="w-24 h-24 text-white" /></template>
      </BentoTile>

      <BentoTile span="2" eyebrow="Materialen"><h2 class="font-bold">HDPE & PP</h2></BentoTile>
      <BentoTile span="2" eyebrow="Circulair"><h2 class="font-bold">Eigen recyclaat</h2></BentoTile>
      <BentoTile span="2" variant="muted" eyebrow="Process">
        <h2 class="font-bold">Layer voor layer</h2>
        <template #illustration><SchemIllustration name="layer-stack" class="w-32 h-32 text-accent" /></template>
      </BentoTile>

      <BentoTile span="6" to="/projecten" eyebrow="Recente projecten">
        <h2 class="text-2xl font-bold">Wat we voor anderen hebben gemaakt.</h2>
      </BentoTile>
    </BentoGrid>
  </div>
</template>
```

- [ ] **Step 2: Visual smoke check**

```bash
pnpm dev
```

Open `http://localhost:3000/_sandbox/bento`. Expected:
- 6 tiles in bento layout on desktop, all visible on first load (no fade-out from prior visit)
- Scrolling reloads the page; second-load tiles fade in from `opacity:0; translateY(8px)` (subtle reveal)
- Hover the projects tile (span-6) — the shadow deepens
- The accent tile uses the blue gradient; the dark tile is `#0B0B0F`
- Resize browser to ~700px — grid becomes 2 columns; ≤640px — 1 column
- Open DevTools, set `prefers-reduced-motion: reduce` — tiles render at full opacity immediately

Stop server with Ctrl-C. If any of the above fails, fix and re-verify before continuing.

- [ ] **Step 3: Commit**

```bash
git add app/pages/_sandbox/bento.vue
git commit -m "feat(bento): sandbox route to verify primitives"
```

---

## Phase 3 — Home

### Task 8: Reorganise home i18n keys

**Files:**
- Modify: `i18n/locales/nl/home.json`
- Modify: `i18n/locales/en/home.json`

- [ ] **Step 1: Read current `home.json` files for context**

```bash
cat i18n/locales/nl/home.json
cat i18n/locales/en/home.json
```

Note the existing keys (title, lead, usps[], projects_heading) — content is preserved, only structure changes.

- [ ] **Step 2: Replace `i18n/locales/nl/home.json`**

```json
{
  "hero": {
    "eyebrow": "Robotic large-scale 3D printing",
    "title_lead": "Onderdelen die",
    "title_accent": "te groot zijn",
    "title_tail": "voor reguliere 3D-print.",
    "subtitle": "HDPE en PP, robotic-arm extrusie, 4 × 4 × 8 m bouwruimte, post-mill finish. Vanuit Hapert voor klanten in NL/BE/DE.",
    "cta": "Offerte aanvragen"
  },
  "tiles": {
    "envelope_eyebrow": "Build envelope",
    "envelope_caption": "METER (W × D × H) — 128 m³",
    "envelope_body": "Eén stuk printen waar anderen moeten lassen of segmenteren.",

    "process_eyebrow": "Print + post-mill",
    "process_title": "Dezelfde robot frees de finish strak na.",
    "process_body": "Geen layer-lines waar het niet hoeft. Hybrid additive + subtractive in één opstelling.",

    "materials_eyebrow": "Materialen",
    "materials_title": "HDPE & PP",
    "materials_body": "Polyolefinen op deze schaal — bij ons standaard. Inclusief food-grade HDPE.",

    "recyclate_eyebrow": "Circulair",
    "recyclate_title": "Eigen recyclaat",
    "recyclate_body": "Single-stream restmateriaal direct uit Kuypers Kunststoftechniek. Traceerbaar tot batch.",

    "layers_eyebrow": "Process",
    "layers_title": "Layer voor layer",
    "layers_body": "FGF pellet-extrusie via robot-arm. Snel, schoon, schaalbaar."
  },
  "projects": {
    "eyebrow": "Recente projecten",
    "heading": "Wat we voor anderen hebben gemaakt.",
    "body": "Casestudies van architectonische elementen tot industriële onderdelen."
  },
  "cta_band": {
    "title": "Onderdeel in gedachten? Stuur 'm op voor een offerte.",
    "button": "Offerte aanvragen"
  }
}
```

- [ ] **Step 3: Replace `i18n/locales/en/home.json`**

```json
{
  "hero": {
    "eyebrow": "Robotic large-scale 3D printing",
    "title_lead": "Parts that are",
    "title_accent": "too big",
    "title_tail": "for ordinary 3D printing.",
    "subtitle": "HDPE and PP, robotic-arm extrusion, 4 × 4 × 8 m build envelope, post-mill finish. From Hapert to clients in NL/BE/DE.",
    "cta": "Request a quote"
  },
  "tiles": {
    "envelope_eyebrow": "Build envelope",
    "envelope_caption": "METRES (W × D × H) — 128 m³",
    "envelope_body": "Print in one piece what others have to weld or segment.",

    "process_eyebrow": "Print + post-mill",
    "process_title": "The same robot mills the finish smooth.",
    "process_body": "No layer lines where you don't want them. Hybrid additive + subtractive in one cell.",

    "materials_eyebrow": "Materials",
    "materials_title": "HDPE & PP",
    "materials_body": "Polyolefins at this scale — our standard. Includes food-grade HDPE.",

    "recyclate_eyebrow": "Circular",
    "recyclate_title": "Own recyclate",
    "recyclate_body": "Single-stream offcuts straight from Kuypers Kunststoftechniek. Traceable to batch.",

    "layers_eyebrow": "Process",
    "layers_title": "Layer by layer",
    "layers_body": "FGF pellet extrusion via robot arm. Fast, clean, scalable."
  },
  "projects": {
    "eyebrow": "Recent projects",
    "heading": "What we've made for others.",
    "body": "Case studies from architectural elements to industrial parts."
  },
  "cta_band": {
    "title": "Got a part in mind? Send it over for a quote.",
    "button": "Request a quote"
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add i18n/locales/nl/home.json i18n/locales/en/home.json
git commit -m "i18n(home): reorganise keys for bento layout (hero/tiles/projects/cta_band)"
```

---

### Task 9: Rewrite `pages/index.vue` using bento primitives

**Files:**
- Modify: `app/pages/index.vue`

- [ ] **Step 1: Replace the file**

Overwrite `app/pages/index.vue`:

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
const { t } = useI18n()
const localePath = useLocalePath()
useHead({ title: `${t('common.company')} — ${t('common.tagline_short')}` })

const { observeAll } = useReveal()
onMounted(() => observeAll())
</script>

<template>
  <div class="max-w-[1200px] mx-auto px-6 pt-16 pb-12">

    <section class="max-w-[760px] mb-12 md:mb-16" data-reveal-target>
      <p class="font-mono text-[11px] tracking-[0.18em] uppercase text-accent mb-4">// {{ t('home.hero.eyebrow') }}</p>
      <h1 class="text-[40px] md:text-[64px] font-extrabold tracking-tight leading-[1.02]">
        {{ t('home.hero.title_lead') }}
        <em class="not-italic text-accent">{{ t('home.hero.title_accent') }}</em>
        {{ t('home.hero.title_tail') }}
      </h1>
      <p class="mt-5 text-[15px] md:text-[16px] text-text-muted max-w-[560px] leading-relaxed">{{ t('home.hero.subtitle') }}</p>
      <NuxtLink :to="localePath('/offerte')" class="inline-flex mt-7 items-center text-[13px] font-medium px-5 py-2.5 bg-accent text-white rounded-[var(--radius-md)] hover:bg-[#1241C7] transition-colors">
        {{ t('home.hero.cta') }} →
      </NuxtLink>
    </section>

    <BentoGrid>
      <BentoTile span="3" variant="dark" :eyebrow="t('home.tiles.envelope_eyebrow')">
        <p class="text-[48px] md:text-[56px] font-extrabold tracking-[-0.03em] leading-none mt-1">4×4×8</p>
        <p class="font-mono text-[10px] tracking-[0.15em] text-[#9aa3b0]">{{ t('home.tiles.envelope_caption') }}</p>
        <p class="text-[13px] text-white/70 mt-2 max-w-[280px]">{{ t('home.tiles.envelope_body') }}</p>
        <template #illustration>
          <SchemIllustration name="envelope" class="w-44 h-44 text-[#7CA1FF]" />
        </template>
      </BentoTile>

      <BentoTile span="3" variant="accent" :eyebrow="t('home.tiles.process_eyebrow')">
        <h2 class="text-[20px] md:text-[22px] font-bold leading-snug max-w-[320px]">{{ t('home.tiles.process_title') }}</h2>
        <p class="text-[13px] text-white/80 mt-1 max-w-[300px]">{{ t('home.tiles.process_body') }}</p>
        <template #illustration>
          <SchemIllustration name="robot-arm" class="w-24 h-24 text-white" />
        </template>
      </BentoTile>

      <BentoTile span="2" :eyebrow="t('home.tiles.materials_eyebrow')">
        <h3 class="text-[18px] font-bold">{{ t('home.tiles.materials_title') }}</h3>
        <p class="text-[13px] text-text-muted">{{ t('home.tiles.materials_body') }}</p>
      </BentoTile>

      <BentoTile span="2" :eyebrow="t('home.tiles.recyclate_eyebrow')">
        <h3 class="text-[18px] font-bold">{{ t('home.tiles.recyclate_title') }}</h3>
        <p class="text-[13px] text-text-muted">{{ t('home.tiles.recyclate_body') }}</p>
      </BentoTile>

      <BentoTile span="2" variant="muted" :eyebrow="t('home.tiles.layers_eyebrow')">
        <h3 class="text-[18px] font-bold">{{ t('home.tiles.layers_title') }}</h3>
        <p class="text-[13px] text-text-muted">{{ t('home.tiles.layers_body') }}</p>
        <template #illustration>
          <SchemIllustration name="layer-stack" class="w-32 h-32 text-accent" />
        </template>
      </BentoTile>

      <BentoTile span="6" :to="localePath('/projecten')" :eyebrow="t('home.projects.eyebrow')">
        <h2 class="text-[24px] font-bold tracking-tight">{{ t('home.projects.heading') }}</h2>
        <p class="text-[13px] text-text-muted max-w-[420px]">{{ t('home.projects.body') }}</p>
      </BentoTile>
    </BentoGrid>

    <section class="mt-6 rounded-[var(--radius-xl)] bg-[var(--color-surface-dark)] text-white p-7 md:p-9 flex flex-col md:flex-row md:items-center md:justify-between gap-4" data-reveal-target>
      <h2 class="text-[20px] md:text-[24px] font-bold leading-snug max-w-[520px]">{{ t('home.cta_band.title') }}</h2>
      <NuxtLink :to="localePath('/offerte')" class="inline-flex items-center text-[13px] font-medium px-5 py-2.5 bg-accent text-white rounded-[var(--radius-md)] hover:bg-[#1241C7] transition-colors">
        {{ t('home.cta_band.button') }} →
      </NuxtLink>
    </section>
  </div>
</template>
```

- [ ] **Step 2: Run dev server and verify visually**

```bash
pnpm dev
```

Open `http://localhost:3000/`. Expected:
- Hero with the accent-coloured "te groot zijn" phrase
- 6 tiles below in the layout from the spec (dark envelope, accent process, 3 default tiles, projects span-6)
- Dark CTA band at the bottom
- All text is in Dutch by default; switching to EN via the lang switcher swaps to English copy
- No console errors, no missing-i18n-key warnings

Open `http://localhost:3000/en/`. Same layout, English copy.

Stop server with Ctrl-C.

- [ ] **Step 3: Commit**

```bash
git add app/pages/index.vue
git commit -m "feat(home): bento layout — hero + 6 tiles + dark CTA band"
```

---

### Task 10: Delete obsolete home components

**Files:**
- Delete: `app/components/home/HomeHero.vue`
- Delete: `app/components/home/UspGrid.vue`
- Delete: `app/components/home/ProjectsTeaser.vue`

- [ ] **Step 1: Verify nothing else references them**

```bash
grep -r "HomeHero\|UspGrid\|ProjectsTeaser" app/ --include='*.vue' --include='*.ts'
```

Expected: no matches (the new `index.vue` no longer uses these).

- [ ] **Step 2: Delete the files**

```bash
rm app/components/home/HomeHero.vue
rm app/components/home/UspGrid.vue
rm app/components/home/ProjectsTeaser.vue
```

- [ ] **Step 3: Run dev server, confirm home still renders**

```bash
pnpm dev
```

Open `http://localhost:3000/` — page renders, no errors. Stop server.

- [ ] **Step 4: Commit**

```bash
git add app/components/home/
git commit -m "chore(home): remove obsolete HomeHero/UspGrid/ProjectsTeaser"
```

---

### Task 11: Verify Phase 3 (smoke + e2e)

- [ ] **Step 1: Run unit tests**

```bash
pnpm test
```

Expected: all tests pass (chunker, validators, useChunkedUpload, useReveal, SchemIllustration, BentoTile).

- [ ] **Step 2: Run e2e smoke**

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

Expected: all 8 tests pass (7 routes + lang switcher). The home test asserts "RoBuPRINT" is visible — that comes from the SiteHeader brand link, which still exists.

If any fail, fix before continuing. Common failure: `home.usps` accessed in some leftover code — search and remove.

- [ ] **Step 3: No commit needed** — verification only.

---

## Phase 4 — Capability + material pages

### Task 12: Rewrite `pages/wat-wij-doen.vue`

**Files:**
- Modify: `app/pages/wat-wij-doen.vue`

- [ ] **Step 1: Read current file for content reference**

```bash
cat app/pages/wat-wij-doen.vue
cat i18n/locales/nl/wat_wij_doen.json
```

Note the structure: a list of capability sections with `eyebrow`, `title`, `body`, `points[]`.

- [ ] **Step 2: Replace the file**

Overwrite `app/pages/wat-wij-doen.vue`:

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
const { t, tm } = useI18n()
useHead({ title: `${t('wat_wij_doen.title')} · ${t('common.company')}` })

const { observeAll } = useReveal()
onMounted(() => observeAll())

interface Section { eyebrow: string; title: string; body: string; points: string[] }
const sections = computed(() => tm('wat_wij_doen.sections') as Section[])

// Map each section index to a schematic name (cycle if more sections than schemes)
const SCHEM = ['envelope', 'robot-arm', 'post-mill', 'layer-stack'] as const
function schemFor(i: number) { return SCHEM[i % SCHEM.length] }
</script>

<template>
  <div class="max-w-[1200px] mx-auto px-6 pt-16 pb-12">
    <section class="max-w-[760px] mb-12" data-reveal-target>
      <h1 class="text-[40px] md:text-[56px] font-extrabold tracking-tight leading-[1.04]">{{ t('wat_wij_doen.title') }}</h1>
      <p class="mt-4 text-text-muted text-[15px] max-w-[600px]">{{ t('wat_wij_doen.lead') }}</p>
    </section>

    <div class="space-y-6">
      <BentoGrid v-for="(s, i) in sections" :key="i">
        <BentoTile
          span="3"
          :variant="i % 2 === 0 ? 'dark' : 'accent'"
          :eyebrow="s.eyebrow"
        >
          <h2 class="text-[24px] md:text-[28px] font-bold tracking-tight leading-tight max-w-[320px]">{{ s.title }}</h2>
          <p class="text-[13px] mt-2 max-w-[320px]" :class="i % 2 === 0 ? 'text-white/70' : 'text-white/85'">{{ s.body }}</p>
          <template #illustration>
            <SchemIllustration :name="schemFor(i)" class="w-28 h-28" :class="i % 2 === 0 ? 'text-[#7CA1FF]' : 'text-white'" />
          </template>
        </BentoTile>

        <BentoTile
          v-for="(p, j) in s.points.slice(0, 3)"
          :key="j"
          span="1"
          variant="muted"
        >
          <p class="text-[13px] leading-relaxed">{{ p }}</p>
        </BentoTile>
      </BentoGrid>
    </div>
  </div>
</template>
```

- [ ] **Step 3: Visual check**

```bash
pnpm dev
```

Open `http://localhost:3000/wat-wij-doen`. Expected:
- Each capability section is a bento group: 1 large dark/accent tile + up to 3 small muted point-tiles
- Sections alternate dark/accent for the lead tile
- Smooth fade-in on scroll

Stop server.

- [ ] **Step 4: Commit**

```bash
git add app/pages/wat-wij-doen.vue
git commit -m "feat(wat-wij-doen): bento groups with schematic lead tiles"
```

---

### Task 13: Rewrite `pages/materialen.vue`

**Files:**
- Modify: `app/pages/materialen.vue`

- [ ] **Step 1: Read current file and i18n**

```bash
cat app/pages/materialen.vue
cat i18n/locales/nl/materials.json | head -40
```

Note: the file uses `materials.materials[]` for HDPE/PP entries and `materials.recycle_specs[]` for recyclate entries.

- [ ] **Step 2: Replace the file**

Overwrite `app/pages/materialen.vue`:

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
const { t, tm } = useI18n()
useHead({ title: `${t('materials.title')} · ${t('common.company')}` })

const { observeAll } = useReveal()
onMounted(() => observeAll())

interface MaterialEntry { name: string; specs: { k: string; v: string }[]; points: string[] }
interface SpecPair { k: string; v: string }

const materials = computed(() => tm('materials.materials') as MaterialEntry[])
const recycleSpecs = computed(() => tm('materials.recycle_specs') as SpecPair[])
</script>

<template>
  <div class="max-w-[1200px] mx-auto px-6 pt-16 pb-12">
    <section class="max-w-[760px] mb-12" data-reveal-target>
      <h1 class="text-[40px] md:text-[56px] font-extrabold tracking-tight leading-[1.04]">{{ t('materials.title') }}</h1>
      <p class="mt-4 text-text-muted text-[15px] max-w-[620px]">{{ t('materials.lead') }}</p>
    </section>

    <BentoGrid>
      <BentoTile
        v-for="(m, i) in materials"
        :key="i"
        span="3"
        variant="dark"
        :eyebrow="m.name"
      >
        <ul class="font-mono text-[11px] grid grid-cols-2 gap-x-3 gap-y-1 mt-2">
          <template v-for="(s, j) in m.specs" :key="j">
            <li class="text-[#9aa3b0] uppercase tracking-wider">{{ s.k }}</li>
            <li class="text-white">{{ s.v }}</li>
          </template>
        </ul>
        <ul class="text-[12px] text-white/75 mt-3 space-y-1">
          <li v-for="(p, k) in m.points" :key="k">— {{ p }}</li>
        </ul>
      </BentoTile>

      <BentoTile span="6" variant="accent" :eyebrow="t('materials.recycle_heading')">
        <h2 class="text-[22px] md:text-[26px] font-bold leading-tight max-w-[640px]">{{ t('materials.recycle_body') }}</h2>
        <template #illustration>
          <SchemIllustration name="recyclate-flow" class="w-40 h-20 text-white" />
        </template>
      </BentoTile>

      <BentoTile
        v-for="(s, i) in recycleSpecs"
        :key="i"
        span="2"
      >
        <p class="font-mono text-[10px] uppercase tracking-wider text-text-muted">{{ s.k }}</p>
        <p class="text-[15px] font-semibold mt-1">{{ s.v }}</p>
      </BentoTile>
    </BentoGrid>
  </div>
</template>
```

- [ ] **Step 3: Visual check**

```bash
pnpm dev
```

Open `http://localhost:3000/materialen`. Expected:
- Two large dark tiles with mono spec key/values for HDPE and PP
- Below: full-width accent tile with recyclate-flow schematic
- Below: small default tiles for each recyclate spec pair

If the existing i18n shape doesn't match (e.g. `materials.materials[]` doesn't exist) — open `i18n/locales/nl/materials.json` and adapt the `tm()` paths to match what's there. Common alternatives: `materials.entries`, `materials.list`. Update both NL and EN if the path changes.

Stop server.

- [ ] **Step 4: Commit**

```bash
git add app/pages/materialen.vue
git commit -m "feat(materialen): bento layout — material spec tiles + recyclate band"
```

---

## Phase 5 — Remaining pages

### Task 14: Rewrite `pages/over-ons.vue`

**Files:**
- Modify: `app/pages/over-ons.vue`

- [ ] **Step 1: Read current file**

```bash
cat app/pages/over-ons.vue
cat i18n/locales/nl/about.json
```

- [ ] **Step 2: Replace the file**

Overwrite `app/pages/over-ons.vue`:

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
const { t, tm } = useI18n()
useHead({ title: `${t('about.title')} · ${t('common.company')}` })

const { observeAll } = useReveal()
onMounted(() => observeAll())

interface Section { heading: string; body: string }
const sections = computed(() => tm('about.sections') as Section[])
</script>

<template>
  <div class="max-w-[1200px] mx-auto px-6 pt-16 pb-12">

    <section class="max-w-[760px] mb-12" data-reveal-target>
      <h1 class="text-[40px] md:text-[56px] font-extrabold tracking-tight leading-[1.04]">{{ t('about.title') }}</h1>
      <p class="mt-4 text-text-muted text-[15px] max-w-[620px]">{{ t('about.lead') }}</p>
    </section>

    <BentoGrid>
      <BentoTile
        v-for="(s, i) in sections"
        :key="i"
        span="2"
        :variant="i === 0 ? 'muted' : 'default'"
        :eyebrow="s.heading"
      >
        <p class="text-[14px] leading-relaxed text-text-muted">{{ s.body }}</p>
      </BentoTile>

      <BentoTile span="6" variant="dark" eyebrow="Bedrijfsgegevens">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mt-2 text-[13px]">
          <div>
            <p class="font-mono text-[10px] uppercase tracking-wider text-[#9aa3b0]">Vestiging</p>
            <p class="mt-1">Diamantweg 48</p>
            <p>5527 LC Hapert</p>
          </div>
          <div>
            <p class="font-mono text-[10px] uppercase tracking-wider text-[#9aa3b0]">Moederbedrijf</p>
            <p class="mt-1">Kuypers Kunststoftechniek</p>
          </div>
          <div>
            <p class="font-mono text-[10px] uppercase tracking-wider text-[#9aa3b0]">KvK</p>
            <p class="mt-1">18036761</p>
          </div>
          <div>
            <p class="font-mono text-[10px] uppercase tracking-wider text-[#9aa3b0]">BTW</p>
            <p class="mt-1">NL801225401B01</p>
          </div>
        </div>
      </BentoTile>
    </BentoGrid>
  </div>
</template>
```

- [ ] **Step 3: Visual check + commit**

```bash
pnpm dev
```

Verify at `http://localhost:3000/over-ons` — story tiles + dark stat band with KvK/BTW/address. Stop server.

```bash
git add app/pages/over-ons.vue
git commit -m "feat(over-ons): bento story tiles + dark company stat band"
```

---

### Task 15: Rewrite `pages/projecten/index.vue` and refresh `[slug].vue`

**Files:**
- Modify: `app/pages/projecten/index.vue`
- Modify: `app/pages/projecten/[slug].vue` (only if it exists — see Step 5 below)

- [ ] **Step 1: Read current file**

```bash
cat app/pages/projecten/index.vue
```

Identify the data source — likely `queryCollection('projects').all()` or a similar `@nuxt/content` query.

- [ ] **Step 2: Replace the file (preserve the existing data fetch)**

Overwrite the file, keeping the same query mechanism but rendering with `BentoTile`:

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
const { t } = useI18n()
const localePath = useLocalePath()
useHead({ title: `${t('projects.title')} · ${t('common.company')}` })

const { observeAll } = useReveal()
onMounted(() => observeAll())

// NOTE: keep the query exactly as the previous version had it.
// Read app/pages/projecten/index.vue's existing fetch and paste it here unchanged.
const { data: projects } = await useAsyncData('projects', () =>
  queryCollection('projects').order('date', 'DESC').all(),
)
</script>

<template>
  <div class="max-w-[1200px] mx-auto px-6 pt-16 pb-12">
    <section class="max-w-[760px] mb-12" data-reveal-target>
      <h1 class="text-[40px] md:text-[56px] font-extrabold tracking-tight leading-[1.04]">{{ t('projects.title') }}</h1>
      <p class="mt-4 text-text-muted text-[15px] max-w-[620px]">{{ t('projects.lead') }}</p>
    </section>

    <div v-if="!projects || projects.length === 0" class="rounded-[var(--radius-xl)] border border-border bg-[var(--color-surface-muted)] p-10 text-center text-text-muted">
      <p>{{ t('projects.empty') }}</p>
    </div>

    <BentoGrid v-else>
      <BentoTile
        v-for="p in projects"
        :key="p.path"
        span="3"
        :to="localePath(p.path)"
        :eyebrow="p.client || ''"
      >
        <div class="-mt-2 -mx-2 mb-3 h-32 rounded-[var(--radius-lg)] bg-[linear-gradient(135deg,var(--color-border),var(--color-surface))]" />
        <h2 class="text-[18px] font-bold tracking-tight">{{ p.title }}</h2>
        <p class="text-[13px] text-text-muted line-clamp-3 mt-1">{{ p.description }}</p>
        <p class="mt-3 text-accent text-[12px] font-medium">{{ t('projects.view_project') }} →</p>
      </BentoTile>
    </BentoGrid>
  </div>
</template>
```

If the original query used a different path or method (e.g. `queryContent('/projects')` for older Nuxt Content), keep that exactly — only the layout changes.

- [ ] **Step 3: Visual check (index)**

```bash
pnpm dev
```

Verify `/projecten` — list (or empty state). Stop server.

- [ ] **Step 4: Commit (index)**

```bash
git add app/pages/projecten/index.vue
git commit -m "feat(projecten): bento card grid for project index"
```

- [ ] **Step 5: Update `[slug].vue` if it exists**

Per spec §6.4, the detail page does NOT use bento (long-read prose), but does get a sticky sidebar tile + content column.

```bash
ls app/pages/projecten/[slug].vue 2>/dev/null && echo EXISTS || echo MISSING
```

- If `MISSING`: skip the rest of this task.
- If `EXISTS`: open the file, identify the existing layout (likely a markdown renderer like `<ContentDoc>` or `<ContentRenderer>`), then replace the template with:

```vue
<template>
  <article class="max-w-[1200px] mx-auto px-6 pt-16 pb-16 grid grid-cols-1 md:grid-cols-[1fr_280px] gap-10">
    <div class="prose prose-neutral max-w-[720px]">
      <!-- KEEP the same content/markdown render call that was here before -->
      <ContentRenderer v-if="page" :value="page" />
    </div>
    <aside class="md:sticky md:top-24 md:self-start space-y-3">
      <BentoTile span="2" variant="muted" eyebrow="Klant">
        <p class="text-[14px] font-semibold">{{ page?.client || '—' }}</p>
      </BentoTile>
      <BentoTile span="2" variant="muted" eyebrow="Materiaal">
        <p class="text-[14px]">{{ page?.material || '—' }}</p>
      </BentoTile>
      <BentoTile span="2" variant="dark" eyebrow="Status">
        <p class="text-[13px] text-white">{{ page?.year || '—' }}</p>
      </BentoTile>
    </aside>
  </article>
</template>
```

The `script setup` block stays as-is — only the `<template>` changes. If the existing script names the content variable something other than `page` (e.g. `data`, `project`), use that name in the template above.

- [ ] **Step 6: Visual check + commit (detail)**

If you updated `[slug].vue`, navigate to a project URL (find one via `/projecten`) and verify the prose column + sticky sidebar tiles. Stop server.

```bash
git add app/pages/projecten/[slug].vue
git commit -m "feat(projecten): sticky sidebar tiles on project detail"
```

If `[slug].vue` didn't exist, skip the commit.

---

### Task 16: Add side bento to `pages/contact.vue`

**Files:**
- Modify: `app/pages/contact.vue`

- [ ] **Step 1: Replace the file**

Overwrite `app/pages/contact.vue`:

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
const { t } = useI18n()
useHead({ title: `${t('contact.title')} · ${t('common.company')}` })
definePageMeta({ alias: ['/en/contact'] })

const { observeAll } = useReveal()
onMounted(() => observeAll())
</script>

<template>
  <div class="max-w-[1200px] mx-auto px-6 py-20">
    <h1 class="text-[40px] md:text-[48px] font-extrabold tracking-tight">{{ t('contact.title') }}</h1>
    <p class="mt-4 text-text-muted text-[15px] max-w-[600px]">{{ t('contact.lead') }}</p>

    <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-2">
        <ContactForm />
      </div>

      <aside class="space-y-3">
        <BentoTile span="2" variant="muted" eyebrow="Adres">
          <p class="text-[14px] leading-relaxed">Diamantweg 48<br>5527 LC Hapert</p>
        </BentoTile>
        <BentoTile span="2" variant="muted" eyebrow="Bedrijfsgegevens">
          <p class="font-mono text-[11px] text-text-muted">KvK 18036761</p>
          <p class="font-mono text-[11px] text-text-muted">BTW NL801225401B01</p>
        </BentoTile>
        <BentoTile span="2" variant="dark" eyebrow="E-mail">
          <a href="mailto:info@robuprint.nl" class="text-[14px] text-white underline-offset-2 hover:underline">info@robuprint.nl</a>
        </BentoTile>
      </aside>
    </div>
  </div>
</template>
```

(Note: the `BentoTile` `span="2"` here is fine — the parent is a 3-column grid, not `BentoGrid`. The `span` prop on a tile inside a non-BentoGrid container has no effect on layout because the parent's grid template determines columns. The tile picks up its own padding/variant styling regardless.)

- [ ] **Step 2: Visual check + commit**

```bash
pnpm dev
```

Verify `/contact` — form on the left (2/3 width on desktop), three small tiles stacked on the right with address / KvK+BTW / email. Mobile stacks form on top, tiles below. Stop server.

```bash
git add app/pages/contact.vue
git commit -m "feat(contact): side bento with address/KvK/email"
```

---

### Task 17: Soften offerte form chrome with tile wrappers

**Files:**
- Modify: `app/pages/offerte.vue`

- [ ] **Step 1: Read current file**

```bash
cat app/pages/offerte.vue
```

Identify the `<QuoteForm />` mount point and surrounding structure.

- [ ] **Step 2: Update the file**

Overwrite `app/pages/offerte.vue` with the layout below — keep the `<QuoteForm />` exactly as-is, only wrap the page chrome:

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
const { t } = useI18n()
useHead({ title: `${t('quote.title')} · ${t('common.company')}` })

const { observeAll } = useReveal()
onMounted(() => observeAll())
</script>

<template>
  <div class="max-w-[1200px] mx-auto px-6 py-20">
    <h1 class="text-[40px] md:text-[48px] font-extrabold tracking-tight">{{ t('quote.title') }}</h1>
    <p class="mt-4 text-text-muted text-[15px] max-w-[600px]">{{ t('quote.lead') }}</p>

    <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-2 rounded-[var(--radius-xl)] bg-surface border border-border p-6 md:p-8 shadow-[var(--shadow-tile)]" data-reveal-target>
        <QuoteForm />
      </div>

      <aside class="space-y-3">
        <BentoTile span="2" variant="muted" eyebrow="Wat ontvangen we graag">
          <ul class="text-[13px] text-text-muted space-y-1">
            <li>— STL of STEP-bestand</li>
            <li>— Gewenst materiaal</li>
            <li>— Aantallen + lever-deadline</li>
          </ul>
        </BentoTile>
        <BentoTile span="2" variant="dark" eyebrow="Reactietijd">
          <p class="text-[14px] text-white">Binnen 2 werkdagen.</p>
        </BentoTile>
      </aside>
    </div>
  </div>
</template>
```

- [ ] **Step 3: Visual check + commit**

```bash
pnpm dev
```

Verify `/offerte` — form sits inside a soft tile, sidebar tiles on the right with upload checklist + reaction time. Form behaviour unchanged (file upload, Turnstile, validation). Submit a test entry to confirm. Stop server.

```bash
git add app/pages/offerte.vue
git commit -m "feat(offerte): tile chrome around form + sidebar info tiles"
```

---

## Phase 6 — Site chrome & verification

### Task 18: `BrandMark` component + `SiteHeader` integration

**Files:**
- Create: `app/components/site/BrandMark.vue`
- Modify: `app/components/site/SiteHeader.vue`

- [ ] **Step 1: Implement `BrandMark`**

Create `app/components/site/BrandMark.vue`:

```vue
<template>
  <svg viewBox="0 0 32 32" width="20" height="20" aria-hidden="true">
    <rect width="32" height="32" rx="6" fill="#1652F0" />
    <path
      d="M11 9 H17.6 a4.4 4.4 0 0 1 0 8.8 H14 v5.2 H11 V9 Z M14 11.5 V15.3 H17.4 a1.9 1.9 0 0 0 0 -3.8 H14 Z M16.6 17.8 L21 23 H17.6 L13.6 17.8 H16.6 Z"
      fill="#FFFFFF"
    />
  </svg>
</template>
```

- [ ] **Step 2: Update `SiteHeader.vue` to render the mark next to the wordmark**

In `app/components/site/SiteHeader.vue`, replace the brand link element:

```vue
<!-- BEFORE -->
<NuxtLink :to="localePath('/')" class="font-bold text-[15px] tracking-tight">{{ t('common.company') }}</NuxtLink>

<!-- AFTER -->
<NuxtLink :to="localePath('/')" class="inline-flex items-center gap-2 font-bold text-[15px] tracking-tight">
  <BrandMark />
  <span>{{ t('common.company') }}</span>
</NuxtLink>
```

- [ ] **Step 3: Visual check**

```bash
pnpm dev
```

Open any page. Expected: a small blue rounded-square with white "R" sits to the left of "RoBuPRINT" in the header. Stop server.

- [ ] **Step 4: Commit**

```bash
git add app/components/site/BrandMark.vue app/components/site/SiteHeader.vue
git commit -m "feat(site): BrandMark glyph next to wordmark in header"
```

---

### Task 19: Restyle footer company-info block as mini dark tile

**Files:**
- Modify: `app/components/site/SiteFooter.vue`

- [ ] **Step 1: Update the file**

In `app/components/site/SiteFooter.vue`, locate the existing company-info paragraph:

```vue
<p class="mt-6 text-[12px]">{{ t('common.footer.kvk') }}<br>{{ t('common.footer.btw') }}<br>{{ t('common.footer.address') }}</p>
```

Replace it with a small dark tile:

```vue
<div class="mt-6 rounded-[var(--radius-md)] bg-[var(--color-surface-dark)] text-white p-3 text-[11px] leading-relaxed font-mono">
  <p>{{ t('common.footer.kvk') }}</p>
  <p>{{ t('common.footer.btw') }}</p>
  <p class="text-white/75 mt-1">{{ t('common.footer.address') }}</p>
</div>
```

- [ ] **Step 2: Visual check + commit**

```bash
pnpm dev
```

Scroll to footer. Expected: company info sits inside a small dark mini-tile in the third footer column. Stop server.

```bash
git add app/components/site/SiteFooter.vue
git commit -m "feat(site): footer company-info as dark mini-tile"
```

---

### Task 20: Remove the sandbox route

**Files:**
- Delete: `app/pages/_sandbox/bento.vue`

- [ ] **Step 1: Confirm the route is no longer needed**

We've now visually verified each real page. The sandbox was for primitive verification only.

- [ ] **Step 2: Delete the file (and the now-empty folder)**

```bash
rm app/pages/_sandbox/bento.vue
rmdir app/pages/_sandbox
```

- [ ] **Step 3: Commit**

```bash
git add app/pages/_sandbox
git commit -m "chore(sandbox): remove bento sandbox route"
```

---

### Task 21: Full verification sweep

- [ ] **Step 1: Run unit tests**

```bash
pnpm test
```

Expected: all tests pass — chunker, validators, useChunkedUpload, useReveal, SchemIllustration, BentoTile.

- [ ] **Step 2: Run e2e smoke**

```bash
pnpm test:e2e
```

Expected: all 8 tests pass. If a route fails because of a missing i18n key, open the relevant `i18n/locales/{nl,en}/<page>.json` and ensure all keys referenced by the rewritten page exist in both locales.

- [ ] **Step 3: Manual mobile check (≤640px)**

```bash
pnpm dev
```

In a browser, set viewport to 375×667. For each route — `/`, `/wat-wij-doen`, `/materialen`, `/projecten`, `/over-ons`, `/contact`, `/offerte` — verify:
- No horizontal scroll
- Tiles stack to a single column
- Hero text wraps cleanly, no overflow
- Form fields are full-width and touchable

If any page breaks, fix the offending element (typically a fixed `max-width` on a hero or a wide tile span that doesn't collapse) and re-verify before continuing.

- [ ] **Step 4: Lighthouse spot-check (desktop)**

In Chrome DevTools → Lighthouse → desktop → Performance category. Run on `http://localhost:3000/`. Expected score ≥ 90. If significantly lower, check the network tab — most common regression cause is unrequested font weights or oversized SVG inline. Stop server.

- [ ] **Step 5: Push to remote**

```bash
git push
```

Vercel will rebuild from the new commits. Watch the deploy in the Vercel dashboard until live.

---

## Self-review summary

**Spec coverage check:**
- §4.1 token additions → Task 2
- §4.4 reveal motion → Task 2 (CSS) + Task 3 (composable)
- §5 components (BentoGrid/BentoTile/SchemIllustration/BrandMark + useReveal) → Tasks 3, 4, 5, 6, 18
- §6 page rewrites → Tasks 9, 12, 13, 14, 15, 16, 17, 18 (header), 19 (footer)
- §7 illustration library → Task 4
- §9 acceptance criteria — i18n keys preserved (Task 8), `prefers-reduced-motion` (Task 2), Lighthouse ≥ 90 (Task 21), forms still submit (Tasks 16, 17), sitemap/JSON-LD untouched (no module changes), single-column mobile (Task 21)
- §10 phasing → matches phase order in this plan
- §11 risks — mitigated by hard caps in tile usage and the sandbox-route verification gate
