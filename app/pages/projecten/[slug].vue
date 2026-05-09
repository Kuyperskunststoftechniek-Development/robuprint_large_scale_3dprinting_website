<script setup lang="ts">
const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()

const { data: project } = await useAsyncData(`project-${route.params.slug}`, () =>
  queryCollection('projects')
    .path(`/projecten/${route.params.slug}`)
    .where('locale', '=', locale.value)
    .first(),
)

if (!project.value) {
  throw createError({ statusCode: 404, statusMessage: 'Project not found', fatal: true })
}

useHead({ title: `${project.value.title} · ${t('common.company')}` })

definePageMeta({ alias: ['/en/projects/:slug'] })
</script>

<template>
  <article v-if="project" class="max-w-[860px] mx-auto px-6 py-20">
    <NuxtLink :to="localePath('/projecten')" class="text-[13px] text-text-muted hover:text-text">{{ t('projects.back_to_projects') }}</NuxtLink>
    <h1 class="mt-4 text-[36px] font-semibold tracking-tight">{{ project.title }}</h1>
    <dl class="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-[12px] font-mono text-text-muted">
      <div v-if="project.client"><dt class="inline">CLIENT</dt> <dd class="inline text-text">{{ project.client }}</dd></div>
      <div v-if="project.material"><dt class="inline">MATERIAL</dt> <dd class="inline text-text">{{ project.material }}</dd></div>
      <div v-if="project.year"><dt class="inline">YEAR</dt> <dd class="inline text-text">{{ project.year }}</dd></div>
    </dl>
    <p class="mt-6 text-[16px] text-text-muted leading-[1.6]">{{ project.summary }}</p>
    <div class="prose mt-12 max-w-none">
      <ContentRenderer :value="project" />
    </div>
  </article>
</template>
