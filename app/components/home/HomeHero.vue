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
