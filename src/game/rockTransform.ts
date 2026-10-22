import type { rocks } from './world'

export function rockTransform(rock: (typeof rocks)[number], index: number) {
  return {
    position: [rock.x, rock.size * .43, rock.z] as [number, number, number],
    rotation: [.2, index * 1.3, .15] as [number, number, number],
    scale: [rock.size, rock.size * .85, rock.size * .83] as [number, number, number],
  }
}
