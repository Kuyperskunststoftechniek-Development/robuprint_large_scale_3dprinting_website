<script setup lang="ts">
type Variant = 'default' | 'muted' | 'accent'
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
  accent: 'accent-panel text-white',
}

const tag = props.to ? 'NuxtLink' : 'div'
</script>

<template>
  <component
    :is="tag"
    :to="to"
    data-reveal-target
    :data-variant="variant"
    class="group relative overflow-hidden rounded-[var(--radius-xl)] p-6 min-h-[180px] flex flex-col gap-2 transition-all duration-200"
    :class="[
      SPAN_CLASS[span],
      VARIANT_CLASS[variant],
      to ? 'shadow-[var(--shadow-tile)] hover:shadow-[var(--shadow-tile-hover)] hover:-translate-y-0.5 cursor-pointer' : 'shadow-[var(--shadow-tile)]',
    ]"
  >
    <div
      v-if="variant === 'accent'"
      class="absolute inset-0 blueprint-grid text-white/[0.07] pointer-events-none"
      aria-hidden="true"
    />

    <p
      v-if="eyebrow"
      class="relative font-mono font-medium text-[10.5px] tracking-[0.14em] uppercase"
      :class="variant === 'accent' ? 'text-white/80' : 'text-accent'"
    >{{ eyebrow }}</p>

    <slot />

    <div
      v-if="to"
      class="absolute right-5 top-5 w-7 h-7 rounded-full border flex items-center justify-center text-[13px] transition-all duration-200 group-hover:bg-accent group-hover:text-white group-hover:border-accent"
      :class="variant === 'accent' ? 'border-white/40 text-white' : 'border-border text-text-muted'"
      aria-hidden="true"
    >↗</div>

    <div class="absolute right-3 bottom-3 pointer-events-none opacity-50">
      <slot name="illustration" />
    </div>
  </component>
</template>
