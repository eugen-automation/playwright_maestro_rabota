# Public API discovery and implementation

Inspected 2026-11-03 after the user authorized observing website calls. Discovery
used an isolated logged-out Chromium context in Romanian. Only same-origin
GET/HEAD requests were allowed; non-GET requests, third-party traffic and
WebSockets were blocked, and service workers disabled. No account, application,
saved-job or other write action was performed.

These are observations, not published provider guarantees or passing test results.
The four authored API cases and foundation checks have **not been executed** at
the user's request. No CI run/push was triggered.

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

| Cases                         | Scope                                                                                                      | Status               |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------- |
| `API-PUBLIC-SUGGEST-01/02/03` | Strict autocomplete contract and the three observed profession labels, including Romanian diacritics       | Implemented, not run |
| `API-PUBLIC-VACANCY-01`       | Fetch current search HTML, select a supported VIP route, validate strict popup JSON and requested identity | Implemented, not run |

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
