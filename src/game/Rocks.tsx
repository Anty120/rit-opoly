import { rocks } from './world'

export function Rocks() {
  return <group>{rocks.map((rock, i) => <mesh key={i} position={[rock.x, rock.size * .43, rock.z]} rotation={[.2, i * 1.3, .15]} scale={[rock.size, rock.size * .85, rock.size * .83]} castShadow receiveShadow>
    <dodecahedronGeometry args={[1, 0]} /><meshStandardMaterial color={i % 2 ? '#b2b8a6' : '#c2b8af'} flatShading roughness={1} />
  </mesh>)}</group>
}
