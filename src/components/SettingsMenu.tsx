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
        <SettingToggle label="Show grass" checked={settings.grassEnabled} onChange={value => onChange('grassEnabled', value)} />
        <p className="settings-hint">Turn off to keep just the green ground and reduce GPU work.</p>
        <SettingSlider setting="grassDensity" label="Density" settings={settings} onChange={onChange} percent />
        <SettingSlider setting="grassHeight" label="Height" settings={settings} onChange={onChange} percent />
        <SettingSlider setting="grassWind" label="Sway amount" settings={settings} onChange={onChange} percent />
        <SettingSlider setting="grassSwaySpeed" label="Sway speed" settings={settings} onChange={onChange} percent />
        <label className="setting-color">Grass color<input type="color" value={settings.grassColor} onChange={event => onChange('grassColor', event.target.value)} /></label>
        <SettingToggle label="Grass receives shadows" checked={settings.grassShadows} onChange={value => onChange('grassShadows', value)} />
      </fieldset>
      <fieldset><legend>Music visualizer</legend>
        <SettingToggle label="Animated speaker display" checked={settings.visualizerEnabled} onChange={value => onChange('visualizerEnabled', value)} />
        <SettingSlider setting="visualizerScale" label="Speaker scale" settings={settings} onChange={onChange} percent />
      </fieldset>
      <fieldset><legend>Performance</legend>
        <SettingToggle label="Distance-based resolution" checked={settings.distanceResolution} onChange={value => onChange('distanceResolution', value)} />
        <SettingSlider setting="renderScale" label="Maximum resolution" settings={settings} onChange={onChange} percent />
        <p className="settings-hint">100% is native resolution. Distance-based resolution lowers GPU load away from boards, with a 90% minimum nearby. Turn it off to keep the selected resolution everywhere.</p>
      </fieldset>
      <button className="restore-button" onClick={onRestore}>Restore defaults</button>
    </section>}
  </div>
}
