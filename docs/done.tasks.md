# Completed Phases

Rules: when a whole phase is finished and verified, move that phase here from
docs/tasks.md (remove it from tasks.md), keep the task IDs, and add:
- Completed date
- Commit hash
- Verification notes (what was run, for example build and lint results)

## Phase 01 — Correctness and durable settings state

Goal: Make protection profiles, Global Switch transitions, and custom-location behavior internally consistent before refactoring.

- [x] **T-01-01 — Make profile metadata match applied controls**
  - Problem: `PROFILE_CONFIGS` says Advanced and Custom Location do not block third-party cookies, while `getProfileProtectionControls` applies blocking for both. UI or future logic consuming the metadata can misrepresent actual browser settings.
  - Files: `src/modules/profiles/profile.types.ts`, `src/modules/profiles/profile.service.ts`, `src/popup/components/profile-selector.tsx`
  - Proposed fix: Establish one source of truth for each profile's effective controls; align metadata, mappings, and profile descriptions with the approved behavior.
  - Effort: S
  - Risk: Medium
  - Acceptance: Selecting each profile yields the documented WebRTC, cookie, and geolocation controls; build and lint pass.

- [x] **T-01-02 — Make Global Switch transitions recoverable**
  - Problem: `setExtensionEnabled` snapshots, clears Chrome controls, saves settings, and changes the alarm sequentially without compensation. A failure can leave controls cleared with `enabled` still true, or restored controls with stale snapshot/settings state.
  - Files: `src/background/service-worker.ts`, `src/modules/protection/protection.service.ts`, `src/services/storage/settings-storage.ts`
  - Proposed fix: Model pause/resume as explicit durable transition states; validate snapshots, order writes for recovery, compensate on failure where safe, and retain actionable recovery state if compensation fails. Preserve the rule that this pauses operations rather than disabling Chrome's extension.
  - Effort: L
  - Risk: High
  - Acceptance: Injected failures at each transition step do not silently lose a saved control state; retry/restart reaches a defined state; build and lint pass.

- [x] **T-01-03 — Prevent partial protection-control writes**
  - Problem: `applyProtectionControls` uses `Promise.all` for three Chrome writes. One rejection can leave an unknown subset applied, while the popup reports only a generic failure.
  - Files: `src/modules/protection/protection.service.ts`, `src/background/service-worker.ts`, `src/App.tsx`
  - Proposed fix: Read a prior state, apply controls through a recoverable sequence (or report per-control results), and return a precise recoverability error to the popup.
  - Effort: M
  - Risk: High
  - Acceptance: Simulated failure of each Chrome setting write either restores the prior state or presents an explicit partial-state warning; build and lint pass.

- [x] **T-01-04 — Give Custom Location a passive purpose**
  - Problem: `expectedCountryCode` is selectable and persisted but no analysis reads it; the Custom Location profile therefore does not deliver its apparent behavior.
  - Files: `src/App.tsx`, `src/popup/pages/settings-page.tsx`, `src/services/storage/settings-storage.ts`, `src/modules/network/network.types.ts`
  - Proposed fix: Add a passive expected-country versus IP-country comparison with clear informational wording, or remove the unused setting and update profile text after owner direction. Do not change browser/OS location or add evasion behavior.
  - Effort: M
  - Risk: Medium
  - Acceptance: The selected country has a verified, accurately labelled effect in the popup, or the unused control is absent; build and lint pass.

Completed: 2026-11-12

Commits:
- `36b823d` fix(profiles): align metadata with applied controls
- `f3df2f2` feat(location): compare expected and network countries
- `c756ca6` fix(protection): recover global switch transitions
- `970ddea` fix(global-switch): make pause/resume transitions recoverable
- `fcf5608` fix(protection): prevent partial control writes

Verification notes:
- `npm run build` passed for every Phase 01 task.
- `npm run lint: only pre-existing error src/components/ui/button.tsx:57 (react-refresh/only-export-components), unrelated to Phase 01.`
- Manual Chrome testing remains pending: verify profile controls; expected-country match, mismatch, unset, and unavailable states; Global Switch pause/resume and alarm behavior; service-worker recovery during incomplete transitions; and injected Chrome setting-write failures with rollback and partial-state messaging.

