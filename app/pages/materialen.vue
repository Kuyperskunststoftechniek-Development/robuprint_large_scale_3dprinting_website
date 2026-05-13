<script setup lang="ts">
import { onMounted } from 'vue'
const { t, tm } = useI18n()
useHead({ title: `${t('materials.title')} · ${t('common.company')}` })

definePageMeta({
  alias: ['/en/materials'],
})

const { observeAll } = useReveal()
onMounted(() => observeAll())

interface MaterialEntry { name: string; tagline: string; body: string; props: string[] }
interface SpecPair { k: string; v: string }

const materials = computed(() => tm('materials.items') as MaterialEntry[])
const recycleSpecs = computed(() => tm('materials.recycle_specs') as SpecPair[])
</script>

<template>
  <div class="max-w-[1200px] mx-auto px-6 pt-16 pb-12">
    <section class="max-w-[760px] mb-12" data-reveal-target>
      <h1 class="text-[40px] md:text-[56px] font-extrabold tracking-tight leading-[1.04]">{{ t('materials.title') }}</h1>
      <p class="mt-4 text-text-muted text-[15px] max-w-[620px]">{{ t('materials.lead') }}</p>
    </section>

    <BentoGrid>
      <BentoTile
        v-for="(m, i) in materials"
        :key="i"
        :span="3"
        :eyebrow="m.tagline"
      >
        <h2 class="text-[20px] font-bold leading-tight mb-2">{{ m.name }}</h2>
        <p class="text-[12px] text-text-muted leading-[1.55] mb-3">{{ m.body }}</p>
        <ul class="text-[12px] text-text-muted mt-3 space-y-1">
          <li v-for="(p, k) in m.props" :key="k">— {{ p }}</li>
        </ul>
      </BentoTile>

      <BentoTile :span="6" variant="accent" :eyebrow="t('materials.recycle_heading')">
        <h2 class="text-[22px] md:text-[26px] font-bold leading-tight max-w-[640px]">{{ t('materials.recycle_body') }}</h2>
        <template #illustration>
          <SchemIllustration name="recyclate-flow" class="w-40 h-20 text-white" />
        </template>
      </BentoTile>

      <BentoTile
        v-for="(s, i) in recycleSpecs"
        :key="i"
        :span="2"
      >
        <p class="font-medium text-[11px] uppercase tracking-[0.14em] text-text-muted">{{ s.k }}</p>
        <p class="text-[15px] font-semibold mt-1">{{ s.v }}</p>
      </BentoTile>
    </BentoGrid>
  </div>
</template>
