import type { RefObject } from 'react'
import type { PlayerIdentity, PlayerPose, PlayerSnapshot } from '../../shared/protocol'

export type ConnectionStatus = 'offline' | 'connecting' | 'connected' | 'reconnecting' | 'error'
export interface RoomSession extends PlayerIdentity { roomId: string; spawn: [number, number, number] }
export interface MultiplayerSession {
  status: ConnectionStatus
  session: RoomSession | null
  roster: PlayerIdentity[]
  targets: RefObject<Map<string, PlayerSnapshot>>
  error: string
  connect: (mode: 'create' | 'join', name: string, roomId?: string) => Promise<void>
  leave: () => void
  sendPose: (pose: PlayerPose) => void
  respawn: () => void
}
