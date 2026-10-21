import { useCallback, useRef, useState } from 'react'
import { GameCanvas } from './game/GameCanvas'
import { GameHud } from './components/GameHud'
import { SettingsMenu } from './components/SettingsMenu'
import { TouchControls } from './components/TouchControls'
import { useGameSettings } from './hooks/useGameSettings'
import type { RuntimeStats } from './settings/gameSettings'
import './App.css'

export default function App() {
  const [reset, setReset] = useState(0)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const input = useRef(new Set<string>())
  const stats = useRef<RuntimeStats>({ fps: 0, frameMs: 0, drawCalls: 0, triangles: 0, dpr: 1 })
  const { settings, changeSetting, restoreDefaults } = useGameSettings()
  const resetPlayer = useCallback(() => setReset(value => value + 1), [])
  return <main className="game">
    <GameCanvas reset={reset} input={input} settings={settings} onReset={resetPlayer} paused={settingsOpen} stats={stats} />
    <GameHud onReset={resetPlayer} />
    <TouchControls input={input} disabled={settingsOpen} />
    <SettingsMenu settings={settings} onChange={changeSetting} onRestore={restoreDefaults} stats={stats} open={settingsOpen} onOpenChange={setSettingsOpen} />
  </main>
}
