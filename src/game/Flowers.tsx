import { useLayoutEffect, useMemo, useRef } from 'react'
import { Color, InstancedMesh, Object3D } from 'three'
import { randomGenerator } from './world'

export function Flowers() {
  const stems = useRef<InstancedMesh>(null!)
  const petals = useRef<InstancedMesh>(null!)
  const centers = useRef<InstancedMesh>(null!)
  const flowers = useMemo(() => {
    const random = randomGenerator(16)
    return Array.from({ length: 55 }, (_, i) => {
      const centers = [[-9, 6], [8, -9], [-16, -8], [15, 9]]
      const [x, z] = centers[i % 4]
      return { x: x + (random() - .5) * 4, z: z + (random() - .5) * 4, height: .5 + random() * .25, color: ['#f7e5b1', '#fff0e0', '#b5cce5'][i % 3] }
    })
  }, [])
  useLayoutEffect(() => {
    const dummy = new Object3D(), color = new Color()
    flowers.forEach((flower, i) => {
      dummy.position.set(flower.x, flower.height / 2, flower.z)
      dummy.scale.set(1, flower.height, 1)
      dummy.updateMatrix(); stems.current.setMatrixAt(i, dummy.matrix)
      dummy.position.y = flower.height + .025
      dummy.scale.setScalar(1)
      dummy.updateMatrix(); centers.current.setMatrixAt(i, dummy.matrix)
      for (let petal = 0; petal < 5; petal++) {
        dummy.position.set(flower.x + Math.cos(petal * Math.PI * 2 / 5) * .09, flower.height, flower.z + Math.sin(petal * Math.PI * 2 / 5) * .09)
        dummy.scale.set(1, .4, 1)
        dummy.updateMatrix(); petals.current.setMatrixAt(i * 5 + petal, dummy.matrix)
        petals.current.setColorAt(i * 5 + petal, color.set(flower.color))
      }
    })
    for (const mesh of [stems.current, petals.current, centers.current]) {
      mesh.instanceMatrix.needsUpdate = true
      mesh.computeBoundingSphere()
    }
    if (petals.current.instanceColor) petals.current.instanceColor.needsUpdate = true
  }, [flowers])
  return <group>
    <instancedMesh ref={stems} args={[undefined, undefined, flowers.length]}><cylinderGeometry args={[.018, .025, 1, 4]} /><meshStandardMaterial color="#5c8f66" /></instancedMesh>
    <instancedMesh ref={petals} args={[undefined, undefined, flowers.length * 5]}><sphereGeometry args={[.085, 5, 4]} /><meshStandardMaterial /></instancedMesh>
    <instancedMesh ref={centers} args={[undefined, undefined, flowers.length]}><sphereGeometry args={[.045, 6, 4]} /><meshStandardMaterial color="#d9ae61" /></instancedMesh>
  </group>
}
