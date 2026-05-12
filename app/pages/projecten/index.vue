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
  <div class="max-w-[1200px] mx-auto px-6 pt-16 pb-12">
    <section class="max-w-[760px] mb-10" data-reveal-target>
      <h1 class="text-[40px] md:text-[56px] font-extrabold tracking-tight leading-[1.04]">{{ t('projects.title') }}</h1>
      <p class="mt-4 text-text-muted text-[15px] max-w-[620px]">{{ t('projects.lead') }}</p>
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
          class="inline-flex items-center text-[13px] font-medium px-4 py-2 rounded-full border border-border hover:bg-accent hover:text-white hover:border-accent transition-colors"
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
          class="w-full aspect-[21/9] object-cover rounded-[var(--radius-xl)] mb-8"
          sizes="100vw md:1200px"
          loading="lazy"
        />
        <h2 class="text-[28px] md:text-[36px] font-extrabold tracking-tight">{{ p.title }}</h2>
        <p class="mt-3 text-[15px] text-text-muted max-w-[760px]">{{ p.summary }}</p>
        <div class="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-[12px] font-mono uppercase tracking-wider text-text-muted">
          <span v-if="p.client"><span class="text-text">{{ t('projects.aside.client') }}:</span> {{ p.client }}</span>
          <span v-if="p.material"><span class="text-text">{{ t('projects.aside.material') }}:</span> {{ p.material }}</span>
          <span v-if="p.year"><span class="text-text">{{ t('projects.aside.year') }}:</span> {{ p.year }}</span>
        </div>
        <div class="prose prose-neutral max-w-[760px] mt-8">
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
            class="w-full aspect-[4/3] object-cover rounded-[var(--radius-md)]"
            sizes="100vw md:580px"
            loading="lazy"
          />
        </div>
      </article>
    </template>
  </div>
</template>
