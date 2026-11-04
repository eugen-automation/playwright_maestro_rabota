# Initial detailed API cases

Source: [test plan §4.2](../TEST_PLAN.md#42-api-automation--playwright-apirequestcontext)
and the linked feature groups in each case.
[Catalog](test-case-catalog.md) defines gates and data recipes.
[Implementation status](api-discovery.md) distinguishes implemented public
contracts from the still-blocked controlled-data cases.

Platform/layer: Playwright APIRequestContext, `@api`; no browser actions and no
mocked backend responses. Every listed suite becomes exactly one suite tag.
Locale-sensitive requests use verified Romanian semantics where supported;
do not add undocumented locale fields.

For the eight controlled-data cases: behavior verification **proposed**, manual execution **not run
(gates unresolved)**, automation suitability **candidate**, implementation
**not implemented**, automation execution **not run (gates unresolved)**, evidence
**none**. These inherited fields apply to those original cases only. The eight
public cases below have explicit observed/implemented overrides and a separately
opted-in read-only runtime; see [discovery evidence](api-discovery.md).
Four additional cases cover casing identity and normalization-input contracts;
all four passed in the [latest run](api-read-only-increment-2026-11-04.md).

Success JSON validation uses canonical strict shared schemas, status assertions
separate from `expect(Schema.parse(body)).toBeTruthy();`, and JSON typed as
`unknown`. Dedicated modeled error/empty schemas apply only to relevant JSON;
never parse an empty 204 body or non-JSON response as JSON. If a spec explicitly
makes multiple requests, each request gets its own descriptive `test.step()`
with status, applicable schema and business assertions together. Seed/cleanup
requests are also validated. Fixture-owned setup must not hide failed setup or
cleanup. W is required for any actual seeding even in a nominally read-only case.

Business-rule membership and controlled empty/error cases require authorized
controlled data. The user separately authorized public network discovery; the
limited public contract/identity cases document their live-data dependency.
Browser E2E opt-in alone still does not authorize API execution. Pending contracts
must never be filled in with guessed endpoints, methods or payloads.

## API-first design priorities

This is the **first implementation priority** and the seed of the broadest
application-test layer, following the [testing-pyramid strategy](testing-pyramid.md).
Start with `API-SEARCH-01` and `API-JOBS-01`, then expand the independent filter,
malformed-input and unavailable-detail cases. Authentication, ownership and
write/persistence matrices follow when their access and data gates resolve.

The eight detailed cases below are not the full API regression target. Expand
these verified areas before growing corresponding browser/native coverage:

| Area                            | API-first design backlog; all require verified behavior/contracts                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Search                          | Empty results, individual filters, boundaries, pagination, supported combinations and malformed input variants                 |
| Vacancy details                 | Identity/content, unavailable-state variants and any documented visibility restrictions                                        |
| Authentication and registration | Server input validation, valid/invalid authentication, role permissions, session expiry/logout and approved verification rules |
| CV/profile                      | Validation/upload rules, ownership, allowed updates, persistence and unauthorized operations                                   |
| Applications                    | Eligibility, missing CV, duplicates, unavailable vacancies, ownership and persisted read-back                                  |
| Saved jobs                      | Add/read/remove, duplicates, ownership and persistence                                                                         |
| Other verified services         | Notification/message access and state, employer permissions and validation where supported                                     |

These are undetailed backlog groups, not additional case instances or runnable
requests. Split them into independent permanent case IDs only after discovery;
retain the catalog's current counts until detailed records are added. UI checks
still verify client-side feedback, but backend rules belong here.

## Implemented public read-only cases

Source: [authorized observations](api-discovery.md); related plan groups
WEB-002/WEB-006 and API search/detail areas. All use layer `@api` and the
feature `@search` or `@jobs`; suite and priority are listed per case.

Shared fields: behavior **observed for the modeled inputs**, manual execution
**not run**, automation **suitable for this limited public scope**,
implementation **complete**. The executed results below are from
[2026-11-04](api-execution-2026-11-04.md). The whitespace response violates the
modeled contract and remains an active failure.

| Case ID               | Priority / suite | Independent action and expected outcome                                                                                             | Automation result                               |
| --------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| API-PUBLIC-SUGGEST-01 | P0 / smoke       | GET `programator`; status 200, strict JSON and `Programator` label                                                                  | Passed                                          |
| API-PUBLIC-SUGGEST-02 | P0 / smoke       | GET `contabil`; status 200, strict JSON and `Contabil` label                                                                        | Passed                                          |
| API-PUBLIC-SUGGEST-03 | P0 / smoke       | GET `șofer`; status 200, strict JSON and `Șofer` label                                                                              | Passed                                          |
| API-PUBLIC-SUGGEST-04 | P1 / regression  | GET empty string; status 200 and strict zero-suggestion response                                                                    | Passed                                          |
| API-PUBLIC-SUGGEST-05 | P1 / regression  | GET `PROGRAMATOR`; strict JSON includes `Programator`                                                                               | Passed                                          |
| API-PUBLIC-SUGGEST-06 | P1 / regression  | GET `ȘOFER`; strict JSON includes `Șofer`                                                                                           | Passed                                          |
| API-PUBLIC-SUGGEST-07 | P1 / regression  | GET three spaces; strict contract and usable non-blank labels                                                                       | Failed; [API-CONTRACT-001](api-contract-001.md) |
| API-PUBLIC-VACANCY-01 | P0 / smoke       | GET current public search HTML; select an observed VIP route; separate GET popup JSON with status, strict contract and ID agreement | Passed                                          |

### Casing identity regression increment — 2026-11-04

| Case ID               | Priority / suite | Independent action and expected outcome                                                                                                                                                             | Automation result            |
| --------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| API-PUBLIC-SUGGEST-08 | P1 / regression  | GET the observed lowercase and uppercase programmer queries in separate steps; both responses satisfy the strict contract and contain exactly one expected label with the same positive taxonomy ID | Passed; latest read-only run |
| API-PUBLIC-SUGGEST-09 | P1 / regression  | Independently repeat the identity check for the observed Romanian driver queries, preserving diacritics                                                                                             | Passed; latest read-only run |

Source: plan §4.2 search contracts and targeted localization; existing observed
query/label pairs in [discovery](api-discovery.md). Behavior verification:
**query/label presence, cross-casing ID equality and label uniqueness observed
for the selected inputs in the latest run**. Manual execution: **not run**. Automation suitability:
**suitable for the limited public scope**. Implementation: **complete** in
the same spec and typed case table. These expectations check consistent identity
for the same exact taxonomy label, without assuming equal full result sets,
ordering, accent removal, or whitespace normalization. Each test independently
fetches its baseline; neither relies on another case or pins a live taxonomy ID.
Preconditions, read-only isolation, teardown and live-data limits below also apply.
Evidence: [implementation verification](api-implementation-2026-11-04.md).

### Normalization-input contract increment — 2026-11-04

| Case ID               | Priority / suite | Independent action and expected outcome                                                                                            | Automation result |
| --------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| API-PUBLIC-SUGGEST-10 | P1 / regression  | GET `programator` with one ASCII space on each side; assert HTTP 200, JSON media type and the existing strict suggestions contract | Passed            |
| API-PUBLIC-SUGGEST-11 | P1 / regression  | GET `sofer`; assert HTTP 200, JSON media type and the existing strict suggestions contract                                         | Passed            |

Source: normalization-input observations in [discovery](api-discovery.md) and plan
§4.2 search contracts. Behavior verification: **observed for these exact inputs
in the latest run**. Manual execution: **not run**. Automation suitability:
**suitable for this limited public contract scope**. Implementation: **complete**.
No non-production environment is available; both cases remain public GET-only.
Each independent request owns its fixture context and teardown. The existing
schema permits empty results and validates every returned taxonomy entry; these
tests do not require trimming, accent equivalence, equal result sets or a fixed
normalization policy. No new endpoint/schema branch was invented or widened.
Inputs and specs are linked below. Evidence:
[latest execution](api-read-only-increment-2026-11-04.md).

Preconditions: verified same-origin `API_BASE_URL`, separate
`ALLOW_PUBLIC_READ_ONLY_API=true` opt-in and public service availability.
Inputs: [typed observed cases](../../web/test-data/static/public-api-cases.ts);
no disposable account or fixed live vacancy ID is used. Each case owns isolated
request contexts, disposed in fixture teardown; no backend records are changed.
Implementation: [public-jobs.spec.ts](../../web/tests/api/public-jobs.spec.ts).
Evidence: [execution record](api-execution-2026-11-04.md), with generated
HTML/JUnit and failure trace under ignored `reports/web/`.

Live limits: taxonomy labels may change; supported VIP listings may disappear or
expire between requests. Fail and investigate those outcomes; never skip or
silently retry. Empty autocomplete input is distinct from zero-result vacancy
search. These public IDs do not replace the controlled-data cases below.

## Controlled-data cases awaiting prerequisites

### API-SEARCH-01

Valid keyword returns contract-valid matching vacancies.

- Source links: test plan §4.2; WEB-002; MOB-002.
- Priority / suite: P0 / smoke.
- Gates / preconditions: D, A. Authorized read access and verified matching semantics; controlled searchable records available.
- Synthetic data: MATCHING-SEARCH, including known matches and nonmatches.
- Steps:
  1. Prepare independently owned/approved search data through verified setup if available; any real writes additionally require W.
  2. Issue the documented keyword request.
  3. Assert documented status, parse the JSON as unknown, validate its strict schema, and compare records against approved matching rules.
- Expected outcome: Response satisfies the approved success contract and contains the controlled expected matches without unrelated controlled nonmatches.
- Cleanup: Release request context. If controlled data was seeded, require W and validated teardown limited to this run's records.
- Discovery question: Endpoint, method, parameter names, normalization/ranking and deterministic dataset are unverified. Live changing results cannot prove exact membership.
- Status / evidence: inherits the proposed, not-run, not-implemented fields above; no execution evidence.

### API-SEARCH-02

Combined city, salary and workplace filters enforce intersection.

- Source links: test plan §4.2; WEB-004; WEB-005; MOB-003.
- Priority / suite: P0 / regression.
- Gates / preconditions: D, A. All filter capabilities and semantics documented; controlled data distinguishes each exclusion.
- Synthetic data: FILTER-SET with one record satisfying all criteria and separate records failing city, salary and workplace requirements.
- Steps:
  1. Create this case's independent supported filter request.
  2. Issue the combined-filter request.
  3. Assert documented status, strict JSON contract and membership/exclusion for each controlled record.
- Expected outcome: Returned controlled records satisfy every selected filter according to the approved semantics.
- Cleanup: Release request context; W and owned validated cleanup are mandatory if setup creates records.
- Discovery question: Verify supported combinations, salary comparison/currency, remote/hybrid meaning, location scope and pagination before choosing values.
- Status / evidence: inherits the proposed, not-run, not-implemented fields above; no execution evidence.

### API-SEARCH-03

One malformed search input receives the approved response.

- Source links: test plan §4.2; WEB-002; WEB-005.
- Priority / suite: P0 / regression.
- Gates / preconditions: D, A. Documented search validation rule and an authorized environment for the negative request.
- Synthetic data: One synthetic input violating a verified constraint; other fields valid.
- Steps:
  1. Build the request with exactly the selected malformed input.
  2. Issue it once.
  3. Assert approved status and the documented error contract, or the explicitly documented empty/non-JSON response behavior.
- Expected outcome: The response follows the approved validation policy without exposing sensitive internals.
- Cleanup: Release request context; no mutations permitted.
- Discovery question: No malformed-input constraint or error schema is known. Select one documented violation and exact outcome before readiness; do not invent status codes.
- Status / evidence: inherits the proposed, not-run, not-implemented fields above; no execution evidence.

### API-JOBS-01

Active vacancy detail matches its controlled record.

- Source links: test plan §4.2; WEB-006; MOB-004.
- Priority / suite: P0 / smoke.
- Gates / preconditions: D, A. Verified detail contract and independently available controlled active vacancy.
- Synthetic data: VACANCY-ACTIVE with known title/employer and approved modeled fields.
- Steps:
  1. Request the controlled vacancy using its verified identifier mechanism.
  2. Assert documented status and strict JSON contract.
  3. Compare the documented business fields with this case's source data.
- Expected outcome: The returned detail belongs to the requested vacancy and matches the approved source record.
- Cleanup: Release request context; W and owned cleanup apply if the controlled vacancy was created for this case.
- Discovery question: Verify identifier format, endpoint and response fields. Do not manufacture fields from the UI.
- Status / evidence: inherits the proposed, not-run, not-implemented fields above; no execution evidence.

### API-JOBS-02

Nonexistent vacancy follows the documented missing-resource policy.

- Source links: test plan §4.2; WEB-006.
- Priority / suite: P0 / regression.
- Gates / preconditions: D, A. Verified nonexistent-identifier policy and a deterministic reserved/test identifier.
- Synthetic data: A documented guaranteed-missing identifier from controlled test data, not an arbitrary live ID.
- Steps:
  1. Request the guaranteed-missing vacancy.
  2. Assert documented status and dedicated JSON error/empty schema when applicable; do not parse an empty body as JSON.
- Expected outcome: Response matches the approved missing-resource policy and does not leak another record.
- Cleanup: Release request context; no records changed.
- Discovery question: Verify how a nonexistent ID is guaranteed and how missing, expired and removed records differ. Add separate cases for differing policies.
- Status / evidence: inherits the proposed, not-run, not-implemented fields above; no execution evidence.

### API-AUTH-01

Invalid credentials do not establish authentication.

- Source links: test plan §4.2; WEB-008; MOB-005.
- Priority / suite: P0 / regression.
- Gates / preconditions: D, A, W. Approved disposable account and isolated non-production authentication service; lockout/rate-limit policy understood.
- Synthetic data: ACCOUNT-CANDIDATE with a synthetic incorrect credential supplied through approved secret handling.
- Steps:
  1. Start with a fresh unauthenticated request context.
  2. Issue one documented invalid-login request.
  3. Assert rejection status/error contract and documented absence of authenticated access/session issuance.
- Expected outcome: The invalid credentials are rejected and no authenticated session is established.
- Cleanup: Invalidate any session accidentally created, restore owned account state under the verified mechanism, and dispose of the request context. Escalate unexpected authentication as a defect.
- Discovery question: Verify authentication/session mechanism and safe proof of rejection. If a follow-up protected request is required, give it a separate step with its own validations.
- Status / evidence: inherits the proposed, not-run, not-implemented fields above; no execution evidence.

### API-CV-01

A candidate cannot read another owned test account's CV.

- Source links: test plan §4.2; WEB-009.
- Priority / suite: P0 / regression.
- Gates / preconditions: D, A, W. Two disposable accounts and synthetic CV owned by the other account; approved ownership policy and deterministic API authentication.
- Synthetic data: ACCOUNT-CANDIDATE, ACCOUNT-OTHER and CV-VALID, uniquely owned by this case.
- Steps:
  1. Set up and validate both owned test accounts and the other account's synthetic CV.
  2. Authenticate as the candidate through the verified mechanism.
  3. Request the other account's CV and assert documented denial status/body policy with no CV disclosure.
- Expected outcome: The requester cannot access the other test identity's private CV, according to the verified visibility policy.
- Cleanup: Delete only this case's synthetic CV/accounts as permitted, revoke owned sessions, and record validated cleanup even when an assertion fails.
- Discovery question: Verify CV visibility rules first: some CVs may intentionally be public or role-visible. Identify the private ownership boundary before readiness.
- Status / evidence: inherits the proposed, not-run, not-implemented fields above; no execution evidence.

### API-APPLICATIONS-01

An eligible candidate's application is persisted once.

- Source links: test plan §4.2; WEB-010; MOB-006.
- Priority / suite: P0 / smoke.
- Gates / preconditions: D, A, W. Disposable eligible candidate with verified CV prerequisites and controlled vacancy; submission and read-back contracts available.
- Synthetic data: ACCOUNT-CANDIDATE, CV-VALID, VACANCY-ACTIVE and RUN-OWNERSHIP.
- Steps:
  1. Validate independently seeded prerequisites through approved APIs.
  2. Submit one application; assert documented status, strict JSON contract if any, and the approved success outcome.
  3. Read back through the documented interface in a separate descriptive request step; assert status, schema and that exactly the intended owned application is present.
- Expected outcome: One application is associated with the correct controlled candidate and vacancy and is observable through the documented persistence interface.
- Cleanup: Always remove this run's application and owned prerequisite data through verified APIs/fixture teardown, revoke sessions and record cleanup outcome.
- Discovery question: Verify submission eligibility, duplicate policy, persistence/read-back mechanism and any eventual-consistency bound. Do not infer submission from status alone.
- Status / evidence: inherits the proposed, not-run, not-implemented fields above; no execution evidence.
