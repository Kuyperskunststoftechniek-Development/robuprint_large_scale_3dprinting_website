<script setup lang="ts">
const { t } = useI18n()
useHead({ title: `${t('common.company')} — ${t('common.tagline_short')}` })
</script>

<template>
  <div>
    <HomeHero />
    <UspGrid />
    <ProjectsTeaser />
  </div>
</template>
