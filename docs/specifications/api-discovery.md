# Public API discovery and implementation

Inspected 2026-11-03 after the user authorized observing website calls. Discovery
used an isolated logged-out Chromium context in Romanian. Only same-origin
GET/HEAD requests were allowed; non-GET requests, third-party traffic and
WebSockets were blocked, and service workers disabled. No account, application,
saved-job or other write action was performed.

These are observations, not published provider guarantees or passing test results.
Execution was originally deferred on 2026-11-03. The user authorized local and
public read-only API checks on 2026-11-04. The expanded suite has eight implemented
cases: **7 passed, 1 failed**; all 14 foundation checks passed. See the
[execution record](api-execution-2026-11-04.md) and the active
[whitespace contract discrepancy](api-contract-001.md). No CI run/push was triggered.

## Observed traffic

| Interaction                                        | Request                                                                   | Observed response                |
| -------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------- |
| Load public homepage                               | GET configured origin, redirect to `/ro/`                                 | 301 then 200 HTML                |
| Type a profession in the job field                 | GET `/ro/ajax/tags?query=<input>`                                         | 200 `application/json`           |
| Submit `programator`                               | GET `/ro/jobs-moldova-programator`                                        | 200 HTML, not a JSON results API |
| Open an observed VIP link at narrow viewport width | GET that `/ro/locuri-de-munca/<slug>/<id>` route with `json=1&viewMode=1` | 200 `application/json`           |

The search form declares GET `/search`, but the active frontend navigated directly
to the localized result route; no `/search` request was observed. Do not present
the form declaration as an observed JSON API. Desktop vacancy navigation returned
HTML; the responsive popup triggered the JSON request. Source assets referenced
`2026.10.30.11`, an asset query value, not a verified app build identifier.

## Observed JSON shapes

Autocomplete returned exactly `suggestions: [{ value: string, data: integer }]`.
Observed terms/labels: `programator` → `Programator`, `contabil` → `Contabil`
among other suggestions, and `șofer` → `Șofer` among other suggestions.
An uncommon discovery input returned `suggestions: []`; this is not a controlled
empty dataset, so no permanent zero-result assertion was added.

The VIP popup returned exactly:

- `vacancy_model: null`.
- `data`: `c_list` boolean, `custom_link: null`, and `company_ad` with numeric
  `company_ad_id`, `showResumeBlock` and `showResponseBlock`.
- `vacancy_content`: rendered HTML string.

The selected response ID agreed with its public route ID. No full job list,
missing-resource, validation-error, free/standard vacancy or custom-link JSON
contract was established. Do not widen the strict VIP schema without observing
and reviewing the relevant branch. Visibility flag semantics beyond the observed
numeric fields are not asserted. Public job HTML/contact details are not stored
in committed fixtures; temporary captures were removed after documentation.

## Implemented increment

| Cases                         | Scope                                                                                                      | Status            |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------- |
| `API-PUBLIC-SUGGEST-01/02/03` | Strict autocomplete contract and the three observed profession labels, including Romanian diacritics       | Passed 2026-11-04 |
| `API-PUBLIC-VACANCY-01`       | Fetch current search HTML, select a supported VIP route, validate strict popup JSON and requested identity | Passed 2026-11-04 |

Sources: [specs](../../web/tests/api/public-jobs.spec.ts),
[strict schemas](../../shared/api/schemas/public-jobs.schema.ts),
[fixture-owned client](../../shared/api/clients/public-jobs-client.ts),
[transport](../../shared/api/clients/read-only-api-client.ts).

Clients use isolated API contexts, GET-only named operations, bounded timeouts,
no redirects/retries and fixture teardown. The detail client binds the selected
validated route exactly; it does not expose wildcard URLs. Raw request fixtures
are disabled. No browser setup, real accounts or backend seed/cleanup is needed.

Configuration is loaded centrally: `API_BASE_URL` must match `WEB_BASE_URL` for
this observed scope, and `ALLOW_PUBLIC_READ_ONLY_API=true` is required separately
from the browser E2E flag. The local API flag remains false. A URL change enables
neither writes nor another layer. No live API CI workflow/schedule was added.

## Live-data limits and next work

These public cases are a limited API increment, not replacements for the eight
controlled-data cases in [the API catalog](api-cases.md). Existing IDs retain their
original scope/status. Taxonomy changes or no current supported VIP result fail
visibly; disappearance is investigated, not retried, skipped or counted as a pass.
A selected ad may expire between requests. No specific ad ID/title is pinned.

Continue authorized observation for search/filter/pagination/error contracts, and
obtain controlled data/non-production access before business-rule membership,
permissions, authentication or writes. A source reference alone is insufficient
to call account endpoints. Notifications and cleanup remain separately gated.

References: [Playwright isolated API contexts](https://playwright.dev/docs/api-testing#context-request-vs-global-request)
and [API redirect/retry controls](https://playwright.dev/docs/api/class-apirequestcontext).

## Autocomplete input observations — 2026-11-04

All observations used the same verified GET endpoint and isolated request client.
Only status, bounded taxonomy summaries and the relevant contract discrepancy
were retained in documentation; no complete live response is committed.

| Input              | Observed HTTP/JSON behavior                                                                  | New case              |
| ------------------ | -------------------------------------------------------------------------------------------- | --------------------- |
| Empty string       | 200; `suggestions: []`                                                                       | API-PUBLIC-SUGGEST-04 |
| `PROGRAMATOR`      | 200; existing strict schema passes and `Programator` is present                              | API-PUBLIC-SUGGEST-05 |
| `ȘOFER`            | 200; existing strict schema passes and `Șofer` is present                                    | API-PUBLIC-SUGGEST-06 |
| Three ASCII spaces | 200; populated suggestions include an empty `value`; existing non-empty-label contract fails | API-PUBLIC-SUGGEST-07 |

The empty-query contract is modeled separately by
`EmptyJobSuggestionsResponseSchema`; the normal schema was not widened.
Whitespace policy still requires product confirmation; the active regression
checks the existing non-empty/usable-label invariant rather than assuming a
particular zero-result or error status. See [API-CONTRACT-001](api-contract-001.md).

Additional discovery: a space-padded Latin profession query returned no
suggestions, while an accentless driver query did not include the exact
Romanian-diacritic label. No normalization policy was inferred or permanent
assertion added for these observations. Empty input is not a controlled empty
job-search dataset.

The eight-case API run and 14 local foundation checks are documented in the
[execution record](api-execution-2026-11-04.md). The suite remains unsuccessful
until the whitespace discrepancy is resolved through product/API triage.

## Casing identity implementation — 2026-11-04

`API-PUBLIC-SUGGEST-08/09` reuse the observed Latin and Romanian query pairs to
compare the expected label's taxonomy ID across casing. Each independent test
validates both HTTP/JSON contracts and requires exactly one matching label in
each response. Result order and unrelated suggestions are not compared.

No new network discovery was performed. The query/label pairs are observed;
identity equality and uniqueness are proposed regression expectations awaiting
live verification. Both tests are implemented but **not executed**, with
`ALLOW_PUBLIC_READ_ONLY_API=false` left unchanged. The public suite now has ten
implemented cases; the earlier eight-case execution result remains historical.
See the [implementation record](api-implementation-2026-11-04.md).

## Read-only continuation — 2026-11-04

The user confirmed there is no non-production environment and directed continued
work within the verified read-only scope, with CI deferred. Two independent
regressions now validate the existing JSON suggestions contract for exactly
`programator` with one ASCII space on each side and `sofer`. These input categories were observed earlier;
the latest execution confirms HTTP 200, JSON media type and the existing strict
schema for the exact typed inputs. No trimming/accent policy or exact result
membership is inferred.

The same twelve-case public run verified the previously pending casing-identity
checks for the selected Latin/Romanian pairs. Result: **11 passed, 1 failed**;
the original whitespace discrepancy remains active. No authentication, writes,
new endpoints, schema relaxation or CI activation was introduced. The API opt-in
was process-local and `.env` was unchanged. Earlier not-run statements above
describe the earlier implementation point, not the latest status. See the
[latest record](api-read-only-increment-2026-11-04.md).
