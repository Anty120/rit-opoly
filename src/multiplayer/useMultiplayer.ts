import { useCallback, useEffect, useRef, useState } from 'react'
import { Client } from '@colyseus/sdk'
import type { Room } from '@colyseus/sdk'
import type { MeadowState } from '../../shared/roomState'
import { playerName, ROOM_TYPE } from '../../shared/protocol'
import type { PlayerIdentity, PlayerPose, PlayerSnapshot } from '../../shared/protocol'
import type { ConnectionStatus, MultiplayerSession, RoomSession } from './types'

type MeadowConnection = Room<MeadowState>

export function useMultiplayer(): MultiplayerSession {
  const [status, setStatus] = useState<ConnectionStatus>('offline')
  const [session, setSession] = useState<RoomSession | null>(null)
  const [roster, setRoster] = useState<PlayerIdentity[]>([])
  const [error, setError] = useState('')
  const room = useRef<MeadowConnection | null>(null)
  const targets = useRef(new Map<string, PlayerSnapshot>())
  const generation = useRef(0), ready = useRef(false)
  const rosterKey = useRef('')

  const leave = useCallback(() => {
    generation.current++; ready.current = false
    const previous = room.current; room.current = null
    targets.current.clear(); rosterKey.current = ''
    setSession(null); setRoster([]); setStatus('offline'); setError('')
    if (previous) void previous.leave(true).catch(() => {}).finally(() => previous.removeAllListeners())
    const url = new URL(window.location.href); url.searchParams.delete('room'); window.history.replaceState(null, '', url)
  }, [])

  useEffect(() => () => {
    generation.current++; ready.current = false
    const previous = room.current; room.current = null
    if (previous) void previous.leave(true).catch(() => {}).finally(() => previous.removeAllListeners())
  }, [])

  const connect = useCallback(async (mode: 'create' | 'join', name: string, roomId = '') => {
    if (room.current) return
    const request = ++generation.current
    setStatus('connecting'); setError(''); ready.current = false
    try {
      const endpoint = import.meta.env.VITE_COLYSEUS_URL || `${window.location.origin}/multiplayer`
      const client = new Client(endpoint)
      const options = { name: playerName(name) }
      const joined = mode === 'create' ? await client.create<MeadowState>(ROOM_TYPE, options) : await client.joinById<MeadowState>(roomId.trim(), options)
      if (request !== generation.current) { await joined.leave(true); return }
      room.current = joined
      joined.reconnection.minUptime = 0
      const consume = (state: MeadowState) => {
        if (room.current !== joined || !state?.players) return
        const identities: PlayerIdentity[] = [], present = new Set<string>()
        state.players.forEach((player, sessionId) => {
          const identity = { sessionId, name: player.name, color: player.color }
          identities.push(identity); present.add(sessionId)
          targets.current.set(sessionId, { ...identity, x: player.x, y: player.y, z: player.z, yaw: player.yaw,
            spawnX: player.spawnX, spawnZ: player.spawnZ, connected: player.connected })
        })
        for (const id of targets.current.keys()) if (!present.has(id)) targets.current.delete(id)
        const nextKey = identities.map(player => `${player.sessionId}:${player.name}:${player.color}`).join('|')
        if (nextKey !== rosterKey.current) { rosterKey.current = nextKey; setRoster(identities) }
        const local = state.players.get(joined.sessionId)
        if (local && !ready.current) {
          ready.current = true
          setSession(previous => previous?.sessionId === joined.sessionId ? previous : { sessionId: joined.sessionId, roomId: joined.roomId, name: local.name, color: local.color, spawn: [local.spawnX, 0, local.spawnZ] })
          setStatus('connected')
        }
      }
      joined.onStateChange(consume)
      joined.onDrop(() => { if (room.current === joined) { ready.current = false; setStatus('reconnecting') } })
      joined.onReconnect(() => { if (room.current === joined) { ready.current = false; consume(joined.state) } })
      joined.onError((_code, message) => {
        if (room.current === joined) setError(message || 'The room connection encountered a problem.')
      })
      joined.onLeave(() => {
        if (room.current !== joined) return
        room.current = null; ready.current = false; targets.current.clear(); rosterKey.current = ''
        setSession(null); setRoster([]); setStatus('error'); setError('Disconnected from the room. You can join again.')
      })
      consume(joined.state)
      const url = new URL(window.location.href); url.searchParams.set('room', joined.roomId); window.history.replaceState(null, '', url)
    } catch (cause) {
      if (request !== generation.current) return
      setStatus('error')
      const message = cause instanceof Error ? cause.message : ''
      setError(/not found|invalid room|locked|full/i.test(message) ? 'Room not found or full. Check the room code and try again.' : 'Could not connect to the game server. Check that it is running and try again.')
    }
  }, [])

  const sendPose = useCallback((pose: PlayerPose) => {
    if (ready.current && room.current?.connection.isOpen) room.current.send('pose', pose)
  }, [])
  const respawn = useCallback(() => {
    if (ready.current && room.current?.connection.isOpen) room.current.send('respawn')
  }, [])
  return { status, session, roster, targets, error, connect, leave, sendPose, respawn }
}
