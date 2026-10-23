import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { createRiverGeometry } from './waterGeometry'
import { createWaterMaterial } from './waterMaterial'
import { Waterfall } from './Waterfall'

export function River() {
  const time = useMemo(() => ({ value: 0 }), [])
  const geometry = useMemo(() => createRiverGeometry(), [])
  const material = useMemo(() => createWaterMaterial(time), [time])
  // oxlint-disable-next-line react/immutability -- Three.js uniforms are mutable render state, not React state.
  useFrame((_, delta) => { time.value += Math.min(delta, .1) })
  useEffect(() => () => { geometry.dispose(); material.dispose() }, [geometry, material])
  return <group>
    <mesh geometry={geometry} material={material} />
    <Waterfall time={time} />
  </group>
}
