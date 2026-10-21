import type { PlayerInput } from '../game/types'

export function TouchControls({ input, disabled }: { input: PlayerInput; disabled: boolean }) {
  return <nav className="touch-controls" aria-label="Player movement">
    {(['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'] as const).map((key, index) => (
      <button key={key} disabled={disabled} aria-label={['Move forward', 'Move left', 'Move backward', 'Move right'][index]}
        onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); input.current.add(key) }}
        onPointerUp={() => input.current.delete(key)} onPointerCancel={() => input.current.delete(key)}
        onLostPointerCapture={() => input.current.delete(key)}>{['\u2191', '\u2190', '\u2193', '\u2192'][index]}</button>
    ))}
  </nav>
}
