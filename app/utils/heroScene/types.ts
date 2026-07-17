// Type-only module: veilig te importeren in SSR-code (trekt géén three binnen).

export type HeroSubject = 'panel' | 'vase'
export type HeroTheme = 'light' | 'dark'
export type HeroQuality = 'auto' | 'low' | 'high'

export interface HeroSceneOptions {
  subject: HeroSubject
  theme: HeroTheme
  /** 1 = normale printsnelheid (~28 s per print-cyclus) */
  speed: number
  quality: HeroQuality
  /** prefers-reduced-motion: alleen een statisch eindbeeld renderen */
  reduced: boolean
  /** Aangeroepen na het eerste gerenderde frame (voor canvas fade-in) */
  onFirstRender?: () => void
}

export interface HeroSceneHandle {
  /** RAF-loop pauzeren/hervatten (IntersectionObserver / visibilitychange) */
  setActive(active: boolean): void
  /** Eén statisch frame met voltooid object (reduced motion) */
  renderOnce(): void
  /** Alles opruimen incl. WebGL-context (HMR/navigatie) */
  dispose(): void
}

/** Scènekleuren per thema; hexen spiegelen tokens.css waar mogelijk. */
export interface Palette {
  fog: number
  grid: number
  gridOpacity: number
  envelope: number
  bead: number
  beadHot: number
  machine: number
  machineAccent: number
  figure: number
  ground: number
  hemiSky: number
  hemiGround: number
  hemiIntensity: number
  dir: number
  dirIntensity: number
  shadowOpacity: number
}
