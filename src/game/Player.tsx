import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Mesh, Vector3 } from 'three'
import type { GameSettings } from '../settings/gameSettings'
import type { OrbitRef, PlayerInput, PlayerPosition } from './types'
import { SPAWN } from './world'
import { getSupportSurface, stepPlayerBody } from './playerPhysics'
import type { PlayerBody } from './playerPhysics'
import { PlayerAvatar } from './PlayerAvatar'

export function Player({ position, input, orbit, reset, settings, paused }: {
  position: PlayerPosition; input: PlayerInput; orbit: OrbitRef; reset: number; settings: GameSettings; paused: boolean
}) {
  const character = useRef<Group>(null!)
  const shadow = useRef<Mesh>(null!)
  const velocity = useRef(new Vector3())
  const body = useRef<PlayerBody>({ x: SPAWN[0], y: 0, z: SPAWN[2], velocityY: 0, grounded: true })
  const jumpHeld = useRef(false)
  const direction = useMemo(() => new Vector3(), [])
  const up = useMemo(() => new Vector3(0, 1, 0), [])
  useEffect(() => {
    position.current.set(...SPAWN); velocity.current.set(0, 0, 0)
    Object.assign(body.current, { x: SPAWN[0], y: 0, z: SPAWN[2], velocityY: 0, grounded: true }); jumpHeld.current = false
    character.current.rotation.y = Math.PI
  }, [position, reset])

  useFrame((_, frameDelta) => {
    const delta = Math.min(frameDelta, .1), keys = input.current, p = position.current
    const right = paused ? 0 : Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft'))
    const forward = paused ? 0 : Number(keys.has('KeyW') || keys.has('ArrowUp')) - Number(keys.has('KeyS') || keys.has('ArrowDown'))
    const speed = keys.has('ShiftLeft') || keys.has('ShiftRight') ? Math.max(settings.walkSpeed, settings.runSpeed) : settings.walkSpeed
    direction.set(right, 0, -forward).normalize().applyAxisAngle(up, orbit.current.yaw).multiplyScalar(speed)
    if (paused) velocity.current.set(0, 0, 0)
    if (!paused && keys.has('Space') && !jumpHeld.current && body.current.grounded) {
      body.current.velocityY = settings.jumpStrength
      body.current.grounded = false
    }
    jumpHeld.current = keys.has('Space')
    // Small physics steps keep collision stable at high speeds and on slower frames.
    const steps = Math.ceil(delta / (1 / 60)), step = delta / steps
    for (let i = 0; i < steps; i++) {
      velocity.current.lerp(direction, 1 - Math.exp(-12 * step))
      stepPlayerBody(body.current, velocity.current.x * step, velocity.current.z * step, step)
    }
    p.set(body.current.x, body.current.y, body.current.z)
    character.current.position.copy(p)
    const support = getSupportSurface(p.x, p.z, p.y + .01)
    // Elevated surfaces receive the character's real directional shadow.
    shadow.current.visible = support.kind === 'ground'
    shadow.current.position.y = support.visualHeight + .008 - p.y
    if (velocity.current.lengthSq() > .05) {
      const angle = Math.atan2(velocity.current.x, velocity.current.z)
      character.current.rotation.y += Math.atan2(Math.sin(angle - character.current.rotation.y), Math.cos(angle - character.current.rotation.y)) * (1 - Math.exp(-14 * delta))
    }
  })
  return <PlayerAvatar character={character} shadow={shadow} />
}
