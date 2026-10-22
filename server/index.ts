import { createGameServer } from './createGameServer.ts'

const server = createGameServer()
const port = Number(process.env.PORT || 2567)
await server.listen(port, process.env.HOST || '0.0.0.0')
console.log(`Colyseus multiplayer listening on port ${port}`)
let stopping = false
const stop = async () => {
  if (stopping) return
  stopping = true
  await server.gracefullyShutdown(false)
  process.exit(0)
}
process.on('SIGINT', stop); process.on('SIGTERM', stop)
