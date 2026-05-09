<script setup lang="ts">
import { onMounted } from 'vue'
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

const { observeAll } = useReveal()
onMounted(() => observeAll())
</script>

<template>
  <article class="max-w-[1200px] mx-auto px-6 pt-16 pb-16 grid grid-cols-1 md:grid-cols-[1fr_280px] gap-10">
    <div class="prose prose-neutral max-w-[720px]">
      <ContentRenderer v-if="project" :value="project" />
    </div>
    <aside class="md:sticky md:top-24 md:self-start space-y-3">
      <BentoTile :span="2" variant="muted" eyebrow="Klant">
        <p class="text-[14px] font-semibold">{{ project?.client || '—' }}</p>
      </BentoTile>
      <BentoTile :span="2" variant="muted" eyebrow="Materiaal">
        <p class="text-[14px]">{{ project?.material || '—' }}</p>
      </BentoTile>
      <BentoTile :span="2" variant="dark" eyebrow="Status">
        <p class="text-[13px] text-white">{{ project?.year || '—' }}</p>
      </BentoTile>
    </aside>
  </article>
</template>
