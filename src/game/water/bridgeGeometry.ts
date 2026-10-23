import { ExtrudeGeometry, Shape } from 'three'
import { BRIDGES, bridgeHeight } from '../worldConfig.ts'

export function createBridgeGeometry(bridge: typeof BRIDGES[number], rail = false) {
  const shape = new Shape(), lift = rail ? .7 : 0, thickness = rail ? .85 : .24
  for (let i = 0; i <= 24; i++) {
    const x = -bridge.halfX + i / 24 * bridge.halfX * 2, y = bridgeHeight(x + bridge.x, bridge) + lift
    if (!i) shape.moveTo(x, y); else shape.lineTo(x, y)
  }
  for (let i = 24; i >= 0; i--) {
    const x = -bridge.halfX + i / 24 * bridge.halfX * 2
    shape.lineTo(x, bridgeHeight(x + bridge.x, bridge) + lift - thickness)
  }
  shape.closePath()
  return new ExtrudeGeometry(shape, { depth: rail ? .18 : bridge.halfZ * 2, bevelEnabled: false, steps: 1 })
}
