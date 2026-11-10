# Test cases and traceability

This is the maintained case register for the automation repository. It records
what is implemented, blocked, or proposed; it does not authorize execution or
claim unverified product behavior. Current results are in [STATUS.md](STATUS.md).

## Status model

Each case is classified independently by behavior evidence, implementation, and
execution result:

| Field          | Allowed meaning                                    |
| -------------- | -------------------------------------------------- |
| Behavior       | Observed/approved, proposed, or awaiting discovery |
| Implementation | Implemented, not implemented, or blocked           |
| Execution      | Passed, failed, not run, deferred, or blocked      |

Case IDs are permanent. A proposed case becomes executable only after its
applicable gates have evidence:

| Gate | Required before execution                                                           |
| ---- | ----------------------------------------------------------------------------------- |
| D    | Approved requirement or authorized discovery, including expected outcome and owner  |
| U    | Maintained fixture-backed frontend with fail-closed backend isolation               |
| A    | Verified API operation, origin, contract, and independent opt-in                    |
| W    | Approved non-production target, disposable account/data, run ownership, and cleanup |
| M    | Verified mobile build, device, locale, selectors, startup, and reporting            |
| I    | iOS-capable macOS/device setup and independently verified iOS hierarchy             |
| N    | Authorized mailbox/device, trigger/retrieval contract, redaction, and cleanup       |
| P    | Explicit restricted public E2E opt-in for the exact approved document request       |

## Implemented cases

| Area       | IDs                                                                                                                               | Scope and result                                                                                                                  |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Public API | `API-PUBLIC-SUGGEST-01` through `11`, `API-PUBLIC-VACANCY-01`                                                                     | Twelve public GET-only contract/identity cases; latest recorded run: 11 passed, 1 failed due to the whitespace oracle discrepancy |
| Auth API   | `API-AUTH-FORM-01`, `API-AUTH-ACCESS-01`, `API-AUTH-SESSION-01`                                                                   | Implemented in a separate project; blocked and not executed until D/A/W resolve                                                   |
| Web E2E    | `E2E-WEB-007-01`                                                                                                                  | Exact Romanian registration document GET only; historical four-browser Windows pass; not interactive-registration coverage        |
| Android    | `AND-MOB-001-01`, `AND-MOB-PUBLIC-SEARCH-01/02`, `AND-MOB-PUBLIC-JOBS-01`, `AND-MOB-PUBLIC-FILTER-01`, `AND-MOB-PUBLIC-RESUME-01` | Six public read-only flows; historical pass only on the selected Android build/device                                             |

## Planned API coverage

| ID                    | Priority | Intended outcome                                                            | Gates             |
| --------------------- | -------- | --------------------------------------------------------------------------- | ----------------- |
| `API-SEARCH-01`       | P0       | Controlled matching search returns only approved expected records           | D, A, W if seeded |
| `API-SEARCH-02`       | P0       | City/combined filter semantics are enforced against controlled records      | D, A, W           |
| `API-SEARCH-03`       | P1       | Malformed or boundary inputs follow the approved policy                     | D, A              |
| `API-JOBS-01`         | P0       | Controlled vacancy details match documented identity/content                | D, A, W if seeded |
| `API-JOBS-02`         | P0       | Missing, expired, or removed vacancy behavior follows the documented policy | D, A              |
| `API-AUTH-01`         | P0       | Invalid credentials do not establish a session                              | D, A, W           |
| `API-CV-01`           | P0       | A candidate cannot read another owned private CV                            | D, A, W           |
| `API-APPLICATIONS-01` | P0       | An owned application persists once and is observable through read-back      | D, A, W           |

## Planned web coverage

Web UI cases are fixture-backed and must never reach the real backend. The plan
groups are the permanent traceability identifiers; split new variants only after
their behavior and synthetic payloads are verified.

| Plan group                              | Intended UI risk                                                                | Gates                             |
| --------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------- |
| `WEB-001` Home                          | Search controls, navigation, consent setup                                      | D, U                              |
| `WEB-002–005` Search and filters        | Rendered matching/empty/filter state; backend semantics remain API-owned        | D, U                              |
| `WEB-006` Vacancy detail                | Detail mapping and unavailable-state presentation                               | D, U                              |
| `WEB-007` Registration                  | Client validation, account-type controls, consent, and verified response states | D, U; A/W/N for real registration |
| `WEB-008–010` Login, CV, applications   | Modeled frontend feedback only; API owns rules/persistence                      | D, U; A/W for real integration    |
| `WEB-011–013` Saved jobs, alerts, reset | Separate lifecycle/notification cases after discovery                           | D, U/A, W, N as applicable        |
| `WEB-014` Localization                  | Targeted Romanian/Russian state and return to Romanian                          | D, U                              |
| `WEB-015–016` Employer and sessions     | Approved presentation/integration cases after discovery                         | D, U/A, W, N as applicable        |

## Planned mobile and cross-surface coverage

| Plan group    | Intended native/integration risk                                        | Gates                               |
| ------------- | ----------------------------------------------------------------------- | ----------------------------------- |
| `MOB-001–004` | Launch, search, filters, detail/return on controlled data/builds        | D, M; I for iOS; A/W where seeded   |
| `MOB-005–007` | Authentication, application, saved-job persistence                      | D, M, W; I for iOS; A as applicable |
| `MOB-008–015` | Deep links, push, map, messaging, resume, offline, permissions, upgrade | D, M; I/N/W as applicable           |
| `SYNC-001`    | Desktop save becomes visible on mobile                                  | D, A, W, M; I for iOS               |
| `SYNC-002`    | Desktop removal becomes absent on mobile                                | D, A, W, M; I for iOS               |

iOS remains deferred and excluded from active release denominators until a
supported device/simulator and build are available. No platform's result certifies
another platform.

## Case maintenance rules

- Keep business assertions in the owning layer: backend rules in API, frontend
  presentation in mocked UI, integration/platform risks in E2E or Maestro.
- Record every execution with source revision or source checksum, build/target,
  platform, locale, owned data/cleanup, result, and durable redacted evidence.
- Do not turn a blocked case into a pass by relaxing a schema, retrying blindly,
  skipping an assertion, or substituting live data for controlled data.
- Add a case only when it has a distinct risk, acceptance source, and owning layer.
