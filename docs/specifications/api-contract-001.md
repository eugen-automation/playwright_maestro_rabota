# API-CONTRACT-001 — Whitespace autocomplete contains a blank label

Status: open contract discrepancy, reproduced 2026-11-04.
Tracking: local documentation only; no external issue was created.
Owner: unassigned; requires product/API triage.
Severity: not yet assigned. No product specification for whitespace policy has
been supplied; the failing expectation is the existing modeled non-empty-label
contract and a usable-label check.

## Reproduction

Preconditions: configured verified same-origin API, explicit public read-only API
opt-in, no authenticated account. Use the canonical fixture-owned client.

1. Run the independent `API-PUBLIC-SUGGEST-07` case:
   `npm.cmd run test:web:api -- --grep API-PUBLIC-SUGGEST-07`.
2. The test calls the observed GET operation `/ro/ajax/tags` with `query`
   equal to three ASCII spaces. The client URL-encodes the value.
3. Assert HTTP 200 and JSON media type, then parse the existing strict
   `JobSuggestionsResponseSchema`.

## Observed and expected

Observed: HTTP 200 JSON contains suggestions including an entry with an empty
`value` and a positive integer `data`. The total set is live and not pinned.
Validation fails at `suggestions[0].value` because the existing string contract
requires at least one character.

Expected by the modeled contract: returned suggestion labels are non-empty and
usable. The current test does not require whitespace to return zero suggestions;
whether whitespace is rejected, normalized or handled otherwise needs an
approved product rule.

An independent empty-string query returned `suggestions: []` and passed its
dedicated empty-response schema. This contrast is diagnostic evidence, not an
assumption that the endpoint treats both inputs identically.

## Evidence and disposition

- [Executed run](api-execution-2026-11-04.md): full suite 7 passed, 1 failed.
- [Latest reproduction](api-read-only-increment-2026-11-04.md): full suite 11 passed,
  1 failed; the same empty-label contract failure persists.
- [Regression](../../web/tests/api/public-jobs.spec.ts): active and unquarantined.
- [Existing strict schema](../../shared/api/schemas/public-jobs.schema.ts).
- Sanitized local fixture `blankSuggestion` exercises the schema without retaining
  the live response in source control.

No backend source is available here to fix the response. Product/API ownership
must confirm the intended whitespace/blank-taxonomy behavior and correct the
service or explicitly review a contract change. Do not simply allow empty labels
to make the test green.

Exit criterion: approved whitespace policy is documented, returned entries meet
the reviewed contract, and the independent regression passes without skipped
assertions, retries or a weakened contract. UI impact is not yet verified.
