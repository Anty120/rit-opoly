import { memo, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { InstancedBufferAttribute, InstancedMesh, Sphere, Vector3 } from 'three'
import type { BufferGeometry, MeshLambertMaterial } from 'three'
import type { GrassPatchData } from './grassLayout'
import { grassDrawCount } from './grassLod'

export const GrassPatch = memo(function GrassPatch({ patch, detailed, simple, material, density, shadows }: {
  patch: GrassPatchData; detailed: BufferGeometry; simple: BufferGeometry; material: MeshLambertMaterial; density: number; shadows: boolean
}) {
  const mesh = useRef<InstancedMesh>(null!)
  const matrices = useMemo(() => new InstancedBufferAttribute(patch.matrices, 16), [patch])
  const colors = useMemo(() => new InstancedBufferAttribute(patch.colors, 3), [patch])
  const elapsed = useRef(1), coarse = useRef(false)
  useLayoutEffect(() => {
    mesh.current.boundingSphere = new Sphere(new Vector3(0, .7, 0), 7)
    elapsed.current = 1
  }, [density, shadows])
  useFrame(({ camera }, delta) => {
    elapsed.current += delta
    if (elapsed.current < .12) return
    elapsed.current = 0
    const distance = Math.hypot(camera.position.x - patch.x, camera.position.z - patch.z)
    // Hysteresis avoids swapping geometry repeatedly at a distance threshold.
    coarse.current = coarse.current ? distance > 22 : distance > 25
    mesh.current.geometry = coarse.current ? simple : detailed
    mesh.current.count = grassDrawCount(patch.count, distance, density)
    mesh.current.receiveShadow = shadows && !coarse.current
  })
  return <instancedMesh ref={mesh} args={[detailed, material, patch.count]} position={[patch.x, 0, patch.z]}
    instanceMatrix={matrices} instanceColor={colors} dispose={null} />
})
