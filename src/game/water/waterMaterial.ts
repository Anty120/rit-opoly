import { DoubleSide, MeshBasicMaterial } from 'three'

export function createWaterMaterial(time: { value: number }, waterfall = false) {
  const material = new MeshBasicMaterial({ color: '#72c5cb', side: DoubleSide, toneMapped: false })
  material.onBeforeCompile = shader => {
    shader.uniforms.uFlowTime = time
    shader.vertexShader = 'varying vec3 vFlowPosition; varying vec2 vFlowUv;\n' + shader.vertexShader
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
      #include <begin_vertex>
      vFlowPosition = position;
      vFlowUv = uv;
    `)
    shader.fragmentShader = 'uniform float uFlowTime; varying vec3 vFlowPosition; varying vec2 vFlowUv;\n' + shader.fragmentShader
    shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `
      #include <color_fragment>
      float along = ${waterfall ? '-vFlowPosition.y * 1.6' : 'vFlowPosition.z * .85'};
      float across = vFlowUv.x;
      float waves = sin(along - uFlowTime * ${waterfall ? '6.' : '2.8'} + sin(across * 22.) * .65);
      float streak = sin(across * ${waterfall ? '95.' : '48.'} + sin(along * .7 - uFlowTime) * .5);
      float foam = smoothstep(.65, 1., abs(across * 2. - 1.)) * (.5 + .2 * waves);
      float ripple = smoothstep(.78, 1., waves) * ${waterfall ? '.16' : '.12'};
      diffuseColor.rgb = mix(diffuseColor.rgb * (.88 + streak * .045), vec3(.80, .95, .92), foam + ripple);
    `)
  }
  material.customProgramCacheKey = () => waterfall ? 'waterfall-flow-v1' : 'river-flow-v1'
  return material
}
