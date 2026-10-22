import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { MultiplayerSession } from './types'
import './MultiplayerMenu.css'

function initialName() {
  try { return localStorage.getItem('rit-opoly.playerName') || '' } catch { return '' }
}

export function MultiplayerMenu({ multiplayer, open, onOpenChange }: { multiplayer: MultiplayerSession; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [name, setName] = useState(initialName)
  const [roomCode, setRoomCode] = useState(() => new URLSearchParams(window.location.search).get('room') || '')
  const [copied, setCopied] = useState(false)
  const panel = useRef<HTMLElement>(null)
  const busy = multiplayer.status === 'connecting' || multiplayer.status === 'reconnecting'
  const joined = multiplayer.session !== null
  useEffect(() => {
    if (multiplayer.status === 'error') onOpenChange(true)
  }, [multiplayer.status, onOpenChange])
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const focusable = () => Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled)') ?? [])
    focusable()[0]?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) { event.preventDefault(); onOpenChange(false) }
      if (event.key !== 'Tab') return
      const elements = focusable(), first = elements[0], last = elements.at(-1)
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); previous?.focus() }
  }, [open, busy, joined, onOpenChange])
  const submit = async (event: FormEvent, mode: 'create' | 'join') => {
    event.preventDefault()
    try { localStorage.setItem('rit-opoly.playerName', name.trim()) } catch { /* Optional preference. */ }
    await multiplayer.connect(mode, name, roomCode)
  }
  const copyInvite = async () => {
    const url = new URL(window.location.href)
    if (multiplayer.session) url.searchParams.set('room', multiplayer.session.roomId)
    try { await navigator.clipboard.writeText(url.toString()); setCopied(true) } catch { setCopied(false) }
  }
  return <>
    <button className="multiplayer-button" onClick={event => { onOpenChange(true); event.currentTarget.blur() }}>
      {joined ? `${multiplayer.roster.length} / 8 players` : 'Play together'}
    </button>
    {open && <div className="multiplayer-backdrop">
      <section ref={panel} className="multiplayer-panel" role="dialog" aria-modal="true" aria-labelledby="multiplayer-title">
        <span className="eyebrow">THE MEADOW IS BETTER TOGETHER</span>
        <h2 id="multiplayer-title">{joined ? 'Your little gathering' : 'Meet on the island'}</h2>
        {joined ? <>
          <p>Share this room code or invite link. Friends will appear beside you.</p>
          <div className="room-code"><span>Room code</span><strong data-testid="room-code">{multiplayer.session!.roomId}</strong></div>
          <button className="room-primary" onClick={copyInvite}>{copied ? 'Invite link copied' : 'Copy invite link'}</button>
          <label>Invite link<input readOnly value={window.location.href} onFocus={event => event.currentTarget.select()} /></label>
          <ul className="room-roster">{multiplayer.roster.map(player => <li key={player.sessionId}><span style={{ background: player.color }} />{player.name}{player.sessionId === multiplayer.session!.sessionId && <small>You</small>}</li>)}</ul>
          {multiplayer.status === 'reconnecting' && <p role="status">Reconnecting to your room…</p>}
          <button className="room-primary" disabled={busy} onClick={() => onOpenChange(false)}>Back to the meadow</button>
          <button className="room-text" onClick={() => { multiplayer.leave(); setCopied(false) }}>Leave room</button>
        </> : <>
          <p>Create a room, or join a friend with their room code. Up to eight wanderers can share an island.</p>
          <form onSubmit={event => { void submit(event, roomCode.trim() ? 'join' : 'create') }}>
            <label>Your name<input value={name} onChange={event => setName(event.target.value)} maxLength={24} placeholder="Wanderer" autoComplete="nickname" disabled={busy} /></label>
            <button className="room-primary" type="button" disabled={busy} onClick={event => { void submit(event, 'create') }}>{busy ? 'Connecting…' : 'Create a room'}</button>
            <div className="room-or"><span />or join a friend<span /></div>
            <label>Room code<input value={roomCode} onChange={event => setRoomCode(event.target.value)} maxLength={32} autoComplete="off" spellCheck={false} placeholder="Enter room code" disabled={busy} /></label>
            <button className="room-secondary" type="submit" disabled={busy || !roomCode.trim()}>Join room</button>
          </form>
          <button className="room-text" disabled={busy} onClick={() => onOpenChange(false)}>Explore solo for now</button>
        </>}
        {multiplayer.error && <p className="room-error" role="alert">{multiplayer.error}</p>}
      </section>
    </div>}
    {multiplayer.session && !open && <div className="room-presence" role="status">{multiplayer.status === 'reconnecting' ? 'Reconnecting…' : `Room ${multiplayer.session.roomId} · ${multiplayer.roster.length} online`}</div>}
  </>
}
