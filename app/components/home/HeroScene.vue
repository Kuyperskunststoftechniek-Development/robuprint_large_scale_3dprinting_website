<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
// Type-only import: trekt géén three in de SSR-bundel.
import type { HeroQuality, HeroSceneHandle, HeroSubject, HeroTheme } from '~/utils/heroScene/types'

const props = withDefaults(
  defineProps<{
    subject?: HeroSubject
    theme?: HeroTheme
    speed?: number
    quality?: HeroQuality
  }>(),
  { subject: 'panel', theme: 'dark', speed: 1, quality: 'auto' },
)

const container = ref<HTMLElement>()
const canvasEl = ref<HTMLCanvasElement>()
const mode = ref<'canvas' | 'video'>('canvas')
const ready = ref(false)

let handle: HeroSceneHandle | null = null
let io: IntersectionObserver | null = null
let intersecting = true
let contextLosses = 0
let unmounted = false

function applyActive(): void {
  handle?.setActive(intersecting && document.visibilityState === 'visible')
}

function onVisibility(): void {
  applyActive()
}

// three herstelt één context-verlies zelf; bij herhaling vallen we terug op de video.
function onContextLost(): void {
  contextLosses += 1
  if (contextLosses > 1) {
    handle?.dispose()
    handle = null
    mode.value = 'video'
  }
}

onMounted(async () => {
  let gl: WebGL2RenderingContext | null = null
  try {
    gl = canvasEl.value!.getContext('webgl2', {
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
  } catch {
    gl = null
  }
  if (!gl) {
    mode.value = 'video'
    return
  }

  // Dynamische import: three belandt in een async chunk, buiten de initiële payload.
  const { createHeroScene } = await import('~/utils/heroScene')
  const created = await createHeroScene(canvasEl.value!, gl, {
    subject: props.subject,
    theme: props.theme,
    speed: props.speed,
    quality: props.quality,
    // Bewust géén prefers-reduced-motion-tak: de printloop is de kern van de
    // hero en draait voor elke bezoeker. Windows met "animatie-effecten uit"
    // meldt reduce, wat anders een stilstaand, voltooid object opleverde.
    reduced: false,
    onFirstRender: () => {
      ready.value = true
    },
  })
  if (unmounted) {
    created.dispose()
    return
  }
  handle = created
  canvasEl.value!.addEventListener('webglcontextlost', onContextLost)

  io = new IntersectionObserver(
    ([entry]) => {
      intersecting = entry?.isIntersecting ?? false
      applyActive()
    },
    { threshold: 0.05 },
  )
  io.observe(container.value!)
  document.addEventListener('visibilitychange', onVisibility)
})

onUnmounted(() => {
  unmounted = true
  io?.disconnect()
  document.removeEventListener('visibilitychange', onVisibility)
  canvasEl.value?.removeEventListener('webglcontextlost', onContextLost)
  handle?.dispose()
  handle = null
})
</script>

<template>
  <div ref="container" class="absolute inset-0 overflow-hidden" aria-hidden="true">
    <!-- Placeholder tot het eerste frame; ook de SSR/prerender-output. -->
    <div
      class="absolute inset-0 blueprint-grid"
      :class="theme === 'dark' ? 'text-hero-highlight/8' : 'text-accent/8'"
    />
    <canvas
      v-show="mode === 'canvas'"
      ref="canvasEl"
      class="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-700"
      :class="{ 'opacity-100': ready }"
    />
    <!-- Fallback zonder WebGL: de oorspronkelijke procesvideo. -->
    <video
      v-if="mode === 'video'"
      src="/content/algemeen/proces.mp4"
      class="absolute inset-0 w-full h-full object-cover"
      autoplay
      muted
      loop
      playsinline
      preload="metadata"
    />
  </div>
</template>
