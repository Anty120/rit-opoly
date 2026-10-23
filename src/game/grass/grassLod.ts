function smoothstep(min: number, max: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)))
  return t * t * (3 - 2 * t)
}

export function grassDensityAtDistance(distance: number) {
  return (1 - smoothstep(14, 26, distance) * .65) * (1 - smoothstep(26, 45, distance) * .66) * (1 - smoothstep(22, 36, distance))
}

export function grassDrawCount(capacity: number, distance: number, density: number) {
  return Math.max(0, Math.min(capacity, Math.floor(capacity * density * grassDensityAtDistance(distance))))
}

// A conservative distance keeps every blade that may be visible in this patch.
// The shader applies the exact per-blade density, independently of patch boundaries.
export function grassDistanceToPatch(cameraX: number, cameraZ: number, patchX: number, patchZ: number) {
  return Math.hypot(Math.max(0, Math.abs(cameraX - patchX) - 4.5), Math.max(0, Math.abs(cameraZ - patchZ) - 4.5))
}
