import {
  AdditiveBlending,
  Group,
  Mesh,
  MeshStandardMaterial,
  Sprite,
  SpriteMaterial,
  Vector3,
} from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { buildLinearAxis, type Machine } from './machine'
import { makeRadialTexture } from './scene'
import type { Palette } from './types'

/**
 * Echte robot van de gebruiker: per as geëxporteerde CAD-delen
 * (public/models/robot.glb, gegenereerd door tools/convert-robot.mjs),
 * gescharnierd rond de uit de assembly afgeleide draaipunten en aangestuurd
 * met dezelfde 2-link-IK als de fallback-robot.
 *
 * Assembly-ruimte: millimeters, z-omhoog, robot kijkt langs +x.
 */

// Draaipunten in assembly-coördinaten (mm) — gekalibreerd op de bounding boxes.
const P2 = new Vector3(700, 0, 630) // A2 schouder-pitch
const P3 = new Vector3(650, 0, 1960) // A3 elleboog-pitch
const P5 = new Vector3(2246, 0, 2015) // A5 pols-pitch
const FLANGE_X = 2365 // flensvlak (x) op de hoogte van A5

// Extruder-plaatsing in het flensframe (mm): om de as z geroteerd zodat de
// lange as (y) langs de flensnormaal valt; nozzle-einde op lokaal y = -423.
const EXT_ROT_Z = Math.PI / 2
const EXT_X = 200 // langs de flensnormaal naar buiten (motor vrij van de pols)
const EXT_Z = -80 // montageplaat (z 0..160) centreren
const EXT_NOZZLE = 423 // afstand flensframe-origin → nozzletip langs de normaal

const PLATE_TOP = 0.33 // bovenkant sledeplaat (wereld, m) — robotvoet staat hierop
const MM = 0.001

// Kinematiek (m) afgeleid uit de draaipunten.
const R0 = P2.x * MM // radiale offset A1-as → schouder
const SHOULDER_H = PLATE_TOP + P2.z * MM
const L1 = P3.clone().sub(P2).length() * MM
const L2 = P5.clone().sub(P3).length() * MM
const REST1 = Math.atan2(P3.z - P2.z, P3.x - P2.x) // elevatie bovenarm in exportpose
const REST2 = Math.atan2(P5.z - P3.z, P5.x - P3.x) // elevatie onderarm in exportpose
const WRIST_CLEAR = (FLANGE_X - P5.x + EXT_X + EXT_NOZZLE) * MM
const IK_EPS = 0.02

const PART_STYLE: Record<string, 'body' | 'dark' | 'black' | 'steel'> = {
  base: 'dark',
  as1: 'body',
  as2: 'body',
  as3: 'body',
  as4: 'body',
  as5: 'black',
  as6: 'black',
  extruder: 'steel',
}

export async function buildCadMachine(
  palette: Palette,
  railLength: number,
  railZ: number,
): Promise<Machine> {
  const gltf = await new GLTFLoader().loadAsync('/models/robot.glb')

  const materials = {
    body: new MeshStandardMaterial({ color: palette.machine, roughness: 0.45, metalness: 0.15 }),
    dark: new MeshStandardMaterial({ color: palette.machineAccent, roughness: 0.55, metalness: 0.3 }),
    black: new MeshStandardMaterial({ color: 0x17181b, roughness: 0.6, metalness: 0.35 }),
    steel: new MeshStandardMaterial({ color: 0x3a3e45, roughness: 0.4, metalness: 0.6 }),
  }
  // Belangrijk: de glTF-nodes dragen zelf de dequantisatie-TRS (quantize in de
  // converter). Nooit node-transforms overschrijven — elk deel gaat in een
  // wrapper-groep die de pivot-offset draagt.
  const part = (name: string, offset?: Vector3): Group => {
    const node = gltf.scene.getObjectByName(name)
    if (!node) throw new Error(`robot.glb mist node '${name}'`)
    node.traverse((obj) => {
      const mesh = obj as Mesh
      if (mesh.isMesh) mesh.material = materials[PART_STYLE[name]!]
    })
    const holder = new Group()
    if (offset) holder.position.copy(offset).negate()
    holder.add(node)
    return holder
  }

  const { group, carriage } = buildLinearAxis(palette, railLength, railZ)

  // Assembly-wrapper: mm → m en z-omhoog → y-omhoog.
  const assembly = new Group()
  assembly.scale.setScalar(MM)
  assembly.rotation.x = -Math.PI / 2
  assembly.position.y = PLATE_TOP
  carriage.add(assembly)

  assembly.add(part('base'))

  const yawG = new Group()
  yawG.name = 'yawG'
  assembly.add(yawG)
  yawG.add(part('as1'))

  const shoulderG = new Group()
  shoulderG.name = 'shoulderG'
  shoulderG.position.copy(P2)
  yawG.add(shoulderG)
  shoulderG.add(part('as2', P2))

  const elbowG = new Group()
  elbowG.name = 'elbowG'
  elbowG.position.copy(P3).sub(P2)
  shoulderG.add(elbowG)
  elbowG.add(part('as3', P3))
  elbowG.add(part('as4', P3))

  const wristG = new Group()
  wristG.name = 'wristG'
  wristG.position.copy(P5).sub(P3)
  elbowG.add(wristG)
  wristG.add(part('as5', P5))
  wristG.add(part('as6', P5))

  const flangeG = new Group()
  flangeG.name = 'flangeG'
  flangeG.position.set(FLANGE_X - P5.x, 0, 0)
  wristG.add(flangeG)
  const extruder = part('extruder')
  extruder.rotation.z = EXT_ROT_Z
  extruder.position.set(EXT_X, 0, EXT_Z)
  flangeG.add(extruder)

  // Subtiele warmtegloed op de nozzletip (sprite-schaal in mm binnen de assembly).
  const glow = new Sprite(
    new SpriteMaterial({
      map: makeRadialTexture('255,170,110'),
      blending: AdditiveBlending,
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
    }),
  )
  glow.scale.setScalar(160)
  glow.position.set(EXT_X + EXT_NOZZLE, 0, EXT_Z + 80)
  flangeG.add(glow)

  // IK-state: huidige (gelerpte) waarden.
  const current = { x: 0, yaw: 0, t2: 0, t3: 0 }
  const solved = { yaw: 0, t2: 0, t3: 0 }

  function solve(target: Vector3): void {
    const wx = target.x
    const wy = target.y + WRIST_CLEAR
    const wz = target.z
    const dx = wx - current.x
    const dzH = wz - railZ
    const dHoriz = Math.max(0.3, Math.hypot(dx, dzH))
    solved.yaw = Math.atan2(-dzH, dx)
    const planar = Math.max(0.15, dHoriz - R0)
    const dy = wy - SHOULDER_H
    const d = Math.min(L1 + L2 - IK_EPS, Math.max(Math.abs(L1 - L2) + IK_EPS, Math.hypot(planar, dy)))
    const a = Math.atan2(dy, planar)
    const a1 = Math.acos((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))
    const b = Math.acos((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2))
    const e1 = a + a1 // elevatie bovenarm (elbow-up)
    const e2 = e1 - (Math.PI - b) // elevatie onderarm
    // Rotatie om +y (assembly) kantelt +x omlaag → θ = rustelevatie − doelelevatie.
    solved.t2 = REST1 - e1
    solved.t3 = REST2 - solved.t2 - e2
  }

  function apply(): void {
    carriage.position.x = current.x
    yawG.rotation.z = current.yaw
    shoulderG.rotation.y = current.t2
    elbowG.rotation.y = current.t3
    // A5 houdt de flens (en dus de extruder) exact verticaal omlaag.
    wristG.rotation.y = Math.PI / 2 - current.t2 - current.t3
  }

  function pose(nozzleTarget: Vector3, dt: number): void {
    solve(nozzleTarget)
    const k = 1 - Math.exp(-dt * 8)
    const kx = 1 - Math.exp(-dt * 6)
    current.x += (nozzleTarget.x - current.x) * kx
    current.yaw += (solved.yaw - current.yaw) * k
    current.t2 += (solved.t2 - current.t2) * k
    current.t3 += (solved.t3 - current.t3) * k
    apply()
  }

  function poseImmediate(nozzleTarget: Vector3): void {
    current.x = nozzleTarget.x
    solve(nozzleTarget)
    current.yaw = solved.yaw
    current.t2 = solved.t2
    current.t3 = solved.t3
    apply()
  }

  poseImmediate(new Vector3(0, 0.5, 0))
  return { group, pose, poseImmediate }
}
