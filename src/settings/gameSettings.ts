export interface GameSettings {
  walkSpeed: number
  runSpeed: number
  jumpStrength: number
  grassDensity: number
  grassHeight: number
  grassWind: number
  grassSwaySpeed: number
  grassColor: string
  grassShadows: boolean
  renderScale: number
  adaptiveQuality: boolean
}

export const DEFAULT_SETTINGS: GameSettings = {
  walkSpeed: 6, runSpeed: 10, jumpStrength: 8.5,
  grassDensity: .85, grassHeight: 1, grassWind: 1, grassSwaySpeed: 1,
  grassColor: '#a5dcc5', grassShadows: true,
  renderScale: 1, adaptiveQuality: true,
}

export const SETTING_RANGES = {
  walkSpeed: [2, 12, .5], runSpeed: [4, 18, .5], jumpStrength: [3, 10, .5],
  grassDensity: [.25, 1, .05], grassHeight: [.4, 1.5, .05], grassWind: [0, 2, .1],
  grassSwaySpeed: [.25, 2.5, .05],
  renderScale: [.65, 1.5, .05],
} as const

export type NumericSetting = keyof typeof SETTING_RANGES
export type ChangeSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void

export function sanitizeSettings(value: unknown): GameSettings {
  const settings = { ...DEFAULT_SETTINGS }
  if (!value || typeof value !== 'object') return settings
  const input = value as Record<string, unknown>
  for (const key of Object.keys(SETTING_RANGES) as NumericSetting[]) {
    const number = input[key]
    if (typeof number === 'number' && Number.isFinite(number)) {
      const [min, max] = SETTING_RANGES[key]
      settings[key] = Math.max(min, Math.min(max, number))
    }
  }
  if (typeof input.grassColor === 'string' && /^#[0-9a-f]{6}$/i.test(input.grassColor)) settings.grassColor = input.grassColor
  for (const key of ['grassShadows', 'adaptiveQuality'] as const) {
    if (typeof input[key] === 'boolean') settings[key] = input[key]
  }
  settings.runSpeed = Math.max(settings.walkSpeed, settings.runSpeed)
  return settings
}

export const SETTINGS_VERSION = 2

export function restoreSavedSettings(value: unknown): GameSettings {
  // Upgrade the old default jump without resetting custom movement/grass preferences.
  if (value && typeof value === 'object' && !('settingsVersion' in value) && 'jumpStrength' in value && value.jumpStrength === 5.5) {
    return sanitizeSettings({ ...value, jumpStrength: DEFAULT_SETTINGS.jumpStrength })
  }
  return sanitizeSettings(value)
}

export interface RuntimeStats { fps: number; frameMs: number; drawCalls: number; triangles: number; dpr: number }
