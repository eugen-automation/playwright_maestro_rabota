# Public API read-only continuation — 2026-11-04

User scope: continue implementation within verified public read-only access;
no approved non-production environment is available. CI is explicitly deferred.
Source: local commit `9c6fc2a` plus the uncommitted working tree. No new product
build identifier is known. Runtime: Windows, Node.js 24.21.0, Playwright 1.64.1,
API project, Romanian `ro-MD`; no browser or account was used.

## Implemented behavior

- `API-PUBLIC-SUGGEST-10`: `programator` with one ASCII space on each side returns HTTP 200,
  JSON media type and the existing strict suggestions contract.
- `API-PUBLIC-SUGGEST-11`: the accentless `sofer` input receives the same contract
  validation. Neither case assumes trimming, accent equivalence or particular
  result membership. Empty suggestions remain valid under the existing schema.
- Both use typed cases, the canonical fixture entry, isolated GET-only clients,
  one regression/layer/feature classification and fixture teardown. No new
  endpoint, mock backend, normalization rule or schema branch was introduced.
- Root execution guidance now reflects separately opted-in public API/E2E scope
  and the user's CI deferral. Authentication/writes still require their approved
  non-production/disposable-account prerequisites.

## Observed execution

`npm.cmd run test:web:api` ran the full twelve-case public suite with
`ALLOW_PUBLIC_READ_ONLY_API=true` set only for that command process. The local
`.env` and other flags were unchanged. JUnit records the run start at
`2026-11-04T15:41:21.667Z`: **11 passed, 1 failed**, zero retries or skipped tests.
JUnit records `tests=12, failures=0, errors=1` because the unsuccessful assertion
throws a Zod validation error.

| Cases                                              | Result                                                                                              |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Existing autocomplete `01–06` and VIP vacancy `01` | Passed                                                                                              |
| Casing-identity `08/09`                            | Passed; first live verification of label uniqueness and matching taxonomy ID for the selected pairs |
| New normalization-input contract `10/11`           | Passed                                                                                              |
| Whitespace `07`                                    | Failed: `suggestions[0].value` is empty, violating the existing non-empty-label schema              |

[API-CONTRACT-001](api-contract-001.md) remains active and unquarantined. No schema,
assertion or response was changed to make the failed case pass. There is no
backend source here to fix that service behavior.

The first sandboxed attempt could not reach the service (`connect EACCES`), so
it produced no product-verification result. The same authorized public suite
was then executed outside the sandbox and produced the results above.

Local verification: `npm.cmd run check` passed TypeScript, ESLint, formatting and
all 19 synthetic foundation tests. It ran outside the sandbox to avoid the known
Windows `tsx` user-info startup restriction. Markdown checks included the changed
plan, which the repository's normal formatter ignores; local document links and
`git diff --check` were also verified.

## Evidence and limits

Ignored generated evidence:

- `reports/web/html/index.html`.
- `reports/web/junit.xml`.
- `reports/web/artifacts/api-public-jobs-API-PUBLIC-b8de0-oes-not-return-blank-labels-api/`.

Public taxonomy and VIP availability remain live-data dependencies. These cases
do not prove controlled search membership, filters, missing/expired vacancy
policies, account behavior or product-wide normalization guarantees. No live
authentication, mutation, UI/E2E browser or Maestro flow was executed. Existing
uncommitted account-auth work was not expanded. Broader implementation needs
verified contracts/data; isolated UI additionally needs a maintained real
frontend backed entirely by fixtures.
