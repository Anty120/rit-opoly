import { BufferGeometry, Float32BufferAttribute } from 'three'
import { islandRadius, terrainHeight } from './worldConfig.ts'
export { islandRadius } from './worldConfig.ts'

// export const BOARD_HALF = 4.4
export const BOARD_HALF = 8
export const BOARD_HEIGHT = .602
export const PLAYER_RADIUS = 0.4
export const PLAYER_HEIGHT = 1.67
export const SPAWN = [0, 0, Math.max(8, BOARD_HALF + 1)] as const
export const rocks = [
  { x: -10, z: -6, size: 1.6 }, { x: -12, z: -4.8, size: 0.9 },
  { x: 10, z: 2, size: 1.5 }, { x: 11.7, z: 3.2, size: 0.7 },
  { x: -13, z: 12, size: 1.1 }, { x: 14, z: -12, size: 1.2 },
  { x: 8, z: -19, size: 0.85 },
]


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
  const sides = 160
  const point = (i: number, layer: number) => {
    const angle = i / sides * Math.PI * 2
    const radius = islandRadius(angle) * [1, 0.96, 0.76, 0.44][layer]
    const x = Math.cos(angle) * radius, z = Math.sin(angle) * radius
    return [x, layer === 0 ? terrainHeight(x, z) : [0, -1.8, -4.5, -7][layer], z]
  }
  const triangle = (a: number[], b: number[], c: number[], color: number[]) => {
    positions.push(...a, ...b, ...c)
    colors.push(...color, ...color, ...color)
  }
  for (let i = 0; i < sides; i++) {
    const top = (side: number, ring: number) => {
      const edge = point(side, 0), x = edge[0] * ring / 48, z = edge[2] * ring / 48
      return [x, terrainHeight(x, z), z]
    }
    for (let ring = 0; ring < 48; ring++) {
      const a = top(i, ring), b = top(i + 1, ring), c = top(i, ring + 1), d = top(i + 1, ring + 1)
      if (ring) triangle(a, b, c, [.12, .29, .22])
      triangle(b, d, c, [.12, .29, .22])
    }
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

