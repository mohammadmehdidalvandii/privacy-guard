import { useState, useEffect } from 'react';
import {
  applyProtectionProfile,
  requestProtectionStatus,
  updateProtectionControls,
} from '@/services/messaging/protection-messaging';
import type {
  ProtectionControlStatus,
  ProtectionControls
} from '@/modules/protection/protection.types';
import type { ProtectionProfile } from '@/modules/profiles/profile.types';

export function useProtection(enabled: boolean) {
  const [controls, setControls] = useState<ProtectionControlStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial status when enabled changes
  useEffect(() => {
    let isActive = true;

    const loadStatus = async () => {
      if (!enabled) {
        if (isActive) {
          setControls(null);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const state = await requestProtectionStatus();
        if (isActive) {
          setControls(state);
          setError(null);
        }
      } catch (e) {
        if (isActive) {
          setError(e instanceof Error ? e.message : "Failed to load browser protection settings.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadStatus();
    return () => { isActive = false; };
  }, [enabled]);

  const updateControls = async (newControls: ProtectionControls) => {
    setIsLoading(true);
    setError(null);
    try {
      const state = await updateProtectionControls(newControls);
      setControls(state);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Browser protection controls may be partially changed. Please check your protection settings.");
    } finally {
      setIsLoading(false);
    }
  };

  const applyProfile = async (newProfile: ProtectionProfile, previousControls: ProtectionControlStatus | null) => {
    setIsLoading(true);
    setError(null);
    try {
      const state = await applyProtectionProfile(newProfile);
      setControls(state);
      return state;
    } catch (error) {
      // Rollback logic
      try {
        const restoredState = previousControls
          ? await updateProtectionControls(previousControls)
          : await applyProtectionProfile('basic'); // Assuming basic is default
        setControls(restoredState);
      } catch (rollbackError) {
        setControls(null);
        throw rollbackError;
      }
      setError(error instanceof Error ? error.message : "Failed to apply protection profile.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { controls, isLoading, error, updateControls, applyProfile, setControls, setError };
}
