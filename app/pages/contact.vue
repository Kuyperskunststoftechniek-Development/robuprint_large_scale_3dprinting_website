<script setup lang="ts">
import { onMounted } from 'vue'
const { t } = useI18n()
useHead({ title: `${t('contact.title')} · ${t('common.company')}` })
definePageMeta({ alias: ['/en/contact'] })

const { observeAll } = useReveal()
onMounted(() => observeAll())
</script>

<template>
  <div class="max-w-[1200px] mx-auto px-6 py-20">
    <h1 class="text-[40px] md:text-[48px] font-extrabold tracking-tight">{{ t('contact.title') }}</h1>
    <p class="mt-4 text-text-muted text-[15px] max-w-[600px]">{{ t('contact.lead') }}</p>

    <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-2">
        <ContactForm />
      </div>

      <aside class="space-y-3">
        <BentoTile :span="2" variant="muted" eyebrow="Adres">
          <p class="text-[14px] leading-relaxed">Diamantweg 48<br>5527 LC Hapert</p>
        </BentoTile>
        <BentoTile :span="2" variant="muted" eyebrow="Bedrijfsgegevens">
          <p class="font-mono text-[11px] text-text-muted">KvK 18036761</p>
          <p class="font-mono text-[11px] text-text-muted">BTW NL801225401B01</p>
        </BentoTile>
        <BentoTile :span="2" variant="dark" eyebrow="E-mail">
          <a href="mailto:info@robuprint.nl" class="text-[14px] text-white underline-offset-2 hover:underline">info@robuprint.nl</a>
        </BentoTile>
      </aside>
    </div>
  </div>
</template>
