# QA Test Plan – Rabota.md

**Active scope:** Desktop web, backend APIs and Android; manual and automated testing.
**Version:** 1.4. Capabilities below are proposed until verified.

**iOS deferred by user instruction (2026-11-04):** No iOS devices/simulators are
available. Do not implement or execute iOS tests in the current scope. Retain
their IDs and candidate scenarios as deferred backlog, not failed, passed or
unsupported coverage. Exclude them from current implementation/release gates
and active coverage denominators. Resume only when a supported device/simulator
and build become available and the user restores iOS scope. Cross-platform
work may proceed for verified web/Android integrations; iOS legs remain deferred.

Engineering rules: [root](../AGENTS.md), [Playwright](../web/AGENTS.md),
[Maestro](../mobile/AGENTS.md). This plan owns coverage/priorities; the
[architecture](ARCHITECTURE.md) owns paths, and the [catalog](specifications/test-case-catalog.md)
owns detailed case statuses/evidence. Priority: **API → isolated UI → selected E2E/native**.

## Current implementation and rule alignment

Reviewed against the repository rules and working tree on 2026-11-04. The
strategy follows the required layer boundaries, shared configuration/contracts,
Romanian default, independent cases and controlled-write prerequisites. The
project is partially implemented; the following gaps prevent claiming full
compliance or readiness:

| Area             | Observed state and required next action                                                                                                                                                                                                                                                                                                               |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Execution policy | Root `AGENTS.md` §2.1 now reflects the separately opted-in public read-only API and E2E scopes. Account authentication and writes still require approved non-production/disposable-account access; no such environment is available.                                                                                                                  |
| Authentication   | Three API auth cases exist, but the runtime gate checks only configured origin, credentials and opt-in. It does not establish an approved non-production target, disposable identity or run ownership. Resolve the controlled-write gate before live authentication; credentials and a flag alone are insufficient.                                   |
| Isolated UI      | The project is declared, but no UI specs, file-backed mocks or fixture-backed frontend are implemented. UI execution remains disabled; resolve the isolated-frontend gate before adding tests.                                                                                                                                                        |
| Native mobile    | Android runner, verified shared configuration and six public read-only flows passed in combined smoke/regression runs on the selected device/build. Controlled-data/write cases remain gated; iOS implementation is deferred because no devices are available; see [native continuation](specifications/mobile-read-only-continuation-2026-11-04.md). |
| CI               | Deferred by user instruction on 2026-11-04. Keep local quality checks; workflow activation and scheduled gates are outside the current implementation scope.                                                                                                                                                                                          |

The public API's active whitespace-contract failure remains a release concern,
not a reason to relax its schema or assertions. Its historical execution record
is linked below; no new live pass is claimed. Local typecheck, lint, formatting
and all 19 synthetic foundation tests passed during this review. Foundation
tests required execution outside the sandbox after a `uv_os_get_passwd` startup
failure; they use synthetic data/local servers. Live API/authentication, browser
and device tests were **not executed** during this review, which did not enable
targets, flags or CI jobs.

Subsequent implementation stayed in the user-confirmed verified read-only scope:
12 public API cases ran with **11 passed, 1 failed**, including two added
normalization-input contract checks. The whitespace discrepancy remains active.
See the [new execution record](specifications/api-read-only-increment-2026-11-04.md).
The API opt-in was temporary to that process; `.env` was not modified.

## 1. Application scope

Candidate/employer job discovery, accounts, CVs, applications and supported
recruitment services. Public website: <https://www.rabota.md>. Verify capabilities,
distribution links, build support and roles before writing executable cases.

### Testing priorities

| Priority      | Features                                                                                                                                           | Rationale                             |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| P0 – Critical | Login, registration, job search, city and combined filters, job details, CV submission, applying for jobs                                          | Core user journeys                    |
| P1 – High     | Other filters, saved jobs, Smart CV, notifications, messaging, user profile, localization, mobile maps, employer registration and vacancy creation | Frequently used and business-critical |
| P2 – Medium   | Company profiles, advanced subscriptions, other employer tools                                                                                     | Supporting workflows                  |
| P3 – Low      | Minor UI details, informational pages, cosmetic issues                                                                                             | Low direct business impact            |

P0/P1 lead implementation at the lowest suitable layer. Employer publishing,
payments and account/data changes require approved disposable accounts and a safe
non-production target; this inventory grants no execution rights.

## 2. Shared functional coverage: manual and automation

These are coverage groups, not individual executable tests. Split combined
behaviors into independent cases with source, platform, priority, preconditions,
synthetic data, steps, expected outcomes, cleanup and evidence. Track manual,
implementation and execution statuses separately. API owns backend positive,
negative/boundary and permission matrices; UI/E2E cover their distinct risks.

### 2.1 Desktop web – functional test scenarios

| ID      | Test scenario                             | Priority | Expected result                                     |
| ------- | ----------------------------------------- | -------- | --------------------------------------------------- |
| WEB-001 | Open homepage                             | P0       | Page loads with functional navigation and search    |
| WEB-002 | Search using a valid keyword              | P0       | Relevant job results appear                         |
| WEB-003 | Search using a nonexistent keyword        | P1       | Appropriate empty-state message appears             |
| WEB-004 | Filter jobs by city                       | P0       | Results match selected location                     |
| WEB-005 | Combine salary, city and remote filters   | P0       | Results satisfy all selected filters                |
| WEB-006 | Open a vacancy                            | P0       | Correct title, employer and vacancy details appear  |
| WEB-007 | Register a candidate account              | P0       | Account is created after required verification      |
| WEB-008 | Login with valid and invalid credentials  | P0       | Valid login succeeds; invalid login is rejected     |
| WEB-009 | Create, edit and upload a CV              | P0       | CV is saved correctly and accessible in the profile |
| WEB-010 | Apply for a vacancy                       | P0       | Application is submitted and confirmation appears   |
| WEB-011 | Save and remove a job                     | P1       | Saved state persists correctly                      |
| WEB-012 | Subscribe to job email alerts             | P1       | Subscription and confirmation work correctly        |
| WEB-013 | Reset account password                    | P1       | Password reset follows the expected secure workflow |
| WEB-014 | Switch website language RO/RU             | P1       | Content and navigation update appropriately         |
| WEB-015 | Register an employer and create a vacancy | P1       | Permitted vacancy workflow works correctly          |
| WEB-016 | Session timeout and logout                | P1       | Session and protected content are handled securely  |

Verify filter capabilities and rules during discovery. For applications, split
success, missing CV, duplicates, expired vacancies, failure presentation and
history/persistence across their owning layers; do not repeat every variant on
every surface.

### 2.2 Native mobile – functional test scenarios

Select native-specific and critical integration risks after API coverage.
Verify and record Android/iOS support independently; this is a candidate inventory.

| ID      | Test scenario                                | Priority | Expected result                                    |
| ------- | -------------------------------------------- | -------- | -------------------------------------------------- |
| MOB-001 | Install and launch the app                   | P0       | App launches without crashing                      |
| MOB-002 | Search jobs using a keyword                  | P0       | Correct results are displayed                      |
| MOB-003 | Apply city and salary filters                | P0       | Results update accurately                          |
| MOB-004 | Open job details and return to search        | P0       | Correct vacancy opens and search state is retained |
| MOB-005 | Register and log in                          | P0       | Authentication works correctly                     |
| MOB-006 | Apply for a vacancy using a CV               | P0       | Application is submitted                           |
| MOB-007 | Save a job to favorites                      | P1       | Job remains saved after reopening                  |
| MOB-008 | Open a job from a deep link                  | P1       | App navigates to the correct job                   |
| MOB-009 | Receive and open a push notification         | P1       | Correct notification and destination appear        |
| MOB-010 | Search for jobs on the map                   | P1       | Results correspond to selected location            |
| MOB-011 | Send and receive a chat message              | P1       | Messages display and synchronize                   |
| MOB-012 | Background and resume the application        | P1       | App preserves appropriate state                    |
| MOB-013 | Test offline and unstable network conditions | P1       | Errors are handled without crashes                 |
| MOB-014 | Deny and later grant location permissions    | P1       | App handles permission changes                     |
| MOB-015 | Update an installed app                      | P1       | Existing account and saved data are preserved      |

### 2.3 Cross-platform testing

This is a proposed coverage matrix, not verified platform support or executed
coverage. Every entry requires feature/build discovery for the named platform.

| Area                      | Desktop                    | Android           | iOS             |
| ------------------------- | -------------------------- | ----------------- | --------------- |
| Search and filters        | Yes                        | Yes               | Yes             |
| Candidate login           | Yes                        | Yes               | Yes             |
| Job details               | Yes                        | Yes               | Yes             |
| CV submission             | Yes                        | Yes               | Yes             |
| Favorites synchronization | Yes                        | Yes               | Yes             |
| Notifications             | Email/browser as supported | Push              | Push            |
| Deep links                | URL navigation             | Android App Links | Universal Links |
| Background/resume         | Browser state              | App lifecycle     | App lifecycle   |
| Maps/location             | As supported               | Yes               | Yes             |
| Employer workflows        | Full applicable scope      | As supported      | As supported    |

Synchronization cases are self-contained integrations using the same disposable
identity and owned data across selected surfaces, with independent setup/cleanup.
Prioritize saved-job propagation; CV/application synchronization needs separate
support verification. Never coordinate ordered tests or reuse personal-device auth.

### 2.4 Non-functional manual testing

- **Usability/accessibility:** keyboard, focus, contrast, labels, screen readers,
  large text and clear validation; WCAG 2.2 AA is the web target.
- **Performance:** page/search/list responsiveness, images, cold starts and slow
  networks. Agree environment, data and budgets before numerical thresholds.
- **Security/privacy:** authorized session/role/ownership checks, upload/privacy
  controls and sensitive-data handling; no unapproved production probing.
- **Localization:** Romanian by default (`ro-MD`, verified `/ro/` web routes).
  Targeted Russian/Cyrillic, diacritics, salaries and long text; restore Romanian
  after web language-switch checks. No duplicate Russian regression suite.
- **Exploratory:** unexpected navigation, rapid filter changes, interrupted
  submissions and transitions between web/mobile.

## 3. Test environment and coverage matrix

### Desktop browsers

| Coverage        | Configuration                 |
| --------------- | ----------------------------- |
| Primary         | Chrome – Windows              |
| Secondary       | Firefox and Edge – Windows    |
| Safari          | macOS                         |
| Viewport checks | 1366×768, 1440×900, 1920×1080 |

Windows registration-document smoke has now passed in Chromium, installed
Chrome/Edge and Playwright-managed Firefox. This is limited markup coverage;
interactive/visual checks and desktop Safari/macOS retain their prerequisites.
See [verification details](specifications/mobile-read-only-continuation-2026-11-04.md).

### Native mobile devices

| Area        | Coverage                                                                                                    |
| ----------- | ----------------------------------------------------------------------------------------------------------- |
| Android     | Representative Samsung and Pixel devices; latest, previous and oldest supported Android versions            |
| iOS         | Representative iPhones; minimum supported and selected newer versions verified against the chosen app build |
| Network     | Wi-Fi, cellular, offline and high-latency conditions                                                        |
| Orientation | Portrait and landscape where supported                                                                      |

Record exact browser/channel, OS, device and app build. Chromium/Firefox/WebKit
results certify only their tested engines; Safari needs macOS and explicit
Chrome/Edge coverage needs those channels. Use repeatable emulators/simulators
plus physical Android/iPhone assessment for notifications, permissions and
performance. Verify actual supported OS bounds and orientation per build.

## 4. Automation testing strategy

API tests are the largest application-test layer and first implementation
priority. Isolated UI tests cover frontend behavior; a small E2E/native set
covers critical wiring and platform risks. Product unit/component tests belong
below APIs in the wider pyramid, but application source is outside this repo.
Tooling checks are not product unit coverage. Choose layers by defect risk,
without fixed count ratios or duplicated backend matrices across devices.

The [pyramid strategy](specifications/testing-pyramid.md) owns the feature
responsibility matrix and API readiness checklist. The
[case catalog](specifications/test-case-catalog.md) owns individual case statuses,
prerequisites and evidence. Proposed inventory is not executed coverage.

### 4.1 Desktop web automation – Playwright

- API: `web/tests/api/`, `@api`, real authorized requests and no browser setup.
- UI: `web/tests/ui/`, `@ui`, maintained real frontend with verified file-backed
  responses and no backend access, including server rendering and background
  traffic. Unexpected backend traffic fails; missing mocks never go live.
- E2E: `web/tests/journeys/`, `@e2e`, real approved frontend/backend without
  application backend mocks; isolated API setup/cleanup is allowed.

Every spec uses the canonical fixture entry and one matching layer plus one
smoke/regression tag. [Playwright rules](../web/AGENTS.md) own schema/POM/locale,
isolation, assertion and reporting conventions. Keep UI focused on rendering,
interactions, client validation, accessibility and controlled response states.

### 4.2 API automation – Playwright APIRequestContext

Implement backend contracts and business outcomes first, after verifying the
authorized target, methods, relative paths, authentication and response shapes.
Read-only search/vacancy cases come first; writes require the controlled-data gate.

| Area                             | API-owned coverage                                                                                 |
| -------------------------------- | -------------------------------------------------------------------------------------------------- |
| Search                           | Matching/empty results, filters, combinations, pagination, invalid/boundary inputs                 |
| Vacancy details                  | Identity/content, missing/expired/removed records and visibility                                   |
| Registration/authentication      | Server validation, valid/invalid credentials, role permissions, sessions and approved verification |
| CV/profile                       | Validation, uploads, ownership, persistence and unauthorized operations                            |
| Applications                     | Eligibility, duplicate/unavailable states, ownership and persisted read-back                       |
| Saved jobs                       | Add/read/remove, duplicates, ownership and persistence                                             |
| Notifications/messaging/employer | Verified access, payload, state and permission rules where supported                               |

[API cases](specifications/api-cases.md) define the initial independent scenarios.
Do not infer contracts from this inventory. Shared strict schemas and typed
clients remain canonical; no mocked backend proof or browser-driven API setup.
Missing access/contracts remain blockers, not a reason to expand E2E instead.

### 4.3 Native mobile automation – Maestro

Select native lifecycle/navigation, permissions, deep links and critical real
integrations after lower-layer coverage. Verify each platform/build and selectors
separately. Preserve default state-reset/destructive exclusions. Real delivery or
messaging needs deterministic triggers and disposable recipients; continue manual
real-device assessment. iOS simulators require a suitable macOS runner/build.

The following retained IDs map candidate flows, not promised implementations.
[Mobile cases](specifications/mobile-cases.md) track Android and iOS separately.

| ID          | Candidate risk                           |
| ----------- | ---------------------------------------- |
| MAESTRO-001 | Launch/home readiness                    |
| MAESTRO-002 | Critical keyword search                  |
| MAESTRO-003 | Filter controls/integration              |
| MAESTRO-004 | Detail/return navigation                 |
| MAESTRO-005 | Selected login/logout wiring             |
| MAESTRO-006 | Saved-job integration                    |
| MAESTRO-007 | Controlled application submission        |
| MAESTRO-008 | Reopen/state preservation                |
| MAESTRO-009 | Deep-link routing                        |
| MAESTRO-010 | Native authentication error presentation |

### 4.4 Canonical automation project structure

See [the single architecture reference](ARCHITECTURE.md). Shared config, contracts,
clients, types and factories stay in `shared/`; Playwright specs in `web/tests/`;
Maestro flows/helpers in `mobile/flows/` and `mobile/subflows/`. Node/TypeScript
tooling executes outside Maestro's JS runtime. Planned paths do not prove capability.

## 5. CI/CD and execution schedule

| Trigger            | Target coverage when ready                                               |
| ------------------ | ------------------------------------------------------------------------ |
| Pull request       | Quality checks, eligible API smoke/regression, focused isolated UI smoke |
| Staging deployment | API release gate, focused UI, selected web/native integration            |
| Nightly            | Broad API regression, smaller UI and selected E2E/platform checks        |
| Weekly             | Targeted browser/real-device/accessibility matrix                        |
| Release            | Eligible P0/P1 automation plus risk-based manual regression              |

CI implementation is deferred by user instruction; this section describes future
requirements and is not a blocker for the current local implementation work.
These are target gates, not currently enabled schedules. Prioritize API feedback;
each test remains independent and isolated UI can run independently once ready.
Use separate layer-identifiable jobs/reports. Add jobs only with real coverage and
safe access; no empty passing suites. Production E2E is not automatic on PRs.
State-reset/destructive mobile checks require separate deliberate opt-ins.

Reports must include redacted failure evidence, source/build/target identifiers,
browser/OS/device, locale, run ID and cleanup outcome. Keep HTML/JUnit/traces and
screenshots under ignored `reports/web/` or `reports/mobile/`.

## 6. Test data and dependencies

- Use ignored root `.env`/CI variables through shared validated configuration,
  with shell values taking precedence. Never hardcode targets or add unverified
  mobile/API values. Web needs `WEB_BASE_URL` and `TEST_LOCALE`; its limited E2E
  requires `ALLOW_PRODUCTION_READ_ONLY`. Observed same-origin API additionally
  needs `API_BASE_URL` and separate `ALLOW_PUBLIC_READ_ONLY_API`; both flags
  default false and never authorize writes.
- API readiness requires verified contracts/authorization and deterministic data.
  Writes (including setup, authentication, CV/profile changes, applications,
  favorites, alerts, messages and employer workflows) need approved non-production
  access, disposable accounts, unique owned data and validated safe cleanup.
- UI readiness requires a maintained real frontend backed entirely by fixtures,
  verified synthetic response files and canonical strict schemas.
- Mobile readiness requires verified installable builds/IDs, a reserved device,
  Romanian hierarchy, deterministic startup/authentication and shared reporting.
- Notification readiness requires an authorized disposable mailbox/device, verified
  provider configuration, supported trigger/retrieval and cleanup. A mailbox
  experiment does not establish Rabota delivery.
- All restrictions apply to manual work too. A URL change never authorizes
  production writes or enables an additional runtime.

## Remaining implementation prerequisites

The user confirmed on 2026-11-04 that no maintained frontend source/test build
or verified API documentation with controlled data is available. Record the
following as prerequisites, not implemented or passing coverage.

- Broader API search/filter/error/permission cases need verified operation contracts
  and deterministic approved datasets; existing public taxonomy/VIP checks do not
  supply those prerequisites. The whitespace contract discrepancy remains open.
- Isolated web UI needs a maintained real frontend source/test build backed entirely
  by fixtures, including server rendering. No such build/server is present here.
- Authentication, CV/profile, applications, saved jobs and synchronization need
  approved non-production access, disposable identities, owned data and cleanup.
  The production phone does not authorize these operations.
- Offline/permission/state-reset work needs an explicitly approved reserved-device
  setup; do not change this personal phone's network or reset its app/account.
- iOS implementation is deferred for lack of devices; CI remains user-deferred.

## 7. Proposed implementation roadmap

| Stage                  | Deliverable and exit evidence                                                                                                                                  |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. API discovery       | Verified contracts, authorized target/scope, deterministic datasets and ownership/cleanup plan; retain shared tooling foundation                               |
| 2. API implementation  | Strict shared schemas, typed clients and fixtures; search/vacancy smoke followed by broad negative/boundary, permission and persistence cases; eligible API CI |
| 3. Isolated UI         | Real frontend fixture/server isolation, verified response files, focused POMs/rendering/interactions/client validation and UI CI                               |
| 4. Selected E2E/native | Independently owned critical integrations, verified Maestro runner/helpers/builds, targeted synchronization/compatibility and layer-based reporting            |

Stages follow readiness rather than a fixed calendar. Keep scenario discovery,
manual design and traceability current throughout. Preserve the limited existing
registration-markup E2E baseline without making it the expansion template.
Unverified capabilities stay blocked; implementation is not execution evidence.

## 8. Quality metrics and release criteria

| Initial planning target                           | Value     |
| ------------------------------------------------- | --------- |
| P0 executed scenario coverage                     | 100%      |
| Suitable P0/P1 automation coverage                | 90% / 70% |
| Run stability in a controlled healthy environment | 98%       |

These are proposed targets to review after a baseline, not measured results or
permission to execute. Define the agreed detailed-case denominator, automation
suitability, exclusions and stability observation window. Track implemented and
executed coverage separately, report blockers, and record feedback time/defects by
layer. Backend rules should be API-owned; every E2E addition needs a distinct
integration/platform reason. Counts alone do not prove a healthy pyramid.

Release acceptance also requires no unresolved critical defects, no unaccepted
high-severity core-flow defects, documented Android/iOS results where supported,
targeted manual assessment and a regression report with known limitations.

## 9. Final deliverables

- Prioritized plan/case catalog with requirements, preconditions, data, steps,
  outcomes, cleanup and separate manual/implementation/execution statuses.
- Traceability, defect reports, safe data tooling and known gaps.
- API-first Playwright coverage, focused isolated UI and selected web/native E2E.
- Eligible CI gates, redacted reports and browser/device/build matrix.
- Release readiness report and maintained setup/triage instructions.

The public API increment has twelve implemented read-only autocomplete/VIP
identity cases, with [discovery evidence](specifications/api-discovery.md) and a
[latest executed result](specifications/api-read-only-increment-2026-11-04.md):
eleven passed and one active whitespace contract regression failed. Casing
identity is now observed for the selected Latin/Romanian pairs. The two new
padded/accentless-input cases validate contracts without defining normalization
policy. Earlier records remain historical.
Next expand verified
contracts and controlled datasets for the broader search/vacancy matrix. See the [catalog](specifications/test-case-catalog.md)
for gates and detailed records. No execution is implied by this roadmap.
