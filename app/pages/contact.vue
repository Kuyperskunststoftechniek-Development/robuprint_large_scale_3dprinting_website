<script setup lang="ts">
import { onMounted } from 'vue'
const { t } = useI18n()
useHead({ title: `${t('contact.title')} · ${t('common.company')}` })
definePageMeta({ alias: ['/en/contact'] })

const { observeAll } = useReveal()
onMounted(() => observeAll())
</script>

<template>
  <div class="max-w-[1200px] mx-auto px-6 pt-20 md:pt-28 pb-24">
    <p class="label-eyebrow mb-4"><span class="inline-block w-1.5 h-1.5 rounded-full bg-accent mr-2 align-middle" />{{ t('contact.eyebrow') }}</p>
    <h1 class="text-[44px] md:text-[68px] font-extrabold tracking-[-0.03em] leading-[1.0]">{{ t('contact.title') }}</h1>
    <p class="mt-5 text-text-muted text-[16px] md:text-[17px] leading-relaxed max-w-[600px]">{{ t('contact.lead') }}</p>

    <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-2">
        <ContactForm />
      </div>

      <aside class="space-y-3">
        <BentoTile :span="2" variant="muted" eyebrow="Adres">
          <p class="text-[14px] leading-relaxed">Diamantweg 48<br>5527 LC Hapert</p>
        </BentoTile>
        <BentoTile :span="2" variant="muted" eyebrow="Bedrijfsgegevens">
          <p class="text-[12px] text-text-muted">KvK 18036761</p>
          <p class="text-[12px] text-text-muted">BTW NL801225401B01</p>
        </BentoTile>
        <BentoTile :span="2" variant="muted" eyebrow="Telefoon">
          <a href="tel:+31135096611" class="text-[14px] underline-offset-2 hover:underline">013 509 66 11</a>
        </BentoTile>
        <BentoTile :span="2" variant="accent" eyebrow="E-mail">
          <a href="mailto:info@robuprint.nl" class="text-[14px] text-white underline-offset-2 hover:underline">info@robuprint.nl</a>
        </BentoTile>
      </aside>
    </div>
  </div>
</template>
