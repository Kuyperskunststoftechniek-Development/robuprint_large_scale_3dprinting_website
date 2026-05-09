# RoBuPRINT Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the bilingual (NL/EN) RoBuPRINT marketing website on Nuxt 3, deployed to Vercel, with all seven primary routes, a functional contact form, and a quote-request form with chunked file upload that targets a separately-hosted FastAPI backend at `https://api.robuprint.nl`.

**Architecture:** Static-prerendered Nuxt 3 site with `@nuxtjs/i18n` for NL/EN, `@nuxt/content` for project markdown, Tailwind CSS v4 for styling, custom design system using `radix-vue` primitives where behavior is needed. Forms POST to a configurable API base URL. Chunked uploads in 5 MB pieces via a hand-rolled XHR uploader composable with progress events. Cloudflare Turnstile invisible challenge on all forms.

**Tech Stack:** Nuxt 3 · Vue 3 · TypeScript · Tailwind CSS v4 · `@nuxtjs/i18n` · `@nuxt/content` · `@nuxt/image` · `@nuxt/sitemap` · `@nuxtjs/robots` · `radix-vue` · `vitest` · pnpm

**Reference:** [`docs/superpowers/specs/2026-05-09-robuprint-website-design.md`](../specs/2026-05-09-robuprint-website-design.md)

---

## File Structure

```
robuprint-website/
├── nuxt.config.ts
├── app.vue
├── tsconfig.json
├── package.json
├── .env.example
├── .gitignore
├── vercel.json
├── README.md
├── public/
│   ├── favicon.svg
│   └── og-default.jpg
├── assets/
│   ├── css/
│   │   └── tokens.css          # design tokens via Tailwind @theme
│   └── fonts/                   # self-hosted Inter Tight + JetBrains Mono
├── components/
│   ├── base/
│   │   ├── BaseButton.vue
│   │   ├── BaseInput.vue
│   │   ├── BaseTextarea.vue
│   │   ├── BaseSelect.vue
│   │   ├── BasePill.vue
│   │   └── BaseCard.vue
│   ├── site/
│   │   ├── SiteHeader.vue
│   │   ├── SiteFooter.vue
│   │   └── LangSwitcher.vue
│   ├── home/
│   │   ├── HomeHero.vue
│   │   ├── UspGrid.vue
│   │   └── ProjectsTeaser.vue
│   └── forms/
│       ├── ContactForm.vue
│       ├── NewsletterForm.vue
│       ├── QuoteForm.vue
│       └── FileDropzone.vue
├── composables/
│   ├── useApi.ts
│   ├── useChunkedUpload.ts
│   └── useTurnstile.ts
├── layouts/
│   └── default.vue
├── pages/
│   ├── index.vue
│   ├── wat-wij-doen.vue
│   ├── materialen.vue
│   ├── projecten/
│   │   ├── index.vue
│   │   └── [slug].vue
│   ├── over-ons.vue
│   ├── contact.vue
│   └── offerte.vue
├── content/projecten/.gitkeep
├── i18n/
│   ├── i18n.config.ts
│   └── locales/{nl,en}/{common,home,capabilities,materials,projects,about,contact,quote,newsletter}.json
├── utils/
│   ├── chunker.ts
│   └── validators.ts
└── tests/
    ├── unit/
    │   ├── chunker.test.ts
    │   ├── validators.test.ts
    │   └── useChunkedUpload.test.ts
    └── e2e/
        └── smoke.spec.ts
```

---

## Task 1: Bootstrap Nuxt project

**Files:**
- Create: `package.json`, `nuxt.config.ts`, `app.vue`, `tsconfig.json`, `.gitignore`, `.env.example`, `README.md`

- [ ] **Step 1: Initialize Nuxt project with pnpm**

```bash
pnpm dlx nuxi@latest init robuprint-website --packageManager pnpm --gitInit false --no-install
cd robuprint-website
pnpm install
```

- [ ] **Step 2: Add `.gitignore` content**

```
node_modules
.nuxt
.output
.data
.env
.env.local
dist
.DS_Store
coverage
playwright-report
.vercel
.superpowers
```

- [ ] **Step 3: Add `.env.example`**

```
# Public — exposed to the browser
NUXT_PUBLIC_API_BASE=https://api.robuprint.nl
NUXT_PUBLIC_TURNSTILE_SITE_KEY=
NUXT_PUBLIC_SITE_URL=https://robuprint.nl

# Private — server-side only
NUXT_TURNSTILE_SECRET_KEY=
```

- [ ] **Step 4: Configure `nuxt.config.ts`**

```ts
export default defineNuxtConfig({
  compatibilityDate: '2026-05-01',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/i18n',
    '@nuxt/content',
    '@nuxt/image',
    '@nuxt/sitemap',
    '@nuxtjs/robots',
  ],
  css: ['~/assets/css/tokens.css'],
  runtimeConfig: {
    turnstileSecretKey: '',
    public: {
      apiBase: '',
      turnstileSiteKey: '',
      siteUrl: '',
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'nl' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },
  nitro: {
    preset: 'vercel',
    prerender: {
      crawlLinks: true,
      routes: ['/', '/en'],
    },
  },
})
```

- [ ] **Step 5: Replace `app.vue` with layout host**

```vue
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

- [ ] **Step 6: Init git, first commit**

```bash
git init
git add -A
git commit -m "chore: bootstrap Nuxt 3 project"
```

- [ ] **Step 7: Verify dev server starts**

```bash
pnpm dev
```

Expected: server listens on `http://localhost:3000` and the default Nuxt page renders without errors. Stop with Ctrl+C.

---

## Task 2: Add Tailwind CSS v4 and design tokens

**Files:**
- Create: `assets/css/tokens.css`
- Modify: `nuxt.config.ts`, `package.json`

- [ ] **Step 1: Install Tailwind v4 and Vite plugin**

```bash
pnpm add -D tailwindcss@^4 @tailwindcss/vite@^4
```

- [ ] **Step 2: Wire the Vite plugin in `nuxt.config.ts`**

Add at top: `import tailwindcss from '@tailwindcss/vite'`

Inside `defineNuxtConfig({...})` add:

```ts
vite: {
  plugins: [tailwindcss()],
},
```

- [ ] **Step 3: Create `assets/css/tokens.css` with the design tokens from the spec**

```css
@import 'tailwindcss';

@theme {
  --color-bg: #FBFAF8;
  --color-surface: #FFFFFF;
  --color-text: #0B0B0F;
  --color-text-muted: #5B6470;
  --color-border: #E5E2DA;
  --color-accent: #1652F0;
  --color-accent-soft: rgba(22, 82, 240, 0.08);

  --font-sans: 'Inter Tight', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace;

  --radius-md: 0.625rem;   /* 10px */
  --radius-lg: 0.75rem;    /* 12px */
  --radius-xl: 0.875rem;   /* 14px */
  --radius-pill: 9999px;
}

html, body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 4: Verify tokens compile**

Edit `app.vue` temporarily, add `<div class="bg-bg text-accent p-8">test</div>` inside `<NuxtLayout>`. Run `pnpm dev`, open `http://localhost:3000`, confirm the test div has the off-white background and blue accent text. Revert the change.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(style): add Tailwind v4 and design tokens"
```

---

## Task 3: Self-host Inter Tight and JetBrains Mono

**Files:**
- Create: `assets/fonts/InterTight-VariableFont_wght.woff2`, `assets/fonts/JetBrainsMono-VariableFont_wght.woff2`, `assets/css/fonts.css`
- Modify: `assets/css/tokens.css`

- [ ] **Step 1: Download font files**

Download from Google Fonts (`https://fonts.google.com`) the variable WOFF2 files for Inter Tight and JetBrains Mono. Save to `assets/fonts/` with the names above. (Use the Google Webfonts Helper if needed — the goal is variable WOFF2 files, no Google CDN at runtime.)

- [ ] **Step 2: Create `assets/css/fonts.css`**

```css
@font-face {
  font-family: 'Inter Tight';
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url('~/assets/fonts/InterTight-VariableFont_wght.woff2') format('woff2');
}

@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-weight: 100 800;
  font-display: swap;
  src: url('~/assets/fonts/JetBrainsMono-VariableFont_wght.woff2') format('woff2');
}
```

- [ ] **Step 3: Import fonts.css from tokens.css**

At the top of `assets/css/tokens.css`, before `@import 'tailwindcss';`, add:

```css
@import './fonts.css';
```

- [ ] **Step 4: Verify font loads**

Run `pnpm dev`, open the page in the browser, open DevTools → Network → filter by Font. Confirm both WOFF2 files load and the page text renders in Inter Tight.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(style): self-host Inter Tight and JetBrains Mono"
```

---

## Task 4: Base UI components

**Files:**
- Create: `components/base/BaseButton.vue`, `components/base/BaseInput.vue`, `components/base/BaseTextarea.vue`, `components/base/BaseSelect.vue`, `components/base/BasePill.vue`, `components/base/BaseCard.vue`

- [ ] **Step 1: Create `BaseButton.vue`**

```vue
<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'accent' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit'
  disabled?: boolean
}>()
</script>

<template>
  <button
    :type="type ?? 'button'"
    :disabled="disabled"
    :class="[
      'inline-flex items-center justify-center font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
      'rounded-[var(--radius-md)]',
      size === 'sm' ? 'text-[12.5px] px-3 py-2' :
      size === 'lg' ? 'text-base px-6 py-3' :
                      'text-[13.5px] px-4 py-2.5',
      variant === 'accent' ? 'bg-accent text-white hover:bg-[#1241C7]' :
      variant === 'ghost' ? 'text-text-muted hover:text-text bg-transparent' :
                            'bg-text text-bg hover:bg-[#1A1A1F]',
    ]"
  >
    <slot />
  </button>
</template>
```

- [ ] **Step 2: Create `BaseInput.vue`**

```vue
<script setup lang="ts">
defineProps<{
  modelValue?: string
  type?: string
  placeholder?: string
  required?: boolean
  id?: string
  name?: string
  autocomplete?: string
}>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <input
    :id="id"
    :name="name"
    :type="type ?? 'text'"
    :placeholder="placeholder"
    :required="required"
    :value="modelValue"
    :autocomplete="autocomplete"
    class="w-full px-3 py-2.5 text-[13px] bg-surface border border-border rounded-[var(--radius-md)] focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
```

- [ ] **Step 3: Create `BaseTextarea.vue`**

```vue
<script setup lang="ts">
defineProps<{
  modelValue?: string
  placeholder?: string
  required?: boolean
  id?: string
  name?: string
  rows?: number
}>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <textarea
    :id="id"
    :name="name"
    :rows="rows ?? 4"
    :placeholder="placeholder"
    :required="required"
    :value="modelValue"
    class="w-full px-3 py-2.5 text-[13px] bg-surface border border-border rounded-[var(--radius-md)] focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors resize-y min-h-[70px]"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
</template>
```

- [ ] **Step 4: Create `BaseSelect.vue`**

```vue
<script setup lang="ts">
defineProps<{
  modelValue?: string
  id?: string
  name?: string
  required?: boolean
  options: Array<{ value: string; label: string }>
}>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <select
    :id="id"
    :name="name"
    :required="required"
    :value="modelValue"
    class="w-full px-3 py-2.5 text-[13px] bg-surface border border-border rounded-[var(--radius-md)] focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors"
    @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
  >
    <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
  </select>
</template>
```

- [ ] **Step 5: Create `BasePill.vue` (used as styled radio)**

```vue
<script setup lang="ts">
defineProps<{ selected?: boolean }>()
defineEmits<{ click: [] }>()
</script>

<template>
  <button
    type="button"
    :class="[
      'px-3.5 py-1.5 text-[12px] rounded-[var(--radius-pill)] border transition-colors',
      selected
        ? 'border-accent bg-accent-soft text-accent font-medium'
        : 'border-border bg-surface text-text hover:border-text-muted',
    ]"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>
```

- [ ] **Step 6: Create `BaseCard.vue`**

```vue
<template>
  <div class="bg-surface border border-border rounded-[var(--radius-lg)] p-6 hover:shadow-sm transition-shadow">
    <slot />
  </div>
</template>
```

- [ ] **Step 7: Smoke-test components on Home temporarily**

Edit `pages/index.vue` (creating it if needed):

```vue
<script setup lang="ts">
const material = ref('hdpe')
</script>

<template>
  <main class="p-12 space-y-6">
    <BaseButton variant="accent">Verstuur aanvraag</BaseButton>
    <BaseInput placeholder="Naam" />
    <div class="flex gap-2">
      <BasePill :selected="material === 'hdpe'" @click="material = 'hdpe'">HDPE</BasePill>
      <BasePill :selected="material === 'pp'" @click="material = 'pp'">PP</BasePill>
    </div>
    <BaseCard>Card content</BaseCard>
  </main>
</template>
```

Run `pnpm dev`, visit `http://localhost:3000`, confirm components render with the right styles. Then revert `pages/index.vue` (it gets rewritten in Task 11).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(ui): add base components (Button, Input, Textarea, Select, Pill, Card)"
```

---

## Task 5: i18n setup with NL/EN

**Files:**
- Create: `i18n/i18n.config.ts`, `i18n/locales/nl/common.json`, `i18n/locales/en/common.json`
- Modify: `nuxt.config.ts`

- [ ] **Step 1: Install `@nuxtjs/i18n`**

```bash
pnpm add @nuxtjs/i18n
```

(It is already listed in modules from Task 1; this just installs the package.)

- [ ] **Step 2: Create `i18n/i18n.config.ts`**

```ts
import nlCommon from './locales/nl/common.json'
import enCommon from './locales/en/common.json'

export default defineI18nConfig(() => ({
  legacy: false,
  fallbackLocale: 'nl',
  messages: {
    nl: { common: nlCommon },
    en: { common: enCommon },
  },
}))
```

- [ ] **Step 3: Add i18n config block to `nuxt.config.ts`**

Inside `defineNuxtConfig`:

```ts
i18n: {
  vueI18n: './i18n/i18n.config.ts',
  defaultLocale: 'nl',
  strategy: 'prefix_except_default',
  locales: [
    { code: 'nl', language: 'nl-NL', name: 'Nederlands' },
    { code: 'en', language: 'en-GB', name: 'English' },
  ],
  detectBrowserLanguage: {
    useCookie: true,
    cookieKey: 'robuprint_locale',
    redirectOn: 'root',
  },
},
```

- [ ] **Step 4: Create `i18n/locales/nl/common.json`**

```json
{
  "company": "RoBuPRINT",
  "tagline_short": "Robotic large-scale 3D printing",
  "parent_company_line": "Onderdeel van Kuypers Kunststoftechniek",
  "nav": {
    "what_we_do": "Wat wij doen",
    "materials": "Materialen",
    "projects": "Projecten",
    "about": "Over ons",
    "contact": "Contact",
    "quote_cta": "Offerte aanvragen"
  },
  "footer": {
    "newsletter_heading": "Blijf op de hoogte",
    "newsletter_placeholder": "E-mailadres",
    "newsletter_submit": "Aanmelden",
    "kvk": "KvK 00000000",
    "btw": "BTW NL000000000B00",
    "address": "Adres volgt",
    "rights": "Alle rechten voorbehouden."
  },
  "lang": { "nl": "NL", "en": "EN" },
  "form": {
    "required_marker": "*",
    "submit": "Verstuur",
    "submitting": "Bezig...",
    "success": "Bedankt — we nemen binnen 2 werkdagen contact op.",
    "error_generic": "Er ging iets mis. Probeer het opnieuw of mail ons direct.",
    "consent": "Ik ga akkoord met de verwerking van mijn gegevens conform de privacyverklaring."
  }
}
```

- [ ] **Step 5: Create `i18n/locales/en/common.json` (same keys, English values)**

```json
{
  "company": "RoBuPRINT",
  "tagline_short": "Robotic large-scale 3D printing",
  "parent_company_line": "Part of Kuypers Kunststoftechniek",
  "nav": {
    "what_we_do": "Capabilities",
    "materials": "Materials",
    "projects": "Projects",
    "about": "About",
    "contact": "Contact",
    "quote_cta": "Request a quote"
  },
  "footer": {
    "newsletter_heading": "Stay updated",
    "newsletter_placeholder": "Email address",
    "newsletter_submit": "Subscribe",
    "kvk": "KvK 00000000",
    "btw": "VAT NL000000000B00",
    "address": "Address pending",
    "rights": "All rights reserved."
  },
  "lang": { "nl": "NL", "en": "EN" },
  "form": {
    "required_marker": "*",
    "submit": "Send",
    "submitting": "Sending...",
    "success": "Thanks — we'll be in touch within 2 business days.",
    "error_generic": "Something went wrong. Please try again or email us directly.",
    "consent": "I agree to the processing of my data per the privacy policy."
  }
}
```

- [ ] **Step 6: Verify i18n routing**

Run `pnpm dev`. Visit `http://localhost:3000` (Dutch) and `http://localhost:3000/en` (English) — both should render. In a Vue page, calling `$t('common.company')` returns "RoBuPRINT".

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(i18n): set up NL/EN with prefix routing"
```

---

## Task 6: Site header with navigation and language switcher

**Files:**
- Create: `components/site/SiteHeader.vue`, `components/site/LangSwitcher.vue`

- [ ] **Step 1: Create `LangSwitcher.vue`**

```vue
<script setup lang="ts">
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const { t } = useI18n()
</script>

<template>
  <div class="flex items-center gap-1 text-[12px] font-medium">
    <NuxtLink
      v-for="l in (locales as Array<{ code: string }>)"
      :key="l.code"
      :to="switchLocalePath(l.code)"
      :class="[
        'px-2 py-1 rounded transition-colors',
        locale === l.code ? 'text-text' : 'text-text-muted hover:text-text',
      ]"
    >
      {{ t(`common.lang.${l.code}`) }}
    </NuxtLink>
  </div>
</template>
```

- [ ] **Step 2: Create `SiteHeader.vue`**

```vue
<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const navItems = computed(() => [
  { to: localePath('/wat-wij-doen'), label: t('common.nav.what_we_do') },
  { to: localePath('/materialen'), label: t('common.nav.materials') },
  { to: localePath('/projecten'), label: t('common.nav.projects') },
  { to: localePath('/over-ons'), label: t('common.nav.about') },
  { to: localePath('/contact'), label: t('common.nav.contact') },
])

const mobileOpen = ref(false)
</script>

<template>
  <header class="sticky top-0 z-50 bg-bg/85 backdrop-blur border-b border-border">
    <div class="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between gap-6">
      <NuxtLink :to="localePath('/')" class="font-bold text-[15px] tracking-tight">{{ t('common.company') }}</NuxtLink>

      <nav class="hidden md:flex items-center gap-6 text-[13px] text-text-muted">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="hover:text-text transition-colors"
          active-class="text-text"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-3">
        <NuxtLink
          :to="localePath('/offerte')"
          class="hidden md:inline-flex items-center text-[12.5px] font-medium px-4 py-2 bg-accent text-white rounded-[var(--radius-md)] hover:bg-[#1241C7] transition-colors"
        >
          {{ t('common.nav.quote_cta') }} →
        </NuxtLink>
        <LangSwitcher />
        <button
          class="md:hidden p-2"
          :aria-label="mobileOpen ? 'Close menu' : 'Open menu'"
          @click="mobileOpen = !mobileOpen"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>
    </div>

    <div v-if="mobileOpen" class="md:hidden border-t border-border bg-bg">
      <nav class="max-w-[1200px] mx-auto px-6 py-4 flex flex-col gap-3 text-[14px]">
        <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to" @click="mobileOpen = false">{{ item.label }}</NuxtLink>
        <NuxtLink :to="localePath('/offerte')" class="font-medium text-accent" @click="mobileOpen = false">{{ t('common.nav.quote_cta') }} →</NuxtLink>
      </nav>
    </div>
  </header>
</template>
```

- [ ] **Step 3: Verify header**

Wire it temporarily in `app.vue` for a quick check, or wait for Task 8 which adds the layout. Then commit.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(site): add SiteHeader with nav, CTA, and lang switcher"
```

---

## Task 7: Site footer with newsletter signup placeholder

**Files:**
- Create: `components/site/SiteFooter.vue`, `components/forms/NewsletterForm.vue`

- [ ] **Step 1: Create `NewsletterForm.vue` (UI only — wired to API in Task 17)**

```vue
<script setup lang="ts">
const { t } = useI18n()
const email = ref('')
const status = ref<'idle' | 'submitting' | 'success' | 'error'>('idle')

async function onSubmit() {
  // Wired to /api/newsletter in Task 17
  status.value = 'submitting'
  setTimeout(() => { status.value = 'success'; email.value = '' }, 600)
}
</script>

<template>
  <form class="flex gap-2 max-w-sm" @submit.prevent="onSubmit">
    <BaseInput
      v-model="email"
      type="email"
      :placeholder="t('common.footer.newsletter_placeholder')"
      required
      autocomplete="email"
    />
    <BaseButton type="submit" variant="primary" size="sm" :disabled="status === 'submitting'">
      {{ t('common.footer.newsletter_submit') }}
    </BaseButton>
  </form>
  <p v-if="status === 'success'" class="text-[12px] text-text-muted mt-2">{{ t('common.form.success') }}</p>
</template>
```

- [ ] **Step 2: Create `SiteFooter.vue`**

```vue
<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-border bg-bg mt-24">
    <div class="max-w-[1200px] mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-[13px] text-text-muted">
      <div class="md:col-span-2">
        <p class="font-bold text-text text-[15px] mb-2">{{ t('common.company') }}</p>
        <p class="text-[12px]">{{ t('common.parent_company_line') }}</p>
        <p class="font-medium text-text mt-6 mb-2 text-[13px]">{{ t('common.footer.newsletter_heading') }}</p>
        <NewsletterForm />
      </div>

      <div>
        <p class="font-medium text-text mb-3 text-[12px] uppercase tracking-wider">{{ t('common.nav.what_we_do') }}</p>
        <ul class="space-y-2">
          <li><NuxtLink :to="localePath('/wat-wij-doen')">{{ t('common.nav.what_we_do') }}</NuxtLink></li>
          <li><NuxtLink :to="localePath('/materialen')">{{ t('common.nav.materials') }}</NuxtLink></li>
          <li><NuxtLink :to="localePath('/projecten')">{{ t('common.nav.projects') }}</NuxtLink></li>
        </ul>
      </div>

      <div>
        <p class="font-medium text-text mb-3 text-[12px] uppercase tracking-wider">Info</p>
        <ul class="space-y-2">
          <li><NuxtLink :to="localePath('/over-ons')">{{ t('common.nav.about') }}</NuxtLink></li>
          <li><NuxtLink :to="localePath('/contact')">{{ t('common.nav.contact') }}</NuxtLink></li>
          <li><NuxtLink :to="localePath('/offerte')">{{ t('common.nav.quote_cta') }}</NuxtLink></li>
        </ul>
        <p class="mt-6 text-[12px]">{{ t('common.footer.kvk') }}<br>{{ t('common.footer.btw') }}<br>{{ t('common.footer.address') }}</p>
      </div>
    </div>
    <div class="border-t border-border">
      <p class="max-w-[1200px] mx-auto px-6 py-4 text-[11px] text-text-muted">© {{ year }} {{ t('common.company') }} — {{ t('common.footer.rights') }}</p>
    </div>
  </footer>
</template>
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(site): add SiteFooter with newsletter form placeholder"
```

---

## Task 8: Default layout

**Files:**
- Create: `layouts/default.vue`

- [ ] **Step 1: Create the layout**

```vue
<template>
  <div class="min-h-screen flex flex-col">
    <SiteHeader />
    <main class="flex-1">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>
```

- [ ] **Step 2: Verify**

Run `pnpm dev`. The Home page (still placeholder from Task 4 smoke or default Nuxt page) should render with header + footer chrome around it. Visit `/en` — same with English nav.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(site): default layout with header and footer"
```

---

## Task 9: Validators utility (TDD)

**Files:**
- Create: `utils/validators.ts`, `tests/unit/validators.test.ts`
- Modify: `package.json` (add vitest)

- [ ] **Step 1: Install Vitest**

```bash
pnpm add -D vitest @vitest/ui happy-dom
```

Add to `package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 2: Write the failing test**

`tests/unit/validators.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { isEmail, isNonEmpty, validateRequired } from '~/utils/validators'

describe('isEmail', () => {
  it('accepts standard addresses', () => {
    expect(isEmail('foo@bar.com')).toBe(true)
    expect(isEmail('a.b+tag@example.co.uk')).toBe(true)
  })
  it('rejects malformed', () => {
    expect(isEmail('foo')).toBe(false)
    expect(isEmail('foo@')).toBe(false)
    expect(isEmail('@bar.com')).toBe(false)
    expect(isEmail('')).toBe(false)
  })
})

describe('isNonEmpty', () => {
  it('rejects empty and whitespace-only', () => {
    expect(isNonEmpty('')).toBe(false)
    expect(isNonEmpty('   ')).toBe(false)
  })
  it('accepts text with content', () => {
    expect(isNonEmpty('a')).toBe(true)
    expect(isNonEmpty(' x ')).toBe(true)
  })
})

describe('validateRequired', () => {
  it('returns missing keys', () => {
    expect(validateRequired({ name: 'Jan', email: '' }, ['name', 'email'])).toEqual(['email'])
    expect(validateRequired({ name: '', email: '' }, ['name', 'email'])).toEqual(['name', 'email'])
    expect(validateRequired({ name: 'Jan', email: 'a@b.com' }, ['name', 'email'])).toEqual([])
  })
})
```

- [ ] **Step 3: Run, confirm failure**

```bash
pnpm test
```

Expected: tests fail with "Cannot find module '~/utils/validators'".

- [ ] **Step 4: Implement**

`utils/validators.ts`:

```ts
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isEmail(value: string): boolean {
  return EMAIL_RE.test(value)
}

export function isNonEmpty(value: string): boolean {
  return value.trim().length > 0
}

export function validateRequired<T extends Record<string, string>>(
  data: T,
  keys: Array<keyof T>,
): Array<keyof T> {
  return keys.filter((k) => !isNonEmpty(String(data[k] ?? '')))
}
```

- [ ] **Step 5: Configure Vitest path alias**

Create `vitest.config.ts` at the project root:

```ts
import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  test: {
    environment: 'happy-dom',
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
})
```

- [ ] **Step 6: Run, confirm pass**

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(utils): add validators with tests"
```

---

## Task 10: API client composable

**Files:**
- Create: `composables/useApi.ts`

- [ ] **Step 1: Implement `useApi.ts`**

```ts
type RequestOptions = {
  method?: 'GET' | 'POST'
  body?: unknown
  signal?: AbortSignal
  headers?: Record<string, string>
}

export class ApiError extends Error {
  status: number
  body: unknown
  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.status = status
    this.body = body
  }
}

export function useApi() {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = `${base.replace(/\/$/, '')}${path}`
    const isJson = options.body && !(options.body instanceof FormData) && !(options.body instanceof Blob)
    const res = await fetch(url, {
      method: options.method ?? (options.body ? 'POST' : 'GET'),
      headers: {
        ...(isJson ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers ?? {}),
      },
      body: isJson ? JSON.stringify(options.body) : (options.body as BodyInit | null | undefined),
      signal: options.signal,
    })
    const text = await res.text()
    let parsed: unknown = text
    try { parsed = text ? JSON.parse(text) : null } catch { /* keep text */ }
    if (!res.ok) {
      throw new ApiError(`API ${res.status} ${res.statusText}`, res.status, parsed)
    }
    return parsed as T
  }

  return { request }
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(api): add useApi composable with typed errors"
```

---

## Task 11: Home page

**Files:**
- Create: `pages/index.vue`, `components/home/HomeHero.vue`, `components/home/UspGrid.vue`, `components/home/ProjectsTeaser.vue`, `i18n/locales/nl/home.json`, `i18n/locales/en/home.json`
- Modify: `i18n/i18n.config.ts`

- [ ] **Step 1: Create `i18n/locales/nl/home.json`**

```json
{
  "eyebrow": "Robotic large-scale 3D printing",
  "h1_lead": "Polymeer-onderdelen tot 4 × 4 × 8 meter — geprint en gefreesd door één robot.",
  "lead": "HDPE en PP uit eigen factory-fresh recyclaat. Voor architectuur, food-grade en industriële toepassingen.",
  "cta_primary": "Vraag offerte aan",
  "cta_secondary": "Bekijk projecten",
  "usps_heading": "Waarom RoBuPRINT",
  "usps": [
    { "title": "4 × 4 × 8 meter", "body": "128 m³ printvolume in één opstelling. Eén stuk, geen lasnaden." },
    { "title": "HDPE & PP", "body": "Inclusief food-grade HDPE. Polyolefinen op deze schaal — bij ons standaard." },
    { "title": "Print + frees", "body": "Dezelfde robot frees de finish strak na. Geen layer lines waar het niet hoeft." },
    { "title": "Eigen recyclaat", "body": "Materiaal direct uit Kuypers Kunststoftechniek — single-stream, schoon, traceerbaar." }
  ],
  "projects_heading": "Recente projecten",
  "projects_cta": "Alle projecten →",
  "projects_empty": "Eerste cases volgen — onze portfolio bouwt op."
}
```

- [ ] **Step 2: Create `i18n/locales/en/home.json`**

```json
{
  "eyebrow": "Robotic large-scale 3D printing",
  "h1_lead": "Polymer parts up to 4 × 4 × 8 metres — printed and milled by a single robot.",
  "lead": "HDPE and PP from our own factory-fresh recyclate. For architecture, food-grade and industrial applications.",
  "cta_primary": "Request a quote",
  "cta_secondary": "See projects",
  "usps_heading": "Why RoBuPRINT",
  "usps": [
    { "title": "4 × 4 × 8 metres", "body": "128 m³ build volume in one setup. Single piece, no welded seams." },
    { "title": "HDPE & PP", "body": "Including food-grade HDPE. Polyolefins at this scale — our standard." },
    { "title": "Print + mill", "body": "The same robot mills the finish smooth. No layer lines where you don't want them." },
    { "title": "Own recyclate", "body": "Material straight from Kuypers Kunststoftechniek — single-stream, clean, traceable." }
  ],
  "projects_heading": "Recent projects",
  "projects_cta": "All projects →",
  "projects_empty": "First cases coming — our portfolio is building."
}
```

- [ ] **Step 3: Update `i18n/i18n.config.ts` to import the new locales**

```ts
import nlCommon from './locales/nl/common.json'
import nlHome from './locales/nl/home.json'
import enCommon from './locales/en/common.json'
import enHome from './locales/en/home.json'

export default defineI18nConfig(() => ({
  legacy: false,
  fallbackLocale: 'nl',
  messages: {
    nl: { common: nlCommon, home: nlHome },
    en: { common: enCommon, home: enHome },
  },
}))
```

- [ ] **Step 4: Create `HomeHero.vue`**

```vue
<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <section class="relative overflow-hidden">
    <div class="absolute -right-24 -top-32 w-[60%] h-[140%] pointer-events-none"
         style="background: radial-gradient(circle at 30% 40%, rgba(22,82,240,0.18), transparent 55%);" />
    <div class="absolute right-12 bottom-12 w-36 h-36 rounded-[18px] pointer-events-none"
         style="background: linear-gradient(135deg, #1652F0 0%, #0B0B0F 100%); opacity: 0.92;" />
    <div class="relative max-w-[1200px] mx-auto px-6 py-24 md:py-32">
      <p class="font-mono text-[11px] text-text-muted tracking-[0.04em] mb-3">
        <span class="text-accent">●</span>&nbsp;&nbsp;{{ t('home.eyebrow') }}
      </p>
      <h1 class="text-[40px] md:text-[56px] font-semibold tracking-[-0.025em] leading-[1.04] max-w-[900px]">
        {{ t('home.h1_lead') }}
      </h1>
      <p class="mt-5 text-text-muted max-w-[640px] text-[15px] leading-[1.55]">{{ t('home.lead') }}</p>
      <div class="mt-8 flex flex-wrap gap-4 items-center">
        <NuxtLink :to="localePath('/offerte')">
          <BaseButton variant="primary" size="lg">{{ t('home.cta_primary') }}</BaseButton>
        </NuxtLink>
        <NuxtLink :to="localePath('/projecten')" class="text-[13.5px] text-text-muted hover:text-text">
          {{ t('home.cta_secondary') }} →
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
```

- [ ] **Step 5: Create `UspGrid.vue`**

```vue
<script setup lang="ts">
const { tm } = useI18n()
const usps = computed(() => tm('home.usps') as Array<{ title: string; body: string }>)
const { t } = useI18n()
</script>

<template>
  <section class="max-w-[1200px] mx-auto px-6 py-16">
    <p class="font-mono text-[11px] text-text-muted tracking-wider uppercase mb-6">{{ t('home.usps_heading') }}</p>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <BaseCard v-for="(usp, i) in usps" :key="i">
        <p class="font-mono text-[10px] text-accent tracking-wider mb-2">0{{ i + 1 }}</p>
        <h3 class="text-[16px] font-semibold mb-2">{{ usp.title }}</h3>
        <p class="text-[13px] text-text-muted leading-[1.55]">{{ usp.body }}</p>
      </BaseCard>
    </div>
  </section>
</template>
```

- [ ] **Step 6: Create `ProjectsTeaser.vue` (empty state for v1)**

```vue
<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <section class="max-w-[1200px] mx-auto px-6 py-16">
    <div class="flex items-baseline justify-between mb-6">
      <h2 class="text-[26px] font-semibold tracking-tight">{{ t('home.projects_heading') }}</h2>
      <NuxtLink :to="localePath('/projecten')" class="text-[13px] text-text-muted hover:text-text">{{ t('home.projects_cta') }}</NuxtLink>
    </div>
    <div class="border border-dashed border-border rounded-[var(--radius-lg)] p-12 text-center">
      <p class="text-text-muted text-[14px]">{{ t('home.projects_empty') }}</p>
    </div>
  </section>
</template>
```

- [ ] **Step 7: Create `pages/index.vue`**

```vue
<script setup lang="ts">
const { t } = useI18n()
useHead({ title: `${t('common.company')} — ${t('common.tagline_short')}` })
</script>

<template>
  <div>
    <HomeHero />
    <UspGrid />
    <ProjectsTeaser />
  </div>
</template>
```

- [ ] **Step 8: Verify**

`pnpm dev`, visit `/` and `/en` — both render hero, USPs, and the empty projects teaser.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat(home): hero, USP grid, projects teaser"
```

---

## Task 12: /wat-wij-doen page

**Files:**
- Create: `pages/wat-wij-doen.vue`, `i18n/locales/{nl,en}/capabilities.json`
- Modify: `i18n/i18n.config.ts`

- [ ] **Step 1: Create `i18n/locales/nl/capabilities.json`**

```json
{
  "title": "Wat wij doen",
  "lead": "Robotische extrusie van HDPE en PP op grote schaal, met geïntegreerd nafrezen — alles in één opstelling.",
  "sections": [
    {
      "eyebrow": "PRINT",
      "heading": "Robotic large-scale 3D printing",
      "body": "Een industriële robotarm met granulaat-extruder bouwt onderdelen laag voor laag op tot 4 × 4 × 8 meter. Geen formaatbeperkingen door printbed-grenzen, geen lasnaden in het eindproduct.",
      "specs": [
        { "k": "Build envelope", "v": "4 × 4 × 8 m" },
        { "k": "Proces", "v": "FGF (Fused Granulate Fabrication)" },
        { "k": "Materialen", "v": "HDPE, PP, food-grade HDPE" }
      ]
    },
    {
      "eyebrow": "FREES",
      "heading": "Subtractief nafrezen",
      "body": "Dezelfde robot wisselt naar een freesopzet en bewerkt het geprinte onderdeel na voor strakke vlakken, scherpe kanten en pasvlakken op tolerantie. Geen ronde omweg via een aparte CNC-machine.",
      "specs": [
        { "k": "Tolerantie", "v": "tot ±0.2 mm" },
        { "k": "Toepassing", "v": "Pasvlakken, montagepunten, decoratieve finish" }
      ]
    }
  ]
}
```

- [ ] **Step 2: Create `i18n/locales/en/capabilities.json`**

```json
{
  "title": "Capabilities",
  "lead": "Robotic extrusion of HDPE and PP at large scale, with integrated post-milling — all in a single setup.",
  "sections": [
    {
      "eyebrow": "PRINT",
      "heading": "Robotic large-scale 3D printing",
      "body": "An industrial robot arm with a granulate extruder builds parts layer by layer up to 4 × 4 × 8 metres. No bed-size limits, no welded seams in the final piece.",
      "specs": [
        { "k": "Build envelope", "v": "4 × 4 × 8 m" },
        { "k": "Process", "v": "FGF (Fused Granulate Fabrication)" },
        { "k": "Materials", "v": "HDPE, PP, food-grade HDPE" }
      ]
    },
    {
      "eyebrow": "MILL",
      "heading": "Subtractive post-milling",
      "body": "The same robot switches to a milling head and finishes the printed part for clean surfaces, sharp edges, and mating faces to tolerance. No round-trip to a separate CNC machine.",
      "specs": [
        { "k": "Tolerance", "v": "to ±0.2 mm" },
        { "k": "Use", "v": "Mating faces, mounting points, decorative finish" }
      ]
    }
  ]
}
```

- [ ] **Step 3: Update `i18n/i18n.config.ts`**

Add imports + merge under both locales:

```ts
import nlCapabilities from './locales/nl/capabilities.json'
import enCapabilities from './locales/en/capabilities.json'
// ...
nl: { common: nlCommon, home: nlHome, capabilities: nlCapabilities },
en: { common: enCommon, home: enHome, capabilities: enCapabilities },
```

- [ ] **Step 4: Create `pages/wat-wij-doen.vue`**

```vue
<script setup lang="ts">
const { t, tm } = useI18n()
const sections = computed(() => tm('capabilities.sections') as Array<{ eyebrow: string; heading: string; body: string; specs: Array<{ k: string; v: string }> }>)
useHead({ title: `${t('capabilities.title')} · ${t('common.company')}` })

definePageMeta({
  alias: ['/en/capabilities'],
})
</script>

<template>
  <div class="max-w-[1100px] mx-auto px-6 py-20">
    <h1 class="text-[42px] font-semibold tracking-tight">{{ t('capabilities.title') }}</h1>
    <p class="mt-4 text-text-muted text-[15px] max-w-[760px]">{{ t('capabilities.lead') }}</p>

    <div class="mt-16 space-y-20">
      <section v-for="(s, i) in sections" :key="i" class="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">
        <div>
          <p class="font-mono text-[11px] text-accent tracking-wider mb-3">// {{ s.eyebrow }}</p>
          <h2 class="text-[28px] font-semibold tracking-tight">{{ s.heading }}</h2>
          <p class="mt-4 text-text-muted text-[15px] leading-[1.6]">{{ s.body }}</p>
        </div>
        <BaseCard>
          <dl class="space-y-3 text-[13px]">
            <div v-for="spec in s.specs" :key="spec.k" class="flex justify-between gap-4 border-b border-border pb-2 last:border-0">
              <dt class="font-mono text-[11px] text-text-muted uppercase tracking-wider">{{ spec.k }}</dt>
              <dd class="font-medium text-text">{{ spec.v }}</dd>
            </div>
          </dl>
        </BaseCard>
      </section>
    </div>
  </div>
</template>
```

- [ ] **Step 5: Verify** at `/wat-wij-doen` and `/en/capabilities`. Commit.

```bash
git add -A
git commit -m "feat(pages): add /wat-wij-doen capabilities page"
```

---

## Task 13: /materialen page

**Files:**
- Create: `pages/materialen.vue`, `i18n/locales/{nl,en}/materials.json`
- Modify: `i18n/i18n.config.ts`

- [ ] **Step 1: Create `i18n/locales/nl/materials.json`**

```json
{
  "title": "Materialen",
  "lead": "We zijn gespecialiseerd in HDPE en PP — twee polyolefinen die op grote schaal printen lastig is. Wij doen dat dagelijks, en we maken ons eigen recyclaat in eigen huis.",
  "items": [
    {
      "name": "HDPE",
      "tagline": "Hoge-dichtheid polyethyleen",
      "body": "Sterk, slagvast, chemicaliënbestendig en weersbestendig. UV-stabiel met juiste compound. Volledig recyclebaar. Voor industriële toepassingen, marine, opslagtanks, gevelelementen.",
      "props": ["Slagvast tot −40°C", "Chemicaliënbestendig", "100% recyclebaar"]
    },
    {
      "name": "PP",
      "tagline": "Polypropyleen",
      "body": "Lichter dan HDPE, hoger smeltpunt, uitstekende vermoeiingsweerstand. Geschikt voor scharnierende toepassingen, autotoebehoren, lab-apparatuur.",
      "props": ["Hoog smeltpunt (160°C)", "Vermoeiingsbestendig", "Goed te lassen"]
    },
    {
      "name": "Food-grade HDPE",
      "tagline": "Voedselveilig polyethyleen",
      "body": "HDPE met EU-certificering voor voedselcontact. Voor productieomgevingen, voedselverwerking, dispenserdelen, kookgerei-componenten.",
      "props": ["EU 10/2011 conform", "Geur- en smaakneutraal", "Hygiënisch reinigbaar"]
    }
  ],
  "recycle_heading": "Factory-fresh recyclaat",
  "recycle_body": "Wij gebruiken industrieel restmateriaal direct uit de productiestroom van moederbedrijf Kuypers Kunststoftechniek. Geen post-consumer mengstromen, geen onbekende vervuiling — single-stream, traceerbaar, en in kwaliteit gelijkwaardig aan virgin materiaal. Standaard maken we een mix; 100% recyclaat is mogelijk op aanvraag.",
  "recycle_specs": [
    { "k": "Bron", "v": "Productiestroom Kuypers Kunststoftechniek" },
    { "k": "Type", "v": "Single-stream HDPE / PP" },
    { "k": "Vervuiling", "v": "Niet aanwezig (industrieel restmateriaal)" },
    { "k": "Mengverhouding", "v": "Op aanvraag, tot 100% recyclaat" }
  ]
}
```

- [ ] **Step 2: Create `i18n/locales/en/materials.json`**

```json
{
  "title": "Materials",
  "lead": "We specialise in HDPE and PP — two polyolefins that are notoriously hard to print at scale. We do it daily, and we make our own recyclate in-house.",
  "items": [
    {
      "name": "HDPE",
      "tagline": "High-density polyethylene",
      "body": "Strong, impact-resistant, chemical-resistant and weatherproof. UV-stable with the right compound. Fully recyclable. For industrial applications, marine, storage tanks, facade elements.",
      "props": ["Impact-tough to −40°C", "Chemical-resistant", "100% recyclable"]
    },
    {
      "name": "PP",
      "tagline": "Polypropylene",
      "body": "Lighter than HDPE, higher melting point, excellent fatigue resistance. Suited for living-hinge applications, automotive trim, lab equipment.",
      "props": ["High melting point (160°C)", "Fatigue-resistant", "Easily welded"]
    },
    {
      "name": "Food-grade HDPE",
      "tagline": "Food-contact polyethylene",
      "body": "HDPE with EU certification for food contact. For production environments, food processing, dispenser parts, cookware components.",
      "props": ["EU 10/2011 compliant", "Odour and taste neutral", "Hygienically washable"]
    }
  ],
  "recycle_heading": "Factory-fresh recyclate",
  "recycle_body": "We use industrial offcuts directly from the production line of our parent company, Kuypers Kunststoftechniek. No post-consumer mixed streams, no unknown contamination — single-stream, traceable, and in quality equivalent to virgin material. By default we run a blend; 100% recyclate is available on request.",
  "recycle_specs": [
    { "k": "Source", "v": "Kuypers Kunststoftechniek production stream" },
    { "k": "Type", "v": "Single-stream HDPE / PP" },
    { "k": "Contamination", "v": "None (industrial offcuts)" },
    { "k": "Blend ratio", "v": "On request, up to 100% recyclate" }
  ]
}
```

- [ ] **Step 3: Update `i18n/i18n.config.ts`**

```ts
import nlMaterials from './locales/nl/materials.json'
import enMaterials from './locales/en/materials.json'
// merge under nl/en under key `materials`
```

- [ ] **Step 4: Create `pages/materialen.vue`**

```vue
<script setup lang="ts">
const { t, tm } = useI18n()
const items = computed(() => tm('materials.items') as Array<{ name: string; tagline: string; body: string; props: string[] }>)
const recycleSpecs = computed(() => tm('materials.recycle_specs') as Array<{ k: string; v: string }>)
useHead({ title: `${t('materials.title')} · ${t('common.company')}` })

definePageMeta({
  alias: ['/en/materials'],
})
</script>

<template>
  <div class="max-w-[1100px] mx-auto px-6 py-20">
    <h1 class="text-[42px] font-semibold tracking-tight">{{ t('materials.title') }}</h1>
    <p class="mt-4 text-text-muted text-[15px] max-w-[760px]">{{ t('materials.lead') }}</p>

    <div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4">
      <BaseCard v-for="item in items" :key="item.name">
        <p class="font-mono text-[10px] text-text-muted tracking-wider uppercase">{{ item.tagline }}</p>
        <h2 class="text-[24px] font-semibold mt-1 mb-3">{{ item.name }}</h2>
        <p class="text-[13px] text-text-muted leading-[1.55] mb-4">{{ item.body }}</p>
        <ul class="space-y-1">
          <li v-for="p in item.props" :key="p" class="text-[12px] flex gap-2">
            <span class="text-accent">•</span>{{ p }}
          </li>
        </ul>
      </BaseCard>
    </div>

    <section class="mt-24 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">
      <div>
        <p class="font-mono text-[11px] text-accent tracking-wider mb-3">// FACTORY-FRESH</p>
        <h2 class="text-[28px] font-semibold tracking-tight">{{ t('materials.recycle_heading') }}</h2>
        <p class="mt-4 text-text-muted text-[15px] leading-[1.6]">{{ t('materials.recycle_body') }}</p>
      </div>
      <BaseCard>
        <dl class="space-y-3 text-[13px]">
          <div v-for="spec in recycleSpecs" :key="spec.k" class="flex justify-between gap-4 border-b border-border pb-2 last:border-0">
            <dt class="font-mono text-[11px] text-text-muted uppercase tracking-wider">{{ spec.k }}</dt>
            <dd class="font-medium text-text text-right">{{ spec.v }}</dd>
          </div>
        </dl>
      </BaseCard>
    </section>
  </div>
</template>
```

- [ ] **Step 5: Verify and commit**

```bash
git add -A
git commit -m "feat(pages): add /materialen page with HDPE/PP/food-grade and recyclate story"
```

---

## Task 14: /over-ons page

**Files:**
- Create: `pages/over-ons.vue`, `i18n/locales/{nl,en}/about.json`
- Modify: `i18n/i18n.config.ts`

- [ ] **Step 1: Create `i18n/locales/nl/about.json`**

```json
{
  "title": "Over RoBuPRINT",
  "lead": "Een 3D-print tak van Kuypers Kunststoftechniek, opgezet om grote polymeer-onderdelen te maken die de standaard FDM-wereld niet aankan.",
  "sections": [
    {
      "heading": "Onderdeel van Kuypers",
      "body": "RoBuPRINT is een zijtak van Kuypers Kunststoftechniek, al jaren actief in industriële kunststofverwerking. We benutten de productiekennis, de materialen en de productiestroom van het moederbedrijf — daarmee staat een 3D-print operatie op een industriële basis."
    },
    {
      "heading": "Circulair vanzelf",
      "body": "Onze recyclaatstroom komt rechtstreeks van Kuypers' productie. Geen externe leveranciers, geen onzeker materiaal — wat in onze hal binnenkomt is herleidbaar tot batch en productiedag. Voor klanten die circulariteit willen aantonen is dat een verschil dat telt."
    },
    {
      "heading": "Made in Limburg",
      "body": "We werken vanuit Limburg, voor klanten in Nederland, België, en daarbuiten. Komen kijken kan altijd — sommige van onze beste projecten begonnen met een rondleiding."
    }
  ]
}
```

- [ ] **Step 2: Create `i18n/locales/en/about.json`**

```json
{
  "title": "About RoBuPRINT",
  "lead": "A 3D printing branch of Kuypers Kunststoftechniek, set up to make large polymer parts that standard FDM can't handle.",
  "sections": [
    {
      "heading": "Part of Kuypers",
      "body": "RoBuPRINT is a side branch of Kuypers Kunststoftechniek, an established plastics manufacturer. We draw on the parent company's production know-how, materials, and supply stream — putting a 3D printing operation on an industrial foundation."
    },
    {
      "heading": "Circular by default",
      "body": "Our recyclate stream comes straight from Kuypers production. No external suppliers, no uncertain material — what arrives in our hall is traceable to batch and production day. For customers who need to evidence circularity, that's a difference that counts."
    },
    {
      "heading": "Made in Limburg",
      "body": "We work from Limburg, for clients in the Netherlands, Belgium, and beyond. You're welcome to visit — some of our best projects started with a tour."
    }
  ]
}
```

- [ ] **Step 3: Update `i18n/i18n.config.ts`** — same pattern: import + merge under `about`.

- [ ] **Step 4: Create `pages/over-ons.vue`**

```vue
<script setup lang="ts">
const { t, tm } = useI18n()
const sections = computed(() => tm('about.sections') as Array<{ heading: string; body: string }>)
useHead({ title: `${t('about.title')} · ${t('common.company')}` })

definePageMeta({
  alias: ['/en/about'],
})
</script>

<template>
  <div class="max-w-[860px] mx-auto px-6 py-20">
    <h1 class="text-[42px] font-semibold tracking-tight">{{ t('about.title') }}</h1>
    <p class="mt-4 text-text-muted text-[15px]">{{ t('about.lead') }}</p>

    <div class="mt-16 space-y-12">
      <section v-for="s in sections" :key="s.heading">
        <h2 class="text-[22px] font-semibold tracking-tight">{{ s.heading }}</h2>
        <p class="mt-3 text-text-muted text-[15px] leading-[1.65]">{{ s.body }}</p>
      </section>
    </div>
  </div>
</template>
```

- [ ] **Step 5: Verify and commit**

```bash
git add -A
git commit -m "feat(pages): add /over-ons page"
```

---

## Task 15: Projects index and dynamic slug pages with @nuxt/content

**Files:**
- Create: `pages/projecten/index.vue`, `pages/projecten/[slug].vue`, `content.config.ts`, `content/projecten/.gitkeep`, `i18n/locales/{nl,en}/projects.json`
- Modify: `i18n/i18n.config.ts`

- [ ] **Step 1: Install and verify `@nuxt/content`**

Already in modules from Task 1. Verify `pnpm install` was run.

- [ ] **Step 2: Create `content.config.ts`**

```ts
import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    projects: defineCollection({
      type: 'page',
      source: 'projecten/*.md',
      schema: z.object({
        title: z.string(),
        client: z.string().optional(),
        material: z.string().optional(),
        year: z.number().optional(),
        cover: z.string().optional(),
        summary: z.string(),
        locale: z.enum(['nl', 'en']).default('nl'),
      }),
    }),
  },
})
```

- [ ] **Step 3: Create `i18n/locales/nl/projects.json`**

```json
{
  "title": "Projecten",
  "lead": "Een doorlopende selectie van wat we hebben gemaakt. Foto's en case studies komen binnen.",
  "empty": "De eerste cases volgen binnenkort.",
  "view_project": "Bekijk project →",
  "back_to_projects": "← Terug naar projecten"
}
```

- [ ] **Step 4: Create `i18n/locales/en/projects.json`**

```json
{
  "title": "Projects",
  "lead": "A rolling selection of what we've made. Photos and case studies coming.",
  "empty": "First cases coming soon.",
  "view_project": "View project →",
  "back_to_projects": "← Back to projects"
}
```

- [ ] **Step 5: Update `i18n/i18n.config.ts`** — add projects under `projects` key.

- [ ] **Step 6: Create `pages/projecten/index.vue`**

```vue
<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
useHead({ title: `${t('projects.title')} · ${t('common.company')}` })

const { data: projects } = await useAsyncData('projects-list', () =>
  queryCollection('projects').where('locale', '=', locale.value).order('year', 'DESC').all(),
)

definePageMeta({ alias: ['/en/projects'] })
</script>

<template>
  <div class="max-w-[1100px] mx-auto px-6 py-20">
    <h1 class="text-[42px] font-semibold tracking-tight">{{ t('projects.title') }}</h1>
    <p class="mt-4 text-text-muted text-[15px] max-w-[760px]">{{ t('projects.lead') }}</p>

    <div v-if="projects && projects.length" class="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
      <NuxtLink v-for="p in projects" :key="p.path" :to="localePath(p.path)" class="block">
        <BaseCard>
          <p class="font-mono text-[10px] text-text-muted tracking-wider uppercase">{{ p.client ?? '—' }}</p>
          <h2 class="text-[20px] font-semibold mt-1 mb-2">{{ p.title }}</h2>
          <p class="text-[13px] text-text-muted leading-[1.55]">{{ p.summary }}</p>
          <p class="mt-4 text-accent text-[12px] font-medium">{{ t('projects.view_project') }}</p>
        </BaseCard>
      </NuxtLink>
    </div>
    <div v-else class="mt-12 border border-dashed border-border rounded-[var(--radius-lg)] p-16 text-center">
      <p class="text-text-muted text-[14px]">{{ t('projects.empty') }}</p>
    </div>
  </div>
</template>
```

- [ ] **Step 7: Create `pages/projecten/[slug].vue`**

```vue
<script setup lang="ts">
const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()

const { data: project } = await useAsyncData(`project-${route.params.slug}`, () =>
  queryCollection('projects')
    .path(`/projecten/${route.params.slug}`)
    .where('locale', '=', locale.value)
    .first(),
)

if (!project.value) {
  throw createError({ statusCode: 404, statusMessage: 'Project not found', fatal: true })
}

useHead({ title: `${project.value.title} · ${t('common.company')}` })

definePageMeta({ alias: ['/en/projects/:slug'] })
</script>

<template>
  <article v-if="project" class="max-w-[860px] mx-auto px-6 py-20">
    <NuxtLink :to="localePath('/projecten')" class="text-[13px] text-text-muted hover:text-text">{{ t('projects.back_to_projects') }}</NuxtLink>
    <h1 class="mt-4 text-[36px] font-semibold tracking-tight">{{ project.title }}</h1>
    <dl class="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-[12px] font-mono text-text-muted">
      <div v-if="project.client"><dt class="inline">CLIENT</dt> <dd class="inline text-text">{{ project.client }}</dd></div>
      <div v-if="project.material"><dt class="inline">MATERIAL</dt> <dd class="inline text-text">{{ project.material }}</dd></div>
      <div v-if="project.year"><dt class="inline">YEAR</dt> <dd class="inline text-text">{{ project.year }}</dd></div>
    </dl>
    <p class="mt-6 text-[16px] text-text-muted leading-[1.6]">{{ project.summary }}</p>
    <div class="prose mt-12 max-w-none">
      <ContentRenderer :value="project" />
    </div>
  </article>
</template>
```

- [ ] **Step 8: Add an example project markdown so the page isn't empty**

Create `content/projecten/voorbeeld-paneel.md` (Dutch, mark `locale: nl`) and `content/projecten/voorbeeld-paneel.en.md` (English, `locale: en`).

`content/projecten/voorbeeld-paneel.md`:

```md
---
title: "Voorbeeldproject — gevelpaneel"
client: "Placeholder klant"
material: "HDPE — 100% recyclaat"
year: 2026
summary: "Tijdelijk voorbeeldproject totdat de eerste echte case klaar is."
locale: nl
---

Dit is een placeholder-project zodat de projecten-pagina iets toont. Vervang door een echte case zodra beschikbaar.
```

`content/projecten/voorbeeld-paneel.en.md`:

```md
---
title: "Example project — facade panel"
client: "Placeholder client"
material: "HDPE — 100% recyclate"
year: 2026
summary: "Temporary example project until the first real case lands."
locale: en
---

This is a placeholder project so the projects page has something to show. Replace with a real case once available.
```

- [ ] **Step 9: Verify and commit**

```bash
git add -A
git commit -m "feat(pages): projects index and slug page with @nuxt/content"
```

---

## Task 16: Cloudflare Turnstile composable

**Files:**
- Create: `composables/useTurnstile.ts`

- [ ] **Step 1: Implement `useTurnstile.ts`**

```ts
declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement | string, opts: { sitekey: string; callback: (token: string) => void; 'error-callback'?: () => void }) => string
      reset: (id?: string) => void
      remove: (id?: string) => void
    }
    onloadTurnstileCallback?: () => void
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onloadTurnstileCallback'

let scriptPromise: Promise<void> | null = null

function loadTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.turnstile) return Promise.resolve()
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise<void>((resolve, reject) => {
    window.onloadTurnstileCallback = () => resolve()
    const s = document.createElement('script')
    s.src = SCRIPT_SRC
    s.async = true
    s.defer = true
    s.onerror = () => reject(new Error('Turnstile failed to load'))
    document.head.appendChild(s)
  })
  return scriptPromise
}

export function useTurnstile() {
  const config = useRuntimeConfig()
  const siteKey = config.public.turnstileSiteKey

  async function getToken(container: HTMLElement): Promise<string> {
    if (!siteKey) {
      // In dev without a key, return a fake token; backend should accept "dev" tokens in dev mode.
      return 'dev-no-turnstile'
    }
    await loadTurnstileScript()
    return new Promise((resolve, reject) => {
      if (!window.turnstile) return reject(new Error('Turnstile not available'))
      window.turnstile.render(container, {
        sitekey: siteKey,
        callback: (token) => resolve(token),
        'error-callback': () => reject(new Error('Turnstile challenge failed')),
      })
    })
  }

  return { getToken }
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(api): add useTurnstile composable"
```

---

## Task 17: Contact page with functional form

**Files:**
- Create: `pages/contact.vue`, `components/forms/ContactForm.vue`, `i18n/locales/{nl,en}/contact.json`
- Modify: `i18n/i18n.config.ts`, `components/forms/NewsletterForm.vue`

- [ ] **Step 1: Create `i18n/locales/nl/contact.json`**

```json
{
  "title": "Neem contact op",
  "lead": "Stuur een bericht — we reageren binnen 2 werkdagen.",
  "fields": {
    "name": "Naam",
    "company": "Bedrijf",
    "email": "E-mail",
    "phone": "Telefoon (optioneel)",
    "message": "Bericht"
  },
  "submit": "Verstuur bericht"
}
```

- [ ] **Step 2: Create `i18n/locales/en/contact.json`**

```json
{
  "title": "Get in touch",
  "lead": "Send us a message — we'll respond within 2 business days.",
  "fields": {
    "name": "Name",
    "company": "Company",
    "email": "Email",
    "phone": "Phone (optional)",
    "message": "Message"
  },
  "submit": "Send message"
}
```

- [ ] **Step 3: Update `i18n/i18n.config.ts`** — merge `contact` under both locales.

- [ ] **Step 4: Create `ContactForm.vue`**

```vue
<script setup lang="ts">
import { isEmail, isNonEmpty } from '~/utils/validators'

const { t } = useI18n()
const { request } = useApi()
const { getToken } = useTurnstile()

const form = reactive({ name: '', company: '', email: '', phone: '', message: '', consent: false })
const errors = ref<Record<string, string>>({})
const status = ref<'idle' | 'submitting' | 'success' | 'error'>('idle')
const turnstileEl = ref<HTMLElement | null>(null)

function validate() {
  const e: Record<string, string> = {}
  if (!isNonEmpty(form.name)) e.name = t('contact.fields.name')
  if (!isEmail(form.email)) e.email = t('contact.fields.email')
  if (!isNonEmpty(form.message)) e.message = t('contact.fields.message')
  if (!form.consent) e.consent = t('common.form.consent')
  errors.value = e
  return Object.keys(e).length === 0
}

async function onSubmit() {
  if (!validate()) return
  status.value = 'submitting'
  try {
    const token = turnstileEl.value ? await getToken(turnstileEl.value) : 'dev-no-turnstile'
    await request('/contact', {
      body: {
        name: form.name,
        company: form.company,
        email: form.email,
        phone: form.phone,
        message: form.message,
        turnstile_token: token,
      },
    })
    status.value = 'success'
  } catch {
    status.value = 'error'
  }
}
</script>

<template>
  <form class="space-y-5 max-w-[640px]" @submit.prevent="onSubmit">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-[12px] font-medium mb-1.5">{{ t('contact.fields.name') }} <span class="text-accent">*</span></label>
        <BaseInput v-model="form.name" autocomplete="name" required />
        <p v-if="errors.name" class="text-[11px] text-red-600 mt-1">{{ errors.name }}</p>
      </div>
      <div>
        <label class="block text-[12px] font-medium mb-1.5">{{ t('contact.fields.company') }}</label>
        <BaseInput v-model="form.company" autocomplete="organization" />
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-[12px] font-medium mb-1.5">{{ t('contact.fields.email') }} <span class="text-accent">*</span></label>
        <BaseInput v-model="form.email" type="email" autocomplete="email" required />
        <p v-if="errors.email" class="text-[11px] text-red-600 mt-1">{{ errors.email }}</p>
      </div>
      <div>
        <label class="block text-[12px] font-medium mb-1.5">{{ t('contact.fields.phone') }}</label>
        <BaseInput v-model="form.phone" type="tel" autocomplete="tel" />
      </div>
    </div>
    <div>
      <label class="block text-[12px] font-medium mb-1.5">{{ t('contact.fields.message') }} <span class="text-accent">*</span></label>
      <BaseTextarea v-model="form.message" :rows="6" required />
      <p v-if="errors.message" class="text-[11px] text-red-600 mt-1">{{ errors.message }}</p>
    </div>
    <label class="flex items-start gap-2 text-[12px] text-text-muted">
      <input v-model="form.consent" type="checkbox" class="mt-0.5">
      <span>{{ t('common.form.consent') }}</span>
    </label>
    <p v-if="errors.consent" class="text-[11px] text-red-600">{{ errors.consent }}</p>
    <div ref="turnstileEl" />
    <BaseButton type="submit" variant="accent" :disabled="status === 'submitting'">
      {{ status === 'submitting' ? t('common.form.submitting') : t('contact.submit') }}
    </BaseButton>
    <p v-if="status === 'success'" class="text-[13px] text-accent">{{ t('common.form.success') }}</p>
    <p v-else-if="status === 'error'" class="text-[13px] text-red-600">{{ t('common.form.error_generic') }}</p>
  </form>
</template>
```

- [ ] **Step 5: Update `NewsletterForm.vue` to use the API client**

```vue
<script setup lang="ts">
const { t } = useI18n()
const { request } = useApi()
const email = ref('')
const status = ref<'idle' | 'submitting' | 'success' | 'error'>('idle')

async function onSubmit() {
  if (!email.value.includes('@')) return
  status.value = 'submitting'
  try {
    await request('/newsletter', { body: { email: email.value } })
    status.value = 'success'
    email.value = ''
  } catch {
    status.value = 'error'
  }
}
</script>

<template>
  <form class="flex gap-2 max-w-sm" @submit.prevent="onSubmit">
    <BaseInput v-model="email" type="email" :placeholder="t('common.footer.newsletter_placeholder')" required autocomplete="email" />
    <BaseButton type="submit" variant="primary" size="sm" :disabled="status === 'submitting'">{{ t('common.footer.newsletter_submit') }}</BaseButton>
  </form>
  <p v-if="status === 'success'" class="text-[12px] text-text-muted mt-2">{{ t('common.form.success') }}</p>
  <p v-else-if="status === 'error'" class="text-[12px] text-red-600 mt-2">{{ t('common.form.error_generic') }}</p>
</template>
```

- [ ] **Step 6: Create `pages/contact.vue`**

```vue
<script setup lang="ts">
const { t } = useI18n()
useHead({ title: `${t('contact.title')} · ${t('common.company')}` })
definePageMeta({ alias: ['/en/contact'] })
</script>

<template>
  <div class="max-w-[860px] mx-auto px-6 py-20">
    <h1 class="text-[42px] font-semibold tracking-tight">{{ t('contact.title') }}</h1>
    <p class="mt-4 text-text-muted text-[15px] max-w-[600px]">{{ t('contact.lead') }}</p>
    <div class="mt-12">
      <ContactForm />
    </div>
  </div>
</template>
```

- [ ] **Step 7: Verify and commit**

```bash
git add -A
git commit -m "feat(forms): add contact page with validation, Turnstile, and API submit"
```

---

## Task 18: Chunker utility (TDD)

**Files:**
- Create: `utils/chunker.ts`, `tests/unit/chunker.test.ts`

- [ ] **Step 1: Write the failing test**

`tests/unit/chunker.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { planChunks } from '~/utils/chunker'

describe('planChunks', () => {
  const CHUNK = 5 * 1024 * 1024 // 5 MB

  it('returns one chunk for tiny files', () => {
    expect(planChunks(100, CHUNK)).toEqual([{ index: 0, start: 0, end: 100 }])
  })

  it('splits an exact-multiple file', () => {
    const total = CHUNK * 3
    const chunks = planChunks(total, CHUNK)
    expect(chunks).toHaveLength(3)
    expect(chunks[0]).toEqual({ index: 0, start: 0, end: CHUNK })
    expect(chunks[2]).toEqual({ index: 2, start: CHUNK * 2, end: total })
  })

  it('handles a non-multiple file', () => {
    const total = CHUNK * 2 + 100
    const chunks = planChunks(total, CHUNK)
    expect(chunks).toHaveLength(3)
    expect(chunks[2]).toEqual({ index: 2, start: CHUNK * 2, end: total })
  })

  it('rejects zero-size files', () => {
    expect(() => planChunks(0, CHUNK)).toThrow(/empty/i)
  })

  it('rejects non-positive chunk size', () => {
    expect(() => planChunks(100, 0)).toThrow(/chunk size/i)
  })
})
```

- [ ] **Step 2: Run, confirm failure**

```bash
pnpm test
```

Expected: fails to import `~/utils/chunker`.

- [ ] **Step 3: Implement `utils/chunker.ts`**

```ts
export type ChunkPlan = { index: number; start: number; end: number }

export function planChunks(totalBytes: number, chunkSize: number): ChunkPlan[] {
  if (totalBytes <= 0) throw new Error('Cannot chunk an empty file')
  if (chunkSize <= 0) throw new Error('Chunk size must be positive')
  const out: ChunkPlan[] = []
  let i = 0
  for (let start = 0; start < totalBytes; start += chunkSize) {
    const end = Math.min(start + chunkSize, totalBytes)
    out.push({ index: i++, start, end })
  }
  return out
}
```

- [ ] **Step 4: Run, confirm pass**

```bash
pnpm test
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(utils): add chunker utility with TDD"
```

---

## Task 19: Chunked upload composable (TDD)

**Files:**
- Create: `composables/useChunkedUpload.ts`, `tests/unit/useChunkedUpload.test.ts`

- [ ] **Step 1: Write the failing test**

`tests/unit/useChunkedUpload.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { uploadFileInChunks } from '~/composables/useChunkedUpload'

const CHUNK = 5 * 1024 * 1024

function makeBlob(size: number): Blob {
  return new Blob([new Uint8Array(size)])
}

describe('uploadFileInChunks', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ ok: true }) })
    global.fetch = fetchMock as unknown as typeof fetch
  })

  it('posts the right number of chunks for a small file', async () => {
    const blob = makeBlob(100)
    const onProgress = vi.fn()
    await uploadFileInChunks({
      url: 'https://api.test/quote/upload',
      file: blob as File,
      filename: 'a.stl',
      uploadId: 'u-1',
      chunkSize: CHUNK,
      onProgress,
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(onProgress).toHaveBeenCalledWith(1, 1)
  })

  it('posts multiple chunks and reports progress', async () => {
    const blob = makeBlob(CHUNK * 2 + 100)
    const onProgress = vi.fn()
    await uploadFileInChunks({
      url: 'https://api.test/quote/upload',
      file: blob as File,
      filename: 'big.stl',
      uploadId: 'u-2',
      chunkSize: CHUNK,
      onProgress,
    })
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(onProgress).toHaveBeenLastCalledWith(3, 3)
  })

  it('throws on a non-OK response', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Server Error' })
    const blob = makeBlob(100)
    await expect(uploadFileInChunks({
      url: 'https://api.test/quote/upload',
      file: blob as File,
      filename: 'a.stl',
      uploadId: 'u-3',
      chunkSize: CHUNK,
      onProgress: () => {},
    })).rejects.toThrow(/upload failed/i)
  })
})
```

- [ ] **Step 2: Run, confirm failure**

- [ ] **Step 3: Implement `composables/useChunkedUpload.ts`**

```ts
import { planChunks } from '~/utils/chunker'

export type UploadOptions = {
  url: string
  file: File | Blob
  filename: string
  uploadId: string
  chunkSize: number
  onProgress: (done: number, total: number) => void
  signal?: AbortSignal
}

export async function uploadFileInChunks(opts: UploadOptions): Promise<void> {
  const chunks = planChunks(opts.file.size, opts.chunkSize)
  for (const chunk of chunks) {
    const slice = opts.file.slice(chunk.start, chunk.end)
    const fd = new FormData()
    fd.append('upload_id', opts.uploadId)
    fd.append('filename', opts.filename)
    fd.append('chunk_index', String(chunk.index))
    fd.append('chunk_total', String(chunks.length))
    fd.append('chunk', slice, opts.filename)
    const res = await fetch(opts.url, { method: 'POST', body: fd, signal: opts.signal })
    if (!res.ok) {
      throw new Error(`Upload failed: chunk ${chunk.index} returned ${res.status} ${res.statusText}`)
    }
    opts.onProgress(chunk.index + 1, chunks.length)
  }
}

export function useChunkedUpload() {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  function newUploadId(): string {
    return crypto.randomUUID()
  }

  async function upload(file: File, onProgress: (pct: number) => void, signal?: AbortSignal): Promise<{ uploadId: string; filename: string; size: number }> {
    const uploadId = newUploadId()
    const CHUNK = 5 * 1024 * 1024
    await uploadFileInChunks({
      url: `${base}/quote/upload`,
      file,
      filename: file.name,
      uploadId,
      chunkSize: CHUNK,
      onProgress: (done, total) => onProgress(Math.round((done / total) * 100)),
      signal,
    })
    return { uploadId, filename: file.name, size: file.size }
  }

  return { upload, newUploadId }
}
```

- [ ] **Step 4: Run, confirm pass**

```bash
pnpm test
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(forms): add chunked upload composable with tests"
```

---

## Task 20: Quote page with file dropzone

**Files:**
- Create: `pages/offerte.vue`, `components/forms/QuoteForm.vue`, `components/forms/FileDropzone.vue`, `i18n/locales/{nl,en}/quote.json`
- Modify: `i18n/i18n.config.ts`

- [ ] **Step 1: Create `i18n/locales/nl/quote.json`**

```json
{
  "title": "Vraag een offerte aan",
  "lead": "Upload je bestand(en) en geef wat context. We reageren binnen 2 werkdagen met een eerste inschatting of vervolgvragen.",
  "drop": {
    "title": "Sleep bestanden hier of klik om te uploaden",
    "subtitle": "Tot 1 GB per bestand · meerdere bestanden mogelijk",
    "button": "Bestanden kiezen",
    "formats": ".STL · .STEP · .STP · .OBJ · .3MF · .IGS · .X_T"
  },
  "section_project": "PROJECT",
  "section_contact": "CONTACT",
  "fields": {
    "material": "Materiaal-voorkeur",
    "quantity": "Aantal stuks",
    "milling": "Nafrezen?",
    "deadline": "Gewenste opleverdatum",
    "deadline_placeholder": "bv. medio juni",
    "description": "Beschrijf het project (optioneel)",
    "description_placeholder": "Toepassing, omgeving, eisen, vragen...",
    "name": "Naam",
    "company": "Bedrijf",
    "email": "E-mail",
    "phone": "Telefoon (optioneel)"
  },
  "options": {
    "material": ["HDPE", "PP", "Food-grade HDPE", "Advies graag"],
    "quantity": ["1 (prototype)", "2 – 5", "6 – 25", "25+"],
    "milling": ["Nee", "Ja, voor strakke finish", "Onzeker"]
  },
  "submit": "Verstuur aanvraag"
}
```

- [ ] **Step 2: Create `i18n/locales/en/quote.json`**

```json
{
  "title": "Request a quote",
  "lead": "Upload your file(s) and give us some context. We'll respond within 2 business days with a first estimate or follow-up questions.",
  "drop": {
    "title": "Drag files here or click to upload",
    "subtitle": "Up to 1 GB per file · multiple files allowed",
    "button": "Choose files",
    "formats": ".STL · .STEP · .STP · .OBJ · .3MF · .IGS · .X_T"
  },
  "section_project": "PROJECT",
  "section_contact": "CONTACT",
  "fields": {
    "material": "Material preference",
    "quantity": "Quantity",
    "milling": "Post-milling?",
    "deadline": "Wanted by",
    "deadline_placeholder": "e.g. mid-June",
    "description": "Describe the project (optional)",
    "description_placeholder": "Application, environment, requirements, questions...",
    "name": "Name",
    "company": "Company",
    "email": "Email",
    "phone": "Phone (optional)"
  },
  "options": {
    "material": ["HDPE", "PP", "Food-grade HDPE", "Advise me"],
    "quantity": ["1 (prototype)", "2 – 5", "6 – 25", "25+"],
    "milling": ["No", "Yes, for clean finish", "Not sure"]
  },
  "submit": "Send request"
}
```

- [ ] **Step 3: Update `i18n/i18n.config.ts`** — merge `quote`.

- [ ] **Step 4: Create `FileDropzone.vue`**

```vue
<script setup lang="ts">
const { t } = useI18n()
const props = defineProps<{ accept: string }>()
const emit = defineEmits<{ filesSelected: [files: File[]] }>()

const isOver = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

function onDrop(e: DragEvent) {
  isOver.value = false
  if (e.dataTransfer?.files) {
    emit('filesSelected', Array.from(e.dataTransfer.files))
  }
}
function onPick(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) emit('filesSelected', Array.from(input.files))
  input.value = ''
}
</script>

<template>
  <div
    :class="[
      'border-[1.5px] border-dashed rounded-[var(--radius-lg)] p-8 text-center transition-colors',
      isOver ? 'border-accent bg-accent-soft' : 'border-border bg-accent-soft/40 hover:border-accent',
    ]"
    @dragover.prevent="isOver = true"
    @dragleave.prevent="isOver = false"
    @drop.prevent="onDrop"
  >
    <p class="text-[15px] font-semibold">{{ t('quote.drop.title') }}</p>
    <p class="text-[12px] text-text-muted mt-1">{{ t('quote.drop.subtitle') }}</p>
    <BaseButton class="mt-3" size="sm" @click="inputRef?.click()">{{ t('quote.drop.button') }}</BaseButton>
    <input ref="inputRef" type="file" multiple :accept="accept" class="hidden" @change="onPick">
    <p class="mt-3 font-mono text-[10.5px] text-text-muted tracking-wider">{{ t('quote.drop.formats') }}</p>
  </div>
</template>
```

- [ ] **Step 5: Create `QuoteForm.vue`**

```vue
<script setup lang="ts">
import { isEmail, isNonEmpty } from '~/utils/validators'

type UploadedFile = { uploadId: string; filename: string; size: number; progress: number }

const { t, tm } = useI18n()
const { request } = useApi()
const { upload } = useChunkedUpload()
const { getToken } = useTurnstile()

const ACCEPT = '.stl,.step,.stp,.obj,.3mf,.iges,.igs,.x_t,.x_b'
const materialOpts = computed(() => tm('quote.options.material') as string[])
const quantityOpts = computed(() => (tm('quote.options.quantity') as string[]).map((v) => ({ value: v, label: v })))
const millingOpts = computed(() => tm('quote.options.milling') as string[])

const form = reactive({
  material: '',
  quantity: '',
  milling: '',
  deadline: '',
  description: '',
  name: '',
  company: '',
  email: '',
  phone: '',
  consent: false,
})
const localFiles = ref<Array<{ file: File; progress: number; uploadId?: string; error?: string }>>([])
const errors = ref<Record<string, string>>({})
const status = ref<'idle' | 'uploading' | 'submitting' | 'success' | 'error'>('idle')
const turnstileEl = ref<HTMLElement | null>(null)

function onFilesSelected(files: File[]) {
  for (const f of files) {
    localFiles.value.push({ file: f, progress: 0 })
  }
}
function removeFile(idx: number) {
  localFiles.value.splice(idx, 1)
}
function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`
}

function validate() {
  const e: Record<string, string> = {}
  if (!isNonEmpty(form.material)) e.material = t('quote.fields.material')
  if (!isNonEmpty(form.quantity)) e.quantity = t('quote.fields.quantity')
  if (!isNonEmpty(form.name)) e.name = t('quote.fields.name')
  if (!isEmail(form.email)) e.email = t('quote.fields.email')
  if (!form.consent) e.consent = t('common.form.consent')
  if (localFiles.value.length === 0) e.files = t('quote.drop.title')
  errors.value = e
  return Object.keys(e).length === 0
}

async function uploadAll(): Promise<UploadedFile[]> {
  status.value = 'uploading'
  const out: UploadedFile[] = []
  for (let i = 0; i < localFiles.value.length; i++) {
    const entry = localFiles.value[i]
    if (entry.uploadId) {
      out.push({ uploadId: entry.uploadId, filename: entry.file.name, size: entry.file.size, progress: 100 })
      continue
    }
    try {
      const result = await upload(entry.file, (pct) => { entry.progress = pct })
      entry.uploadId = result.uploadId
      out.push({ ...result, progress: 100 })
    } catch (err) {
      entry.error = (err as Error).message
      throw err
    }
  }
  return out
}

async function onSubmit() {
  if (!validate()) return
  try {
    const uploaded = await uploadAll()
    status.value = 'submitting'
    const token = turnstileEl.value ? await getToken(turnstileEl.value) : 'dev-no-turnstile'
    await request('/quote/submit', {
      body: {
        material: form.material,
        quantity: form.quantity,
        milling: form.milling,
        deadline: form.deadline,
        description: form.description,
        name: form.name,
        company: form.company,
        email: form.email,
        phone: form.phone,
        files: uploaded.map((f) => ({ upload_id: f.uploadId, filename: f.filename, size: f.size })),
        turnstile_token: token,
      },
    })
    status.value = 'success'
  } catch {
    status.value = 'error'
  }
}
</script>

<template>
  <form class="bg-surface border border-border rounded-[var(--radius-xl)] p-8 md:p-10 max-w-[780px] mx-auto" @submit.prevent="onSubmit">
    <p class="font-mono text-[11px] text-accent tracking-wider mb-2">// {{ t('quote.section_project') }}</p>
    <h1 class="text-[28px] font-semibold tracking-tight mb-2">{{ t('quote.title') }}</h1>
    <p class="text-[14px] text-text-muted mb-8">{{ t('quote.lead') }}</p>

    <FileDropzone :accept="ACCEPT" @files-selected="onFilesSelected" />
    <p v-if="errors.files" class="text-[11px] text-red-600 mt-2">{{ errors.files }}</p>

    <ul class="mt-3 space-y-2">
      <li v-for="(entry, idx) in localFiles" :key="idx" class="flex items-center gap-3 p-3 bg-surface border border-border rounded-[var(--radius-md)]">
        <div class="w-9 h-9 bg-accent text-white rounded-md flex items-center justify-center font-mono text-[10px] font-semibold">{{ entry.file.name.split('.').pop()?.toUpperCase().slice(0,3) }}</div>
        <div class="flex-1 min-w-0">
          <p class="text-[13px] font-medium truncate">{{ entry.file.name }}</p>
          <p class="text-[11px] text-text-muted font-mono">{{ fmtBytes(entry.file.size) }}<span v-if="entry.progress > 0 && entry.progress < 100"> · {{ entry.progress }}%</span><span v-if="entry.error" class="text-red-600"> · {{ entry.error }}</span></p>
          <div v-if="entry.progress > 0 && entry.progress < 100" class="h-[3px] bg-border rounded mt-2 overflow-hidden">
            <div class="h-full bg-accent" :style="{ width: entry.progress + '%' }" />
          </div>
        </div>
        <button type="button" class="text-text-muted hover:text-text text-lg" @click="removeFile(idx)">×</button>
      </li>
    </ul>

    <section class="mt-10">
      <p class="font-mono text-[11px] text-text-muted tracking-wider pb-3 border-b border-border">{{ t('quote.section_project') }}</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label class="block text-[12px] font-medium mb-1.5">{{ t('quote.fields.material') }} <span class="text-accent">*</span></label>
          <div class="flex gap-2 flex-wrap">
            <BasePill v-for="m in materialOpts" :key="m" :selected="form.material === m" @click="form.material = m">{{ m }}</BasePill>
          </div>
          <p v-if="errors.material" class="text-[11px] text-red-600 mt-1">{{ errors.material }}</p>
        </div>
        <div>
          <label class="block text-[12px] font-medium mb-1.5">{{ t('quote.fields.quantity') }} <span class="text-accent">*</span></label>
          <BaseSelect
            v-model="form.quantity"
            :options="[{ value: '', label: '—' }, ...quantityOpts]"
            required
          />
          <p v-if="errors.quantity" class="text-[11px] text-red-600 mt-1">{{ errors.quantity }}</p>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label class="block text-[12px] font-medium mb-1.5">{{ t('quote.fields.milling') }}</label>
          <div class="flex gap-2 flex-wrap">
            <BasePill v-for="opt in millingOpts" :key="opt" :selected="form.milling === opt" @click="form.milling = opt">{{ opt }}</BasePill>
          </div>
        </div>
        <div>
          <label class="block text-[12px] font-medium mb-1.5">{{ t('quote.fields.deadline') }}</label>
          <BaseInput v-model="form.deadline" :placeholder="t('quote.fields.deadline_placeholder')" />
        </div>
      </div>
      <div class="mt-4">
        <label class="block text-[12px] font-medium mb-1.5">{{ t('quote.fields.description') }}</label>
        <BaseTextarea v-model="form.description" :placeholder="t('quote.fields.description_placeholder')" />
      </div>
    </section>

    <section class="mt-10">
      <p class="font-mono text-[11px] text-text-muted tracking-wider pb-3 border-b border-border">{{ t('quote.section_contact') }}</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label class="block text-[12px] font-medium mb-1.5">{{ t('quote.fields.name') }} <span class="text-accent">*</span></label>
          <BaseInput v-model="form.name" autocomplete="name" />
          <p v-if="errors.name" class="text-[11px] text-red-600 mt-1">{{ errors.name }}</p>
        </div>
        <div>
          <label class="block text-[12px] font-medium mb-1.5">{{ t('quote.fields.company') }}</label>
          <BaseInput v-model="form.company" autocomplete="organization" />
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label class="block text-[12px] font-medium mb-1.5">{{ t('quote.fields.email') }} <span class="text-accent">*</span></label>
          <BaseInput v-model="form.email" type="email" autocomplete="email" />
          <p v-if="errors.email" class="text-[11px] text-red-600 mt-1">{{ errors.email }}</p>
        </div>
        <div>
          <label class="block text-[12px] font-medium mb-1.5">{{ t('quote.fields.phone') }}</label>
          <BaseInput v-model="form.phone" type="tel" autocomplete="tel" />
        </div>
      </div>
    </section>

    <div class="mt-8 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4">
      <label class="flex items-start gap-2 text-[12px] text-text-muted max-w-[62%]">
        <input v-model="form.consent" type="checkbox" class="mt-0.5">
        <span>{{ t('common.form.consent') }}</span>
      </label>
      <BaseButton type="submit" variant="accent" :disabled="status === 'uploading' || status === 'submitting'">
        {{ status === 'uploading' ? t('common.form.submitting') :
           status === 'submitting' ? t('common.form.submitting') :
           t('quote.submit') }} →
      </BaseButton>
    </div>
    <p v-if="errors.consent" class="text-[11px] text-red-600 mt-2">{{ errors.consent }}</p>
    <div ref="turnstileEl" class="mt-3" />
    <p v-if="status === 'success'" class="text-[13px] text-accent mt-3">{{ t('common.form.success') }}</p>
    <p v-else-if="status === 'error'" class="text-[13px] text-red-600 mt-3">{{ t('common.form.error_generic') }}</p>
  </form>
</template>
```

- [ ] **Step 6: Create `pages/offerte.vue`**

```vue
<script setup lang="ts">
const { t } = useI18n()
useHead({ title: `${t('quote.title')} · ${t('common.company')}` })
definePageMeta({ alias: ['/en/quote'] })
</script>

<template>
  <div class="py-20 px-6">
    <QuoteForm />
  </div>
</template>
```

- [ ] **Step 7: Verify with the FastAPI backend running locally**

Start the FastAPI dev server (from the backend plan) at `http://localhost:8000`, set `NUXT_PUBLIC_API_BASE=http://localhost:8000` in `.env`, and submit a small STL. Verify the email arrives.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(quote): /offerte page with chunked upload, validation, Turnstile"
```

---

## Task 21: SEO — sitemap, robots, meta defaults, JSON-LD

**Files:**
- Modify: `nuxt.config.ts`, `app.vue`, `layouts/default.vue`
- Create: `composables/useOrgJsonLd.ts`

- [ ] **Step 1: Configure `@nuxt/sitemap` and `@nuxtjs/robots` in `nuxt.config.ts`**

Inside `defineNuxtConfig`:

```ts
site: {
  url: 'https://robuprint.nl',
  name: 'RoBuPRINT',
},
sitemap: {
  sources: ['/api/__sitemap__/urls'],
},
robots: {
  groups: [
    { userAgent: ['*'], allow: ['/'] },
  ],
  sitemap: ['/sitemap.xml'],
},
```

- [ ] **Step 2: Add Open Graph / Twitter defaults in `app.vue`**

```vue
<script setup lang="ts">
const { locale } = useI18n()
useHead({
  htmlAttrs: { lang: locale.value },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'description', content: 'Robotic large-scale 3D printing in HDPE and PP, with hybrid post-milling and factory-fresh recyclate. Build envelope 4 × 4 × 8 m.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'RoBuPRINT' },
    { property: 'og:image', content: 'https://robuprint.nl/og-default.jpg' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

- [ ] **Step 3: Create `composables/useOrgJsonLd.ts`**

```ts
export function useOrgJsonLd() {
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'RoBuPRINT',
          url: 'https://robuprint.nl',
          parentOrganization: {
            '@type': 'Organization',
            name: 'Kuypers Kunststoftechniek',
          },
          areaServed: ['NL', 'BE', 'DE'],
        }),
      },
    ],
  })
}
```

- [ ] **Step 4: Call `useOrgJsonLd()` once at the layout level**

In `layouts/default.vue` add a `<script setup lang="ts">`:

```vue
<script setup lang="ts">
useOrgJsonLd()
</script>
```

(The `<template>` stays as-is.)

- [ ] **Step 5: Build and verify sitemap and robots**

```bash
pnpm build
pnpm preview
```

Visit `http://localhost:3000/sitemap.xml` and `http://localhost:3000/robots.txt`. Confirm both render correctly with all locale routes listed.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(seo): sitemap, robots, OG defaults, Organization JSON-LD"
```

---

## Task 22: Vercel deploy configuration

**Files:**
- Create: `vercel.json`
- Modify: `README.md`

- [ ] **Step 1: Create `vercel.json`**

```json
{
  "framework": "nuxtjs",
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install --frozen-lockfile",
  "outputDirectory": ".vercel/output",
  "regions": ["fra1"]
}
```

- [ ] **Step 2: Update `README.md`**

```md
# RoBuPRINT website

Bilingual (NL/EN) Nuxt 3 marketing site. Forms POST to a separately-hosted FastAPI backend.

## Local dev

```bash
pnpm install
cp .env.example .env
# Fill in NUXT_PUBLIC_API_BASE (e.g. http://localhost:8000 for local backend)
pnpm dev
```

## Tests

```bash
pnpm test
```

## Build / preview

```bash
pnpm build
pnpm preview
```

## Deploy (Vercel)

1. Connect the repo on Vercel.
2. Set environment variables: `NUXT_PUBLIC_API_BASE`, `NUXT_PUBLIC_TURNSTILE_SITE_KEY`, `NUXT_PUBLIC_SITE_URL`, `NUXT_TURNSTILE_SECRET_KEY`.
3. Push to `main` — Vercel auto-deploys.

## DNS (Cloudflare)

- `robuprint.nl` and `www.robuprint.nl` → Vercel (per Vercel docs)
- `api.robuprint.nl` → user's FastAPI server (Cloudflare proxied)
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore(deploy): add vercel.json and README"
```

---

## Task 23: Smoke E2E with Playwright

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/smoke.spec.ts`
- Modify: `package.json`

- [ ] **Step 1: Install Playwright**

```bash
pnpm add -D @playwright/test
pnpm exec playwright install chromium
```

Add to `package.json` scripts: `"test:e2e": "playwright test"`.

- [ ] **Step 2: Create `playwright.config.ts`**

```ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://localhost:3000' },
  webServer: {
    command: 'pnpm preview',
    port: 3000,
    timeout: 120_000,
    reuseExistingServer: true,
  },
})
```

- [ ] **Step 3: Create `tests/e2e/smoke.spec.ts`**

```ts
import { test, expect } from '@playwright/test'

const ROUTES = [
  ['/', 'RoBuPRINT'],
  ['/wat-wij-doen', 'Wat wij doen'],
  ['/materialen', 'Materialen'],
  ['/projecten', 'Projecten'],
  ['/over-ons', 'Over RoBuPRINT'],
  ['/contact', 'Neem contact op'],
  ['/offerte', 'Vraag een offerte aan'],
] as const

for (const [path, expectedText] of ROUTES) {
  test(`NL ${path} renders`, async ({ page }) => {
    await page.goto(path)
    await expect(page.getByText(expectedText, { exact: false }).first()).toBeVisible()
  })
}

test('language switcher routes to /en', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'EN' }).click()
  await expect(page).toHaveURL(/\/en/)
})
```

- [ ] **Step 4: Run E2E**

```bash
pnpm build
pnpm test:e2e
```

Expected: all routes render and the lang switcher works.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "test(e2e): smoke test for all routes and lang switcher"
```

---

## Task 24: Final verification & launch checklist

- [ ] **Step 1: Production build succeeds**

```bash
pnpm build
```

Expected: build completes with no errors.

- [ ] **Step 2: All tests green**

```bash
pnpm test && pnpm test:e2e
```

- [ ] **Step 3: Lighthouse on `/` (preview)**

```bash
pnpm preview
```

Run Lighthouse against `http://localhost:3000/`. Confirm Performance ≥ 90, Accessibility ≥ 95.

- [ ] **Step 4: Manual checklist**

- [ ] All 7 routes render in NL and EN
- [ ] Header CTA visible on all pages
- [ ] Footer newsletter form posts (mock OK if backend not yet wired)
- [ ] Contact form posts to backend, returns success
- [ ] Quote form: 200 MB STL upload completes, submission email arrives
- [ ] No console errors on any page
- [ ] OG image renders when sharing the URL on a Slack/LinkedIn unfurl test
- [ ] `/sitemap.xml` and `/robots.txt` reachable

- [ ] **Step 5: Tag v0.1**

```bash
git tag -a v0.1 -m "Frontend v0.1 — initial bilingual site"
```

---

## Self-review notes

- Spec section 5 (sitemap) → Tasks 11–17, 20 cover all 7 routes plus dynamic project slug
- Spec section 6 (visual direction) → Tasks 2–4 (tokens, fonts, base components)
- Spec section 7.1 (frontend tech) → Tasks 1, 2, 5, 15, 21
- Spec section 7.3 (CORS, Turnstile) → Task 16 (client side); CORS belongs to backend plan
- Spec section 8 (quote upload UX) → Tasks 18, 19, 20
- Spec section 9 (content + i18n) → every page task includes locale files
- Spec section 12 (success criteria) → Task 24 manual checklist
- No reference to Vercel Python functions (correctly removed after architecture revision)
