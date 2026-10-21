import { SETTING_RANGES } from '../settings/gameSettings'
import type { ChangeSetting, GameSettings, NumericSetting } from '../settings/gameSettings'

export function SettingSlider({ setting, label, settings, onChange, percent = false }: {
  setting: NumericSetting; label: string; settings: GameSettings; onChange: ChangeSetting; percent?: boolean
}) {
  const [min, max, step] = SETTING_RANGES[setting]
  const value = settings[setting]
  return <label className="setting-slider" htmlFor={`setting-${setting}`}>
    <span>{label}<output htmlFor={`setting-${setting}`}>{percent ? `${Math.round(value * 100)}%` : value.toFixed(1)}</output></span>
    <input id={`setting-${setting}`} type="range" min={min} max={max} step={step} value={value} onChange={event => onChange(setting, Number(event.target.value))} />
  </label>
}
