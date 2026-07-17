<script setup lang="ts">
import { onMounted } from 'vue'
const { t } = useI18n()
useHead({ title: `${t('quote.title')} · ${t('common.company')}` })
definePageMeta({ alias: ['/en/quote'] })

const { observeAll } = useReveal()
onMounted(() => observeAll())
</script>

<template>
  <div class="max-w-[1200px] mx-auto px-6 pt-20 md:pt-28 pb-24">
    <p class="label-eyebrow mb-4"><span class="inline-block w-1.5 h-1.5 rounded-full bg-accent mr-2 align-middle" />{{ t('quote.eyebrow') }}</p>
    <h1 class="text-[44px] md:text-[68px] font-extrabold tracking-[-0.03em] leading-[1.0]">{{ t('quote.title') }}</h1>
    <p class="mt-5 text-text-muted text-[16px] md:text-[17px] leading-relaxed max-w-[600px]">{{ t('quote.lead') }}</p>

    <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-2 rounded-[var(--radius-xl)] bg-surface border border-border p-6 md:p-8 shadow-[var(--shadow-tile)]" data-reveal-target>
        <QuoteForm />
      </div>

      <aside class="space-y-3">
        <BentoTile :span="2" variant="muted" eyebrow="Wat ontvangen we graag">
          <ul class="text-[13px] text-text-muted space-y-1">
            <li>— STL of STEP-bestand</li>
            <li>— Gewenst materiaal</li>
            <li>— Aantallen + lever-deadline</li>
          </ul>
        </BentoTile>
        <BentoTile :span="2" variant="accent" eyebrow="Reactietijd">
          <p class="text-[14px] text-white">Binnen 2 werkdagen.</p>
        </BentoTile>
      </aside>
    </div>
  </div>
</template>
