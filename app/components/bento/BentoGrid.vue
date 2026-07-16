<script setup lang="ts">
withDefaults(defineProps<{ gap?: 'sm' | 'md' }>(), { gap: 'md' })
</script>

<template>
  <div
    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 bento-stagger"
    :class="gap === 'sm' ? 'gap-2' : 'gap-3.5'"
  >
    <slot />
  </div>
</template>
