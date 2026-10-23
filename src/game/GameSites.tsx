import { Board } from './Board'
import { GAME_SITES } from './worldConfig'

// Add a site and its game component here; grass and collision use the same registry.
export function GameSites() {
  return <group>{GAME_SITES.map(site => <group key={site.id} position={[site.x, 0, site.z]}>
    {site.kind === 'monopoly' ? <Board /> :
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .008, 0]} receiveShadow>
        <planeGeometry args={[site.halfSize * 2, site.halfSize * 2]} />
        <meshLambertMaterial color="#a8bba0" />
      </mesh>}
  </group>)}</group>
}
