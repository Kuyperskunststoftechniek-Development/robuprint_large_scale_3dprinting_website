<script setup lang="ts">
const { t } = useI18n()

// Drie voorbeelden die direct tonen wat we maken: rol, meubilair en verloop.
const tiles = [
  { item: showcaseItem('roller_dimples'), class: 'col-span-2 aspect-[2/1]', sizes: '100vw lg:560px' },
  { item: showcaseItem('chair'), class: 'aspect-square', sizes: '50vw lg:275px' },
  { item: showcaseItem('reducer_flange'), class: 'aspect-square', sizes: '50vw lg:275px' },
]
</script>

<template>
  <div class="grid grid-cols-2 gap-3 md:gap-4">
    <figure
      v-for="(tile, i) in tiles"
      :key="tile.item.key"
      class="relative overflow-hidden rounded-[var(--radius-xl)] ring-1 ring-white/10 bg-surface"
      :class="tile.class"
    >
      <NuxtImg
        :src="tile.item.src"
        :alt="t(`home.gallery.items.${tile.item.key}.title`)"
        class="absolute inset-0 w-full h-full object-cover"
        :sizes="tile.sizes"
        :loading="i === 0 ? 'eager' : 'lazy'"
        :fetchpriority="i === 0 ? 'high' : undefined"
      />
      <figcaption
        class="absolute left-3 bottom-3 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-white px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-sm"
      >
        {{ t(`home.gallery.categories.${tile.item.category}`) }}
      </figcaption>
    </figure>
  </div>
</template>
