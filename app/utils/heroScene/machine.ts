import {
  AdditiveBlending,
  CatmullRomCurve3,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Sprite,
  SpriteMaterial,
  TubeGeometry,
  Vector3,
} from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { makeRadialTexture } from './scene'
import type { Palette } from './types'

export interface Machine {
  group: Group
  /** Beweegt de arm vloeiend naar het nozzle-doel; joints zijn gelerpt. */
  pose(nozzleTarget: Vector3, dt: number): void
  /** Zet de arm direct (zonder lerp) op het doel — voor het statische reduced-motion-frame. */
  poseImmediate(nozzleTarget: Vector3): void
}

// Afmetingen (meters), verhoudingen naar een groot 6-assig industrieel
// knikarm-portfolio (KR QUANTEC-klasse) op een lineaire as.
const SHOULDER_H = 1.0 // wereldhoogte van de schouderas (A2)
const L1 = 2.0 // bovenarm (Schwinge)
const L2 = 1.6 // onderarm t/m polscentrum
const WRIST_CLEAR = 0.52 // pols → nozzle-punt (pellet-extruder is een fors gereedschap)
const ARM_OFF = 0.24 // armvlak zit náást de draaikolom, zoals bij een echte knikarm
const IK_EPS = 0.02
const Z_AXIS = new Vector3(0, 0, 1)

function rbox(
  w: number,
  h: number,
  d: number,
  material: MeshStandardMaterial,
  radius = 0.04,
): Mesh {
  return new Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(radius, w / 2, h / 2, d / 2)), material)
}

function tube(points: Vector3[], radius: number, material: MeshStandardMaterial): Mesh {
  return new Mesh(new TubeGeometry(new CatmullRomCurve3(points), 28, radius, 10, false), material)
}

/**
 * Lineaire as: railbed, geleiderails, energieketen-goot en een slede met
 * montageplaat (bovenkant plaat op y ≈ 0.33). Gedeeld door de CAD-robot en
 * de procedurele fallback-robot.
 */
export function buildLinearAxis(
  palette: Palette,
  railLength: number,
  railZ: number,
): { group: Group; carriage: Group } {
  const black = new MeshStandardMaterial({ color: 0x17181b, roughness: 0.6, metalness: 0.35 })
  const dark = new MeshStandardMaterial({ color: palette.machineAccent, roughness: 0.55, metalness: 0.3 })
  const steel = new MeshStandardMaterial({ color: 0x4a4f57, roughness: 0.35, metalness: 0.75 })

  const group = new Group()
  const railBed = rbox(railLength, 0.18, 0.5, dark, 0.03)
  railBed.position.set(0, 0.09, railZ)
  group.add(railBed)
  for (const side of [-1, 1]) {
    const guide = rbox(railLength - 0.1, 0.035, 0.06, steel, 0.012)
    guide.position.set(0, 0.2, railZ + side * 0.15)
    group.add(guide)
  }
  const chain = rbox(railLength * 0.92, 0.11, 0.15, black, 0.03)
  chain.position.set(0, 0.08, railZ - 0.4)
  group.add(chain)
  for (const end of [-1, 1]) {
    const cap = rbox(0.08, 0.24, 0.54, black, 0.02)
    cap.position.set(end * (railLength / 2 + 0.04), 0.12, railZ)
    group.add(cap)
  }

  const carriage = new Group()
  carriage.position.set(0, 0, railZ)
  group.add(carriage)
  const plate = rbox(0.86, 0.14, 0.6, black, 0.03)
  plate.position.y = 0.26
  carriage.add(plate)

  return { group, carriage }
}

/**
 * Industriële 6-assige knikarmrobot op een lineaire as, merkloos, met een
 * pellet-extruder voor kunststof als gereedschap. Kenmerkende elementen:
 * draaikolom (A1), zijdelings gemonteerde schouder met motor (A2),
 * balanceercilinder die met de schouder meebeweegt, motorenclusters achter
 * de elleboog (A4-A6), taps toelopende onderarm, kabelpakketten — en aan de
 * pols een extruder met servomotor, granulaatslang, heater-banden en nozzle.
 */
export function buildMachine(palette: Palette, railLength: number, railZ: number): Machine {
  const body = new MeshStandardMaterial({ color: palette.machine, roughness: 0.42, metalness: 0.12 })
  const black = new MeshStandardMaterial({ color: 0x17181b, roughness: 0.6, metalness: 0.35 })
  const dark = new MeshStandardMaterial({ color: palette.machineAccent, roughness: 0.55, metalness: 0.3 })
  const steel = new MeshStandardMaterial({ color: 0x4a4f57, roughness: 0.35, metalness: 0.75 })
  const cable = new MeshStandardMaterial({ color: 0x0d0e10, roughness: 0.95, metalness: 0 })
  const hose = new MeshStandardMaterial({ color: 0xb9bec7, roughness: 0.55, metalness: 0.05 })
  // Heater-banden: mat donker met een zweem restwarmte — kunststof, geen lasboog.
  const heat = new MeshStandardMaterial({
    color: 0x33241c,
    emissive: 0x8a2f0e,
    emissiveIntensity: 0.7,
    roughness: 0.6,
  })

  const { group, carriage } = buildLinearAxis(palette, railLength, railZ)

  // Draaikolom met A1-motor op de slede.
  const saddle = rbox(0.7, 0.17, 0.56, body, 0.05)
  saddle.position.y = 0.41
  carriage.add(saddle)

  const yaw = new Group()
  yaw.position.y = 0.48
  carriage.add(yaw)
  const slewRing = new Mesh(new CylinderGeometry(0.27, 0.29, 0.09, 28), black)
  slewRing.position.y = 0.045
  yaw.add(slewRing)
  const carousel = rbox(0.54, 0.44, 0.7, body, 0.09)
  carousel.position.set(0, 0.3, 0.02)
  yaw.add(carousel)
  const a1motor = new Mesh(new CylinderGeometry(0.08, 0.08, 0.22, 18), black)
  a1motor.position.set(-0.14, 0.56, -0.22)
  yaw.add(a1motor)

  // Schouder (A2): oranje gietwerk-hub met zwarte eindkappen + motor, in het offset-armvlak.
  const shoulder = new Group()
  const shoulderPos = new Vector3(ARM_OFF, SHOULDER_H - 0.48, 0)
  shoulder.position.copy(shoulderPos)
  yaw.add(shoulder)
  const shoulderHub = new Mesh(new CylinderGeometry(0.2, 0.2, 0.22, 28), body)
  shoulderHub.rotation.z = Math.PI / 2
  shoulderHub.position.x = -0.05
  shoulder.add(shoulderHub)
  for (const [x, r] of [
    [-0.17, 0.15],
    [0.07, 0.15],
  ] as const) {
    const cap = new Mesh(new CylinderGeometry(r, r, 0.05, 28), black)
    cap.rotation.z = Math.PI / 2
    cap.position.x = x
    shoulder.add(cap)
  }
  const a2motor = new Mesh(new CylinderGeometry(0.12, 0.13, 0.28, 20), black)
  a2motor.rotation.z = Math.PI / 2
  a2motor.position.x = 0.23
  shoulder.add(a2motor)

  // Bovenarm: gegoten profiel dat naar de elleboog toe versmalt.
  const armMain = rbox(0.21, 0.4, L1 * 0.62, body, 0.08)
  armMain.position.z = L1 * 0.28
  shoulder.add(armMain)
  const armTaper = rbox(0.18, 0.3, L1 * 0.62, body, 0.07)
  armTaper.position.set(0, 0.02, L1 * 0.72)
  shoulder.add(armTaper)
  shoulder.add(
    tube(
      [
        new Vector3(0.13, 0.24, -0.06),
        new Vector3(0.11, 0.32, L1 * 0.35),
        new Vector3(0.05, 0.26, L1 * 0.72),
        new Vector3(0.0, 0.18, L1 - 0.08),
      ],
      0.032,
      cable,
    ),
  )

  // Balanceercilinder: karakteristieke diagonale cilinder tussen carrousel en
  // bovenarm die met de schouder meebeweegt (lengte per frame bijgewerkt).
  const balancer = new Group()
  const balAnchor = new Vector3(ARM_OFF - 0.02, 0.12, -0.32)
  balancer.position.copy(balAnchor)
  yaw.add(balancer)
  const balHousing = new Mesh(new CylinderGeometry(0.055, 0.05, 0.5, 18), body)
  balHousing.rotation.x = Math.PI / 2
  balHousing.position.z = 0.25
  balancer.add(balHousing)
  const balRod = new Mesh(new CylinderGeometry(0.022, 0.022, 1, 12), steel)
  balRod.rotation.x = Math.PI / 2
  balancer.add(balRod)
  const balTipLocal = new Vector3(0, 0.17, 0.55) // aanhechting op de bovenarm (schouderframe)
  const balTip = new Vector3()
  const balDir = new Vector3()

  // Elleboog (A3): oranje hub + gietblok, met het motorencluster (A4-A6)
  // dat naar achteren uitsteekt — het typerende silhouet.
  const elbow = new Group()
  elbow.position.z = L1
  shoulder.add(elbow)
  const elbowHub = new Mesh(new CylinderGeometry(0.17, 0.17, 0.2, 28), body)
  elbowHub.rotation.z = Math.PI / 2
  elbow.add(elbowHub)
  for (const x of [-0.13, 0.13]) {
    const cap = new Mesh(new CylinderGeometry(0.12, 0.12, 0.045, 28), black)
    cap.rotation.z = Math.PI / 2
    cap.position.x = x
    elbow.add(cap)
  }
  const a4block = rbox(0.24, 0.28, 0.5, body, 0.07)
  a4block.position.set(0, 0.04, -0.1)
  elbow.add(a4block)
  for (const x of [-0.06, 0.06]) {
    const motor = new Mesh(new CylinderGeometry(0.047, 0.047, 0.28, 16), black)
    motor.rotation.x = Math.PI / 2
    motor.position.set(x, 0.06, -0.46)
    elbow.add(motor)
  }

  // Onderarm: oranje buis, taps naar de zwarte polsunit.
  const forearm = new Mesh(new CylinderGeometry(0.09, 0.14, L2 - 0.35, 22), body)
  forearm.rotation.x = Math.PI / 2
  forearm.position.z = 0.14 + (L2 - 0.35) / 2
  elbow.add(forearm)
  const wristHousing = new Mesh(new CylinderGeometry(0.085, 0.09, 0.32, 22), black)
  wristHousing.rotation.x = Math.PI / 2
  wristHousing.position.z = L2 - 0.16
  elbow.add(wristHousing)
  elbow.add(
    tube(
      [
        new Vector3(0.07, 0.18, 0.1),
        new Vector3(0.04, 0.14, L2 * 0.45),
        new Vector3(0, 0.1, L2 - 0.25),
      ],
      0.03,
      cable,
    ),
  )

  // Pols (A5) + gereedschap: pellet-extruder voor kunststof — servomotor
  // bovenop, tandwielkast, zijdelingse granulaattoevoer met slang, stalen
  // barrel met heater-banden en een korte brede nozzle.
  const wrist = new Group()
  wrist.position.z = L2
  elbow.add(wrist)
  const a5hub = new Mesh(new CylinderGeometry(0.09, 0.09, 0.16, 20), black)
  a5hub.rotation.z = Math.PI / 2
  wrist.add(a5hub)
  const flange = rbox(0.18, 0.05, 0.22, black, 0.015)
  flange.position.y = -0.045
  wrist.add(flange)
  const servo = new Mesh(new CylinderGeometry(0.08, 0.08, 0.2, 20), black)
  servo.position.y = -0.17
  wrist.add(servo)
  const servoCap = new Mesh(new CylinderGeometry(0.05, 0.05, 0.03, 16), dark)
  servoCap.position.y = -0.06
  wrist.add(servoCap)
  const gearbox = rbox(0.15, 0.1, 0.15, dark, 0.03)
  gearbox.position.y = -0.315
  wrist.add(gearbox)
  const throat = rbox(0.09, 0.09, 0.09, black, 0.02)
  throat.position.set(0.09, -0.31, 0.01)
  wrist.add(throat)
  wrist.add(
    tube(
      [
        new Vector3(0.14, -0.3, 0.02),
        new Vector3(0.2, -0.13, 0.08),
        new Vector3(0.13, 0.07, -0.06),
        new Vector3(0.0, 0.04, -0.2),
      ],
      0.038,
      hose,
    ),
  )
  const barrel = new Mesh(new CylinderGeometry(0.052, 0.05, 0.16, 18), steel)
  barrel.position.y = -0.42
  wrist.add(barrel)
  for (const y of [-0.385, -0.45]) {
    const band = new Mesh(new CylinderGeometry(0.058, 0.058, 0.035, 18), heat)
    band.position.y = y
    wrist.add(band)
  }
  const nozzle = new Mesh(new ConeGeometry(0.042, 0.06, 16), steel)
  nozzle.rotation.x = Math.PI
  nozzle.position.y = -WRIST_CLEAR + 0.03
  wrist.add(nozzle)

  // Subtiele warmtegloed bij de nozzle — vers kunststof, geen vonkenboog.
  const glowTexture = makeRadialTexture('255,170,110')
  const glow = new Sprite(
    new SpriteMaterial({
      map: glowTexture,
      blending: AdditiveBlending,
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
    }),
  )
  glow.scale.setScalar(0.16)
  glow.position.y = -WRIST_CLEAR
  wrist.add(glow)

  // IK-state: huidige (gelerpte) waarden.
  const current = { x: 0, yaw: 0, shoulder: 0.6, elbow: -1.2 }
  const solved = { yaw: 0, shoulder: 0, elbow: 0 }

  function solve(target: Vector3): void {
    // Polspunt = nozzle-doel + verticale gereedschapslengte.
    const wx = target.x
    const wy = target.y + WRIST_CLEAR
    const wz = target.z
    const dx = wx - current.x
    const dzH = wz - railZ
    const dHoriz = Math.max(0.3, Math.hypot(dx, dzH))
    // Yaw-compensatie zodat het zijdelings-offset armvlak precies door het doel gaat.
    const off = Math.min(ARM_OFF, dHoriz * 0.6)
    solved.yaw = Math.atan2(dx, dzH) - Math.asin(off / dHoriz)
    const planar = Math.sqrt(Math.max(dHoriz * dHoriz - off * off, 1e-6))
    const dyH = wy - SHOULDER_H
    const d = Math.min(L1 + L2 - IK_EPS, Math.max(Math.abs(L1 - L2) + IK_EPS, Math.hypot(planar, dyH)))
    const a = Math.atan2(dyH, planar)
    const a1 = Math.acos((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))
    const b = Math.acos((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2))
    // Elevaties: bovenarm a + a1 (elbow-up), onderarm relatief -(π - b).
    solved.shoulder = a + a1
    solved.elbow = -(Math.PI - b)
  }

  function apply(): void {
    carriage.position.x = current.x
    yaw.rotation.y = current.yaw
    // Rotatie om +x kantelt lokale +z omlaag → elevatie α is rotation.x = -α.
    shoulder.rotation.x = -current.shoulder
    elbow.rotation.x = -current.elbow
    wrist.rotation.x = -(shoulder.rotation.x + elbow.rotation.x)

    // Balanceercilinder tussen carrousel en bovenarm strekken/richten.
    const rot = shoulder.rotation.x
    const cos = Math.cos(rot)
    const sin = Math.sin(rot)
    balTip.set(
      balTipLocal.x,
      balTipLocal.y * cos - balTipLocal.z * sin,
      balTipLocal.y * sin + balTipLocal.z * cos,
    ).add(shoulderPos)
    balDir.copy(balTip).sub(balAnchor)
    const len = balDir.length()
    balancer.quaternion.setFromUnitVectors(Z_AXIS, balDir.normalize())
    const rodLen = Math.max(0.08, len - 0.48)
    balRod.scale.y = rodLen
    balRod.position.z = 0.48 + rodLen / 2
  }

  function pose(nozzleTarget: Vector3, dt: number): void {
    solve(nozzleTarget)
    const k = 1 - Math.exp(-dt * 8)
    const kx = 1 - Math.exp(-dt * 6)
    current.x += (nozzleTarget.x - current.x) * kx
    current.yaw += (solved.yaw - current.yaw) * k
    current.shoulder += (solved.shoulder - current.shoulder) * k
    current.elbow += (solved.elbow - current.elbow) * k
    apply()
  }

  function poseImmediate(nozzleTarget: Vector3): void {
    current.x = nozzleTarget.x
    solve(nozzleTarget)
    current.yaw = solved.yaw
    current.shoulder = solved.shoulder
    current.elbow = solved.elbow
    apply()
  }

  return { group, pose, poseImmediate }
}
