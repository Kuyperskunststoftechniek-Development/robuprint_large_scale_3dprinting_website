<script setup lang="ts">
const { t } = useI18n()
useHead({ title: `${t('contact.title')} · ${t('common.company')}` })
definePageMeta({ alias: ['/en/contact'] })
</script>

<template>
  <div class="max-w-[860px] mx-auto px-6 py-20">
    <h1 class="text-[42px] font-semibold tracking-tight">{{ t('contact.title') }}</h1>
    <p class="mt-4 text-text-muted text-[15px] max-w-[600px]">{{ t('contact.lead') }}</p>
    <div class="mt-12">
      <ContactForm />
    </div>
  </div>
</template>
