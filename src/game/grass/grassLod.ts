function smoothstep(min: number, max: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)))
  return t * t * (3 - 2 * t)
}

export function grassDensityAtDistance(distance: number) {
  return (1 - smoothstep(14, 26, distance) * .65) * (1 - smoothstep(26, 45, distance) * .66)
}

export function grassDrawCount(capacity: number, distance: number, density: number) {
  return Math.max(0, Math.min(capacity, Math.floor(capacity * density * grassDensityAtDistance(distance))))
}
