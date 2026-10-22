import { Suspense } from 'react'
import { BoardSurface } from './BoardSurface'
import { BOARD_HALF } from './world'

export function Board() {
  return <group>
    <mesh position={[0, .3, 0]} castShadow receiveShadow>
      <boxGeometry args={[BOARD_HALF * 2, .6, BOARD_HALF * 2]} />
      <meshStandardMaterial color="#354e42" roughness={1} />
    </mesh>
    <Suspense fallback={null}><BoardSurface /></Suspense>
  </group>
}
