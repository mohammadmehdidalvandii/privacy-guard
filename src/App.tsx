import { useState } from 'react'
import PopupLayout from '@/popup/layouts/popup-layout'
import PopupHeader from '@/popup/components/popup-header'
import VPNStatus from '@/popup/components/vpn-status'
import ProfileSelector, {
  type ProtectionProfile,
} from '@/popup/components/profile-selector'

function App() {
  const [profile, setProfile] = useState<ProtectionProfile>('basic')

  return (
    <PopupLayout>
      <PopupHeader />

      <div className="space-y-5 p-4">
        <VPNStatus status="unknown" />

        <ProfileSelector
          value={profile}
          onChange={setProfile}
        />
      </div>
    </PopupLayout>
  )
}

export default App
