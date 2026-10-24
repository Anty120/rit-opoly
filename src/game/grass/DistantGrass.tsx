import { useEffect, useMemo } from 'react'
import { DoubleSide, MeshLambertMaterial } from 'three'
import type { GrassPatchData } from './grassLayout'
import type { GrassUniforms } from './grassMaterial'
import { createDistantBatches } from './distantGeometry'

function createDistantMaterial(uniforms: GrassUniforms) {
  const material = new MeshLambertMaterial({ side: DoubleSide })
  material.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, { uHeight: uniforms.height, uTime: uniforms.time, uWind: uniforms.wind, uSpeed: uniforms.swaySpeed })
    shader.vertexShader = `attribute vec3 meadowRoot, meadowColor; attribute vec4 meadowTransform;
      uniform float uHeight, uTime, uWind, uSpeed; varying float vMeadowHeight; varying vec3 vMeadowColor;\n` + shader.vertexShader
    shader.vertexShader = shader.vertexShader.replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\nobjectNormal = normalize(vec3(.12,1.,.08));')
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
      #include <begin_vertex>
      vMeadowHeight = position.y; vMeadowColor = meadowColor;
      vec3 root = (modelMatrix * vec4(meadowRoot,1.)).xyz;
      float blend = smoothstep(16.,28.,length(root.xz-cameraPosition.xz));
      float bend = .28 * position.y * position.y;
      float x = bend + (position.x-bend)*3.8;
      x += sin(dot(root.xz,vec2(.62,.43))-uTime*uSpeed*4.4)*.055*uWind*position.y;
      vec2 heading = meadowTransform.xy;
      float scale = max(.001,length(heading));
      vec2 side = vec2(heading.y,heading.x)/scale;
      transformed = meadowRoot + vec3(heading.x*x + side.x*position.z*meadowTransform.w,
        position.y*uHeight*meadowTransform.z, -heading.y*x + side.y*position.z*meadowTransform.w)*blend;
    `)
    shader.fragmentShader = 'varying float vMeadowHeight; varying vec3 vMeadowColor;\n' + shader.fragmentShader
    shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `
      #include <color_fragment>
      diffuseColor.rgb *= vMeadowColor * mix(vec3(.25,.48,.37),vec3(.90,1.,.87),smoothstep(0.,1.,vMeadowHeight));
    `).replace('#include <normal_fragment_begin>', '#include <normal_fragment_begin>\nnormal = normalize(vNormal);')
  }
  return material
}

export function DistantGrass({ patches, uniforms, color }: { patches: GrassPatchData[]; uniforms: GrassUniforms; color: string }) {
  const batches = useMemo(() => createDistantBatches(patches), [patches])
  const material = useMemo(() => createDistantMaterial(uniforms), [uniforms])
  useEffect(() => { material.color.set(color) }, [material,color])
  useEffect(() => () => { batches.forEach(batch => batch.geometry.dispose()); material.dispose() }, [batches,material])
  return <group>{batches.map(batch => <mesh key={batch.id} position={[batch.x,0,batch.z]} geometry={batch.geometry} material={material} />)}</group>
}
