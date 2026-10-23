import assert from 'node:assert/strict'
import { Client } from '@colyseus/sdk'
import { createGameServer } from './createGameServer.ts'
import { DICE_REQUEST_COOLDOWN_MS } from '../shared/dice.ts'

const waitFor = async (predicate, description) => {
  const deadline = Date.now() + 6000
  while (!predicate()) {
    assert.ok(Date.now() < deadline, `Timed out: ${description}`)
    await new Promise(resolve => setTimeout(resolve, 20))
  }
}
const server = createGameServer(), rooms = []
try {
  await server.listen(0, '127.0.0.1')
  const port = server.transport.server.address().port
  const client = new Client(`http://127.0.0.1:${port}`)
  const host = await client.create('meadow', { name: 'Host' }); rooms.push(host)
  const guest = await client.joinById(host.roomId, { name: 'Guest' }); rooms.push(guest)
  await waitFor(() => host.state?.players?.size === 2 && guest.state?.players?.size === 2, 'two players synchronized')
  const hostId = host.sessionId, guestId = guest.sessionId
  const start = { ...host.state.players.get(hostId).toJSON() }
  assert.notEqual(hostId, guestId)
  assert.notEqual(start.color, guest.state.players.get(guestId).color)
  assert.notEqual(start.x, guest.state.players.get(guestId).x)
  host.send('pose', { x: start.x + .3, y: .7, z: start.z, yaw: 1 })
  await waitFor(() => Math.abs(guest.state.players.get(hostId).y - .7) < .001, 'movement and jump replicated')
  assert.ok(Math.abs(guest.state.players.get(hostId).x - start.x - .3) < .001)
  assert.equal(guest.state.players.get(hostId).yaw, 1)
  assert.equal(guest.state.players.get(guestId).y, 0)
  host.send('pose', { x: 999, y: NaN, z: 999, yaw: 0, sessionId: guestId })
  await new Promise(resolve => setTimeout(resolve, 120))
  assert.equal(guest.state.players.get(guestId).y, 0)
  assert.ok(Math.abs(guest.state.players.get(hostId).y - .7) < .001)
  host.send('respawn')
  await waitFor(() => guest.state.players.get(hostId).y === 0, 'reset replicated')
  assert.equal(guest.state.players.get(hostId).x, start.x)
  host.send('rollDice', { first: 99, second: 99 })
  await waitFor(() => guest.state.dice.id === 1 && host.state.dice.id === 1, 'dice result shared')
  assert.deepEqual(host.state.dice.toJSON(), guest.state.dice.toJSON())
  assert.equal(guest.state.dice.rollerId, hostId)
  assert.equal(guest.state.dice.rollerName, 'Host')
  assert.ok(guest.state.dice.first >= 1 && guest.state.dice.first <= 6)
  assert.ok(guest.state.dice.second >= 1 && guest.state.dice.second <= 6)
  for (let i = 0; i < 10; i++) guest.send('rollDice')
  await new Promise(resolve => setTimeout(resolve, 150))
  assert.equal(host.state.dice.id, 1, 'overlapping requests cannot reroll active dice')
  await new Promise(resolve => setTimeout(resolve, DICE_REQUEST_COOLDOWN_MS))
  guest.send('rollDice')
  await waitFor(() => host.state.dice.id === 2, 'another player can roll after cooldown')
  assert.equal(host.state.dice.rollerId, guestId)
  const late = await client.joinById(host.roomId, { name: 'Late guest' }); rooms.push(late)
  await waitFor(() => late.state?.dice?.id === 2, 'late join receives last dice outcome')
  assert.deepEqual(late.state.dice.toJSON(), host.state.dice.toJSON())
  await late.leave(true)
  await waitFor(() => host.state.players.size === 2, 'late guest removed')
  let dropped = false, reconnected = false
  guest.onDrop(() => { dropped = true })
  guest.onReconnect(() => { reconnected = true })
  guest.reconnection.minUptime = 0
  guest.reconnection.minDelay = 50
  guest.connection.close(4010, 'Integration test reconnect')
  await waitFor(() => dropped && reconnected && guest.connection.isOpen, 'automatic reconnection')
  await waitFor(() => host.state.players.get(guestId)?.connected === true, 'reconnected player retained')
  assert.equal(guest.sessionId, guestId)
  assert.equal(host.state.players.size, 2)
  const isolated = await client.create('meadow', { name: 'Elsewhere' }); rooms.push(isolated)
  await waitFor(() => isolated.state?.players?.size === 1, 'separate room initialized')
  assert.equal(isolated.state.players.has(hostId), false)
  assert.equal(isolated.state.dice.id, 0, 'rolls stay within their room')
  await assert.rejects(() => client.joinById('missing-room', { name: 'Nobody' }))
  await guest.leave(true)
  await waitFor(() => host.state.players.size === 1, 'leaving removes remote player')
  console.log('Multiplayer integration passed: movement, dice synchronization, cooldown, ignored supplied outcomes, late-join dice, reconnection, isolation and leave.')
} finally {
  await Promise.allSettled(rooms.filter(room => room.connection.isOpen).map(room => room.leave(true)))
  await server.gracefullyShutdown(false)
}
