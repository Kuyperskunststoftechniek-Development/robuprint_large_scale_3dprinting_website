import {
  DoubleSide,
  Group,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Vector3,
  WebGLRenderer,
} from 'three'
import { buildBeadGeometry, shareBeadGeometry } from './bead'
import { ToolpathCurve } from './curve'
import { buildMachine, type Machine } from './machine'
import { buildCadMachine } from './machineCad'
import { buildContactShadow, buildEnvironment, buildScaleFigure, PALETTES } from './scene'
import {
  beadIndexCount,
  drawCountForSegments,
  panelToolpath,
  toolpathBounds,
  vaseToolpath,
  PANEL_DEFAULTS,
  VASE_DEFAULTS,
} from './toolpath'
import type { HeroSceneHandle, HeroSceneOptions, HeroSubject } from './types'

interface SubjectConfig {
  toolpath(sampleScale: number): Float32Array
  beadWidth: number
  beadHeight: number
  camDist: number
  camBasePitch: number
  /** Rig-doelpunt; negatieve x schuift het object naar rechts in beeld (tekst staat links). */
  target: [number, number, number]
  craneFactor: number
  railLength: number
  /** Verder naar achteren = meer uitgestrekte (horizontalere) armhouding. */
  railZ: number
  withFigure: boolean
  shadowRadius: number
}

const SUBJECTS: Record<HeroSubject, SubjectConfig> = {
  vase: {
    toolpath: (s) =>
      vaseToolpath({ ...VASE_DEFAULTS, samplesPerLayer: Math.round(VASE_DEFAULTS.samplesPerLayer * s) }),
    beadWidth: 0.026,
    beadHeight: VASE_DEFAULTS.layerHeight * 1.15,
    // Ruimer kader zodat de hele robot (hoogste elleboog-stand bij de start)
    // samen met de vaas van begin tot eind in beeld blijft.
    camDist: 5.7,
    camBasePitch: -0.09,
    target: [-1.0, 1.15, 0],
    craneFactor: 0.18,
    railLength: 4,
    railZ: -2.4, // binnen het bereik (~2,9 m) van de echte robot

    withFigure: false,
    shadowRadius: 0.95,
  },
  panel: {
    toolpath: (s) =>
      panelToolpath({ ...PANEL_DEFAULTS, samplesPerSide: Math.round(PANEL_DEFAULTS.samplesPerSide * s) }),
    beadWidth: 0.1,
    beadHeight: PANEL_DEFAULTS.layerHeight * 1.15,
    camDist: 8.4,
    camBasePitch: -0.12,
    target: [-1.6, 1.05, 0.35],
    craneFactor: 0.45,
    railLength: 6.5,
    railZ: -1.7, // dichterbij: het paneel moet binnen het bereik van de echte robot blijven
    withFigure: true,
    shadowRadius: 3.1,
  },
}

interface QualityConfig {
  dpr: number
  radialSegments: number
  sampleScale: number
  fpsCap: number | null
  shadows: boolean
}

function resolveQuality(quality: HeroSceneOptions['quality']): QualityConfig {
  if (quality === 'low' || (quality === 'auto' && isLowPower())) {
    return { dpr: 1.25, radialSegments: 4, sampleScale: 0.5, fpsCap: 30, shadows: false }
  }
  if (quality === 'high') {
    return { dpr: 2, radialSegments: 8, sampleScale: 1, fpsCap: null, shadows: true }
  }
  return { dpr: 1.5, radialSegments: 6, sampleScale: 1, fpsCap: null, shadows: false }
}

function isLowPower(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number }
  return (
    matchMedia('(pointer: coarse)').matches ||
    window.innerWidth < 768 ||
    (navigator.hardwareConcurrency ?? 8) <= 4 ||
    (nav.deviceMemory ?? 8) < 4
  )
}

// Fasetiming (seconden, printing gedeeld door options.speed).
const PRINT_DURATION = 28
const ADMIRE_DURATION = 5
const RESET_DURATION = 1.2

// Eerste lagen bewust traag/leesbaar: 40% lineair, 60% smoothstep.
function printEase(u: number): number {
  return 0.4 * u + 0.6 * (u * u * (3 - 2 * u))
}

export async function createHeroScene(
  canvas: HTMLCanvasElement,
  context: WebGL2RenderingContext,
  options: HeroSceneOptions,
): Promise<HeroSceneHandle> {
  const palette = PALETTES[options.theme]
  const subject = SUBJECTS[options.subject]
  const q = resolveQuality(options.quality)

  const renderer = new WebGLRenderer({ canvas, context, antialias: true, alpha: true })
  renderer.setClearColor(0x000000, 0)
  renderer.shadowMap.enabled = q.shadows

  const { scene } = buildEnvironment(palette, q.shadows)

  // Object: één curve, één rupsgeometrie, één groeiende drawRange.
  const points = subject.toolpath(q.sampleScale)
  const curve = new ToolpathCurve(points)
  const bounds = toolpathBounds(points)
  const beadGeometry = buildBeadGeometry(points, subject.beadWidth, subject.beadHeight, q.radialSegments)
  const beadMaterial = new MeshStandardMaterial({
    color: palette.bead,
    roughness: 0.62,
    metalness: 0.05,
    side: DoubleSide,
  })
  const beadMesh = new Mesh(beadGeometry, beadMaterial)
  beadMesh.castShadow = q.shadows
  scene.add(beadMesh)

  // Vers-geëxtrudeerd spoor: glanzend, licht warm kunststof (geen gloeiend
  // metaal). Deelt de GPU-buffers, eigen drawRange-venster, wint z-fight via polygonOffset.
  const trailGeometry = shareBeadGeometry(beadGeometry)
  const trailMaterial = new MeshStandardMaterial({
    color: palette.beadHot,
    emissive: palette.beadHot,
    emissiveIntensity: 0.28,
    roughness: 0.22,
    side: DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  })
  const trailMesh = new Mesh(trailGeometry, trailMaterial)
  scene.add(trailMesh)
  const trailWindow = Math.max(60, Math.round(curve.pointCount * 0.02))

  // Echte robot van de gebruiker (CAD-delen); primitieven-robot als fallback.
  let machine: Machine
  try {
    machine = await buildCadMachine(palette, subject.railLength, subject.railZ)
  } catch (err) {
    if (import.meta.dev) console.warn('[heroScene] CAD-robot laden mislukt, fallback:', err)
    machine = buildMachine(palette, subject.railLength, subject.railZ)
  }
  scene.add(machine.group)

  scene.add(buildContactShadow(palette, subject.shadowRadius))
  if (subject.withFigure) {
    const figure = buildScaleFigure(palette)
    figure.position.set(bounds.maxRadius + 0.55, 0, 0.9)
    figure.rotation.y = -0.5
    scene.add(figure)
  }

  // Camera-rig: yaw- en pitch-groep rond het doelpunt; camera kijkt langs -z naar het rigcentrum.
  const rigYaw = new Group()
  const rigPitch = new Group()
  const camera = new PerspectiveCamera(38, 1, 0.1, 60)
  rigYaw.position.set(...subject.target)
  rigPitch.rotation.x = subject.camBasePitch
  camera.position.z = subject.camDist
  rigPitch.add(camera)
  rigYaw.add(rigPitch)
  scene.add(rigYaw)
  const rigBaseY = subject.target[1]

  // Fase-machine + parallax-state.
  let phase: 'printing' | 'admire' | 'reset' = 'printing'
  let phaseT = 0
  let progress = 0
  let mouseNx = 0
  let mouseNy = 0
  let driftT = Math.PI // niet op het sinus-nulpunt starten
  const nozzleTarget = new Vector3()
  const parkTarget = new Vector3(0, bounds.height + 0.7, -1.1)
  const printDuration = PRINT_DURATION / Math.max(0.1, options.speed)

  const parallaxEnabled =
    !options.reduced && matchMedia('(pointer: fine)').matches && window.innerWidth >= 1024
  function onPointerMove(e: PointerEvent): void {
    mouseNx = (e.clientX / window.innerWidth) * 2 - 1
    mouseNy = (e.clientY / window.innerHeight) * 2 - 1
  }
  if (parallaxEnabled) window.addEventListener('pointermove', onPointerMove, { passive: true })

  function applyProgress(p: number): void {
    const idx = p >= 1 ? curve.pointCount - 1 : curve.pointIndexAt(p)
    beadGeometry.setDrawRange(0, drawCountForSegments(idx, q.radialSegments))
    const trailStart = Math.max(0, idx - trailWindow)
    trailGeometry.setDrawRange(
      drawCountForSegments(trailStart, q.radialSegments),
      drawCountForSegments(idx - trailStart, q.radialSegments),
    )
  }

  let beadFading = false
  function setBeadOpacity(opacity: number): void {
    const fading = opacity < 1
    if (fading !== beadFading) {
      // transparent-toggle vereist een shader-hercompile; alleen op fasegrenzen.
      beadFading = fading
      beadMaterial.transparent = fading
      trailMaterial.transparent = fading
      beadMaterial.needsUpdate = true
      trailMaterial.needsUpdate = true
    }
    beadMaterial.opacity = opacity
    trailMaterial.opacity = opacity
  }

  function update(dt: number): void {
    phaseT += dt
    driftT += dt

    if (phase === 'printing') {
      progress = printEase(Math.min(1, phaseT / printDuration))
      applyProgress(progress)
      curve.getPointAt(progress, nozzleTarget)
      machine.pose(nozzleTarget, dt)
      if (phaseT >= printDuration) {
        phase = 'admire'
        phaseT = 0
      }
    } else if (phase === 'admire') {
      machine.pose(parkTarget, dt)
      rigYaw.rotation.y += dt * 0.045
      if (phaseT >= ADMIRE_DURATION) {
        phase = 'reset'
        phaseT = 0
      }
    } else {
      machine.pose(parkTarget, dt)
      setBeadOpacity(Math.max(0, 1 - phaseT / RESET_DURATION))
      if (phaseT >= RESET_DURATION) {
        phase = 'printing'
        phaseT = 0
        progress = 0
        applyProgress(0)
        setBeadOpacity(1)
      }
    }

    // Camera: langzame crane met de printhoogte mee + dolly tijdens admire.
    const craneY = rigBaseY + Math.max(0, nozzleTarget.y - rigBaseY) * subject.craneFactor
    rigYaw.position.y += (craneY - rigYaw.position.y) * (1 - Math.exp(-dt * 1.2))
    const distTarget = phase === 'admire' ? subject.camDist * 1.15 : subject.camDist
    camera.position.z += (distTarget - camera.position.z) * (1 - Math.exp(-dt * 2))

    if (import.meta.dev) {
      ;(window as unknown as Record<string, unknown>).__heroDebug = {
        phase,
        phaseT: Math.round(phaseT * 100) / 100,
        progress: Math.round(progress * 1000) / 1000,
        printDuration,
      }
    }

    // Idle-drift + muis-parallax, frame-rate-onafhankelijk gelerpt.
    const driftYaw = 0.02 * Math.sin((driftT * Math.PI * 2) / 22)
    const driftPitch = 0.008 * Math.sin((driftT * Math.PI * 2) / 30)
    const targetYaw = driftYaw + (parallaxEnabled ? mouseNx * MathUtils.degToRad(3) : 0)
    const targetPitch =
      subject.camBasePitch + driftPitch + (parallaxEnabled ? mouseNy * MathUtils.degToRad(1.5) : 0)
    const k = 1 - Math.exp(-dt * 3)
    if (phase !== 'admire') rigYaw.rotation.y += (targetYaw - rigYaw.rotation.y) * k
    rigPitch.rotation.x += (targetPitch - rigPitch.rotation.x) * k
  }

  // RAF-loop met dt-cap (tabwissel springt niet) en optionele 30 fps-cap.
  let rafId = 0
  let running = false
  let last = 0
  let fpsAcc = 0
  let firstRendered = false
  let disposed = false

  function frame(now: number): void {
    rafId = requestAnimationFrame(frame)
    let dt = Math.min(0.1, (now - last) / 1000)
    last = now
    if (q.fpsCap) {
      fpsAcc += dt
      if (fpsAcc < 1 / q.fpsCap) return
      dt = Math.min(0.1, fpsAcc)
      fpsAcc = 0
    }
    update(dt)
    renderer.render(scene, camera)
    if (!firstRendered) {
      firstRendered = true
      options.onFirstRender?.()
    }
  }

  function setActive(active: boolean): void {
    if (disposed || active === running) return
    running = active
    if (active) {
      last = performance.now()
      rafId = requestAnimationFrame(frame)
    } else {
      cancelAnimationFrame(rafId)
    }
  }

  function renderOnce(): void {
    if (disposed) return
    progress = 1
    applyProgress(1)
    machine.poseImmediate(parkTarget)
    rigYaw.position.y = rigBaseY + (bounds.height * 0.5 - rigBaseY) * subject.craneFactor
    camera.position.z = subject.camDist * 1.1
    resize()
    renderer.render(scene, camera)
    // Zonder doorlopende loop kan de compositor een enkel frame kwijtraken;
    // één extra frame via RAF maakt het statische beeld betrouwbaar.
    requestAnimationFrame(() => {
      if (!disposed && !running) renderer.render(scene, camera)
    })
    if (!firstRendered) {
      firstRendered = true
      options.onFirstRender?.()
    }
  }

  function resize(): void {
    const host = canvas.parentElement
    if (!host) return
    const w = host.clientWidth || 1
    const h = host.clientHeight || 1
    renderer.setPixelRatio(Math.min(q.dpr, window.devicePixelRatio || 1))
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    // Statische modus (reduced motion): zonder loop zou de canvas na een
    // resize leeg blijven — meteen een frame renderen.
    if (!running && firstRendered) renderer.render(scene, camera)
  }

  const resizeObserver = new ResizeObserver(resize)
  if (canvas.parentElement) resizeObserver.observe(canvas.parentElement)
  resize()

  function dispose(): void {
    if (disposed) return
    disposed = true
    setActive(false)
    resizeObserver.disconnect()
    if (parallaxEnabled) window.removeEventListener('pointermove', onPointerMove)
    scene.traverse((obj) => {
      const mesh = obj as Mesh
      if (mesh.geometry) mesh.geometry.dispose()
      const material = (mesh as Mesh).material
      const materials = Array.isArray(material) ? material : material ? [material] : []
      for (const m of materials) {
        const withMap = m as MeshStandardMaterial
        withMap.map?.dispose()
        withMap.emissiveMap?.dispose()
        m.dispose()
      }
    })
    renderer.dispose()
    renderer.forceContextLoss()
  }

  // Startpositie zodat frame 1 al klopt.
  applyProgress(0)
  curve.getPointAt(0, nozzleTarget)
  machine.poseImmediate(nozzleTarget)

  // Stille sanity-check in dev: drawRange-boekhouding moet exact op de geometrie passen.
  if (import.meta.dev) {
    const total = beadIndexCount(curve.pointCount, q.radialSegments)
    const index = beadGeometry.getIndex()
    if (index && index.count !== total) {
      console.warn(`[heroScene] beadIndexCount ${total} != geometrie-indexcount ${index.count}`)
    }
  }

  return { setActive, renderOnce, dispose }
}
