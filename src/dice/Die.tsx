import type { RefObject } from 'react'
import type { Mesh } from 'three'
import type { createDiceResources } from './diceResources'

export function Die({ mesh, resources }: {
  mesh: RefObject<Mesh | null>; resources: ReturnType<typeof createDiceResources>
}) {
  return <mesh ref={mesh} geometry={resources.geometry} material={resources.material} castShadow dispose={null} />
}
