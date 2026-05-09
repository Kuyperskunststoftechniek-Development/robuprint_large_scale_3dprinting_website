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
