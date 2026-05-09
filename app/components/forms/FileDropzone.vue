<script setup lang="ts">
const { t } = useI18n()
defineProps<{ accept: string }>()
const emit = defineEmits<{ filesSelected: [files: File[]] }>()

const isOver = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

function onDrop(e: DragEvent) {
  isOver.value = false
  if (e.dataTransfer?.files) {
    emit('filesSelected', Array.from(e.dataTransfer.files))
  }
}
function onPick(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) emit('filesSelected', Array.from(input.files))
  input.value = ''
}
</script>

<template>
  <div
    :class="[
      'border-[1.5px] border-dashed rounded-[var(--radius-lg)] p-8 text-center transition-colors',
      isOver ? 'border-accent bg-accent-soft' : 'border-border bg-accent-soft/40 hover:border-accent',
    ]"
    @dragover.prevent="isOver = true"
    @dragleave.prevent="isOver = false"
    @drop.prevent="onDrop"
  >
    <p class="text-[15px] font-semibold">{{ t('quote.drop.title') }}</p>
    <p class="text-[12px] text-text-muted mt-1">{{ t('quote.drop.subtitle') }}</p>
    <BaseButton class="mt-3" size="sm" @click="inputRef?.click()">{{ t('quote.drop.button') }}</BaseButton>
    <input ref="inputRef" type="file" multiple :accept="accept" class="hidden" @change="onPick">
    <p class="mt-3 font-mono text-[10.5px] text-text-muted tracking-wider">{{ t('quote.drop.formats') }}</p>
  </div>
</template>
