import { BoardTiles } from './BoardTiles'

export function Board() {
  return <group>
    <mesh position={[0, .3, 0]} castShadow receiveShadow><boxGeometry args={[8.8, .6, 8.8]} /><meshStandardMaterial color="#9a8165" roughness={.95} /></mesh>
    <mesh position={[0, .62, 0]} receiveShadow><boxGeometry args={[8.5, .05, 8.5]} /><meshStandardMaterial color="#d6c5a0" /></mesh>
    <mesh position={[0, .66, 0]} receiveShadow><boxGeometry args={[6.1, .03, 6.1]} /><meshStandardMaterial color="#8d9d83" /></mesh>
    <BoardTiles />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .69, 0]}><ringGeometry args={[1.65, 1.7, 64]} /><meshStandardMaterial color="#dacc9e" /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, Math.PI / 4]} position={[0, .7, 0]}><circleGeometry args={[.72, 4]} /><meshStandardMaterial color="#ead19b" /></mesh>
    {[-1, 1].flatMap(x => [-1, 1].map(z => <mesh key={`${x},${z}`} position={[x * 4, .7, z * 4]}><sphereGeometry args={[.12, 8, 8]} /><meshStandardMaterial color="#a38a5a" metalness={.3} roughness={.6} /></mesh>))}
  </group>
}
