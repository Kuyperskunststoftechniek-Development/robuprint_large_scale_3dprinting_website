import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CapsuleGeometry,
  Fog,
  Group,
  HemisphereLight,
  DirectionalLight,
  LineBasicMaterial,
  LineDashedMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  Scene,
  SphereGeometry,
} from 'three'
import type { HeroTheme, Palette } from './types'

// Hexen spiegelen tokens.css: bg #FBFAF8, accent #1652F0, hero-lichtblauw #A9C2FF.
export const PALETTES: Record<HeroTheme, Palette> = {
  light: {
    fog: 0xfbfaf8,
    grid: 0x1652f0,
    gridOpacity: 0.1,
    envelope: 0x1652f0,
    bead: 0xe7e2d6,
    beadHot: 0xeadbc0, // vers gesmolten kunststof: warm, glanzend
    machine: 0xf25400, // industrieel robot-oranje (merkloos)
    machineAccent: 0x2b2e34, // antraciet gietwerk/motoren
    figure: 0x5b6470,
    ground: 0xfbfaf8,
    hemiSky: 0xffffff,
    hemiGround: 0xd8d4ca,
    hemiIntensity: 1.15,
    dir: 0xffffff,
    dirIntensity: 2.2,
    shadowOpacity: 0.22,
  },
  dark: {
    fog: 0x0b0e14,
    grid: 0xa9c2ff,
    gridOpacity: 0.08,
    envelope: 0xa9c2ff,
    bead: 0xdfe4ee,
    beadHot: 0xf2e4c9, // vers gesmolten kunststof: warm, glanzend
    machine: 0xff5f13, // industrieel robot-oranje (merkloos), iets warmer voor donkere scène
    machineAccent: 0x474d58, // antraciet gietwerk/motoren, iets opgelicht voor leesbaarheid
    figure: 0x8a93a3,
    ground: 0x0b0e14,
    hemiSky: 0xb6c8ef,
    hemiGround: 0x2b3145,
    hemiIntensity: 2,
    dir: 0xeff3ff,
    dirIntensity: 3,
    shadowOpacity: 0.5,
  },
}

/** Radiale gradient-CanvasTexture (glow-sprite, contactschaduw) — CSP-veilig, geen extern asset. */
export function makeRadialTexture(rgb: string, size = 128): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, `rgba(${rgb},1)`)
  g.addColorStop(0.4, `rgba(${rgb},0.45)`)
  g.addColorStop(1, `rgba(${rgb},0)`)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  return new CanvasTexture(canvas)
}

function gridLines(size: number, step: number, y: number): BufferGeometry {
  const half = size / 2
  const count = Math.floor(size / step) + 1
  const positions = new Float32Array(count * 2 * 2 * 3)
  let o = 0
  for (let i = 0; i < count; i++) {
    const p = -half + i * step
    positions.set([p, y, -half, p, y, half], o)
    o += 6
    positions.set([-half, y, p, half, y, p], o)
    o += 6
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(positions, 3))
  return geometry
}

/** Blauwdruk-vloerraster: fijn grid + zwaardere hoofdlijnen, echo van .blueprint-grid. */
function buildBlueprintGrid(palette: Palette): Group {
  const group = new Group()
  const minor = new LineSegments(
    gridLines(30, 0.5, 0),
    new LineBasicMaterial({ color: palette.grid, transparent: true, opacity: palette.gridOpacity }),
  )
  const major = new LineSegments(
    gridLines(30, 2.5, 0.001),
    new LineBasicMaterial({ color: palette.grid, transparent: true, opacity: palette.gridOpacity * 1.8 }),
  )
  group.add(minor, major)
  return group
}

/** Gestippelde 4×4×8 m envelope-omtrek — echo van de envelope-SchemIllustration. */
function buildEnvelopeOutline(palette: Palette): LineSegments {
  const x = 4
  const z = 2
  const h = 4
  const post = 1.2
  const segments: number[] = [
    // grondvlak-rechthoek
    -x, 0, -z, x, 0, -z,
    x, 0, -z, x, 0, z,
    x, 0, z, -x, 0, z,
    -x, 0, z, -x, 0, -z,
    // korte hoekstaanders die de bouwhoogte suggereren
    -x, 0, -z, -x, post, -z,
    x, 0, -z, x, post, -z,
    x, 0, z, x, post, z,
    -x, 0, z, -x, post, z,
    // één volledige staander + topaanduiding als hoogte-cue
    -x, post, -z, -x, h, -z,
    -x, h, -z, -x + 1.2, h, -z,
  ]
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(Float32Array.from(segments), 3))
  const line = new LineSegments(
    geometry,
    new LineDashedMaterial({
      color: palette.envelope,
      transparent: true,
      opacity: 0.4,
      dashSize: 0.12,
      gapSize: 0.08,
    }),
  )
  line.computeLineDistances()
  return line
}

/** Gestileerde menselijke figuur (~1,8 m) als schaal-cue naast het paneel. */
export function buildScaleFigure(palette: Palette): Group {
  const group = new Group()
  const material = new MeshStandardMaterial({ color: palette.figure, roughness: 0.9 })
  const legL = new Mesh(new CapsuleGeometry(0.07, 0.62, 4, 12), material)
  legL.position.set(-0.09, 0.45, 0)
  const legR = legL.clone()
  legR.position.x = 0.09
  const torso = new Mesh(new CapsuleGeometry(0.16, 0.5, 4, 12), material)
  torso.position.y = 1.16
  const head = new Mesh(new SphereGeometry(0.11, 16, 12), material)
  head.position.y = 1.68
  group.add(legL, legR, torso, head)
  return group
}

/** Zachte contactschaduw onder het object: radiale gradient op een transparant vlak. */
export function buildContactShadow(palette: Palette, radius: number): Mesh {
  const texture = makeRadialTexture('10,10,14')
  const mesh = new Mesh(
    new PlaneGeometry(radius * 2, radius * 2),
    new MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: palette.shadowOpacity,
      depthWrite: false,
    }),
  )
  mesh.rotation.x = -Math.PI / 2
  mesh.position.y = 0.002
  return mesh
}

export interface Environment {
  scene: Scene
}

/** Scenegraph-basis: fog, licht, vloer, blauwdrukraster en envelope-omtrek. */
export function buildEnvironment(palette: Palette, withShadows: boolean): Environment {
  const scene = new Scene()
  scene.background = null // CSS levert de achtergrondkleur (renderer alpha: true)
  scene.fog = new Fog(palette.fog, 9, 24)

  const hemi = new HemisphereLight(palette.hemiSky, palette.hemiGround, palette.hemiIntensity)
  const dir = new DirectionalLight(palette.dir, palette.dirIntensity)
  dir.position.set(4, 7, 3)
  if (withShadows) {
    dir.castShadow = true
    dir.shadow.mapSize.set(1024, 1024)
    dir.shadow.camera.left = -6
    dir.shadow.camera.right = 6
    dir.shadow.camera.top = 6
    dir.shadow.camera.bottom = -6
  }
  scene.add(hemi, dir)

  // Vloer exact in fog-kleur en ongelicht, zodat hij naadloos in de
  // CSS-achtergrond overloopt — geen zichtbare horizonlijn.
  const ground = new Mesh(
    new PlaneGeometry(60, 60),
    new MeshBasicMaterial({ color: palette.fog }),
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.005
  scene.add(ground)

  scene.add(buildBlueprintGrid(palette))
  scene.add(buildEnvelopeOutline(palette))
  return { scene }
}
