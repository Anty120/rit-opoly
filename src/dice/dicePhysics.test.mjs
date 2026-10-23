import assert from 'node:assert/strict'
import { test } from 'node:test'
import { Body } from 'cannon-es'
import { Quaternion, Vector3 } from 'three'
import { BOARD_HALF, BOARD_HEIGHT } from '../game/world.ts'
import { DICE_ROLL_MS } from '../../shared/dice.ts'
import { DIE_SIZE } from './diceResources.ts'
import { advanceDiceSimulation, createDiceSimulation, DICE_STEP, DICE_STEPS } from './dicePhysics.ts'

test('live rigid bodies travel, bounce, stay on the board and fall asleep naturally', () => {
  const corner = new Vector3(), q = new Quaternion(), half = DIE_SIZE / 2
  for (let seed = 0; seed < 20; seed++) {
    const simulation = createDiceSimulation(`room:${seed}`, [seed % 6 + 1, (seed + 2) % 6 + 1])
    const starts = simulation.bodies.map(body => body.position.clone())
    const travel = [0, 0], falling = [false, false], bounces = [0, 0]
    const previous = simulation.bodies.map(body => body.position.y)
    for (let step = 1; step <= DICE_STEPS; step++) {
      advanceDiceSimulation(simulation, step * DICE_STEP)
      simulation.bodies.forEach((body, index) => {
        const { x, y, z } = body.position
        travel[index] = Math.max(travel[index], Math.hypot(x - starts[index].x, z - starts[index].z))
        q.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w)
        for (const cx of [-half, half]) for (const cy of [-half, half]) for (const cz of [-half, half]) {
          corner.set(cx, cy, cz).applyQuaternion(q)
          assert.ok(y + corner.y > BOARD_HEIGHT - .025, 'high-speed discrete contact penetration remains bounded')
          assert.ok(Math.abs(x + corner.x) < BOARD_HALF + .025)
          assert.ok(Math.abs(z + corner.z) < BOARD_HALF + .025)
        }
        const change = y - previous[index]; previous[index] = y
        if (change < -.001) falling[index] = true
        else if (change > .001 && falling[index]) { bounces[index]++; falling[index] = false }
      })
    }
    simulation.bodies.forEach((body, index) => {
      assert.ok(travel[index] > 2, `throw ${seed} travels freely`)
      assert.ok(bounces[index] >= 1, `throw ${seed} rebounds`)
      assert.equal(body.sleepState, Body.SLEEPING, `throw ${seed} settles through physics`)
    })
  }
})

test('printed outcomes match natural landings without steering the physical motion', () => {
  const normals = { 1: [0, 1, 0], 2: [0, 0, 1], 3: [1, 0, 0], 4: [-1, 0, 0], 5: [0, 0, -1], 6: [0, -1, 0] }
  for (let value = 1; value <= 6; value++) {
    const simulation = createDiceSimulation('same-room:7', [value, value])
    advanceDiceSimulation(simulation, DICE_ROLL_MS / 1000)
    simulation.bodies.forEach((body, index) => {
      const visibleRotation = new Quaternion(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w).multiply(simulation.corrections[index])
      assert.ok(new Vector3(...normals[value]).applyQuaternion(visibleRotation).distanceTo(new Vector3(0, 1, 0)) < .02)
    })
  }
  const a = createDiceSimulation('no-steering', [1, 2]), b = createDiceSimulation('no-steering', [6, 5])
  advanceDiceSimulation(a, 4.2); advanceDiceSimulation(b, 4.2)
  a.bodies.forEach((body, index) => {
    assert.deepEqual(body.position, b.bodies[index].position)
    assert.deepEqual(body.quaternion, b.bodies[index].quaternion)
  })
})

test('physics produces identical shared motion regardless of render frame rate', () => {
  const a = createDiceSimulation('room:42', [3, 5]), b = createDiceSimulation('room:42', [3, 5])
  for (let time = 0; time < DICE_ROLL_MS / 1000; time += 1 / 30) advanceDiceSimulation(a, time)
  for (let time = 0; time < DICE_ROLL_MS / 1000; time += 1 / 144) advanceDiceSimulation(b, time)
  advanceDiceSimulation(a, DICE_ROLL_MS / 1000); advanceDiceSimulation(b, DICE_ROLL_MS / 1000)
  a.bodies.forEach((body, index) => {
    assert.deepEqual(body.position, b.bodies[index].position)
    assert.deepEqual(body.quaternion, b.bodies[index].quaternion)
  })
})
