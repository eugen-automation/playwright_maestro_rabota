# Public API casing identity implementation — 2026-11-04

Scope: `API-PUBLIC-SUGGEST-08/09`, Playwright API, Romanian (`ro-MD`). These
independent regression cases reuse previously observed query/label pairs for
Latin and Romanian professions, validating lowercase and uppercase responses
in separate request steps. Each response must have status 200, JSON media type,
the existing strict schema, and exactly one expected label. The second response
must identify that label with the same positive taxonomy ID as the first.

Query/label presence was observed previously. Cross-casing ID equality and
uniqueness are proposed expectations awaiting live verification, not new
observations. Full result equality, ordering, accent removal and whitespace
normalization are outside these cases. Each test fetches its own baseline and
uses the existing isolated GET-only client and fixture teardown; no backend
records are created and no fixed live ID is stored.

Implementation is complete. Manual and automated live execution: **not
executed**, because the current validated configuration has
`ALLOW_PUBLIC_READ_ONLY_API=false`. Authentication is also disabled and was not
executed. No flags, targets, secrets or existing write capabilities were changed.
No live target/build/run result is claimed. Historical results and the active
whitespace failure remain in the [earlier execution record](api-execution-2026-11-04.md).

Local verification on Windows / Node.js 24.21.0, based on source SHA
`9c6fc2abd57fa1c84eec5855f560909cda4209bc` plus the uncommitted workspace:

- `npm.cmd run typecheck`: passed.
- `npm.cmd run lint`: passed.
- `npm.cmd run format:check`: passed.
- `npm.cmd run test:foundation`: 19 passed, 0 failed. The sandbox initially
  prevented tsx startup (`uv_os_get_passwd` / `ENOMEM`); the same command passed
  outside the sandbox. Only synthetic inputs and local HTTP servers were used.
- `npm.cmd run test:web:api -- --list`: passed; ten public cases discovered.
  Listing is not test execution.
- `git diff --check`: passed.

No live smoke, browser, UI or mobile tests were executed. Local foundation tests
validate tooling only and do not prove these product outcomes. Existing
uncommitted authentication work is outside this increment; its synthetic checks
are included in the current foundation command. No temporary captures were kept.
