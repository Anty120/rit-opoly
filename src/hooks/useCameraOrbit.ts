import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { MathUtils } from 'three'
import type { OrbitRef } from '../game/types'

export function useCameraOrbit(orbit: OrbitRef) {
  const canvas = useThree(state => state.gl.domElement)
  useEffect(() => {
    let drag: { id: number; x: number; y: number } | null = null
    const down = (event: PointerEvent) => {
      if (event.button !== 0 && event.button !== 2) return
      canvas.setPointerCapture(event.pointerId)
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY }
    }
    const move = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return
      orbit.current.yaw -= (event.clientX - drag.x) * .005
      orbit.current.pitch = MathUtils.clamp(orbit.current.pitch + (event.clientY - drag.y) * .004, .2, 1.1)
      drag.x = event.clientX; drag.y = event.clientY
    }
    const up = () => { drag = null }
    const wheel = (event: WheelEvent) => { event.preventDefault(); orbit.current.distance = MathUtils.clamp(orbit.current.distance + event.deltaY * .012, 7, 23) }
    const contextMenu = (event: Event) => event.preventDefault()
    canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move)
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up); canvas.addEventListener('lostpointercapture', up)
    canvas.addEventListener('wheel', wheel, { passive: false }); canvas.addEventListener('contextmenu', contextMenu)
    window.addEventListener('blur', up)
    return () => {
      canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerup', up); canvas.removeEventListener('pointercancel', up); canvas.removeEventListener('lostpointercapture', up)
      canvas.removeEventListener('wheel', wheel); canvas.removeEventListener('contextmenu', contextMenu)
      window.removeEventListener('blur', up)
    }
  }, [canvas, orbit])
}
