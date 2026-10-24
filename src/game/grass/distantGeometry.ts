import { InstancedBufferAttribute, InstancedBufferGeometry, Sphere, Vector3 } from 'three'
import type { GrassPatchData } from './grassLayout'
import { createGrassGeometry } from './grassGeometry.ts'

// Four old patches per batch, with compact attributes rather than 4x4 matrices.
export function createDistantBatches(patches: GrassPatchData[]) {
  const groups = new Map<string, { x: number; z: number; patches: GrassPatchData[] }>()
  for (const patch of patches) {
    const x = Math.floor(patch.x / 16) * 16 + 4, z = Math.floor(patch.z / 16) * 16 + 4, key = `${x}:${z}`
    if (!groups.has(key)) groups.set(key, { x, z, patches: [] })
    groups.get(key)!.patches.push(patch)
  }
  const blade = createGrassGeometry(1)
  const result = [...groups.entries()].map(([id, group]) => {
    const count = group.patches.reduce((sum, patch) => sum + Math.ceil(patch.count / 4), 0)
    const roots = new Float32Array(count * 3), transforms = new Float32Array(count * 4), colors = new Float32Array(count * 3)
    let next = 0
    for (const patch of group.patches) for (let i = 0; i < patch.count; i += 4) {
      const m = i * 16
      roots.set([patch.x - group.x + patch.matrices[m + 12], patch.matrices[m + 13], patch.z - group.z + patch.matrices[m + 14]], next * 3)
      // cos*width, sin*width, height, depth-scale are all the shader needs.
      transforms.set([patch.matrices[m], -patch.matrices[m + 2], patch.matrices[m + 5], Math.hypot(patch.matrices[m + 8], patch.matrices[m + 10])], next * 4)
      colors.set(patch.colors.subarray(i * 3, i * 3 + 3), next * 3)
      next++
    }
    const geometry = new InstancedBufferGeometry()
    geometry.setIndex(blade.index!.clone())
    geometry.setAttribute('position', blade.attributes.position.clone())
    geometry.setAttribute('normal', blade.attributes.normal.clone())
    geometry.setAttribute('meadowRoot', new InstancedBufferAttribute(roots, 3))
    geometry.setAttribute('meadowTransform', new InstancedBufferAttribute(transforms, 4))
    geometry.setAttribute('meadowColor', new InstancedBufferAttribute(colors, 3))
    geometry.instanceCount = count
    geometry.boundingSphere = new Sphere(new Vector3(0,.8,0), 13.5)
    return { id, x: group.x, z: group.z, geometry }
  })
  blade.dispose()
  return result
}
