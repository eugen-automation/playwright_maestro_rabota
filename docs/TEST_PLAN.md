# QA Test Plan – Rabota.md

## Purpose and current scope

This plan defines the test strategy, execution gates, and release governance for
this automation repository. It does not grant production-write authority or claim
unverified product behavior.

Active scope: desktop web, authorized public API checks, and Android read-only
flows. iOS is deferred because no supported device/simulator is available. CI is
deferred by user instruction. Current implementation and result status lives in
[STATUS.md](STATUS.md); the maintained case register is [TEST_CASES.md](TEST_CASES.md).

## Strategy

Use the lowest suitable layer:

1. **API** owns backend contracts, validation, permissions, ownership, persistence,
   and business-rule matrices.
2. **Isolated UI** owns deterministic frontend rendering, interactions, client
   validation, accessibility, and controlled response presentation. It has no real
   backend traffic.
3. **Web E2E and Maestro** own selected frontend/backend wiring and platform risks
   that lower layers cannot establish.

Product unit/component testing is outside this repository because application
source is unavailable. Tooling tests validate automation infrastructure only.

## Priorities and coverage

| Priority | Coverage groups                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------------ |
| P0       | Job search, filters, vacancy details, registration/login, CV, applications                                   |
| P1       | Saved jobs, alerts, password reset, localization, messaging, maps, deep links, lifecycle, employer workflows |
| P2/P3    | Company profiles, subscriptions, informational pages, and cosmetic issues                                    |

The case register provides the specific planned/implemented coverage and gates.
Priority does not make a case executable; discovery, authorization, controlled
data, and cleanup requirements still apply.

## Environment and data rules

- Use the ignored root `.env` and shared validated configuration. No default URL
  or URL change grants another runtime or write capability.
- Public API, browser E2E, Android, and authentication use separate opt-ins.
- Writes require approved non-production access, disposable accounts/data, unique
  ownership, explicit opt-in, and validated cleanup.
- UI tests require a maintained fixture-backed real frontend, including server
  rendering, with fail-closed interception and no backend access.
- Mobile tests require verified build/ID, device, locale, selectors, deterministic
  startup, and reporting. Do not reset a personal device or alter its network,
  permissions, storage, or account state to manufacture coverage.
- Default locale is Romanian. Test other locales only in clearly scoped cases.

## Non-functional and manual testing

Accessibility, performance, security/privacy, localization, and exploratory work
remain required risk areas. Before any enters a release gate, create a charter
that names the owner, target build/environment, sampled flows, tooling, data,
duration, pass/stop criteria, evidence location, and defect-severity rules.

Current targets, not completed certification:

- Web accessibility: WCAG 2.2 AA-oriented assessment.
- Performance: agree datasets, environment, and numerical budgets before measuring.
- Security/privacy: authorized role/ownership and sensitive-data checks only; no
  unapproved production probing.
- Compatibility: record actual browser/channel/OS/device/build; one result never
  certifies another browser or platform.

## Release-cycle governance

Every formal test cycle names people for these roles:

| Role              | Responsibility                                                               |
| ----------------- | ---------------------------------------------------------------------------- |
| QA owner          | Approves active scope, case denominator, results, evidence, and limitations  |
| Product/API owner | Approves expected behavior and resolves oracle/contract questions            |
| Automation owner  | Confirms source, environment, data ownership, cleanup, and tooling integrity |
| Release owner     | Accepts residual risk, deferred scope, and unresolved high-severity defects  |

Entry requires an identified build/target, approved execution authority, ready
cases with approved expectations, available data/environment, named owners, and
a durable evidence location.

Exit requires:

- All active P0 cases executed; each failure resolved or explicitly accepted.
- No unresolved critical defect or unaccepted high-severity core-flow defect.
- Selected P1, compatibility, and manual charters completed for the recorded risk
  scope.
- Cleanup verified; evidence and known limitations included in the release report.
- Platform outcomes reported independently.

Automation percentage and stability targets are intentionally not release gates
until the team defines their numerator, denominator, exclusions, and controlled-run
window.

## Evidence and reporting

Every execution record includes result, reason, clean source commit or retained
source checksum, product build/target, platform, locale, run ID, data ownership,
cleanup outcome, and durable redacted artifact reference with retention period.
Ignored local artifacts without that manifest are development evidence, not formal
release evidence.

Reports remain segregated under `reports/web/` and `reports/mobile/`. Never place
credentials, personal data, authentication state, or raw sensitive traffic in
committed documentation or artifacts.

## Current blockers

- No approved non-production target/data exists for controlled API, authentication,
  profile/CV, application, favorites, messaging, alert, employer, or synchronization
  work.
- No maintained fixture-backed frontend build exists for isolated UI testing.
- `DEC-API-001` has no approved whitespace behavior; it remains an oracle/contract
  risk, not a confirmed product defect.
- iOS, CI, state-reset, destructive, and notification execution remain deferred or
  blocked by their documented prerequisites.

See [DECISIONS.md](DECISIONS.md) for verified observations and active decisions,
and [AGENTS.md](../AGENTS.md) for engineering constraints.
