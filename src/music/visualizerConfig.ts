import { BOARD_HALF, islandRadius } from '../game/world'

export const VISUALIZER = {
  // A shader draws this grid on four flat panels instead of individual boxes.
  columns: 25, rows: 20, faces: 4,
  cubeSize: 3.2, faceInset: .12, tileFill: .9,
  // Centered across the board from spawn, halfway to the island edge.
  x: 0, z: -(BOARD_HALF + islandRadius(-Math.PI / 2)) / 2,
  bottom: .16,
} as const

export const FACE_SIZE = VISUALIZER.cubeSize - VISUALIZER.faceInset * 2
