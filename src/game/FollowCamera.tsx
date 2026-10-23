import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useCameraOrbit } from '../hooks/useCameraOrbit'
import type { OrbitRef, PlayerPosition } from './types'
import { SPAWN } from './world'
import { DEFAULT_CAMERA_ORBIT } from './cameraConfig'

export function FollowCamera({ position, orbit, reset, spawn = SPAWN }: { position: PlayerPosition; orbit: OrbitRef; reset: number; spawn?: readonly [number, number, number] }) {
  const camera = useThree(state => state.camera)
  const target = useMemo(() => new Vector3(), [])
  const lookAt = useMemo(() => new Vector3(), [])
  useCameraOrbit(orbit)
  useEffect(() => {
    Object.assign(orbit.current, DEFAULT_CAMERA_ORBIT)
    lookAt.set(spawn[0], 1, spawn[2])
    camera.position.set(spawn[0], 1 + Math.sin(DEFAULT_CAMERA_ORBIT.pitch) * DEFAULT_CAMERA_ORBIT.distance, spawn[2] + Math.cos(DEFAULT_CAMERA_ORBIT.pitch) * DEFAULT_CAMERA_ORBIT.distance)
    camera.lookAt(lookAt)
  }, [camera, lookAt, orbit, reset, spawn])
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
