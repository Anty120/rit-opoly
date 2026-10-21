import { useMemo } from 'react'
import { islandGeometry } from './world'

export function Island() {
  const geometry = useMemo(islandGeometry, [])
  return <mesh geometry={geometry} receiveShadow><meshStandardMaterial vertexColors roughness={1} flatShading /></mesh>
}
