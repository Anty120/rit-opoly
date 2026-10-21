import assert from 'node:assert/strict'
import { test } from 'node:test'
import { constrainPlayer, islandRadius, islandGeometry, BOARD_HALF, PLAYER_RADIUS, rocks, SPAWN } from './world.ts'
import { DEFAULT_SETTINGS, sanitizeSettings } from '../settings/gameSettings.ts'
import { createGrassLayout } from './grass/grassLayout.ts'
import { createGrassGeometry } from './grass/grassGeometry.ts'
import { grassDensityAtDistance, grassDistanceToPatch, grassDrawCount } from './grass/grassLod.ts'

test('the player stays inside the island in every direction', () => {
  for (let i = 0; i < 720; i++) {
    const angle = i * Math.PI / 360
    const p = constrainPlayer(Math.cos(angle) * 100, Math.sin(angle) * 100)
    assert.ok(Math.hypot(p.x, p.z) <= islandRadius(Math.atan2(p.z, p.x)) - 1.0999)
  }
})

test('the player cannot enter the board or decorative rocks', () => {
  const half = BOARD_HALF + PLAYER_RADIUS
  for (const [x, z] of [[0, half - .1], [0, -half + .1], [half - .1, 0], [-half + .1, 0]]) {
    const p = constrainPlayer(x, z)
    assert.ok(Math.abs(p.x) >= half || Math.abs(p.z) >= half)
  }
  for (const rock of rocks) {
    const p = constrainPlayer(rock.x, rock.z)
    assert.ok(Math.hypot(p.x - rock.x, p.z - rock.z) >= rock.size + PLAYER_RADIUS - 1e-6)
  }
})

test('spawn is clear and has substantial room toward the nearby edge', () => {
  assert.deepEqual(constrainPlayer(SPAWN[0], SPAWN[2]), { x: SPAWN[0], z: SPAWN[2] })
  assert.ok(islandRadius(Math.PI / 2) - 1.1 - SPAWN[2] > 15)
})

test('higher movement speeds still respect the island and board boundaries', () => {
  let x = 0, z = SPAWN[2]
  for (let i = 0; i < 600; i++) {
    const next = constrainPlayer(x, z - 18 / 60)
    x = next.x; z = next.z
    assert.ok(Math.abs(x) >= BOARD_HALF + PLAYER_RADIUS || Math.abs(z) >= BOARD_HALF + PLAYER_RADIUS)
  }
  for (let i = 0; i < 600; i++) {
    const next = constrainPlayer(x + 18 / 60, z)
    x = next.x; z = next.z
    assert.ok(Math.hypot(x, z) <= islandRadius(Math.atan2(z, x)) - 1.0999)
  }
})

test('settings are validated and faster defaults are restored safely', () => {
  assert.equal(DEFAULT_SETTINGS.walkSpeed, 6)
  assert.equal(DEFAULT_SETTINGS.runSpeed, 10)
  assert.deepEqual(sanitizeSettings(null), DEFAULT_SETTINGS)
  const settings = sanitizeSettings({ walkSpeed: 999, grassDensity: -20, grassHeight: NaN, grassColor: 'bad', grassShadows: 'false', adaptiveQuality: false })
  assert.equal(settings.walkSpeed, 12)
  assert.equal(settings.grassDensity, .25)
  assert.equal(settings.grassHeight, DEFAULT_SETTINGS.grassHeight)
  assert.equal(settings.grassColor, DEFAULT_SETTINGS.grassColor)
  assert.equal(settings.grassShadows, true)
  assert.equal(settings.adaptiveQuality, false)
  assert.equal(settings.grassSwaySpeed, DEFAULT_SETTINGS.grassSwaySpeed)
})

test('grass detail decreases smoothly with distance and draw counts stay bounded', () => {
  let previous = 1
  for (let distance = 0; distance <= 60; distance += .25) {
    const density = grassDensityAtDistance(distance)
    assert.ok(density <= previous && density > 0)
    assert.ok(grassDrawCount(9000, distance, 1) <= 9000)
    previous = density
  }
  assert.ok(grassDrawCount(9000, 40, .85) < grassDrawCount(9000, 10, .85) / 4)
  assert.equal(grassDrawCount(9000, 10, .25), 2250)
  const geometry = createGrassGeometry(2)
  assert.equal(geometry.attributes.position.count, 5)
  assert.equal(geometry.index.count, 9)
  geometry.dispose()
})

test('patch draw limits keep every blade needed by continuous per-blade density', () => {
  const capacity = 9000, density = .85
  for (const cameraX of [-30, -4, 0, 4, 15, 30]) {
    for (const patchX of [-8, 0, 8]) {
      const nearest = grassDistanceToPatch(cameraX, 17, patchX, 0)
      const limit = Math.min(capacity, grassDrawCount(capacity, nearest, density) + Math.ceil(capacity * .02))
      for (let rootX = patchX - 4; rootX <= patchX + 4; rootX += .5) {
        for (let rootZ = -4; rootZ <= 4; rootZ += .5) {
          const distance = Math.hypot(cameraX - rootX, 17 - rootZ)
          const required = Math.min(capacity, Math.floor(capacity * (density * grassDensityAtDistance(distance) + .02)))
          assert.ok(limit >= required)
        }
      }
    }
  }
})

test('grass patches are deterministic and exclude the board, rocks, and island edge', () => {
  const patches = createGrassLayout()
  assert.ok(patches.length > 20 && patches.length <= 49)
  let total = 0
  for (const patch of patches) {
    total += patch.count
    assert.equal(patch.matrices.length, patch.count * 16)
    for (let i = 0; i < patch.count; i++) {
      const x = patch.x + patch.matrices[i * 16 + 12], z = patch.z + patch.matrices[i * 16 + 14]
      assert.ok(Math.hypot(x, z) <= islandRadius(Math.atan2(z, x)) - .1499)
      assert.ok(Math.abs(x) >= 4.4999 || Math.abs(z) >= 4.4999)
      assert.ok(rocks.every(rock => Math.hypot(x - rock.x, z - rock.z) >= rock.size * .76 - .0001))
      assert.ok(patch.matrices[i * 16 + 5] > 0)
    }
  }
  assert.ok(total > 250000 && total < 330000)
  const repeat = createGrassLayout()
  assert.deepEqual(patches[0].matrices, repeat[0].matrices)
})

test('generated island positions and normals are finite', () => {
  const geometry = islandGeometry()
  assert.ok([...geometry.attributes.position.array].every(Number.isFinite))
  assert.ok([...geometry.attributes.normal.array].every(Number.isFinite))
  geometry.dispose()
})
