import { useCallback, useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { GameSettings, RuntimeStats } from '../settings/gameSettings'

export function PerformanceMonitor({ settings, stats, onDprChange }: { settings: GameSettings; stats: RefObject<RuntimeStats>; onDprChange: (value: number) => void }) {
  const setDpr = useThree(state => state.setDpr)
  const applyDpr = useCallback((value: number) => {
    setDpr(value)
    onDprChange(value)
  }, [setDpr, onDprChange])
  const sample = useRef({ seconds: 0, frames: 0, goodWindows: 0, settle: 0 })
  useEffect(() => {
    // Start with headroom for movement; the selected scale remains the ceiling.
    applyDpr(settings.adaptiveQuality ? Math.min(.8, settings.renderScale) : settings.renderScale)
    sample.current = { seconds: 0, frames: 0, goodWindows: 0, settle: 0 }
  }, [settings.renderScale, settings.adaptiveQuality, applyDpr])
  useFrame(({ gl, viewport }, delta) => {
    if (document.hidden || delta > 1) return
    const current = sample.current
    current.seconds += delta; current.frames++; current.settle += delta
    if (current.seconds < 1) return
    const frameMs = current.seconds * 1000 / current.frames
    Object.assign(stats.current, { fps: 1000 / frameMs, frameMs, drawCalls: gl.info.render.calls, triangles: gl.info.render.triangles, dpr: viewport.dpr })
    if (settings.adaptiveQuality && current.settle > 2) {
      // Favor smooth movement on slower GPUs; avoid resizing every slow frame.
      const floor = Math.min(.65, settings.renderScale)
      if (frameMs > 18.2 && viewport.dpr > floor) {
        applyDpr(Math.max(floor, Math.round((viewport.dpr - .1) * 100) / 100)); current.goodWindows = 0; current.settle = 0
      } else if (frameMs < 16.9) {
        current.goodWindows++
        if (current.goodWindows >= 8 && viewport.dpr < settings.renderScale) {
          applyDpr(Math.min(settings.renderScale, Math.round((viewport.dpr + .05) * 100) / 100)); current.goodWindows = 0; current.settle = 0
        }
      } else current.goodWindows = 0
    }
    current.seconds = 0; current.frames = 0
  })
  return null
}
