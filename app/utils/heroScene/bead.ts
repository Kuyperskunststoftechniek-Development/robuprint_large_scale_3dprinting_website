import { BufferAttribute, BufferGeometry } from 'three'

/**
 * Extrudeert een elliptische rups-doorsnede (breder dan hoog — de authentieke
 * platgedrukte pellet-extrusierups) langs een toolpath-polyline.
 *
 * Bewust géén TubeGeometry: Frenet-frames twisten/flippen op rechte stukken en
 * scherpe hoeken. Omdat de paden vrijwel horizontaal lopen zijn vaste
 * wereld-up-frames stabiel: side = up × tangent, vUp = tangent × side.
 *
 * Vertices en indices staan strikt op padvolgorde, zodat progressief printen
 * één setDrawRange(0, segments · radialSegments · 6) is.
 */
export function buildBeadGeometry(
  points: Float32Array,
  beadWidth: number,
  beadHeight: number,
  radialSegments: number,
): BufferGeometry {
  const n = points.length / 3
  const halfW = beadWidth / 2
  const halfH = beadHeight / 2
  const positions = new Float32Array(n * radialSegments * 3)
  const normals = new Float32Array(n * radialSegments * 3)

  // Vooraf berekende doorsnede: offsets en (ellips-)normalen per ringhoek.
  const cos = new Float32Array(radialSegments)
  const sin = new Float32Array(radialSegments)
  const nrmS = new Float32Array(radialSegments)
  const nrmU = new Float32Array(radialSegments)
  for (let a = 0; a < radialSegments; a++) {
    const ang = (a / radialSegments) * Math.PI * 2
    cos[a] = Math.cos(ang)
    sin[a] = Math.sin(ang)
    const gs = Math.cos(ang) / halfW
    const gu = Math.sin(ang) / halfH
    const gi = 1 / Math.hypot(gs, gu)
    nrmS[a] = gs * gi
    nrmU[a] = gu * gi
  }

  // Vorige stabiele frame-vectoren voor degenerate tangenten (verticale naadsprong).
  let lsx = 1
  let lsy = 0
  let lsz = 0

  for (let i = 0; i < n; i++) {
    const prev = Math.max(0, i - 1) * 3
    const next = Math.min(n - 1, i + 1) * 3
    let tx = points[next]! - points[prev]!
    let ty = points[next + 1]! - points[prev + 1]!
    let tz = points[next + 2]! - points[prev + 2]!
    const tl = Math.hypot(tx, ty, tz) || 1
    tx /= tl
    ty /= tl
    tz /= tl

    // side = worldUp × tangent
    let sx = tz
    let sy = 0
    let sz = -tx
    const sl = Math.hypot(sx, sy, sz)
    if (sl < 1e-4) {
      sx = lsx
      sy = lsy
      sz = lsz
    } else {
      sx /= sl
      sz /= sl
      lsx = sx
      lsy = sy
      lsz = sz
    }

    // vUp = tangent × side
    const ux = ty * sz - tz * sy
    const uy = tz * sx - tx * sz
    const uz = tx * sy - ty * sx

    const px = points[i * 3]!
    const py = points[i * 3 + 1]!
    const pz = points[i * 3 + 2]!
    for (let a = 0; a < radialSegments; a++) {
      const off = (i * radialSegments + a) * 3
      const cw = cos[a]! * halfW
      const ch = sin[a]! * halfH
      positions[off] = px + sx * cw + ux * ch
      positions[off + 1] = py + sy * cw + uy * ch
      positions[off + 2] = pz + sz * cw + uz * ch
      normals[off] = sx * nrmS[a]! + ux * nrmU[a]!
      normals[off + 1] = sy * nrmS[a]! + uy * nrmU[a]!
      normals[off + 2] = sz * nrmS[a]! + uz * nrmU[a]!
    }
  }

  const indices = new Uint32Array(Math.max(0, n - 1) * radialSegments * 6)
  let w = 0
  for (let i = 0; i < n - 1; i++) {
    for (let a = 0; a < radialSegments; a++) {
      const a2 = (a + 1) % radialSegments
      const v00 = i * radialSegments + a
      const v01 = i * radialSegments + a2
      const v10 = (i + 1) * radialSegments + a
      const v11 = (i + 1) * radialSegments + a2
      indices[w++] = v00
      indices[w++] = v10
      indices[w++] = v11
      indices[w++] = v00
      indices[w++] = v11
      indices[w++] = v01
    }
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(positions, 3))
  geometry.setAttribute('normal', new BufferAttribute(normals, 3))
  geometry.setIndex(new BufferAttribute(indices, 1))
  geometry.setDrawRange(0, 0)
  return geometry
}

/**
 * Tweede geometrie die dezelfde GPU-buffers deelt maar een eigen drawRange
 * heeft — gebruikt voor het gloeiende hot-end-spoor vlak achter de nozzle.
 */
export function shareBeadGeometry(source: BufferGeometry): BufferGeometry {
  const shared = new BufferGeometry()
  shared.setAttribute('position', source.getAttribute('position'))
  shared.setAttribute('normal', source.getAttribute('normal'))
  shared.setIndex(source.getIndex())
  shared.setDrawRange(0, 0)
  return shared
}
