import type { AppSettings } from '@/services/storage/settings-storage'

import type { ProtectionControls } from './protection.types'

export type GlobalSwitchTransition = 'idle' | 'pausing' | 'paused' | 'resuming'

export interface GlobalSwitchDependencies {
  getSettings: () => Promise<AppSettings>
  saveSettings: (settings: AppSettings) => Promise<void>
  getSnapshot: () => Promise<ProtectionControls | null>
  saveSnapshot: (controls: ProtectionControls) => Promise<void>
  clearSnapshot: () => Promise<void>
  getTransition: () => Promise<GlobalSwitchTransition | null>
  saveTransition: (transition: GlobalSwitchTransition) => Promise<void>
  getControls: () => Promise<ProtectionControls>
  applyControls: (controls: ProtectionControls) => Promise<unknown>
  resetControls: () => Promise<void>
  startMonitoring: () => void
  stopMonitoring: () => Promise<void>
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown error'
}

export function createGlobalSwitchManager(deps: GlobalSwitchDependencies) {
  const restoreActive = async (snapshot: ProtectionControls) => {
    const settings = await deps.getSettings()
    await deps.applyControls(snapshot)
    await deps.saveSettings({ ...settings, enabled: true })
    deps.startMonitoring()
    await deps.clearSnapshot()
    await deps.saveTransition('idle')
  }

  const pause = async (): Promise<boolean> => {
    const settings = await deps.getSettings()
    const controls = await deps.getControls()
    await deps.saveTransition('pausing')
    await deps.saveSnapshot(controls)
    const snapshot = await deps.getSnapshot()

    if (!snapshot) throw new Error('Protection snapshot could not be verified.')

    try {
      await deps.resetControls()
      await deps.saveSettings({ ...settings, enabled: false })
      await deps.stopMonitoring()
      await deps.saveTransition('paused')
      return false
    } catch (error) {
      try {
        await restoreActive(snapshot)
      } catch (recoveryError) {
        throw new Error(`Privacy Guard could not pause and recovery is pending: ${message(recoveryError)}`, { cause: recoveryError })
      }
      throw new Error(`Privacy Guard could not pause; prior controls were restored: ${message(error)}`, { cause: error })
    }
  }

  const resume = async (): Promise<boolean> => {
    await deps.saveTransition('resuming')
    const snapshot = await deps.getSnapshot()
    if (!snapshot) throw new Error('Cannot resume without a valid saved protection snapshot.')

    try {
      const settings = await deps.getSettings()
      await deps.applyControls(snapshot)
      await deps.saveSettings({ ...settings, enabled: true })
      deps.startMonitoring()
      await deps.clearSnapshot()
      await deps.saveTransition('idle')
      return true
    } catch (error) {
      throw new Error(`Privacy Guard could not resume; retrying or restarting will recover the saved controls: ${message(error)}`, { cause: error })
    }
  }

  return {
    async setEnabled(enabled: boolean): Promise<boolean> {
      const settings = await deps.getSettings()
      if (settings.enabled === enabled) return enabled
      return enabled ? resume() : pause()
    },
    async recover(): Promise<void> {
      const transition = await deps.getTransition()
      const settings = await deps.getSettings()
      if (transition === 'pausing') {
        const snapshot = await deps.getSnapshot()
        if (!snapshot) throw new Error('Cannot recover an unfinished pause without a valid snapshot.')
        await restoreActive(snapshot)
        return
      }
      if (transition === 'resuming') {
        await resume()
        return
      }
      if (transition === 'paused' || !settings.enabled) {
        await deps.stopMonitoring()
        await deps.saveTransition('paused')
        return
      }
      deps.startMonitoring()
      await deps.saveTransition('idle')
    },
  }
}
