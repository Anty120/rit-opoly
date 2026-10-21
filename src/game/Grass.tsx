import { memo, useEffect, useLayoutEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import type { GameSettings } from '../settings/gameSettings'
import type { PlayerPosition } from './types'
import { createGrassGeometry } from './grass/grassGeometry'
import { createGrassLayout } from './grass/grassLayout'
import { createGrassMaterial } from './grass/grassMaterial'
import { GrassPatch } from './grass/GrassPatch'

export const Grass = memo(function Grass({ player, settings }: { player: PlayerPosition; settings: GameSettings }) {
  const patches = useMemo(createGrassLayout, [])
  const detailed = useMemo(() => createGrassGeometry(3), [])
  const simple = useMemo(() => createGrassGeometry(1), [])
  const uniforms = useMemo(() => ({ time: { value: 0 }, player: { value: player.current },
    height: { value: 1 }, wind: { value: 1 }, density: { value: .85 } }), [player])
  const material = useMemo(() => createGrassMaterial(uniforms), [uniforms])
  useLayoutEffect(() => {
    uniforms.height.value = settings.grassHeight
    uniforms.wind.value = settings.grassWind
    uniforms.density.value = settings.grassDensity
    material.color.set(settings.grassColor)
  }, [material, settings.grassColor, settings.grassHeight, settings.grassWind, settings.grassDensity, uniforms])
  useEffect(() => () => { detailed.dispose(); simple.dispose(); material.dispose() }, [detailed, simple, material])
  useFrame((_, delta) => { uniforms.time.value += Math.min(delta, .05) })
  return <group>{patches.map(patch => <GrassPatch key={patch.id} patch={patch} detailed={detailed} simple={simple} material={material}
    density={settings.grassDensity} shadows={settings.grassShadows} />)}</group>
})
