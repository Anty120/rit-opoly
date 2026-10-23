import { Body, Box, ContactMaterial, GSSolver, Material, Vec3, World } from 'cannon-es'
import { Quaternion, Vector3 } from 'three'
import { DICE_ROLL_MS } from '../../shared/dice.ts'
import { BOARD_HALF, BOARD_HEIGHT } from '../game/world.ts'
import { DIE_SIZE } from './diceResources.ts'

export const DICE_STEP = 1 / 120
export const DICE_STEPS = Math.round(DICE_ROLL_MS / 1000 / DICE_STEP)
const NORMALS: Record<number, [number, number, number]> = {
  1: [0, 1, 0], 2: [0, 0, 1], 3: [1, 0, 0],
  4: [-1, 0, 0], 5: [0, 0, -1], 6: [0, -1, 0],
}
export interface DiceSimulation { world: World; bodies: Body[]; corrections: Quaternion[]; steps: number }

function containFastContacts(body: Body) {
  if (body.sleepState === Body.SLEEPING) return
  const { x, y, z, w } = body.quaternion, half = DIE_SIZE / 2
  const ex = half * (Math.abs(1 - 2 * (y * y + z * z)) + Math.abs(2 * (x * y - w * z)) + Math.abs(2 * (x * z + w * y)))
  const ey = half * (Math.abs(2 * (x * y + w * z)) + Math.abs(1 - 2 * (x * x + z * z)) + Math.abs(2 * (y * z - w * x)))
  const ez = half * (Math.abs(2 * (x * z - w * y)) + Math.abs(2 * (y * z + w * x)) + Math.abs(1 - 2 * (x * x + y * y)))
  // Retain a small contact overlap for the solver while preventing a fast
  // corner from visibly passing through the thin board between discrete steps.
  body.position.y = Math.max(body.position.y, BOARD_HEIGHT + ey - .015)
  body.position.x = Math.max(-BOARD_HALF + ex - .015, Math.min(BOARD_HALF - ex + .015, body.position.x))
  body.position.z = Math.max(-BOARD_HALF + ez - .015, Math.min(BOARD_HALF - ez + .015, body.position.z))
  body.aabbNeedsUpdate = true
}

function randomSource(key: string) {
  let state = 2166136261
  for (let i = 0; i < key.length; i++) state = Math.imul(state ^ key.charCodeAt(i), 16777619)
  return () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296 }
}

function createWorld(key: string, idle = false) {
  const random = randomSource(key), solver = new GSSolver()
  solver.iterations = 14; solver.tolerance = 1e-7
  const world = new World({ gravity: new Vec3(0, -24, 0), allowSleep: true, solver })
  const boardMaterial = new Material('board'), dieMaterial = new Material('dice')
  world.addContactMaterial(new ContactMaterial(boardMaterial, dieMaterial, { friction: .32, restitution: .54, contactEquationRelaxation: 4 }))
  world.addContactMaterial(new ContactMaterial(dieMaterial, dieMaterial, { friction: .28, restitution: .58 }))
  world.addBody(new Body({ mass: 0, material: boardMaterial, shape: new Box(new Vec3(BOARD_HALF, .25, BOARD_HALF)), position: new Vec3(0, BOARD_HEIGHT - .25, 0) }))
  for (const sign of [-1, 1]) {
    world.addBody(new Body({ mass: 0, material: boardMaterial, shape: new Box(new Vec3(.2, 4, BOARD_HALF + .4)), position: new Vec3(sign * (BOARD_HALF + .2), BOARD_HEIGHT + 4, 0) }))
    world.addBody(new Body({ mass: 0, material: boardMaterial, shape: new Box(new Vec3(BOARD_HALF + .4, 4, .2)), position: new Vec3(0, BOARD_HEIGHT + 4, sign * (BOARD_HALF + .2)) }))
  }
  const bodies = [0, 1].map(index => {
    const body = new Body({ mass: 1, material: dieMaterial, shape: new Box(new Vec3(DIE_SIZE / 2, DIE_SIZE / 2, DIE_SIZE / 2)),
      linearDamping: .08, angularDamping: .12, allowSleep: true, sleepSpeedLimit: .22, sleepTimeLimit: .22 })
    if (idle) {
      body.position.set(index === 0 ? -.55 : .55, BOARD_HEIGHT + DIE_SIZE / 2, BOARD_HALF * .55)
      body.sleep()
    } else {
      body.position.set((index === 0 ? -.65 : .65) + (random() - .5) * .4, BOARD_HEIGHT + 1.2 + random() * .35, BOARD_HALF * .6 + random() * .3)
      body.quaternion.setFromEuler(random() * Math.PI * 2, random() * Math.PI * 2, random() * Math.PI * 2)
      body.velocity.set((random() - .5) * 10, 4 + random() * 3, -5.5 - random() * 4)
      body.angularVelocity.set((random() - .5) * 30, (random() - .5) * 24, (random() - .5) * 30)
    }
    world.addBody(body)
    return body
  })
  return { world, bodies }
}

export function advanceDiceSimulation(simulation: DiceSimulation, seconds: number) {
  const target = Math.min(DICE_STEPS, Math.max(0, Math.floor(seconds / DICE_STEP + 1e-6)))
  while (simulation.steps < target) {
    if (simulation.bodies[0].sleepState === Body.SLEEPING && simulation.bodies[1].sleepState === Body.SLEEPING) {
      simulation.steps = target; return
    }
    simulation.world.step(DICE_STEP)
    containFastContacts(simulation.bodies[0]); containFastContacts(simulation.bodies[1])
    simulation.steps++
  }
}

export function createDiceSimulation(key: string, values: readonly [number, number], idle = false): DiceSimulation {
  if (idle) return { ...createWorld(key, true), corrections: [new Quaternion(), new Quaternion()], steps: DICE_STEPS }
  // Predict only to assign printed faces before launch. The visible dice then
  // run the same live box-body simulation, with no steering toward an outcome.
  const preview: DiceSimulation = { ...createWorld(key), corrections: [], steps: 0 }
  advanceDiceSimulation(preview, DICE_ROLL_MS / 1000)
  const worldNormal = new Vec3(), localNormal = new Vec3()
  const corrections = preview.bodies.map((body, index) => {
    let highest = -Infinity, top: [number, number, number] = [0, 1, 0]
    for (const normal of Object.values(NORMALS)) {
      localNormal.set(...normal); body.quaternion.vmult(localNormal, worldNormal)
      if (worldNormal.y > highest) { highest = worldNormal.y; top = normal }
    }
    // Cube symmetry preserves the collision shape, opposite faces and geometry.
    return new Quaternion().setFromUnitVectors(new Vector3(...NORMALS[values[index]]), new Vector3(...top))
  })
  return { ...createWorld(key), corrections, steps: 0 }
}
