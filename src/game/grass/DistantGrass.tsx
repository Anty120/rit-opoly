import { memo, useEffect, useMemo } from 'react'
import { InstancedBufferAttribute, Sphere, Vector3 } from 'three'
import type { GrassPatchData } from './grassLayout'
import { createGrassGeometry } from './grassGeometry'
import { createGrassMaterial } from './grassMaterial'
import type { GrassUniforms } from './grassMaterial'

function createDistantResources(uniforms: GrassUniforms) {
  const geometry = createGrassGeometry(1), material = createGrassMaterial(uniforms)
  // Keep the palette and lighting of the original grass, with cheaper distant motion.
  const compile = material.onBeforeCompile
  material.onBeforeCompile = (shader, renderer) => {
    compile.call(material, shader, renderer)
    shader.vertexShader = shader.vertexShader
      .replace(/float presence = [^;]+;/, 'float presence = smoothstep(16., 28., distanceToCamera);')
      .replace(/float width = [^;]+;/, 'float width = 3.8;')
      .replace(/float swayTime =[\s\S]*?transformed.y \*= 1\. - flatten \* \.65;/, `
        transformed.x += sin(dot(root.xz, vec2(.62,.43)) - uGrassTime * uSwaySpeed * 4.4) * .055 * uWind * position.y;
      `)
  }
  material.customProgramCacheKey = () => 'distant-mesh-meadow-v1'
  return { geometry, material }
}

const DistantPatch = memo(function DistantPatch({ patch, resources }: {
  patch: GrassPatchData; resources: ReturnType<typeof createDistantResources>
}) {
  const data = useMemo(() => {
    const count = Math.ceil(patch.count / 4), matrices = new Float32Array(count * 16), colors = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      matrices.set(patch.matrices.subarray(i * 64, i * 64 + 16), i * 16)
      colors.set(patch.colors.subarray(i * 12, i * 12 + 3), i * 3)
    }
    return { count, matrices: new InstancedBufferAttribute(matrices,16), colors: new InstancedBufferAttribute(colors,3), bounds: new Sphere(new Vector3(0,.8,0),7.5) }
  }, [patch])
  return <instancedMesh args={[resources.geometry, resources.material, data.count]} position={[patch.x,0,patch.z]}
    instanceMatrix={data.matrices} instanceColor={data.colors} boundingSphere={data.bounds} dispose={null} />
})

// Fixed world-oriented mesh blades, without billboards, transparency or texture cards.
export function DistantGrass({ patches, uniforms, color }: { patches: GrassPatchData[]; uniforms: GrassUniforms; color: string }) {
  const resources = useMemo(() => createDistantResources(uniforms), [uniforms])
  useEffect(() => { resources.material.color.set(color) }, [resources, color])
  useEffect(() => () => { resources.geometry.dispose(); resources.material.dispose() }, [resources])
  return <group>{patches.map(patch => <DistantPatch key={patch.id} patch={patch} resources={resources} />)}</group>
}
