import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

export function SceneWarmup() {
  const { gl, scene, camera } = useThree()
  useEffect(() => {
    // Include offscreen materials, so walking into a new view doesn't compile
    // their shaders for the first time. The board texture is loaded on mount.
    void gl.compileAsync(scene, camera).catch(error => console.warn('Scene shader warmup failed', error))
  }, [gl, scene, camera])
  return null
}
