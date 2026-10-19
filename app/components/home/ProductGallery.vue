<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

function projectLink(category: ShowcaseCategory): string {
  return `${localePath('/projecten')}#${showcaseProjectSlug[category]}`
}
</script>

<template>
  <section class="mb-16 md:mb-24" aria-labelledby="gallery-heading">
    <div class="max-w-[640px] mb-8" data-reveal-target>
      <p class="label-eyebrow mb-3">
        <span class="inline-block w-1.5 h-1.5 rounded-full bg-accent mr-2 align-middle" />{{ t('home.gallery.eyebrow') }}
      </p>
      <h2 id="gallery-heading" class="text-[28px] md:text-[40px] font-extrabold tracking-tight leading-[1.05]">{{ t('home.gallery.heading') }}</h2>
      <p class="mt-3 text-[15px] text-text-muted leading-relaxed">{{ t('home.gallery.lead') }}</p>
    </div>

    <ul class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 bento-stagger">
      <li v-for="item in showcaseItems" :key="item.key" data-reveal-target>
        <NuxtLink
          :to="projectLink(item.category)"
          class="group block"
        >
          <div class="relative overflow-hidden aspect-square rounded-[var(--radius-lg)] ring-1 ring-white/10 bg-surface">
            <NuxtImg
              :src="item.src"
              :alt="t(`home.gallery.items.${item.key}.title`)"
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="50vw lg:285px"
              loading="lazy"
            />
          </div>
          <p class="mt-3 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-accent">
            {{ t(`home.gallery.categories.${item.category}`) }}
          </p>
          <h3 class="mt-1 text-[15px] font-semibold leading-snug">{{ t(`home.gallery.items.${item.key}.title`) }}</h3>
          <p class="text-[13px] text-text-muted">{{ t(`home.gallery.items.${item.key}.spec`) }}</p>
        </NuxtLink>
      </li>
    </ul>

    <p class="mt-8" data-reveal-target>
      <NuxtLink
        :to="localePath('/projecten')"
        class="inline-flex items-center text-[13px] font-semibold px-5 py-2.5 border border-border-strong rounded-[var(--radius-md)] hover:bg-white/5 transition-colors"
      >
        {{ t('home.gallery.all') }} →
      </NuxtLink>
    </p>
  </section>
</template>
