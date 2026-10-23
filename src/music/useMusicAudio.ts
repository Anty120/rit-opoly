import { useCallback, useEffect, useRef, useState } from 'react'

export function useMusicAudio() {
  const audio = useRef<HTMLAudioElement>(null)
  const analyser = useRef<AnalyserNode | null>(null)
  const context = useRef<AudioContext | null>(null)
  const source = useRef<MediaElementAudioSourceNode | null>(null)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [volume, setVolume] = useState(.35)
  const [error, setError] = useState('')
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    const element = audio.current
    return () => {
      alive.current = false
      element?.pause()
      source.current?.disconnect(); analyser.current?.disconnect()
      if (context.current) void context.current.close()
      source.current = null; analyser.current = null; context.current = null
    }
  }, [])
  useEffect(() => { if (audio.current) audio.current.volume = volume }, [volume])

  const toggle = useCallback(async () => {
    const element = audio.current
    if (!element) return
    if (!element.paused) { element.pause(); return }
    setLoading(true); setError('')
    try {
      if (!context.current) {
        const nextContext = new AudioContext()
        const nextAnalyser = nextContext.createAnalyser()
        nextAnalyser.fftSize = 1024
        nextAnalyser.smoothingTimeConstant = .75
        nextAnalyser.minDecibels = -85; nextAnalyser.maxDecibels = -20
        const nextSource = nextContext.createMediaElementSource(element)
        nextSource.connect(nextAnalyser); nextAnalyser.connect(nextContext.destination)
        context.current = nextContext; analyser.current = nextAnalyser; source.current = nextSource
      }
      await context.current.resume()
      await element.play()
    } catch {
      if (alive.current) setError('Could not play The Calling. Please try again.')
    } finally { if (alive.current) setLoading(false) }
  }, [])

  return { audio, analyser, playing, setPlaying, loading, volume, setVolume, error, toggle }
}

export type MusicAudio = ReturnType<typeof useMusicAudio>
