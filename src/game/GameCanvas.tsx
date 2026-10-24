import type { RefObject } from 'react'
import { useNativeResolution } from '../hooks/useNativeResolution'
import { Canvas } from '@react-three/fiber'
import { PCFShadowMap } from 'three'
import type { GameSettings, RuntimeStats } from '../settings/gameSettings'
import type { PlayerInput } from './types'
import { GameScene } from './GameScene'
import { PerformanceMonitor } from './PerformanceMonitor'
import type { MultiplayerSession } from '../multiplayer/types'
import type { MusicAudio } from '../music/useMusicAudio'
import type { DiceController } from '../dice/useDice'
import type { ChessController } from '../chess/useChess'

export function GameCanvas({ reset, input, settings, onReset, paused, stats, multiplayer, music, dice, chess }: {
  reset: number; input: PlayerInput; settings: GameSettings; onReset: () => void; paused: boolean; stats: RefObject<RuntimeStats>
  multiplayer: MultiplayerSession
  music: MusicAudio
  dice: DiceController
  chess: ChessController
}) {
  const renderDpr = useNativeResolution(settings.renderScale)
  return <Canvas shadows={{ type: PCFShadowMap }} dpr={renderDpr}
    camera={{ position: [0, 11, 24], fov: 50, near: .1, far: 180 }} gl={{ antialias: true, alpha: true }}
    aria-label="Explore a grassy floating island with a board at its center">
    <GameScene reset={reset} input={input} settings={settings} onReset={onReset} paused={paused} multiplayer={multiplayer} music={music} dice={dice} chess={chess} />
    <PerformanceMonitor stats={stats} />
  </Canvas>
}
