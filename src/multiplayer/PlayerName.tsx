import { useEffect, useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'

export function PlayerName({ name }: { name: string }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 64
    const context = canvas.getContext('2d')!
    context.fillStyle = 'rgba(38, 64, 51, 0.78)'; context.beginPath(); context.roundRect(4, 8, 248, 48, 20); context.fill()
    context.fillStyle = '#fff9ed'; context.font = '500 24px Segoe UI, sans-serif'; context.textAlign = 'center'; context.textBaseline = 'middle'
    context.fillText(name, 128, 32, 224)
    const result = new CanvasTexture(canvas); result.colorSpace = SRGBColorSpace
    return result
  }, [name])
  useEffect(() => () => texture.dispose(), [texture])
  return <sprite position={[0, 2.05, 0]} scale={[2.2, .55, 1]}><spriteMaterial map={texture} transparent depthWrite={false} toneMapped={false} /></sprite>
}
