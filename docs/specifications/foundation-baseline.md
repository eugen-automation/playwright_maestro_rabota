# Foundation baseline

Verified locally on 2026-11-03 on Windows. This records step 1 of the automation
implementation plan; it does not establish coverage for later phases.

## Repository and dependencies

- Initialized the local Git repository on `main`; no remote is configured.
- Retained the existing `package-lock.json` without modification and included it
  in the initial baseline commit.
- Clean-installed dependencies from the lockfile. All nine direct dependencies
  match their exact versions in `package.json` and the lockfile.
- Runtime: Node.js `24.21.0`, npm `12.0.2`, Playwright `1.64.1`.
- Added `.gitattributes` to preserve LF line endings across Windows and CI.
- Verified that `.env`, `node_modules/`, `reports/`, and `web/.auth/` are ignored.
  The repository includes only the placeholder `.env.example`.

## Executed checks

| Command                                                     | Result                                                           |
| ----------------------------------------------------------- | ---------------------------------------------------------------- |
| `npm.cmd ci --no-audit --no-fund --cache reports/npm-cache` | Passed; 106 packages installed                                   |
| `npm.cmd run check`                                         | Passed: TypeScript, ESLint, Prettier, and all 7 foundation tests |
| `npm.cmd run test:web:e2e -- --grep '@smoke'`               | Passed: 1 Chromium test, no failures or skips                    |

The smoke run set `ALLOW_PRODUCTION_READ_ONLY=true` only in its command process.
The shared loader validated configuration, and the configured origin was checked
against the existing registration discovery record before the request. The local
`.env` was not modified.

The dependency download required approved network access outside the sandbox.
The first quality run passed TypeScript, lint, and formatting but stopped when
`tsx` could not read Windows user information (`uv_os_get_passwd`). The approved
run outside the sandbox passed the complete check. No application code or
assertions were changed to accommodate these execution restrictions.

## Evidence and coverage limits

The smoke verifies the server-rendered Romanian registration heading, email
input, password input type, and submit button. JavaScript and service workers
are disabled; only the exact registration-document GET is permitted. Other
requests and WebSockets are blocked. No form was submitted or account created.

Generated evidence is ignored by Git:

- HTML: `reports/web/html/index.html`.
- JUnit: `reports/web/junit.xml` (1 test, 0 failures, 0 errors, 0 skipped).
- Run status: `reports/web/artifacts/.last-run.json` (`passed`).

This run does not validate interactive registration, email confirmation,
appearance, search, or other browsers. UI and API execution remain disabled
pending verified mocks/contracts and their environment prerequisites. Mobile
tests and GitHub workflows were not executed. The dependency audit was not rerun;
the historical audit is documented in [registration discovery](registration-discovery.md).

The next step is a detailed, prioritized case catalog linked to `TEST_PLAN.md`,
with separate manual execution and automation implementation statuses.
