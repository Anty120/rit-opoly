import { BufferGeometry, Float32BufferAttribute, ShaderMaterial } from 'three'
import { FACE_SIZE, VISUALIZER } from './visualizerConfig'

export function createVisualizerResources() {
  const { columns, rows, cubeSize, tileFill } = VISUALIZER
  const positions: number[] = [], uvs: number[] = [], indices: number[] = []
  const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]]
  // Four outward-facing quads: eight triangles total, with no top/bottom panel.
  for (let face = 0; face < 4; face++) {
    const angle = face * Math.PI / 2, cos = Math.cos(angle), sin = Math.sin(angle)
    for (const [sx, sy] of corners) {
      const x = sx * FACE_SIZE / 2, z = cubeSize / 2 + .003
      positions.push(x * cos + z * sin, sy * FACE_SIZE / 2, -x * sin + z * cos)
      uvs.push((sx + 1) / 2, (sy + 1) / 2)
    }
    const offset = face * 4
    indices.push(offset, offset + 1, offset + 2, offset, offset + 2, offset + 3)
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices); geometry.computeBoundingSphere()
  const energy = { value: 0 }
  const material = new ShaderMaterial({
    toneMapped: false,
    uniforms: { musicEnergy: energy, grid: { value: [columns, rows] }, tileFill: { value: tileFill } },
    vertexShader: `
      varying vec2 panelUv;
      void main() {
        panelUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
      }
    `,
    fragmentShader: `
      uniform float musicEnergy;
      uniform vec2 grid;
      uniform float tileFill;
      varying vec2 panelUv;
      vec3 rainbow(float hue) {
        vec3 p = abs(fract(vec3(hue) + vec3(0., 2./3., 1./3.)) * 6. - 3.);
        return mix(vec3(1.), clamp(p - 1., 0., 1.), .7);
      }
      void main() {
        vec2 cell = panelUv * grid;
        vec2 tile = fract(cell);
        vec2 point = ((floor(cell) + .5) / grid - .5) * 2.;
        float radius = length(point);
        float angle = atan(point.y, point.x) / 6.2831853 + .5;
        // One shared RMS level gives every direction exactly the same radius.
        float energy = musicEnergy;
        vec2 pixel = max(fwidth(cell), vec2(.001));
        vec2 edge = (abs(tile - .5) - tileFill * .5) / pixel;
        float coverage = 1. - smoothstep(-.65, .65, max(edge.x, edge.y));
        // Subpixel tiles blend to their average instead of shimmering in motion.
        float distant = smoothstep(.6, 1.5, max(pixel.x, pixel.y));
        coverage = mix(coverage, tileFill * tileFill, distant);
        float ringRadius = .34 + energy * .48;
        float meterOn = 1. - smoothstep(.055, .17, abs(radius - ringRadius));
        vec3 color = rainbow(angle);
        // Keep unlit tiles subdued so the circular spectrum reads at a distance.
        color = mix(mix(vec3(.10, .16, .13), color, .10), color, meterOn);
        // Cheap painted bevels retain the tiled look without 3D extrusion.
        float bevel = clamp((tile.y - tile.x) * .08, -.04, .04) * (1. - distant);
        color += bevel + energy * .08;
        gl_FragColor = vec4(mix(vec3(1.), color, coverage), 1.);
        #include <colorspace_fragment>
      }
    `,
  })
  return { geometry, material, energy }
}
