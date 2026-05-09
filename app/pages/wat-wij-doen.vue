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

const SCHEM = ['envelope', 'robot-arm', 'post-mill', 'layer-stack'] as const
function schemFor(i: number) { return SCHEM[i % SCHEM.length] }
</script>

<template>
  <div class="max-w-300 mx-auto px-6 pt-16 pb-12">
    <section class="max-w-190 mb-12" data-reveal-target>
      <h1 class="text-[40px] md:text-[56px] font-extrabold tracking-tight leading-[1.04]">{{ t('capabilities.title') }}</h1>
      <p class="mt-4 text-text-muted text-[15px] max-w-150">{{ t('capabilities.lead') }}</p>
    </section>

    <div class="space-y-6">
      <BentoGrid v-for="(s, i) in sections" :key="i">
        <BentoTile
          :span="3"
          :variant="i % 2 === 0 ? 'dark' : 'accent'"
          :eyebrow="s.eyebrow"
        >
          <h2 class="text-[24px] md:text-[28px] font-bold tracking-tight leading-tight max-w-[320px]">{{ s.heading }}</h2>
          <p class="text-[13px] mt-2 max-w-[320px]" :class="i % 2 === 0 ? 'text-white/70' : 'text-white/85'">{{ s.body }}</p>
          <template #illustration>
            <SchemIllustration :name="schemFor(i)" class="w-28 h-28" :class="i % 2 === 0 ? 'text-[#7CA1FF]' : 'text-white'" />
          </template>
        </BentoTile>

        <BentoTile
          v-for="(spec, j) in s.specs.slice(0, 3)"
          :key="j"
          :span="1"
          variant="muted"
        >
          <p class="font-mono text-[10px] text-text-muted uppercase tracking-wider">{{ spec.k }}</p>
          <p class="text-[13px] font-medium leading-relaxed">{{ spec.v }}</p>
        </BentoTile>
      </BentoGrid>
    </div>
  </div>
</template>
