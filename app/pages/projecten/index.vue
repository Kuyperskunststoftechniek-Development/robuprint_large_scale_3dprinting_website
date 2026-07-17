<script setup lang="ts">
import { onMounted } from 'vue'
const { t, locale } = useI18n()
useHead({ title: `${t('projects.title')} · ${t('common.company')}` })

const { observeAll } = useReveal()
onMounted(() => observeAll())

const { data: projects } = await useAsyncData(
  () => `projects-list-${locale.value}`,
  () =>
    queryCollection('projects')
      .where('locale', '=', locale.value)
      .order('year', 'DESC')
      .all(),
  { watch: [locale] },
)

definePageMeta({ alias: ['/en/projects'] })

function slugOf(path: string) {
  return path.split('/').pop() ?? ''
}
</script>

<template>
  <div class="max-w-[1200px] mx-auto px-6 pt-20 md:pt-28 pb-24">
    <section class="max-w-[760px] mb-14 md:mb-20" data-reveal-target>
      <p class="label-eyebrow mb-4"><span class="inline-block w-1.5 h-1.5 rounded-full bg-accent mr-2 align-middle" />{{ t('projects.eyebrow') }}</p>
      <h1 class="text-[44px] md:text-[68px] font-extrabold tracking-[-0.03em] leading-[1.0]">{{ t('projects.title') }}</h1>
      <p class="mt-5 text-text-muted text-[16px] md:text-[17px] leading-relaxed max-w-[620px]">{{ t('projects.lead') }}</p>
    </section>

    <div v-if="!projects || projects.length === 0" class="rounded-xl border border-border bg-surface-muted p-10 text-center text-text-muted">
      <p>{{ t('projects.empty') }}</p>
    </div>

    <template v-else>
      <nav class="flex flex-wrap gap-2 mb-16" data-reveal-target>
        <a
          v-for="p in projects"
          :key="p.path"
          :href="`#${slugOf(p.path)}`"
          class="inline-flex items-center text-[13px] font-medium px-4 py-2 rounded-full border border-border hover:bg-accent hover:text-bg hover:border-accent transition-colors"
        >
          {{ p.title }}
        </a>
      </nav>

      <article
        v-for="p in projects"
        :key="p.path"
        :id="slugOf(p.path)"
        class="mb-24 scroll-mt-24"
        data-reveal-target
      >
        <NuxtImg
          v-if="p.cover"
          :src="p.cover"
          :alt="p.title"
          class="w-full aspect-[21/9] object-cover rounded-[var(--radius-xl)] ring-1 ring-white/10 mb-8"
          sizes="100vw md:1200px"
          loading="lazy"
        />
        <h2 class="text-[28px] md:text-[36px] font-extrabold tracking-tight">{{ p.title }}</h2>
        <p class="mt-3 text-[15px] text-text-muted max-w-[760px]">{{ p.summary }}</p>
        <div class="mt-4 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-text-muted">
          <span v-if="p.client"><span class="text-text">{{ t('projects.aside.client') }}:</span> {{ p.client }}</span>
          <span v-if="p.material"><span class="text-text">{{ t('projects.aside.material') }}:</span> {{ p.material }}</span>
          <span v-if="p.year"><span class="text-text">{{ t('projects.aside.year') }}:</span> {{ p.year }}</span>
        </div>
        <div class="prose max-w-[760px] mt-8">
          <ContentRenderer :value="p" />
        </div>
        <div
          v-if="p.gallery?.length"
          class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10"
        >
          <NuxtImg
            v-for="(g, i) in p.gallery"
            :key="i"
            :src="g"
            :alt="`${p.title} — ${i + 2}`"
            class="w-full aspect-[4/3] object-cover rounded-[var(--radius-md)] ring-1 ring-white/10"
            sizes="100vw md:580px"
            loading="lazy"
          />
        </div>
      </article>
    </template>
  </div>
</template>
