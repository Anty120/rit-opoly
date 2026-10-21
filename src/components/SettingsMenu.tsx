import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import type { ChangeSetting, GameSettings, RuntimeStats } from '../settings/gameSettings'
import { PerformanceReadout } from './PerformanceReadout'
import { SettingSlider } from './SettingSlider'
import { SettingToggle } from './SettingToggle'
import './SettingsMenu.css'

export function SettingsMenu({ settings, onChange, onRestore, stats, open, onOpenChange }: {
  settings: GameSettings; onChange: ChangeSetting; onRestore: () => void; stats: RefObject<RuntimeStats>; open: boolean; onOpenChange: (open: boolean) => void
}) {
  const toggle = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!open) return
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { onOpenChange(false); toggle.current?.focus() } }
    window.addEventListener('keydown', escape)
    return () => window.removeEventListener('keydown', escape)
  }, [open, onOpenChange])
  return <div className="settings-menu">
    <button ref={toggle} className="settings-button" aria-expanded={open} aria-controls="game-settings" onClick={() => onOpenChange(!open)}>
      <span aria-hidden="true">☷</span> {open ? 'Close settings' : 'Settings'}
    </button>
    {open && <section className="settings-panel" id="game-settings" aria-label="Game settings">
      <header><h2>Make it your meadow</h2><p>Changes apply live and save on this device.</p></header>
      <PerformanceReadout stats={stats} />
      <fieldset><legend>Movement</legend>
        <SettingSlider setting="walkSpeed" label="Walk speed" settings={settings} onChange={onChange} />
        <SettingSlider setting="runSpeed" label="Sprint speed" settings={settings} onChange={onChange} />
        <SettingSlider setting="jumpStrength" label="Jump strength" settings={settings} onChange={onChange} />
      </fieldset>
      <fieldset><legend>Grass</legend>
        <SettingSlider setting="grassDensity" label="Density" settings={settings} onChange={onChange} percent />
        <SettingSlider setting="grassHeight" label="Height" settings={settings} onChange={onChange} percent />
        <SettingSlider setting="grassWind" label="Sway amount" settings={settings} onChange={onChange} percent />
        <SettingSlider setting="grassSwaySpeed" label="Sway speed" settings={settings} onChange={onChange} percent />
        <label className="setting-color">Grass color<input type="color" value={settings.grassColor} onChange={event => onChange('grassColor', event.target.value)} /></label>
        <SettingToggle label="Grass receives shadows" checked={settings.grassShadows} onChange={value => onChange('grassShadows', value)} />
      </fieldset>
      <fieldset><legend>Performance</legend>
        <SettingToggle label="Auto-adjust render quality" checked={settings.adaptiveQuality} onChange={value => onChange('adaptiveQuality', value)} />
        <SettingSlider setting="renderScale" label={settings.adaptiveQuality ? 'Maximum render scale' : 'Render scale'} settings={settings} onChange={onChange} percent />
        <p className="settings-hint">Lower density or render scale for more FPS. Distant grass automatically uses less detail.</p>
      </fieldset>
      <button className="restore-button" onClick={onRestore}>Restore defaults</button>
    </section>}
  </div>
}
