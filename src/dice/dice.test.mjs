import assert from 'node:assert/strict'
import { test } from 'node:test'
import { Euler, Vector3 } from 'three'
import { randomDie } from '../../shared/dice.ts'
import { DIE_ROTATIONS } from './diceResources.ts'

test('every dice face has exactly the same number of accepted byte outcomes', () => {
  const counts = Array(6).fill(0)
  for (let byte = 0; byte < 252; byte++) counts[randomDie(bytes => { bytes[0] = byte }) - 1]++
  assert.deepEqual(counts, [42, 42, 42, 42, 42, 42])
})
test('biased tail values are rejected before selecting a die face', () => {
  const bytes = [255, 252, 251]
  assert.equal(randomDie(buffer => { buffer[0] = bytes.shift() }), 6)
  assert.equal(bytes.length, 0)
})
test('all six rendered outcomes put the matching printed face on top', () => {
  const faces = { 1: [0, 1, 0], 2: [0, 0, 1], 3: [1, 0, 0], 4: [-1, 0, 0], 5: [0, 0, -1], 6: [0, -1, 0] }
  for (const [face, normal] of Object.entries(faces)) {
    const transformed = new Vector3(...normal).applyEuler(new Euler(...DIE_ROTATIONS[Number(face)]))
    assert.ok(transformed.distanceTo(new Vector3(0, 1, 0)) < 1e-8, `die ${face}`)
  }
})
