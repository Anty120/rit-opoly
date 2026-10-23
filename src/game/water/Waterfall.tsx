import { useEffect, useMemo } from 'react'
import { createWaterfallGeometry } from './waterGeometry'
import { createWaterMaterial } from './waterMaterial'

export function Waterfall({ time }: { time: { value: number } }) {
  const geometry = useMemo(() => createWaterfallGeometry(), [])
  const material = useMemo(() => createWaterMaterial(time, true), [time])
  useEffect(() => () => { geometry.dispose(); material.dispose() }, [geometry, material])
  return <mesh geometry={geometry} material={material} />
}
