<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="bg-[#07080C] border-t border-border text-white/60 mt-24">
    <div class="max-w-[1200px] mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10 text-[13px]">
      <div class="md:col-span-2">
        <NuxtLink :to="localePath('/')" class="inline-flex items-center gap-2 text-white">
          <BrandMark />
        </NuxtLink>
        <p class="mt-3 text-[12px] max-w-[320px]">{{ t('common.parent_company_line') }}</p>
        <p class="mt-6 font-mono text-[10.5px] tracking-[0.14em] uppercase text-white/40">{{ t('common.tagline_short') }}</p>
      </div>

      <div>
        <p class="font-mono font-medium text-white/40 mb-4 text-[10.5px] uppercase tracking-[0.14em]">{{ t('common.nav.what_we_do') }}</p>
        <ul class="space-y-2.5">
          <li><NuxtLink class="hover:text-white transition-colors" :to="localePath('/wat-wij-doen')">{{ t('common.nav.what_we_do') }}</NuxtLink></li>
          <li><NuxtLink class="hover:text-white transition-colors" :to="localePath('/materialen')">{{ t('common.nav.materials') }}</NuxtLink></li>
          <li><NuxtLink class="hover:text-white transition-colors" :to="localePath('/projecten')">{{ t('common.nav.projects') }}</NuxtLink></li>
        </ul>
      </div>

      <div>
        <p class="font-mono font-medium text-white/40 mb-4 text-[10.5px] uppercase tracking-[0.14em]">Info</p>
        <ul class="space-y-2.5">
          <li><NuxtLink class="hover:text-white transition-colors" :to="localePath('/over-ons')">{{ t('common.nav.about') }}</NuxtLink></li>
          <li><NuxtLink class="hover:text-white transition-colors" :to="localePath('/contact')">{{ t('common.nav.contact') }}</NuxtLink></li>
          <li><NuxtLink class="hover:text-white transition-colors" :to="localePath('/offerte')">{{ t('common.nav.quote_cta') }} →</NuxtLink></li>
        </ul>
        <div class="mt-6 rounded-[var(--radius-md)] bg-white/[0.04] border border-white/10 p-3.5 font-mono text-[11px] leading-relaxed text-white/50">
          <p>{{ t('common.footer.kvk') }}</p>
          <p>{{ t('common.footer.btw') }}</p>
          <p class="mt-1.5">{{ t('common.footer.address') }}</p>
          <p class="mt-1.5"><a href="tel:+31135096611" class="text-white/80 hover:text-white transition-colors">{{ t('common.footer.phone') }}</a></p>
        </div>
      </div>
    </div>
    <div class="border-t border-white/10">
      <p class="max-w-[1200px] mx-auto px-6 py-5 font-mono text-[10.5px] tracking-[0.1em] text-white/35">© {{ year }} {{ t('common.company') }} — {{ t('common.footer.rights') }}</p>
    </div>
  </footer>
</template>
