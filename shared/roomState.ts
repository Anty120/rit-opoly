import { defineTypes, MapSchema, Schema } from '@colyseus/schema'
import { createChessState } from './chess.ts'

export class NetworkPlayer extends Schema {
  declare name: string
  declare color: string
  declare x: number
  declare y: number
  declare z: number
  declare yaw: number
  declare spawnX: number
  declare spawnZ: number
  declare connected: boolean
  constructor() {
    super()
    this.name = 'Wanderer'; this.color = '#e3a56c'
    this.x = 0; this.y = 0; this.z = 8; this.yaw = Math.PI
    this.spawnX = 0; this.spawnZ = 8; this.connected = true
  }
}
defineTypes(NetworkPlayer, { name: 'string', color: 'string', x: 'float32', y: 'float32', z: 'float32', yaw: 'float32', spawnX: 'float32', spawnZ: 'float32', connected: 'boolean' })

export class NetworkDice extends Schema {
  declare id: number
  declare first: number
  declare second: number
  declare rollerId: string
  declare rollerName: string
  constructor() { super(); this.id = 0; this.first = 1; this.second = 1; this.rollerId = ''; this.rollerName = '' }
}
defineTypes(NetworkDice, { id: 'uint32', first: 'uint8', second: 'uint8', rollerId: 'string', rollerName: 'string' })

export class MeadowState extends Schema {
  declare chess: string
  declare players: MapSchema<NetworkPlayer>
  declare dice: NetworkDice
  constructor() { super(); this.players = new MapSchema<NetworkPlayer>(); this.dice = new NetworkDice(); this.chess = JSON.stringify(createChessState()) }
}
defineTypes(MeadowState, { players: { map: NetworkPlayer }, dice: NetworkDice, chess: 'string' })
