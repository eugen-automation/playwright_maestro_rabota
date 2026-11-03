# Initial detailed mobile cases

Sources: [test plan §2.2](../TEST_PLAN.md#22-native-mobile--functional-test-scenarios)
and [Maestro candidates](../TEST_PLAN.md#43-native-mobile-automation--maestro).
[Catalog](test-case-catalog.md) defines gates, recipes and execution evidence.

Each template below defines **two independent cases**, prefixed AND and IOS.
Their descriptions can be shared, but build support, selectors, setup, execution
and evidence must be verified separately. No installed package/bundle identifier
or native selector has been verified. M is unresolved for both platforms; iOS
also needs I. No mobile flow is currently implemented.

Inherited fields for every platform case: behavior verification **proposed**,
automation suitability **candidate**, evidence **none**. The platform tables
track manual execution, automation implementation and automated result
independently. Each actual result must record OS, device/simulator, app build,
locale, run ID, redacted evidence and cleanup; one platform's pass never updates
the other.

All ordinary flows start with the shared launch helper, preserve state and use
the verified screen-appropriate readiness marker. Optional handling is limited
to truly optional overlays. Native selectors must come from hierarchy/Studio,
not web POMs. Native flows use `appId: ${APP_ID}`, with the identifier injected by
the shared runner after verification.

Any flow/subflow requiring clearState or keychain reset must be designed as a
separate deliberate disposable-device run, with logged-out/state-reset metadata
when app state is cleared. Ordinary suite exclusions remain intact. Shared TS
seed/cleanup runs outside Maestro; sensitive credentials must not appear in CLI
-e arguments, YAML, reports or committed data.

## Cases

### MOB-001-01

Launch reaches the approved initial screen.

- Source: MOB-001; Maestro plan mapping: MAESTRO-001.
- Priority / suite / feature: P0 / smoke / navigation.
- Gates / preconditions: D, M; I for iOS. Verified installed test build on a reserved device, Romanian locale and explicitly known logged-in or logged-out start state.
- Synthetic data: No business input; chosen installation/build and documented initial account state.
- Steps:
  1. Use the ordinary shared launch helper without clearing device/app state.
  2. Handle only genuinely optional verified onboarding/permission overlays.
  3. Wait for the stable marker appropriate to this scenario's initial screen.
- Expected outcome: The app reaches its approved initial screen without a crash or an unrelated signed-in readiness requirement.
- Cleanup: Close the app as appropriate; preserve device data. Do not clear state or keychain in ordinary cleanup.
- Discovery question: Verify launch marker per platform and account state. This checks launch only; fresh installation/onboarding remains separate backlog.

| Case ID        | Platform | Manual execution          | Automation implementation | Automation result         |
| -------------- | -------- | ------------------------- | ------------------------- | ------------------------- |
| AND-MOB-001-01 | Android  | Not run; gates unresolved | Not implemented           | Not run; gates unresolved |
| IOS-MOB-001-01 | iOS      | Not run; gates unresolved | Not implemented           | Not run; gates unresolved |

### MOB-002-01

Keyword search presents the expected controlled vacancies.

- Source: MOB-002; Maestro plan mapping: MAESTRO-002.
- Priority / suite / feature: P0 / smoke / search.
- Gates / preconditions: D, M; I for iOS; A and W if API data setup is required. Approved real backend and deterministic read-only dataset with verified search semantics.
- Synthetic data: MATCHING-SEARCH with controlled expected vacancy identifiers visible through supported fields.
- Steps:
  1. Launch using the shared ordinary helper in the documented account state.
  2. Enter the supported query and execute search.
  3. Compare displayed controlled vacancies and query state with the approved dataset.
- Expected outcome: Expected controlled matches appear and the selected query is retained in the supported search state.
- Cleanup: Close the flow/app context; remove only owned seeded data through external approved tooling when W applies.
- Discovery question: Verify native IDs/text, query rules, result loading marker and dataset. Changing live content cannot prove exact matching.

| Case ID        | Platform | Manual execution          | Automation implementation | Automation result         |
| -------------- | -------- | ------------------------- | ------------------------- | ------------------------- |
| AND-MOB-002-01 | Android  | Not run; gates unresolved | Not implemented           | Not run; gates unresolved |
| IOS-MOB-002-01 | iOS      | Not run; gates unresolved | Not implemented           | Not run; gates unresolved |

### MOB-003-01

City and salary filters constrain the visible results.

- Source: MOB-003; Maestro plan mapping: MAESTRO-003.
- Priority / suite / feature: P0 / regression / search.
- Gates / preconditions: D, M; I for iOS; A and W if API data setup is required. Verified combined filter support on this build and controlled discriminating records.
- Synthetic data: FILTER-SET using supported city and salary semantics.
- Steps:
  1. Launch independently and open the verified search screen.
  2. Apply the supported city and salary filters.
  3. Check selected-filter state and controlled result inclusion/exclusion.
- Expected outcome: Both selected filters remain applied and controlled visible results match their approved combined semantics.
- Cleanup: Restore this case's filter state where needed; clean owned seeded records outside Maestro and preserve unrelated device/account data.
- Discovery question: Verify platform-specific controls and salary/currency boundaries; split individual boundary tests later.

| Case ID        | Platform | Manual execution          | Automation implementation | Automation result         |
| -------------- | -------- | ------------------------- | ------------------------- | ------------------------- |
| AND-MOB-003-01 | Android  | Not run; gates unresolved | Not implemented           | Not run; gates unresolved |
| IOS-MOB-003-01 | iOS      | Not run; gates unresolved | Not implemented           | Not run; gates unresolved |

### MOB-004-01

Open a vacancy and return to the same search state.

- Source: MOB-004; Maestro plan mapping: MAESTRO-004.
- Priority / suite / feature: P0 / smoke / jobs.
- Gates / preconditions: D, M; I for iOS; A and W if API data setup is required. Verified navigation behavior and independent controlled search/detail dataset.
- Synthetic data: VACANCY-ACTIVE plus this case's query/filter state.
- Steps:
  1. Launch and establish this case's search state.
  2. Open the controlled vacancy and verify its supported title/employer/detail content.
  3. Use the approved back navigation and inspect the search state.
- Expected outcome: The correct vacancy opens, and returning preserves the documented query/filter/result context.
- Cleanup: Close the app context and clean only this case's externally seeded data when applicable.
- Discovery question: Verify expected scroll/pagination restoration rather than assuming it, and inspect navigation IDs on each platform.

| Case ID        | Platform | Manual execution          | Automation implementation | Automation result         |
| -------------- | -------- | ------------------------- | ------------------------- | ------------------------- |
| AND-MOB-004-01 | Android  | Not run; gates unresolved | Not implemented           | Not run; gates unresolved |
| IOS-MOB-004-01 | iOS      | Not run; gates unresolved | Not implemented           | Not run; gates unresolved |

### MOB-005-01

Valid disposable candidate login reaches the signed-in screen.

- Source: MOB-005; Maestro plan mapping: MAESTRO-005.
- Priority / suite / feature: P0 / smoke / auth.
- Gates / preconditions: D, M, W; I for iOS; A when API setup is used. Dedicated disposable candidate; verified logged-out startup mechanism that does not require an unapproved reset.
- Synthetic data: ACCOUNT-CANDIDATE; credentials injected through supported sensitive environment handling.
- Steps:
  1. Launch independently in the verified logged-out state; the helper must not require signed-in navigation.
  2. Enter the disposable credentials using verified native selectors.
  3. Submit once and wait for the approved signed-in marker.
- Expected outcome: The intended candidate is authenticated and the documented protected screen is available.
- Cleanup: Use the verified supported sign-out/session-revocation mechanism for this owned account. Never reset a user's personal device. Any required clearState/keychain reset changes this into a separately opted-in state-reset case.
- Discovery question: Verify auth mechanism, native selectors and cleanup. Registration, invalid login, logout and clean-install cases need separate designs.

| Case ID        | Platform | Manual execution          | Automation implementation | Automation result         |
| -------------- | -------- | ------------------------- | ------------------------- | ------------------------- |
| AND-MOB-005-01 | Android  | Not run; gates unresolved | Not implemented           | Not run; gates unresolved |
| IOS-MOB-005-01 | iOS      | Not run; gates unresolved | Not implemented           | Not run; gates unresolved |

### MOB-006-01

Eligible candidate submits an owned application.

- Source: MOB-006; Maestro plan mapping: MAESTRO-007.
- Priority / suite / feature: P0 / smoke / jobs.
- Gates / preconditions: D, M, W; I for iOS; A for verified setup/cleanup. Disposable candidate, required synthetic CV, controlled active vacancy and deterministic authenticated startup.
- Synthetic data: ACCOUNT-CANDIDATE, CV-VALID, VACANCY-ACTIVE and RUN-OWNERSHIP.
- Steps:
  1. Seed and validate this case's prerequisites with external shared tooling before Maestro.
  2. Launch through the ordinary helper with explicitly established owned authentication.
  3. Open the controlled vacancy and perform the verified application action.
  4. Check the approved submission confirmation for the intended vacancy.
- Expected outcome: A real owned application is visibly confirmed for the correct controlled vacancy.
- Cleanup: In external finally/teardown remove this run's application and owned prerequisite records, revoke owned sessions and retain redacted evidence on failure.
- Discovery question: Verify eligibility and confirmation; add read-back/persistence validation where supported without relying on another test.

| Case ID        | Platform | Manual execution          | Automation implementation | Automation result         |
| -------------- | -------- | ------------------------- | ------------------------- | ------------------------- |
| AND-MOB-006-01 | Android  | Not run; gates unresolved | Not implemented           | Not run; gates unresolved |
| IOS-MOB-006-01 | iOS      | Not run; gates unresolved | Not implemented           | Not run; gates unresolved |

### MOB-007-01

An owned saved job remains saved after reopening.

- Source: MOB-007; Maestro plan mapping: MAESTRO-006; MAESTRO-008.
- Priority / suite / feature: P1 / regression / jobs.
- Gates / preconditions: D, M, W; I for iOS; A for verified setup/cleanup. Dedicated account with independently established authentication and controlled initially-unsaved vacancy.
- Synthetic data: ACCOUNT-CANDIDATE, VACANCY-ACTIVE and RUN-OWNERSHIP.
- Steps:
  1. Validate the independent unsaved initial state and launch normally.
  2. Save the controlled vacancy using the verified action.
  3. Close/reopen without clearing state and inspect the supported saved-jobs view.
- Expected outcome: The correct vacancy is shown as saved after reopening according to documented persistence behavior.
- Cleanup: Remove the owned saved relation through verified external cleanup, revoke owned sessions and remove any owned test records. Do not touch unrelated favorites.
- Discovery question: Verify save/reopen semantics and stable saved marker; independent remove and duplicate-operation cases remain backlog.

| Case ID        | Platform | Manual execution          | Automation implementation | Automation result         |
| -------------- | -------- | ------------------------- | ------------------------- | ------------------------- |
| AND-MOB-007-01 | Android  | Not run; gates unresolved | Not implemented           | Not run; gates unresolved |
| IOS-MOB-007-01 | iOS      | Not run; gates unresolved | Not implemented           | Not run; gates unresolved |

### MOB-013-01

Offline search failure recovers when connectivity returns.

- Source: MOB-013; Maestro plan mapping: No separate plan ID; network regression.
- Priority / suite / feature: P1 / regression / search.
- Gates / preconditions: D, M; I for iOS; reserved device with approved network control. Verified offline/cache/recovery policy, dedicated device and approved read-only dataset; no account mutation in progress.
- Synthetic data: MATCHING-SEARCH and known network/initial cache state.
- Steps:
  1. Launch independently with the documented cache state.
  2. Disable connectivity using the approved device mechanism and attempt search.
  3. Check the approved offline/cached presentation.
  4. Restore connectivity and use the verified recovery action; inspect the recovered results.
- Expected outcome: Offline behavior matches the documented policy without a crash; the approved recovery action returns the search to a usable state.
- Cleanup: Always restore the device's prior connectivity in external finally/teardown, including after assertion failure. Do not change a shared personal device's network.
- Discovery question: Verify cache behavior and automatic versus explicit retry; split high-latency and interrupted-write scenarios before implementation.

| Case ID        | Platform | Manual execution          | Automation implementation | Automation result         |
| -------------- | -------- | ------------------------- | ------------------------- | ------------------------- |
| AND-MOB-013-01 | Android  | Not run; gates unresolved | Not implemented           | Not run; gates unresolved |
| IOS-MOB-013-01 | iOS      | Not run; gates unresolved | Not implemented           | Not run; gates unresolved |
