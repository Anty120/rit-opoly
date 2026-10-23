export const DICE_ROLL_MS = 4200
// Rate-limit repeated network requests without adding a full animation delay.
export const DICE_REQUEST_COOLDOWN_MS = 750
export interface DiceRoll { id: number; first: number; second: number; rollerId: string; rollerName: string }
export const INITIAL_DICE: DiceRoll = { id: 0, first: 1, second: 1, rollerId: '', rollerName: '' }

// Reject the last four byte values so each face has exactly 42 outcomes.
export function randomDie(fill = (bytes: Uint8Array<ArrayBuffer>) => { globalThis.crypto.getRandomValues(bytes) }) {
  const bytes = new Uint8Array(1)
  do { fill(bytes) } while (bytes[0] >= 252)
  return bytes[0] % 6 + 1
}
