import { useEffect, useMemo, useState } from 'react'
import { applyChessMove, chessMoves, chessStatus, createChessState } from '../../shared/chess'
import type { ChessKind } from '../../shared/chess'
import type { MultiplayerSession } from '../multiplayer/types'

export function useChess(multiplayer: MultiplayerSession, blocked: boolean) {
  const [solo, setSolo] = useState(createChessState)
  const [focused, setFocused] = useState(false)
  const [promotion, setPromotion] = useState<ChessKind>('q')
  const [selection, setSelection] = useState<{ key: string; square: number } | null>(null)
  const state = multiplayer.session ? multiplayer.chess : solo
  const status = useMemo(() => chessStatus(state),[state])
  const key = `${multiplayer.session?.roomId ?? 'solo'}:${state.revision}`
  const selected = selection?.key === key ? selection.square : null
  const moves = useMemo(() => selected === null ? [] : chessMoves(state,selected), [selected,state])
  useEffect(() => {
    if (!focused) return
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setFocused(false) }
    window.addEventListener('keydown',escape)
    return () => window.removeEventListener('keydown',escape)
  }, [focused])
  const click = (square: number) => {
    if (blocked || (multiplayer.session && multiplayer.status !== 'connected')) return
    if (selected !== null && moves.includes(square)) {
      const move = { revision: state.revision, from: selected, to: square, promotion }
      if (multiplayer.session) multiplayer.moveChess(move)
      else setSolo(previous => applyChessMove(previous,move) ?? previous)
      setSelection(null)
    } else setSelection(state.pieces.some(p => p.square === square) && selected !== square ? { key, square } : null)
  }
  const reset = () => {
    if (blocked) return
    if (multiplayer.session) multiplayer.resetChess(state.revision)
    else setSolo(previous => ({ ...createChessState(), revision: previous.revision+1 }))
    setSelection(null)
  }
  return { state, status, selected, moves, click, reset, focused, setFocused, promotion, setPromotion, blocked, error: multiplayer.session ? multiplayer.chessError : '' }
}
export type ChessController = ReturnType<typeof useChess>
