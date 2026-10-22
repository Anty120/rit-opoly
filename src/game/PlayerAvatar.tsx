import type { RefObject } from 'react'
import type { Group, Mesh } from 'three'
import { SPAWN } from './world'

export function PlayerAvatar({ character, shadow }: { character: RefObject<Group | null>; shadow: RefObject<Mesh | null> }) {
  return <group ref={character} position={[...SPAWN]}>
    <group position={[0, -.165, 0]}>
    <mesh position={[0, 1, 0]} castShadow><capsuleGeometry args={[.36, .95, 8, 16]} /><meshStandardMaterial color="#e3a56c" roughness={.85} /></mesh>
    <mesh position={[0, 1.25, 0]} castShadow><cylinderGeometry args={[.38, .38, .16, 16]} /><meshStandardMaterial color="#658882" /></mesh>
    {[-.13, .13].map(x => <mesh key={x} position={[x, 1.52, .31]}><sphereGeometry args={[.046, 8, 8]} /><meshStandardMaterial color="#334942" /></mesh>)}
    </group>
    <mesh ref={shadow} position={[0, .016, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[.52, 32]} /><meshBasicMaterial color="#41684e" transparent opacity={.15} depthWrite={false} /></mesh>
  </group>
}
