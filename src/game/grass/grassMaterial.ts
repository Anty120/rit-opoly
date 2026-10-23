import { DoubleSide, MeshLambertMaterial } from 'three'
import type { DataTexture, Vector2, Vector3 } from 'three'

export interface GrassUniforms {
  time: { value: number }; player: { value: Vector3 }; height: { value: number }
  wind: { value: number }; density: { value: number }
  swaySpeed: { value: number }
  windField: { value: DataTexture }; direction: { value: Vector2 }
}

export function createGrassMaterial(uniforms: GrassUniforms) {
  const material = new MeshLambertMaterial({ color: '#a5dcc5', side: DoubleSide })
  material.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, { uGrassTime: uniforms.time, uPlayer: uniforms.player, uHeight: uniforms.height, uWind: uniforms.wind, uDensity: uniforms.density,
      uWindField: uniforms.windField, uWindDirection: uniforms.direction, uSwaySpeed: uniforms.swaySpeed })
    shader.vertexShader = `
      uniform float uGrassTime;
      uniform vec3 uPlayer;
      uniform float uHeight;
      uniform float uWind;
      uniform float uDensity;
      uniform sampler2D uWindField;
      uniform vec2 uWindDirection;
      uniform float uSwaySpeed;
      attribute float grassRank;
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
      float lodDensity = (1. - smoothstep(14., 26., distanceToCamera) * .65) * (1. - smoothstep(26., 45., distanceToCamera) * .66) * (1. - smoothstep(22., 36., distanceToCamera));
      float presence = smoothstep(grassRank - .02, grassRank + .02, lodDensity * uDensity);
      // Fully thinned blades have no visible triangles. Skip their wind texture,
      // trigonometry, lighting and projection work instead of animating them.
      if (presence <= .0001) { gl_Position = vec4(2., 2., 2., 1.); return; }
      float width = min(2.4, inversesqrt(max(.1, lodDensity * uDensity)));
      // Broaden sparse distant blades slightly to preserve the soft meadow coverage.
      transformed.x = .28 * position.y * position.y + (position.x - .28 * position.y * position.y) * width;
      transformed.y *= uHeight;
      float swayTime = uGrassTime * uSwaySpeed;
      vec2 field = texture2D(uWindField, root.xz * .012 - vec2(.88, .47) * swayTime * .075).rg;
      float bendWeight = position.y * position.y;
      vec2 sideways = vec2(-uWindDirection.y, uWindDirection.x);
      // Faster back-and-forth sway with a small excursion; wind never lowers the blades.
      float sway = sin(dot(root.xz, vec2(.62, .43)) - swayTime * 4.4 + field.g * .8);
      float flutter = sin(swayTime * 8.5 - dot(root.xz, vec2(1.7, 2.3)));
      vec2 wind = (uWindDirection * sway * .085 * (.75 + field.r * .25)
        + sideways * flutter * .022 * position.y) * uWind * uHeight * bendWeight;
      vec2 away = root.xz - uPlayer.xz;
      float flatten = (1. - smoothstep(.2, 1.15, length(away))) * (1. - smoothstep(.3, 2., uPlayer.y));
      vec2 push = away / max(length(away), .01) * flatten * .6 * position.y * position.y;
      vec3 worldPush = vec3(wind.x + push.x, 0., wind.y + push.y);
      // Inverse rotation/scale for an orthogonal instance transform.
      transformed += vec3(dot(instanceMatrix[0].xyz, worldPush) / dot(instanceMatrix[0].xyz, instanceMatrix[0].xyz),
        0., dot(instanceMatrix[2].xyz, worldPush) / dot(instanceMatrix[2].xyz, instanceMatrix[2].xyz));
      transformed.y *= 1. - flatten * .65;
      // Root-level density and a shared blade shape eliminate patch-shaped LOD changes.
      // Shrinking the few transition blades avoids alpha blending and abrupt popping.
      transformed *= presence;
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
