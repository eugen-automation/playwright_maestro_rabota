# playwright_maestro_rabota

Playwright + TypeScript foundation and a reserved Maestro scaffold, governed by
[AGENTS.md](AGENTS.md). Production is the only verified target. No registration
or other account writes are enabled.

## Configuration

Use one Git-ignored root `.env` file. On a fresh checkout, copy `.env.example`
to `.env` and replace the placeholders with the verified web origin and Romanian
locale. Set `ALLOW_PRODUCTION_READ_ONLY=false` initially.

Supported values:

| Variable                     | Purpose                                                                    |
| ---------------------------- | -------------------------------------------------------------------------- |
| `WEB_BASE_URL`               | Required verified HTTP(S) origin; no credentials, path, query, or fragment |
| `TEST_LOCALE`                | Required `ro-MD`                                                           |
| `ALLOW_PRODUCTION_READ_ONLY` | `true` or `false`; defaults to `false`                                     |
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
Every current target is treated as production/read-only, and only the exact
registration-document GET is permitted by the browser fixture.

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

Browser timeouts and worker counts are declared in
`web/constants/test-settings.ts`; synthetic guard inputs live in typed test-data
files rather than test bodies.

The [foundation baseline](docs/specifications/foundation-baseline.md) records the
2026-11-03 clean install, passing quality checks, and passing registration smoke.

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
verification, or successful registration. Chromium is the configured engine.

Reports: `reports/web/html/index.html`, `reports/web/junit.xml`, and failure
artifacts under `reports/web/artifacts/`. Tests have no retries.

`test:web:ui` and `test:web:api` have no tests yet; fixtures reject execution
until verified mocks/contracts are implemented. Missing coverage must not be
interpreted as passing tests. Specs import `test` and `expect` from
`web/fixtures/pom/test-options.ts` and require one matching layer tag and either
`@smoke` or `@regression`.

See [registration discovery](docs/specifications/registration-discovery.md) for
observations, isolation prerequisites, implemented coverage, and dependency audit.

The [detailed test-case catalog](docs/specifications/test-case-catalog.md) links
the test plan to initial Web, API, Android/iOS, and synchronization cases. It
tracks prerequisites and manual/automation statuses separately; proposed cases
are not implemented coverage.

## CI

`quality.yml` runs local quality and policy checks on pushes and pull requests.
`web.yml` offers a separately opted-in manual public read-only smoke run and
uploads web results. Set GitHub repository variables `WEB_BASE_URL` and
`TEST_LOCALE` before using that workflow; missing values fail validation.

Production requests do not run automatically on a PR. Mocked UI PR smoke and
API/mobile jobs await their prerequisites; they are not represented by empty
passing jobs. Workflows have not been executed on GitHub.

## Layout

- `shared/config/`: shared loader and validation schema.
- `shared/data/`: typed factories and curated shared fixtures.
- `shared/api/`: reserved canonical API clients, contracts, and types.
- `web/tests/ui/`: future frontend tests with verified file mocks and isolation.
- `web/tests/api/`: future authorized real API tests.
- `web/tests/journeys/`: real integration; current checks remain public/read-only.
- `web/fixtures/pom/`: canonical `test-options.ts` entry and network policy.
- `mobile/flows/`: top-level Maestro tests; `mobile/subflows/`: reusable helpers.
- `scripts/`: future runners and controlled setup/cleanup tooling.
- `reports/web/`, `reports/mobile/`, `web/.auth/`: ignored generated data.

Maestro configuration preserves protected tag exclusions. Flows and application
identifiers will be added only after device inspection. Mobile execution remains
unavailable; no mobile tests were executed.
