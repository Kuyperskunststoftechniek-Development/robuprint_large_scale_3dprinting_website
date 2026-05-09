<script setup lang="ts">
type SchemName = 'envelope' | 'robot-arm' | 'layer-stack' | 'post-mill' | 'recyclate-flow' | 'pellet'
defineProps<{ name: SchemName }>()
</script>

<template>
  <svg v-if="name === 'envelope'" data-schem="envelope" viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
    <path d="M30 60 L30 170 L130 170 L130 60 L30 60 Z" />
    <path d="M30 60 L70 30 L170 30 L170 140 L130 170" />
    <path d="M130 60 L170 30" />
    <path d="M70 30 L70 140 L170 140 M70 140 L30 170" stroke-dasharray="3 3" />
  </svg>

  <svg v-else-if="name === 'robot-arm'" data-schem="robot-arm" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
    <circle cx="20" cy="80" r="8" />
    <line x1="20" y1="80" x2="50" y2="40" />
    <circle cx="50" cy="40" r="6" />
    <line x1="50" y1="40" x2="80" y2="20" />
    <circle cx="80" cy="20" r="4" />
    <line x1="80" y1="20" x2="86" y2="14" />
  </svg>

  <svg v-else-if="name === 'layer-stack'" data-schem="layer-stack" viewBox="0 0 140 140" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
    <ellipse cx="70" cy="115" rx="50" ry="8" />
    <ellipse cx="70" cy="100" rx="50" ry="8" />
    <ellipse cx="70" cy="85" rx="46" ry="7" />
    <ellipse cx="70" cy="72" rx="42" ry="6" />
    <ellipse cx="70" cy="60" rx="36" ry="5" />
    <ellipse cx="70" cy="50" rx="28" ry="4" />
  </svg>

  <svg v-else-if="name === 'post-mill'" data-schem="post-mill" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
    <line x1="60" y1="10" x2="60" y2="60" />
    <path d="M50 60 L70 60 L65 78 L55 78 Z" />
    <line x1="60" y1="78" x2="60" y2="92" />
    <path d="M20 100 L100 100" />
    <path d="M20 92 L100 92" stroke-dasharray="2 4" />
    <path d="M20 84 L100 84" stroke-dasharray="2 4" opacity="0.6" />
  </svg>

  <svg v-else-if="name === 'recyclate-flow'" data-schem="recyclate-flow" viewBox="0 0 160 80" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
    <circle cx="20" cy="40" r="5" /><circle cx="32" cy="40" r="5" /><circle cx="44" cy="40" r="5" />
    <line x1="58" y1="40" x2="100" y2="40" />
    <path d="M94 34 L100 40 L94 46" />
    <ellipse cx="130" cy="50" rx="22" ry="3" />
    <ellipse cx="130" cy="42" rx="20" ry="3" />
    <ellipse cx="130" cy="34" rx="16" ry="3" />
  </svg>

  <svg v-else-if="name === 'pellet'" data-schem="pellet" viewBox="0 0 24 16" fill="currentColor" aria-hidden="true">
    <ellipse cx="12" cy="8" rx="10" ry="6" />
  </svg>
</template>
