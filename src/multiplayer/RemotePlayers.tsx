import type { MultiplayerSession } from './types'
import { RemotePlayer } from './RemotePlayer'

export function RemotePlayers({ multiplayer }: { multiplayer: MultiplayerSession }) {
  return <group>{multiplayer.roster.filter(player => player.sessionId !== multiplayer.session?.sessionId).map(identity =>
    <RemotePlayer key={identity.sessionId} identity={identity} targets={multiplayer.targets} />
  )}</group>
}
