# Privacy Guard Audit Plan

## Audit summary

- A. Folder structure and organization: 6 findings
- B. Code quality and architecture: 7 findings
- C. Verified known gaps and reported issues: 9 findings (the reported 21-resolver case and old-dossier message names are Unverified in this repository)
- D. Tooling and quality: 5 findings
- E. UX and documentation: 6 findings

## Phase 01 — Correctness and durable settings state

Goal: Make protection profiles, Global Switch transitions, and custom-location behavior internally consistent before refactoring.

- [ ] **T-01-01 — Make profile metadata match applied controls**
  - Problem: `PROFILE_CONFIGS` says Advanced and Custom Location do not block third-party cookies, while `getProfileProtectionControls` applies blocking for both. UI or future logic consuming the metadata can misrepresent actual browser settings.
  - Files: `src/modules/profiles/profile.types.ts`, `src/modules/profiles/profile.service.ts`, `src/popup/components/profile-selector.tsx`
  - Proposed fix: Establish one source of truth for each profile's effective controls; align metadata, mappings, and profile descriptions with the approved behavior.
  - Effort: S
  - Risk: Medium
  - Acceptance: Selecting each profile yields the documented WebRTC, cookie, and geolocation controls; build and lint pass.

- [ ] **T-01-02 — Make Global Switch transitions recoverable**
  - Problem: `setExtensionEnabled` snapshots, clears Chrome controls, saves settings, and changes the alarm sequentially without compensation. A failure can leave controls cleared with `enabled` still true, or restored controls with stale snapshot/settings state.
  - Files: `src/background/service-worker.ts`, `src/modules/protection/protection.service.ts`, `src/services/storage/settings-storage.ts`
  - Proposed fix: Model pause/resume as explicit durable transition states; validate snapshots, order writes for recovery, compensate on failure where safe, and retain actionable recovery state if compensation fails. Preserve the rule that this pauses operations rather than disabling Chrome's extension.
  - Effort: L
  - Risk: High
  - Acceptance: Injected failures at each transition step do not silently lose a saved control state; retry/restart reaches a defined state; build and lint pass.

- [ ] **T-01-03 — Prevent partial protection-control writes**
  - Problem: `applyProtectionControls` uses `Promise.all` for three Chrome writes. One rejection can leave an unknown subset applied, while the popup reports only a generic failure.
  - Files: `src/modules/protection/protection.service.ts`, `src/background/service-worker.ts`, `src/App.tsx`
  - Proposed fix: Read a prior state, apply controls through a recoverable sequence (or report per-control results), and return a precise recoverability error to the popup.
  - Effort: M
  - Risk: High
  - Acceptance: Simulated failure of each Chrome setting write either restores the prior state or presents an explicit partial-state warning; build and lint pass.

- [ ] **T-01-04 — Give Custom Location a passive purpose**
  - Problem: `expectedCountryCode` is selectable and persisted but no analysis reads it; the Custom Location profile therefore does not deliver its apparent behavior.
  - Files: `src/App.tsx`, `src/popup/pages/settings-page.tsx`, `src/services/storage/settings-storage.ts`, `src/modules/network/network.types.ts`
  - Proposed fix: Add a passive expected-country versus IP-country comparison with clear informational wording, or remove the unused setting and update profile text after owner direction. Do not change browser/OS location or add evasion behavior.
  - Effort: M
  - Risk: Medium
  - Acceptance: The selected country has a verified, accurately labelled effect in the popup, or the unused control is absent; build and lint pass.

## Phase 02 — Boundaries, protocol, and popup decomposition

Goal: Reduce duplicated orchestration and make MV3 message/state boundaries explicit.

- [ ] **T-02-01 — Split popup orchestration from rendering**
  - Problem: `src/App.tsx` owns page navigation, storage hydration, five query/mutation flows, timezone calculation, profile rollback, settings writes, and rendering in one large component.
  - Files: `src/App.tsx`, `src/popup/components/`, `src/popup/pages/`
  - Proposed fix: Extract focused hooks/controllers for app settings, protection controls, analyses, and timezone consistency; keep page components presentation-oriented.
  - Effort: L
  - Risk: Medium
  - Acceptance: `App.tsx` is primarily composition/navigation and all existing popup flows remain functional; build and lint pass.

- [ ] **T-02-02 — Eliminate duplicate network-query ownership**
  - Problem: Both `src/App.tsx` and `src/popup/components/network-info.tsx` define the `network-info` query and call `getNetworkInfo`, with different query options and UI ownership.
  - Files: `src/App.tsx`, `src/popup/components/network-info.tsx`, `src/modules/network/network.service.ts`
  - Proposed fix: Use one query hook/data owner and pass its state to the display component, with one refresh policy and disabled-state behavior.
  - Effort: M
  - Risk: Medium
  - Acceptance: One code path fetches network data; refresh, errors, and paused state remain correct; build and lint pass.

- [ ] **T-02-03 — Centralize runtime-message contracts**
  - Problem: Message string literals are duplicated across `service-worker.ts` and five messaging wrappers; wrappers use unchecked response casts, while request validation is uneven.
  - Files: `src/background/service-worker.ts`, `src/services/messaging/`, `src/modules/protection/protection.schema.ts`, `src/modules/*/*.types.ts`
  - Proposed fix: Define shared discriminated request/response types and Zod schemas, validate messages at the worker boundary, and validate or safely narrow responses in wrappers.
  - Effort: L
  - Risk: Medium
  - Acceptance: Invalid request payloads and malformed responses fail predictably; no duplicate message constants remain; build and lint pass.

- [ ] **T-02-04 — Decompose the service worker by responsibility**
  - Problem: `src/background/service-worker.ts` combines alarm lifecycle, Global Switch transactions, message routing, validation, and feature execution. This makes MV3 lifecycle/error behavior difficult to test.
  - Files: `src/background/service-worker.ts`, `src/services/messaging/`, `src/modules/protection/`, `src/modules/vpn/`
  - Proposed fix: Extract alarm/state-lifecycle and message-handler modules with a thin registration entry point; ensure asynchronous listeners retain their response channel.
  - Effort: L
  - Risk: Medium
  - Acceptance: Install/startup/alarm/message flows are covered by focused units and retain current behavior across worker restarts; build and lint pass.

- [ ] **T-02-05 — Validate and consolidate persisted state**
  - Problem: settings are manually narrowed, but protection snapshots are cast without validation and VPN state is blindly spread from storage. `locationProtection` and `privacyProtection` have no read usage; `resetProfile` and `getProfileConfig` have no call sites.
  - Files: `src/services/storage/settings-storage.ts`, `src/services/storage/vpn-storage.ts`, `src/services/storage/profile-storage.ts`, `src/modules/profiles/profile.service.ts`
  - Proposed fix: Add schemas/migrations for persisted records, centralize storage keys, and remove or wire verified-unused fields/exports only after confirming intended compatibility.
  - Effort: M
  - Risk: Medium
  - Acceptance: Corrupt local-storage values fall back safely; retained fields and exports have consumers; build and lint pass.

## Phase 03 — Tooling and automated checks

Goal: Make the current TypeScript/Vite project reliably checkable without assuming cancelled release/QA work exists.

- [ ] **T-03-01 — Add explicit typecheck and test scripts**
  - Problem: `package.json` has `build`, `dev`, and `lint`, but no `typecheck` or `test` script despite TypeScript and Vitest dependencies.
  - Files: `package.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
  - Proposed fix: Add a no-emit typecheck script and a Vitest test script; keep build as the production bundle command.
  - Effort: S
  - Risk: Low
  - Acceptance: `npm run typecheck` and `npm run test` execute successfully in a clean checkout.

- [ ] **T-03-02 — Configure formatting and lint scope**
  - Problem: Prettier is installed but has no configuration/script, and source formatting is visibly inconsistent (`src/App.tsx` versus most other source files).
  - Files: `package.json`, `eslint.config.js`, `src/App.tsx`, `src/lib/utils.ts`
  - Proposed fix: Adopt the owner-approved formatter configuration and scripts, format the repository mechanically, and avoid overlapping/conflicting lint rules.
  - Effort: M
  - Risk: Low
  - Acceptance: Formatting check and `npm run lint` pass with a documented single style.

- [ ] **T-03-03 — Test pure privacy-analysis logic**
  - Problem: no test files or Vitest configuration were found for schemas, VPN scoring, profile mappings, IP classification, or timezone comparison.
  - Files: `src/modules/dns/dns.schema.ts`, `src/modules/vpn/vpn-analyzer.ts`, `src/modules/vpn/vpn-scorer.ts`, `src/modules/profiles/profile.service.ts`, `src/modules/webrtc/webrtc.service.ts`, `src/App.tsx`
  - Proposed fix: Extract timezone comparison into a pure module and add focused Vitest cases for these deterministic functions and schemas.
  - Effort: M
  - Risk: Low
  - Acceptance: Tests cover normal, invalid, and boundary cases and `npm run test` passes.

- [ ] **T-03-04 — Test Chrome API failure paths with mocks**
  - Problem: the highest-risk paths—Global Switch, protection writes, alarms, and runtime messages—have no automated checks and rely on browser APIs.
  - Files: `src/background/service-worker.ts`, `src/modules/protection/protection.service.ts`, `src/services/storage/`
  - Proposed fix: Add narrow Chrome API mocks and tests for transition recovery, alarm synchronization, and malformed runtime messages after Phase 02 boundaries exist.
  - Effort: L
  - Risk: Medium
  - Acceptance: Tests demonstrate expected behavior for successful and failed Chrome calls; `npm run test`, build, and lint pass.

- [ ] **T-03-05 — Audit inactive dependencies**
  - Problem: no source usage was found for `zustand`, `react-hook-form`, or `@hookform/resolvers`; README nevertheless presents Zustand as the state-management implementation.
  - Files: `package.json`, `package-lock.json`, `README.md`, `src/`
  - Proposed fix: Confirm no dynamic/generated use, then remove unused packages and correct documentation, or add only an owner-approved real use case.
  - Effort: S
  - Risk: Low
  - Acceptance: Every retained dependency has a verified import/use, lockfile is synchronized, and build/lint pass.

## Phase 04 — Accurate, actionable popup UX

Goal: Ensure analysis and protection labels describe exactly what the extension observed or changed.

- [ ] **T-04-01 — Correct protection-summary semantics**
  - Problem: `ProtectionOverview` reports `x/3 active protections` but also presents fingerprint protection as “Not implemented” and DNS monitoring as “On demand,” which users can read as five managed protections.
  - Files: `src/popup/components/protection-overview.tsx`
  - Proposed fix: Separate actively managed Chrome controls from available analyses/unimplemented capabilities, and label the count accordingly.
  - Effort: S
  - Risk: Low
  - Acceptance: The summary and every listed item use non-conflicting status terminology; build and lint pass.

- [ ] **T-04-02 — Clarify geolocation analysis results**
  - Problem: `PrivacyChecks` maps low exposure to “Protected”; the scan actually observes that the active page reports the Location API permission as denied, not a universal privacy guarantee.
  - Files: `src/modules/geolocation/geolocation.service.ts`, `src/popup/components/privacy-checks.tsx`
  - Proposed fix: Use precise permission-state wording such as “Location API blocked on this page,” with appropriate scope/limitations.
  - Effort: S
  - Risk: Low
  - Acceptance: Popup text distinguishes page permission state from broader protection; build and lint pass.

- [ ] **T-04-03 — Explain and validate WebRTC policy levels**
  - Problem: Basic uses `DEFAULT`, Advanced/Custom Location map to `DEFAULT_PUBLIC_INTERFACE_ONLY`, and Strict maps to `DISABLE_NON_PROXIED_UDP`. A report that “Enhanced” still exposes a second public IP is plausible but cannot be reproduced from repository code alone.
  - Files: `src/modules/profiles/profile.service.ts`, `src/modules/protection/protection.constants.ts`, `src/popup/components/protection-controls.tsx`, `src/popup/components/webrtc-status.tsx`
  - Proposed fix: Label each browser policy precisely, add limitations/help text, and manually verify Chrome ICE candidates for each policy before proposing a stricter default. Do not add identity-hiding claims.
  - Effort: M
  - Risk: Medium
  - Acceptance: Manual Chrome verification records observed candidates per policy and popup text matches the selected policy; build and lint pass.

- [ ] **T-04-04 — Add guidance for fingerprint exposure**
  - Problem: fingerprint scans can report “High Exposure” based on readable canvas/WebGL/audio and browser attributes, but the popup provides no next-step explanation.
  - Files: `src/modules/fingerprint/fingerprint.service.ts`, `src/popup/components/privacy-checks.tsx`, `src/popup/pages/guide-page.tsx`
  - Proposed fix: Explain what was detected, its limits, and safe browser-setting guidance; do not implement fingerprint spoofing or claim tracking prevention.
  - Effort: S
  - Risk: Low
  - Acceptance: Each exposure level has clear, non-overclaiming guidance; build and lint pass.

- [ ] **T-04-05 — Verify DNS result scalability before changing it**
  - Problem: the reported 21-IP resolver result is Unverified: no response fixture exists. `DNSStatus` already groups providers behind collapsed `<details>`, but renders every resolver once expanded.
  - Files: `src/popup/components/dns-status.tsx`, `src/modules/dns/dns.types.ts`
  - Proposed fix: Capture a sanitized representative large result, assess popup usability, and only then add a per-group summary/initial limit with accessible expandable details if needed.
  - Effort: M
  - Risk: Low
  - Acceptance: A representative large-result test/manual check confirms readable grouped summaries and access to all resolver details; build and lint pass.

## Phase 05 — Documentation and permission review

Goal: Align verified documentation with behavior and record permission decisions without expanding access.

- [ ] **T-05-01 — Correct feature and state-management documentation**
  - Problem: README advertises ASN display and Zustand state management, neither of which is implemented in the popup/source. It also describes Custom Location more broadly than its current stored-country behavior.
  - Files: `README.md`, `src/popup/components/network-info.tsx`, `src/App.tsx`, `package.json`
  - Proposed fix: Either implement the verified UI behavior in an approved earlier task or revise README to match it exactly, including passive-only timezone/location wording.
  - Effort: S
  - Risk: Low
  - Acceptance: README claims are traceable to source and do not overclaim privacy outcomes; build and lint pass.

- [ ] **T-05-02 — Document the runtime-message contract**
  - Problem: reported message-name differences from an old technical dossier are Unverified because that dossier is not present in this repository. Current names are defined only in `service-worker.ts` and wrappers.
  - Files: `src/background/service-worker.ts`, `src/services/messaging/`, `AGENTS.md`, `README.md`
  - Proposed fix: After Phase 02, publish the verified message contract in the appropriate internal documentation and reconcile it with the dossier only if the owner supplies it.
  - Effort: S
  - Risk: Low
  - Acceptance: Documentation lists current request/response semantics and identifies any owner-supplied dossier differences.

- [ ] **T-05-03 — Produce a least-privilege permissions report**
  - Problem: `activeTab` and `scripting` support fingerprint/geolocation scans; API and DNS hosts are used in code. Whether all permissions are necessary for the intended product is not fully established by static review.
  - Files: `public/manifest.json`, `src/modules/fingerprint/fingerprint.service.ts`, `src/modules/geolocation/geolocation.service.ts`, `src/services/api/network-api.ts`, `src/modules/dns/dns-api.ts`, `src/modules/dns/dns.service.ts`
  - Proposed fix: Document each permission/host's call site and runtime need, flag any uncertain scope for owner review, and make no manifest change without owner approval.
  - Effort: S
  - Risk: Low
  - Acceptance: A reviewed permission-to-call-site matrix exists; manifest remains unchanged unless the owner explicitly approves a change.

## Out of scope

- Timezone spoofing/override and the `chrome.debugger` permission.
- New permissions or host permissions without owner approval.
- Identity/location hiding for a specific service, detection evasion, anonymity claims, or account-ban-prevention claims.
- Release or QA work: Phase 08 of the old plan was cancelled by the owner.

## Working rules for future tasks

- Work on one phase at a time, only when the owner asks.
- After finishing a phase, run `npm run build` and `npm run lint`, then move the whole phase to `docs/done.tasks.md` with its IDs, completed date, commit hash, and verification notes.
- Never mark a task done without running its acceptance check.
- Do not start the next phase automatically.
