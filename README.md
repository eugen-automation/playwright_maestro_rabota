# playwright_maestro_rabota

Playwright + TypeScript foundation and a reserved Maestro scaffold, governed by
[AGENTS.md](AGENTS.md). Production is the only verified target. No registration
or other account writes are enabled.

Contributor guidance is split into shared [root rules](AGENTS.md),
[Playwright rules](web/AGENTS.md), and [Maestro rules](mobile/AGENTS.md).
The [test plan](docs/TEST_PLAN.md) owns scope and priorities; the
[architecture reference](docs/ARCHITECTURE.md) owns the target layout.

## Testing strategy and implementation order

This project follows an **API-first testing pyramid**:

1. **API tests — broadest coverage and first priority.** Verify backend contracts,
   business rules, validation, permissions, and persistence through real
   authorized requests.
2. **Isolated UI tests — focused frontend coverage.** Use verified file-backed
   responses to check rendering, interactions, client validation, and error states.
3. **Web E2E and native mobile — selective critical journeys.** Cover integration
   and platform risks without duplicating the full API regression matrix.

Product unit/component tests belong below API tests in the wider pyramid; this
repository does not contain application source. Its foundation tests validate
automation utilities and configuration, not product business logic.

The public API increment implements twelve read-only cases for observed job
autocomplete and VIP vacancy JSON. Broader matching/filter/error/permission and
write coverage still needs verified contracts and controlled data. The existing
registration-markup E2E is a retained baseline. See the
[strategy and readiness checklist](docs/specifications/testing-pyramid.md),
[discovery evidence](docs/specifications/api-discovery.md) and [API backlog](docs/specifications/api-cases.md).

## Configuration

Use one Git-ignored root `.env` file. On a fresh checkout, copy `.env.example`
to `.env` and replace the placeholders with the verified web origin and Romanian
locale. Set `ALLOW_PRODUCTION_READ_ONLY=false` initially.

Supported values:

| Variable                     | Purpose                                                                    |
| ---------------------------- | -------------------------------------------------------------------------- |
| `WEB_BASE_URL`               | Required verified HTTP(S) origin; no credentials, path, query, or fragment |
| `API_BASE_URL`               | Required for public API execution; must match the configured web origin    |
| `TEST_LOCALE`                | Required `ro-MD`                                                           |
| `ALLOW_PRODUCTION_READ_ONLY` | `true` or `false`; defaults to `false`                                     |
| `ALLOW_PUBLIC_READ_ONLY_API` | Separate GET-only API opt-in; defaults to `false`                          |
| `ANDROID_APP_ID`             | Verified installed Android package; required only for Android execution    |
| `ANDROID_DEVICE_ID`          | Explicit user-selected, connected, unlocked Android device                 |
| `ANDROID_APP_VERSION`        | Pinned installed app version name; the runner rejects a mismatch           |
| `ALLOW_ANDROID_READ_ONLY`    | Independent reviewed read-only native-flow opt-in; defaults to `false`     |
| `CI`                         | Optional `true`, `false`, or empty; normally supplied by CI                |

`shared/config/load-env.ts` reads the root file once, merges shell/CI variables
over it, validates supported values through `env.schema.ts`, and exports typed
configuration. Playwright and fixtures consume it; page objects use named relative
routes. There is no default URL. Missing or invalid required values fail fast.

The old `.env.prod`, JSON environment files, `TEST_ENV`, and `BASE_URL` are
removed. Clear obsolete shell variables before running; the loader rejects them.
Additional API/mobile/mailbox values will be added only when their verified
implementations need them. No mailbox credentials are stored or needed here.

Changing `WEB_BASE_URL` cannot enable write operations or another runtime.
Every current target is treated as production/read-only. The browser fixture
permits only the exact registration-document GET; API fixtures separately permit
only observed public job GET operations. Raw request fixtures are unavailable.

## Setup and verification

Use Node.js 24 (CI pins 24.21.0) and npm. Dependencies have exact versions and a
single `package-lock.json`.

```powershell
npm.cmd ci
npx.cmd playwright install chromium
npm.cmd run check
```

On Windows, `npm.cmd` avoids PowerShell's `npm.ps1` execution-policy restriction.
`check` runs strict TypeScript checking, ESLint, Prettier, and local configuration
and network-policy tests. These checks use synthetic inputs, need no local
credentials, and do not access rabota.md or a mailbox.

The foundation suite also includes synthetic local HTTP checks for the read-only
API transport (contract allowlist, redirect containment and cookie isolation).
These are tooling checks, not backend application coverage.

Browser timeouts and worker counts are declared in
`web/constants/test-settings.ts`; synthetic guard inputs live in typed test-data
files rather than test bodies.

The [foundation baseline](docs/specifications/foundation-baseline.md) records the
2026-11-03 clean install, passing quality checks, and passing registration smoke.

## Public read-only API

The observed API uses the configured web origin. Configure `API_BASE_URL` to
match `WEB_BASE_URL`, then deliberately opt in when execution is wanted:

```powershell
$env:ALLOW_PUBLIC_READ_ONLY_API = 'true'
npm.cmd run test:web:api
```

Seven cases cover observed autocomplete taxonomy labels, empty input, uppercase
Latin/Romanian inputs and whitespace label validity. One fetches current search
HTML, selects an observed VIP vacancy route, and checks its strict JSON identity.
The 2026-11-04 run finished with **7 passed, 1 failed**: whitespace produces a blank
label that violates the existing contract. See [API-CONTRACT-001](docs/specifications/api-contract-001.md)
and the [execution record](docs/specifications/api-execution-2026-11-04.md).
Two additional regressions compare the expected taxonomy label's ID across
lowercase/uppercase Latin and Romanian queries; both have now passed. Two more
cover the existing JSON contract for padded and accentless inputs without
asserting normalization behavior. The latest twelve-case run finished with
**11 passed, 1 failed**, reproducing the same whitespace discrepancy. See the
[latest implementation/execution record](docs/specifications/api-read-only-increment-2026-11-04.md).

No browser is needed. This public live-data coverage does not prove controlled
job-search matching, filters, zero-result job searches, permissions or writes.
See [API discovery](docs/specifications/api-discovery.md) for the observed scope.

The API flag does not enable browser E2E, and the browser flag does not enable API.
UI remains disabled. Android uses its own separately guarded runner below;
iOS implementation is deferred by user instruction because no device/simulator is available. No live API CI job or schedule was added.

## Public read-only registration smoke

After configuring `.env`, deliberately opt in for this shell:

```powershell
$env:ALLOW_PRODUCTION_READ_ONLY = 'true'
npm.cmd run test:web:e2e
```

The smoke reads only the exact Romanian registration document with JavaScript
disabled. Its fixture blocks all other requests, form submissions, assets, and
WebSockets. It checks server-rendered controls without submitting anything.
This is limited public E2E coverage, not isolated frontend behavior, visual
verification, or successful registration. Chromium is the default engine.

For the Windows compatibility matrix, install Playwright's Firefox with
`npx.cmd playwright install firefox`, keep Chrome/Edge installed, and run
`npm.cmd run test:web:e2e:compat` with the same read-only opt-in. The existing
markup scenario passed in Chromium, Chrome, Edge and Firefox. This checks the
limited document contract, not interactive/visual behavior; Safari needs macOS.
Browser versions are included in result annotations/JUnit properties.

`test:web:smoke` explicitly selects the public API and Chromium projects and
requires both independent read-only opt-ins. Optional compatibility projects
use the separate command above; unready authentication projects are not added
to the default smoke selection.

Reports: `reports/web/html/index.html`, `reports/web/junit.xml`, and failure
artifacts under `reports/web/artifacts/`. Tests have no retries.

`test:web:ui` has no application tests and remains disabled until isolation is
implemented. The latest twelve-case API run has **11 passed, 1 failed** on
2026-11-04, as recorded above.
The whitespace regression stays active; missing or failing coverage must not be
interpreted as passing tests. Specs import `test` and `expect` from
`web/fixtures/pom/test-options.ts` and require one matching layer tag and either
`@smoke` or `@regression`.

See [registration discovery](docs/specifications/registration-discovery.md) for
observations, isolation prerequisites, implemented coverage, and dependency audit.

The [detailed test-case catalog](docs/specifications/test-case-catalog.md) links
the test plan to initial Web, API, Android/iOS, and synchronization cases. It
tracks prerequisites and manual/automation statuses separately; proposed cases
are not implemented coverage.

## Android Maestro

Maestro **2.11.0** is pinned by the runner. Set the verified Android package,
device and installed version in the ignored `.env` (placeholder names above).
Keep the selected phone unlocked and in Romanian; regional variants such as
`ro-RO` are accepted, and the actual device locale is recorded separately from
the shared `ro-MD` browser locale. The runner wakes the display but fails if the
keyguard is active; it does not enter a PIN or change screen-lock settings.

```powershell
npm.cmd run check:mobile
$env:ALLOW_ANDROID_READ_ONLY = 'true'
npm.cmd run test:mobile:android -- --suite smoke
```

To run one exact flow, use `--flow mobile/flows/navigation/launch.yaml` instead
of `--suite smoke`. `check:mobile` validates YAML, tags, subflow references and
safety constraints; it is not device execution. The test runner also checks
installed Maestro/app versions, device connectivity and the reviewed flow
allowlist, then runs Maestro syntax validation and the selected flow(s).

The six implemented Android cases check Home controls, keyword-picker navigation,
profession results, selected vacancy title/employer and return navigation,
city selection/reset, and background/resume of the results screen.
They preserve app storage, account state and permission
settings; no authentication or backend writes are performed. Protected tag
exclusions cannot be disabled through this runner. State-reset/destructive
runners are not implemented; iOS implementation is deferred because no devices
are available. Credentials are not forwarded to
Maestro; child processes receive only host-tooling variables and non-secret IDs.

Reports are isolated by run under `reports/mobile/android/<run-id>/`: `run.json`
records source/build/device/locale, `result.json` records the outcome, and
`junit.xml`, `artifacts/` and `debug/` retain Maestro evidence. No APK or device
evidence is committed. During execution the runner temporarily enables stay-awake
for wired power (AC or USB), then restores and verifies the captured setting,
including after failures. It does not change a PIN or bypass the keyguard.
Only the reviewed vacancy-title capture script is allowed; arbitrary scripts
remain rejected. See [latest native evidence](docs/specifications/mobile-read-only-continuation-2026-11-04.md).

## CI

CI implementation is deferred by user instruction. Workflow files remain
inactive; continue local quality checks and explicitly opted-in read-only runs.

Production requests do not run automatically on a PR. API jobs, followed by
focused mocked UI PR smoke and selected mobile jobs, await their prerequisites;
they are not represented by empty
passing jobs. The first [GitHub Quality run](https://github.com/eugen-automation/playwright_maestro_rabota/actions/runs/41629764856)
passed on 2026-11-03 for commit `941e53a`, covering TypeScript, ESLint, Prettier,
and all seven foundation tests. The manual public read-only web smoke has not
been executed on GitHub.

## Layout

- `shared/config/`: shared loader and validation schema.
- `shared/data/`: typed factories and curated shared fixtures.
- `shared/api/`: GET-only transport, public jobs client and strict observed schemas.
- `web/tests/ui/`: future frontend tests with verified file mocks and isolation.
- `web/tests/api/`: twelve public read-only jobs cases; eleven pass, one tracked contract failure.
- `web/tests/journeys/`: real integration; current checks remain public/read-only.
- `web/fixtures/pom/`: canonical `test-options.ts` entry and network policy.
- `mobile/flows/`: top-level Maestro tests; `mobile/subflows/`: reusable helpers.
- `scripts/`: shared-config Maestro runner; future controlled setup/cleanup tooling.
- `reports/web/`, `reports/mobile/`, `web/.auth/`: ignored generated data.

Android's six public read-only flows passed as four smoke and two regression
cases on the selected
verified device. Controlled-data mobile cases retain their prerequisites; iOS
cases are explicitly deferred. These checks do not prove controlled result
membership, persistence or writes.
