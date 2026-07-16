<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'accent' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit'
  disabled?: boolean
}>()
</script>

<template>
  <button
    :type="type ?? 'button'"
    :disabled="disabled"
    :class="[
      'inline-flex items-center justify-center font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed',
      'rounded-[var(--radius-md)] active:translate-y-px',
      size === 'sm' ? 'text-[12.5px] px-3 py-2' :
      size === 'lg' ? 'text-base px-6 py-3' :
                      'text-[13.5px] px-4 py-2.5',
      variant === 'accent' ? 'bg-accent text-white hover:bg-accent-hover shadow-[var(--shadow-btn)] hover:-translate-y-px' :
      variant === 'ghost' ? 'text-text-muted hover:text-text bg-transparent' :
                            'bg-text text-bg hover:bg-[#1A1A1F] hover:-translate-y-px',
    ]"
  >
    <slot />
  </button>
</template>
