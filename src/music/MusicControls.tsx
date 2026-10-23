import type { MusicAudio } from './useMusicAudio'
import './MusicControls.css'

export function MusicControls({ music }: { music: MusicAudio }) {
  const { audio, setPlaying, playing, loading, toggle, volume, setVolume, error } = music
  return <section className="music-controls" aria-label="Island music">
    <audio ref={audio} src={`${import.meta.env.BASE_URL}TheCalling.mp3`} preload="none" loop
      onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
      onError={() => setPlaying(false)} />
    <div className="music-heading"><span className={`music-indicator${playing ? ' is-playing' : ''}`} /><div><span className="music-caption">EDGE OF THE MEADOW</span><strong>The Calling</strong></div>
      <button aria-label={playing ? 'Pause music' : 'Play music'} disabled={loading} onClick={event => { void toggle(); event.currentTarget.blur() }}>
        {loading ? '…' : playing ? 'Ⅱ' : '▶'}
      </button>
    </div>
    <label className="music-volume">Volume<input aria-label="Music volume" type="range" min="0" max="1" step=".01" value={volume} onChange={event => setVolume(Number(event.target.value))} /></label>
    {error && <p role="alert">{error}</p>}
  </section>
}
