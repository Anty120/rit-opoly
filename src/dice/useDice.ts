import { useCallback, useEffect, useState } from 'react'
import { DICE_ROLL_MS, INITIAL_DICE, randomDie } from '../../shared/dice'
import type { DiceRoll } from '../../shared/dice'
import type { MultiplayerSession } from '../multiplayer/types'

export function useDice(multiplayer: MultiplayerSession) {
  const session = multiplayer.session, sendRoll = multiplayer.rollDice
  const [solo, setSolo] = useState<DiceRoll>(INITIAL_DICE)
  const roll = multiplayer.session ? multiplayer.dice : solo
  const key = `${multiplayer.session?.roomId ?? 'solo'}:${roll.id}`
  const [settled, setSettled] = useState({ key, mask: 3 })
  const [pendingKey, setPendingKey] = useState<string | null>(null)
  const [error, setError] = useState('')
  const settledMask = roll.id === 0 ? 3 : settled.key === key ? settled.mask : 0
  const rolling = roll.id > 0 && settledMask !== 3
  const pending = !!multiplayer.session && pendingKey === key
  const unavailable = !!multiplayer.session && multiplayer.status !== 'connected'
  const reportSettled = useCallback((finishedKey: string, mask: number) => {
    setSettled(previous => previous.key === finishedKey && previous.mask === mask ? previous : { key: finishedKey, mask })
  }, [])
  useEffect(() => {
    if (!rolling) return
    const timer = setTimeout(() => reportSettled(key, 3), DICE_ROLL_MS)
    return () => clearTimeout(timer)
  }, [rolling, key, reportSettled])
  useEffect(() => {
    if (!pending) return
    const timer = setTimeout(() => { setPendingKey(null); setError('Roll not received. Please try again.') }, 3000)
    return () => clearTimeout(timer)
  }, [pending, key])
  const requestRoll = useCallback(() => {
    if (rolling || pending || unavailable) return
    setError('')
    if (session) {
      if (sendRoll()) setPendingKey(key)
    } else {
      const first = randomDie(), second = randomDie()
      setSolo(previous => ({ id: previous.id + 1, first, second, rollerId: 'solo', rollerName: 'You' }))
    }
  }, [rolling, pending, unavailable, session, sendRoll, key])
  return { roll, key, rolling, settledMask, pending, unavailable, error, requestRoll, reportSettled }
}
export type DiceController = ReturnType<typeof useDice>
