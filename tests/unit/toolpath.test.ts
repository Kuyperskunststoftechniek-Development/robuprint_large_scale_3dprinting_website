import { describe, it, expect } from 'vitest'
import {
  vaseToolpath,
  panelToolpath,
  toolpathBounds,
  beadIndexCount,
  drawCountForSegments,
  VASE_DEFAULTS,
  PANEL_DEFAULTS,
} from '~/utils/heroScene/toolpath'

function segmentLength(pts: Float32Array, i: number): number {
  const a = i * 3
  const b = (i + 1) * 3
  return Math.hypot(pts[b]! - pts[a]!, pts[b + 1]! - pts[a + 1]!, pts[b + 2]! - pts[a + 2]!)
}

describe('vaseToolpath', () => {
  const pts = vaseToolpath()

  it('produces xyz triples without NaN', () => {
    expect(pts.length % 3).toBe(0)
    expect(pts.length / 3).toBe(VASE_DEFAULTS.layers * VASE_DEFAULTS.samplesPerLayer + 1)
    for (const v of pts) expect(Number.isFinite(v)).toBe(true)
  })

  it('has monotone non-decreasing height', () => {
    for (let i = 1; i < pts.length / 3; i++) {
      expect(pts[i * 3 + 1]!).toBeGreaterThanOrEqual(pts[(i - 1) * 3 + 1]!)
    }
  })

  it('keeps segment length bounded (smooth spiral)', () => {
    for (let i = 0; i < pts.length / 3 - 1; i++) {
      expect(segmentLength(pts, i)).toBeLessThan(0.08)
    }
  })

  it('reaches the expected height and radius envelope', () => {
    const { maxRadius, height } = toolpathBounds(pts)
    expect(height).toBeCloseTo(VASE_DEFAULTS.layers * VASE_DEFAULTS.layerHeight, 5)
    expect(maxRadius).toBeGreaterThan(VASE_DEFAULTS.baseRadius * 0.8)
    expect(maxRadius).toBeLessThan(VASE_DEFAULTS.baseRadius * 1.6)
  })
})

describe('panelToolpath', () => {
  const pts = panelToolpath()
  const pointsPerLayer = 2 * (PANEL_DEFAULTS.samplesPerSide + 1)

  it('produces xyz triples without NaN', () => {
    expect(pts.length % 3).toBe(0)
    expect(pts.length / 3).toBe(PANEL_DEFAULTS.layers * pointsPerLayer)
    for (const v of pts) expect(Number.isFinite(v)).toBe(true)
  })

  it('has monotone non-decreasing height', () => {
    for (let i = 1; i < pts.length / 3; i++) {
      expect(pts[i * 3 + 1]!).toBeGreaterThanOrEqual(pts[(i - 1) * 3 + 1]!)
    }
  })

  it('closes each layer loop within ~one wall width', () => {
    for (let layer = 0; layer < PANEL_DEFAULTS.layers; layer++) {
      const first = layer * pointsPerLayer
      const last = first + pointsPerLayer - 1
      const gap = Math.hypot(
        pts[last * 3]! - pts[first * 3]!,
        pts[last * 3 + 2]! - pts[first * 3 + 2]!,
      )
      expect(gap).toBeLessThanOrEqual(PANEL_DEFAULTS.wall * 1.5)
    }
  })

  it('keeps the seam jump between layers small', () => {
    for (let layer = 1; layer < PANEL_DEFAULTS.layers; layer++) {
      const i = layer * pointsPerLayer - 1 // laatste punt vorige laag
      expect(segmentLength(pts, i)).toBeLessThan(PANEL_DEFAULTS.wall * 1.5 + PANEL_DEFAULTS.layerHeight * 2)
    }
  })

  it('spans roughly the configured width', () => {
    const { maxRadius } = toolpathBounds(pts)
    expect(maxRadius).toBeGreaterThan(PANEL_DEFAULTS.width / 2 * 0.9)
    expect(maxRadius).toBeLessThan(PANEL_DEFAULTS.width / 2 * 1.4)
  })
})

describe('bead index arithmetic', () => {
  it('counts 6 indices per quad, radialSegments quads per ring step', () => {
    expect(beadIndexCount(11, 6)).toBe(10 * 6 * 6)
    expect(beadIndexCount(1, 6)).toBe(0)
    expect(beadIndexCount(0, 6)).toBe(0)
  })

  it('drawCountForSegments matches full geometry at the last segment', () => {
    const pointCount = 101
    expect(drawCountForSegments(pointCount - 1, 4)).toBe(beadIndexCount(pointCount, 4))
    expect(drawCountForSegments(0, 4)).toBe(0)
  })
})
