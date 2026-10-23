import { BRIDGES } from '../worldConfig'
import { useEffect, useMemo } from 'react'
import { createBridgeGeometry } from './bridgeGeometry'

function ArchBridge({ bridge }: { bridge: typeof BRIDGES[number] }) {
  const deck = useMemo(() => createBridgeGeometry(bridge), [bridge])
  const rail = useMemo(() => createBridgeGeometry(bridge, true), [bridge])
  useEffect(() => () => { deck.dispose(); rail.dispose() }, [deck, rail])
  return <group position={[bridge.x,0,bridge.z]}>
    <mesh geometry={deck} position={[0,0,-bridge.halfZ]} castShadow receiveShadow><meshLambertMaterial color="#bbaa84" /></mesh>
    {[-bridge.halfZ - .18, bridge.halfZ].map(z => <mesh key={z} geometry={rail} position={[0,0,z]} castShadow receiveShadow><meshLambertMaterial color="#96856b" /></mesh>)}
  </group>
}

export function Bridges() {
  return <group>{BRIDGES.map((bridge, index) => <ArchBridge key={index} bridge={bridge} />)}</group>
}
