import { useState, useEffect } from 'react';
import {
  DEFAULT_SETTINGS,
  getSettings,
  saveSettings,
  resetSettings as resetStoredSettings,
  type AppSettings,
} from '@/services/storage/settings-storage';
import {
  DEFAULT_PROFILE,
  type ProtectionProfile,
} from '@/modules/profiles/profile.types';
import { getProfile, saveProfile } from '@/services/storage/profile-storage';

export function useAppData() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [profile, setProfile] = useState<ProtectionProfile>(DEFAULT_PROFILE);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    const loadAppData = async () => {
      try {
        const [storedSettings, storedProfile] = await Promise.all([
          getSettings(),
          getProfile(),
        ]);

        setSettings(storedSettings);
        setProfile(storedProfile);
      } catch (error) {
        console.error('Failed to load app data:', error);
      } finally {
        setIsDataLoaded(true);
      }
    };

    void loadAppData();
  }, []);

  const updateSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const updateSettingField = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const updateProfile = async (newProfile: ProtectionProfile) => {
    setProfile(newProfile);
    await saveProfile(newProfile);
  };

  const resetAll = async () => {
    const defaultSettings = await resetStoredSettings();
    await saveProfile(DEFAULT_PROFILE);
    setSettings(defaultSettings);
    setProfile(DEFAULT_PROFILE);
    return { settings: defaultSettings, profile: DEFAULT_PROFILE };
  };

  return {
    settings,
    profile,
    isDataLoaded,
    updateSettings,
    updateSettingField,
    updateProfile,
    resetAll,
    setSettings,
  };
}
