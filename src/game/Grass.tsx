import { memo, useEffect, useLayoutEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector2 } from 'three'
import type { GameSettings } from '../settings/gameSettings'
import type { PlayerPosition } from './types'
import { createGrassGeometry } from './grass/grassGeometry'
import { createGrassLayout } from './grass/grassLayout'
import { createGrassMaterial } from './grass/grassMaterial'
import { GrassPatch } from './grass/GrassPatch'
import { createWindField } from './grass/windField'
import { DistantGrass } from './grass/DistantGrass'

export const Grass = memo(function Grass({ player, settings }: { player: PlayerPosition; settings: GameSettings }) {
  const patches = useMemo(createGrassLayout, [])
  const geometry = useMemo(() => createGrassGeometry(2), [])
  const windField = useMemo(createWindField, [])
  const uniforms = useMemo(() => ({ time: { value: 0 }, player: { value: player.current },
    height: { value: 1 }, wind: { value: 1 }, swaySpeed: { value: 1 }, density: { value: .85 },
    windField: { value: windField }, direction: { value: new Vector2(.88, .47) } }), [player, windField])
  const material = useMemo(() => createGrassMaterial(uniforms), [uniforms])
  useLayoutEffect(() => {
    uniforms.height.value = settings.grassHeight
    uniforms.wind.value = settings.grassWind
    uniforms.swaySpeed.value = settings.grassSwaySpeed
    uniforms.density.value = settings.grassDensity
    material.color.set(settings.grassColor)
  }, [material, settings.grassColor, settings.grassHeight, settings.grassWind, settings.grassSwaySpeed, settings.grassDensity, uniforms])
  useEffect(() => () => { geometry.dispose(); material.dispose(); windField.dispose() }, [geometry, material, windField])
  useFrame((_, delta) => {
    uniforms.time.value += Math.min(delta, .1)
    const time = uniforms.time.value * settings.grassSwaySpeed
    // The prevailing direction drifts gradually; individual blades share a coherent breeze.
    const heading = .49 + Math.sin(time * .21) * .16 + Math.sin(time * .53) * .055
    uniforms.direction.value.set(Math.cos(heading), Math.sin(heading))
  })
  return <group><DistantGrass patches={patches} uniforms={uniforms} color={settings.grassColor} />{patches.map(patch => <GrassPatch key={patch.id} patch={patch} geometry={geometry} material={material}
    density={settings.grassDensity} shadows={settings.grassShadows} />)}</group>
})
