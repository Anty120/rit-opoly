import { useEffect, useMemo } from 'react'
import { BoxGeometry, EdgesGeometry } from 'three'
import { VISUALIZER } from './visualizerConfig'

export function SpeakerCabinet() {
  const size = VISUALIZER.cubeSize
  const edges = useMemo(() => {
    const box = new BoxGeometry(size, size, size)
    const geometry = new EdgesGeometry(box); box.dispose()
    return geometry
  }, [size])
  useEffect(() => () => edges.dispose(), [edges])
  return <>
    <mesh position={[0, VISUALIZER.bottom / 2, 0]} receiveShadow>
      <boxGeometry args={[size + .16, VISUALIZER.bottom, size + .16]} /><meshStandardMaterial color="#fafff7" roughness={.85} />
    </mesh>
    <group position={[0, VISUALIZER.bottom + size / 2, 0]}>
      <mesh><boxGeometry args={[size, size, size]} /><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh>
      <lineSegments geometry={edges}><lineBasicMaterial color="#d8e0d5" toneMapped={false} /></lineSegments>
    </group>
  </>
}
