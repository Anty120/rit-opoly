import { CHESS_SITE, CHESS_SURFACE_HEIGHT } from '../game/worldConfig'
import type { ChessPiece } from '../../shared/chess'
export const CHESS_TILE = 1.1
export const CHESS_TOP = CHESS_SURFACE_HEIGHT
export { CHESS_SITE }
export function chessPosition(piece: ChessPiece): [number,number,number] {
  if (piece.square >= 0) return [(piece.square % 8 - 3.5)*CHESS_TILE, CHESS_TOP, (3.5-Math.floor(piece.square/8))*CHESS_TILE]
  return [(piece.color === 'white' ? -1 : 1)*(5.15 + piece.captured % 2 * .8), .25, (Math.floor(piece.captured/2)-3.5)*.85]
}
