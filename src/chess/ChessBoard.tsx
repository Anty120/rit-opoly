import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { BufferGeometry, Color, Float32BufferAttribute, InstancedMesh, Object3D } from 'three'
import type { ChessController } from './useChess'
import { CHESS_SITE, CHESS_TILE, CHESS_TOP } from './chessLayout'
import { ChessPieces } from './ChessPieces'
import { WinnerCrown } from './WinnerCrown'

function createSquares() {
  const positions: number[] = [], colors: number[] = []
  for (let square=0;square<64;square++) {
    const file = square%8, rank = Math.floor(square/8), x = (file-4)*CHESS_TILE, z = (4-rank)*CHESS_TILE
    const color = new Color((file+rank)%2 ? '#e9dfc3' : '#466b64')
    positions.push(x,CHESS_TOP,z, x+CHESS_TILE,CHESS_TOP,z, x,CHESS_TOP,z-CHESS_TILE,
      x+CHESS_TILE,CHESS_TOP,z, x+CHESS_TILE,CHESS_TOP,z-CHESS_TILE, x,CHESS_TOP,z-CHESS_TILE)
    for (let i=0;i<6;i++) colors.push(color.r,color.g,color.b)
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position',new Float32BufferAttribute(positions,3)); geometry.setAttribute('color',new Float32BufferAttribute(colors,3)); geometry.computeVertexNormals()
  return geometry
}
function MoveHighlights({ chess }: { chess: ChessController }) {
  const mesh = useRef<InstancedMesh>(null!)
  useLayoutEffect(() => {
    const pose = new Object3D(), color = new Color()
    const squares = chess.selected === null ? [] : [chess.selected,...chess.moves]
    squares.forEach((square,index) => {
      pose.position.set((square%8-3.5)*CHESS_TILE,CHESS_TOP+.006,(3.5-Math.floor(square/8))*CHESS_TILE)
      pose.rotation.x = -Math.PI/2; pose.updateMatrix(); mesh.current.setMatrixAt(index,pose.matrix)
      mesh.current.setColorAt(index,color.set(index === 0 ? '#f8cf65' : chess.state.pieces.some(p => p.square === square) ? '#ed8e70' : '#96d8a3'))
    })
    mesh.current.count = squares.length; mesh.current.instanceMatrix.needsUpdate = true
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
    mesh.current.computeBoundingSphere()
  },[chess.selected,chess.moves,chess.state])
  return <instancedMesh ref={mesh} args={[undefined,undefined,64]} raycast={() => {}}>
    <planeGeometry args={[CHESS_TILE*.88,CHESS_TILE*.88]} /><meshBasicMaterial transparent opacity={.7} depthWrite={false} toneMapped={false} />
  </instancedMesh>
}
export function ChessBoard({ chess }: { chess: ChessController }) {
  const squares = useMemo(() => createSquares(),[])
  const winningKing = chess.status.winner ? chess.state.pieces.find(piece => piece.kind === 'k' && piece.color === chess.status.winner) : null
  useEffect(() => () => squares.dispose(),[squares])
  return <group position={[CHESS_SITE.x,0,CHESS_SITE.z]} onClick={event => {
    event.stopPropagation()
    if (event.delta > 5 || chess.blocked) return
    const file = Math.floor((event.point.x-CHESS_SITE.x)/CHESS_TILE+4), rank = Math.floor(4-(event.point.z-CHESS_SITE.z)/CHESS_TILE)
    if (file>=0 && file<8 && rank>=0 && rank<8) chess.click(rank*8+file)
  }}>
    <mesh position={[0,.12,0]} receiveShadow><boxGeometry args={[CHESS_SITE.halfSize*2,.24,CHESS_SITE.halfSize*2]} /><meshLambertMaterial color="#9b987f" /></mesh>
    <mesh position={[0,.255,0]}><boxGeometry args={[9.35,.05,9.35]} /><meshLambertMaterial color="#354e48" /></mesh>
    <mesh geometry={squares}><meshBasicMaterial vertexColors toneMapped={false} fog={false} /></mesh>
    {[-1,1].map(side => <mesh key={side} position={[side*5.55,.245,0]}><boxGeometry args={[1.65,.01,7.4]} /><meshLambertMaterial color={side<0 ? '#d7c7a6' : '#51635e'} /></mesh>)}
    <MoveHighlights chess={chess} />
    <ChessPieces chess={chess} />
    {winningKing && <WinnerCrown king={winningKing} />}
  </group>
}
