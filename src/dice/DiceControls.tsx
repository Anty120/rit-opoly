import type { DiceController } from './useDice'
import { DicePips } from './DicePips'
import './DiceControls.css'

export function DiceControls({ dice, disabled }: { dice: DiceController; disabled: boolean }) {
  const { roll, rolling, pending, settledMask } = dice
  const busy = rolling || pending
  return <section className="dice-controls" aria-label="Game dice">
    <span className="dice-caption">LET THE DICE DECIDE</span>
    <div className={`dice-preview${rolling ? ' is-rolling' : ''}`}><DicePips value={!pending && (settledMask & 1) ? roll.first : null} /><DicePips value={!pending && (settledMask & 2) ? roll.second : null} />
      <strong data-testid="dice-total">{busy ? '?' : roll.id ? roll.first + roll.second : '—'}</strong>
    </div>
    <button onClick={event => { dice.requestRoll(); event.currentTarget.blur() }} disabled={disabled || busy || dice.unavailable}>
      {pending ? 'Waiting for room…' : rolling ? 'Rolling…' : 'Roll dice'}
    </button>
    <p role="status" aria-live="polite" data-testid="dice-result">
      {pending ? 'Waiting for room…' : rolling ? 'Rolling the dice…' : roll.id ? `${roll.rollerName} rolled ${roll.first} + ${roll.second}${roll.first === roll.second ? ' · Doubles!' : ''}` : 'Two dice. A little possibility.'}
    </p>
    {dice.error && <p role="alert">{dice.error}</p>}
  </section>
}
