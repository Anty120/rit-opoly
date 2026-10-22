import { useRef } from 'react'
import { Vector3 } from 'three'
import type { GameSettings } from '../settings/gameSettings'
import { usePlayerInput } from '../hooks/usePlayerInput'
import { Board } from './Board'
import { Flowers } from './Flowers'
import { FollowCamera } from './FollowCamera'
import { Grass } from './Grass'
import { Island } from './Island'
import { Lighting } from './Lighting'
import { Player } from './Player'
import { Rocks } from './Rocks'
import type { PlayerInput } from './types'
import { SPAWN } from './world'
import type { MultiplayerSession } from '../multiplayer/types'
import { RemotePlayers } from '../multiplayer/RemotePlayers'

export function GameScene({ reset, input, settings, onReset, paused, multiplayer }: {
  reset: number; input: PlayerInput; settings: GameSettings; onReset: () => void; paused: boolean
  multiplayer: MultiplayerSession
}) {
  const player = useRef(new Vector3(...SPAWN))
  const orbit = useRef({ yaw: 0, pitch: .57, distance: 15 })
  usePlayerInput(input, onReset, paused)
  return <>
    <Lighting />
    <Island />
    <Grass player={player} settings={settings} />
    <Board />
    <Rocks />
    <Flowers />
    <Player position={player} input={input} orbit={orbit} reset={reset} settings={settings} paused={paused} multiplayer={multiplayer} />
    <RemotePlayers multiplayer={multiplayer} />
    <FollowCamera position={player} orbit={orbit} reset={reset} spawn={multiplayer.session?.spawn} />
  </>
}
