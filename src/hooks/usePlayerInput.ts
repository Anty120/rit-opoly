import { useEffect } from 'react'
import type { PlayerInput } from '../game/types'

export function usePlayerInput(input: PlayerInput, onReset: () => void, paused: boolean) {
  useEffect(() => {
    const keys = input.current
    keys.clear()
    const allowed = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight', 'Space'])
    const down = (event: KeyboardEvent) => {
      if (paused || (event.target instanceof HTMLElement && event.target.closest('input, select, textarea, button, [contenteditable="true"]'))) return
      if (event.code === 'KeyR') { if (!event.repeat) onReset(); return }
      if (allowed.has(event.code)) { event.preventDefault(); keys.add(event.code) }
    }
    const up = (event: KeyboardEvent) => { keys.delete(event.code) }
    const clear = () => keys.clear()
    const visibility = () => { if (document.hidden) clear() }
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('blur', clear)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      clear()
      window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', clear)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [input, onReset, paused])
}
