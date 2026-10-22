import { SPAWN } from '../src/game/world.ts'

export const ROOM_TYPE = 'meadow'
export const MAX_PLAYERS = 8
export const POSE_INTERVAL = .05
export const PLAYER_COLORS = ['#e3a56c', '#79b9d0', '#b39ad8', '#df9eaf', '#8dbd8b', '#d2bc6d', '#99a7da', '#d6a685']

export interface PlayerPose { x: number; y: number; z: number; yaw: number }
export interface PlayerIdentity { sessionId: string; name: string; color: string }
export interface PlayerSnapshot extends PlayerPose, PlayerIdentity { spawnX: number; spawnZ: number; connected: boolean }

export function playerSpawn(slot: number) {
  return { x: SPAWN[0] + (slot % 4 - 1.5) * 1.5, y: 0, z: SPAWN[2] + Math.floor(slot / 4) * 2 }
}

export function playerName(value: unknown) {
  if (typeof value !== 'string') return 'Wanderer'
  return Array.from(value).filter(character => character.charCodeAt(0) >= 32 && character.charCodeAt(0) !== 127).join('').trim().slice(0, 24) || 'Wanderer'
}

export function isPlayerPose(value: unknown): value is PlayerPose {
  if (!value || typeof value !== 'object') return false
  const pose = value as Record<string, unknown>
  return ['x', 'y', 'z', 'yaw'].every(key => typeof pose[key] === 'number' && Number.isFinite(pose[key]))
    && Math.abs(pose.x as number) <= 28 && Math.abs(pose.z as number) <= 28
    && (pose.y as number) >= 0 && (pose.y as number) <= 7 && Math.abs(pose.yaw as number) <= 10000
}

