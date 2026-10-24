import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import { CHESS_SITE } from './chessLayout'
export function ChessCamera() {
  const position = useRef(new Vector3(CHESS_SITE.x,16.5,CHESS_SITE.z+10.5))
  const target = useRef(new Vector3(CHESS_SITE.x,.25,CHESS_SITE.z))
  useFrame(({ camera, size },delta) => {
    const distance = Math.max(19.5,6.9/(Math.tan(Math.PI*50/360)*(size.width/size.height))*1.12)
    target.current.z = CHESS_SITE.z + (size.width/size.height < .8 ? 3 : 0)
    position.current.set(CHESS_SITE.x,distance*.846,CHESS_SITE.z+distance*.538)
    camera.position.lerp(position.current,1-Math.exp(-8*Math.min(delta,.1))); camera.lookAt(target.current)
  })
  return null
}
