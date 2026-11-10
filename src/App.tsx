
import { useState } from 'react'
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

function App() {
  const [profile, setProfile] = useState<ProtectionProfile>('basic')
  const [currentPage, setCurrentPage] = useState<'home' | 'settings'>('home')

  return (
    <PopupLayout>
      {currentPage === 'settings' ? (
        <SettingsPage onBack={() => setCurrentPage('home')} />
      ) : (
        <>
        <PopupHeader onSettingsClick={() => setCurrentPage('settings')} />
          <div className="space-y-5 p-4">
            <VPNStatus status="unknown" />
            <NetworkInfo />
            <PrivacyChecks />

            <ProfileSelector
              value={profile}
              onChange={setProfile}
            />
          </div>

          <PopupFooter onSettingsClick={() => setCurrentPage('settings')} />
        </>
      )}
    </PopupLayout>
  )
}

export default App
