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
import type { MusicAudio } from '../music/useMusicAudio'
import { MusicVisualizer } from '../music/MusicVisualizer'
import { DEFAULT_CAMERA_ORBIT } from './cameraConfig'
import type { DiceController } from '../dice/useDice'
import { Dice } from '../dice/Dice'
import { River } from './water/River'
import { Bridges } from './water/Bridges'

export function GameScene({ reset, input, settings, onReset, paused, multiplayer, music, dice }: {
  reset: number; input: PlayerInput; settings: GameSettings; onReset: () => void; paused: boolean
  multiplayer: MultiplayerSession
  music: MusicAudio
  dice: DiceController
}) {
  const player = useRef(new Vector3(...SPAWN))
  const orbit = useRef({ ...DEFAULT_CAMERA_ORBIT })
  usePlayerInput(input, onReset, paused)
  return <>
    <Lighting />
    <Island />
    <River />
    <Bridges />
    <Grass player={player} settings={settings} />
    <Board />
    <Dice dice={dice} />
    <Rocks />
    <Flowers />
    <MusicVisualizer music={music} scale={settings.visualizerScale} enabled={settings.visualizerEnabled} />
    <Player position={player} input={input} orbit={orbit} reset={reset} settings={settings} paused={paused} multiplayer={multiplayer} />
    <RemotePlayers multiplayer={multiplayer} />
    <FollowCamera position={player} orbit={orbit} reset={reset} spawn={multiplayer.session?.spawn} />
  </>
}
