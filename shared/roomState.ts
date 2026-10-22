import { defineTypes, MapSchema, Schema } from '@colyseus/schema'

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

export class MeadowState extends Schema {
  declare players: MapSchema<NetworkPlayer>
  constructor() { super(); this.players = new MapSchema<NetworkPlayer>() }
}
defineTypes(MeadowState, { players: { map: NetworkPlayer } })
