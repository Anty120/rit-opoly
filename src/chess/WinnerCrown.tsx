import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, CanvasTexture, ConeGeometry, Group, LatheGeometry, SRGBColorSpace, Vector2 } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import type { BufferGeometry } from 'three'
import type { ChessPiece } from '../../shared/chess'
import { chessPosition } from './chessLayout'

function createCrown() {
  const ring = new LatheGeometry([[.28,0],[.34,0],[.35,.13],[.28,.13],[.28,0]].map(([x,y]) => new Vector2(x,y)),16)
  const parts: BufferGeometry[] = [ring]
  for (let i=0;i<5;i++) {
    const angle=i*Math.PI*2/5
    parts.push(new ConeGeometry(.12,.38,5).translate(Math.cos(angle)*.3,.25,Math.sin(angle)*.3))
  }
  const plain=parts.map(part => { const geometry=part.toNonIndexed();geometry.deleteAttribute('uv');return geometry })
  const geometry=mergeGeometries(plain)!
  parts.forEach(part => part.dispose());plain.forEach(part => part.dispose())
  const canvas=document.createElement('canvas');canvas.width=canvas.height=128
  const context=canvas.getContext('2d')!,gradient=context.createRadialGradient(64,64,0,64,64,64)
  gradient.addColorStop(0,'rgba(255,222,110,.6)');gradient.addColorStop(.35,'rgba(255,194,48,.25)');gradient.addColorStop(1,'rgba(255,170,0,0)')
  context.fillStyle=gradient;context.fillRect(0,0,128,128)
  const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace
  return {geometry,texture}
}

export function WinnerCrown({ king }: { king: ChessPiece }) {
  const resources=useMemo(() => createCrown(),[])
  const group=useRef<Group>(null!)
  const base=chessPosition(king)
  useFrame(({clock},delta) => {
    group.current.position.y=base[1]+1.65+Math.sin(clock.elapsedTime*2)*.06
    group.current.rotation.y+=Math.min(delta,.1)*.4
  })
  useEffect(() => () => {resources.geometry.dispose();resources.texture.dispose()},[resources])
  return <group ref={group} position={[base[0],base[1]+1.65,base[2]]} name="chess-winning-crown" userData={{winner:king.color}}>
    <sprite position={[0,.2,0]} scale={[1.9,1.9,1]} raycast={() => {}}>
      <spriteMaterial map={resources.texture} blending={AdditiveBlending} transparent depthWrite={false} toneMapped={false} />
    </sprite>
    <mesh geometry={resources.geometry} raycast={() => {}}><meshBasicMaterial color="#ffcf4d" toneMapped={false} /></mesh>
  </group>
}
