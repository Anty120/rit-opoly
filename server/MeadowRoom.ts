import { Room } from '@colyseus/core'
import type { Client } from '@colyseus/core'
import { MeadowState, NetworkPlayer } from '../shared/roomState.ts'
import { isPlayerPose, MAX_PLAYERS, PLAYER_COLORS, playerName, playerSpawn } from '../shared/protocol.ts'
import { islandRadius } from '../src/game/world.ts'
import { randomInt } from 'node:crypto'
import { DICE_REQUEST_COOLDOWN_MS } from '../shared/dice.ts'

export class MeadowRoom extends Room<{ state: MeadowState }> {
  maxClients = MAX_PLAYERS
  state = new MeadowState()
  private slots = new Map<string, number>()
  private receivedAt = new Map<string, number>()
  private nextDiceRoll = 0

  onCreate() {
    this.setPatchRate(50)
    this.onMessage('rollDice', client => {
      const player = this.state.players.get(client.sessionId)
      if (!player || !player.connected || performance.now() < this.nextDiceRoll) return
      this.nextDiceRoll = performance.now() + DICE_REQUEST_COOLDOWN_MS
      const dice = this.state.dice
      // Ignore supplied values. Only the server decides room dice outcomes.
      dice.first = randomInt(1, 7); dice.second = randomInt(1, 7)
      dice.rollerId = client.sessionId; dice.rollerName = player.name; dice.id++
    })
    this.onMessage('pose', (client, pose: unknown) => {
      const player = this.state.players.get(client.sessionId)
      if (!player || !isPlayerPose(pose)) return
      const now = performance.now(), previous = this.receivedAt.get(client.sessionId) ?? now
      const elapsed = Math.min(.5, Math.max(.05, (now - previous) / 1000))
      // Client-owned movement for this free-roam prototype. Bound updates and
      // always address the sender's character, never a supplied player ID.
      if (Math.hypot(pose.x - player.x, pose.z - player.z) > 18 * elapsed + .8) return
      if (Math.abs(pose.y - player.y) > 16 * elapsed + .6) return
      if (Math.hypot(pose.x, pose.z) > islandRadius(Math.atan2(pose.z, pose.x)) - .9) return
      player.x = pose.x; player.y = pose.y; player.z = pose.z
      player.yaw = Math.atan2(Math.sin(pose.yaw), Math.cos(pose.yaw))
      this.receivedAt.set(client.sessionId, now)
    })
    this.onMessage('respawn', client => {
      const player = this.state.players.get(client.sessionId)
      if (!player) return
      player.x = player.spawnX; player.y = 0; player.z = player.spawnZ; player.yaw = Math.PI
      this.receivedAt.set(client.sessionId, performance.now())
    })
  }

  onJoin(client: Client, options: { name?: unknown } = {}) {
    const occupied = new Set(this.slots.values())
    const slot = Array.from({ length: MAX_PLAYERS }, (_, i) => i).find(value => !occupied.has(value)) ?? 0
    const spawn = playerSpawn(slot), player = new NetworkPlayer()
    player.name = playerName(options.name); player.color = PLAYER_COLORS[slot]
    player.x = spawn.x; player.z = spawn.z; player.spawnX = spawn.x; player.spawnZ = spawn.z
    this.slots.set(client.sessionId, slot)
    this.receivedAt.set(client.sessionId, performance.now())
    this.state.players.set(client.sessionId, player)
  }

  async onDrop(client: Client) {
    const player = this.state.players.get(client.sessionId)
    if (player) player.connected = false
    try { await this.allowReconnection(client, 15) } catch { /* onLeave removes expired seats. */ }
  }

  onReconnect(client: Client) {
    const player = this.state.players.get(client.sessionId)
    if (player) player.connected = true
    this.receivedAt.set(client.sessionId, performance.now())
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId)
    this.slots.delete(client.sessionId); this.receivedAt.delete(client.sessionId)
  }
}
