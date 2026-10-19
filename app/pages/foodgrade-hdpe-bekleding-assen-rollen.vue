<script setup lang="ts">
import { onMounted } from 'vue'
const { t, tm, locale } = useI18n()
const localePath = useLocalePath()

// NL: /foodgrade-hdpe-bekleding-assen-rollen, EN: /en/food-grade-hdpe-coating-shafts-rollers
// (EN-pad via i18n.pages in nuxt.config.ts)
usePageSeo('foodgrade')

const { observeAll } = useReveal()
onMounted(() => observeAll())

interface KV { k: string; v: string }
interface QA { q: string; a: string }

const facts = computed(() => tm('foodgrade.hero.facts') as string[])
const problems = computed(() => tm('foodgrade.problem.items') as string[])
const why = computed(() => tm('foodgrade.why.items') as KV[])
const uses = computed(() => tm('foodgrade.uses.items') as KV[])
const rows = computed(() => tm('foodgrade.capacity.rows') as KV[])
const steps = computed(() => tm('foodgrade.steps.items') as KV[])
const faq = computed(() => tm('foodgrade.faq.items') as QA[])

const SITE = 'https://robuprint.com'
const pagePath = computed(() => localePath('/foodgrade-hdpe-bekleding-assen-rollen'))

// Service, FAQPage en BreadcrumbList. Geen review- of ratingmarkup.
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Service',
            name: t('foodgrade.jsonld.service_name'),
            serviceType: t('foodgrade.jsonld.service_type'),
            description: t('seo.foodgrade.description'),
            inLanguage: locale.value === 'nl' ? 'nl-NL' : 'en-GB',
            url: `${SITE}${pagePath.value}`,
            provider: { '@type': 'Organization', name: 'RoBuPRINT', url: SITE },
            areaServed: ['NL', 'BE', 'DE'],
          },
          {
            '@type': 'FAQPage',
            mainEntity: faq.value.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'RoBuPRINT', item: `${SITE}${localePath('/')}` },
              { '@type': 'ListItem', position: 2, name: t('foodgrade.breadcrumb'), item: `${SITE}${pagePath.value}` },
            ],
          },
        ],
      }),
    },
  ],
})

const btnPrimary = 'inline-flex items-center text-[13px] font-semibold px-5 py-2.5 bg-accent text-bg rounded-[var(--radius-md)] hover:bg-accent-hover shadow-[var(--shadow-btn)] transition-all hover:-translate-y-px'
const btnSecondary = 'inline-flex items-center text-[13px] font-medium px-5 py-2.5 border border-border rounded-[var(--radius-md)] hover:bg-white/5 hover:border-border-strong transition-all'
</script>

<template>
  <div class="max-w-[1200px] mx-auto px-6 pt-16 md:pt-24 pb-24">
    <!-- Hero -->
    <section class="grid grid-cols-1 md:grid-cols-[1.15fr_1fr] gap-10 items-center mb-16 md:mb-24" data-reveal-target>
      <div>
        <p class="label-eyebrow mb-4"><span class="inline-block w-1.5 h-1.5 rounded-full bg-accent mr-2 align-middle" />{{ t('foodgrade.hero.eyebrow') }}</p>
        <h1 class="text-[36px] md:text-[56px] font-extrabold tracking-[-0.03em] leading-[1.02]">{{ t('foodgrade.hero.title') }}</h1>
        <p class="mt-5 text-text-muted text-[16px] md:text-[17px] leading-relaxed max-w-[560px]">{{ t('foodgrade.hero.subtitle') }}</p>
        <div class="mt-8 flex flex-wrap items-center gap-3">
          <NuxtLink :to="localePath('/offerte') + '?type=as-rol'" :class="btnPrimary">{{ t('foodgrade.hero.cta') }} →</NuxtLink>
          <a href="tel:+31135096611" :class="btnSecondary">{{ t('foodgrade.hero.call') }}</a>
        </div>
        <ul class="mt-8 flex flex-wrap gap-x-6 gap-y-1.5 font-mono text-[10.5px] tracking-[0.14em] uppercase text-text-muted">
          <li v-for="(f, i) in facts" :key="i">{{ f }}</li>
        </ul>
      </div>
      <NuxtImg
        src="/content/food-rollers/roller-1.png"
        :alt="t('foodgrade.hero.image_alt')"
        class="w-full aspect-[4/3] object-cover rounded-[var(--radius-xl)] ring-1 ring-white/10"
        width="1024"
        height="768"
        sizes="100vw md:520px"
        quality="75"
        loading="eager"
      />
    </section>

    <!-- Probleem -->
    <section class="mb-16 md:mb-24 max-w-[820px]" data-reveal-target>
      <h2 class="text-[28px] md:text-[36px] font-extrabold tracking-tight leading-tight">{{ t('foodgrade.problem.heading') }}</h2>
      <ul class="mt-5 space-y-3 text-[15px] text-text-muted leading-relaxed">
        <li v-for="(p, i) in problems" :key="i">— {{ p }}</li>
      </ul>
    </section>

    <!-- Oplossing -->
    <section class="mb-16 md:mb-24 max-w-[820px]" data-reveal-target>
      <h2 class="text-[28px] md:text-[36px] font-extrabold tracking-tight leading-tight">{{ t('foodgrade.solution.heading') }}</h2>
      <p class="mt-5 text-[15px] md:text-[16px] text-text-muted leading-relaxed">{{ t('foodgrade.solution.body') }}</p>
    </section>

    <!-- Waarom -->
    <section class="mb-16 md:mb-24">
      <h2 class="text-[28px] md:text-[36px] font-extrabold tracking-tight leading-tight mb-8" data-reveal-target>{{ t('foodgrade.why.heading') }}</h2>
      <BentoGrid>
        <BentoTile v-for="(w, i) in why" :key="i" :span="2" :variant="i === 0 ? 'accent' : 'muted'" :eyebrow="String(i + 1).padStart(2, '0')">
          <h3 class="text-[17px] font-bold leading-snug">{{ w.k }}</h3>
          <p class="text-[13px] leading-relaxed" :class="i === 0 ? 'text-white/85' : 'text-text-muted'">{{ w.v }}</p>
        </BentoTile>
      </BentoGrid>
    </section>

    <!-- Toepassingen -->
    <section class="mb-16 md:mb-24">
      <h2 class="text-[28px] md:text-[36px] font-extrabold tracking-tight leading-tight mb-8" data-reveal-target>{{ t('foodgrade.uses.heading') }}</h2>
      <BentoGrid>
        <BentoTile v-for="(u, i) in uses" :key="i" :span="2">
          <h3 class="text-[17px] font-bold">{{ u.k }}</h3>
          <p class="text-[13px] text-text-muted">{{ u.v }}</p>
        </BentoTile>
      </BentoGrid>
      <p class="mt-5 text-[14px] text-text-muted max-w-[760px] leading-relaxed">{{ t('foodgrade.uses.note') }}</p>
    </section>

    <!-- Capaciteit en maten -->
    <section class="mb-16 md:mb-24 max-w-[820px]" data-reveal-target>
      <h2 class="text-[28px] md:text-[36px] font-extrabold tracking-tight leading-tight mb-6">{{ t('foodgrade.capacity.heading') }}</h2>
      <dl class="rounded-[var(--radius-xl)] border border-border bg-surface divide-y divide-border">
        <div v-for="(r, i) in rows" :key="i" class="grid grid-cols-[150px_1fr] md:grid-cols-[220px_1fr] gap-4 px-5 py-3.5 text-[14px]">
          <dt class="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-text-muted pt-0.5">{{ r.k }}</dt>
          <dd class="font-medium">{{ r.v }}</dd>
        </div>
      </dl>
      <p class="mt-4 text-[14px] text-text-muted">{{ t('foodgrade.capacity.note') }}</p>
    </section>

    <!-- Stappen -->
    <section class="mb-16 md:mb-24">
      <h2 class="text-[28px] md:text-[36px] font-extrabold tracking-tight leading-tight mb-8" data-reveal-target>{{ t('foodgrade.steps.heading') }}</h2>
      <ol class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <li v-for="(s, i) in steps" :key="i" class="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <p class="font-mono text-[10.5px] tracking-[0.14em] text-accent">{{ String(i + 1).padStart(2, '0') }}</p>
          <h3 class="mt-1 text-[16px] font-bold">{{ s.k }}</h3>
          <p class="mt-1 text-[13px] text-text-muted leading-relaxed">{{ s.v }}</p>
        </li>
      </ol>
    </section>

    <!-- Voorbeeld -->
    <section class="mb-16 md:mb-24" data-reveal-target>
      <h2 class="text-[28px] md:text-[36px] font-extrabold tracking-tight leading-tight">{{ t('foodgrade.example.heading') }}</h2>
      <p class="mt-4 text-[15px] text-text-muted max-w-[760px] leading-relaxed">{{ t('foodgrade.example.body') }}</p>
      <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NuxtImg
          src="/content/food-rollers/roller-2.png"
          :alt="t('foodgrade.example.alt_1')"
          class="w-full aspect-[4/3] object-cover rounded-[var(--radius-md)] ring-1 ring-white/10"
          width="800"
          height="600"
          sizes="100vw sm:580px"
          quality="75"
          loading="lazy"
        />
        <NuxtImg
          src="/content/food-rollers/roller-3.png"
          :alt="t('foodgrade.example.alt_2')"
          class="w-full aspect-[4/3] object-cover rounded-[var(--radius-md)] ring-1 ring-white/10"
          width="800"
          height="600"
          sizes="100vw sm:580px"
          quality="75"
          loading="lazy"
        />
      </div>
      <NuxtLink :to="localePath('/projecten') + '#food-rollers'" class="inline-flex mt-5 text-[13px] font-semibold text-accent hover:underline underline-offset-2">{{ t('foodgrade.example.link') }} →</NuxtLink>
    </section>

    <!-- FAQ -->
    <section class="mb-16 md:mb-24 max-w-[820px]">
      <h2 class="text-[28px] md:text-[36px] font-extrabold tracking-tight leading-tight mb-6" data-reveal-target>{{ t('foodgrade.faq.heading') }}</h2>
      <div class="rounded-[var(--radius-xl)] border border-border bg-surface divide-y divide-border">
        <details v-for="(f, i) in faq" :key="i" class="group px-5 py-4">
          <summary class="cursor-pointer list-none flex items-center justify-between gap-4 text-[15px] font-semibold">
            {{ f.q }}
            <span class="text-accent transition-transform group-open:rotate-45" aria-hidden="true">+</span>
          </summary>
          <p class="mt-3 text-[14px] text-text-muted leading-relaxed">{{ f.a }}</p>
        </details>
      </div>
    </section>

    <!-- Afsluiter -->
    <section class="relative overflow-hidden rounded-[var(--radius-xl)] accent-panel text-white p-7 md:p-10" data-reveal-target>
      <div class="absolute inset-0 blueprint-grid text-hero-highlight/[0.08] pointer-events-none" aria-hidden="true" />
      <h2 class="relative text-[24px] md:text-[30px] font-bold leading-snug">{{ t('foodgrade.closing.heading') }}</h2>
      <p class="relative mt-2 text-[15px] text-white/85 max-w-[560px]">{{ t('foodgrade.closing.body') }}</p>
      <div class="relative mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
        <NuxtLink :to="localePath('/offerte') + '?type=as-rol'" :class="btnPrimary">{{ t('foodgrade.closing.cta') }} →</NuxtLink>
        <p class="text-[14px] text-white/85">{{ t('foodgrade.closing.address') }}</p>
      </div>
    </section>
  </div>
</template>
