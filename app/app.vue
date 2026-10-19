<script setup lang="ts">
const { locale, t } = useI18n()
useHead({
  htmlAttrs: { lang: locale.value },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'description', content: t('seo.fallback_description') },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'RoBuPRINT' },
    { property: 'og:image', content: 'https://robuprint.com/og-default.jpg' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    
    { name: 'twitter:card', content: 'summary_large_image' },
  ],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
