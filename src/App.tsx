import { useEffect, useState } from 'react'

import PopupLayout from '@/popup/layouts/popup-layout'
import PopupHeader from '@/popup/components/popup-header'
import PopupFooter from '@/popup/components/popup-footer'
import VPNStatus from '@/popup/components/vpn-status'
import NetworkInfo from '@/popup/components/network-info'
import PrivacyChecks from '@/popup/components/privacy-checks'
import ProfileSelector from '@/popup/components/profile-selector'
import SettingsPage from '@/popup/pages/settings-page'

import {
  DEFAULT_PROFILE,
  type ProtectionProfile,
} from '@/modules/profiles/profile.types'

import {
  DEFAULT_SETTINGS,
  getSettings,
  resetSettings as resetStoredSettings,
  saveSettings,
  type AppSettings,
} from '@/services/storage/settings-storage'

import {
  getProfile,
  saveProfile,
} from '@/services/storage/profile-storage'

function App() {
  const [profile, setProfile] = useState<ProtectionProfile>(DEFAULT_PROFILE)
  const [currentPage, setCurrentPage] = useState<'home' | 'settings'>('home')
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  useEffect(() => {
    const loadAppData = async () => {
      try {
        const [storedSettings, storedProfile] = await Promise.all([
          getSettings(),
          getProfile(),
        ])

        setSettings(storedSettings)
        setProfile(storedProfile)
      } catch (error) {
        console.error('Failed to load app data:', error)
      } finally {
        setIsDataLoaded(true)
      }
    }

    void loadAppData()
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

  const updateProfile = async (newProfile: ProtectionProfile) => {
    setProfile(newProfile)

    try {
      await saveProfile(newProfile)
    } catch (error) {
      console.error('Failed to save profile:', error)
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

  if (!isDataLoaded) {
    return (
      <PopupLayout>
        <div className="p-6 text-center text-sm text-muted-foreground">
          Loading Privacy Guard...
        </div>
      </PopupLayout>
    )
  }

  return (
    <PopupLayout>
      {currentPage === 'settings' ? (
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
              onChange={(newProfile) => void updateProfile(newProfile)}
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
