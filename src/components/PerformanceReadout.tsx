import { useEffect, useState } from 'react'
import type { RefObject } from 'react'
import type { RuntimeStats } from '../settings/gameSettings'

export function PerformanceReadout({ stats }: { stats: RefObject<RuntimeStats> }) {
  const [snapshot, setSnapshot] = useState(stats.current)
  useEffect(() => {
    const timer = setInterval(() => setSnapshot({ ...stats.current }), 1000)
    return () => clearInterval(timer)
  }, [stats])
  return <div className="performance-readout" aria-label="Rendering performance">
    <strong>{snapshot.fps ? Math.round(snapshot.fps) : '—'} <small>FPS</small></strong>
    <span>{snapshot.frameMs.toFixed(1)} ms · {snapshot.drawCalls} draws<br />{Math.round(snapshot.triangles / 1000)}k triangles · {Math.round(snapshot.dpr * 100)}% scale</span>
  </div>
}
