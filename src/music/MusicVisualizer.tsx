import type { MusicAudio } from './useMusicAudio'
import { SpeakerCabinet } from './SpeakerCabinet'
import { SpectrumTiles } from './SpectrumTiles'
import { VISUALIZER } from './visualizerConfig'

export function MusicVisualizer({ music, scale, enabled }: { music: MusicAudio; scale: number; enabled: boolean }) {
  const center = VISUALIZER.bottom + VISUALIZER.cubeSize / 2
  return <group position={[VISUALIZER.x, 0, VISUALIZER.z]} scale={scale}>
    <SpeakerCabinet />
    {enabled && <group position={[0, center, 0]}><SpectrumTiles analyser={music.analyser} playing={music.playing} /></group>}
  </group>
}
