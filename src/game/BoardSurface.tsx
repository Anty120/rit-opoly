import { useEffect, useLayoutEffect, useMemo } from 'react'
import { useLoader, useThree } from '@react-three/fiber'
import { LinearFilter, LinearMipmapLinearFilter, MeshBasicMaterial, SRGBColorSpace, TextureLoader } from 'three'
import boardImage from '../assets/board.png'
import { BOARD_HALF, BOARD_HEIGHT } from './world'

export function BoardSurface() {
  const texture = useLoader(TextureLoader, boardImage)
  const gl = useThree(state => state.gl)
  useLayoutEffect(() => {
    texture.colorSpace = SRGBColorSpace
    texture.anisotropy = gl.capabilities.getMaxAnisotropy()
    texture.minFilter = LinearMipmapLinearFilter
    texture.magFilter = LinearFilter
    texture.needsUpdate = true
  }, [gl, texture])
  const material = useMemo(() => {
    // Printed colors stay true to the PNG instead of being washed out by the sun.
    const artwork = new MeshBasicMaterial({ map: texture, toneMapped: false })
    artwork.onBeforeCompile = shader => {
      shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
        #ifdef USE_MAP
          vec4 sampledDiffuseColor = texture2D(map, vMapUv, -.65);
          diffuseColor *= sampledDiffuseColor;
        #endif
      `)
    }
    return artwork
  }, [texture])
  useEffect(() => () => material.dispose(), [material])
  return <group position={[0, BOARD_HEIGHT, 0]} rotation={[-Math.PI / 2, 0, 0]}>
    <mesh material={material}>
      <planeGeometry args={[BOARD_HALF * 2, BOARD_HALF * 2]} />
    </mesh>
    <mesh position={[0, 0, .001]} receiveShadow>
      <planeGeometry args={[BOARD_HALF * 2, BOARD_HALF * 2]} />
      <shadowMaterial transparent opacity={.25} depthWrite={false} />
    </mesh>
  </group>
}
