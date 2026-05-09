<script setup lang="ts">
const { t } = useI18n()
const email = ref('')
const status = ref<'idle' | 'submitting' | 'success' | 'error'>('idle')

async function onSubmit() {
  // Wired to /api/newsletter via useApi() in a later task (Task 17).
  status.value = 'submitting'
  setTimeout(() => { status.value = 'success'; email.value = '' }, 600)
}
</script>

<template>
  <form class="flex gap-2 max-w-sm" @submit.prevent="onSubmit">
    <BaseInput
      v-model="email"
      type="email"
      :placeholder="t('common.footer.newsletter_placeholder')"
      required
      autocomplete="email"
    />
    <BaseButton type="submit" variant="primary" size="sm" :disabled="status === 'submitting'">
      {{ t('common.footer.newsletter_submit') }}
    </BaseButton>
  </form>
  <p v-if="status === 'success'" class="text-[12px] text-text-muted mt-2">{{ t('common.form.success') }}</p>
</template>
