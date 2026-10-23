import { BufferGeometry, Float32BufferAttribute } from 'three'
import { RIVER, riverCenter, riverEdgeZ } from '../worldConfig.ts'

function ribbon(columns: number, rows: number, point: (u: number, v: number) => number[]) {
  const positions: number[] = [], uvs: number[] = [], indices: number[] = []
  for (let row = 0; row <= rows; row++) for (let column = 0; column <= columns; column++) {
    const u = column / columns, v = row / rows
    positions.push(...point(u, v)); uvs.push(u, v)
  }
  for (let row = 0; row < rows; row++) for (let column = 0; column < columns; column++) {
    const a = row * (columns + 1) + column, b = a + columns + 1
    indices.push(a, b, a + 1, a + 1, b, b + 1)
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  return geometry
}

export function createRiverGeometry() {
  const columns = 8
  const starts = Array.from({ length: columns + 1 }, (_, i) => riverEdgeZ(i / columns * 2 - 1, -1))
  const ends = Array.from({ length: columns + 1 }, (_, i) => riverEdgeZ(i / columns * 2 - 1, 1))
  return ribbon(columns, 128, (u, v) => {
    const column = Math.round(u * columns), z = starts[column] + (ends[column] - starts[column]) * v
    return [riverCenter(z) + (u * 2 - 1) * RIVER.halfWidth, RIVER.waterY, z]
  })
}

export function createWaterfallGeometry() {
  const ends = Array.from({ length: 9 }, (_, i) => riverEdgeZ(i / 8 * 2 - 1, 1))
  return ribbon(8, 12, (u, v) => {
    const z = ends[Math.round(u * 8)]
    // Follow the curved cliff lip, then fall clear of the tapering rock underside.
    return [riverCenter(z) + (u * 2 - 1) * RIVER.halfWidth, RIVER.waterY - v * RIVER.drop, z + .03 + v * .8]
  })
}
