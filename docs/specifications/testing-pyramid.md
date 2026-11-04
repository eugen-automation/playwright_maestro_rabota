# API-first testing pyramid

Adopted 2026-11-03. Governing rules: [AGENTS.md](../../AGENTS.md).
Roadmap: [test plan](../TEST_PLAN.md#7-proposed-implementation-roadmap).
Case inventory and readiness gates: [catalog](test-case-catalog.md).

## Layer order and scope

| Priority | Layer                            | Investment and responsibility                                                                                                                |
| -------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 1        | API — `web/tests/api/`           | Broadest application coverage: contracts, business rules, validation, permissions, ownership, persistence and negative/boundary combinations |
| 2        | Isolated UI — `web/tests/ui/`    | Smaller focused coverage: rendering, interactions, client validation, accessibility and presentation of controlled response states           |
| 3        | Web E2E, Maestro, cross-platform | Select critical integrated outcomes and platform-specific risks that lower layers cannot establish                                           |

Product unit/component tests would form a lower layer in the full product
pyramid. Application source is not available in this repository; service API
tests are integration tests, not unit tests. Foundation tests cover automation
configuration and network policy only. Do not add artificial unit tests around
invented product logic to create a numerical pyramid.

API coverage is the primary implementation and maintenance investment. There is
no fixed count or percentage quota. Keep each test independent; the layer order
does not make a test depend on a preceding API/UI test's state or result.

The original catalog had 8 API, 26 UI, 1 web E2E, 16 mobile and 4 cross-platform
instances. Eight observed public API cases have since been implemented, bringing
the inventory to 63. Two subsequent casing-identity regressions bring it to 65;
their first live verification has now passed for the selected pairs. Two
normalization-input contract cases bring the catalog to 67 instances. The latest
public run has **11 passed, 1 failed** across twelve cases; the whitespace
discrepancy remains active. See the
[latest implementation/execution record](api-read-only-increment-2026-11-04.md).
The earlier 2026-11-04 API run has seven passes and one active
whitespace contract failure; all 14 foundation checks passed. See the
[execution record](api-execution-2026-11-04.md). The original markup E2E retains
its prior result. Counts are not a target ratio or full feature coverage. Keep
IDs/evidence, expand API design first, and select UI/E2E by distinct risk. See
[API discovery](api-discovery.md) for the limited implemented GET-only scope.

## Feature ownership

The later native continuation brings the retained catalog to 72 instances,
including six implemented public Android flows. Ten iOS instances are explicitly
deferred because no devices are available; they are excluded from active gates.
The existing markup E2E now has a passing four-browser Windows matrix, which is
additional execution coverage of one scenario, not new logical test cases. See
[current evidence](mobile-read-only-continuation-2026-11-04.md) and the catalog for
remaining data/build/authorization prerequisites. CI remains deferred.

The following is proposed coverage ownership, not verified product behavior.
Use documented requirements and authorized discovery before implementing any row.

| Feature                         | API owns the broad matrix                                                                            | Isolated UI owns focused checks                                        | E2E/native selection                                                            |
| ------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Search and filters              | Matching rules, empty results, individual/combined filters, boundaries, pagination, malformed inputs | Query/filter controls, rendered results, loading/empty/error states    | One critical search-to-detail integration; native navigation/state where needed |
| Vacancy details                 | Identity, modeled content, availability and missing/removed-record policies                          | Content mapping and unavailable-state presentation                     | Correct destination and return navigation                                       |
| Registration and authentication | Server validation, role/permission rules, session lifecycle and approved verification behavior       | Client validation, account-type controls and server-error presentation | Selected real sign-in or registration/verification wiring when safe             |
| CV and profile                  | Validation, ownership, authorized persistence and upload policies                                    | Form interaction, upload feedback and validation presentation          | Selected critical upload/profile integration only                               |
| Applications                    | Eligibility, duplicates, vacancy state, ownership and persistence                                    | Action availability and modeled confirmation/error states              | One controlled critical submission outcome                                      |
| Saved jobs                      | Add/remove/read-back, duplicate policy, ownership and persistence                                    | Saved-state controls and feedback                                      | Selected persistence/synchronization risk, not the entire API matrix            |
| Notifications and messaging     | Authorized delivery state, permissions and payload rules where supported                             | Controlled state presentation                                          | Selected real delivery/deep-link integration with disposable recipients         |
| Native platform behavior        | Shared backend rules remain API-owned                                                                | Web-specific presentation remains UI-owned                             | Launch, deep links, permissions, lifecycle and supported offline recovery       |

Frontend client validation still deserves UI tests even when the backend
validates the same input: they prove different responsibilities. Avoid repeating
every backend boundary through the browser. Modeled UI error states also do not
prove that the backend emits those errors correctly.

## Immediate API implementation backlog

1. Obtain API documentation or authorized observed contracts and a permitted
   target. Record methods, relative paths, authentication, response media types,
   status behavior and relevant business semantics; source markup references
   alone do not verify an API contract.
2. Establish deterministic read-only search/vacancy datasets and expected
   outcomes. If creating those records is necessary, resolve controlled-write
   gate W first. Public browser access does not authorize API access.
3. Extend the existing shared environment adapter only with verified values and
   explicit runtime authorization. Keep API execution disabled until ready;
   changing the web URL or reusing its read-only flag must not enable API access.
4. Model strict canonical success/error JSON schemas under
   `shared/api/schemas/`, re-exported from `web/fixtures/api/schemas/index.ts`.
   Implement typed request clients in `shared/api/clients/` and compose API
   fixtures through `web/fixtures/pom/test-options.ts`. API tests must not need a
   browser context or UI setup.
5. Implement `API-SEARCH-01` and `API-JOBS-01` as the first independent smoke
   cases, then `API-SEARCH-02`, `API-SEARCH-03` and `API-JOBS-02`. Expand empty,
   pagination, individual filter and boundary cases after verifying semantics.
6. Broaden authentication, permission, ownership and write/persistence matrices
   as their gates resolve. Use unique data ownership and validated setup/cleanup;
   retain safe target and disposable-account requirements.

The existing [API cases](api-cases.md) are proposed specifications. This backlog
does not supply endpoints, schemas, credentials, targets or new execution rights.

## API readiness evidence

Before enabling the first API suite, record:

- The authorized target and access scope, with verified configuration names and
  placeholder entries in `.env.example`; no credentials or absolute target URLs
  in implementation files.
- Requirements/contract source and discovery date for each modeled operation,
  including success, relevant errors, empty/non-JSON responses and permissions.
- Deterministic dataset provenance and expected business outcomes; data ownership
  and cleanup for every setup mutation.
- Strict schema and client/fixture implementation locations, layer/suite tags,
  safe runtime guards and explicit capability enablement.
- Validation and execution status reported separately. If execution is deferred,
  record **not run**, rather than treating code or schema review as a pass.

After readiness, use the existing mandatory status, schema and per-request-step
conventions. Each test owns its setup and cleanup. No browser-driven API setup,
mocked backend proof, silent schema widening or dependence on another spec.

## CI and maintenance order

The target feedback order is quality checks, eligible broad API checks, focused
isolated UI checks, then selected integration/platform gates. Isolated UI can
run independently once its prerequisites exist; sequencing gates must not create
shared test state. Keep layer reports distinct under the existing report roots.

Add API jobs only when real tests, verified configuration and safe CI access
exist. Do not add an empty passing job or use `--pass-with-no-tests`. The current
quality workflow and separately opted-in registration E2E workflow retain their
existing behavior. This change does not add schedules or enable live execution.

For each new feature, review API rule coverage before adding UI/E2E cases. Each
E2E addition should name the integration/platform defect it detects beyond API
and mocked UI. Track coverage gaps, implemented distribution, feedback time and
failures by layer; proposed case counts alone do not demonstrate a healthy pyramid.
