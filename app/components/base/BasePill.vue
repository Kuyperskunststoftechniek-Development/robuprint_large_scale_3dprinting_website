<script setup lang="ts">
defineProps<{ selected?: boolean }>()
defineEmits<{ click: [] }>()
</script>

<template>
  <button
    type="button"
    :class="[
      'px-3.5 py-1.5 text-[12px] rounded-[var(--radius-pill)] border transition-colors',
      selected
        ? 'border-accent bg-accent-soft text-accent font-medium'
        : 'border-border bg-surface text-text hover:border-border-strong',
    ]"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>
