import { useEffect, useState } from 'react'

import PopupLayout from '@/popup/layouts/popup-layout'
import PopupHeader from '@/popup/components/popup-header'
import PopupFooter from '@/popup/components/popup-footer'
import VPNStatus from '@/popup/components/vpn-status'
import NetworkInfo from '@/popup/components/network-info'
import PrivacyChecks from '@/popup/components/privacy-checks'
import ProfileSelector, {
  type ProtectionProfile,
} from '@/popup/components/profile-selector'
import SettingsPage from '@/popup/pages/settings-page'

import {
  DEFAULT_SETTINGS,
  getSettings,
  resetSettings as resetStoredSettings,
  saveSettings,
  type AppSettings,
} from '@/services/storage/settings-storage'

function App() {
  const [profile, setProfile] = useState<ProtectionProfile>('basic')
  const [currentPage, setCurrentPage] = useState<'home' | 'settings'>('home')
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedSettings = await getSettings()
        setSettings(storedSettings)
      } catch (error) {
        console.error('Failed to load settings:', error)
      } finally {
        setIsSettingsLoaded(true)
      }
    }

    void loadSettings()
  }, [])

  const updateSetting = async (
    key: keyof AppSettings,
    checked: boolean,
  ) => {
    const updatedSettings = {
      ...settings,
      [key]: checked,
    }

    setSettings(updatedSettings)

    try {
      await saveSettings(updatedSettings)
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  const handleResetSettings = async () => {
    try {
      const defaultSettings = await resetStoredSettings()
      setSettings(defaultSettings)
    } catch (error) {
      console.error('Failed to reset settings:', error)
    }
  }

  return (
    <PopupLayout>
      {currentPage === 'settings' ? (
        isSettingsLoaded ? (
          <SettingsPage
            onBack={() => setCurrentPage('home')}
            notifications={settings.notifications}
            locationProtection={settings.locationProtection}
            privacyProtection={settings.privacyProtection}
            onNotificationsChange={(checked) =>
              void updateSetting('notifications', checked)
            }
            onLocationProtectionChange={(checked) =>
              void updateSetting('locationProtection', checked)
            }
            onPrivacyProtectionChange={(checked) =>
              void updateSetting('privacyProtection', checked)
            }
            onReset={() => void handleResetSettings()}
          />
        ) : (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Loading settings...
          </div>
        )
      ) : (
        <>
          <PopupHeader
            onSettingsClick={() => setCurrentPage('settings')}
          />

          <div className="space-y-5 p-4">
            <VPNStatus status="unknown" />
            <NetworkInfo />
            <PrivacyChecks />

            <ProfileSelector
              value={profile}
              onChange={setProfile}
            />
          </div>

          <PopupFooter
            onSettingsClick={() => setCurrentPage('settings')}
          />
        </>
      )}
    </PopupLayout>
  )
}

export default App
