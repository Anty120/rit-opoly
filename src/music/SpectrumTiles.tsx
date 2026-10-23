import { useEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { createVisualizerResources } from './visualizerResources'
import { measureAudioLevel, smoothAudioLevel } from './audioLevel'

export function SpectrumTiles({ analyser, playing }: { analyser: RefObject<AnalyserNode | null>; playing: boolean }) {
  const resources = useMemo(() => createVisualizerResources(), [])
  const samples = useMemo(() => new Float32Array(1024), [])
  const elapsed = useRef(0), settled = useRef(true)
  useEffect(() => () => {
    resources.geometry.dispose(); resources.material.dispose()
  }, [resources])
  useFrame((_, delta) => {
    if (!playing && settled.current) return
    elapsed.current += delta
    if (elapsed.current < 1 / 30) return
    const step = Math.min(elapsed.current, .1); elapsed.current = 0
    const node = analyser.current
    if (playing && node) node.getFloatTimeDomainData(samples)
    const target = playing && node ? measureAudioLevel(samples) : 0
    const level = smoothAudioLevel(resources.energy.value, target, step)
    settled.current = !playing && level < .0005
    // GPU resources are intentionally updated inside R3F's frame callback.
    // oxlint-disable-next-line react/immutability
    resources.energy.value = settled.current ? 0 : level
  })
  return <mesh geometry={resources.geometry} material={resources.material} dispose={null} />
}
