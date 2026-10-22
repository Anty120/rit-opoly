import { DodecahedronGeometry, Euler, Matrix4, Plane, Quaternion, Triangle, Vector3 } from 'three'
import { BOARD_HALF, BOARD_HEIGHT, islandRadius, PLAYER_HEIGHT, PLAYER_RADIUS, rocks } from './world.ts'
import { rockTransform } from './rockTransform.ts'

export const GRAVITY = 16
const SKIN = .002
const STEP_HEIGHT = .12

export interface PlayerBody { x: number; y: number; z: number; velocityY: number; grounded: boolean }
export interface SupportSurface { height: number; visualHeight: number; kind: 'ground' | 'board' | 'rock' }

// Bake the same low-poly rock geometry and transforms used by the R3F meshes.
// The player tests cached planes/triangles; no scene raycasts or geometry work per frame.
const rockColliders = rocks.map((rock, index) => {
  const pose = rockTransform(rock, index)
  const matrix = new Matrix4().compose(new Vector3(...pose.position), new Quaternion().setFromEuler(new Euler(...pose.rotation)), new Vector3(...pose.scale))
  const geometry = new DodecahedronGeometry(1, 0).applyMatrix4(matrix)
  const positions = geometry.getAttribute('position')
  const planes: Plane[] = [], tops: { triangle: Triangle; normalY: number }[] = []
  for (let i = 0; i < positions.count; i += 3) {
    const triangle = new Triangle(new Vector3().fromBufferAttribute(positions, i), new Vector3().fromBufferAttribute(positions, i + 1), new Vector3().fromBufferAttribute(positions, i + 2))
    const plane = triangle.getPlane(new Plane())
    if (!planes.some(existing => existing.normal.distanceToSquared(plane.normal) < 1e-8 && Math.abs(existing.constant - plane.constant) < 1e-5)) planes.push(plane)
    if (plane.normal.y >= .5) tops.push({ triangle, normalY: plane.normal.y })
  }
  geometry.dispose()
  return { rock, planes, tops }
})

function heightOnTriangle(triangle: Triangle, x: number, z: number) {
  const { a, b, c } = triangle
  const determinant = (b.z - c.z) * (a.x - c.x) + (c.x - b.x) * (a.z - c.z)
  if (Math.abs(determinant) < 1e-8) return null
  const u = ((b.z - c.z) * (x - c.x) + (c.x - b.x) * (z - c.z)) / determinant
  const v = ((c.z - a.z) * (x - c.x) + (a.x - c.x) * (z - c.z)) / determinant
  if (u < -1e-5 || v < -1e-5 || u + v > 1.00001) return null
  return u * a.y + v * b.y + (1 - u - v) * c.y
}

export function getSupportSurface(x: number, z: number, maxHeight = Infinity): SupportSurface {
  let result: SupportSurface = { height: 0, visualHeight: 0, kind: 'ground' }
  if (Math.abs(x) <= BOARD_HALF + PLAYER_RADIUS * .4 && Math.abs(z) <= BOARD_HALF + PLAYER_RADIUS * .4 && BOARD_HEIGHT <= maxHeight) {
    result = { height: BOARD_HEIGHT, visualHeight: BOARD_HEIGHT, kind: 'board' }
  }
  for (const { rock, tops } of rockColliders) {
    if (Math.hypot(x - rock.x, z - rock.z) > rock.size * 1.2) continue
    for (const { triangle, normalY } of tops) {
      const visualHeight = heightOnTriangle(triangle, x, z)
      if (visualHeight === null) continue
      // Account for the rounded capsule foot resting on a sloped face.
      const height = visualHeight + PLAYER_RADIUS * (1 / normalY - 1) + SKIN
      if (height > result.height && height <= maxHeight) result = { height, visualHeight, kind: 'rock' }
    }
  }
  return result
}

export function resolvePlayerHorizontal(x: number, z: number, feet: number) {
  const half = BOARD_HALF + PLAYER_RADIUS
  for (let iteration = 0; iteration < 3; iteration++) {
    if (feet < BOARD_HEIGHT - SKIN && Math.abs(x) < half && Math.abs(z) < half) {
      if (half - Math.abs(x) < half - Math.abs(z)) x = (Math.sign(x) || 1) * half
      else z = (Math.sign(z) || 1) * half
    }
    for (const { rock, planes } of rockColliders) {
      if (Math.hypot(x - rock.x, z - rock.z) > rock.size * 1.2 + PLAYER_RADIUS) continue
      let outside = false, depth = Infinity, pushX = 0, pushZ = 0
      for (const plane of planes) {
        const n = plane.normal
        const nearestY = feet + (n.y >= 0 ? PLAYER_RADIUS : PLAYER_HEIGHT - PLAYER_RADIUS)
        const distance = n.x * x + n.y * nearestY + n.z * z + plane.constant
        if (distance >= PLAYER_RADIUS - SKIN) { outside = true; break }
        const horizontalLength = Math.hypot(n.x, n.z)
        if (horizontalLength > .05) {
          const penetration = (PLAYER_RADIUS - distance + SKIN) / horizontalLength
          if (penetration < depth) { depth = penetration; pushX = n.x / horizontalLength; pushZ = n.z / horizontalLength }
        }
      }
      if (!outside && depth < Infinity) { x += pushX * depth; z += pushZ * depth }
    }
  }
  const distance = Math.hypot(x, z), limit = islandRadius(Math.atan2(z, x)) - 1.1
  if (distance > limit) { x *= limit / distance; z *= limit / distance }
  return { x, z }
}

export function stepPlayerBody(body: PlayerBody, moveX: number, moveZ: number, delta: number) {
  const previousY = body.y
  body.velocityY -= GRAVITY * delta
  let nextY = previousY + body.velocityY * delta
  let surface = getSupportSurface(body.x + moveX, body.z + moveZ, previousY + STEP_HEIGHT)
  const stepUp = body.grounded && body.velocityY <= 0 && Math.abs(surface.height - previousY) <= STEP_HEIGHT
  if (stepUp || (body.velocityY <= 0 && previousY >= surface.height - SKIN && nextY <= surface.height)) nextY = surface.height
  const next = resolvePlayerHorizontal(body.x + moveX, body.z + moveZ, nextY)
  surface = getSupportSurface(next.x, next.z, previousY + STEP_HEIGHT)
  if (body.velocityY <= 0 && previousY >= surface.height - SKIN && nextY <= surface.height) nextY = surface.height
  body.x = next.x; body.z = next.z; body.y = Math.max(0, nextY)
  body.grounded = body.velocityY <= 0 && Math.abs(body.y - surface.height) <= SKIN
  if (body.grounded) body.velocityY = 0
}
