export function measureAudioLevel(samples: Float32Array) {
  if (!samples.length) return 0
  let power = 0
  for (let i = 0; i < samples.length; i++) power += samples[i] * samples[i]
  return Math.min(1, Math.sqrt(power / samples.length) * 4.5)
}

export function smoothAudioLevel(current: number, target: number, delta: number) {
  return current + (target - current) * (1 - Math.exp(-(target > current ? 30 : 10) * Math.min(delta, .1)))
}
