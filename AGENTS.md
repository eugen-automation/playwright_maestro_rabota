# Automation Project Constitution – Playwright + Maestro

> Repository-wide engineering instructions for contributors and AI coding assistants.
> Scope: Playwright + TypeScript web UI/API tests and Maestro Android/iOS E2E tests.
> Detailed framework rules live in [`web/AGENTS.md`](web/AGENTS.md) and
> [`mobile/AGENTS.md`](mobile/AGENTS.md).

## 1. Scope and precedence

- **MUST** is non-negotiable. **SHOULD** is the normal default, with a documented
  reason for exceptions. **AVOID** identifies a risky practice that requires review.
- Safety and secret protection take precedence. Then apply this root file,
  framework-specific guidance, and test-local conventions in that order.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) defines project structure and
  runtime boundaries. [`docs/TEST_PLAN.md`](docs/TEST_PLAN.md) defines current
  scope, priorities, known limitations, and temporary deferrals.
  [`docs/STATUS.md`](docs/STATUS.md) is the single current implementation and
  execution summary; dated specification records are historical evidence.
- Verify referenced paths and capabilities before using them. Create a missing
  architectural path only when the current task requires it; a documented target
  is not evidence that an implementation already exists.
- Prefer deterministic, independent tests that assert user-visible business
  outcomes. Never hide defects with retries, arbitrary waits, skipped assertions,
  force actions, or silent error handling.
- Never invent selectors, endpoints, response fields, application identifiers,
  UI copy, or capabilities. Verify assumptions from approved specifications,
  documented contracts, or authorized observation.
- Never report a test, build, or check as passed unless it was executed and its
  result was observed.

## 2. Shared rules – MUST

### 2.1 Configuration and secrets

- Use the root ignored `.env` locally and injected variables/secrets in CI.
  Validate supported values in `shared/config/env.schema.ts`, load them once in
  `shared/config/load-env.ts`, and list placeholder keys in `.env.example`.
  Shell/CI values take precedence. Do not read `process.env` throughout tests,
  page objects, clients, or flows.
- Absolute web, API, authentication, and service origins are environment-owned.
  Tests use relative paths from `web/constants/routes.ts`; clients combine named
  relative endpoints with validated base URLs. Changing a URL must never grant a
  capability or enable state-changing execution.
- Use `WEB_BASE_URL` and `TEST_LOCALE` for web execution. The observed public API
  additionally requires same-origin `API_BASE_URL` and
  `ALLOW_PUBLIC_READ_ONLY_API=true`. Public read-only E2E requires
  `ALLOW_PRODUCTION_READ_ONLY=true`. These flags default to false and authorize
  only their named read-only operations.
- Playwright config and the TypeScript Maestro runner consume shared validated
  configuration. The mobile runner selects the verified platform-specific app ID
  and injects `APP_ID`; Maestro headers use `appId: ${APP_ID}`. Treat any supplied
  package or bundle identifier as unverified until confirmed against the installed
  build on that platform.
- Never commit or log credentials, tokens, personal test data, authentication
  state, or secrets. Prefer `MAESTRO_`-prefixed shell variables for sensitive
  Maestro inputs instead of command-line `-e SECRET=value` arguments.
- Centralize values when they are environment-dependent, sensitive, duplicated,
  or shared business data. A clear test-local literal may remain beside its test
  when it is stable, single-use, and improves readability. Prefer typed `as const`
  data and derived unions; use enums only when their runtime semantics help.

### 2.2 Test data, API, and state

- Shared API clients live in `shared/api/clients/`; canonical contracts live in
  `shared/api/schemas/`; reusable generated data belongs under
  `shared/data/factories/`. Small single-feature case tables may live beside their
  owning test when reuse would not improve clarity.
- Mutating tests require an approved non-production target, a disposable account
  or isolated data, a unique run/test identifier, explicit execution opt-in, and
  safe cleanup in fixture teardown, `finally`, or a follow-up cleanup job. Never
  delete another run's data.
- Do not publish adverts, send messages, register accounts, make purchases, change
  profiles, or perform other externally visible operations through a real user
  account or on production.
- Tests must not depend on execution order or pre-existing authentication on a
  shared device. Make authenticated startup deterministic through an approved,
  explicit setup mechanism.
- Prefer API seed and cleanup for authorized real-backend API, E2E, and mobile
  tests. Mocked frontend tests use file-backed data and no live backend setup.
- Maestro YAML and `runScript` cannot import TypeScript modules or Zod. Run shared
  TypeScript setup before Maestro, pass only required non-secret values, and clean
  up externally. Keep genuinely necessary Maestro-compatible JavaScript in
  `mobile/scripts/`.

### 2.3 Quality, evidence, and reporting

- Use readable feature-based names and exactly one smoke/regression suite
  classification. Smoke covers a few critical paths; regression covers broader
  behavior. Framework-specific tags are defined in the child instruction files.
- Keep generated reports out of Git and segregate them under `reports/web/` and
  `reports/mobile/`. CI reports include JUnit output. Preserve relevant failure
  evidence while redacting sensitive screens and bodies.
- Tool versions and mobile builds must be pinned, with a committed lockfile.
  Formatting, linting, type checking, schema/fixture validation, and relevant tests
  form the quality gate. Current implementation scope and CI deferrals belong in
  `docs/TEST_PLAN.md`, not in this permanent policy.
- Quarantine a flaky test only with a tracked reason, owner, and removal criterion.
  Do not weaken assertions, schemas, or isolation merely to make a failure green.

### 2.4 MCP usage policy

- When live inspection materially improves correctness, use Playwright MCP for web
  UI exploration, locator verification, and interaction debugging, and Maestro MCP
  for native exploration, accessibility inspection, and flow debugging.
- Reuse existing verified selectors and abstractions before starting new MCP
  exploration.
- Derive expected behavior from approved specifications and requirements. Use live
  inspection to establish observed behavior; report discrepancies instead of
  silently treating observations as the expected result.
- Do not require MCP for API tests, refactoring, documentation, or routine
  regression execution.
- Run automated tests through Playwright Test and Maestro CLI, not through MCP
  exploration.
- If the relevant MCP is unavailable, report the limitation instead of inventing
  observations. MCP exploration is not evidence that an automated test passed.

## 3. Web layer boundaries – MUST

These boundaries apply to all web work. Detailed Playwright conventions are in
[`web/AGENTS.md`](web/AGENTS.md). The canonical fixture entry point is
`web/fixtures/pom/test-options.ts`; canonical schemas remain in
`shared/api/schemas/`. Do not create competing `web/fixtures/pages.ts` or
`web/schemas/` trees.

1. **API (`web/tests/api/`, `@api`):** validate backend behavior through authorized
   API requests only. Do not use browser-driven setup/actions, and do not count
   mocked responses as backend coverage.
2. **UI (`web/tests/ui/`, `@ui`):** test the real frontend with verified,
   file-backed responses and no live backend traffic during setup, actions,
   background activity, authentication, or teardown. Install fixture-owned
   interception before navigation, block service workers, and fail closed with
   useful diagnostics for unexpected backend traffic. Never fall back to live
   responses when a mock is missing.
3. **E2E (`web/tests/journeys/`, `@e2e`):** test selected frontend/backend outcomes
   without mocking application backend interactions. Approved, isolated API setup
   and cleanup are allowed under the shared safety rules.
4. Every web test has exactly one matching layer tag and exactly one suite tag.
   Only UI fixtures install backend mocks; only API/E2E fixtures may expose live
   backend clients and setup.
5. Validate every intentionally read or asserted JSON response and modeled mock
   payload against an appropriate canonical Zod schema. Prefer strict modeled
   objects, parse untrusted bodies as `unknown`, assert status independently, and
   make meaningful business assertions against the parsed result. Do not require a
   ceremonial truthiness assertion after a successful parse.

## 4. Framework-specific contracts

### 4.1 Playwright

Follow [`web/AGENTS.md`](web/AGENTS.md) for fixtures, POM boundaries, Romanian
locale behavior, locator priority, synchronization, schemas, tags, and execution.
Specs import `test` and `expect` only from `web/fixtures/pom/test-options.ts`. POM
construction belongs in fixture definitions, and shared or lifecycle-owned clients
are exposed through fixtures as described by the web rules.

### 4.2 Maestro

Follow [`mobile/AGENTS.md`](mobile/AGENTS.md) for flow headers, launch lifecycle,
state-reset safeguards, native selectors, synchronization, protected tags, and CLI
verification. Default suite execution must continue excluding `logged-out`,
`state-reset`, `destructive`, and `flaky` flows. State-reset or destructive flows
require a separately named deliberate opt-in on an approved device/account.

## 5. Definition of done

For a new or changed test or shared test utility:

- The file location, layer, suite tag, feature metadata, and framework conventions
  are correct.
- Environment values and app identifiers come from validated shared configuration;
  no secret, production mutation, or shared-account dependency was introduced.
- Selectors, endpoints, payloads, and behavior were verified rather than guessed.
- Assertions express deterministic business outcomes; JSON contracts and mock
  payloads are validated where applicable; authorized real-backend data is cleaned
  up safely.
- No debug-only artifacts, `.only`, unexplained quarantine, arbitrary wait, forced
  action, or hidden failure remains.
- Run the affected test/flow plus applicable typecheck, lint, format, schema/YAML,
  and relevant smoke checks in proportion to the change. Report exactly what ran
  and its observed result. If execution was unavailable or not authorized, report
  **not executed** and the reason.

## 6. Maintained references

- [Repository architecture](docs/ARCHITECTURE.md)
- [Test plan and current implementation scope](docs/TEST_PLAN.md)
- [Current implementation and execution status](docs/STATUS.md)
- [Playwright rules](web/AGENTS.md)
- [Maestro rules](mobile/AGENTS.md)
