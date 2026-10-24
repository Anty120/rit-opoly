import { GAME_SITES } from './worldConfig.ts'

export function distanceToBoard(x: number, z: number) {
  let nearest = Infinity
  for (const site of GAME_SITES) {
    nearest = Math.min(nearest, Math.hypot(Math.max(0,Math.abs(x-site.x)-site.halfSize),Math.max(0,Math.abs(z-site.z)-site.halfSize)))
  }
  return nearest
}

export function resolutionLimits(distance: number, maximum: number, focused = false) {
  // Protect readable board artwork in an eight-unit apron around every game site.
  const t = focused ? 0 : Math.max(0,Math.min(1,(distance-8)/20))
  const blend = t*t*(3-2*t)
  return { minimum: .9-.3*blend, maximum: maximum-(maximum-.75)*blend }
}

export function nextResolution(current: number, fps: number, minimum: number, maximum: number) {
  const clamped = Math.max(minimum,Math.min(maximum,current))
  // Small steps and separate thresholds avoid quality oscillation around 50 FPS.
  return Math.max(minimum,Math.min(maximum,clamped+(fps<51 ? -.05 : fps>58 ? .025 : 0)))
}
