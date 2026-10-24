// Shared by terrain, grass, movement and server validation. World units are metres.
export const ISLAND_RADIUS = 44
export const ISLAND_BOUNDS = ISLAND_RADIUS + 3
export const RIVER = { x: 18, halfWidth: 2.2, bankWidth: 3.5, depth: .55, waterY: -.16, drop: 12 } as const

export interface GameSite {
  id: string
  kind: 'monopoly' | 'reserved' | 'chess'
  x: number
  z: number
  halfSize: number
  height: number
}
export const CHESS_SITE: GameSite = { id: 'chess', kind: 'chess', x: 32, z: 0, halfSize: 6.7, height: .24 }
export const CHESS_SURFACE_HEIGHT = CHESS_SITE.height + .045
export const GAME_SITES: readonly GameSite[] = [
  { id: 'monopoly', kind: 'monopoly', x: 0, z: 0, halfSize: 8, height: .602 },
  CHESS_SITE,
]
export const PRIMARY_BOARD = GAME_SITES[0]

export function islandRadius(angle: number) {
  return ISLAND_RADIUS + Math.sin(angle * 3 + 1) * 1.1 + Math.sin(angle * 7) * .55
}
export function riverCenter(z: number) {
  return RIVER.x + Math.sin(z * .105) * 4.2
}
export const BRIDGES = [{ x: riverCenter(0), z: 0, halfX: 5.5, halfZ: 1.7, height: .08, rise: 1.65 }] as const

export function bridgeHeight(x: number, bridge: typeof BRIDGES[number]) {
  const u = Math.max(-1, Math.min(1, (x - bridge.x) / bridge.halfX))
  // Match the rendered 24-segment deck exactly.
  const step = (u + 1) * 12, a = Math.min(23, Math.floor(step)), f = step - a
  const height = (i: number) => bridge.height + bridge.rise * (1 - (i / 12 - 1) ** 2)
  return height(a) * (1 - f) + height(a + 1) * f
}

export function terrainHeight(x: number, z: number) {
  const distance = Math.abs(x - riverCenter(z))
  const t = Math.max(0, Math.min(1, (distance - (RIVER.halfWidth - .15)) / (RIVER.bankWidth - RIVER.halfWidth + .15)))
  return t >= 1 ? 0 : -RIVER.depth * (1 - t * t * (3 - 2 * t))
}
export function isGameSite(x: number, z: number, margin = .1) {
  return GAME_SITES.some(site => Math.abs(x - site.x) < site.halfSize + margin && Math.abs(z - site.z) < site.halfSize + margin)
}
export function isRiverBank(x: number, z: number) {
  return Math.abs(x - riverCenter(z)) < RIVER.bankWidth + .3
}

// Find each bank's exact intersection with the same outline used by terrain.
export function riverEdgeZ(side: number, direction: number) {
  let inside = 0, outside = ISLAND_BOUNDS
  for (let i = 0; i < 28; i++) {
    const distance = (inside + outside) / 2, z = distance * direction
    const x = riverCenter(z) + side * RIVER.halfWidth
    if (Math.hypot(x, z) < islandRadius(Math.atan2(z, x))) inside = distance
    else outside = distance
  }
  return inside * direction
}
