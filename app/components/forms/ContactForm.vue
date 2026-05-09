<script setup lang="ts">
import { isEmail, isNonEmpty } from '~/utils/validators'

const { t } = useI18n()
const { request } = useApi()
const { getToken } = useTurnstile()

const form = reactive({ name: '', company: '', email: '', phone: '', message: '', consent: false })
const errors = ref<Record<string, string>>({})
const status = ref<'idle' | 'submitting' | 'success' | 'error'>('idle')
const turnstileEl = ref<HTMLElement | null>(null)

function validate() {
  const e: Record<string, string> = {}
  if (!isNonEmpty(form.name)) e.name = t('contact.fields.name')
  if (!isEmail(form.email)) e.email = t('contact.fields.email')
  if (!isNonEmpty(form.message)) e.message = t('contact.fields.message')
  if (!form.consent) e.consent = t('common.form.consent')
  errors.value = e
  return Object.keys(e).length === 0
}

async function onSubmit() {
  if (!validate()) return
  status.value = 'submitting'
  try {
    const token = turnstileEl.value ? await getToken(turnstileEl.value) : 'dev-no-turnstile'
    await request('/contact', {
      body: {
        name: form.name,
        company: form.company,
        email: form.email,
        phone: form.phone,
        message: form.message,
        turnstile_token: token,
      },
    })
    status.value = 'success'
  } catch {
    status.value = 'error'
  }
}
</script>

<template>
  <form class="space-y-5 max-w-[640px]" @submit.prevent="onSubmit">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-[12px] font-medium mb-1.5">{{ t('contact.fields.name') }} <span class="text-accent">*</span></label>
        <BaseInput v-model="form.name" autocomplete="name" required />
        <p v-if="errors.name" class="text-[11px] text-red-600 mt-1">{{ errors.name }}</p>
      </div>
      <div>
        <label class="block text-[12px] font-medium mb-1.5">{{ t('contact.fields.company') }}</label>
        <BaseInput v-model="form.company" autocomplete="organization" />
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-[12px] font-medium mb-1.5">{{ t('contact.fields.email') }} <span class="text-accent">*</span></label>
        <BaseInput v-model="form.email" type="email" autocomplete="email" required />
        <p v-if="errors.email" class="text-[11px] text-red-600 mt-1">{{ errors.email }}</p>
      </div>
      <div>
        <label class="block text-[12px] font-medium mb-1.5">{{ t('contact.fields.phone') }}</label>
        <BaseInput v-model="form.phone" type="tel" autocomplete="tel" />
      </div>
    </div>
    <div>
      <label class="block text-[12px] font-medium mb-1.5">{{ t('contact.fields.message') }} <span class="text-accent">*</span></label>
      <BaseTextarea v-model="form.message" :rows="6" required />
      <p v-if="errors.message" class="text-[11px] text-red-600 mt-1">{{ errors.message }}</p>
    </div>
    <label class="flex items-start gap-2 text-[12px] text-text-muted">
      <input v-model="form.consent" type="checkbox" class="mt-0.5">
      <span>{{ t('common.form.consent') }}</span>
    </label>
    <p v-if="errors.consent" class="text-[11px] text-red-600">{{ errors.consent }}</p>
    <div ref="turnstileEl" />
    <BaseButton type="submit" variant="accent" :disabled="status === 'submitting'">
      {{ status === 'submitting' ? t('common.form.submitting') : t('contact.submit') }}
    </BaseButton>
    <p v-if="status === 'success'" class="text-[13px] text-accent">{{ t('common.form.success') }}</p>
    <p v-else-if="status === 'error'" class="text-[13px] text-red-600">{{ t('common.form.error_generic') }}</p>
  </form>
</template>
