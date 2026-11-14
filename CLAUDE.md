# Privacy Guard — Agent Guide

## Project overview

Privacy Guard is a Manifest V3 Chrome extension with a React popup. Its scope is to analyze privacy signals (network/VPN indicators, WebRTC, DNS, fingerprinting, geolocation, and timezone consistency) and manage Chrome's own privacy/content settings. It does not provide anonymity, VPN control, identity/location hiding, or account-security-evasion features.

Timezone analysis is passive: the popup compares `Intl.DateTimeFormat().resolvedOptions().timeZone` with the IP-associated timezone from `ipapi.co`, producing `match`, `mismatch`, or `unknown`.

## Tech stack

- React `^19.3.1`, React DOM `^19.3.1`, TypeScript `^6.0.3`
- Vite `^8.3.5` with `@vitejs/plugin-react` `^6.1.2`
- Tailwind CSS `^4.3.5`, Base UI `^1.9.0`, shadcn `^4.23.0`
- TanStack React Query `^5.107.1`, Zod `^4.6.7`, React Hook Form `^7.91.0`
- ESLint `^10.13.0`; Vitest `^5.1.0` is installed but not configured as an npm script

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
```

There are no `typecheck` or `test` scripts in `package.json` (Unverified whether manual test procedures exist). `npm run build` runs `tsc -b && vite build` and outputs to `dist/`. Load it from `chrome://extensions`: enable Developer mode, select **Load unpacked**, then choose `dist/`.

## Architecture

- `src/App.tsx` is the popup coordinator: local React state plus React Query for network/VPN/WebRTC data and mutation-driven scans.
- `src/background/service-worker.ts` owns privileged operations, alarm monitoring, and Chrome privacy/content-setting writes. Popup helpers call it with `chrome.runtime.sendMessage`.
- Message types: `CHECK_VPN_STATUS`, `RUN_DNS_LEAK_TEST`, `RUN_FINGERPRINT_SCAN`, and `RUN_GEOLOCATION_SCAN` run their respective analyses; `GET_PROTECTION_STATUS` reads Chrome settings; `UPDATE_PROTECTION_CONTROLS` validates/applies controls; `APPLY_PROTECTION_PROFILE` maps a profile to controls; `SET_EXTENSION_ENABLED` implements the Global Switch.
- Alarm: `privacy-guard-vpn-monitor`, every 5 minutes. It performs a VPN check only while `settings.enabled` is true; install/startup synchronize it.
- Global Switch pauses internal monitoring/scans and clears extension-managed Chrome overrides. Before pausing it snapshots current controls; on re-enable it reapplies and clears that snapshot. It does **not** disable the extension in Chrome.
- Storage is `chrome.storage.local`: `privacy-guard-settings` (`AppSettings`: `enabled`, `notifications`, `locationProtection`, `privacyProtection`, `expectedCountryCode`), `privacy-guard-protection-snapshot`, `privacy-guard-profile`, and `privacy-guard-vpn-state`.

## Directory map

- `public/manifest.json` — MV3 permissions, hosts, popup, and background declaration.
- `src/background/service-worker.ts` — privileged message router and monitoring lifecycle.
- `src/modules/` — feature logic: `vpn/`, `dns/`, `fingerprint/`, `geolocation/`, `network/`, `webrtc/`, `profiles/`, and `protection/`.
- `src/services/api/` — IPify/IP API client; `services/messaging/` — typed popup request wrappers; `services/storage/` — local-storage access.
- `src/popup/` — popup components, layout, settings, and guide pages.
- `src/components/ui/` — local Base UI-style primitives; `src/lib/utils.ts` — shared class utility.
- `src/App.tsx`, `src/main.tsx`, `src/index.css` — popup composition, React bootstrap, and Tailwind theme.
- `vite.config.ts` — popup and service-worker build entries; `eslint.config.js` — flat ESLint configuration.

## Coding conventions

- TypeScript is strict; use the `@/` alias for `src/` imports. Components are PascalCase default exports; helpers/services are camelCase named exports.
- Keep feature contracts beside logic using `.types.ts`, `.schema.ts`, `.service.ts`, and (where needed) API/analysis files.
- Validate external API payloads and privileged protection/profile messages with Zod `safeParse`; return `{ success, data?, error? }` across runtime messages.
- The popup currently uses React `useState` and TanStack React Query. Zustand is a dependency but no store/use-store usage was found.
- Format is inconsistent: most module files use single quotes/no semicolons, while `App.tsx` uses double quotes/semicolons. Follow the convention of the file being changed.

## Permissions policy

Current `permissions` (exactly): `storage`, `alarms`, `privacy`, `activeTab`, `scripting`, `contentSettings`.

Current `host_permissions` (exactly): `https://api.ipify.org/*`, `https://ipapi.co/*`, `https://dnsleak.dev/*`, `https://*.t.dnsleak.dev/*`.

Never add a permission or host permission without asking first.

## Hard rules

- Do not re-add `chrome.debugger` or any timezone spoofing/override. Timezone behavior is detection and user guidance only.
- Do not add features intended to hide identity/location from a specific service or evade service detection/account-security systems.
- Do not claim anonymity or prevention of account bans.
- Do not describe or implement Global Switch as disabling the Chrome extension itself.
- Phase 08 (Release & Testing) was cancelled by the owner. Do not assume tests, QA, or release artifacts exist unless verified.
- Keep changes minimal and scoped. Run typecheck and build before completing a task.

## Known gaps and risks

- No automated test files, Vitest configuration, or `test` npm script were found.
- Fingerprint *protection* is not implemented; the available operation is an on-demand fingerprint exposure analysis injected into the active HTTP(S) tab.
- Global Switch has no transactional rollback in the service worker if snapshot, reset, settings save, or restore partially fails.
- `activeTab` and `scripting` are used by fingerprint/geolocation scans; their broader necessity is Unverified.
- `expectedCountryCode` is stored and selectable for the custom-location profile, but no analysis logic reads it.
- Git audit at guide creation: branch `main`; working tree was clean; latest commit was `b7b4e75 docs: add project README`.

## Discrepancies

- README says the custom-location profile configures a custom location, but the code only stores an expected country and does not use it in an analysis or Chrome setting.
- Profile metadata says Advanced/Custom Location do not block third-party cookies, while `getProfileProtectionControls` applies `blockThirdPartyCookies: true` for both.
- README advertises network ASN display, but the popup's Network Information component displays IP, location, timezone, and ISP—not ASN.
