<script setup lang="ts">
type Variant = 'default' | 'muted' | 'dark' | 'accent'
type Span = 1 | 2 | 3 | 4 | 6

const props = withDefaults(
  defineProps<{
    variant?: Variant
    span?: Span
    eyebrow?: string
    to?: string
  }>(),
  { variant: 'default', span: 2 },
)

const SPAN_CLASS: Record<Span, string> = {
  1: 'md:col-span-1',
  2: 'sm:col-span-1 md:col-span-2',
  3: 'sm:col-span-2 md:col-span-3',
  4: 'sm:col-span-2 md:col-span-4',
  6: 'sm:col-span-2 md:col-span-6',
}

const VARIANT_CLASS: Record<Variant, string> = {
  default: 'bg-surface border border-border text-text',
  muted: 'bg-[var(--color-surface-muted)] border border-border text-text',
  dark: 'bg-[var(--color-surface-dark)] text-white',
  accent: 'bg-[image:var(--gradient-accent)] text-white',
}

const tag = props.to ? 'NuxtLink' : 'div'
</script>

<template>
  <component
    :is="tag"
    :to="to"
    data-reveal-target
    :data-variant="variant"
    class="relative overflow-hidden rounded-[var(--radius-xl)] p-6 min-h-[180px] flex flex-col gap-2 transition-shadow duration-150"
    :class="[
      SPAN_CLASS[span],
      VARIANT_CLASS[variant],
      to ? 'shadow-[var(--shadow-tile)] hover:shadow-[var(--shadow-tile-hover)] cursor-pointer' : 'shadow-[var(--shadow-tile)]',
    ]"
  >
    <p
      v-if="eyebrow"
      class="font-mono text-[10px] tracking-[0.18em] uppercase"
      :class="variant === 'dark' || variant === 'accent' ? 'text-[#7CC9C0]' : 'text-accent'"
    >// {{ eyebrow }}</p>

    <slot />

    <div class="absolute right-3 bottom-3 pointer-events-none opacity-50">
      <slot name="illustration" />
    </div>
  </component>
</template>
