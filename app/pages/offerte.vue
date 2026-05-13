<script setup lang="ts">
import { onMounted } from 'vue'
const { t } = useI18n()
useHead({ title: `${t('quote.title')} · ${t('common.company')}` })
definePageMeta({ alias: ['/en/quote'] })

const { observeAll } = useReveal()
onMounted(() => observeAll())
</script>

<template>
  <div class="max-w-[1200px] mx-auto px-6 py-20">
    <h1 class="text-[40px] md:text-[48px] font-extrabold tracking-tight">{{ t('quote.title') }}</h1>
    <p class="mt-4 text-text-muted text-[15px] max-w-[600px]">{{ t('quote.lead') }}</p>

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
