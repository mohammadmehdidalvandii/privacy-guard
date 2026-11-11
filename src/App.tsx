import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import PopupLayout from '@/popup/layouts/popup-layout'
import PopupHeader from '@/popup/components/popup-header'
import PopupFooter from '@/popup/components/popup-footer'
import VPNStatus from '@/popup/components/vpn-status'
import NetworkInfo from '@/popup/components/network-info'
import WebRTCStatus from '@/popup/components/webrtc-status'
import PrivacyChecks from '@/popup/components/privacy-checks'
import ProfileSelector from '@/popup/components/profile-selector'
import ProtectionOverview from '@/popup/components/protection-overview'
import SettingsPage from '@/popup/pages/settings-page'

import {
  DEFAULT_PROFILE,
  type ProtectionProfile,
} from '@/modules/profiles/profile.types'

import { getProfileConfig } from '@/modules/profiles/profile.service'
import { getNetworkInfo } from '@/modules/network/network.service'
import { analyzeWebRTC } from '@/modules/webrtc/webrtc.service'

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

import { getVPNState } from '@/services/storage/vpn-storage'
import { requestVPNStatus } from '@/services/messaging/vpn-messaging'

import type {
  ProtectionControls,
  ProtectionControlStatus,
  WebRTCProtectionLevel,
} from '@/modules/protection/protection.types'

import {
  requestProtectionStatus,
  updateProtectionControls,
} from '@/services/messaging/protection-messaging'

function App() {
  const queryClient = useQueryClient()

  const [profile, setProfile] = useState<ProtectionProfile>(DEFAULT_PROFILE)
  const [currentPage, setCurrentPage] = useState<'home' | 'settings'>('home')
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  const [protectionControls, setProtectionControls] =
    useState<ProtectionControlStatus | null>(null)
  const [isProtectionLoading, setIsProtectionLoading] = useState(true)
  const [protectionError, setProtectionError] = useState<string | null>(null)

  const profileConfig = getProfileConfig(profile)

  const { data: vpnState } = useQuery({
    queryKey: ['vpn-state'],
    queryFn: getVPNState,
    refetchInterval: 30_000,
  })

  const { data: networkInfo } = useQuery({
    queryKey: ['network-info'],
    queryFn: getNetworkInfo,
    enabled: currentPage === 'home',
    staleTime: 60_000,
    retry: 2,
  })

  const {
    data: webRTCAnalysis,
    isLoading: isWebRTCLoading,
    error: webRTCError,
  } = useQuery({
    queryKey: ['webrtc-analysis', networkInfo?.ip],
    queryFn: () => {
      if (!networkInfo?.ip || networkInfo.ip === 'Unknown') {
        throw new Error('A valid public IP address is required.')
      }

      return analyzeWebRTC(networkInfo.ip)
    },
    enabled:
      currentPage === 'home' &&
      Boolean(networkInfo?.ip && networkInfo.ip !== 'Unknown'),
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: false,
  })

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

  useEffect(() => {
    let isActive = true

    const loadProtectionStatus = async () => {
      try {
        const state = await requestProtectionStatus()

        if (isActive) {
          setProtectionControls(state)
          setProtectionError(null)
        }
      } catch (error) {
        if (isActive) {
          setProtectionError(
            error instanceof Error
              ? error.message
              : 'Failed to load browser protection settings.',
          )
        }
      } finally {
        if (isActive) {
          setIsProtectionLoading(false)
        }
      }
    }

    void loadProtectionStatus()

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    let isActive = true

    const checkVPN = async () => {
      try {
        const state = await requestVPNStatus()

        if (isActive) {
          queryClient.setQueryData(['vpn-state'], state)
        }
      } catch (error) {
        console.error('Immediate VPN check failed:', error)
      }
    }

    void checkVPN()

    return () => {
      isActive = false
    }
  }, [queryClient])

  const updateSetting = async (
    key: 'notifications' | 'locationProtection' | 'privacyProtection',
    checked: boolean,
  ) => {
    const updatedSettings: AppSettings = {
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

  const updateExpectedCountry = async (countryCode: string | null) => {
    const updatedSettings: AppSettings = {
      ...settings,
      expectedCountryCode: countryCode,
    }

    setSettings(updatedSettings)

    try {
      await saveSettings(updatedSettings)
    } catch (error) {
      console.error('Failed to save expected country:', error)
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

  const handleProtectionUpdate = async (
    controls: ProtectionControls,
  ) => {
    setIsProtectionLoading(true)
    setProtectionError(null)

    try {
      const state = await updateProtectionControls(controls)
      setProtectionControls(state)
    } catch (error) {
      setProtectionError(
        error instanceof Error
          ? error.message
          : 'Failed to update browser protection settings.',
      )
    } finally {
      setIsProtectionLoading(false)
    }
  }

  const handleWebRTCChange = (value: WebRTCProtectionLevel) => {
    if (!protectionControls) return

    void handleProtectionUpdate({
      ...protectionControls,
      webRTCProtection: value,
    })
  }

  const handleThirdPartyCookiesChange = (checked: boolean) => {
    if (!protectionControls) return

    void handleProtectionUpdate({
      ...protectionControls,
      blockThirdPartyCookies: checked,
    })
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
          isCustomLocation={profile === 'custom-location'}
          expectedCountryCode={settings.expectedCountryCode}
          protectionControls={protectionControls}
          isProtectionLoading={isProtectionLoading}
          protectionError={protectionError}
          onNotificationsChange={(checked) =>
            void updateSetting('notifications', checked)
          }
          onLocationProtectionChange={(checked) =>
            void updateSetting('locationProtection', checked)
          }
          onPrivacyProtectionChange={(checked) =>
            void updateSetting('privacyProtection', checked)
          }
          onExpectedCountryChange={(countryCode) =>
            void updateExpectedCountry(countryCode)
          }
          onWebRTCChange={handleWebRTCChange}
          onThirdPartyCookiesChange={handleThirdPartyCookiesChange}
          onReset={() => void handleResetSettings()}
        />
      ) : (
        <>
          <PopupHeader
            onSettingsClick={() => setCurrentPage('settings')}
          />

          <div className="space-y-5 p-4">
            <VPNStatus status={vpnState?.status ?? 'unknown'} />

            <NetworkInfo />

            <WebRTCStatus
              analysis={webRTCAnalysis}
              isLoading={isWebRTCLoading}
              error={webRTCError?.message ?? null}
            />

            <PrivacyChecks />

            <ProfileSelector
              value={profile}
              onChange={(newProfile) => void updateProfile(newProfile)}
            />

            <ProtectionOverview config={profileConfig} />
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
