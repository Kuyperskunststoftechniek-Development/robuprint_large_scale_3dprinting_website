<script setup lang="ts">
import { onMounted } from 'vue'

const { t } = useI18n()
const localePath = useLocalePath()
usePageSeo('home')

const { observeAll } = useReveal()
onMounted(() => observeAll())
</script>

<template>
  <div>
    <section
      class="relative overflow-hidden bg-hero-night text-white"
      data-reveal-target
    >
      <div
        class="absolute inset-0 blueprint-grid text-hero-highlight/[0.05] [mask-image:linear-gradient(to_bottom,black,transparent_85%)] pointer-events-none"
        aria-hidden="true"
      />

      <div class="relative z-10 w-full max-w-[1200px] mx-auto px-6 pt-14 md:pt-20 pb-24 md:pb-28 grid lg:grid-cols-[1fr_minmax(0,540px)] gap-10 lg:gap-14 items-center">
        <div class="max-w-[640px]">
          <p class="font-mono font-medium text-[10.5px] tracking-[0.16em] uppercase mb-4 text-white/90">
            <span class="inline-block w-1.5 h-1.5 rounded-full mr-2 align-middle bg-hero-highlight" />{{ t('home.hero.eyebrow') }}
          </p>
          <h1 class="text-[40px] md:text-[60px] font-extrabold tracking-tight leading-[1.02]">
            {{ t('home.hero.title_lead') }}
            <em class="not-italic text-hero-highlight">{{ t('home.hero.title_accent') }}</em>
            {{ t('home.hero.title_tail') }}
          </h1>
          <p class="mt-5 text-[15px] md:text-[16px] max-w-[560px] leading-relaxed text-white/80">{{ t('home.hero.subtitle') }}</p>
          <div class="mt-8 flex flex-wrap items-center gap-3">
            <NuxtLink
              :to="localePath('/offerte')"
              class="inline-flex items-center text-[13px] font-semibold px-5 py-2.5 bg-accent text-bg rounded-[var(--radius-md)] hover:bg-accent-hover shadow-[var(--shadow-btn)] transition-all hover:-translate-y-px"
            >
              {{ t('home.hero.cta') }} →
            </NuxtLink>
            <NuxtLink
              :to="localePath('/projecten')"
              class="inline-flex items-center text-[13px] font-medium px-5 py-2.5 border rounded-[var(--radius-md)] backdrop-blur-sm transition-all text-white border-white/30 hover:bg-white/10 hover:border-white/50"
            >
              {{ t('home.hero.cta_secondary') }}
            </NuxtLink>
            <a
              href="tel:+31135096611"
              class="inline-flex items-center text-[13px] font-medium px-2 py-2.5 underline-offset-2 hover:underline text-white/85"
            >{{ t('home.hero.call') }}</a>
          </div>
        </div>

        <HeroShowcase />
      </div>

      <div class="absolute bottom-0 inset-x-0 z-10 border-t backdrop-blur-sm border-white/15 bg-black/25">
        <div class="max-w-[1200px] mx-auto px-6 py-3.5 flex flex-wrap gap-x-8 gap-y-1.5 font-mono text-[10.5px] tracking-[0.14em] uppercase text-white/75">
          <span>{{ t('home.hero.spec_1') }}</span>
          <span>{{ t('home.hero.spec_2') }}</span>
          <span>{{ t('home.hero.spec_3') }}</span>
        </div>
      </div>
    </section>

    <div class="relative max-w-[1200px] mx-auto px-6 pt-16 md:pt-24 pb-24">
      <ProductGallery />

      <BentoGrid class="mb-10">
        <BentoTile :span="6" variant="accent" :to="localePath('/foodgrade-hdpe-bekleding-assen-rollen')" :eyebrow="t('home.shafts.eyebrow')">
          <h2 class="text-[22px] md:text-[28px] font-bold leading-snug max-w-[520px]">{{ t('home.shafts.title') }}</h2>
          <p class="text-[13px] text-white/85 max-w-[520px]">{{ t('home.shafts.body') }}</p>
          <p class="relative text-[13px] font-semibold text-white mt-1">{{ t('home.shafts.link') }} →</p>
          <template #illustration>
            <SchemIllustration name="shaft" class="w-28 h-28 text-accent" />
          </template>
        </BentoTile>
      </BentoGrid>

      <h2 class="text-[22px] md:text-[28px] font-bold tracking-tight mb-5" data-reveal-target>{{ t('home.also.heading') }}</h2>
      <BentoGrid>
        <BentoTile :span="3" variant="muted" :eyebrow="t('home.tiles.envelope_eyebrow')">
          <p class="text-[64px] md:text-[84px] font-extrabold tracking-[-0.04em] leading-none mt-1 glow-number">4×4×8</p>
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
            <SchemIllustration name="robot-arm" class="w-24 h-24 text-accent" />
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
        <div class="absolute inset-0 blueprint-grid text-hero-highlight/[0.08] pointer-events-none" aria-hidden="true" />
        <SchemIllustration name="robot-arm" class="absolute -right-6 -bottom-8 w-44 h-44 text-accent/20 pointer-events-none" aria-hidden="true" />
        <h2 class="relative text-[20px] md:text-[24px] font-bold leading-snug max-w-[520px]">{{ t('home.cta_band.title') }}</h2>
        <NuxtLink :to="localePath('/offerte')" class="relative inline-flex items-center self-start md:self-auto text-[13px] font-semibold px-5 py-2.5 bg-accent text-bg rounded-[var(--radius-md)] hover:bg-accent-hover transition-all hover:-translate-y-px shadow-[var(--shadow-btn)]">
          {{ t('home.cta_band.button') }} →
        </NuxtLink>
      </section>
    </div>
  </div>
</template>
