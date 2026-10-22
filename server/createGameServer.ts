import { Server } from '@colyseus/core'
import { WebSocketTransport } from '@colyseus/ws-transport'
import { ROOM_TYPE } from '../shared/protocol.ts'
import { MeadowRoom } from './MeadowRoom.ts'

export function createGameServer() {
  const transport = new WebSocketTransport({ maxPayload: 4096, pingInterval: 5000, pingMaxRetries: 3 })
  const server = new Server({ transport, greet: false, gracefullyShutdown: false })
  server.define(ROOM_TYPE, MeadowRoom)
  return server
}
