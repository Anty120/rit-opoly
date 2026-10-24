import { useEffect, useState } from 'react'

export function useNativeResolution(scale: number) {
  const [ratio,setRatio] = useState(() => window.devicePixelRatio || 1)
  useEffect(() => {
    let screen: MediaQueryList
    const update = () => {
      const value = window.devicePixelRatio || 1
      setRatio(value)
      screen?.removeEventListener('change',update)
      screen = window.matchMedia(`(resolution: ${value}dppx)`)
      screen.addEventListener('change',update)
    }
    update()
    window.addEventListener('resize',update)
    return () => { screen.removeEventListener('change',update); window.removeEventListener('resize',update) }
  },[])
  return ratio*Math.max(1,scale)
}
