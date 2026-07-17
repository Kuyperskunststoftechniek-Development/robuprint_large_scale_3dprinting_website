<script setup lang="ts">
import { onMounted } from 'vue'
const { t, tm } = useI18n()
useHead({ title: `${t('capabilities.title')} · ${t('common.company')}` })

definePageMeta({
  alias: ['/en/capabilities'],
})

const { observeAll } = useReveal()
onMounted(() => observeAll())

interface Spec { k: string; v: string }
interface Section { eyebrow: string; heading: string; body: string; specs: Spec[] }
const sections = computed(() => tm('capabilities.sections') as Section[])

const SCHEM = ['envelope', 'robot-arm', 'shaft', 'layer-stack'] as const
function schemFor(i: number) { return SCHEM[i % SCHEM.length] }

// Hoofdtegel vult de ruimte die overblijft naast de spec-tegels (rij = 6 kolommen)
function mainSpan(s: Section) {
  const specs = Math.min(s.specs.length, 3)
  if (specs === 0) return 6
  return Math.min(6 - specs, 4) as 3 | 4
}
</script>

<template>
  <div class="max-w-[1200px] mx-auto px-6 pt-20 md:pt-28 pb-24">
    <section class="max-w-[760px] mb-14 md:mb-20" data-reveal-target>
      <p class="label-eyebrow mb-4"><span class="inline-block w-1.5 h-1.5 rounded-full bg-accent mr-2 align-middle" />{{ t('capabilities.eyebrow') }}</p>
      <h1 class="text-[44px] md:text-[68px] font-extrabold tracking-[-0.03em] leading-[1.0]">{{ t('capabilities.title') }}</h1>
      <p class="mt-5 text-text-muted text-[16px] md:text-[17px] leading-relaxed max-w-[600px]">{{ t('capabilities.lead') }}</p>
    </section>

    <div class="space-y-6">
      <BentoGrid v-for="(s, i) in sections" :key="i">
        <BentoTile
          :span="mainSpan(s)"
          :variant="i % 2 === 0 ? 'muted' : 'accent'"
          :eyebrow="s.eyebrow"
        >
          <h2 class="text-[24px] md:text-[28px] font-bold tracking-tight leading-tight max-w-[320px]">{{ s.heading }}</h2>
          <p class="text-[13px] mt-2 max-w-[320px]" :class="i % 2 === 0 ? 'text-text-muted' : 'text-white/85'">{{ s.body }}</p>
          <template #illustration>
            <SchemIllustration :name="schemFor(i)" class="w-28 h-28 text-accent" />
          </template>
        </BentoTile>

        <BentoTile
          v-for="(spec, j) in s.specs.slice(0, 3)"
          :key="j"
          :span="1"
          variant="muted"
        >
          <p class="font-mono font-medium text-[10.5px] text-text-muted uppercase tracking-[0.14em]">{{ spec.k }}</p>
          <p class="text-[13px] font-medium leading-relaxed">{{ spec.v }}</p>
        </BentoTile>
      </BentoGrid>
    </div>
  </div>
</template>
