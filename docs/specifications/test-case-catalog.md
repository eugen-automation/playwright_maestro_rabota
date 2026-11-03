# Detailed test-case catalog

Created 2026-11-03. Scope: step 2 of the implementation plan.

Sources: [test plan](../TEST_PLAN.md), [engineering rules](../../AGENTS.md),
[registration discovery](registration-discovery.md), and
[executed foundation baseline](foundation-baseline.md).

This is an initial prioritized catalog and traceability map. Expected outcomes
outside the observed registration markup are proposed acceptance criteria from
the test plan, pending product/discovery confirmation. They are not observations
of working features. No new application behavior was inspected or executed while
creating this catalog.

Initial design inventory: **55 case instances** — 27 web (26 proposed UI cases
and the existing limited E2E case), 8 API, 16 native mobile (8 templates with
separate Android/iOS records), and 4 synchronization (2 templates with separate
platform records). Only the existing E2E case has an implementation and a prior
recorded pass. The other 54 instances remain proposed and unimplemented. These
counts exclude undetailed backlog and do not measure executed coverage.

## Reading and maintaining cases

- [Web cases](web-cases.md): first UI increment and the existing limited E2E case.
- [API cases](api-cases.md): initial backend contract and business-rule candidates.
- [Mobile cases](mobile-cases.md): separate Android/iOS execution records.
- [Cross-platform cases](cross-platform-cases.md): independently owned synchronization checks.

A case ID is permanent. Web cases have exactly one intended layer and one suite.
Priority is business risk, not a test tag. Every detailed case inherits the
source, platform, status, evidence, and cleanup rules in its document unless an
explicit override appears in that case. These inherited fields form part of the
case record. API and mobile cases link back to the same feature coverage groups;
they do not turn a mocked UI pass into backend or platform coverage.

Manual status, automation suitability, implementation status, and automation
result are separate fields. Defaults for all proposed cases are:

| Field                     | Initial value                                               |
| ------------------------- | ----------------------------------------------------------- |
| Behavior verification     | Proposed; discovery required                                |
| Manual execution          | Not run; prerequisite gates unresolved                      |
| Automation suitability    | Candidate; reassess after discovery                         |
| Automation implementation | Not implemented                                             |
| Automation execution      | Not run; prerequisite gates unresolved                      |
| Evidence                  | None; add a dated execution record before claiming a result |

The sole exception is `E2E-WEB-007-01`: implemented with a prior Chromium pass
recorded in the foundation baseline. It has no recorded manual execution. This
single markup check does not complete parent group `WEB-007`.

A gate denotes a known prerequisite, not a skipped test or authorization.
Promote a case to ready only after its gates have dated evidence. Record blocked
and not-run work separately from passes. Mark unsupported behavior as not
applicable only after product/build verification and a documented reason; retain
its ID. Do not invent missing expected error text, routes, status codes, field
names, selectors, numeric limits, or platform identifiers.

## Prerequisite gates

| Gate                  | Required evidence before implementation/execution                                                                                                                                                                                                                                                                                                                                            |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D — Discovery         | Dated requirements or observed behavior for the selected feature/build: navigation, controls, supported inputs, expected outcomes, locale, and relevant contracts. Resolve each case's open questions.                                                                                                                                                                                       |
| U — Isolated frontend | Maintained real frontend build/server backed by fixtures, including server-rendered data. Verified synthetic response files and strict shared schemas where JSON is modeled. Fixture interception installed before navigation; unexpected backend activity fails; service workers and observed alternative transports cannot bypass isolation. No real clients, seeders, or backend traffic. |
| A — Authorized API    | Verified base URL, endpoints, methods, request/response contracts and permissions; shared typed configuration and clients; explicit runtime enablement. The current API runtime remains disabled.                                                                                                                                                                                            |
| W — Controlled writes | Approved non-production target, explicit execution opt-in, disposable account(s), controlled vacancies, unique run/test ownership, validated setup and cleanup limited to owned records. Applies to manual execution too, including authentication, email, saved jobs, and profile changes. A URL override cannot enable writes.                                                             |
| M — Mobile readiness  | Verified installed build and platform identifier, supported OS/device, Romanian UI hierarchy, deterministic startup/authentication, shared runner and reporting. No reliance on a previously signed-in device.                                                                                                                                                                               |
| I — iOS readiness     | Suitable macOS simulator runner/build or approved supported physical-device setup, with iOS-specific identifier and hierarchy verified. Windows does not supply an iOS simulator.                                                                                                                                                                                                            |
| N — Notifications     | Authorized disposable mailbox/device, verified provider configuration/contracts, deterministic email/push trigger and retrieval, redaction and cleanup. Existing mailbox experiments do not prove Rabota delivery.                                                                                                                                                                           |
| P — Public E2E        | Explicit read-only opt-in and verified target. The current fixture permits only the exact registration-document GET with JavaScript disabled. Other live scenarios require a separately reviewed implementation; this catalog does not widen the policy.                                                                                                                                     |

For mobile cases, resolve M separately on Android and iOS; iOS additionally
requires I. Real API/mobile/E2E writes require W. Local mocked UI can model
outcomes without W only after U is proven; the product backend must remain
unreachable, including during initial server rendering.

## Synthetic data recipes

These names describe needed data, not existing fixtures or executable inputs.
Choose actual supported values during discovery, then create typed tables,
shared factories, and validated response files in their canonical directories.
No account, vacancy, query, mailbox, or upload file below currently exists by
virtue of appearing in this table.

| Recipe                               | Required properties                                                                                                                                             |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MATCHING-SEARCH                      | A verified supported Romanian query and controlled result set with known matching and nonmatching records.                                                      |
| EMPTY-SEARCH                         | A deterministic zero-result response; never rely on a random word having no live matches.                                                                       |
| FILTER-SET                           | Verified city, salary boundary/currency semantics, and workplace option; include one matching record and records excluded by each criterion.                    |
| VACANCY-ACTIVE / VACANCY-UNAVAILABLE | Controlled active vacancy and independently modeled unavailable state with approved product handling.                                                           |
| REGISTRATION-INPUTS                  | Synthetic email/password/consent variants. Password lengths 7, 8, 24 and 25 derive only from the observed inline 8–24 check, not a verified backend policy.     |
| ACCOUNT-CANDIDATE / ACCOUNT-OTHER    | Distinct disposable identities for success and ownership checks; synthetic profile information. Secrets stay in approved ignored configuration or CI injection. |
| CV-VALID / CV-INVALID                | Synthetic document accepted under verified file rules; independent invalid type/size cases after actual boundaries are known.                                   |
| APPLICATION-STATES                   | Independently modeled success, missing-CV, duplicate, expired-vacancy, failure, and history states, after each behavior is verified.                            |
| RUN-OWNERSHIP                        | Unique run/test identifier and registry of resources created by that case, used by setup, teardown, and follow-up cleanup.                                      |

## Web traceability

A link means a detailed candidate exists, not that its parent is covered or
verified. Follow-up entries below are explicitly undetailed backlog; split
positive, negative, and boundary variants before implementation. Existing
limited evidence remains narrower than the parent goal.

| Plan group                     | Priority | Detailed cases / remaining work                                                                                                                                                                            |
| ------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| WEB-001 Home                   | P0       | [UI-WEB-001-01](web-cases.md#ui-web-001-01); broader navigation discovery remains.                                                                                                                         |
| WEB-002 Matching search        | P0       | [UI-WEB-002-01](web-cases.md#ui-web-002-01), [API-SEARCH-01](api-cases.md#api-search-01).                                                                                                                  |
| WEB-003 Empty search           | P1       | [UI-WEB-003-01](web-cases.md#ui-web-003-01).                                                                                                                                                               |
| WEB-004 City filter            | P0       | [UI-WEB-004-01](web-cases.md#ui-web-004-01), [API-SEARCH-02](api-cases.md#api-search-02).                                                                                                                  |
| WEB-005 Combined filters       | P0       | [UI-WEB-005-01](web-cases.md#ui-web-005-01), [API-SEARCH-02](api-cases.md#api-search-02).                                                                                                                  |
| WEB-006 Vacancy details        | P0       | [UI-WEB-006-01](web-cases.md#ui-web-006-01), [UI-WEB-006-02](web-cases.md#ui-web-006-02), [API-JOBS-01](api-cases.md#api-jobs-01), [API-JOBS-02](api-cases.md#api-jobs-02).                                |
| WEB-007 Candidate registration | P0       | [Existing markup E2E](web-cases.md#e2e-web-007-01), [form cases](web-cases.md#registration-validation). Real creation/verification and backend registration remain gated backlog (D, A, W, N).             |
| WEB-008 Login                  | P0       | [UI-WEB-008-01](web-cases.md#ui-web-008-01), [UI-WEB-008-02](web-cases.md#ui-web-008-02), [API-AUTH-01](api-cases.md#api-auth-01). Valid real authentication and integration remain backlog (D, A, W).     |
| WEB-009 CV                     | P0       | [UI-WEB-009-01](web-cases.md#ui-web-009-01), [UI-WEB-009-02](web-cases.md#ui-web-009-02), [API-CV-01](api-cases.md#api-cv-01). Create/edit/persistence and valid backend uploads remain backlog (D, A, W). |
| WEB-010 Applications           | P0       | [UI scenarios](web-cases.md#applications), [API-APPLICATIONS-01](api-cases.md#api-applications-01). Backend negative variants and real integrated submission remain backlog (D, A, W).                     |
| WEB-011 Saved jobs             | P1       | [Synchronization cases](cross-platform-cases.md); standalone add/remove, duplicate, and ownership cases remain backlog (D, U / A, W).                                                                      |
| WEB-012 Email alerts           | P1       | Backlog: subscribe, verify delivery, unsubscribe, invalid input, duplicate policy (D, U / A, W, N).                                                                                                        |
| WEB-013 Password reset         | P1       | Backlog: request, approved unknown-account response, valid/expired/used reset link, session behavior (D, U / A, W, N).                                                                                     |
| WEB-014 Localization           | P1       | [UI-WEB-014-01](web-cases.md#ui-web-014-01); targeted Cyrillic/diacritic inputs and layout checks remain backlog (D, U).                                                                                   |
| WEB-015 Employer               | P1       | [Account-type presentation](web-cases.md#ui-web-007-08) only. Separate employer creation, vacancy draft/publish, validation, permissions, cleanup remain backlog (D, U / A, W, N).                         |
| WEB-016 Sessions               | P1       | Backlog: logout, expiry, protected navigation, cache/back behavior (D, U / A, W).                                                                                                                          |

Additional API search malformed-input coverage:
[API-SEARCH-03](api-cases.md#api-search-03). Notifications, messaging, favorites
API lifecycle, profile permissions, and successful authentication/registration
need separate detailed cases once their contracts are available.

## Mobile traceability

Each detailed template has two independently tracked platform instances. A
shared description never establishes support or a pass on the other platform.

| Plan group                  | Priority | Detailed template / remaining work                                                                                                     | Maestro plan mapping                   |
| --------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| MOB-001 Installation/launch | P0       | [MOB-001-01](mobile-cases.md#mob-001-01) covers launch; installation is separate backlog.                                              | MAESTRO-001                            |
| MOB-002 Search              | P0       | [MOB-002-01](mobile-cases.md#mob-002-01)                                                                                               | MAESTRO-002                            |
| MOB-003 Filters             | P0       | [MOB-003-01](mobile-cases.md#mob-003-01); individual boundary variants remain backlog.                                                 | MAESTRO-003                            |
| MOB-004 Details/return      | P0       | [MOB-004-01](mobile-cases.md#mob-004-01)                                                                                               | MAESTRO-004                            |
| MOB-005 Registration/login  | P0       | [MOB-005-01](mobile-cases.md#mob-005-01) covers valid login; registration, logout, invalid login and state-reset cases remain backlog. | MAESTRO-005, MAESTRO-010               |
| MOB-006 Apply               | P0       | [MOB-006-01](mobile-cases.md#mob-006-01); negative cases remain backlog.                                                               | MAESTRO-007                            |
| MOB-007 Saved job           | P1       | [MOB-007-01](mobile-cases.md#mob-007-01) covers save/reopen; independent remove case remains backlog.                                  | MAESTRO-006, MAESTRO-008               |
| MOB-008 Deep links          | P1       | Backlog: verified valid/unavailable vacancy links, app closed/open behavior (D, M, I as applicable).                                   | MAESTRO-009                            |
| MOB-009 Push                | P1       | Backlog: receipt and separately opening the correct destination (D, M, W, N; physical-device assessment).                              | No separate ID assigned in plan.       |
| MOB-010 Map                 | P1       | Backlog: supported map controls, region/result relationship, permission states (D, M).                                                 | No separate ID assigned in plan.       |
| MOB-011 Messaging           | P1       | Backlog: send and receive with two owned accounts and deterministic delivery (D, M, W, N).                                             | No separate ID assigned in plan.       |
| MOB-012 Resume              | P1       | Backlog: independent background/resume case and interrupted-action recovery (D, M; W when state changes).                              | MAESTRO-008 overlaps persistence only. |
| MOB-013 Network             | P1       | [MOB-013-01](mobile-cases.md#mob-013-01) covers offline recovery; high-latency/interrupted-write cases remain backlog.                 | No separate ID assigned in plan.       |
| MOB-014 Permissions         | P1       | Backlog: denial and later grant as independent controlled-state cases (D, M; disposable device).                                       | No separate ID assigned in plan.       |
| MOB-015 Upgrade             | P1       | Backlog: supported build-to-build update and account/data preservation (D, M, W; pinned old/new builds).                               | No separate ID assigned in plan.       |

## Manual and compatibility backlog

These areas remain part of the test plan and need detailed charters/cases before
execution. No complete regression, accessibility conformance, security audit,
performance target, or browser/device certification is claimed.

| Area and source                        | Next design work                                                                                                                                                           |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Test plan §2.4 accessibility/usability | Keyboard, focus, names, contrast, screen readers, large text; use the plan's WCAG 2.2 AA target. Select pages and manual assistive-technology matrix.                      |
| Test plan §2.4 performance             | Agree measurement environment, datasets and budgets before assigning numeric pass thresholds; assess cold start, search, long lists, and slow networks.                    |
| Test plan §2.4 security/privacy        | Authorized session/role/ownership checks, synthetic file uploads and redacted evidence; no production probing.                                                             |
| Test plan §2.4 exploratory             | Time-box navigation, rapid filters, interrupted submissions and web/mobile transitions, with separate charters and findings.                                               |
| Test plan §3 compatibility             | Record actual browser/channel/OS/device/build. Chromium does not certify Chrome/Edge; WebKit does not certify Safari. Add macOS Safari and physical Android/iPhone checks. |
| Test plan §1 P2/P3                     | Company profiles, subscriptions, other employer tools and informational/cosmetic coverage remain lower-priority backlog.                                                   |

## Execution record

For every actual execution, append a dated record linked from the case. Include
case/platform/layer, manual or automated mode, result (pass/fail/blocked/not run),
reason, build/source commit, target identifier without credentials, browser/OS/
device, locale, run ID, data ownership, redacted evidence/defect links, and cleanup
result. Reference secret names only. Never paste credentials, live CVs, personal
account details, raw session-bearing HTML, or authentication state.

Promote proposed criteria only after supporting requirements and discovery agree.
For successful API JSON contracts, assert status separately, parse JSON as
`unknown`, and use `expect(Schema.parse(body)).toBeTruthy();` with canonical strict
schemas. Give each explicit request its own step when a test makes multiple
requests; setup/cleanup is validated too.

## Implementation order

1. Resolve D for homepage, matching/empty search, city/combined filters and
   vacancy details; record observations without modifying live accounts.
2. Resolve U and implement the linked independent UI smoke cases; expand
   negative states as regression. Do not replace the real frontend with a
   handwritten demonstration page.
3. Resolve registration behavior and U before implementing client validation;
   preserve the current limited E2E guard.
4. Resolve A before API implementation; W additionally precedes any real
   registration, authentication, CV/application or other state-changing execution.
5. Resolve M per platform, then I for iOS, before native smoke.
6. Detail the explicit backlog and selected real E2E journeys incrementally;
   update traceability and statuses from observed results.

This catalog creates no executable tests, target configuration, fixture data, or
new execution permissions. Coverage percentages must use an agreed detailed-case
denominator; neither linked backlog nor blocked cases count as executed coverage.
