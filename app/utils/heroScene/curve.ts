import { Curve, Vector3 } from 'three'

/**
 * Piecewise-lineaire curve over een toolpath-polyline, arc-length
 * geparametriseerd via een eenmalig opgebouwde cumulatieve-lengtetabel.
 * getPointAt(u) is een binaire zoekactie — géén updateArcLengths per frame.
 */
export class ToolpathCurve extends Curve<Vector3> {
  readonly pointCount: number
  readonly totalLength: number
  private readonly pts: Float32Array
  private readonly cum: Float32Array

  constructor(points: Float32Array) {
    super()
    this.pts = points
    this.pointCount = points.length / 3
    this.cum = new Float32Array(this.pointCount)
    let acc = 0
    for (let i = 1; i < this.pointCount; i++) {
      const a = (i - 1) * 3
      const b = i * 3
      acc += Math.hypot(
        points[b]! - points[a]!,
        points[b + 1]! - points[a + 1]!,
        points[b + 2]! - points[a + 2]!,
      )
      this.cum[i] = acc
    }
    this.totalLength = acc
  }

  /** Index van het laatste padpunt dat op arc-length-fractie u volledig bereikt is. */
  pointIndexAt(u: number): number {
    return this.searchSegment(this.clampLength(u))
  }

  override getPoint(t: number, target: Vector3 = new Vector3()): Vector3 {
    const s = this.clampLength(t)
    const lo = this.searchSegment(s)
    const hi = Math.min(lo + 1, this.pointCount - 1)
    const segLen = this.cum[hi]! - this.cum[lo]! || 1
    const f = (s - this.cum[lo]!) / segLen
    const a = lo * 3
    const b = hi * 3
    return target.set(
      this.pts[a]! + (this.pts[b]! - this.pts[a]!) * f,
      this.pts[a + 1]! + (this.pts[b + 1]! - this.pts[a + 1]!) * f,
      this.pts[a + 2]! + (this.pts[b + 2]! - this.pts[a + 2]!) * f,
    )
  }

  // getPoint is al arc-length geparametriseerd; drop de default herparametrisering.
  override getPointAt(u: number, target?: Vector3): Vector3 {
    return this.getPoint(u, target)
  }

  private clampLength(u: number): number {
    return Math.min(1, Math.max(0, u)) * this.totalLength
  }

  private searchSegment(s: number): number {
    let lo = 0
    let hi = this.pointCount - 1
    while (lo + 1 < hi) {
      const mid = (lo + hi) >> 1
      if (this.cum[mid]! <= s) lo = mid
      else hi = mid
    }
    return lo
  }
}
