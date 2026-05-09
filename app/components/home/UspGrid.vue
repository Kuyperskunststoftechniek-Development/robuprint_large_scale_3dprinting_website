<script setup lang="ts">
const { tm, t } = useI18n()
const usps = computed(() => tm('home.usps') as Array<{ title: string; body: string }>)
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
