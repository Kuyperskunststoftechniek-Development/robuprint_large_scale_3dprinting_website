<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const navItems = computed(() => [
  { to: localePath('/wat-wij-doen'), label: t('common.nav.what_we_do') },
  { to: localePath('/materialen'), label: t('common.nav.materials') },
  { to: localePath('/projecten'), label: t('common.nav.projects') },
  { to: localePath('/over-ons'), label: t('common.nav.about') },
  { to: localePath('/contact'), label: t('common.nav.contact') },
])

const mobileOpen = ref(false)
</script>

<template>
  <header class="sticky top-0 z-50 bg-bg/85 backdrop-blur border-b border-border">
    <div class="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between gap-6">
      <NuxtLink :to="localePath('/')" class="font-bold text-[15px] tracking-tight">{{ t('common.company') }}</NuxtLink>

      <nav class="hidden md:flex items-center gap-6 text-[13px] text-text-muted">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="hover:text-text transition-colors"
          active-class="text-text"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-3">
        <NuxtLink
          :to="localePath('/offerte')"
          class="hidden md:inline-flex items-center text-[12.5px] font-medium px-4 py-2 bg-accent text-white rounded-[var(--radius-md)] hover:bg-[#1241C7] transition-colors"
        >
          {{ t('common.nav.quote_cta') }} →
        </NuxtLink>
        <LangSwitcher />
        <button
          class="md:hidden p-2"
          :aria-label="mobileOpen ? 'Close menu' : 'Open menu'"
          @click="mobileOpen = !mobileOpen"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>
    </div>

    <div v-if="mobileOpen" class="md:hidden border-t border-border bg-bg">
      <nav class="max-w-[1200px] mx-auto px-6 py-4 flex flex-col gap-3 text-[14px]">
        <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to" @click="mobileOpen = false">{{ item.label }}</NuxtLink>
        <NuxtLink :to="localePath('/offerte')" class="font-medium text-accent" @click="mobileOpen = false">{{ t('common.nav.quote_cta') }} →</NuxtLink>
      </nav>
    </div>
  </header>
</template>
