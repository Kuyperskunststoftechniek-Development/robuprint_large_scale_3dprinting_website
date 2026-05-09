<script setup lang="ts">
import { onMounted } from 'vue'
const { t, locale } = useI18n()
const localePath = useLocalePath()
useHead({ title: `${t('projects.title')} · ${t('common.company')}` })

const { observeAll } = useReveal()
onMounted(() => observeAll())

const { data: projects } = await useAsyncData('projects-list', () =>
  queryCollection('projects').where('locale', '=', locale.value).order('year', 'DESC').all(),
)

definePageMeta({ alias: ['/en/projects'] })
</script>

<template>
  <div class="max-w-[1200px] mx-auto px-6 pt-16 pb-12">
    <section class="max-w-[760px] mb-12" data-reveal-target>
      <h1 class="text-[40px] md:text-[56px] font-extrabold tracking-tight leading-[1.04]">{{ t('projects.title') }}</h1>
      <p class="mt-4 text-text-muted text-[15px] max-w-[620px]">{{ t('projects.lead') }}</p>
    </section>

    <div v-if="!projects || projects.length === 0" class="rounded-xl border border-border bg-surface-muted p-10 text-center text-text-muted">
      <p>{{ t('projects.empty') }}</p>
    </div>

    <BentoGrid v-else>
      <BentoTile
        v-for="p in projects"
        :key="p.path"
        :span="3"
        :to="localePath(p.path)"
        :eyebrow="p.client || ''"
      >
        <div class="-mt-2 -mx-2 mb-3 h-32 rounded-lg bg-[linear-gradient(135deg,var(--color-border),var(--color-surface))]" />
        <h2 class="text-[18px] font-bold tracking-tight">{{ p.title }}</h2>
        <p class="text-[13px] text-text-muted line-clamp-3 mt-1">{{ p.summary }}</p>
        <p class="mt-3 text-accent text-[12px] font-medium">{{ t('projects.view_project') }} →</p>
      </BentoTile>
    </BentoGrid>
  </div>
</template>
