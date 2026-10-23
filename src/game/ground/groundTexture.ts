import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'
import { randomGenerator } from '../world'

// Baked once. Mipmaps turn the small grass marks into stable distant coverage.
export function createGroundTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 512
  const context = canvas.getContext('2d')!
  const random = randomGenerator(392)
  context.fillStyle = '#b9b9b9'
  context.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 7000; i++) {
    const x = random() * 512, y = random() * 512
    const length = 3 + random() * 13, bend = 2 + random() * 5
    const shade = Math.floor(120 + random() * 110)
    context.strokeStyle = `rgba(${shade},${shade},${shade},.45)`
    context.lineWidth = .7 + random() * 1.4
    // Wrap strokes too, so tile boundaries are invisible.
    for (const dx of [-512, 0, 512]) for (const dy of [-512, 0, 512]) {
      context.beginPath(); context.moveTo(x + dx, y + dy)
      context.quadraticCurveTo(x + dx + bend, y + dy - length * .4, x + dx + bend * 1.4, y + dy - length)
      context.stroke()
    }
  }
  const texture = new CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = RepeatWrapping
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4
  return texture
}
