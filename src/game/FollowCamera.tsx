import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useCameraOrbit } from '../hooks/useCameraOrbit'
import type { OrbitRef, PlayerPosition } from './types'
import { SPAWN } from './world'

export function FollowCamera({ position, orbit, reset }: { position: PlayerPosition; orbit: OrbitRef; reset: number }) {
  const camera = useThree(state => state.camera)
  const target = useMemo(() => new Vector3(), [])
  const lookAt = useMemo(() => new Vector3(), [])
  useCameraOrbit(orbit)
  useEffect(() => {
    Object.assign(orbit.current, { yaw: 0, pitch: .57, distance: 15 })
    lookAt.set(SPAWN[0], 1, SPAWN[2])
    camera.position.set(SPAWN[0], 1 + Math.sin(.57) * 15, SPAWN[2] + Math.cos(.57) * 15)
    camera.lookAt(lookAt)
  }, [camera, lookAt, orbit, reset])
  useFrame((_, frameDelta) => {
    const delta = Math.min(frameDelta, .1), p = position.current, state = orbit.current
    target.set(p.x + Math.sin(state.yaw) * Math.cos(state.pitch) * state.distance,
      p.y + 1 + Math.sin(state.pitch) * state.distance, p.z + Math.cos(state.yaw) * Math.cos(state.pitch) * state.distance)
    camera.position.lerp(target, 1 - Math.exp(-7 * delta))
    target.copy(p); target.y += 1
    lookAt.lerp(target, 1 - Math.exp(-10 * delta)); camera.lookAt(lookAt)
  })
  return null
}
