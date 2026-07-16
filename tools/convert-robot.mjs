// Converteert de STL's uit robot-cad/ naar één compact public/models/robot.glb.
// Pipeline per onderdeel: binaire STL parsen → vertices lassen (weld) →
// decimeren (meshoptimizer) → smooth normals → glTF-node. Daarna quantize.
// Draaien: node tools/convert-robot.mjs
import { readFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Document, NodeIO } from '@gltf-transform/core'
import { KHRMeshQuantization } from '@gltf-transform/extensions'
import { quantize } from '@gltf-transform/functions'
import { MeshoptSimplifier } from 'meshoptimizer'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = join(root, 'robot-cad')
const outFile = join(root, 'public', 'models', 'robot.glb')

// nodenaam → [bestand, doel-driehoeken]
const PARTS = {
  base: ['robot voet base.stl', 8000],
  as1: ['As 1.stl', 15000],
  as2: ['As 2.stl', 10000],
  as3: ['As 3.stl', 14000],
  as4: ['As 4.stl', 5000],
  as5: ['As 5.stl', 6000],
  as6: ['As 6.stl', 2000],
  extruder: ['STL Extruder 30LD10.stl', 25000],
}

function parseBinaryStl(buf) {
  const triCount = buf.readUInt32LE(80)
  if (84 + triCount * 50 !== buf.length) throw new Error('geen binaire STL')
  const raw = new Float32Array(triCount * 9)
  for (let i = 0; i < triCount; i++) {
    const base = 84 + i * 50 + 12
    for (let f = 0; f < 9; f++) raw[i * 9 + f] = buf.readFloatLE(base + f * 4)
  }
  return raw
}

// Exact-duplicaten lassen zodat de simplifier topologie heeft.
function weld(raw) {
  const map = new Map()
  const positions = []
  const indices = new Uint32Array(raw.length / 3)
  for (let v = 0; v < raw.length / 3; v++) {
    const x = raw[v * 3]
    const y = raw[v * 3 + 1]
    const z = raw[v * 3 + 2]
    const key = `${x},${y},${z}`
    let idx = map.get(key)
    if (idx === undefined) {
      idx = positions.length / 3
      map.set(key, idx)
      positions.push(x, y, z)
    }
    indices[v] = idx
  }
  return { positions: Float32Array.from(positions), indices }
}

// Na het decimeren ongebruikte vertices weggooien en indices hernummeren.
function compact(positions, indices) {
  const remap = new Int32Array(positions.length / 3).fill(-1)
  const outPos = []
  const outIdx = new Uint32Array(indices.length)
  let next = 0
  for (let i = 0; i < indices.length; i++) {
    const v = indices[i]
    if (remap[v] === -1) {
      remap[v] = next++
      outPos.push(positions[v * 3], positions[v * 3 + 1], positions[v * 3 + 2])
    }
    outIdx[i] = remap[v]
  }
  return { positions: Float32Array.from(outPos), indices: outIdx }
}

function smoothNormals(positions, indices) {
  const normals = new Float32Array(positions.length)
  for (let t = 0; t < indices.length; t += 3) {
    const [a, b, c] = [indices[t], indices[t + 1], indices[t + 2]]
    const ax = positions[a * 3]
    const ay = positions[a * 3 + 1]
    const az = positions[a * 3 + 2]
    const ux = positions[b * 3] - ax
    const uy = positions[b * 3 + 1] - ay
    const uz = positions[b * 3 + 2] - az
    const vx = positions[c * 3] - ax
    const vy = positions[c * 3 + 1] - ay
    const vz = positions[c * 3 + 2] - az
    const nx = uy * vz - uz * vy
    const ny = uz * vx - ux * vz
    const nz = ux * vy - uy * vx
    for (const i of [a, b, c]) {
      normals[i * 3] += nx
      normals[i * 3 + 1] += ny
      normals[i * 3 + 2] += nz
    }
  }
  for (let i = 0; i < normals.length; i += 3) {
    const len = Math.hypot(normals[i], normals[i + 1], normals[i + 2]) || 1
    normals[i] /= len
    normals[i + 1] /= len
    normals[i + 2] /= len
  }
  return normals
}

await MeshoptSimplifier.ready

const doc = new Document()
doc.createExtension(KHRMeshQuantization).setRequired(true)
const buffer = doc.createBuffer()
const scene = doc.createScene('robot')

for (const [name, [file, targetTris]] of Object.entries(PARTS)) {
  const raw = parseBinaryStl(readFileSync(join(srcDir, file)))
  const welded = weld(raw)
  const targetIndexCount = Math.min(welded.indices.length, targetTris * 3)
  const [simplified, err] = MeshoptSimplifier.simplify(
    welded.indices,
    welded.positions,
    3,
    targetIndexCount,
    0.01, // toegestane fout t.o.v. bbox-diagonaal
    ['LockBorder'],
  )
  const { positions, indices } = compact(welded.positions, simplified)
  const normals = smoothNormals(positions, indices)
  const prim = doc
    .createPrimitive()
    .setAttribute(
      'POSITION',
      doc.createAccessor().setType('VEC3').setArray(positions).setBuffer(buffer),
    )
    .setAttribute(
      'NORMAL',
      doc.createAccessor().setType('VEC3').setArray(normals).setBuffer(buffer),
    )
    .setIndices(doc.createAccessor().setType('SCALAR').setArray(indices).setBuffer(buffer))
  const mesh = doc.createMesh(name).addPrimitive(prim)
  scene.addChild(doc.createNode(name).setMesh(mesh))
  console.log(
    `${name}: ${welded.indices.length / 3} → ${indices.length / 3} tris, ${positions.length / 3} verts (fout ${(err * 100).toFixed(2)}%)`,
  )
}

await doc.transform(quantize())
mkdirSync(dirname(outFile), { recursive: true })
await new NodeIO().registerExtensions([KHRMeshQuantization]).write(outFile, doc)
console.log('geschreven:', outFile)
