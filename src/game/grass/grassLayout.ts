import { islandRadius, randomGenerator, rocks } from '../world.ts'

export interface GrassPatchData { id: string; x: number; z: number; count: number; matrices: Float32Array; colors: Float32Array }

export function createGrassLayout(): GrassPatchData[] {
  const patches: GrassPatchData[] = []
  const candidates = 8 * 8 * 145
  for (let tileX = 0; tileX < 7; tileX++) for (let tileZ = 0; tileZ < 7; tileZ++) {
    const centerX = -24 + tileX * 8, centerZ = -24 + tileZ * 8
    const random = randomGenerator(28 + tileX * 101 + tileZ * 7001)
    const matrices = new Float32Array(candidates * 16), colors = new Float32Array(candidates * 3)
    let count = 0
    for (let i = 0; i < candidates; i++) {
      const localX = (random() - .5) * 8, localZ = (random() - .5) * 8
      const x = centerX + localX, z = centerZ + localZ
      if (Math.hypot(x, z) > islandRadius(Math.atan2(z, x)) - .15) continue
      if (Math.abs(x) < 4.5 && Math.abs(z) < 4.5) continue
      if (rocks.some(rock => Math.hypot(x - rock.x, z - rock.z) < rock.size * .76)) continue
      const patch = .5 + .5 * Math.sin(x * .35 + Math.sin(z * .25) * 1.6)
      const angle = -.65 + Math.sin(x * .16 + z * .22) * .85 + (random() - .5) * 1.8
      const sx = .65 + random() * .75, sy = (.52 + random() * .27) * (.85 + patch * .3), sz = .7 + random() * .6
      const cos = Math.cos(angle), sin = Math.sin(angle), index = count * 16
      // Fill each transform directly once; no per-blade Object3D allocations.
      matrices[index] = cos * sx; matrices[index + 2] = -sin * sx
      matrices[index + 5] = sy
      matrices[index + 8] = sin * sz; matrices[index + 10] = cos * sz
      matrices[index + 12] = localX; matrices[index + 13] = .012; matrices[index + 14] = localZ; matrices[index + 15] = 1
      const colorPatch = .5 + .5 * Math.sin(x * .32 + Math.sin(z * .23) * 2)
      const tone = .86 + random() * .14
      colors[count * 3] = tone * (1 - colorPatch * .15)
      colors[count * 3 + 1] = tone
      colors[count * 3 + 2] = tone * (1 - colorPatch * .025)
      count++
    }
    if (count) patches.push({ id: `${tileX}:${tileZ}`, x: centerX, z: centerZ, count, matrices: matrices.slice(0, count * 16), colors: colors.slice(0, count * 3) })
  }
  return patches
}
