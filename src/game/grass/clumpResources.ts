import { CanvasTexture, DoubleSide, MeshLambertMaterial, PlaneGeometry, SRGBColorSpace } from 'three'
import { randomGenerator } from '../world'
import type { GrassUniforms } from './grassMaterial'

// A permanent coverage layer: cards stay present as the detailed blades fade.
export function createClumpResources(uniforms: GrassUniforms) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 256
  const context = canvas.getContext('2d')!
  const random = randomGenerator(815)
  for (let i = 0; i < 75; i++) {
    const x = 8 + random() * 240, height = 75 + random() * 165
    const width = 3 + random() * 7, bend = (random() - .5) * 32
    const shade = Math.floor(170 + random() * 85)
    const gradient = context.createLinearGradient(0, 256, 0, 256 - height)
    gradient.addColorStop(0, '#53634a'); gradient.addColorStop(1, `rgb(${shade},${shade},${shade})`)
    context.fillStyle = gradient
    context.beginPath(); context.moveTo(x - width, 256)
    context.quadraticCurveTo(x - width + bend * .3, 256 - height * .55, x + bend, 256 - height)
    context.quadraticCurveTo(x + width + bend * .4, 256 - height * .4, x + width, 256)
    context.fill()
  }
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  const geometry = new PlaneGeometry(1.65, 1)
  geometry.translate(0, .5, 0)
  const material = new MeshLambertMaterial({ map: texture, color: '#82ad65', alphaTest: .42, side: DoubleSide })
  const height = { value: 1 }
  material.onBeforeCompile = shader => {
    shader.uniforms.uClumpHeight = height
    shader.uniforms.uClumpTime = uniforms.time
    shader.uniforms.uClumpWind = uniforms.wind
    shader.uniforms.uClumpSpeed = uniforms.swaySpeed
    shader.vertexShader = 'uniform float uClumpHeight; uniform float uClumpTime; uniform float uClumpWind; uniform float uClumpSpeed; vec3 clumpWorld;\n' + shader.vertexShader
    shader.vertexShader = shader.vertexShader.replace('#include <beginnormal_vertex>', `
      #include <beginnormal_vertex>
      objectNormal = vec3(0., 1., 0.);
    `).replace('#include <project_vertex>', `
      vec3 root = (modelMatrix * instanceMatrix * vec4(0., 0., 0., 1.)).xyz;
      vec3 right = normalize(vec3(viewMatrix[0][0], 0., viewMatrix[2][0]));
      clumpWorld = root + right * position.x * length(instanceMatrix[0].xyz)
        + vec3(0., position.y * length(instanceMatrix[1].xyz) * uClumpHeight, 0.);
      clumpWorld.xz += vec2(.88, .47) * sin(dot(root.xz, vec2(.62, .43)) - uClumpTime * uClumpSpeed * 4.4)
        * .065 * uClumpWind * uClumpHeight * position.y * position.y;
      vec4 mvPosition = viewMatrix * vec4(clumpWorld, 1.);
      gl_Position = projectionMatrix * mvPosition;
    `).replace('#include <worldpos_vertex>', 'vec4 worldPosition = vec4(clumpWorld, 1.);')
  }
  return { geometry, material, texture, height }
}
