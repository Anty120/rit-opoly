import type { RefObject } from 'react'
import type { Vector3 } from 'three'

export type PlayerPosition = RefObject<Vector3>
export type PlayerInput = RefObject<Set<string>>
export interface CameraOrbit { yaw: number; pitch: number; distance: number }
export type OrbitRef = RefObject<CameraOrbit>
