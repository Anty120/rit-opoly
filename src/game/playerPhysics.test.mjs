import assert from 'node:assert/strict'
import { test } from 'node:test'
import { BOARD_HALF, BOARD_HEIGHT, PLAYER_RADIUS, rocks } from './world.ts'
import { DEFAULT_SETTINGS, restoreSavedSettings } from '../settings/gameSettings.ts'
import { getSupportSurface, resolvePlayerHorizontal, stepPlayerBody } from './playerPhysics.ts'

const createBody = (x, z, y = 0) => ({ x, y, z, velocityY: 0, grounded: y === 0 })
const step = (body, x = 0, z = 0) => stepPlayerBody(body, x, z, 1 / 60)
const settle = body => { for (let i = 0; i < 240; i++) step(body) }

test('board sides block walking, but can be cleared by jumping', () => {
  const body = createBody(0, 8)
  for (let i = 0; i < 120; i++) step(body, 0, -.1)
  assert.ok(body.z >= BOARD_HALF + PLAYER_RADIUS - .001)
  assert.equal(body.y, 0)
  body.velocityY = DEFAULT_SETTINGS.jumpStrength; body.grounded = false
  for (let i = 0; i < 30; i++) step(body, 0, -.1)
  settle(body)
  assert.ok(body.z < BOARD_HALF)
  assert.equal(body.y, BOARD_HEIGHT)
  assert.equal(body.grounded, true)
})

test('the player can jump again from the board and falls when walking off', () => {
  const body = createBody(0, 0, BOARD_HEIGHT)
  body.grounded = true; body.velocityY = DEFAULT_SETTINGS.jumpStrength; body.grounded = false
  for (let i = 0; i < 25; i++) step(body)
  assert.ok(body.y > BOARD_HEIGHT + 1)
  settle(body)
  assert.equal(body.y, BOARD_HEIGHT)
  for (let i = 0; i < 65; i++) step(body, .1, 0)
  assert.ok(body.x > BOARD_HALF + PLAYER_RADIUS)
  assert.equal(body.y, 0)
  assert.equal(body.grounded, true)
})

test('the player lands and rests on every rock mesh', () => {
  for (const rock of rocks) {
    const body = createBody(rock.x, rock.z, 5)
    settle(body)
    const surface = getSupportSurface(body.x, body.z)
    assert.equal(surface.kind, 'rock', `rock at ${rock.x}, ${rock.z}`)
    assert.ok(Math.abs(body.y - surface.height) < .003)
    assert.equal(body.grounded, true)
    const y = body.y
    settle(body)
    assert.ok(Math.abs(body.y - y) < .003, 'resting contact must not drift')
  }
})

test('default jump reaches rock tops from the ground', () => {
  for (const rock of rocks) {
    const body = createBody(rock.x, rock.z + rock.size + PLAYER_RADIUS + .3)
    body.velocityY = DEFAULT_SETTINGS.jumpStrength; body.grounded = false
    for (let i = 0; i < 45; i++) step(body, 0, -Math.min(.1, Math.max(0, body.z - rock.z)))
    settle(body)
    assert.equal(getSupportSurface(body.x, body.z).kind, 'rock', `jump onto ${rock.x}, ${rock.z}`)
    assert.equal(body.grounded, true)
  }
})

test('capsule collision clears elevated obstacles and blocks their sides', () => {
  assert.deepEqual(resolvePlayerHorizontal(0, 0, 2), { x: 0, z: 0 })
  assert.ok(Math.abs(resolvePlayerHorizontal(0, 0, 0).z) >= BOARD_HALF + PLAYER_RADIUS)
  for (const rock of rocks) {
    assert.deepEqual(resolvePlayerHorizontal(rock.x, rock.z, 4), { x: rock.x, z: rock.z })
    const result = resolvePlayerHorizontal(rock.x, rock.z, 0)
    assert.ok(Math.hypot(result.x - rock.x, result.z - rock.z) > .2)
  }
})

test('old default jump migrates once while deliberate custom jumps remain intact', () => {
  assert.equal(restoreSavedSettings({ jumpStrength: 5.5, grassDensity: .4 }).jumpStrength, DEFAULT_SETTINGS.jumpStrength)
  assert.equal(restoreSavedSettings({ jumpStrength: 5.5, grassDensity: .4 }).grassDensity, .4)
  assert.equal(restoreSavedSettings({ jumpStrength: 4 }).jumpStrength, 4)
  assert.equal(restoreSavedSettings({ jumpStrength: 5.5, settingsVersion: 2 }).jumpStrength, 5.5)
})
