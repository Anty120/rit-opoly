import { useLayoutEffect, useMemo, useRef } from 'react'
import { Color, InstancedMesh, Object3D } from 'three'

export function BoardTiles() {
  const tiles = useRef<InstancedMesh>(null!)
  const circles = useRef<InstancedMesh>(null!)
  const diamonds = useRef<InstancedMesh>(null!)
  const layout = useMemo(() => {
    const result: [number, number][] = []
    for (let i = 0; i < 9; i++) {
      result.push([-3.6 + i * .9, -3.6], [-3.6 + i * .9, 3.6])
      if (i > 0 && i < 8) result.push([-3.6, -3.6 + i * .9], [3.6, -3.6 + i * .9])
    }
    return result
  }, [])
  useLayoutEffect(() => {
    const dummy = new Object3D(), color = new Color()
    let circle = 0, diamond = 0
    layout.forEach(([x, z], i) => {
      dummy.position.set(x, .67, z); dummy.rotation.set(0, 0, 0); dummy.updateMatrix()
      tiles.current.setMatrixAt(i, dummy.matrix)
      tiles.current.setColorAt(i, color.set(['#e5d8b7', '#c6ceb2', '#b4c5b1', '#d6b8a2'][i % 4]))
      dummy.position.y = .696; dummy.rotation.x = -Math.PI / 2; dummy.updateMatrix()
      if (i % 3 === 0) diamonds.current.setMatrixAt(diamond++, dummy.matrix)
      else circles.current.setMatrixAt(circle++, dummy.matrix)
    })
    diamonds.current.count = diamond; circles.current.count = circle
    for (const mesh of [tiles.current, circles.current, diamonds.current]) {
      mesh.instanceMatrix.needsUpdate = true; mesh.computeBoundingSphere()
    }
    if (tiles.current.instanceColor) tiles.current.instanceColor.needsUpdate = true
  }, [layout])
  return <group>
    <instancedMesh ref={tiles} args={[undefined, undefined, layout.length]} receiveShadow><boxGeometry args={[.82, .04, .82]} /><meshStandardMaterial /></instancedMesh>
    <instancedMesh ref={circles} args={[undefined, undefined, layout.length]}><ringGeometry args={[.12, .15, 24]} /><meshStandardMaterial color="#8d846b" /></instancedMesh>
    <instancedMesh ref={diamonds} args={[undefined, undefined, layout.length]}><ringGeometry args={[.12, .15, 4]} /><meshStandardMaterial color="#8d846b" /></instancedMesh>
  </group>
}
