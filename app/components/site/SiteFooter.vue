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
        <p class="font-medium text-text mt-6 mb-2 text-[13px]">{{ t('common.footer.newsletter_heading') }}</p>
        <NewsletterForm />
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
        <p class="mt-6 text-[12px]">{{ t('common.footer.kvk') }}<br>{{ t('common.footer.btw') }}<br>{{ t('common.footer.address') }}</p>
      </div>
    </div>
    <div class="border-t border-border">
      <p class="max-w-[1200px] mx-auto px-6 py-4 text-[11px] text-text-muted">© {{ year }} {{ t('common.company') }} — {{ t('common.footer.rights') }}</p>
    </div>
  </footer>
</template>
