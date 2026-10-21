export function Lighting() {
  return <>
    <fog attach="fog" args={['#e6dfce', 48, 115]} />
    <hemisphereLight args={['#e7fff3', '#887968', 2]} />
    <directionalLight position={[-15, 28, -12]} intensity={2.5} color="#fff0d1" castShadow
      shadow-mapSize={[1024, 1024]} shadow-camera-left={-32} shadow-camera-right={32}
      shadow-camera-top={32} shadow-camera-bottom={-32} shadow-camera-far={90} shadow-normalBias={.04} />
  </>
}
