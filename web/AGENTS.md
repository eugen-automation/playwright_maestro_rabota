# Playwright rules

Applies to `web/`; [root rules](../AGENTS.md) take priority. Shared API contracts,
clients and factories remain in `shared/`. Current priorities belong in the test
plan rather than this permanent framework policy.

## Layers and fixtures

| Directory / layer tag      | Responsibility                                                    | Backend traffic                                                |
| -------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------- |
| `tests/api/` / `@api`      | Backend rules, contracts, validation, permissions and persistence | Real authorized requests only; no browser-driven setup/actions |
| `tests/ui/` / `@ui`        | Real frontend rendering and interaction                           | None; verified file-backed responses only                      |
| `tests/journeys/` / `@e2e` | Selected integrated outcomes                                      | Approved real frontend/backend; no application backend mocks   |

- Every spec imports `test` and `expect` only from `fixtures/pom/test-options.ts`
  (correct relative path or configured alias). Import only needed symbols. Only
  implementation/config/POM files may import Playwright APIs/types directly.
- Construct POMs in fixtures composed through that single entry and receive them
  as callback arguments; never `new PageObject(page)` in specs. Expose shared or
  lifecycle-owned typed API clients through fixtures; a focused test-local helper
  may remain local when fixture lifecycle or reuse adds no value. API tests use
  isolated request contexts without browser/auth UI setup.
- Every web test has exactly one matching layer tag and exactly one suite tag,
  `@smoke` or `@regression`, plus useful feature tags. Inherited describe tags are
  allowed when all children share them; avoid conflicting inherited suite tags.
- Only UI fixtures install backend mocks; only API/E2E may expose live clients
  and real setup. E2E may use validated, isolated API setup/cleanup.

## Isolated frontend

- Install fixture-owned interception before navigation. Serve known backend
  interactions from `test-data/mocks/`; block **and fail** unexpected traffic
  with diagnostics. Never fall back to live responses or use live clients/seeders.
- Include same-origin backend/auth/background routes, not just an API hostname.
  Block service workers and control observed WebSockets/other transports.
- Approved frontend documents/static assets may load. If server rendering needs
  data, use a maintained fixture-backed real frontend build/server so server-side
  backend access is isolated too. A handwritten imitation frontend is not coverage.
- Derive sanitized synthetic files from verified contracts and validate modeled
  JSON against shared strict schemas. Cover relevant success, empty, validation
  and failure presentation. Mocked success does not prove backend correctness.

## API responses and test data

- Canonical schemas: `shared/api/schemas/`, re-exported from
  `web/fixtures/api/schemas/index.ts`. No competing `web/schemas/` tree.
- Validate every intentionally read/asserted JSON response as `unknown` with Zod.
  Use `z.strictObject()` for modeled objects including nested contracts; explicitly
  document dynamic-key `z.record` objects or projections of variable metadata.
  Derive types with `z.infer`; never widen a contract just to make a test pass.
- Assert successful status separately, parse the body with the applicable schema,
  and make a meaningful business assertion against the parsed result. A successful
  `parse()` does not need a ceremonial truthiness matcher. Use dedicated error/empty
  schemas where appropriate. Do not parse empty 204, irrelevant background traffic,
  or non-JSON streams as JSON contracts.
- If a test explicitly makes two or more API requests, **each** gets a descriptive
  `test.step()` containing status, applicable schema and business assertions.
  Validate fixture setup/cleanup too. Incidental browser traffic does not count.
- Keep typed handwritten boundary/search/localization cases in
  `test-data/static/*.ts` (`as const`), separate from genuine mock payload files.
  JSON is appropriate for real payload formats/larger generated fixtures when
  validated. Generated business inputs come from shared reproducible factories.
- Maintain tests in any order with scoped fixtures/beforeEach and teardown.
  Use per-worker disposable accounts for writes; keep `.auth/` ignored.

## POMs, locale and locators

- One primary class per meaningful page/screen in `pages/`; reusable regions in
  `pages/components/`. Prefer composition, readonly stable locators and action
  methods; use computed locators for dynamic elements, not huge field catalogs.
- Keep business assertions in specs. A documented technical navigation/readiness
  invariant in a POM is acceptable. Avoid classes for trivial elements.
- Use relative `constants/routes.ts` paths with configured `baseURL`. Default to
  `/ro/`, `ro-MD` and Romanian accessible names; shared copy in `constants/ui-text.ts`.
  Tag targeted `/ru/` localization tests and restore Romanian before the final
  assertion; no duplicate Russian regression suite without a requirement.
- Prefer `getByRole` > `getByLabel` > `getByPlaceholder` > `getByText` >
  `getByTestId`, choosing stability/uniqueness over a rigid ranking. Deliberate
  test IDs can be better for repeated/icon-only or unstable translated controls.
  Scope locators to semantic containers; request accessibility/testability fixes.
- CSS is a short, scoped last resort; justify unusual selectors. No XPath,
  generated styling classes or long nth-child chains. `.first/.last/.nth` require
  stable-by-design/business ordering and a short reason.
- Prefer actionability and retrying web-first assertions. Use targeted
  `waitForResponse` or bounded `expect.poll` for genuine eventual state. No hard
  sleeps, `waitForTimeout`, force actions or indiscriminate retries.
- Handle predictable consent/banners explicitly. `addLocatorHandler` is only for
  unpredictable overlays, scoped/idempotent and never dismissing the feature
  under test; its actions may alter focus.

## Configuration and review

- Centralize baseURL, locale, projects, test/expect/action/navigation timeouts,
  retries, workers, reports, trace and failure artifacts in `playwright.config.ts`
  using shared config/named settings. Document per-operation timeout exceptions.
  Enable `fullyParallel` only with isolation; `forbidOnly` is mandatory in CI and
  committed `test.only` is prohibited everywhere.
- Use clear behavior/outcome titles. Use Given/When/Then steps for multi-phase
  journeys and mandatory per-request API steps, not every click/assertion.
  Data tables create independently named tests; avoid conditional hidden cases.
- Add concise why-comments for surprising selectors/waits/exceptions; JSDoc only
  for non-obvious public methods/complex utilities. Preserve contracts intentionally.
- Follow root verification rules after changes: affected tests and relevant smoke
  when permitted, plus typecheck/lint/format. Report unexecuted checks and blockers.

References: [API testing](https://playwright.dev/docs/api-testing),
[fixtures](https://playwright.dev/docs/test-fixtures),
[POMs](https://playwright.dev/docs/pom), [locators](https://playwright.dev/docs/locators),
[annotations](https://playwright.dev/docs/test-annotations),
[assertions](https://playwright.dev/docs/test-assertions),
[configuration](https://playwright.dev/docs/test-configuration),
[overlay handlers](https://playwright.dev/docs/api/class-page#page-add-locator-handler),
[strict Zod schemas](https://zod.dev/api#strictobject).
