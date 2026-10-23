import { memo, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { InstancedBufferAttribute, InstancedMesh, Sphere, Vector3 } from 'three'
import type { BufferGeometry, MeshLambertMaterial } from 'three'
import type { GrassPatchData } from './grassLayout'
import { grassDistanceToPatch, grassDrawCount } from './grassLod'

export const GrassPatch = memo(function GrassPatch({ patch, geometry, material, density, shadows }: {
  patch: GrassPatchData; geometry: BufferGeometry; material: MeshLambertMaterial; density: number; shadows: boolean
}) {
  const mesh = useRef<InstancedMesh>(null!)
  const matrices = useMemo(() => new InstancedBufferAttribute(patch.matrices, 16), [patch])
  const colors = useMemo(() => new InstancedBufferAttribute(patch.colors, 3), [patch])
  const ranks = useMemo(() => new InstancedBufferAttribute(Float32Array.from({ length: patch.count }, (_, i) => (i + .5) / patch.count), 1), [patch])
  const patchGeometry = useMemo(() => {
    const result = geometry.clone()
    result.setAttribute('grassRank', ranks)
    return result
  }, [geometry, ranks])
  useEffect(() => () => patchGeometry.dispose(), [patchGeometry])
  const elapsed = useRef(1)
  useLayoutEffect(() => {
    mesh.current.boundingSphere = new Sphere(new Vector3(0, .7, 0), 7.5)
    elapsed.current = 1
  }, [density, shadows])
  useFrame(({ camera }, delta) => {
    elapsed.current += delta
    if (elapsed.current < .12) return
    elapsed.current = 0
    const distance = grassDistanceToPatch(camera.position.x, camera.position.z, patch.x, patch.z)
    // Include a guard band for blades fading in at the edge of the draw prefix.
    mesh.current.visible = distance < 36
    mesh.current.count = distance >= 36 ? 0 : Math.min(patch.count, grassDrawCount(patch.count, distance, density) + Math.ceil(patch.count * .02))
  })
  return <instancedMesh ref={mesh} args={[patchGeometry, material, patch.count]} position={[patch.x, 0, patch.z]}
    instanceMatrix={matrices} instanceColor={colors} receiveShadow={shadows} dispose={null} />
})
