// Pure toolpath-wiskunde — geen three-import, unit-testbaar zonder WebGL.
// Elke toolpath is één doorlopende polyline van xyz-triples (y-up, meters),
// zodat de hele print als één curve + één groeiende drawRange te animeren is.

export interface VaseParams {
  layers: number
  samplesPerLayer: number
  baseRadius: number
  layerHeight: number
  waveAmp: number
  waveLobes: number
  twist: number
}

export const VASE_DEFAULTS: VaseParams = {
  layers: 110,
  samplesPerLayer: 96,
  baseRadius: 0.42,
  layerHeight: 0.011,
  waveAmp: 0.07,
  waveLobes: 7,
  twist: 2.5,
}

/**
 * Gespiraliseerde "vase mode"-toolpath: één continue spiraal omhoog.
 * Radius = silhouetprofiel (voet → buik → hals) × golfmodulatie met twist.
 */
export function vaseToolpath(c: VaseParams = VASE_DEFAULTS): Float32Array {
  const total = c.layers * c.samplesPerLayer
  const out = new Float32Array((total + 1) * 3)
  for (let i = 0; i <= total; i++) {
    const layer = i / c.samplesPerLayer
    const u = layer / c.layers
    const theta = layer * Math.PI * 2
    const profile = 0.85 + 0.35 * Math.sin(Math.PI * Math.pow(u, 0.8)) - 0.15 * u
    const wave = 1 + c.waveAmp * Math.cos(c.waveLobes * theta + c.twist * u)
    const r = c.baseRadius * profile * wave
    const o = i * 3
    out[o] = r * Math.cos(theta)
    out[o + 1] = c.layerHeight * layer
    out[o + 2] = r * Math.sin(theta)
  }
  return out
}

export interface PanelParams {
  layers: number
  samplesPerSide: number
  width: number
  wall: number
  layerHeight: number
  camber0: number
  camber1: number
  taper: number
  lean: number
}

export const PANEL_DEFAULTS: PanelParams = {
  layers: 60,
  samplesPerSide: 72,
  width: 4.2,
  wall: 0.09,
  layerHeight: 0.045,
  camber0: 0.35,
  camber1: 0.75,
  taper: 0.12,
  lean: 0.25,
}

/**
 * Dubbelgekromd gevelpaneel/rompschaal: per laag een gesloten dunne wandlus
 * (buitenzijde heen, binnenzijde terug), camber en lean variëren met de hoogte.
 * De sprong naar de volgende laag vormt de naad — zoals bij een echte print.
 */
export function panelToolpath(c: PanelParams = PANEL_DEFAULTS): Float32Array {
  const pts: number[] = []
  for (let layer = 0; layer < c.layers; layer++) {
    const u = c.layers > 1 ? layer / (c.layers - 1) : 0
    const y = layer * c.layerHeight
    const w = c.width * (1 - c.taper * u)
    const camber = c.camber0 + (c.camber1 - c.camber0) * Math.sin(Math.PI * u)
    const lean = c.lean * u * u
    for (let i = 0; i <= c.samplesPerSide; i++) {
      pushOffset(pts, i / c.samplesPerSide, +c.wall / 2, y, w, camber, lean)
    }
    for (let i = c.samplesPerSide; i >= 0; i--) {
      pushOffset(pts, i / c.samplesPerSide, -c.wall / 2, y, w, camber, lean)
    }
  }
  return Float32Array.from(pts)
}

// Middenlijn in het grondvlak: x(t) = (t-0.5)·w, z(t) = camber·(1-(2t-1)²) + lean.
// Offset ± wall/2 langs de analytische normaal (geen numerieke differentiatie).
function pushOffset(
  pts: number[],
  t: number,
  off: number,
  y: number,
  w: number,
  camber: number,
  lean: number,
): void {
  const s = 2 * t - 1
  const cx = s * (w / 2)
  const cz = camber * (1 - s * s) + lean
  const dx = w
  const dz = -4 * camber * s
  const inv = 1 / Math.hypot(dx, dz)
  pts.push(cx + -dz * inv * off, y, cz + dx * inv * off)
}

export interface ToolpathBounds {
  maxRadius: number
  height: number
}

export function toolpathBounds(points: Float32Array): ToolpathBounds {
  let maxRadius = 0
  let height = 0
  for (let i = 0; i < points.length; i += 3) {
    const r = Math.hypot(points[i]!, points[i + 2]!)
    if (r > maxRadius) maxRadius = r
    if (points[i + 1]! > height) height = points[i + 1]!
  }
  return { maxRadius, height }
}

/** Totaal aantal indices van de rupsgeometrie (6 indices per quad, radialSegments quads per ringstap). */
export function beadIndexCount(pointCount: number, radialSegments: number): number {
  return Math.max(0, pointCount - 1) * radialSegments * 6
}

/** drawRange-count voor een aantal volledig getekende padsegmenten. Let op: indices, geen vertices. */
export function drawCountForSegments(segments: number, radialSegments: number): number {
  return Math.max(0, segments) * radialSegments * 6
}
