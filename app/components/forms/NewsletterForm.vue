<script setup lang="ts">
const { t } = useI18n()
const { request } = useApi()
const email = ref('')
const status = ref<'idle' | 'submitting' | 'success' | 'error'>('idle')

async function onSubmit() {
  if (!email.value.includes('@')) return
  status.value = 'submitting'
  try {
    await request('/newsletter', { body: { email: email.value } })
    status.value = 'success'
    email.value = ''
  } catch {
    status.value = 'error'
  }
}
</script>

<template>
  <form class="flex gap-2 max-w-sm" @submit.prevent="onSubmit">
    <BaseInput v-model="email" type="email" :placeholder="t('common.footer.newsletter_placeholder')" required autocomplete="email" />
    <BaseButton type="submit" variant="primary" size="sm" :disabled="status === 'submitting'">{{ t('common.footer.newsletter_submit') }}</BaseButton>
  </form>
  <p v-if="status === 'success'" class="text-[12px] text-text-muted mt-2">{{ t('common.form.success') }}</p>
  <p v-else-if="status === 'error'" class="text-[12px] text-red-600 mt-2">{{ t('common.form.error_generic') }}</p>
</template>
