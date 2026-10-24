import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { InstancedMesh, Object3D } from 'three'
import type { ChessPiece, ChessColor, ChessKind } from '../../shared/chess'
import type { ChessController } from './useChess'
import { createPieceGeometry } from './pieceGeometry'
import { chessPosition } from './chessLayout'

function PieceBatch({ kind, color, pieces, chess }: { kind: ChessKind; color: ChessColor; pieces: ChessPiece[]; chess: ChessController }) {
  const mesh = useRef<InstancedMesh>(null!)
  const geometry = useMemo(() => createPieceGeometry(kind),[kind])
  useEffect(() => () => geometry.dispose(),[geometry])
  useLayoutEffect(() => {
    const pose = new Object3D()
    pieces.forEach((piece,index) => {
      pose.position.set(...chessPosition(piece)); pose.rotation.y = color === 'white' ? -Math.PI/2 : Math.PI/2
      pose.updateMatrix(); mesh.current.setMatrixAt(index,pose.matrix)
    })
    mesh.current.count = pieces.length; mesh.current.instanceMatrix.needsUpdate = true; mesh.current.computeBoundingSphere()
  },[pieces,color])
  return <instancedMesh ref={mesh} args={[geometry,undefined,16]} onClick={event => {
    event.stopPropagation()
    const piece = pieces[event.instanceId ?? -1]
    if (event.delta <= 5 && piece && piece.square >= 0) chess.click(piece.square)
  }}>
    <meshLambertMaterial color={color === 'white' ? '#f0dfb6' : '#283c42'} />
  </instancedMesh>
}
export function ChessPieces({ chess }: { chess: ChessController }) {
  const groups = useMemo(() => (['white','black'] as const).flatMap(color => (['p','r','n','b','q','k'] as const).map(kind => ({ color,kind,pieces: chess.state.pieces.filter(p => p.color === color && p.kind === kind) }))),[chess.state])
  return <group>{groups.map(group => <PieceBatch key={`${group.color}${group.kind}`} {...group} chess={chess} />)}</group>
}
