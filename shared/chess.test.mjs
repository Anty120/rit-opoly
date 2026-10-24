import assert from 'node:assert/strict'
import { test } from 'node:test'
import { applyChessMove, chessMoves, chessStatus, createChessState } from './chess.ts'
const sq = name => 'abcdefgh'.indexOf(name[0]) + (Number(name[1])-1)*8
const move = (state,from,to,promotion) => {
  const next = applyChessMove(state,{ revision:state.revision,from:sq(from),to:sq(to),promotion })
  assert.ok(next, `${from} to ${to}`); return next
}
const position = (entries,turn='white') => ({ revision:0,turn,enPassant:null,pieces:entries.map(([kind,color,square],id) => ({id,kind,color,square:sq(square),moved:false,captured:-1})) })

test('initial legal move tree matches the standard 20 / 400 / 8902 reference counts', () => {
  const count = (state,color,depth) => {
    if (!depth) return 1
    let total = 0
    for (const piece of state.pieces) if (piece.color === color && piece.square >= 0) for (const to of chessMoves(state,piece.square)) {
      const next = applyChessMove(state,{revision:state.revision,from:piece.square,to})
      total += count(next,color === 'white' ? 'black' : 'white',depth-1)
    }
    return total
  }
  for (const [depth,expected] of [[1,20],[2,400],[3,8902]]) assert.equal(count(createChessState(),'white',depth),expected)
})
test('White starts and colors alternate; stale and malformed moves are rejected', () => {
  assert.equal(createChessState().turn,'white')
  assert.deepEqual(chessMoves(createChessState(),sq('a7')),[])
  const first = move(createChessState(),'a2','a4')
  assert.equal(first.turn,'black')
  assert.equal(applyChessMove(first,{revision:1,from:sq('b2'),to:sq('b4')}),null)
  const second = move(first,'a7','a5')
  assert.equal(second.revision,2)
  assert.equal(second.turn,'white')
  for (const input of [null,{}, {revision:0,from:48,to:40},{revision:2,from:-1,to:3},{revision:2,from:0,to:24},{revision:2,from:48,to:40,promotion:'k'}]) assert.equal(applyChessMove(second,input),null)
})
test('captures retain piece identity and assign successive slots per captured color', () => {
  let state = move(createChessState(),'e2','e4')
  state = move(state,'d7','d5'); state = move(state,'e4','d5')
  const first = state.pieces.find(p => p.color === 'black' && p.square < 0)
  assert.equal(first.kind,'p'); assert.equal(first.captured,0)
  state = move(state,'c7','c6'); state = move(state,'d5','c6')
  const captured = state.pieces.filter(p => p.color === 'black' && p.square < 0)
  assert.deepEqual(captured.map(p => p.captured).sort(),[0,1])
  assert.equal(state.pieces.length,32)
})
test('en passant captures the correct pawn and expires on any intervening move', () => {
  let state = move(createChessState(),'e2','e4'); state = move(state,'a7','a6'); state = move(state,'e4','e5'); state = move(state,'d7','d5')
  assert.ok(chessMoves(state,sq('e5')).includes(sq('d6')))
  const capture = move(state,'e5','d6')
  assert.ok(capture.pieces.some(p => p.color === 'black' && p.square === -1 && p.captured === 0))
  state = move(state,'a2','a3')
  state = move(state,'a6','a5')
  assert.ok(!chessMoves(state,sq('e5')).includes(sq('d6')))
})
test('castling moves the rook and cannot cross attacked squares or return moved king rights', () => {
  const initial = position([['k','white','e1'],['r','white','a1'],['r','white','h1'],['k','black','e8']])
  assert.ok(chessMoves(initial,sq('e1')).includes(sq('c1')))
  const castled = move(initial,'e1','g1')
  assert.equal(castled.pieces.find(p => p.kind === 'r' && p.id === 2).square,sq('f1'))
  let returned = move(move(initial,'e1','f1'),'e8','f8')
  returned = move(move(returned,'f1','e1'),'f8','e8')
  assert.ok(!chessMoves(returned,sq('e1')).includes(sq('c1')))
  const attacked = position([['k','white','e1'],['r','white','h1'],['r','black','f8'],['k','black','a8']])
  assert.ok(!chessMoves(attacked,sq('e1')).includes(sq('g1')))
})

test('Fool’s Mate awards Black, stops play, and a reset restores White to move', () => {
  let state=createChessState()
  for (const [from,to] of [['f2','f3'],['e7','e5'],['g2','g4'],['d8','h4']]) state=move(state,from,to)
  assert.deepEqual(chessStatus(state),{kind:'checkmate',winner:'black'})
  assert.equal(state.turn,'white')
  assert.ok(state.pieces.filter(p => p.square>=0).every(p => chessMoves(state,p.square).length===0))
  assert.equal(applyChessMove(state,{revision:state.revision,from:sq('a2'),to:sq('a3')}),null)
  assert.deepEqual(chessStatus(createChessState()),{kind:'playing',winner:null})
})

test('Scholar’s Mate awards White; check and stalemate are distinct from checkmate', () => {
  let state=createChessState()
  for (const [from,to] of [['e2','e4'],['e7','e5'],['d1','h5'],['b8','c6'],['f1','c4'],['g8','f6'],['h5','f7']]) state=move(state,from,to)
  assert.deepEqual(chessStatus(state),{kind:'checkmate',winner:'white'})
  const check=position([['k','white','e1'],['r','black','e8'],['k','black','a8']])
  assert.deepEqual(chessStatus(check),{kind:'check',winner:null})
  const stalemate=position([['k','black','h8'],['k','white','f7'],['q','white','g6']],'black')
  assert.deepEqual(chessStatus(stalemate),{kind:'stalemate',winner:null})
  assert.deepEqual(chessMoves(stalemate,sq('h8')),[])
})
test('pinned pieces and king moves respect check; promotion supports all four choices', () => {
  const pinned = position([['k','white','e1'],['r','white','e2'],['r','black','e8'],['k','black','a8']])
  assert.ok(!chessMoves(pinned,sq('e2')).includes(sq('d2')))
  assert.ok(chessMoves(pinned,sq('e1')).includes(sq('d2')))
  const threatened = position([['k','white','e1'],['r','black','d8'],['k','black','h8']])
  assert.ok(!chessMoves(threatened,sq('e1')).includes(sq('d2')))
  for (const kind of ['q','r','n','b']) {
    const promoted = move(position([['k','white','e1'],['k','black','h8'],['p','white','a7']]),'a7','a8',kind)
    assert.equal(promoted.pieces.find(p => p.square === sq('a8')).kind,kind)
  }
})
