import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_SETTINGS, restoreSavedSettings, sanitizeSettings, SETTINGS_VERSION } from '../settings/gameSettings'
import type { ChangeSetting } from '../settings/gameSettings'

const STORAGE_KEY = 'rit-opoly.settings.v1'

export function useGameSettings() {
  const [settings, setSettings] = useState(() => {
    try { return restoreSavedSettings(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')) }
    catch { return { ...DEFAULT_SETTINGS } }
  })
  useEffect(() => {
    // Debounce slider persistence. Live updates do not perform synchronous storage writes.
    const timer = window.setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...settings, settingsVersion: SETTINGS_VERSION })) } catch { /* Storage may be unavailable. */ }
    }, 250)
    return () => clearTimeout(timer)
  }, [settings])
  const changeSetting: ChangeSetting = useCallback((key, value) => {
    setSettings(previous => sanitizeSettings({ ...previous, [key]: value }))
  }, [])
  const restoreDefaults = useCallback(() => setSettings({ ...DEFAULT_SETTINGS }), [])
  return { settings, changeSetting, restoreDefaults }
}
