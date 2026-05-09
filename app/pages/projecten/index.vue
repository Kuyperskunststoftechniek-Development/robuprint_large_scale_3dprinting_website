<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
useHead({ title: `${t('projects.title')} · ${t('common.company')}` })

const { data: projects } = await useAsyncData('projects-list', () =>
  queryCollection('projects').where('locale', '=', locale.value).order('year', 'DESC').all(),
)

definePageMeta({ alias: ['/en/projects'] })
</script>

<template>
  <div class="max-w-[1100px] mx-auto px-6 py-20">
    <h1 class="text-[42px] font-semibold tracking-tight">{{ t('projects.title') }}</h1>
    <p class="mt-4 text-text-muted text-[15px] max-w-[760px]">{{ t('projects.lead') }}</p>

    <div v-if="projects && projects.length" class="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
      <NuxtLink v-for="p in projects" :key="p.path" :to="localePath(p.path)" class="block">
        <BaseCard>
          <p class="font-mono text-[10px] text-text-muted tracking-wider uppercase">{{ p.client ?? '—' }}</p>
          <h2 class="text-[20px] font-semibold mt-1 mb-2">{{ p.title }}</h2>
          <p class="text-[13px] text-text-muted leading-[1.55]">{{ p.summary }}</p>
          <p class="mt-4 text-accent text-[12px] font-medium">{{ t('projects.view_project') }}</p>
        </BaseCard>
      </NuxtLink>
    </div>
    <div v-else class="mt-12 border border-dashed border-border rounded-[var(--radius-lg)] p-16 text-center">
      <p class="text-text-muted text-[14px]">{{ t('projects.empty') }}</p>
    </div>
  </div>
</template>
