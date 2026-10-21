import { DoubleSide, MeshLambertMaterial } from 'three'
import type { Vector3 } from 'three'

export interface GrassUniforms {
  time: { value: number }; player: { value: Vector3 }; height: { value: number }
  wind: { value: number }; density: { value: number }
}

export function createGrassMaterial(uniforms: GrassUniforms) {
  const material = new MeshLambertMaterial({ color: '#a5dcc5', side: DoubleSide })
  material.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, { uGrassTime: uniforms.time, uPlayer: uniforms.player, uHeight: uniforms.height, uWind: uniforms.wind, uDensity: uniforms.density })
    shader.vertexShader = `
      uniform float uGrassTime;
      uniform vec3 uPlayer;
      uniform float uHeight;
      uniform float uWind;
      uniform float uDensity;
      varying float vGrassHeight;
    ` + shader.vertexShader
    shader.vertexShader = shader.vertexShader.replace('#include <beginnormal_vertex>', `
      #include <beginnormal_vertex>
      objectNormal = normalize(vec3(.12, 1., .08));
    `).replace('#include <begin_vertex>', `
      #include <begin_vertex>
      vGrassHeight = position.y;
      vec3 root = (modelMatrix * instanceMatrix * vec4(0., 0., 0., 1.)).xyz;
      float distanceToCamera = length(root.xz - cameraPosition.xz);
      float lodDensity = (1. - smoothstep(14., 26., distanceToCamera) * .65) * (1. - smoothstep(26., 45., distanceToCamera) * .66);
      float width = min(2.4, inversesqrt(max(.1, lodDensity * uDensity)));
      // Broaden sparse distant blades slightly to preserve the soft meadow coverage.
      transformed.x = .28 * position.y * position.y + (position.x - .28 * position.y * position.y) * width;
      transformed.y *= uHeight;
      float gust = sin(root.x * .25 + root.z * .19 - uGrassTime * 1.05);
      float flutter = sin(root.x * 1.7 + root.z * 1.1 + uGrassTime * 1.8);
      vec2 wind = vec2(.13, .07) * (gust + flutter * .18) * position.y * position.y * uWind;
      vec2 away = root.xz - uPlayer.xz;
      float flatten = (1. - smoothstep(.2, 1.15, length(away))) * (1. - smoothstep(.3, 2., uPlayer.y));
      vec2 push = away / max(length(away), .01) * flatten * .6 * position.y * position.y;
      vec3 worldPush = vec3(wind.x + push.x, 0., wind.y + push.y);
      // Inverse rotation/scale for an orthogonal instance transform.
      transformed += vec3(dot(instanceMatrix[0].xyz, worldPush) / dot(instanceMatrix[0].xyz, instanceMatrix[0].xyz),
        0., dot(instanceMatrix[2].xyz, worldPush) / dot(instanceMatrix[2].xyz, instanceMatrix[2].xyz));
      transformed.y *= 1. - flatten * .65;
    `)
    shader.fragmentShader = 'varying float vGrassHeight;\n' + shader.fragmentShader
    shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `
      #include <color_fragment>
      vec3 bladeColor = mix(vec3(.25, .48, .37), vec3(.90, 1., .87), smoothstep(0., 1., vGrassHeight));
      diffuseColor.rgb *= bladeColor;
    `).replace('#include <normal_fragment_begin>', `
      #include <normal_fragment_begin>
      normal = normalize(vNormal);
    `)
  }
  return material
}
