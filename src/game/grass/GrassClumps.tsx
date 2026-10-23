import { memo, useEffect, useLayoutEffect, useMemo } from 'react'
import { InstancedBufferAttribute, Sphere, Vector3 } from 'three'
import type { GrassPatchData } from './grassLayout'
import type { GameSettings } from '../../settings/gameSettings'
import { createClumpResources } from './clumpResources'
import { isGameSite } from '../worldConfig'
import type { GrassUniforms } from './grassMaterial'

const ClumpPatch = memo(function ClumpPatch({ patch, resources }: { patch: GrassPatchData; resources: ReturnType<typeof createClumpResources> }) {
  const data = useMemo(() => {
    const indices: number[] = []
    for (let index = 0; index < patch.count; index += 28) {
      if (!isGameSite(patch.x + patch.matrices[index * 16 + 12], patch.z + patch.matrices[index * 16 + 14], .9)) indices.push(index)
    }
    const count = indices.length, matrices = new Float32Array(count * 16), colors = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      matrices.set(patch.matrices.subarray(indices[i] * 16, indices[i] * 16 + 16), i * 16)
      colors.set(patch.colors.subarray(indices[i] * 3, indices[i] * 3 + 3), i * 3)
    }
    return { count, matrices: new InstancedBufferAttribute(matrices, 16), colors: new InstancedBufferAttribute(colors, 3), bounds: new Sphere(new Vector3(0, .8, 0), 7.7) }
  }, [patch])
  return <instancedMesh args={[resources.geometry, resources.material, data.count]} position={[patch.x, 0, patch.z]}
    instanceMatrix={data.matrices} instanceColor={data.colors} boundingSphere={data.bounds} dispose={null} />
})

export function GrassClumps({ patches, settings, uniforms }: { patches: GrassPatchData[]; settings: GameSettings; uniforms: GrassUniforms }) {
  const resources = useMemo(() => createClumpResources(uniforms), [uniforms])
  useLayoutEffect(() => {
    resources.material.color.set(settings.grassColor)
    resources.height.value = settings.grassHeight
  }, [resources, settings.grassColor, settings.grassHeight])
  useEffect(() => () => { resources.geometry.dispose(); resources.material.dispose(); resources.texture.dispose() }, [resources])
  return <group>{patches.map(patch => <ClumpPatch key={patch.id} patch={patch} resources={resources} />)}</group>
}
