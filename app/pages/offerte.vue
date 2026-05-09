<script setup lang="ts">
const { t } = useI18n()
useHead({ title: `${t('quote.title')} · ${t('common.company')}` })
definePageMeta({ alias: ['/en/quote'] })
</script>

<template>
  <div class="py-20 px-6">
    <QuoteForm />
  </div>
</template>
