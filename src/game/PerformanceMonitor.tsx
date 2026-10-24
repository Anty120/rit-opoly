import { useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type { RuntimeStats } from '../settings/gameSettings'

// Observe performance without changing the display's pixel resolution.
export function PerformanceMonitor({ stats }: { stats: RefObject<RuntimeStats> }) {
  const sample = useRef({seconds:0,frames:0})
  useFrame(({gl,viewport},delta) => {
    if (document.hidden || delta>1) return
    const current=sample.current
    current.seconds+=delta; current.frames++
    if (current.seconds<1) return
    const frameMs=current.seconds*1000/current.frames
    Object.assign(stats.current,{fps:1000/frameMs,frameMs,drawCalls:gl.info.render.calls,
      triangles:gl.info.render.triangles,dpr:viewport.dpr/(window.devicePixelRatio||1)})
    current.seconds=0;current.frames=0
  })
  return null
}
