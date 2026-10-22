import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Mesh, Vector3 } from 'three'
import type { RefObject } from 'react'
import type { PlayerIdentity, PlayerSnapshot } from '../../shared/protocol'
import { PlayerAvatar } from '../game/PlayerAvatar'
import { getSupportSurface } from '../game/playerPhysics'
import { PlayerName } from './PlayerName'

export function RemotePlayer({ identity, targets }: { identity: PlayerIdentity; targets: RefObject<Map<string, PlayerSnapshot>> }) {
  const character = useRef<Group>(null!), shadow = useRef<Mesh>(null!)
  const [initial] = useState<[number, number, number]>(() => {
    const pose = targets.current.get(identity.sessionId)
    return pose ? [pose.x, pose.y, pose.z] : [0, 0, 8]
  })
  const target = useMemo(() => new Vector3(), [])
  useFrame((_, delta) => {
    const pose = targets.current.get(identity.sessionId)
    if (!pose) return
    target.set(pose.x, pose.y, pose.z)
    const model = character.current
    if (model.position.distanceToSquared(target) > 16) model.position.copy(target)
    else model.position.lerp(target, 1 - Math.exp(-14 * Math.min(delta, .1)))
    model.rotation.y += Math.atan2(Math.sin(pose.yaw - model.rotation.y), Math.cos(pose.yaw - model.rotation.y)) * (1 - Math.exp(-18 * Math.min(delta, .1)))
    const surface = getSupportSurface(model.position.x, model.position.z, model.position.y + .01)
    shadow.current.visible = surface.kind === 'ground'
    shadow.current.position.y = surface.visualHeight + .008 - model.position.y
  })
  return <PlayerAvatar character={character} shadow={shadow} color={identity.color} spawn={initial}><PlayerName name={identity.name} /></PlayerAvatar>
}
