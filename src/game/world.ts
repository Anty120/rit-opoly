import { BufferGeometry, Float32BufferAttribute } from 'three'

export const BOARD_HALF = 4.4
export const PLAYER_RADIUS = 0.4
export const SPAWN = [0, 0, 8] as const
export const rocks = [
  { x: -10, z: -6, size: 1.6 }, { x: -12, z: -4.8, size: 0.9 },
  { x: 10, z: 2, size: 1.5 }, { x: 11.7, z: 3.2, size: 0.7 },
  { x: -13, z: 12, size: 1.1 }, { x: 14, z: -12, size: 1.2 },
  { x: 3, z: -18, size: 0.85 },
]

export function islandRadius(angle: number) {
  return 26 + Math.sin(angle * 3 + 1) * 1.1 + Math.sin(angle * 7) * 0.55
}

export function randomGenerator(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
}

// The same outline drives the mesh, grass placement, and player boundary.
export function islandGeometry() {
  const positions: number[] = []
  const colors: number[] = []
  const random = randomGenerator(73)
  const sides = 96
  const point = (i: number, layer: number) => {
    const angle = i / sides * Math.PI * 2
    const radius = islandRadius(angle) * [1, 0.96, 0.76, 0.44][layer]
    return [Math.cos(angle) * radius, [0, -1.8, -4.5, -7][layer], Math.sin(angle) * radius]
  }
  const triangle = (a: number[], b: number[], c: number[], color: number[]) => {
    positions.push(...a, ...b, ...c)
    colors.push(...color, ...color, ...color)
  }
  for (let i = 0; i < sides; i++) {
    triangle([0, 0, 0], point(i + 1, 0), point(i, 0), [0.12, 0.29, 0.22])
    for (let layer = 0; layer < 3; layer++) {
      const shade = random() * 0.12
      const color = [0.40 + shade, 0.44 + shade, 0.40 + shade]
      const a = point(i, layer), b = point(i + 1, layer)
      const c = point(i, layer + 1), d = point(i + 1, layer + 1)
      triangle(a, b, c, color)
      triangle(b, d, c, color)
    }
    triangle(point(i, 3), point(i + 1, 3), [0, -8.3, 0], [0.38, 0.42, 0.39])
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))
  geometry.computeVertexNormals()
  return geometry
}

export function constrainPlayer(x: number, z: number) {
  const half = BOARD_HALF + PLAYER_RADIUS
  if (Math.abs(x) < half && Math.abs(z) < half) {
    if (half - Math.abs(x) < half - Math.abs(z)) x = (Math.sign(x) || 1) * half
    else z = (Math.sign(z) || 1) * half
  }
  for (const rock of rocks) {
    const dx = x - rock.x, dz = z - rock.z
    const distance = Math.hypot(dx, dz)
    const radius = rock.size + PLAYER_RADIUS
    if (distance < radius) {
      x = rock.x + (distance ? dx / distance : 1) * radius
      z = rock.z + (distance ? dz / distance : 0) * radius
    }
  }
  const distance = Math.hypot(x, z)
  const limit = islandRadius(Math.atan2(z, x)) - 1.1
  if (distance > limit) { x *= limit / distance; z *= limit / distance }
  return { x, z }
}
