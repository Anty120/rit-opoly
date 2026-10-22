import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { GameSettings, RuntimeStats } from '../settings/gameSettings'

export function PerformanceMonitor({ settings, stats }: { settings: GameSettings; stats: RefObject<RuntimeStats> }) {
  const setDpr = useThree(state => state.setDpr)
  const sample = useRef({ seconds: 0, frames: 0, goodWindows: 0, settle: 0 })
  useEffect(() => {
    setDpr(settings.renderScale)
    sample.current = { seconds: 0, frames: 0, goodWindows: 0, settle: 0 }
  }, [settings.renderScale, settings.adaptiveQuality, setDpr])
  useFrame(({ gl, viewport }, delta) => {
    if (document.hidden || delta > 1) return
    const current = sample.current
    current.seconds += delta; current.frames++; current.settle += delta
    if (current.seconds < 1) return
    const frameMs = current.seconds * 1000 / current.frames
    Object.assign(stats.current, { fps: 1000 / frameMs, frameMs, drawCalls: gl.info.render.calls, triangles: gl.info.render.triangles, dpr: viewport.dpr })
    if (settings.adaptiveQuality && current.settle > 3) {
      // Preserve fine board lettering; lower scales remain available by explicit choice.
      const floor = Math.min(.85, settings.renderScale)
      if (frameMs > 24 && viewport.dpr > floor) {
        setDpr(Math.max(floor, Math.round((viewport.dpr - .1) * 100) / 100)); current.goodWindows = 0
      } else if (frameMs < 18) {
        current.goodWindows++
        if (current.goodWindows >= 5 && viewport.dpr < settings.renderScale) {
          setDpr(Math.min(settings.renderScale, Math.round((viewport.dpr + .05) * 100) / 100)); current.goodWindows = 0
        }
      } else current.goodWindows = 0
    }
    current.seconds = 0; current.frames = 0
  })
  return null
}
