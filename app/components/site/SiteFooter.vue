<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-border bg-bg mt-24">
    <div class="max-w-[1200px] mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-[13px] text-text-muted">
      <div class="md:col-span-2">
        <p class="font-bold text-text text-[15px] mb-2">{{ t('common.company') }}</p>
        <p class="text-[12px]">{{ t('common.parent_company_line') }}</p>
      </div>

      <div>
        <p class="font-medium text-text mb-3 text-[12px] uppercase tracking-wider">{{ t('common.nav.what_we_do') }}</p>
        <ul class="space-y-2">
          <li><NuxtLink :to="localePath('/wat-wij-doen')">{{ t('common.nav.what_we_do') }}</NuxtLink></li>
          <li><NuxtLink :to="localePath('/materialen')">{{ t('common.nav.materials') }}</NuxtLink></li>
          <li><NuxtLink :to="localePath('/projecten')">{{ t('common.nav.projects') }}</NuxtLink></li>
        </ul>
      </div>

      <div>
        <p class="font-medium text-text mb-3 text-[12px] uppercase tracking-wider">Info</p>
        <ul class="space-y-2">
          <li><NuxtLink :to="localePath('/over-ons')">{{ t('common.nav.about') }}</NuxtLink></li>
          <li><NuxtLink :to="localePath('/contact')">{{ t('common.nav.contact') }}</NuxtLink></li>
          <li><NuxtLink :to="localePath('/offerte')">{{ t('common.nav.quote_cta') }}</NuxtLink></li>
        </ul>
        <div class="mt-6 rounded-[var(--radius-md)] bg-surface-muted text-text p-3 text-[12px] leading-relaxed border border-border">
          <p>{{ t('common.footer.kvk') }}</p>
          <p>{{ t('common.footer.btw') }}</p>
          <p class="text-text-muted mt-1">{{ t('common.footer.address') }}</p>
          <p class="mt-1"><a href="tel:+31135096611" class="text-accent hover:underline">{{ t('common.footer.phone') }}</a></p>
        </div>
      </div>
    </div>
    <div class="border-t border-border">
      <p class="max-w-[1200px] mx-auto px-6 py-4 text-[11px] text-text-muted">© {{ year }} {{ t('common.company') }} — {{ t('common.footer.rights') }}</p>
    </div>
  </footer>
</template>
