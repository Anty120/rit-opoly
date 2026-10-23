import { BoxGeometry, CanvasTexture, MeshStandardMaterial, SRGBColorSpace } from 'three'

export const DIE_SIZE = .68
export const DIE_ROTATIONS: Record<number, [number, number, number]> = {
  1: [0, 0, 0], 2: [-Math.PI / 2, 0, 0], 3: [0, 0, Math.PI / 2],
  4: [0, 0, -Math.PI / 2], 5: [Math.PI / 2, 0, 0], 6: [Math.PI, 0, 0],
}
const PIPS: Record<number, [number, number][]> = {
  1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]],
  4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
  6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
}

export function createDiceResources() {
  const faces = [3, 4, 1, 6, 2, 5]
  const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 128
  const context = canvas.getContext('2d')!
  faces.forEach((value, index) => {
    const x = index * 128
    context.fillStyle = '#fff9e9'; context.fillRect(x, 0, 128, 128)
    context.strokeStyle = '#dfdbc9'; context.lineWidth = 5; context.strokeRect(x + 2.5, 2.5, 123, 123)
    context.fillStyle = '#344b44'
    for (const [px, py] of PIPS[value]) { context.beginPath(); context.arc(x + 64 + px * 30, 64 + py * 30, 10, 0, Math.PI * 2); context.fill() }
  })
  const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace
  const geometry = new BoxGeometry(DIE_SIZE, DIE_SIZE, DIE_SIZE)
  const uv = geometry.getAttribute('uv')
  for (let face = 0; face < 6; face++) for (let corner = 0; corner < 4; corner++) {
    const index = face * 4 + corner
    uv.setX(index, (face * 128 + 1 + uv.getX(index) * 126) / 768)
  }
  const material = new MeshStandardMaterial({ map: texture, roughness: .7 })
  return { geometry, material, texture }
}
