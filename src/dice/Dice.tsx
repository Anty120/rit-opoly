import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Body } from 'cannon-es'
import type { Mesh } from 'three'
import type { DiceController } from './useDice'
import { createDiceResources } from './diceResources'
import { Die } from './Die'
import { advanceDiceSimulation, createDiceSimulation, DICE_STEPS } from './dicePhysics'
import type { DiceSimulation } from './dicePhysics'

export function Dice({ dice }: { dice: DiceController }) {
  const resources = useMemo(() => createDiceResources(), [])
  const first = useRef<Mesh>(null!), second = useRef<Mesh>(null!)
  const meshes = useMemo(() => [first, second], [])
  const simulation = useRef<DiceSimulation | null>(null), started = useRef(0)
  const reportedMask = useRef(0)
  useLayoutEffect(() => {
    simulation.current = createDiceSimulation(dice.key, [dice.roll.first, dice.roll.second], dice.roll.id === 0)
    started.current = performance.now()
    reportedMask.current = 0
    simulation.current.bodies.forEach((body, index) => {
      meshes[index].current.position.set(body.position.x, body.position.y, body.position.z)
      meshes[index].current.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w).multiply(simulation.current!.corrections[index])
    })
  }, [dice.key, dice.roll.id, dice.roll.first, dice.roll.second, meshes])
  useFrame(() => {
    const state = simulation.current
    if (!state || state.steps >= DICE_STEPS) return
    advanceDiceSimulation(state, (performance.now() - started.current) / 1000)
    state.bodies.forEach((body, index) => {
      meshes[index].current.position.set(body.position.x, body.position.y, body.position.z)
      meshes[index].current.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w).multiply(state.corrections[index])
    })
    const mask = state.steps >= DICE_STEPS ? 3 : state.bodies.reduce((mask, body, index) =>
      mask | (body.sleepState === Body.SLEEPING ? 1 << index : 0), 0)
    if (mask !== reportedMask.current) {
      reportedMask.current = mask
      dice.reportSettled(dice.key, mask)
    }
    if (mask === 3) {
      // Finish when the visible throw stops, rather than waiting out its time cap.
      state.steps = DICE_STEPS
    }
  })
  useEffect(() => () => { resources.geometry.dispose(); resources.material.dispose(); resources.texture.dispose() }, [resources])
  return <group>
    <Die mesh={first} resources={resources} />
    <Die mesh={second} resources={resources} />
  </group>
}
