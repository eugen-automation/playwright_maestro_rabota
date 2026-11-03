# Initial cross-platform synchronization cases

Source: [test plan §2.3](../TEST_PLAN.md#23-cross-platform-testing).
Related detailed work: [web cases](web-cases.md), [API cases](api-cases.md) and
[mobile cases](mobile-cases.md). [Catalog](test-case-catalog.md) defines gates.

Each template has separate desktop-to-Android and desktop-to-iOS instances.
Inherited fields: **P1 / regression**, behavior verification **proposed**,
automation suitability **candidate**, evidence **none**. Both manual and
automated execution are blocked by D, A, W and M; iOS additionally requires I.
Initial platform statuses are recorded separately below.

These are self-contained orchestrated integration scenarios. Each owns the same
disposable account across its two surfaces, controlled vacancy, authenticated
startup and cleanup. They do not coordinate separately ordered tests or reuse a
previously authenticated physical device. The web leg is real `@e2e`; the native
leg uses Maestro. No application backend interaction is mocked. They cannot run
under the current registration-document-only E2E fixture.

Shared data: ACCOUNT-CANDIDATE, VACANCY-ACTIVE, RUN-OWNERSHIP.
Before readiness, verify that saved-job synchronization exists on both selected
builds, its documented refresh behavior and acceptable consistency bound. Use a
bounded observed-state wait; never invent a timeout or use fixed sleeps.
No account, vacancy or synchronization behavior has been verified by this file.

## Cases

### SYNC-001

A job saved on desktop appears on mobile.

- Source: test plan §2.3; WEB-011; MOB-007.
- Preconditions: Independently owned account with controlled vacancy initially unsaved on both surfaces.
- Synthetic data: inherited shared recipes, unique per platform instance/run.
- Steps:
  1. Use approved setup to establish and validate this case's unsaved initial state and deterministic authentication on web and the selected mobile platform.
  2. Save the controlled vacancy through the actual desktop frontend/backend together.
  3. Open the mobile saved-jobs view for the same owned account and verify the controlled vacancy appears.
- Expected outcome: The desktop save is observable on the selected mobile platform through the verified synchronization mechanism.
- Cleanup: Remove only this case's saved relation and owned setup data; revoke its sessions and record validated cleanup, even if synchronization fails.
- Discovery question: verify controls, sync/read-back contracts, refresh policy and consistency bound independently for each selected build.

| Case ID      | Platforms         | Manual execution          | Automation implementation | Automation result         |
| ------------ | ----------------- | ------------------------- | ------------------------- | ------------------------- |
| AND-SYNC-001 | Desktop + Android | Not run; gates unresolved | Not implemented           | Not run; gates unresolved |
| IOS-SYNC-001 | Desktop + iOS     | Not run; gates unresolved | Not implemented           | Not run; gates unresolved |

### SYNC-002

A job removed on desktop disappears from mobile saved jobs.

- Source: test plan §2.3; WEB-011; MOB-007.
- Preconditions: Independently owned account and controlled vacancy initially saved through this case's own validated setup; no dependency on SYNC-001.
- Synthetic data: inherited shared recipes, unique per platform instance/run.
- Steps:
  1. Seed and validate this case's saved state and establish owned authentication independently on web and the selected mobile platform.
  2. Remove the saved vacancy through the actual desktop frontend/backend together.
  3. Open/refresh the mobile saved-jobs view using the verified refresh mechanism and inspect the owned vacancy's saved state.
- Expected outcome: The desktop removal is observable on the selected mobile platform; the controlled vacancy is absent from its saved list.
- Cleanup: Remove any remaining owned saved relation and setup data through approved APIs, revoke owned sessions and record cleanup outcome.
- Discovery question: verify controls, sync/read-back contracts, refresh policy and consistency bound independently for each selected build.

| Case ID      | Platforms         | Manual execution          | Automation implementation | Automation result         |
| ------------ | ----------------- | ------------------------- | ------------------------- | ------------------------- |
| AND-SYNC-002 | Desktop + Android | Not run; gates unresolved | Not implemented           | Not run; gates unresolved |
| IOS-SYNC-002 | Desktop + iOS     | Not run; gates unresolved | Not implemented           | Not run; gates unresolved |

CV and application synchronization remain explicit backlog under test plan §2.3;
create separate cases after support and safe data ownership are verified.
