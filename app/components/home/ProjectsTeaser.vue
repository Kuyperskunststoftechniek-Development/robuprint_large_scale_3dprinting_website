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
