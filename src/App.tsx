import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import PopupLayout from "@/popup/layouts/popup-layout";
import PopupHeader from "@/popup/components/popup-header";
import PopupFooter from "@/popup/components/popup-footer";
import VPNStatus from "@/popup/components/vpn-status";
import NetworkInfo from "@/popup/components/network-info";
import WebRTCStatus from "@/popup/components/webrtc-status";
import DNSStatus from "@/popup/components/dns-status";
import PrivacyChecks from "@/popup/components/privacy-checks";
import ProfileSelector from "@/popup/components/profile-selector";
import ProtectionOverview from "@/popup/components/protection-overview";
import SettingsPage from "@/popup/pages/settings-page";

import { requestFingerprintScan } from "@/services/messaging/fingerprint-messaging";
import { requestGeolocationScan } from "@/services/messaging/geolocation-messaging";

import { analyzeProvider } from "@/modules/vpn/vpn-analyzer";
import {
  DEFAULT_PROFILE,
  type ProtectionProfile,
} from "@/modules/profiles/profile.types";
import { getNetworkInfo } from "@/modules/network/network.service";
import { analyzeWebRTC } from "@/modules/webrtc/webrtc.service";
import type { TimezoneConsistencyResult } from "@/modules/geolocation/geolocation.types";

import {
  DEFAULT_SETTINGS,
  getSettings,
  resetSettings as resetStoredSettings,
  saveSettings,
  type AppSettings,
} from "@/services/storage/settings-storage";

import { getProfile, saveProfile } from "@/services/storage/profile-storage";
import { getVPNState } from "@/services/storage/vpn-storage";

import { requestVPNStatus } from "@/services/messaging/vpn-messaging";
import { requestDNSLeakTest } from "@/services/messaging/dns-messaging";

import type {
  GeolocationSetting,
  ProtectionControls,
  ProtectionControlStatus,
  WebRTCProtectionLevel,
} from "@/modules/protection/protection.types";

import {
  applyProtectionProfile,
  requestProtectionStatus,
  updateProtectionControls,
} from "@/services/messaging/protection-messaging";

function App() {
  const queryClient = useQueryClient();

  const [profile, setProfile] = useState<ProtectionProfile>(DEFAULT_PROFILE);
  const [currentPage, setCurrentPage] = useState<"home" | "settings">("home");
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [protectionControls, setProtectionControls] =
    useState<ProtectionControlStatus | null>(null);

  const [isProtectionLoading, setIsProtectionLoading] = useState(true);
  const [protectionError, setProtectionError] = useState<string | null>(null);

  const { data: vpnState } = useQuery({
    queryKey: ["vpn-state"],
    queryFn: getVPNState,
    refetchInterval: 30_000,
  });

  const { data: networkInfo } = useQuery({
    queryKey: ["network-info"],
    queryFn: getNetworkInfo,
    enabled: currentPage === "home",
    staleTime: 60_000,
    retry: 2,
  });

  const {
    data: webRTCAnalysis,
    isLoading: isWebRTCLoading,
    error: webRTCError,
  } = useQuery({
    queryKey: ["webrtc-analysis", networkInfo?.ip],
    queryFn: () => {
      if (!networkInfo?.ip || networkInfo.ip === "Unknown") {
        throw new Error("A valid public IP address is required.");
      }

      return analyzeWebRTC(networkInfo.ip);
    },
    enabled:
      currentPage === "home" &&
      Boolean(networkInfo?.ip && networkInfo.ip !== "Unknown"),
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: false,
  });

  const dnsTestMutation = useMutation({
    mutationFn: requestDNSLeakTest,
  });

  const fingerprintMutation = useMutation({
    mutationFn: requestFingerprintScan,
  });

  const geolocationMutation = useMutation({
    mutationFn: requestGeolocationScan,
  });

  const browserTimezone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown";

  const networkTimezone = networkInfo?.timezone ?? "Unknown";

  const timezoneConsistency: TimezoneConsistencyResult = {
    browserTimezone,
    networkTimezone,
    status:
      browserTimezone === "Unknown" || networkTimezone === "Unknown"
        ? "unknown"
        : browserTimezone === networkTimezone
          ? "match"
          : "mismatch",
  };

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
        console.error("Failed to load app data:", error);
      } finally {
        setIsDataLoaded(true);
      }
    };

    void loadAppData();
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadProtectionStatus = async () => {
      try {
        const state = await requestProtectionStatus();

        if (isActive) {
          setProtectionControls(state);
          setProtectionError(null);
        }
      } catch (error) {
        if (isActive) {
          setProtectionError(
            error instanceof Error
              ? error.message
              : "Failed to load browser protection settings.",
          );
        }
      } finally {
        if (isActive) {
          setIsProtectionLoading(false);
        }
      }
    };

    void loadProtectionStatus();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    const checkVPN = async () => {
      try {
        const state = await requestVPNStatus();

        if (isActive) {
          queryClient.setQueryData(["vpn-state"], state);
        }
      } catch (error) {
        console.error("Immediate VPN check failed:", error);
      }
    };

    void checkVPN();

    return () => {
      isActive = false;
    };
  }, [queryClient]);

  const updateSetting = async (key: "notifications", checked: boolean) => {
    const updatedSettings: AppSettings = {
      ...settings,
      [key]: checked,
    };

    setSettings(updatedSettings);

    try {
      await saveSettings(updatedSettings);
    } catch (error) {
      setSettings(settings);
      console.error("Failed to save settings:", error);
    }
  };

  const updateExpectedCountry = async (countryCode: string | null) => {
    const updatedSettings: AppSettings = {
      ...settings,
      expectedCountryCode: countryCode,
    };

    setSettings(updatedSettings);

    try {
      await saveSettings(updatedSettings);
    } catch (error) {
      setSettings(settings);
      console.error("Failed to save expected country:", error);
    }
  };

  const updateProfile = async (newProfile: ProtectionProfile) => {
    if (newProfile === profile) return;

    const previousControls = protectionControls;

    setIsProtectionLoading(true);
    setProtectionError(null);

    try {
      const state = await applyProtectionProfile(newProfile);

      await saveProfile(newProfile);

      setProfile(newProfile);
      setProtectionControls(state);
    } catch (error) {
      try {
        const restoredState = previousControls
          ? await updateProtectionControls(previousControls)
          : await applyProtectionProfile(profile);

        setProtectionControls(restoredState);
      } catch (rollbackError) {
        setProtectionControls(null);

        console.error(
          "Failed to restore previous protection settings:",
          rollbackError,
        );

        setProtectionError(
          "Profile update failed and previous browser settings could not be restored. Please check your protection settings.",
        );

        return;
      }

      setProtectionError(
        error instanceof Error
          ? error.message
          : "Failed to apply protection profile.",
      );
    } finally {
      setIsProtectionLoading(false);
    }
  };

  const handleProtectionUpdate = async (controls: ProtectionControls) => {
    setIsProtectionLoading(true);
    setProtectionError(null);

    try {
      const state = await updateProtectionControls(controls);
      setProtectionControls(state);
    } catch (error) {
      setProtectionError(
        error instanceof Error
          ? error.message
          : "Failed to update browser protection settings.",
      );
    } finally {
      setIsProtectionLoading(false);
    }
  };

  const handleWebRTCChange = (value: WebRTCProtectionLevel) => {
    if (!protectionControls) return;

    void handleProtectionUpdate({
      ...protectionControls,
      webRTCProtection: value,
    });
  };

  const handleThirdPartyCookiesChange = (checked: boolean) => {
    if (!protectionControls) return;

    void handleProtectionUpdate({
      ...protectionControls,
      blockThirdPartyCookies: checked,
    });
  };

  const handleGeolocationChange = (value: GeolocationSetting) => {
    if (!protectionControls) return;

    void handleProtectionUpdate({
      ...protectionControls,
      geolocation: value,
    });
  };

  const handleResetSettings = async () => {
    setIsProtectionLoading(true);
    setProtectionError(null);

    try {
      const state = await applyProtectionProfile(DEFAULT_PROFILE);

      const [defaultSettings] = await Promise.all([
        resetStoredSettings(),
        saveProfile(DEFAULT_PROFILE),
      ]);

      setSettings(defaultSettings);
      setProfile(DEFAULT_PROFILE);
      setProtectionControls(state);
    } catch (error) {
      setProtectionError(
        error instanceof Error
          ? error.message
          : "Failed to reset application settings.",
      );
    } finally {
      setIsProtectionLoading(false);
    }
  };

  const providerAnalysis = networkInfo ? analyzeProvider(networkInfo) : null;

  const displayVPNStatus =
    providerAnalysis?.isHostingProvider && webRTCAnalysis?.hasPublicIpMismatch
      ? "possible"
      : (vpnState?.status ?? "unknown");

  if (!isDataLoaded) {
    return (
      <PopupLayout>
        <div className="p-6 text-center text-sm text-muted-foreground">
          Loading Privacy Guard...
        </div>
      </PopupLayout>
    );
  }

  return (
    <PopupLayout>
      {currentPage === "settings" ? (
        <SettingsPage
          onBack={() => setCurrentPage("home")}
          notifications={settings.notifications}
          isCustomLocation={profile === "custom-location"}
          expectedCountryCode={settings.expectedCountryCode}
          protectionControls={protectionControls}
          isProtectionLoading={isProtectionLoading}
          protectionError={protectionError}
          onNotificationsChange={(checked) =>
            void updateSetting("notifications", checked)
          }
          onExpectedCountryChange={(countryCode) =>
            void updateExpectedCountry(countryCode)
          }
          onWebRTCChange={handleWebRTCChange}
          onThirdPartyCookiesChange={handleThirdPartyCookiesChange}
          onGeolocationChange={handleGeolocationChange}
          onReset={() => void handleResetSettings()}
        />
      ) : (
        <>
          <PopupHeader onSettingsClick={() => setCurrentPage("settings")} />

          <div className="space-y-5 p-4">
            <VPNStatus status={displayVPNStatus} />

            <NetworkInfo />

            <WebRTCStatus
              analysis={webRTCAnalysis}
              isLoading={isWebRTCLoading}
              error={webRTCError?.message ?? null}
            />

            <DNSStatus
              result={dnsTestMutation.data}
              networkIp={networkInfo?.ip}
              isLoading={dnsTestMutation.isPending}
              error={dnsTestMutation.error?.message ?? null}
              onRunTest={() => dnsTestMutation.mutate()}
            />

            <PrivacyChecks
              webRTCAnalysis={webRTCAnalysis}
              isWebRTCLoading={isWebRTCLoading}
              webRTCError={webRTCError?.message ?? null}
              dnsResult={dnsTestMutation.data}
              isDNSLoading={dnsTestMutation.isPending}
              dnsError={dnsTestMutation.error?.message ?? null}
              fingerprintResult={fingerprintMutation.data}
              isFingerprintLoading={fingerprintMutation.isPending}
              fingerprintError={fingerprintMutation.error?.message ?? null}
              onRunFingerprintScan={() => fingerprintMutation.mutate()}
              geolocationResult={geolocationMutation.data}
              isGeolocationLoading={geolocationMutation.isPending}
              geolocationError={geolocationMutation.error?.message ?? null}
              onRunGeolocationScan={() => geolocationMutation.mutate()}
              timezoneConsistency={timezoneConsistency}
            />

            <ProfileSelector
              value={profile}
              onChange={(newProfile) => void updateProfile(newProfile)}
            />

            <ProtectionOverview controls={protectionControls} />
          </div>

          <PopupFooter onSettingsClick={() => setCurrentPage("settings")} />
        </>
      )}
    </PopupLayout>
  );
}

export default App;
