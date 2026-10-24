import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { GameSettings } from '../settings/gameSettings'
import type { PlayerPosition } from './types'
import { distanceToBoard, nextResolution, resolutionLimits } from './resolutionPolicy'

export function DistanceResolution({ player, settings, focused }: { player: PlayerPosition; settings: GameSettings; focused: boolean }) {
  const timing = useRef({ seconds: 0, frames: 0, cooldown: 0 })
  useFrame(({ camera, viewport, setDpr }, delta) => {
    if (document.hidden || delta > .5) return
    const native = window.devicePixelRatio || 1
    const current = viewport.dpr/native
    const sample = timing.current
    if (!settings.distanceResolution) {
      if (Math.abs(current-settings.renderScale) > .001) setDpr(native*settings.renderScale)
      sample.seconds=sample.frames=sample.cooldown=0
      return
    }
    // Either a close player or a close camera protects detail, including zoom/orbit.
    const distance = Math.min(distanceToBoard(player.current.x,player.current.z),distanceToBoard(camera.position.x,camera.position.z))
    const limits = resolutionLimits(distance,settings.renderScale,focused)
    sample.seconds+=delta;sample.frames++;sample.cooldown+=delta
    // Restore the near-board minimum immediately, even during the cooldown.
    if (current < limits.minimum-.001) {
      // Quantize increases to avoid reallocating the canvas every walking frame.
      setDpr(native*Math.ceil(limits.minimum*20)/20)
      sample.seconds=sample.frames=sample.cooldown=0
    } else if (sample.cooldown >= 1.5) {
      const next = nextResolution(current,sample.frames/sample.seconds,limits.minimum,limits.maximum)
      if (current > limits.maximum+.001 || Math.abs(next-current) >= .015) setDpr(native*next)
      sample.seconds=sample.frames=sample.cooldown=0
    }
  })
  return null
}
