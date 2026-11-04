# Public API execution — 2026-11-04

User authorization: run local checks and public read-only API tests. This replaces
the earlier execution deferral for this work.

## Scope and source

- Project: `playwright_maestro_rabota`.
- Base source commit: `9c6fc2a`, plus the local changes described below; not a new
  committed or deployed application build.
- Runtime: Windows, Node.js 24.21.0, npm 12.0.2, Playwright 1.64.1.
- API project, Romanian locale `ro-MD`; no browser is used by API cases.
- Target: the verified same-origin public jobs service in the ignored root
  configuration; no credentials or absolute target URLs are copied here.
- `ALLOW_PUBLIC_READ_ONLY_API=true` was set only in the command process.
  The local environment file was not modified.
- No account creation, authentication, application, subscription, profile edit or
  other backend mutation occurred. Each API case owns and disposes its context.
- Backend build/version was not reported by these endpoints and is unverified.

## Executed verification

| Check                                           | Observed result                                                 |
| ----------------------------------------------- | --------------------------------------------------------------- |
| Existing suite before expansion                 | 4 public API cases passed                                       |
| `npm.cmd run check` after implementation        | TypeScript, ESLint, Prettier and all 14 foundation tests passed |
| `npm.cmd run test:web:api` after implementation | 8 tests: 7 passed, 1 failed; no skipped tests or retries        |

The last API run started at `2026-11-04T13:21:32.948Z` according to JUnit.
Playwright reports one failed case. JUnit classifies its thrown Zod validation
exception as one error (`tests=8, failures=0, errors=1, skipped=0`).
These are equivalent views of the same unsuccessful suite, not a passing run.

## Per-case result

| Case                                               | Suite      | Result                                                              |
| -------------------------------------------------- | ---------- | ------------------------------------------------------------------- |
| API-PUBLIC-SUGGEST-01 — programmer                 | smoke      | Passed                                                              |
| API-PUBLIC-SUGGEST-02 — accountant                 | smoke      | Passed                                                              |
| API-PUBLIC-SUGGEST-03 — Romanian diacritics        | smoke      | Passed                                                              |
| API-PUBLIC-SUGGEST-04 — empty query                | regression | Passed                                                              |
| API-PUBLIC-SUGGEST-05 — uppercase Latin            | regression | Passed                                                              |
| API-PUBLIC-SUGGEST-06 — uppercase Romanian         | regression | Passed                                                              |
| API-PUBLIC-SUGGEST-07 — whitespace / usable labels | regression | Failed: blank label violates the existing non-empty-string contract |
| API-PUBLIC-VACANCY-01 — current VIP identity       | smoke      | Passed                                                              |

The failed case is active and unquarantined. No schema was relaxed, assertion
removed, retry added or failure converted into a pass. See
[API-CONTRACT-001](api-contract-001.md) for reproduction and triage.

## Local evidence

Generated evidence remains ignored by Git and may be overwritten by later runs:

- HTML: `reports/web/html/index.html`.
- JUnit: `reports/web/junit.xml`.
- Status: `reports/web/artifacts/.last-run.json`.
- Whitespace error/trace:
  `reports/web/artifacts/api-public-jobs-API-PUBLIC-b8de0-oes-not-return-blank-labels-api/`.

The documentation retains only the relevant redacted failure description; it
does not copy the full live taxonomy response or session-bearing traffic.

## Coverage limits and next prerequisites

Empty **autocomplete input** is tested; this does not prove a controlled
zero-result job search. Case normalization is observed for the selected terms,
not all languages or query inputs. Vacancy identity uses a current public VIP
link and does not verify title/employer persistence or unavailable-job rules.

The eight controlled-data API cases still require verified contracts and
deterministic data; auth/permission/write cases additionally need approved
non-production access, disposable accounts and cleanup. Isolated UI still needs
a maintained fixture-backed real frontend including server rendering. Native
flows need a verified installed build, device hierarchy and deterministic state.

The registration browser smoke and mobile flows were not executed in this
increment. Workflow files and repository remotes were not changed, and no push
or GitHub workflow was triggered.
