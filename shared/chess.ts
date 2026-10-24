export type ChessColor = 'white' | 'black'
export type ChessKind = 'p' | 'r' | 'n' | 'b' | 'q' | 'k'
export interface ChessPiece { id: number; color: ChessColor; kind: ChessKind; square: number; moved: boolean; captured: number }
export interface ChessState { revision: number; turn: ChessColor; pieces: ChessPiece[]; enPassant: { square: number; pawn: number } | null }
export interface ChessStatus { kind: 'playing' | 'check' | 'checkmate' | 'stalemate'; winner: ChessColor | null }
export interface ChessMove { revision: number; from: number; to: number; promotion?: ChessKind }
const back: ChessKind[] = ['r','n','b','q','k','b','n','r']
const at = (state: ChessState, square: number) => state.pieces.find(p => p.square === square)
const xy = (square: number) => [square % 8, Math.floor(square / 8)]
const inside = (x: number, y: number) => x >= 0 && x < 8 && y >= 0 && y < 8
export const squareName = (square: number) => `${'abcdefgh'[square % 8]}${Math.floor(square / 8) + 1}`

export function createChessState(): ChessState {
  const pieces: ChessPiece[] = []
  for (const color of ['white','black'] as const) for (let file = 0; file < 8; file++) {
    pieces.push({ id: pieces.length, color, kind: back[file], square: (color === 'white' ? 0 : 56) + file, moved: false, captured: -1 })
    pieces.push({ id: pieces.length, color, kind: 'p', square: (color === 'white' ? 8 : 48) + file, moved: false, captured: -1 })
  }
  return { revision: 0, turn: 'white', pieces, enPassant: null }
}

function attacked(state: ChessState, square: number, by: ChessColor) {
  const [tx,ty] = xy(square)
  return state.pieces.some(piece => {
    if (piece.square < 0 || piece.color !== by) return false
    const [x,y] = xy(piece.square), dx = tx-x, dy = ty-y, ax = Math.abs(dx), ay = Math.abs(dy)
    if (piece.kind === 'p') return ax === 1 && dy === (by === 'white' ? 1 : -1)
    if (piece.kind === 'n') return ax * ay === 2
    if (piece.kind === 'k') return Math.max(ax,ay) === 1
    if (!(ax === ay && ax > 0 && piece.kind !== 'r') && !((dx === 0 || dy === 0) && ax+ay > 0 && piece.kind !== 'b')) return false
    for (let i = 1; i < Math.max(ax,ay); i++) if (at(state, (y+Math.sign(dy)*i)*8+x+Math.sign(dx)*i)) return false
    return true
  })
}

function candidates(state: ChessState, piece: ChessPiece) {
  const result: number[] = [], [x,y] = xy(piece.square), enemy: ChessColor = piece.color === 'white' ? 'black' : 'white'
  const add = (nx: number, ny: number) => {
    if (!inside(nx,ny)) return false
    const occupant = at(state, ny*8+nx)
    if (occupant?.color === piece.color || occupant?.kind === 'k') return false
    result.push(ny*8+nx)
    return !occupant
  }
  if (piece.kind === 'p') {
    const direction = piece.color === 'white' ? 1 : -1, start = piece.color === 'white' ? 1 : 6
    if (inside(x,y+direction) && !at(state,(y+direction)*8+x)) {
      add(x,y+direction)
      if (!piece.moved && y === start && !at(state,(y+direction*2)*8+x)) add(x,y+direction*2)
    }
    for (const dx of [-1,1]) {
      if (!inside(x+dx,y+direction)) continue
      const target = (y+direction)*8+x+dx, victim = at(state,target)
      const ep = state.enPassant?.square === target && state.pieces.some(p => p.id === state.enPassant!.pawn && p.kind === 'p' && p.color === enemy && p.square === y*8+x+dx)
      if (victim?.color === enemy || ep) add(x+dx,y+direction)
    }
  } else if (piece.kind === 'n') {
    for (const [dx,dy] of [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]]) add(x+dx,y+dy)
  } else if (piece.kind === 'k') {
    for (let dx=-1; dx<=1; dx++) for (let dy=-1; dy<=1; dy++) if (dx || dy) add(x+dx,y+dy)
    const home = piece.color === 'white' ? 0 : 7
    if (!piece.moved && x === 4 && y === home && !attacked(state,piece.square,enemy)) for (const side of [-1,1]) {
      const rook = at(state,y*8+(side === 1 ? 7 : 0))
      if (!rook || rook.kind !== 'r' || rook.color !== piece.color || rook.moved) continue
      const files = side === 1 ? [5,6] : [1,2,3]
      if (files.every(file => !at(state,y*8+file)) && [4+side,4+side*2].every(file => !attacked(state,y*8+file,enemy))) result.push(y*8+4+side*2)
    }
  } else {
    const directions = piece.kind === 'b' ? [[1,1],[-1,1],[1,-1],[-1,-1]] : piece.kind === 'r' ? [[1,0],[-1,0],[0,1],[0,-1]] : [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]]
    for (const [dx,dy] of directions) for (let i=1; i<8; i++) if (!add(x+dx*i,y+dy*i)) break
  }
  return result
}

function execute(state: ChessState, from: number, to: number, promotion: ChessKind = 'q'): ChessState {
  const next: ChessState = { revision: state.revision+1, turn: state.turn === 'white' ? 'black' : 'white', pieces: state.pieces.map(p => ({ ...p })), enPassant: null }
  const piece = at(next,from)!, originalKind = piece.kind
  let victim = at(next,to)
  if (originalKind === 'p' && to === state.enPassant?.square && from % 8 !== to % 8 && !victim) victim = next.pieces.find(p => p.id === state.enPassant!.pawn)
  if (victim) {
    victim.captured = next.pieces.filter(p => p.color === victim!.color && p.square < 0).length
    victim.square = -1
  }
  if (originalKind === 'k' && Math.abs(to-from) === 2) {
    const rook = at(next,Math.floor(from/8)*8+(to > from ? 7 : 0))!
    rook.square = from+(to > from ? 1 : -1); rook.moved = true
  }
  if (originalKind === 'p' && Math.abs(to-from) === 16) next.enPassant = { square: (from+to)/2, pawn: piece.id }
  piece.square = to; piece.moved = true
  if (originalKind === 'p' && (to < 8 || to >= 56)) piece.kind = ['q','r','b','n'].includes(promotion) ? promotion : 'q'
  return next
}

function legalMoves(state: ChessState, from: number) {
  const piece = at(state,from)
  if (!piece) return []
  return candidates(state,piece).filter(to => {
    const next = execute(state,from,to), king = next.pieces.find(p => p.color === piece.color && p.kind === 'k' && p.square >= 0)
    return !king || !attacked(next,king.square,piece.color === 'white' ? 'black' : 'white')
  })
}

export function chessMoves(state: ChessState, from: number) {
  if (at(state,from)?.color !== state.turn) return []
  return legalMoves(state,from)
}

export function chessStatus(state: ChessState): ChessStatus {
  const enemy = state.turn === 'white' ? 'black' : 'white'
  const king = state.pieces.find(p => p.color === state.turn && p.kind === 'k' && p.square >= 0)
  const check = !!king && attacked(state,king.square,enemy)
  const canMove = state.pieces.some(p => p.color === state.turn && p.square >= 0 && legalMoves(state,p.square).length > 0)
  return canMove ? { kind: check ? 'check' : 'playing', winner: null } : { kind: check ? 'checkmate' : 'stalemate', winner: check ? enemy : null }
}

export function applyChessMove(state: ChessState, input: unknown): ChessState | null {
  if (!input || typeof input !== 'object') return null
  const move = input as ChessMove
  if (move.revision !== state.revision || !Number.isInteger(move.from) || !Number.isInteger(move.to) || move.from < 0 || move.from > 63 || move.to < 0 || move.to > 63) return null
  if (move.promotion !== undefined && !['q','r','b','n'].includes(move.promotion)) return null
  return chessMoves(state,move.from).includes(move.to) ? execute(state,move.from,move.to,move.promotion) : null
}
