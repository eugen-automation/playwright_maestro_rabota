# Initial detailed API cases

Source: [test plan §4.2](../TEST_PLAN.md#42-api-automation--playwright-apirequestcontext)
and the linked feature groups in each case.
[Catalog](test-case-catalog.md) defines gates and data recipes.

Platform/layer: Playwright APIRequestContext, `@api`; no browser actions and no
mocked backend responses. Every listed suite becomes exactly one suite tag.
Locale-sensitive requests use verified Romanian semantics where supported;
do not add undocumented locale fields.

For every case: behavior verification **proposed**, manual execution **not run
(gates unresolved)**, automation suitability **candidate**, implementation
**not implemented**, automation execution **not run (gates unresolved)**, evidence
**none**. These are inherited case fields. No API endpoint, response contract,
status expectation or API target is verified by this document; API runtime is
currently disabled.

Success JSON validation uses canonical strict shared schemas, status assertions
separate from `expect(Schema.parse(body)).toBeTruthy();`, and JSON typed as
`unknown`. Dedicated modeled error/empty schemas apply only to relevant JSON;
never parse an empty 204 body or non-JSON response as JSON. If a spec explicitly
makes multiple requests, each request gets its own descriptive `test.step()`
with status, applicable schema and business assertions together. Seed/cleanup
requests are also validated. Fixture-owned setup must not hide failed setup or
cleanup. W is required for any actual seeding even in a nominally read-only case.

Read-only API cases require authorized controlled data. Public production
browsing and the existing document GET do not authorize API traffic. Pending
contracts must never be filled in with guessed endpoints, methods or payloads.

## Cases

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
