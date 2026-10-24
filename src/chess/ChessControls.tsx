import type { ChessController } from './useChess'
import { squareName } from '../../shared/chess'
import type { ChessKind } from '../../shared/chess'
import './ChessControls.css'
const names = { p:'Pawn',r:'Rook',n:'Knight',b:'Bishop',q:'Queen',k:'King' }
export function ChessControls({ chess }: { chess: ChessController }) {
  const selected = chess.state.pieces.find(p => p.square === chess.selected)
  const colorName = (color: string) => color[0].toUpperCase()+color.slice(1)
  const result = chess.status.kind === 'checkmate' ? `Checkmate · ${colorName(chess.status.winner!)} wins` : chess.status.kind === 'stalemate' ? 'Stalemate · Draw' : `${colorName(chess.state.turn)} to move${chess.status.kind === 'check' ? ' · Check!' : ''}`
  return <section className={`chess-controls${chess.focused ? ' is-focused' : ''}`} aria-label="Chess controls">
    <button disabled={chess.blocked} onClick={() => chess.setFocused(!chess.focused)}>{chess.focused ? 'Back to island' : 'View chess'}</button>
    {chess.focused && <>
      <strong>Chess</strong>
      <p className={`chess-turn${chess.status.winner ? ' is-winner' : ''}`} role="status" aria-live="polite" data-testid="chess-turn">{result}</p>
      <p>{chess.status.kind === 'checkmate' || chess.status.kind === 'stalemate' ? 'Reset the pieces to start a new game.' : 'Select any piece. Only the color to move shows destinations. Green moves, coral captures.'}</p>
      <p data-testid="chess-status">{selected ? `${selected.color} ${names[selected.kind]} · ${squareName(selected.square)} · ${chess.moves.length} possible moves` : 'Select a piece to see its moves.'}</p>
      <label>Promote pawns to <select value={chess.promotion} onChange={event => chess.setPromotion(event.target.value as ChessKind)}><option value="q">Queen</option><option value="r">Rook</option><option value="b">Bishop</option><option value="n">Knight</option></select></label>
      <button disabled={chess.blocked} onClick={chess.reset}>Reset pieces</button>
      <span>Captured white pieces go left; black pieces go right. Esc returns to the island.</span>
      {chess.error && <p role="alert">{chess.error}</p>}
    </>}
  </section>
}
