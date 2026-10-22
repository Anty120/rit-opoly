import { rocks } from './world'
import { rockTransform } from './rockTransform'

export function Rocks() {
  return <group>{rocks.map((rock, i) => <mesh key={i} {...rockTransform(rock, i)} castShadow receiveShadow>
    <dodecahedronGeometry args={[1, 0]} /><meshStandardMaterial color={i % 2 ? '#b2b8a6' : '#c2b8af'} flatShading roughness={1} />
  </mesh>)}</group>
}
