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
    <div class="max-w-[760px]">
      <NuxtImg
        v-if="project?.cover"
        :src="project.cover"
        :alt="project.title"
        class="w-full rounded-[var(--radius-xl)] mb-8 aspect-[16/10] object-cover"
        sizes="100vw md:760px"
        loading="eager"
      />
      <div class="prose prose-neutral">
        <h1 v-if="project?.title">{{ project.title }}</h1>
        <ContentRenderer v-if="project" :value="project" />
      </div>
      <div
        v-if="project?.gallery?.length"
        class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10"
      >
        <NuxtImg
          v-for="(g, i) in project.gallery"
          :key="i"
          :src="g"
          :alt="`${project.title} — ${i + 2}`"
          class="w-full rounded-[var(--radius-md)] aspect-[4/3] object-cover"
          sizes="50vw md:380px"
          loading="lazy"
        />
      </div>
      <NuxtLink
        :to="localePath('/projecten')"
        class="inline-flex mt-10 items-center text-[13px] font-medium text-accent hover:underline"
      >
        {{ t('projects.back_to_projects') }}
      </NuxtLink>
    </div>
    <aside class="md:sticky md:top-24 md:self-start space-y-3">
      <BentoTile :span="2" variant="muted" :eyebrow="t('projects.aside.client')">
        <p class="text-[14px] font-semibold">{{ project?.client || '—' }}</p>
      </BentoTile>
      <BentoTile :span="2" variant="muted" :eyebrow="t('projects.aside.material')">
        <p class="text-[14px]">{{ project?.material || '—' }}</p>
      </BentoTile>
      <BentoTile :span="2" variant="muted" :eyebrow="t('projects.aside.year')">
        <p class="text-[13px]">{{ project?.year || '—' }}</p>
      </BentoTile>
    </aside>
  </article>
</template>
