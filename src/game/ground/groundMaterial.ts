import { Color, MeshLambertMaterial } from 'three'
import type { Texture } from 'three'

export function createGroundMaterial(texture: Texture) {
  const meadowColor = { value: new Color('#a5dcc5') }
  const material = new MeshLambertMaterial({ vertexColors: true })
  material.onBeforeCompile = shader => {
    shader.uniforms.uMeadowColor = meadowColor
    shader.uniforms.uGroundDetail = { value: texture }
    shader.vertexShader = 'attribute float meadow; varying float vMeadow; varying vec3 vGroundPosition;\n' + shader.vertexShader
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
      #include <begin_vertex>
      vGroundPosition = position;
      vMeadow = meadow;
    `)
    shader.fragmentShader = 'uniform vec3 uMeadowColor; uniform sampler2D uGroundDetail; varying float vMeadow; varying vec3 vGroundPosition;\n' + shader.fragmentShader
    shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `
      #include <color_fragment>
      if (vMeadow > .5) {
        vec2 p = vGroundPosition.xz;
        float field = .5 + .5 * sin(p.x * .32 + sin(p.y * .23) * 2.);
        float broad = .5 + .5 * sin(p.x * .11 + sin(p.y * .14) * 1.7);
        float detail = texture2D(uGroundDetail, p * .16).r;
        float second = texture2D(uGroundDetail, p * .047 + vec2(.37, .61)).r;
        // Use the same palette and diffuse lighting as the blades. Fine detail
        // filters away with distance instead of exposing a flat gray surface.
        vec3 meadow = uMeadowColor * vec3(.72, .94, .86);
        meadow *= mix(vec3(1.), vec3(.85, 1., .975), field);
        meadow *= .84 + broad * .16 + (detail - .45) * .30 + (second - .45) * .40;
        float bank = 1. - smoothstep(-.30, -.05, vGroundPosition.y);
        diffuseColor.rgb = mix(meadow, vec3(.20, .29, .23), bank);
      }
    `)
  }
  return { material, meadowColor }
}
