# Playwright + Maestro automation

Automation repository for web API/UI/E2E testing with Playwright and Android/iOS
native testing with Maestro. It does not contain product source code.

Start with:

- [Current status](docs/STATUS.md)
- [Test plan](docs/TEST_PLAN.md)
- [Test cases](docs/TEST_CASES.md)
- [Test decisions](docs/DECISIONS.md)
- [Engineering rules](AGENTS.md)

## Current safety boundary

The only verified application target is public production access, restricted to
explicitly opted-in read-only operations. No registration, profile/CV update,
application, favorite, message, employer action, or other externally visible write
is authorized.

The default public API project is GET-only. A separate authentication project
exists but is blocked until approved non-production access, disposable accounts,
owned data, and cleanup are available. Authentication credentials and an opt-in
flag alone are not authorization.

## Setup

Use Node.js 24 and npm. Copy `.env.example` to the ignored root `.env`, then add
only verified values. The shared environment loader validates configuration and
does not provide a default target.

```powershell
npm.cmd ci
npx.cmd playwright install chromium
npm.cmd run check
```

On Windows, use `npm.cmd` / `npx.cmd` to avoid PowerShell execution-policy issues.
`check` runs TypeScript, linting, Prettier, local Markdown link/fragment validation,
and synthetic foundation tests. It does not execute product API, browser, or device
tests.

## Configuration

| Variable                                                     | Purpose                                                                   |
| ------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `WEB_BASE_URL`                                               | Verified web origin; no credentials, path, query, or fragment             |
| `API_BASE_URL`                                               | Same-origin public API origin for the restricted GET-only project         |
| `TEST_LOCALE`                                                | Required browser locale, currently `ro-MD`                                |
| `ALLOW_PRODUCTION_READ_ONLY`                                 | Explicit browser markup E2E opt-in; defaults to `false`                   |
| `ALLOW_PUBLIC_READ_ONLY_API`                                 | Explicit public API opt-in; defaults to `false`                           |
| `AUTH_BASE_URL`, `TEST_ACCOUNT_*`, `ALLOW_TEST_ACCOUNT_AUTH` | Blocked auth project configuration; not sufficient to authorize execution |
| `ANDROID_APP_ID`, `ANDROID_DEVICE_ID`, `ANDROID_APP_VERSION` | Verified selected Android build/device                                    |
| `ALLOW_ANDROID_READ_ONLY`                                    | Explicit Android public-flow opt-in; defaults to `false`                  |

Shell/CI variables override `.env`. Changing a URL or setting one runtime flag
cannot enable another runtime or any write operation.

## Commands

| Command                                            | Purpose                                                                   |
| -------------------------------------------------- | ------------------------------------------------------------------------- |
| `npm.cmd run check`                                | Local quality gate; no product execution                                  |
| `npm.cmd run test:web:api`                         | Explicitly opted-in public API suite                                      |
| `npm.cmd run test:web:e2e`                         | Explicitly opted-in registration-markup GET check                         |
| `npm.cmd run test:web:e2e:compat`                  | Optional Windows compatibility run for that one markup scenario           |
| `npm.cmd run check:mobile`                         | Validate six Maestro flow definitions; not device execution               |
| `npm.cmd run test:mobile:android -- --suite smoke` | Explicitly opted-in Android read-only smoke flows                         |
| `npm.cmd run test:web:auth`                        | Blocked authentication project; do not run without approved prerequisites |

For any live command, review [DECISIONS.md](docs/DECISIONS.md) and the relevant
rules first. Report a test as passed only when that exact execution was observed.

## Repository layout

- `shared/`: validated configuration, API clients/contracts, shared data, and
  runner utilities.
- `web/`: Playwright config, fixtures, page objects, and API/UI/E2E specs.
- `mobile/`: Maestro flows and reusable subflows.
- `scripts/`: local runners and documentation validation.
- `docs/`: the five maintained documents listed above.
- `reports/`: ignored generated evidence.

CI templates are intentionally inactive. iOS, isolated UI, controlled-data,
authentication, destructive, and state-reset execution remain blocked or deferred
as stated in [STATUS.md](docs/STATUS.md).
