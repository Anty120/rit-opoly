import assert from 'node:assert/strict'
import { test } from 'node:test'
import { BRIDGES, bridgeHeight, riverCenter, terrainHeight, islandRadius } from '../worldConfig.ts'
import { stepPlayerBody } from '../playerPhysics.ts'
import { createBridgeGeometry } from './bridgeGeometry.ts'
import { createRiverGeometry } from './waterGeometry.ts'

test('arch bridge can be crossed from both banks with feet following the rendered deck', () => {
  const bridge = BRIDGES[0]
  for (const direction of [-1, 1]) {
    const body = { x: bridge.x - direction * (bridge.halfX + 1), y: 0, z: bridge.z, velocityY: 0, grounded: true }
    let highest = 0
    for (let i = 0; i < 280; i++) {
      stepPlayerBody(body, direction * .05, 0, 1 / 120)
      highest = Math.max(highest, body.y)
      if (Math.abs(body.x - bridge.x) < bridge.halfX - .1) assert.ok(Math.abs(body.y - bridgeHeight(body.x, bridge)) < .01)
    }
    assert.ok(highest > 1.6)
    assert.ok(direction * (body.x - bridge.x) > bridge.halfX)
  }
})

test('river winds within the enlarged outline and water and bridge geometry stay finite', () => {
  assert.ok(islandRadius(0) > 40)
  assert.ok(Math.abs(riverCenter(15) - riverCenter(-15)) > 7)
  assert.ok(terrainHeight(riverCenter(15), 15) < -.4)
  for (const geometry of [createRiverGeometry(), createBridgeGeometry(BRIDGES[0]), createBridgeGeometry(BRIDGES[0], true)]) {
    assert.ok([...geometry.attributes.position.array].every(Number.isFinite))
    geometry.dispose()
  }
})
