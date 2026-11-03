# Initial detailed web cases

Source: [test plan §2.1](../TEST_PLAN.md#21-desktop-web--functional-test-scenarios).
Status definitions, prerequisites, synthetic recipes and traceability:
[catalog](test-case-catalog.md).

Platform for every case: desktop browser, Romanian (`ro-MD`). Chromium is the
initial implemented engine; Chrome/Edge/Firefox/Safari coverage is not inferred.
Each UI case targets the actual isolated frontend with file-backed verified
responses; its backend remains unreachable during server rendering and all
browser activity. Proposed outcomes require discovery confirmation.

Under the [testing-pyramid strategy](testing-pyramid.md), these are second-layer
frontend candidates after API contract/rule coverage. Select checks for rendering,
interaction, client validation and response-state presentation; leave matching,
permission, persistence and other backend rule matrices to API tests. Preserve
all existing case IDs and statuses; this inventory is not a target UI test count.
The retained markup E2E below does not change API-first implementation priority.

Except for the explicit existing E2E override, each case has behavior
verification **proposed**, manual execution **not run (gates unresolved)**,
automation suitability **candidate**, implementation **not implemented**,
automation execution **not run (gates unresolved)**, and evidence **none**.
These fields are inherited by each case. On execution, add a separate dated
record using the catalog's execution-record requirements. Never turn these
proposals into runnable selectors, endpoints, or response payloads by guessing.

Use one layer tag (`@ui` or `@e2e`) and the listed suite tag, plus appropriate
feature tags. For the localization case include `@localization`. Business
assertions belong in specs and fixtures supply POM instances. No implementation
or configuration files are changed by this document.

## Existing limited E2E

### E2E-WEB-007-01

Romanian registration document exposes basic controls.

- Source: test plan §2.1, WEB-007; [registration discovery](registration-discovery.md) records markup/inline-source observations only.
- Priority / suite / layer: P0 / smoke / e2e.
- Gates / preconditions: P (implemented). Existing configured target matches registration discovery; explicit process-scoped read-only opt-in.
- Synthetic data: No account or business inputs; public server-rendered document.
- Steps:
  1. Open the configured relative Romanian registration route through the canonical fixture.
  2. Check the heading, email input, password input type, and submit button.
- Expected outcome: Observed heading and controls are visible; password input has type password. This verifies markup availability only.
- Cleanup: Close the browser context; no application data was changed.
- Coverage limit: Interactive validation, visual correctness, backend registration and email delivery remain outside this case.
- Status override: observed markup only; manual execution not run; automation suitable for this limited E2E scope, implemented, last recorded pass 2026-11-03 in Chromium.
- Implementation: [registration-markup.spec.ts](../../web/tests/journeys/registration-markup.spec.ts).
- Evidence override: [foundation baseline](foundation-baseline.md); generated HTML/JUnit under ignored `reports/web/`. No new run occurred during catalog creation.

## Homepage, search and vacancy details

### UI-WEB-001-01

Homepage presents usable search controls.

- Source: test plan §2.1, WEB-001.
- Priority / suite / layer: P0 / smoke / ui.
- Gates / preconditions: D, U. Fresh context on the isolated real frontend; relevant behavior and contracts verified before readiness.
- Synthetic data: Verified homepage fixture state without an authenticated account.
- Steps:
  1. Open the verified Romanian homepage on the isolated real frontend.
  2. Locate the search region and its verified query and submission controls.
- Expected outcome: The search region is visible and its documented input and action are usable.
- Cleanup: Dispose of the isolated context, routes, storage and in-memory fixture state. No real backend resources may exist.
- Discovery question: Verify homepage route, accessible names, initial server data, and any consent setup.
- Status / evidence: inherits the proposed, not-run, not-implemented fields above; no execution evidence.

### UI-WEB-002-01

Matching keyword renders the supplied results.

- Source: test plan §2.1, WEB-002.
- Priority / suite / layer: P0 / smoke / ui.
- Gates / preconditions: D, U. Fresh context on the isolated real frontend; relevant behavior and contracts verified before readiness.
- Synthetic data: MATCHING-SEARCH: fixture-backed query and known matching results.
- Steps:
  1. Open an independent search state.
  2. Enter the selected query and invoke the verified search action.
  3. Compare displayed results and query state with the supplied response.
- Expected outcome: Expected fixture vacancies and supported summary information appear; displayed query state corresponds to the submitted query.
- Cleanup: Dispose of the isolated context, routes, storage and in-memory fixture state. No real backend resources may exist.
- Discovery question: Verify query normalization, displayed fields, pagination behavior and relevance rules; do not infer backend matching from this UI check.
- Status / evidence: inherits the proposed, not-run, not-implemented fields above; no execution evidence.

### UI-WEB-003-01

Zero results present the approved empty state.

- Source: test plan §2.1, WEB-003.
- Priority / suite / layer: P1 / regression / ui.
- Gates / preconditions: D, U. Fresh context on the isolated real frontend; relevant behavior and contracts verified before readiness.
- Synthetic data: EMPTY-SEARCH: verified zero-result payload and synthetic supported query.
- Steps:
  1. Start with an independent search state.
  2. Perform the query against the zero-result fixture.
- Expected outcome: No stale vacancy cards remain; the approved Romanian empty state appears.
- Cleanup: Dispose of the isolated context, routes, storage and in-memory fixture state. No real backend resources may exist.
- Discovery question: Verify exact empty-state copy and any recovery action. Never depend on a nonexistent live search term.
- Status / evidence: inherits the proposed, not-run, not-implemented fields above; no execution evidence.

### UI-WEB-004-01

City selection updates the visible search state.

- Source: test plan §2.1, WEB-004.
- Priority / suite / layer: P0 / smoke / ui.
- Gates / preconditions: D, U. Fresh context on the isolated real frontend; relevant behavior and contracts verified before readiness.
- Synthetic data: FILTER-SET: one verified city and contract-derived results for that selection.
- Steps:
  1. Open an independent default search state.
  2. Select the city using the verified control.
  3. Inspect the selected city and rendered results.
- Expected outcome: Selected-city state and displayed results agree with the fixture response; prior results do not remain as if they matched.
- Cleanup: Dispose of the isolated context, routes, storage and in-memory fixture state. No real backend resources may exist.
- Discovery question: Verify city options, selection interaction, request mapping and location semantics.
- Status / evidence: inherits the proposed, not-run, not-implemented fields above; no execution evidence.

### UI-WEB-005-01

Combined filters are represented together.

- Source: test plan §2.1, WEB-005.
- Priority / suite / layer: P0 / regression / ui.
- Gates / preconditions: D, U. Fresh context on the isolated real frontend; relevant behavior and contracts verified before readiness.
- Synthetic data: FILTER-SET: verified city, salary criterion and remote option with matching results.
- Steps:
  1. Open a fresh search state.
  2. Apply the three supported criteria.
  3. Inspect all selected criteria and the final response-backed result set.
- Expected outcome: All selected criteria remain represented and the corresponding fixture results are rendered together.
- Cleanup: Dispose of the isolated context, routes, storage and in-memory fixture state. No real backend resources may exist.
- Discovery question: Verify that all three filters exist and can be combined; confirm salary currency/boundaries and workplace semantics. Backend intersection is checked separately.
- Status / evidence: inherits the proposed, not-run, not-implemented fields above; no execution evidence.

### UI-WEB-006-01

Opening a vacancy renders its matching detail data.

- Source: test plan §2.1, WEB-006.
- Priority / suite / layer: P0 / smoke / ui.
- Gates / preconditions: D, U. Fresh context on the isolated real frontend; relevant behavior and contracts verified before readiness.
- Synthetic data: VACANCY-ACTIVE: list and detail fixtures for the same synthetic vacancy.
- Steps:
  1. Open the supplied result list in an independent context.
  2. Open the controlled vacancy.
  3. Compare the detail heading, employer and documented detail content against its fixture.
- Expected outcome: The correct vacancy detail appears with the matching title/employer and supported fields.
- Cleanup: Dispose of the isolated context, routes, storage and in-memory fixture state. No real backend resources may exist.
- Discovery question: Verify list-to-detail navigation, detail route, fields and accessible selectors.
- Status / evidence: inherits the proposed, not-run, not-implemented fields above; no execution evidence.

### UI-WEB-006-02

Unavailable vacancy shows its approved state.

- Source: test plan §2.1, WEB-006.
- Priority / suite / layer: P0 / regression / ui.
- Gates / preconditions: D, U. Fresh context on the isolated real frontend; relevant behavior and contracts verified before readiness.
- Synthetic data: VACANCY-UNAVAILABLE: one verified unavailable-state response.
- Steps:
  1. Open a verified detail location in a fresh context.
  2. Serve the independently modeled unavailable response.
- Expected outcome: The approved unavailable/error presentation appears without stale active-vacancy content.
- Cleanup: Dispose of the isolated context, routes, storage and in-memory fixture state. No real backend resources may exist.
- Discovery question: Verify distinct removed/expired/nonexistent policies; split them into separate cases if their handling differs.
- Status / evidence: inherits the proposed, not-run, not-implemented fields above; no execution evidence.

## Registration validation

Each password boundary is independent. The 8–24 range is an inline-source
observation and must be confirmed interactively; it is not a backend contract.
Required-field and consent behavior are still proposed.

### UI-WEB-007-01

Empty email triggers required-field feedback.

- Source: test plan §2.1, WEB-007; [registration discovery](registration-discovery.md) records markup/inline-source observations only.
- Priority / suite / layer: P0 / regression / ui.
- Gates / preconditions: D, U. Isolated registration frontend; requiredness and validation trigger verified.
- Synthetic data: REGISTRATION-INPUTS: empty email; all other verified mandatory inputs valid.
- Steps:
  1. Open a fresh candidate registration form.
  2. Complete other required fields while leaving email empty.
  3. Invoke the verified validation action.
- Expected outcome: Approved required-email feedback appears and no registration-success state is presented.
- Cleanup: Dispose of the isolated context, routes, storage and in-memory fixture state. No real backend resources may exist.
- Discovery question: Requiredness, validation timing, accessible error linkage and exact Romanian feedback remain unverified.
- Status / evidence: inherits the proposed, not-run, not-implemented fields above; no execution evidence.

### UI-WEB-007-02

Empty password triggers required-field feedback.

- Source: test plan §2.1, WEB-007; [registration discovery](registration-discovery.md) records markup/inline-source observations only.
- Priority / suite / layer: P0 / regression / ui.
- Gates / preconditions: D, U. Fresh context on the isolated real frontend; relevant behavior and contracts verified before readiness.
- Synthetic data: REGISTRATION-INPUTS: empty password; all other mandatory inputs valid.
- Steps:
  1. Open a fresh candidate registration form.
  2. Complete other required fields while leaving password empty.
  3. Invoke the verified validation action.
- Expected outcome: Approved required-password feedback appears and no registration-success state is presented.
- Cleanup: Dispose of the isolated context, routes, storage and in-memory fixture state. No real backend resources may exist.
- Discovery question: Verify requiredness and error behavior; source markup alone does not prove interactive validation.
- Status / evidence: inherits the proposed, not-run, not-implemented fields above; no execution evidence.

### UI-WEB-007-03

Seven-character password fails the observed length check.

- Source: test plan §2.1, WEB-007; [registration discovery](registration-discovery.md) records markup/inline-source observations only.
- Priority / suite / layer: P0 / regression / ui.
- Gates / preconditions: D, U. Fresh context on the isolated real frontend; relevant behavior and contracts verified before readiness.
- Synthetic data: REGISTRATION-INPUTS: synthetic 7-character password; other verified fields valid.
- Steps:
  1. Open a fresh form.
  2. Enter the boundary value and invoke the verified validation trigger.
- Expected outcome: After runtime confirmation of the observed minimum, approved password-length feedback rejects this value.
- Cleanup: Dispose of the isolated context, routes, storage and in-memory fixture state. No real backend resources may exist.
- Discovery question: Inline source shows 8–24 only; confirm current runtime behavior and other password rules before implementing.
- Status / evidence: inherits the proposed, not-run, not-implemented fields above; no execution evidence.

### UI-WEB-007-04

Eight-character password passes the observed length check.

- Source: test plan §2.1, WEB-007; [registration discovery](registration-discovery.md) records markup/inline-source observations only.
- Priority / suite / layer: P0 / regression / ui.
- Gates / preconditions: D, U. Fresh context on the isolated real frontend; relevant behavior and contracts verified before readiness.
- Synthetic data: REGISTRATION-INPUTS: synthetic 8-character password satisfying any other verified rules.
- Steps:
  1. Open a fresh form.
  2. Enter the boundary value and invoke the verified validation trigger.
- Expected outcome: After runtime confirmation, the approved length validator accepts the lower boundary; this does not establish account creation.
- Cleanup: Dispose of the isolated context, routes, storage and in-memory fixture state. No real backend resources may exist.
- Discovery question: Confirm length measurement and feedback. Do not assert overall password acceptance until other rules are known.
- Status / evidence: inherits the proposed, not-run, not-implemented fields above; no execution evidence.

### UI-WEB-007-05

Twenty-four-character password passes the observed length check.

- Source: test plan §2.1, WEB-007; [registration discovery](registration-discovery.md) records markup/inline-source observations only.
- Priority / suite / layer: P0 / regression / ui.
- Gates / preconditions: D, U. Fresh context on the isolated real frontend; relevant behavior and contracts verified before readiness.
- Synthetic data: REGISTRATION-INPUTS: synthetic 24-character password satisfying other verified rules.
- Steps:
  1. Open a fresh form.
  2. Enter the boundary value and invoke the verified validation trigger.
- Expected outcome: After runtime confirmation, the length validator accepts the upper boundary without implying successful registration.
- Cleanup: Dispose of the isolated context, routes, storage and in-memory fixture state. No real backend resources may exist.
- Discovery question: Confirm runtime length handling and other password rules.
- Status / evidence: inherits the proposed, not-run, not-implemented fields above; no execution evidence.

### UI-WEB-007-06

Twenty-five-character password fails the observed length check.

- Source: test plan §2.1, WEB-007; [registration discovery](registration-discovery.md) records markup/inline-source observations only.
- Priority / suite / layer: P0 / regression / ui.
- Gates / preconditions: D, U. Fresh context on the isolated real frontend; relevant behavior and contracts verified before readiness.
- Synthetic data: REGISTRATION-INPUTS: synthetic 25-character password.
- Steps:
  1. Open a fresh form.
  2. Enter the boundary value and invoke the verified validation trigger.
- Expected outcome: After runtime confirmation, input handling or validation prevents acceptance above the observed maximum according to approved behavior.
- Cleanup: Dispose of the isolated context, routes, storage and in-memory fixture state. No real backend resources may exist.
- Discovery question: Verify whether the UI limits input, displays validation, or behaves differently; select the confirmed expectation before ready.
- Status / evidence: inherits the proposed, not-run, not-implemented fields above; no execution evidence.

### UI-WEB-007-07

Missing consent follows the verified registration policy.

- Source: test plan §2.1, WEB-007; [registration discovery](registration-discovery.md) records markup/inline-source observations only.
- Priority / suite / layer: P0 / regression / ui.
- Gates / preconditions: D, U. Fresh context on the isolated real frontend; relevant behavior and contracts verified before readiness.
- Synthetic data: REGISTRATION-INPUTS: consent unchecked; other fields valid.
- Steps:
  1. Open a fresh candidate form.
  2. Complete verified required inputs and leave consent unchecked.
  3. Invoke the verified validation action.
- Expected outcome: Required-consent policy is represented through approved feedback without an unsupported success state.
- Cleanup: Dispose of the isolated context, routes, storage and in-memory fixture state. No real backend resources may exist.
- Discovery question: Only the checkbox's presence is observed. Verify whether consent is mandatory and its exact validation before ready.
- Status / evidence: inherits the proposed, not-run, not-implemented fields above; no execution evidence.

### UI-WEB-007-08

Employer selection presents the employer fields.

- Source: test plan §2.1, WEB-007; WEB-015; [registration discovery](registration-discovery.md) records markup/inline-source observations only.
- Priority / suite / layer: P1 / regression / ui.
- Gates / preconditions: D, U. Fresh context on the isolated real frontend; relevant behavior and contracts verified before readiness.
- Synthetic data: Fresh isolated candidate form with verified candidate/employer choices.
- Steps:
  1. Open the registration form in its verified initial account state.
  2. Choose the employer account type.
  3. Inspect the company and phone fields.
- Expected outcome: Employer-specific controls appear and candidate-only state follows the approved account-switch behavior.
- Cleanup: Dispose of the isolated context, routes, storage and in-memory fixture state. No real backend resources may exist.
- Discovery question: The choices and employer markup were observed; dynamic visibility, default type and mandatory fields are unverified. No account is created.
- Status / evidence: inherits the proposed, not-run, not-implemented fields above; no execution evidence.

## Authentication and CV presentation

### UI-WEB-008-01

Successful login response presents the signed-in UI.

- Source: test plan §2.1, WEB-008.
- Priority / suite / layer: P0 / smoke / ui.
- Gates / preconditions: D, U. Fresh context on the isolated real frontend; relevant behavior and contracts verified before readiness.
- Synthetic data: Synthetic candidate inputs and verified authenticated frontend/session fixtures.
- Steps:
  1. Open a fresh isolated logged-out state.
  2. Enter synthetic inputs and invoke login.
  3. Serve verified success and subsequent authenticated-state fixtures.
- Expected outcome: The approved signed-in marker and candidate navigation appear; no real authentication service is contacted.
- Cleanup: Dispose of the isolated context, routes, storage and in-memory fixture state. No real backend resources may exist.
- Discovery question: Verify the full authentication/background request inventory, session mechanism and stable signed-in marker.
- Status / evidence: inherits the proposed, not-run, not-implemented fields above; no execution evidence.

### UI-WEB-008-02

Rejected login leaves the frontend signed out.

- Source: test plan §2.1, WEB-008.
- Priority / suite / layer: P0 / regression / ui.
- Gates / preconditions: D, U. Fresh context on the isolated real frontend; relevant behavior and contracts verified before readiness.
- Synthetic data: Synthetic invalid credentials and contract-derived authentication rejection.
- Steps:
  1. Open an independent isolated logged-out state.
  2. Submit synthetic rejected credentials.
- Expected outcome: Approved error feedback appears and protected/signed-in content is not presented.
- Cleanup: Dispose of the isolated context, routes, storage and in-memory fixture state. No real backend resources may exist.
- Discovery question: Verify rejection response, exact feedback and rate-limit handling; do not test repeated invalid login on a real account.
- Status / evidence: inherits the proposed, not-run, not-implemented fields above; no execution evidence.

### UI-WEB-009-01

Accepted synthetic CV upload updates the frontend.

- Source: test plan §2.1, WEB-009.
- Priority / suite / layer: P0 / regression / ui.
- Gates / preconditions: D, U. Fresh context on the isolated real frontend; relevant behavior and contracts verified before readiness.
- Synthetic data: CV-VALID and verified authenticated/upload-success/list fixtures.
- Steps:
  1. Open an independently fixture-authenticated CV screen.
  2. Select the synthetic accepted file and invoke the supported upload action.
  3. Inspect the response-backed CV display.
- Expected outcome: The approved uploaded-CV state appears with matching synthetic metadata.
- Cleanup: Dispose of the isolated context, routes, storage and in-memory fixture state. No real backend resources may exist.
- Discovery question: Verify accepted formats, size rules, upload transport and whether processing/polling exists. Mocked success does not prove storage.
- Status / evidence: inherits the proposed, not-run, not-implemented fields above; no execution evidence.

### UI-WEB-009-02

Oversized CV shows the approved rejection.

- Source: test plan §2.1, WEB-009.
- Priority / suite / layer: P0 / regression / ui.
- Gates / preconditions: D, U. Fresh context on the isolated real frontend; relevant behavior and contracts verified before readiness.
- Synthetic data: Synthetic file just above the verified size limit; contract-derived rejection if server validation is involved.
- Steps:
  1. Open a fresh isolated CV screen.
  2. Select the oversized file and perform the verified validation action.
- Expected outcome: Approved size-related feedback appears; no accepted-upload state is shown.
- Cleanup: Dispose of the isolated context, routes, storage and in-memory fixture state. No real backend resources may exist.
- Discovery question: Obtain the actual maximum, byte units and validation location before generating data. Unsupported-file-type coverage remains separate backlog.
- Status / evidence: inherits the proposed, not-run, not-implemented fields above; no execution evidence.

## Applications

Each state below is independently supplied by verified fixtures. No case depends
on an application created by another test, and no mocked pass proves persistence.

### UI-WEB-010-01

Application success response is visibly confirmed.

- Source: test plan §2.1, WEB-010.
- Priority / suite / layer: P0 / smoke / ui.
- Gates / preconditions: D, U. Fresh context on the isolated real frontend; relevant behavior and contracts verified before readiness.
- Synthetic data: APPLICATION-STATES success; fixture-authenticated candidate with required CV and active vacancy.
- Steps:
  1. Open the independent controlled vacancy state.
  2. Perform the supported application action.
  3. Serve the verified success response.
- Expected outcome: Approved submission confirmation is visible for the intended vacancy.
- Cleanup: Dispose of the isolated context, routes, storage and in-memory fixture state. No real backend resources may exist.
- Discovery question: Verify prerequisites, submission controls, success contract and exact confirmation. No backend application is created.
- Status / evidence: inherits the proposed, not-run, not-implemented fields above; no execution evidence.

### UI-WEB-010-02

Application without a CV follows the approved policy.

- Source: test plan §2.1, WEB-010.
- Priority / suite / layer: P0 / regression / ui.
- Gates / preconditions: D, U. Fresh context on the isolated real frontend; relevant behavior and contracts verified before readiness.
- Synthetic data: Independent candidate-without-CV frontend state and the verified policy response.
- Steps:
  1. Open the controlled vacancy without a candidate CV.
  2. Attempt the documented application action.
- Expected outcome: The UI represents the signed-off missing-CV outcome without claiming a submission unsupported by its response.
- Cleanup: Dispose of the isolated context, routes, storage and in-memory fixture state. No real backend resources may exist.
- Discovery question: Is a CV required, optional, or replaced by another flow? Resolve the exact expected outcome before this case becomes ready.
- Status / evidence: inherits the proposed, not-run, not-implemented fields above; no execution evidence.

### UI-WEB-010-03

Duplicate application response is handled explicitly.

- Source: test plan §2.1, WEB-010.
- Priority / suite / layer: P0 / regression / ui.
- Gates / preconditions: D, U. Fresh context on the isolated real frontend; relevant behavior and contracts verified before readiness.
- Synthetic data: Independent previously-applied state and verified duplicate-response fixture.
- Steps:
  1. Open a vacancy already applied to in this case's fixtures.
  2. Attempt the supported repeat action, if available.
- Expected outcome: Approved duplicate/already-applied presentation appears without falsely describing a new application.
- Cleanup: Dispose of the isolated context, routes, storage and in-memory fixture state. No real backend resources may exist.
- Discovery question: Confirm duplicate policy and whether repeat submission is possible; redesign the action if the UI prevents it.
- Status / evidence: inherits the proposed, not-run, not-implemented fields above; no execution evidence.

### UI-WEB-010-04

Expired vacancy cannot appear as a successful new application.

- Source: test plan §2.1, WEB-010.
- Priority / suite / layer: P0 / regression / ui.
- Gates / preconditions: D, U. Fresh context on the isolated real frontend; relevant behavior and contracts verified before readiness.
- Synthetic data: Independent expired-vacancy/application-rejection fixtures.
- Steps:
  1. Open the verified expired-vacancy state.
  2. Exercise the supported unavailable-application presentation or rejection path.
- Expected outcome: Approved expired-vacancy handling appears and no unsupported new-application confirmation is shown.
- Cleanup: Dispose of the isolated context, routes, storage and in-memory fixture state. No real backend resources may exist.
- Discovery question: Verify whether the action is disabled, absent, or rejected, and separate expiry-during-submission if it differs.
- Status / evidence: inherits the proposed, not-run, not-implemented fields above; no execution evidence.

### UI-WEB-010-05

Failed submission is not shown as success.

- Source: test plan §2.1, WEB-010.
- Priority / suite / layer: P0 / regression / ui.
- Gates / preconditions: D, U. Fresh context on the isolated real frontend; relevant behavior and contracts verified before readiness.
- Synthetic data: Independent valid candidate/vacancy state and one verified failure condition.
- Steps:
  1. Open a fresh valid application state.
  2. Perform the action while the fixture produces the verified failure.
- Expected outcome: Approved failure/recovery feedback appears without success confirmation.
- Cleanup: Dispose of the isolated context, routes, storage and in-memory fixture state. No real backend resources may exist.
- Discovery question: Select one verified transport or server failure per case; split distinct response and network-abort behavior before implementation.
- Status / evidence: inherits the proposed, not-run, not-implemented fields above; no execution evidence.

### UI-WEB-010-06

Application history displays the supplied application.

- Source: test plan §2.1, WEB-010.
- Priority / suite / layer: P0 / regression / ui.
- Gates / preconditions: D, U. Fresh context on the isolated real frontend; relevant behavior and contracts verified before readiness.
- Synthetic data: Independent authenticated application-history fixture containing the owned synthetic vacancy.
- Steps:
  1. Open application history directly through its verified entry point.
  2. Inspect the supplied application record and supported status.
- Expected outcome: The correct vacancy and documented application status appear.
- Cleanup: Dispose of the isolated context, routes, storage and in-memory fixture state. No real backend resources may exist.
- Discovery question: Verify that application history exists, its entry point and visible status semantics. This case does not depend on another submission test.
- Status / evidence: inherits the proposed, not-run, not-implemented fields above; no execution evidence.

## Localization

### UI-WEB-014-01

Language switching returns the interface to Romanian.

- Source: test plan §2.1, WEB-014.
- Priority / suite / layer: P1 / regression / ui.
- Gates / preconditions: D, U. Fresh context on the isolated real frontend; relevant behavior and contracts verified before readiness.
- Synthetic data: Verified Romanian/Russian locale fixtures for one stable screen.
- Steps:
  1. Open a fresh Romanian screen.
  2. Switch to Russian using the verified control and inspect the approved translated state.
  3. Switch back to Romanian before the final assertion.
- Expected outcome: Documented locale-sensitive content/navigation updates; the final screen is Romanian.
- Cleanup: Dispose of the isolated context, routes, storage and in-memory fixture state. No real backend resources may exist.
- Discovery question: Verify supported switch controls, route behavior and translated names. Avoid a duplicate Russian regression suite.
- Status / evidence: inherits the proposed, not-run, not-implemented fields above; no execution evidence.
