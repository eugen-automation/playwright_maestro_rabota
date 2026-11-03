# Automation project rules

Scope: Playwright + TypeScript API/web tests and Maestro native Android/iOS E2E.
**MUST** is mandatory; **SHOULD** is the default, with justified exceptions.
Safety and secrets take priority, followed by this file, framework guidance, and
test-local conventions. Framework rules apply only to their own runtime.

Read [web/AGENTS.md](web/AGENTS.md) for Playwright and
[mobile/AGENTS.md](mobile/AGENTS.md) for Maestro. The
[test plan](docs/TEST_PLAN.md) owns scope/priorities; the
[architecture](docs/ARCHITECTURE.md) owns canonical paths. Planned directories
and cases do not prove implemented capability or grant execution permission.

## 1. Testing strategy

- **API first:** broadest application coverage and first implementation priority.
  Cover contracts, business rules, validation, permissions and persistence.
- **Isolated UI second:** focused rendering, interaction, client validation and
  response-state checks using verified files, without backend access.
- **E2E last:** selected web, native and synchronization journeys must address a
  critical integration/platform risk beyond lower-layer proof.
- Choose the lowest reliable layer; do not repeat full API matrices on browsers
  or devices. Product unit/component tests belong below APIs but application
  source is outside this repository. Tooling tests are not product unit coverage.
- Follow the [pyramid strategy](docs/specifications/testing-pyramid.md). No fixed
  count quota or ordered dependency between tests is required. Missing API access
  remains a blocker, not a reason to substitute a larger E2E suite.

## 2. Configuration and secrets

- Declare environment values, business inputs, shared UI copy and timeouts once
  in typed configuration, constants, case tables or factories. Prefer `as const`
  and derived types; use enums only for useful runtime semantics. Incidental
  HTTP codes, schema constraints, test names/tags and verified selectors may stay
  with their owning code.
- Load root `.env` once through `shared/config/load-env.ts`, validate through
  `env.schema.ts`, and let shell/CI values override the file. No ad hoc
  `process.env`, parallel environment JSON, `TEST_ENV` or legacy `BASE_URL`.
- Absolute web/API/mailbox/service origins belong only in ignored `.env` or CI
  configuration. List consumed keys as placeholders in `.env.example`. No
  default target or secrets in templates. Use relative routes/endpoints in code.
- Require only verified values for implemented runtimes. Web currently needs
  `WEB_BASE_URL` and `TEST_LOCALE`; public API additionally needs same-origin
  `API_BASE_URL`. Unverified mobile values remain absent.
  Fail fast on invalid/missing required values. A URL change cannot enable writes
  or another runtime.
- Live capabilities are the guarded registration-document E2E with
  `ALLOW_PRODUCTION_READ_ONLY=true` and observed GET-only public jobs API with
  separate `ALLOW_PUBLIC_READ_ONLY_API=true`. Both flags default false; neither
  enables the other or writes. API clients allow only observed paths (current VIP
  detail paths come from public search HTML). Mocked UI/mobile remain disabled.
- Never commit or log credentials, tokens, personal data, authentication state or
  sensitive reports. Use CI secrets/secret management; ignore local environment,
  auth and generated files. Synthetic URL security cases are test data, never targets.

## 3. Evidence, data and isolation

- Never guess endpoints, payloads, schemas, selectors, UI copy, platform IDs or
  capabilities. Record documented/authorized observations before implementation.
- Tests are independent and assert business outcomes, not just taps or HTTP 200.
  Cover relevant positive, negative, boundary, access-control and recovery risks.
- Use canonical shared clients, schemas and typed factories. Use Faker only
  where useful, seeded/controlled for reproducibility; use fixed boundary cases.
  Prefer API seed/cleanup for real-backend tests, and files only for mocked UI.
- Writes require an approved non-production target, explicit opt-in, disposable
  accounts/isolated data, unique run/test ownership, and validated cleanup in
  fixture teardown/`finally` or a follow-up job. Clean only owned records, even
  on failure. Never publish adverts, register accounts, message users, purchase,
  or alter real profiles/data on production.
- Establish authentication deterministically with supported setup and dedicated
  accounts (per worker for writes). Do not rely on another test, a signed-in
  personal device or shared mutated state. Document unavoidable live-content
  dependencies and assert stable structure rather than particular live listings.
- Parallelize only with isolated data/accounts/devices. Otherwise document and
  configure limited workers or serial groups; never share a device concurrently.

## 4. Quality, reporting and verification

- Keep code small, feature-based and strictly typed: no TypeScript `any` or
  unchecked casts of untrusted data. Cross-framework code/types live in `shared/`.
- Use meaningful suite/feature tags. Centralize runtime settings; pin tools and
  mobile builds, and commit exactly one package-manager lockfile.
- No arbitrary waits, force clicks, repeated taps, hidden errors, broad optional
  actions, silent schema widening, deleted assertions or indiscriminate retries.
  Investigate failures. Quarantine/`fixme` requires an issue, reason, owner,
  review date and exit criterion visible to the user. No committed `test.only`.
- Reports/JUnit/failure evidence belong under ignored `reports/web/` or
  `reports/mobile/`. Redact screens/bodies and record source SHA, app build,
  browser/OS/device, safe target identifier, locale, run ID and relevant flags.
- CI enforces formatting, lint, type checks, relevant contracts and eligible PR
  smoke. Prioritize API feedback, then UI and selective integration gates; broaden
  on schedules/releases only when suites and access exist. No empty passing jobs.
- After implementation changes, normally run affected tests, typecheck and
  applicable lint/format/YAML checks; include relevant smoke for cross-suite
  changes. A user instruction deferring tests takes precedence: perform static
  checks and report tests **not executed**, without claiming runtime validation.
- Do not claim a pass without observing execution. Report commands/results,
  blockers, failure evidence and intentional exceptions. Remove temporary dumps,
  exploratory/debug files and sensitive artifacts before review.
- Keep README setup, commands, supported runtimes, accounts, reports and reset
  opt-ins current. Maintain requirement-to-case traceability and separate manual,
  implementation and execution statuses.

## 5. Review checklist

Before delivery, confirm canonical paths/imports, verified assumptions, runtime
and secret guards, independent data/cleanup, correct tags, meaningful assertions,
and framework conventions. Run permitted static/runtime checks and report their
actual results and anything unexecuted. Preserve evidence and document exceptions.
