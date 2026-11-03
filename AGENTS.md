# Automation Project Constitution – Playwright + Maestro

> Repository-wide engineering instructions for contributors and AI coding assistants.
> Scope: web UI and API tests with **Playwright + TypeScript**; native Android/iOS E2E tests with **Maestro**.
> Status: architectural contract for VS Code and compatible coding assistants. Paths described below are targets to create, not proof that the files already exist.
> Canonical Playwright import: `web/fixtures/pom/test-options.ts`. Canonical schemas: `shared/api/schemas/`. Do not create competing `web/fixtures/pages.ts` or `web/schemas/` trees.

## 1. Principles and priority

- **MUST** = non-negotiable; **SHOULD** = normal default, with justified exceptions; **AVOID** = prohibited unless the exception is documented and reviewed.
- Safety and secret protection take precedence over all other rules. Then: this root file > framework-specific guidance > test-local conventions. Framework rules apply **only** to their own runtime.
- `docs/TEST_PLAN.md` defines the shared manual and automation testing scope and priorities; this file defines implementation constraints. The test plan must follow this architecture. Broad scenario inventories are coverage goals, not evidence of verified capabilities or authorization to execute state-changing tests.
- Prefer deterministic, independent tests that assert **user-visible business outcomes**. Do not hide defects with retries, arbitrary waits, skipped assertions, or silent error handling.
- Never invent selectors, API endpoints, response fields, app IDs, UI strings, or capabilities. Inspect the application/API and verify assumptions before writing tests.
- Prefer small, maintainable tests over large end-to-end chains. Reuse abstractions when they represent a clear product or technical concept; avoid abstraction for its own sake.
- Do not claim a test or build passed unless it was executed and the result was observed.

## 2. Repository architecture

```text
automation/
├── AGENTS.md
├── README.md
├── package.json
├── <one committed package-manager lockfile>
├── tsconfig.json
├── .env.example
├── .gitignore
├── .github/workflows/
│   ├── quality.yml
│   ├── web.yml
│   └── mobile.yml
├── docs/
│   ├── specifications/
│   └── TEST_PLAN.md
├── shared/
│   ├── config/
│   │   ├── env.schema.ts
│   │   └── load-env.ts
│   ├── api/
│   │   ├── clients/
│   │   ├── schemas/
│   │   └── types/
│   ├── data/
│   │   ├── factories/
│   │   ├── seeders/
│   │   └── fixtures/
│   └── utils/
├── web/
│   ├── playwright.config.ts
│   ├── fixtures/
│   │   ├── pom/test-options.ts
│   │   ├── api/schemas/index.ts       # re-exports shared/api/schemas
│   │   └── auth/
│   ├── pages/
│   │   └── components/               # reusable UI regions
│   ├── constants/
│   │   ├── ui-text.ts                 # shared Romanian UI text
│   │   └── routes.ts                  # locale-aware relative paths
│   ├── test-data/
│   │   ├── static/                    # curated, typed test cases
│   │   └── mocks/                     # verified, synthetic backend response files
│   ├── types.ts                       # web-only types, if needed
│   ├── tests/
│   │   ├── ui/
│   │   ├── api/
│   │   └── journeys/
│   └── .auth/                         # generated, gitignored
├── mobile/
│   ├── config.yaml
│   ├── flows/
│   │   ├── auth/
│   │   ├── search/
│   │   ├── navigation/
│   │   └── jobs/
│   ├── subflows/
│   │   ├── launch-app.yaml
│   │   ├── launch-logged-out.yaml
│   │   ├── skip-onboarding.yaml
│   │   └── ensure-authenticated.yaml
│   └── scripts/                      # Maestro-compatible JS only
├── scripts/
│   ├── run-mobile.ts
│   ├── seed-test-data.ts
│   └── cleanup-test-data.ts
└── reports/
    ├── web/
    └── mobile/                      # generated, gitignored
```

**Boundaries:** Playwright specs live in `web/tests/`. Maestro test flows live in `mobile/flows/`; reused Maestro sequences live in `mobile/subflows/`. Cross-framework Node/TypeScript code lives in `shared/` and executes **outside** Maestro's scripting runtime. Never implement a Playwright page object for Maestro or duplicate a shared API contract in both suites.

## 3. Shared rules – MUST

### 3.1 Configuration and secrets

**MUST – No embedded configuration or test data:** Do not hardcode environment-dependent values, absolute service URLs, credentials, application identifiers, business inputs, shared UI copy, or timeout values in tests, page objects, fixtures, clients, runners, or other implementation files. Declare values once in the appropriate configuration, constants, typed case tables, or data factories and consume them by name. Prefer typed `as const` objects/arrays and derived union types; use TypeScript enums only when their runtime semantics provide a concrete benefit. Do not create enums merely to hold URLs, UI strings, or test inputs. This rule does not require extracting every incidental literal: standard HTTP status codes, test titles/tags, schema constraints, and verified selector definitions may remain with their owning code when they are not environment configuration or duplicated business data.

**MUST – Environment-owned URLs:** Declare verified absolute web/API/service base URLs, including mailbox-provider URLs, in the Git-ignored root `.env` file or inject them through CI variables/secrets. Validate and expose values through `shared/config/env.schema.ts` and `shared/config/load-env.ts`; list supported variable names with placeholders in `.env.example`. Load `.env` once, with shell/CI values taking precedence, and consume typed configuration rather than reading `process.env` throughout implementation files. Tests and page objects use relative paths from `web/constants/routes.ts` with the configured `baseURL`; API/service clients combine named relative endpoint paths with their configured base URL. Never duplicate absolute URLs across implementation files or enable writes by changing a URL. Intentionally synthetic URL inputs for configuration/security tests belong in clearly named typed test-data cases, never executable target configuration.

1. **One source of truth:** Use the root `.env` file locally and injected environment variables in CI, validated by `shared/config/env.schema.ts` and loaded once by `shared/config/load-env.ts`. Do not maintain parallel JSON environment selection or a `TEST_ENV` selector. Implement only verified configuration needed by the current runtime: web requires `WEB_BASE_URL` and `TEST_LOCALE`; future API/mobile support must add and validate verified API URLs and platform identifiers when implemented. Unverified API/mobile values remain absent while those runtimes are disabled. Current live execution is limited to public read-only E2E with `ALLOW_PRODUCTION_READ_ONLY=true`; changing the URL must never enable another layer or state-changing execution.
2. Playwright config and the TypeScript Maestro runner **consume** that shared configuration; they must not maintain separate, contradictory copies. `scripts/run-mobile.ts` selects `APP_ID` by mobile platform and injects it into Maestro with `-e APP_ID=...` (or an equivalent supported mechanism). Maestro flow headers use `appId: ${APP_ID}`.
3. The provided `md.simpals.app999` is a **candidate Android identifier**, not a universal Android/iOS constant. Verify the actual installed Android package and iOS bundle identifier before putting them into shared configuration.
4. Fail fast if required configuration is missing or invalid. No default target URL or automatic production execution: public read-only execution requires explicit opt-in. `.env.example` contains placeholders only; actual `.env` files are ignored by Git.
5. Never commit credentials, tokens, personally identifying test data, local authentication state, or secrets in YAML/JSON/source/reports. Use a secrets manager or CI secret injection. For Maestro CLI, prefer `MAESTRO_`-prefixed shell variables for sensitive values rather than exposing them in `-e SECRET=value` process arguments. Do not print or capture secrets in logs.

### 3.2 Test data, API and state

6. Canonical typed data factories live in `shared/data/factories/`; API clients in `shared/api/clients/`; contracts in `shared/api/schemas/`. Generate representative, valid, and invalid data intentionally. For real-backend API, web E2E, and mobile tests, prefer API-based seed and cleanup over UI-based setup. Mocked frontend tests use file-backed data without real backend setup or cleanup.
7. Mutating tests require a dedicated disposable account or isolated data, a unique run/test identifier, and safe cleanup in `finally`/fixture teardown or a follow-up cleanup job. Do not remove data belonging to other runs.
8. Maestro YAML/`runScript` cannot directly import Node.js/TypeScript modules or Zod. Run shared TS seeders **before** Maestro, pass only needed IDs and non-secret inputs into the flow, and clean up after execution. Maestro-compatible JS is limited to `mobile/scripts/` when genuinely needed.
9. No test may depend on another test's order or a previously authenticated physical device. Use controlled data rather than changing public/live content wherever available. For signed-in flows, make authenticated startup deterministic using a dedicated test account and an explicit supported setup mechanism. Record any unavoidable dependency on live content and assert stable structural behavior rather than assuming specific job listings exist.
10. Protect real accounts: do not publish adverts, send messages, change profile data, make purchases, or perform other externally visible operations on a real user account. Such scenarios require approved disposable test accounts and an explicit execution opt-in.

### 3.3 Quality and execution

11. Use readable feature-based names and consistent metadata. Smoke covers a few critical paths; regression covers broader scenarios. Keep browser/platform coverage and known limitations documented.
12. Reports must be segregated under `reports/web/` and `reports/mobile/`, including machine-readable JUnit results in CI. Retain relevant failure evidence; redact sensitive screens and API bodies. Do not commit generated artifacts.
13. CI must enforce formatting, lint, TypeScript type checking, relevant test/schema validation, and PR smoke checks. Run extended regression on a schedule or release gate. Pin tool versions and mobile app builds; use a committed package-manager lockfile.
14. A failing assertion is not solved by fixed delays, force actions, indiscriminate retries, catch-and-ignore code, or marking tests optional. Investigate and record the cause; quarantine flakes explicitly with an owner and removal criterion.

## 4. Playwright – Web UI and API

These rules apply to `web/` only. **One canonical fixture entry point:** `web/fixtures/pom/test-options.ts`. Do not introduce a second `web/fixtures/pages.ts` entry point. UI page objects and API clients are accessed through fixtures; shared contracts and factories stay in `shared/`.

### 4.0 MUST - Web test layer separation

1. **Backend is tested through API only.** Tests in `web/tests/api/` make real authorized API requests to validate business rules, permissions, persistence, and contracts. No browser-driven setup or actions; mocked responses do not count as backend coverage.
2. **Frontend is tested using mock files, with no backend access.** Tests in `web/tests/ui/` exercise the real frontend using deterministic, versioned response files in `web/test-data/mocks/`. No real backend traffic is permitted during actions, authentication, background activity, setup, or teardown. Do not use real API clients or seeders in this layer.
3. **Only web E2E verifies frontend/backend integration.** Tests in `web/tests/journeys/` exercise the real frontend and approved backend together, without mocking application backend interactions. Isolated API setup and cleanup are permitted under the existing safety rules. Keep this suite focused on integrated business outcomes.
4. **Mocked UI fails closed.** Fixture-owned interception must be installed before navigation, serve expected backend interactions from mock files, and block and fail unexpected backend traffic with useful diagnostics. Include same-origin backend routes, authentication, and observed background transports, not just a separate API hostname. Block service workers for this layer and control other observed transports so they cannot bypass isolation. Frontend documents/static assets may load from the approved frontend server. If server rendering needs backend data, use a fixture-backed frontend test server/build so backend access does not occur server-side either. Never fall back to live responses when a mock is missing.
5. **Mocks reflect verified contracts.** Derive sanitized synthetic files from documented or authorized observed contracts; never invent endpoints, payload fields, or behavior. Validate modeled JSON mock payloads against canonical strict schemas. Cover success, empty, validation-error, and failure states as relevant. Mocked success proves frontend behavior only; real API tests validate the backend independently.
6. **Select layers explicitly.** Every web test has exactly one layer tag (`@ui`, `@api`, or `@e2e`) matching its directory, plus exactly one suite tag and useful feature tags. Configure separate layer projects/commands through the canonical fixture entry point. Only UI fixtures install backend mocks; only API/E2E fixtures may expose real backend clients and setup. These rules govern web automation; manual and Maestro execution retain their existing scope.

### 4.1 MUST – Architecture, types, imports

1. Write TypeScript with `strict: true`, no `any`, and no unchecked casts from untrusted API data. Prefer explicit types, `unknown` + validation, and `z.infer<typeof Schema>` for contract types. Put cross-framework types in `shared/`; web-specific types may live in `web/types.ts` or next to the owning feature.
2. Every `*.spec.ts` obtains `test` and `expect` exclusively from `web/fixtures/pom/test-options.ts` (using the correct relative path or a configured alias). Import only the symbols actually needed by a spec. Never import either from `@playwright/test` in spec files. Fixture/config/page-object implementation files may import Playwright APIs and types.
3. Register page objects and typed API clients as Playwright fixtures, composed or re-exported from the canonical file. Receive them as test callback arguments. **Do not write `new SomePage(page)` in specs**; object construction belongs inside fixture definitions.
4. Use one primary Page Object class per meaningful web page or logical screen in `web/pages/`, with reusable UI regions implemented as component objects in `web/pages/components/`. A page object normally contains a `readonly` locator for each important stable element (initialized in its constructor) and descriptive user-action methods (`open`, `search`, `filterJobs`). Use computed locator methods for parameterized/dynamic elements rather than creating huge numbers of fields.
5. Page objects should express user actions and expose state/locators needed for verification. **Business assertions belong in specs**, not buried in page-object actions. A narrow navigation/readiness condition inside a page object is acceptable when it is a clearly documented technical invariant, not a hidden business assertion. Prefer composition over deep inheritance and avoid creating one class for every trivial element.
6. Navigation uses relative paths (`page.goto('/ro/...')` or a centralized route constant); the domain originates from Playwright's `baseURL`, loaded by the shared environment adapter. Avoid hardcoded hosts in specs or page objects.
7. Environment keys that code reads are listed with placeholders in root `.env.example`. Load and validate root `.env` values and shell/CI overrides centrally in `shared/config/load-env.ts`; **do not read `process.env` ad hoc in spec/page-object code**. Use `WEB_BASE_URL` consistently; legacy `TEST_ENV` and `BASE_URL` are unsupported. `.env` and auth storage are gitignored.

### 4.2 MUST – Locale, selectors, synchronization

8. Default test language is **Romanian**: use the `/ro/` routes, `locale: 'ro-MD'` in the Playwright browser context, and Romanian UI names for accessible selectors/assertions. Keep repeatedly used UI strings in `web/constants/ui-text.ts` and routes in `web/constants/routes.ts`. Constants are preferred over TypeScript `enum` for UI copy. Localization/language-switch scenarios may explicitly visit `/ru/`, must be clearly tagged, and should restore Romanian before their final assertion. Do not add an entire parallel Russian regression suite without an explicit requirement.
9. Locator preference: `getByRole()` > `getByLabel()` > `getByPlaceholder()` > `getByText()` > `getByTestId()`. This is a **preference, not a rigid fallback chain**: select the most stable, unique, readable locator. A deliberate `data-testid` contract can be preferable to unstable translated/dynamic text. Scope using role containers, `filter({ hasText })`, or other semantic parent locators.
10. CSS selectors are last resort, kept as short/scoped as possible and accompanied by a reason when unusual. Do not use XPath selectors in new or modified web tests; request an accessibility label or test ID instead. Never depend on generated styling classes or long `nth-child` chains. `.first()`, `.last()`, and `.nth()` are acceptable only when order is a business requirement or stable by design, with a short justification.
11. Prefer Playwright's locator actionability checks and **auto-retrying web-first assertions**: `toBeVisible`, `toHaveText`, `toHaveValue`, `toHaveURL`, `toBeEnabled`, `toHaveCount`, and similar matchers. Do not use `page.waitForTimeout()` or hard sleeps. For explicit network events use `waitForResponse()` with a targeted predicate; for eventually consistent non-UI results use `expect.poll()` with a bounded timeout. Do not replace proper waits with `{ force: true }` or indiscriminate retries.
12. Treat predictable cookie banners and consent flows as ordinary visible setup/actions. Use `page.addLocatorHandler()` sparingly for **truly unpredictable** overlays, registered in a well-scoped fixture with an idempotent handler. Never use it to silently dismiss an overlay that is itself under test; handler actions can change focus and interfere with subsequent interactions.

### 4.3 MUST – API contracts, data, isolation

13. Canonical response schemas live in `shared/api/schemas/`, re-exported from `web/fixtures/api/schemas/`; do **not** create a competing `web/schemas/` tree. For every **JSON response the test intentionally reads or asserts**, validate the documented shape against Zod. Use `z.strictObject()` for modeled API response objects (and nested object contracts) so unexpected fields fail; document intentional dynamic-key objects explicitly (`z.record`, for example). Do not enforce a schema on irrelevant background browser traffic, non-JSON streams or empty `204` bodies.
14. For ordinary successful JSON contract tests, **assert status separately** and follow the existing required convention exactly: `expect(SchemaName.parse(body)).toBeTruthy();`. Parse response JSON as `unknown`. Provide dedicated error/empty-response schemas and assertions when appropriate; never swallow validation errors or silently widen contracts to make a failing test green.
15. When a test explicitly issues **two or more API requests**, give **each request** its own descriptive `test.step()` with the relevant status, schema, and business validation in the same step. Setup/cleanup performed in fixtures must still be validated and safely cleaned up, even though it is not necessarily shown as a spec step. Incidental browser requests do not count toward this rule.
16. Generated names, phone numbers, descriptions and similar values come from typed factories in `shared/data/factories/`, using Faker where useful. Seed Faker or use controlled values when reproducibility matters; derive per-test unique identifiers to avoid collisions. Do not require random data for known boundaries, invalid inputs or reproducible regression cases.
17. Backend response mock files belong in `web/test-data/mocks/`, separate from handwritten case matrices. Curated boundary, invalid-input, search and localization cases belong in `web/test-data/static/*.ts`, normally exported with `as const`. Prefer typed fixtures over opaque arbitrary JSON files **for small handwritten test matrices**. JSON is allowed when it is the genuine payload format, a larger fixture, or a tool-generated artifact, provided it is typed/validated.
18. Each test runs independently and in any order. Use `test.beforeEach`, scoped fixtures and teardown instead of order-dependent shared state. Parallelize only when accounts/data/backends are isolated; enable `fullyParallel: true` where safe, otherwise document and configure intentional serial or limited-worker groups. Use dedicated per-worker accounts for write operations and keep `web/.auth/` untracked.
19. Do not create, edit, delete, or publish real adverts, send messages, register live accounts, or change other users' data on production. Destructive/write tests require a permitted non-production target, disposable credentials, unique test data, and controlled cleanup. **Never enable state-changing tests on production by merely changing `WEB_BASE_URL`.**

### 4.4 MUST – Reporting, tags and verification

20. Tag tests by suite and feature. Every test must have **exactly one suite classification**: `@smoke` **or** `@regression`; additional meaningful tags such as `@search`, `@auth`, `@api`, `@localization` are permitted. Prefer tagging individual tests for clarity, but `test.describe(..., { tag: ... })` is supported and acceptable when all children genuinely share that tag. Avoid conflicting inherited suite tags.
21. Use clear scenario names describing behavior and expected outcome. Use `test.step()` with readable Given / When / Then phrasing for genuinely multi-phase UI journeys and the mandatory per-request API steps; avoid noisy steps for every click or assertion.
22. Configure `baseURL`, `locale`, projects/browsers, test/expect/action timeouts, retries, workers, `forbidOnly`, reporting, trace and failure artifacts centrally in `web/playwright.config.ts`, using shared config. `forbidOnly: true` is mandatory in CI; check/ban committed `test.only` in reviews or lint as well. Keep timeout overrides in configuration/meaningful constants, except clearly documented per-operation needs.
23. After changing a spec, POM, fixture, schema, factory, route or shared test utility, run the affected tests, `npm run typecheck`, and applicable lint/format checks. If the change can affect multiple suites, run their relevant smoke subsets as well. Before calling work complete, report what actually ran and whether it passed; if the target site/browser is unavailable, say **not executed** and identify the blocker. Do not claim success from static review alone.
24. Do not silently delete assertions, downgrade contracts, add blanket `test.skip`, or change tests simply to hide a product defect. A tracked `test.fixme()` or quarantine is permissible only with an explicit issue, reason, owner, review date/exit criterion and user visibility. Prefer reporting a reproducible failure with evidence.

### 4.5 SHOULD – Maintainability

- Use `test.step()` where it improves the report rather than making every assertion a separate step.
- Data-driven tests may iterate a static `as const` case table (`for (const item of CASES) { test(...) }`), creating independent named tests. Ensure distinct titles and avoid conditional control flow that hides which cases ran.
- Document surprising selectors, waits and exception cases with concise **why** comments, not comments that paraphrase code.
- Add JSDoc only for non-obvious public page-object methods, complex parameters, and shared utilities; not for obvious readonly locators.
- Prefer stable test IDs for icon-only, repeated or inaccessible controls, and raise accessibility/testability improvements rather than stacking brittle workarounds.
- Maintain API response schemas intentionally: version or review contract changes, use explicit projections for endpoints with intentionally variable metadata, and preserve `z.strictObject()` for the schema objects the suite promises to validate.

### 4.6 Illustrative code – examples only, not verified rabota.md selectors

`web/pages/search-page.ts` (Page Object pattern):

```ts
import type { Locator, Page } from '@playwright/test';
import { ROUTES } from '../constants/routes';
import { UI_TEXT } from '../constants/ui-text';

export class SearchPage {
  readonly queryInput: Locator;
  readonly submitButton: Locator;

  constructor(private readonly page: Page) {
    this.queryInput = page.getByRole('searchbox', { name: UI_TEXT.searchLabel });
    this.submitButton = page.getByRole('button', { name: UI_TEXT.searchButton });
  }

  async open(): Promise<void> {
    await this.page.goto(ROUTES.search);
  }

  async search(query: string): Promise<void> {
    await this.queryInput.fill(query);
    await this.submitButton.click();
  }
}
```

`web/fixtures/pom/test-options.ts` (the **only** import point for specs):

```ts
import { test as base, expect } from '@playwright/test';
import { SearchPage } from '../../pages/search-page';

type PageFixtures = { searchPage: SearchPage };

export const test = base.extend<PageFixtures>({
  searchPage: async ({ page }, use) => {
    await use(new SearchPage(page));
  },
});

export { expect };
```

`web/tests/ui/search.spec.ts` (fixtures and assertions in specs):

```ts
import { test, expect } from '../../fixtures/pom/test-options';

test('search page exposes its search control',
  { tag: ['@smoke', '@ui', '@search'] },
  async ({ searchPage }) => {
    await test.step('Given the Romanian search page is open', async () => {
      await searchPage.open();
    });
    await test.step('Then the search control is available', async () => {
      await expect(searchPage.queryInput).toBeVisible();
    });
  },
);
```

`web/tests/api/jobs.spec.ts` (contract validation convention; hypothetical API fixture):

```ts
import { test, expect } from '../../fixtures/pom/test-options';
import { JobsResponseSchema } from '../../fixtures/api/schemas';

test('returns a valid jobs response',
  { tag: ['@regression', '@api'] },
  async ({ jobsApi }) => {
    await test.step('GET jobs – validate status and contract', async () => {
      const response = await jobsApi.list();
      expect(response.status()).toBe(200);
      const body: unknown = await response.json();
      expect(JobsResponseSchema.parse(body)).toBeTruthy();
    });
  },
);
```

The UI example requires a fixture that installs verified file-backed backend mocks and fails on unexpected backend traffic before navigation; it is not a complete runnable isolated UI test. The example `jobsApi` fixture, route values, labels, API endpoints and schemas are **illustrative only**. Do not generate a runnable spec using these names until the project and app have been inspected.

## 5. Maestro – MUST

### 5.1 Flow conventions and lifecycle

1. Each **top-level test flow** in `mobile/flows/<feature>/*.yaml` must declare `appId: ${APP_ID}`, a descriptive `name:`, meaningful `tags:`, optional scenario `env:`, then `---` and its commands. Each **subflow** in `mobile/subflows/` must declare an `appId` header and `---`; `name` and `tags` are optional for helpers.
2. Each top-level flow has **one suite tag** (`smoke` **or** `regression`) and **one feature tag** matching its folder (`auth`, `search`, `navigation`, `jobs`, etc.). Add special-purpose tags (`logged-out`, `state-reset`, `destructive`, `flaky`, `android-only`, `ios-only`) only when relevant. Tags are metadata, not a substitute for safe runner guards.
3. All ordinary flows located directly below `mobile/flows/<feature>/` begin with `- runFlow: ../../subflows/launch-app.yaml`. Maestro resolves paths relative to the calling YAML; update relative paths if folder depth changes.
4. `launch-app.yaml` launches the app without clearing data, conditionally dismisses onboarding/permission UI when truly optional, and waits for the appropriate **stable screen readiness marker**. For signed-in home journeys this may be bottom navigation; do **not** make that a requirement for authentication or onboarding tests.
5. **Exception for state reset:** authentication/onboarding flows that need a clean install begin with `- runFlow: ../../subflows/launch-logged-out.yaml`. That helper owns `launchApp: { clearState: true }` and any platform-specific clear-keychain logic. It must not assert the signed-in bottom navigation.
6. Any test that invokes `clearState: true` or the standalone `clearState` command anywhere in its subflow chain **must** carry `logged-out` and `state-reset` tags, and default suite runs must exclude them. Run state-reset tests only against dedicated disposable devices/accounts. Note: iOS app state reset may reinstall the app; iOS keychain cleanup is a separate concern.
7. Reused launch, onboarding, sign-in, search, and navigation interactions belong in focused `mobile/subflows/`. Do not duplicate them across tests or construct a Playwright-style POM in Maestro YAML. Avoid deeply nested subflows and conditional branches that conceal failures.

### 5.2 Selectors and verification

8. Maestro has **no `getByRole()` API**. Prefer stable `id:` selectors (React Native `testID` / Android resource ID / iOS accessibility identifier), then scoped `text:`, then relational selectors (`childOf`, `containsChild`, `containsDescendants`, `below`, `above`, etc.), then `index:`, then `point:`. Combine selector criteria when helpful rather than relying on a fragile global match.
9. `text:` matches visible text or accessibility labels; both `text:` and `id:` are regex-based. Escape regex metacharacters when literal, use `.*` only for intentional partial matching, and `(?i)` only when case-insensitive matching is warranted. Quote YAML regex values safely (single quotes often avoid YAML backslash escaping problems).
10. Default copy-sensitive flows to the supported **Romanian locale** and use Romanian UI labels (for example `'Intră'`, `'Săriți peste'`). Test other locales in explicitly labeled localization scenarios. Do not make `id` depend on UI translation.
11. Prefer built-in retries/waits of `tapOn`, `assertVisible`, and `assertNotVisible`. For known long operations use `extendedWaitUntil` with `visible`/`notVisible` and a **millisecond** `timeout`. Never use arbitrary sleep commands, repeated taps, or unconditional fallback actions to mask a missing readiness condition.
12. `waitForAnimationToEnd` is **allowed narrowly** for genuine screen transitions/animations, with a bounded timeout and preferably followed by an actual state assertion. It must not replace waiting for data or network-driven UI readiness.
13. `point:` taps are last resort; explain why a semantic selector is impossible and record the device/layout constraint. If `index:` is unavoidable, scope the selector and comment why the index is stable. Never silently work around missing IDs on important controls – request a `testID` and use an explicitly documented interim text selector if necessary.
14. Any behavior essential to the tested feature must fail loudly. Use `runFlow.when` / optional actions only for genuinely optional onboarding, banners, and system dialogs; do not mark the primary action or assertion optional.
15. Pass non-secret scenario inputs through the flow's `env:` block and reusable helper parameters through `runFlow.env`. Use `${NAME}` placeholders. Do not overwrite `APP_ID`, `API_BASE_URL`, or other shared-environment values in a flow-level `env:` block. Never hardcode secrets in YAML.
16. Before writing selectors, inspect the app with `maestro hierarchy` or Maestro Studio; verify platform exposure (Android and iOS may differ). After changing a flow, run **that exact flow** on a connected device/simulator using the shared runner or a correctly parameterized `maestro test ...` command. Record the result; if execution is unavailable, explicitly report **not executed** and why.

### 5.3 Maestro workspace and artifacts

17. Keep suite discovery confined to `mobile/flows/` so subflows are never treated as tests. In `mobile/config.yaml`, use at least:

```yaml
flows:
  - 'flows/**'
excludeTags:
  - logged-out
  - state-reset
  - destructive
  - flaky
```

18. The normal runner must preserve those protected exclusions. To execute state-reset/destructive flows, use a **separately named, deliberate opt-in** run on an approved device/account; do not silently remove safety filters in ordinary CI jobs. Maestro's `--include-tags` uses **OR** when multiple tags are passed, not AND.
19. CI must export JUnit with `--format junit --output <path>` and test artifacts using `--test-output-dir <path>`; the runner creates directories and passes config/env/platform/device explicitly. Example CLI form (the TypeScript runner should build the real command):

```bash
maestro test --config mobile/config.yaml \
  --format junit --output reports/mobile/junit.xml \
  --test-output-dir reports/mobile/artifacts \
  -e "APP_ID=$APP_ID" mobile
```

20. Use `takeScreenshot` **only at useful checkpoints** (or for visual assertions), not obligatorily after every flow. Use an artifact-relative name such as `search/results`; never embed `reports/screenshots/...` as though it were a filesystem path relative to the flow. CI failure artifacts are the baseline evidence.
21. Keep OS-specific flows/selectors separate or use documented platform conditions when needed. Validate both Android and iOS behavior; do not assume a React Native `testID` exposes the same identifier until it is inspected on each platform.

**Illustrative regular Maestro flow** – selectors are examples and must be verified in the app:

```yaml
appId: ${APP_ID}
name: Search for QA jobs
tags:
  - smoke
  - search
env:
  SEARCH_QUERY: 'QA Engineer'
---
- runFlow: ../../subflows/launch-app.yaml
- tapOn:
    id: 'bottom_nav.search_button'
- assertVisible:
    id: 'search.input'
- tapOn:
    id: 'search.input'
- inputText: ${SEARCH_QUERY}
- extendedWaitUntil:
    visible:
      id: 'search.results'
    timeout: 15000
- assertVisible:
    id: 'search.results'
```

**Illustrative logged-out flow** – use only a dedicated device and test account:

```yaml
appId: ${APP_ID}
name: Login screen from clean state
tags:
  - regression
  - auth
  - logged-out
  - state-reset
---
- runFlow: ../../subflows/launch-logged-out.yaml
- assertVisible:
    text: 'Intră'
```

## 6. Recommended practices – SHOULD

- Maintain a short test plan and traceability from each high-value user journey (search, filtering, job details, authentication, saved jobs, etc.) to tests. Separate smoke, regression, API contract, negative, accessibility, and localization coverage.
- Prefer unique stable IDs for repeated/icon-only controls and request accessibility improvements from developers rather than accumulating fragile selectors.
- Capture app build number, git SHA, OS/device type, browser project, environment, test-run ID, and relevant feature flags with results.
- Run Playwright checks on PRs and smoke/regression by risk and runtime. Run Maestro smoke on a known device image and full platform/device matrix on a schedule or release gate. Do not parallelize flows on the same shared device/account without isolation.
- Use meaningful assertions after navigation and mutation, not just successful taps or HTTP 200s. Include positive, negative, boundary, access-control, and recovery behavior where applicable.
- Keep `README.md` current with installation, emulator/simulator requirements, `.env` setup, allowed accounts, suite commands, how to opt into state-reset tests, and reporting/triage steps.

## 7. Explicit anti-patterns – AVOID

- Hardcoded environment URLs, universal Android/iOS app IDs, or plaintext secrets in test files.
- `new PageObject(page)` inside Playwright specs; direct `@playwright/test` test/expect imports in specs; duplicate fixture entry points; unvalidated read API JSON; TypeScript `any`.
- Fixed sleeps (`page.waitForTimeout()`, arbitrary Maestro delays); force clicks; repeated taps to get past failed readiness; broad `optional: true` on critical UI steps.
- Playwright `test.only` in committed changes; untracked `test.fixme`/skips; accidental suite-tag inheritance; unconditional `fullyParallel` despite shared state.
- Throwaway HTML dumps, exploratory specs, debug scripts, screenshots, or temporary files committed after investigation. Keep useful observations in maintained documentation instead.
- Recreating the same factories, API schemas, UI text catalog or environment settings under multiple conflicting paths.
- Maestro coordinate taps / unscoped indices without written justification; guessed native IDs or generated UI text that was never observed.
- Sharing accounts, device auth state, or mutated backend data between independent tests; production/destructive execution by default.
- Treating Maestro JavaScript as Node.js/TypeScript, or duplicating shared contracts/data factories just to bypass runtime boundaries.
- Adding an unreviewed flaky-test retry or reporting success without a real execution result.

## 8. Definition of done for a new or changed test

- [ ] Correct file location, naming, tags (one suite tag plus useful feature tags), and scope.
- [ ] Environment and app identifiers loaded from validated shared configuration.
- [ ] No secrets, production state mutation, or shared-account dependencies.
- [ ] Playwright fixture / Maestro launch-subflow conventions followed; no competing fixture entry points.
- [ ] Selectors observed and appropriate to the framework/platform.
- [ ] Deterministic business assertions; no arbitrary sleeps or hidden failures.
- [ ] Web layer matches its directory and tag: API-only backend, mocked frontend without backend access, or real integrated E2E.
- [ ] API calls and mock payloads appropriately validated; real-backend test data cleaned up where applicable.
- [ ] No temporary exploration files, debug-only code, or `.only` calls remain.
- [ ] Formatter/linter/types or YAML checks executed as applicable.
- [ ] Playwright changes verified against Romanian locale and correct relative routes; data-driven cases are reproducible.
- [ ] Changed flow/spec executed in the intended target, or clearly marked **not executed** with a reason.
- [ ] Report/artifacts available for failures; any intentional exception documented.

## 9. Official references

- [Playwright fixtures](https://playwright.dev/docs/test-fixtures)
- [Playwright page object models](https://playwright.dev/docs/pom)
- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright tags and annotations](https://playwright.dev/docs/test-annotations)
- [Playwright auto-retrying assertions](https://playwright.dev/docs/test-assertions)
- [Playwright test configuration](https://playwright.dev/docs/test-configuration)
- [Playwright unexpected overlay handlers](https://playwright.dev/docs/api/class-page#page-add-locator-handler)
- [Zod strict object schemas](https://zod.dev/api#strictobject)
- [Maestro flow syntax](https://docs.maestro.dev/maestro-flows)
- [Maestro selectors](https://docs.maestro.dev/reference/selectors/core-selectors)
- [Maestro discovery and tags](https://docs.maestro.dev/maestro-flows/workspace-management/test-discovery-and-tags)
- [Maestro environment variables](https://docs.maestro.dev/maestro-flows/flow-control-and-logic/parameters-and-constants)
- [Maestro waits](https://docs.maestro.dev/maestro-flows/flow-control-and-logic/wait-commands)
- [Maestro reports and artifacts](https://docs.maestro.dev/maestro-flows/workspace-management/test-reports-and-artifacts)
