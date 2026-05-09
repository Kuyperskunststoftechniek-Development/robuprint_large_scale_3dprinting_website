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
