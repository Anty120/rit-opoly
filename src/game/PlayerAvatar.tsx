import type { RefObject, ReactNode } from 'react'
import type { Group, Mesh } from 'three'
import { SPAWN } from './world'

export function PlayerAvatar({ character, shadow, color = '#e3a56c', spawn = SPAWN, children }: { character: RefObject<Group | null>; shadow: RefObject<Mesh | null>; color?: string; spawn?: readonly [number, number, number]; children?: ReactNode }) {
  return <group ref={character} position={[...spawn]}>
    <group position={[0, -.165, 0]}>
    <mesh position={[0, 1, 0]} castShadow><capsuleGeometry args={[.36, .95, 8, 16]} /><meshStandardMaterial color={color} roughness={.85} /></mesh>
    <mesh position={[0, 1.25, 0]} castShadow><cylinderGeometry args={[.38, .38, .16, 16]} /><meshStandardMaterial color="#658882" /></mesh>
    {[-.13, .13].map(x => <mesh key={x} position={[x, 1.52, .31]}><sphereGeometry args={[.046, 8, 8]} /><meshStandardMaterial color="#334942" /></mesh>)}
    </group>
    {children}
    <mesh ref={shadow} position={[0, .016, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[.52, 32]} /><meshBasicMaterial color="#41684e" transparent opacity={.15} depthWrite={false} /></mesh>
  </group>
}
