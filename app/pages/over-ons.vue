<script setup lang="ts">
import { onMounted } from 'vue'
const { t, tm } = useI18n()
useHead({ title: `${t('about.title')} · ${t('common.company')}` })

definePageMeta({
  alias: ['/en/about'],
})

const { observeAll } = useReveal()
onMounted(() => observeAll())

interface Section { heading: string; body: string }
const sections = computed(() => tm('about.sections') as Section[])
</script>

<template>
  <div class="max-w-[1200px] mx-auto px-6 pt-16 pb-12">

    <section class="max-w-[760px] mb-12" data-reveal-target>
      <h1 class="text-[40px] md:text-[56px] font-extrabold tracking-tight leading-[1.04]">{{ t('about.title') }}</h1>
      <p class="mt-4 text-text-muted text-[15px] max-w-[620px]">{{ t('about.lead') }}</p>
    </section>

    <BentoGrid>
      <BentoTile
        v-for="(s, i) in sections"
        :key="i"
        :span="2"
        :variant="i === 0 ? 'muted' : 'default'"
        :eyebrow="s.heading"
      >
        <p class="text-[14px] leading-relaxed text-text-muted">{{ s.body }}</p>
      </BentoTile>

      <BentoTile :span="6" variant="muted" eyebrow="Bedrijfsgegevens">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mt-2 text-[13px]">
          <div>
            <p class="font-mono font-medium text-[10.5px] uppercase tracking-[0.14em] text-text-muted">Vestiging</p>
            <p class="mt-1">Diamantweg 48</p>
            <p>5527 LC Hapert</p>
            <p class="mt-1"><a href="tel:+31135096611" class="hover:underline underline-offset-2">013 509 66 11</a></p>
          </div>
          <div>
            <p class="font-mono font-medium text-[10.5px] uppercase tracking-[0.14em] text-text-muted">Moederbedrijf</p>
            <p class="mt-1">Kuypers Kunststoftechniek BV</p>
          </div>
          <div>
            <p class="font-mono font-medium text-[10.5px] uppercase tracking-[0.14em] text-text-muted">KvK</p>
            <p class="mt-1">18036761</p>
          </div>
          <div>
            <p class="font-mono font-medium text-[10.5px] uppercase tracking-[0.14em] text-text-muted">BTW</p>
            <p class="mt-1">NL801225401B01</p>
          </div>
        </div>
      </BentoTile>
    </BentoGrid>
  </div>
</template>
