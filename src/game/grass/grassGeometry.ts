import { BufferGeometry, Float32BufferAttribute } from 'three'

export function createGrassGeometry(segments: number) {
  const geometry = new BufferGeometry(), vertices: number[] = [], normals: number[] = [], indices: number[] = []
  for (let level = 0; level < segments; level++) {
    const t = level / segments
    for (const side of [-1, 1]) {
      vertices.push(side * .03 * Math.pow(1 - t, .8) + .28 * t * t, t, .05 * t * t)
      normals.push(.12, 1, .08)
    }
  }
  vertices.push(.28, 1, .05); normals.push(.12, 1, .08)
  for (let level = 0; level < segments - 1; level++) {
    const start = level * 2
    indices.push(start, start + 1, start + 2, start + 1, start + 3, start + 2)
  }
  indices.push(segments * 2 - 2, segments * 2 - 1, segments * 2)
  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3))
  geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3))
  geometry.setIndex(indices)
  return geometry
}
