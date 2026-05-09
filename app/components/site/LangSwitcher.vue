<script setup lang="ts">
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const { t } = useI18n()
</script>

<template>
  <div class="flex items-center gap-1 text-[12px] font-medium">
    <NuxtLink
      v-for="l in (locales as Array<{ code: string }>)"
      :key="l.code"
      :to="switchLocalePath(l.code)"
      :class="[
        'px-2 py-1 rounded transition-colors',
        locale === l.code ? 'text-text' : 'text-text-muted hover:text-text',
      ]"
    >
      {{ t(`common.lang.${l.code}`) }}
    </NuxtLink>
  </div>
</template>
