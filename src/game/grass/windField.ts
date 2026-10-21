import { DataTexture, LinearFilter, RepeatWrapping, RGBAFormat } from 'three'
import { randomGenerator } from '../world.ts'

// Bake smooth, tileable turbulence once. All grass patches share this 16 KB map.
export function createWindField() {
  const random = randomGenerator(9017), size = 64
  const grid = (resolution: number) => Float32Array.from({ length: resolution * resolution }, random)
  const broad = grid(6), detail = grid(12), crosswind = grid(16)
  const noise = (values: Float32Array, resolution: number, u: number, v: number) => {
    const x = u * resolution, y = v * resolution, ix = Math.floor(x), iy = Math.floor(y)
    const tx = x - ix, ty = y - iy
    const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty)
    const at = (dx: number, dy: number) => values[((iy + dy) % resolution) * resolution + ((ix + dx) % resolution)]
    const a = at(0, 0) * (1 - sx) + at(1, 0) * sx
    const b = at(0, 1) * (1 - sx) + at(1, 1) * sx
    return a * (1 - sy) + b * sy
  }
  const data = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = x / size, v = y / size, offset = (y * size + x) * 4
    data[offset] = Math.round((noise(broad, 6, u, v) * .72 + noise(detail, 12, u, v) * .28) * 255)
    data[offset + 1] = Math.round(noise(crosswind, 16, u, v) * 255)
    data[offset + 2] = 0; data[offset + 3] = 255
  }
  const texture = new DataTexture(data, size, size, RGBAFormat)
  texture.wrapS = texture.wrapT = RepeatWrapping
  texture.minFilter = texture.magFilter = LinearFilter
  texture.generateMipmaps = false
  texture.needsUpdate = true
  return texture
}
