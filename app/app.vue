<script setup lang="ts">
const { locale } = useI18n()
useHead({
  htmlAttrs: { lang: locale.value },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'description', content: 'Robotic large-scale 3D printing in HDPE and PP, with hybrid post-milling and factory-fresh recyclate. Build envelope 4 x 4 x 8 m.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'RoBuPRINT' },
    { property: 'og:image', content: 'https://robuprint.com/og-default.jpg' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
