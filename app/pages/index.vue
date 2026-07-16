<script setup lang="ts">
import { onMounted } from 'vue'
import type { HeroSubject, HeroTheme } from '~/utils/heroScene/types'

const { t } = useI18n()
const localePath = useLocalePath()
useHead({ title: `${t('common.company')} — ${t('common.tagline_short')}` })

const { observeAll } = useReveal()
onMounted(() => observeAll())

// Definitieve keuze (15-07-2026): golfvaas op donker thema.
const heroSubject: HeroSubject = 'vase'
const heroTheme: HeroTheme = 'dark'
const dark = heroTheme === 'dark'

// Afspeelsnelheid van de print-animatie. Lager = langzamer.
//   1.0 = standaard (±28 s print)   0.7 = rustig (±40 s)   0.5 = heel rustig (±56 s)   1.5 = sneller
// Pas alleen dit getal aan om het tempo te wijzigen.
const heroSpeed = 0.7
</script>

<template>
  <div>
    <section
      class="relative overflow-hidden min-h-[calc(100svh-65px)] flex items-center"
      :class="dark ? 'bg-hero-night text-white' : 'bg-bg text-text'"
      data-reveal-target
    >
      <HeroScene :subject="heroSubject" :theme="heroTheme" :speed="heroSpeed" />

      <div
        class="absolute inset-0 pointer-events-none"
        :class="dark
          ? 'bg-gradient-to-r from-black/75 via-black/40 to-transparent'
          : 'bg-gradient-to-r from-bg/95 via-bg/55 to-transparent'"
      />
      <div
        v-if="dark"
        class="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/50 via-transparent to-transparent"
      />

      <div class="relative z-10 w-full max-w-[1200px] mx-auto px-6">
        <div class="max-w-[780px] py-16 pb-28 md:pb-32">
          <p
            class="font-mono font-medium text-[10.5px] tracking-[0.16em] uppercase mb-4"
            :class="dark ? 'text-white/90' : 'text-text-muted'"
          >
            <span
              class="inline-block w-1.5 h-1.5 rounded-full mr-2 align-middle"
              :class="dark ? 'bg-hero-highlight' : 'bg-accent'"
            />{{ t('home.hero.eyebrow') }}
          </p>
          <h1 class="text-[40px] md:text-[64px] font-extrabold tracking-tight leading-[1.02]">
            {{ t('home.hero.title_lead') }}
            <em class="not-italic" :class="dark ? 'text-hero-highlight' : 'text-accent'">{{ t('home.hero.title_accent') }}</em>
            {{ t('home.hero.title_tail') }}
          </h1>
          <p
            class="mt-5 text-[15px] md:text-[16px] max-w-[560px] leading-relaxed"
            :class="dark ? 'text-white/80' : 'text-text-muted'"
          >{{ t('home.hero.subtitle') }}</p>
          <div class="mt-8 flex flex-wrap items-center gap-3">
            <NuxtLink
              :to="localePath('/offerte')"
              class="inline-flex items-center text-[13px] font-medium px-5 py-2.5 bg-accent text-white rounded-[var(--radius-md)] hover:bg-accent-hover shadow-[var(--shadow-btn)] transition-all hover:-translate-y-px"
            >
              {{ t('home.hero.cta') }} →
            </NuxtLink>
            <NuxtLink
              :to="localePath('/projecten')"
              class="inline-flex items-center text-[13px] font-medium px-5 py-2.5 border rounded-[var(--radius-md)] backdrop-blur-sm transition-all"
              :class="dark
                ? 'text-white border-white/30 hover:bg-white/10 hover:border-white/50'
                : 'text-text border-border hover:bg-black/5 hover:border-text/30'"
            >
              {{ t('home.hero.cta_secondary') }}
            </NuxtLink>
          </div>
        </div>
      </div>

      <div
        class="absolute bottom-0 inset-x-0 z-10 border-t backdrop-blur-sm"
        :class="dark ? 'border-white/15 bg-black/25' : 'border-border bg-white/40'"
      >
        <div
          class="max-w-[1200px] mx-auto px-6 py-3.5 flex flex-wrap gap-x-8 gap-y-1.5 font-mono text-[10.5px] tracking-[0.14em] uppercase"
          :class="dark ? 'text-white/75' : 'text-text-muted'"
        >
          <span>{{ t('home.hero.spec_1') }}</span>
          <span>{{ t('home.hero.spec_2') }}</span>
          <span>{{ t('home.hero.spec_3') }}</span>
        </div>
      </div>
    </section>

    <div class="max-w-[1200px] mx-auto px-6 pt-12 md:pt-16 pb-12">
      <BentoGrid>
        <BentoTile :span="3" variant="muted" :eyebrow="t('home.tiles.envelope_eyebrow')">
          <p class="text-[48px] md:text-[56px] font-extrabold tracking-[-0.03em] leading-none mt-1">4×4×8</p>
          <p class="font-mono text-[10.5px] tracking-[0.14em] text-text-muted">{{ t('home.tiles.envelope_caption') }}</p>
          <p class="text-[13px] text-text-muted mt-2 max-w-[280px]">{{ t('home.tiles.envelope_body') }}</p>
          <template #illustration>
            <SchemIllustration name="envelope" class="w-44 h-44 text-accent" />
          </template>
        </BentoTile>

        <BentoTile :span="3" variant="accent" :eyebrow="t('home.tiles.process_eyebrow')">
          <h2 class="text-[20px] md:text-[22px] font-bold leading-snug max-w-[320px]">{{ t('home.tiles.process_title') }}</h2>
          <p class="text-[13px] text-white/80 mt-1 max-w-[300px]">{{ t('home.tiles.process_body') }}</p>
          <template #illustration>
            <SchemIllustration name="robot-arm" class="w-24 h-24 text-white" />
          </template>
        </BentoTile>

        <BentoTile :span="2" :eyebrow="t('home.tiles.materials_eyebrow')">
          <h3 class="text-[18px] font-bold">{{ t('home.tiles.materials_title') }}</h3>
          <p class="text-[13px] text-text-muted">{{ t('home.tiles.materials_body') }}</p>
        </BentoTile>

        <BentoTile :span="2" :eyebrow="t('home.tiles.recyclate_eyebrow')">
          <h3 class="text-[18px] font-bold">{{ t('home.tiles.recyclate_title') }}</h3>
          <p class="text-[13px] text-text-muted">{{ t('home.tiles.recyclate_body') }}</p>
        </BentoTile>

        <BentoTile :span="2" variant="muted" :eyebrow="t('home.tiles.layers_eyebrow')">
          <h3 class="text-[18px] font-bold">{{ t('home.tiles.layers_title') }}</h3>
          <p class="text-[13px] text-text-muted">{{ t('home.tiles.layers_body') }}</p>
          <template #illustration>
            <SchemIllustration name="layer-stack" class="w-32 h-32 text-accent" />
          </template>
        </BentoTile>

        <BentoTile :span="6" :to="localePath('/projecten')" :eyebrow="t('home.projects.eyebrow')">
          <h2 class="text-[24px] font-bold tracking-tight">{{ t('home.projects.heading') }}</h2>
          <p class="text-[13px] text-text-muted max-w-[420px]">{{ t('home.projects.body') }}</p>
        </BentoTile>
      </BentoGrid>

      <section class="relative overflow-hidden mt-6 rounded-[var(--radius-xl)] accent-panel text-white p-7 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4" data-reveal-target>
        <div class="absolute inset-0 blueprint-grid text-white/[0.07] pointer-events-none" aria-hidden="true" />
        <SchemIllustration name="robot-arm" class="absolute -right-6 -bottom-8 w-44 h-44 text-white/15 pointer-events-none" aria-hidden="true" />
        <h2 class="relative text-[20px] md:text-[24px] font-bold leading-snug max-w-[520px]">{{ t('home.cta_band.title') }}</h2>
        <NuxtLink :to="localePath('/offerte')" class="relative inline-flex items-center self-start md:self-auto text-[13px] font-medium px-5 py-2.5 bg-white text-accent rounded-[var(--radius-md)] hover:bg-white/90 transition-all hover:-translate-y-px shadow-[0_2px_10px_rgba(0,0,0,0.18)]">
          {{ t('home.cta_band.button') }} →
        </NuxtLink>
      </section>
    </div>
  </div>
</template>
