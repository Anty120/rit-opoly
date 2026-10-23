import assert from 'node:assert/strict'
import { test } from 'node:test'
import { measureAudioLevel, smoothAudioLevel } from './audioLevel.ts'

test('one overall RMS amplitude drives the full circle', () => {
  assert.equal(measureAudioLevel(new Float32Array(1024)), 0)
  const samples = Float32Array.from({ length: 1024 }, (_, i) => .1 * Math.sin(i * Math.PI * 2 / 64))
  assert.ok(Math.abs(measureAudioLevel(samples) - .1 / Math.sqrt(2) * 4.5) < 1e-6)
  assert.equal(measureAudioLevel(new Float32Array(1024).fill(1)), 1)
  assert.ok(smoothAudioLevel(.2, .8, 1 / 30) > .2)
  assert.ok(smoothAudioLevel(.8, 0, 1 / 30) < .8)
})
