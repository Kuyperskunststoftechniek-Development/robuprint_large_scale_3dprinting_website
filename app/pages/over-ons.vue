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
