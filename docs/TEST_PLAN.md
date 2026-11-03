# QA Test Plan – Rabota.md

**Scope:** Desktop website and native mobile apps  
**Testing approach:** Manual and automation testing  
**Version:** 1.0

**Governing rules:** [AGENTS.md](../AGENTS.md) defines the canonical architecture and engineering constraints. This document defines manual and automated coverage goals. Framework implementation starts with Phase 1: the Playwright web foundation.

**Objective:** Build a structured, risk-based testing strategy for Rabota.md that validates functionality, usability, security, performance, and consistency across desktop browsers, Android, and iOS.

The plan will use TypeScript + Playwright for web and API automation, and Maestro for native mobile end-to-end testing.

The capabilities and platform matrix below are proposed coverage pending application inspection. Record verified behavior, build/environment, inspection date, and supporting requirements in `docs/specifications/`. Do not derive selectors, API contracts, app identifiers, or supported capabilities from this inventory alone.

## 1. Application scope

Rabota.md is a job-search and recruitment platform supporting candidates and employers. Its key features include job search, advanced filters, Smart CV creation, job applications, notifications, and employer recruitment services. The mobile apps also offer job discovery, saved jobs, and application-related functionality.

### Desktop website

https://www.rabota.md

- Chrome, Firefox, Edge, Safari
- Candidate and employer journeys
- UI, functional, API, security and accessibility checks

### Native mobile applications

- Android: Google Play
- iOS: App Store

- Android and iPhone
- Native navigation and app lifecycle
- Notifications, permissions, maps and deep links

Verify the Android and iOS distribution links, supported builds, and release notes during discovery. Chat, map search, and links opened from other applications are proposed regression areas where confirmed in the selected build.

### Testing priorities

| Priority | Features | Rationale |
| --- | --- | --- |
| P0 – Critical | Login, registration, job search, city and combined filters, job details, CV submission, applying for jobs | Core user journeys |
| P1 – High | Other filters, saved jobs, Smart CV, notifications, messaging, user profile, localization, mobile maps, employer registration and vacancy creation | Frequently used and business-critical |
| P2 – Medium | Company profiles, advanced subscriptions, other employer tools | Supporting workflows |
| P3 – Low | Minor UI details, informational pages, cosmetic issues | Low direct business impact |

P0 and P1 are the initial automation targets. Employer publishing, payment, and candidate-management workflows should be included once a dedicated employer test account and safe testing environment are available.

## 2. Shared functional coverage: manual and automation

Manual testing should begin with the most important user journeys and then expand into negative scenarios, UI validation, compatibility, accessibility, and exploratory testing.

### 2.1 Desktop web – functional test scenarios

Verify search filters for location, salary, publication date, workplace type, schedule, and category, along with candidate CV registration, employer registration, and email subscription workflows before creating executable cases.

| ID | Test scenario | Priority | Expected result |
| --- | --- | --- | --- |
| WEB-001 | Open homepage | P0 | Page loads with functional navigation and search |
| WEB-002 | Search using a valid keyword | P0 | Relevant job results appear |
| WEB-003 | Search using a nonexistent keyword | P1 | Appropriate empty-state message appears |
| WEB-004 | Filter jobs by city | P0 | Results match selected location |
| WEB-005 | Combine salary, city and remote filters | P0 | Results satisfy all selected filters |
| WEB-006 | Open a vacancy | P0 | Correct title, employer and vacancy details appear |
| WEB-007 | Register a candidate account | P0 | Account is created after required verification |
| WEB-008 | Login with valid and invalid credentials | P0 | Valid login succeeds; invalid login is rejected |
| WEB-009 | Create, edit and upload a CV | P0 | CV is saved correctly and accessible in the profile |
| WEB-010 | Apply for a vacancy | P0 | Application is submitted and confirmation appears |
| WEB-011 | Save and remove a job | P1 | Saved state persists correctly |
| WEB-012 | Subscribe to job email alerts | P1 | Subscription and confirmation work correctly |
| WEB-013 | Reset account password | P1 | Password reset follows the expected secure workflow |
| WEB-014 | Switch website language RO/RU | P1 | Content and navigation update appropriately |
| WEB-015 | Register an employer and create a vacancy | P1 | Permitted vacancy workflow works correctly |
| WEB-016 | Session timeout and logout | P1 | Session and protected content are handled securely |

All scenarios should include positive, negative, and boundary-value tests where relevant. These IDs represent coverage groups, not individual executable test cases. Split combined behaviors into independently executable cases linked to their parent ID.

Each detailed case records requirement/source, platform, priority, preconditions, synthetic test data, steps, expected outcomes, cleanup, and evidence. Track manual execution status separately from automation suitability and implementation status. An automated result does not replace manual usability, exploratory, accessibility, or real-device assessment.

For example, WEB-010 should cover successful application, submission without a CV, duplicate submissions, expired vacancies, failed network responses, and whether the candidate can see the application afterward.

### 2.2 Native mobile – functional test scenarios

Run the following scenarios separately for Android and iOS, recording results by platform and OS version.

| ID | Test scenario | Priority | Expected result |
| --- | --- | --- | --- |
| MOB-001 | Install and launch the app | P0 | App launches without crashing |
| MOB-002 | Search jobs using a keyword | P0 | Correct results are displayed |
| MOB-003 | Apply city and salary filters | P0 | Results update accurately |
| MOB-004 | Open job details and return to search | P0 | Correct vacancy opens and search state is retained |
| MOB-005 | Register and log in | P0 | Authentication works correctly |
| MOB-006 | Apply for a vacancy using a CV | P0 | Application is submitted |
| MOB-007 | Save a job to favorites | P1 | Job remains saved after reopening |
| MOB-008 | Open a job from a deep link | P1 | App navigates to the correct job |
| MOB-009 | Receive and open a push notification | P1 | Correct notification and destination appear |
| MOB-010 | Search for jobs on the map | P1 | Results correspond to selected location |
| MOB-011 | Send and receive a chat message | P1 | Messages display and synchronize |
| MOB-012 | Background and resume the application | P1 | App preserves appropriate state |
| MOB-013 | Test offline and unstable network conditions | P1 | Errors are handled without crashes |
| MOB-014 | Deny and later grant location permissions | P1 | App handles permission changes |
| MOB-015 | Update an installed app | P1 | Existing account and saved data are preserved |

### 2.3 Cross-platform testing

| Area | Desktop | Android | iOS |
| --- | --- | --- | --- |
| Search and filters | Yes | Yes | Yes |
| Candidate login | Yes | Yes | Yes |
| Job details | Yes | Yes | Yes |
| CV submission | Yes | Yes | Yes |
| Favorites synchronization | Yes | Yes | Yes |
| Notifications | Email/browser as supported | Push | Push |
| Deep links | URL navigation | Android App Links | Universal Links |
| Background/resume | Browser state | App lifecycle | App lifecycle |
| Maps/location | As supported | Yes | Yes |
| Employer workflows | Full applicable scope | As supported | As supported |

A particularly important cross-platform scenario uses a dedicated disposable account to save a controlled job on the desktop website, open the app using that same account, and verify that the saved job appears. This is one self-contained synchronization scenario with owned setup and cleanup, not a dependency between separately executed tests. Repeat for removing a saved job, updating a CV, and viewing applications where those capabilities exist on both platforms.

### 2.4 Non-functional manual testing

Usability and accessibility: Verify keyboard navigation, visible focus indicators, readable contrast, accessible labels, screen-reader compatibility, large text, and understandable validation messages. Test web accessibility against WCAG 2.2 AA as a target.

Performance: Evaluate slow pages, long job lists, image loading, app cold starts, search responsiveness, and behavior on slower mobile networks.

Security and privacy: Validate unauthorized access handling, session expiration, role permissions, safe CV upload validation, privacy controls, and secure display of personal data. Use only authorized environments for security testing.

Localization: Use Romanian as the default for manual and automated coverage; Playwright uses `ro-MD` and verified `/ro/` routes. Cover Russian content and Cyrillic terms in targeted localization scenarios, not a duplicate Russian regression suite. Web language-switch tests restore Romanian before their final assertion. Include diacritics, salary display, and long translated text.

Exploratory testing: Reserve dedicated sessions for unexpected behavior, interrupted application submissions, rapid filter changes, navigation edge cases, and transitions between web and mobile.

## 3. Test environment and coverage matrix

### Desktop browsers

| Coverage | Configuration |
| --- | --- |
| Primary | Chrome – Windows |
| Secondary | Firefox and Edge – Windows |
| Safari | macOS |
| Viewport checks | 1366×768, 1440×900, 1920×1080 |

### Native mobile devices

| Area | Coverage |
| --- | --- |
| Android | Representative Samsung and Pixel devices; latest, previous and oldest supported Android versions |
| iOS | Representative iPhones; minimum supported and selected newer versions verified against the chosen app build |
| Network | Wi-Fi, cellular, offline and high-latency conditions |
| Orientation | Portrait and landscape where supported |

Record exact browser, OS, device, and app build versions before execution. Playwright Chromium/Firefox/WebKit results describe their tested engines; WebKit execution does not certify branded Safari. Validate Safari manually on macOS, and record explicit Chrome/Edge channel coverage when those branded browsers are tested.

Use emulators and simulators for repeatable regression testing, supplemented by at least one physical Android and one physical iPhone for notifications, permissions, performance, and real-world interaction.

## 4. Automation testing strategy

### Recommended automation architecture

| Layer | Technology or responsibility |
| --- | --- |
| Language and frameworks | TypeScript + Playwright + Maestro |
| CI/CD pipeline | GitHub Actions, using `.github/workflows/` |
| Web UI and API | Playwright |
| Android and iOS E2E | Maestro |
| QA / staging environment | Controlled test accounts, vacancies and API data |
| Reports and artifacts | HTML reports, screenshots, video, traces and logs |

### Web automation coverage layers

| Layer | Location and tag | Backend access | Purpose |
| --- | --- | --- | --- |
| Backend API | `web/tests/api/`, `@api` | Real authorized API requests; no browser actions | Backend rules, validation, permissions, persistence, and contracts |
| Frontend UI | `web/tests/ui/`, `@ui` | None; use files in `web/test-data/mocks/` | Rendering, interaction, and state handling for controlled responses |
| Web E2E | `web/tests/journeys/`, `@e2e` | Real frontend and approved backend together | Integrated business outcomes |

Each web test has exactly one layer tag and one suite tag (`@smoke` or `@regression`). Only E2E verifies frontend/backend integration. Manual execution and native Maestro testing retain their existing scope.

UI fixtures load verified mock files before navigation and block and fail unexpected backend traffic, including background activity and setup/teardown. Do not call real API clients or seeders. Control service workers and other observed transports; server-rendered data requires a fixture-backed frontend test build/server. Frontend documents and static assets may load, but backend access is forbidden. Missing mocks never fall back to live responses. Validate modeled mock payloads against canonical strict schemas. E2E uses no application backend mocks and may use isolated API setup/cleanup. See AGENTS.md section 4.0 for enforcement rules.

### 4.1 Desktop web automation – Playwright

Automate stable, high-value workflows first. Use fixture-based dependency injection through `web/fixtures/pom/test-options.ts`; compose reusable UI components, keep business assertions in specs, and follow the selectors and synchronization rules in AGENTS.md. Every Playwright test has exactly one suite tag (`@smoke` or `@regression`) plus feature tags; P0/P1 are business priorities, not additional suite classifications.

Phase A – Web foundation and smoke suite: Set up pinned dependencies, a committed npm lockfile, strict TypeScript, lint/format/type checks, shared validated configuration, canonical fixtures, reporting, and quality/PR smoke CI. Inspect the application before implementing homepage, search, and job-detail checks. Frontend login/profile states use verified mock files without live accounts. Add real login/profile E2E only when dedicated accounts and deterministic authentication are available. Enforce backend isolation in the UI fixture; real integrated browser checks belong in E2E.

Phase B - Regression suite: Expand file-mocked frontend coverage for filters, account validation, saved jobs, CV management, applications, and selected employer workflows. Validate backend rules separately through API tests; add a small real E2E set for integration risks.

Phase C – Advanced automation: Cross-browser regression, accessibility checks, selected visual regression, API integration testing, and data synchronization.

Recommended practices include Page Object Models for reusable page interactions, stable locators such as getByRole() or data-testid, isolated test data, controlled authentication state, and trace capture on failure.

### 4.2 API automation – Playwright APIRequestContext

Backend testing uses API requests only, without browser actions or mocked backend responses. Once authorized API specifications or observed application contracts are available, cover:

| API area | Tests |
| --- | --- |
| Authentication | Valid/invalid authentication, unauthorized requests, session handling |
| Job search | Query parameters, filters, pagination, malformed input |
| Vacancy details | Valid IDs, nonexistent IDs, expired or removed jobs |
| Favorites | Create, fetch, delete, duplicate operations |
| CV and applications | Field validation, ownership checks, submission results |
| Profile | Read/update permissions, validation, unauthorized access |
| Notifications and messaging | Delivery state, access control, invalid payload handling |

Avoid inventing API endpoints. Record documented or authorized, observed contracts first, then build tests around their actual requests, response schemas, and permissions. Typed clients live in `shared/api/clients/`; strict Zod contracts live in `shared/api/schemas/` and are re-exported from `web/fixtures/api/schemas/index.ts`. Follow AGENTS.md for status assertions, parsing JSON as `unknown`, the required schema assertion convention, and per-request steps.

### 4.3 Native mobile automation – Maestro

Maestro is appropriate for user-facing mobile flows such as searching, navigating, saving jobs, logging in, and applying for vacancies.

Implement these candidate flows incrementally after platform inspection and setup prerequisites are met. Ordinary mobile runs preserve the protected exclusions in AGENTS.md. State-reset authentication flows require `logged-out` and `state-reset` tags and a separate deliberate run against dedicated devices/accounts.

| Automation ID | Flow | Platforms |
| --- | --- | --- |
| MAESTRO-001 | App launch and home screen | Android + iOS |
| MAESTRO-002 | Keyword search | Android + iOS |
| MAESTRO-003 | Search with filters | Android + iOS |
| MAESTRO-004 | Open vacancy details | Android + iOS |
| MAESTRO-005 | Login and logout | Android + iOS |
| MAESTRO-006 | Save and remove a job | Android + iOS |
| MAESTRO-007 | Submit a job application | Android + iOS |
| MAESTRO-008 | Reopen app and verify persisted state | Android + iOS |
| MAESTRO-009 | Open a vacancy via deep link | Android + iOS |
| MAESTRO-010 | Negative login and error handling | Android + iOS |

Automate real notification delivery and complex messaging flows only after the test environment can trigger them deterministically. Continue to validate push permissions and real device behavior manually.

For execution, request installable Android test builds and iOS simulator-compatible builds. iOS simulator automation requires a compatible macOS runner. Stable accessibility identifiers will make Maestro flows more reliable.

### 4.4 Canonical automation project structure

The architecture in AGENTS.md is authoritative. Create these paths as needed by the active phase; this tree does not imply existing implementation.

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

Use TypeScript for Playwright and shared Node tooling, and YAML for Maestro flows. API specs live in `web/tests/api/`; suite membership uses tags rather than a separate smoke directory. Shared contracts, clients, and data stay in `shared/`. Maestro helpers stay in `mobile/subflows/`, outside test discovery. No separate root API suite or `mobile/maestro/` tree is introduced.

## 5. CI/CD and execution schedule

| Trigger | Test suite | Purpose |
| --- | --- | --- |
| Every pull request | Mocked UI smoke + API smoke + eligible E2E smoke | Fast regression feedback |
| Every staging deployment | P0 API + web E2E integration + mocked UI | Release candidate validation |
| Nightly | Separate UI, API, E2E regression + Android/iOS Maestro suite | Detect broader regressions |
| Weekly | Cross-browser, selected real-device and accessibility checks | Compatibility validation |
| Before release | All P0/P1 automation + targeted manual regression | Release acceptance |

This schedule is the target after each suite is implemented and its prerequisites are met. Phase 1 requires quality checks and verified file-mocked UI smoke; eligible integration checks run separately as E2E. Use separate UI/API/E2E jobs with layer-identifiable reports; API/mobile jobs become required as their coverage is delivered. Protected mobile exclusions remain in ordinary CI runs; state-reset and destructive coverage use separately named opt-in jobs. Missing prerequisites must be reported as blocked/not executed, not as a passing suite.

Test results should include a reproducible failure report, redacted screenshots or traces, build identifiers, environment details, and links to associated defects. Store HTML, JUnit, traces, and failure artifacts under `reports/web/` or `reports/mobile/`; do not commit generated reports or authentication state.

## 6. Test data and dependencies

Mocked frontend tests simulate changes using files without modifying backend data. The following requirements concern real-backend API, web E2E, mobile, and manual execution. An approved non-production environment with disposable accounts, controlled data, and cleanup is required for state-changing tests, including registration, CV/profile changes, applications, saved jobs, subscriptions, messaging, and employer publishing. Use a unique run/test identifier and fixture teardown or `finally` cleanup restricted to owned data. These restrictions apply to manual execution as well as automation. Never enable writes to production through a URL override.

All runners consume shared typed configuration loaded once from root `.env`, with shell/CI variables taking precedence. Require only verified values needed by the implemented runtime, as specified in AGENTS.md. Web uses `WEB_BASE_URL` and `TEST_LOCALE`; public read-only execution additionally requires `ALLOW_PRODUCTION_READ_ONLY=true`. Future API/mobile support must validate its required values when implemented. There is no default target URL. Credentials come from ignored local `.env` or CI secret injection, not committed configuration. `TEST_ENV` and parallel JSON environment files are no longer used.

Prepare the following fixtures:

- Candidate accounts – new, verified, unverified, and accounts with completed CVs.
- Employer accounts – authorized to publish and manage test vacancies.
- Job data – active, expired, remote, hybrid, salaried, unsalaried, and jobs in different cities.
- CV files – valid PDF/DOCX, oversized files, unsupported formats, and test records containing synthetic personal data.
- Notification test configuration – email inboxes, push tokens, and deterministic notification triggers.
- Test application builds – Android package, iOS simulator build, app identifiers, and staging API configuration.

The source draft reports bot-verification protection on a listing page; this is an unverified historical observation until reproduced with dated evidence. Use an approved staging environment or authorized test configuration; do not bypass production anti-bot controls.

## 7. Proposed implementation roadmap

### Week 01: Discovery and manual test design

Map web and app functionality, verify account roles, prepare test data, document the initial manual test suite, and identify release risks.

Deliverables: test strategy, scenario catalog, environment matrix

### Week 02: Manual execution and web automation

Execute eligible P0/P1 manual cases, implement the Phase A Playwright foundation and verified web smoke tests, and enable quality/PR smoke CI. Begin API coverage only when contracts and environment access are verified.

Deliverables: first defect report, Playwright smoke suite

### Week 03: Mobile automation and integration

Configure Maestro, implement Android and iOS core flows, test cross-platform consistency, and expand Playwright regression.

Deliverables: Maestro smoke flows, integration test results

### Week 04: CI/CD, stabilization and reporting

Extend the existing CI with eligible API/mobile suites, investigate flaky tests without hiding failures, execute implemented regression coverage, and summarize risks and coverage gaps.

Deliverables: CI pipeline, consolidated QA report, release checklist

This is an indicative four-week initial implementation for one experienced QA automation engineer with development support and access to staging infrastructure. Limited access to mobile test builds, APIs, or employer accounts can extend the schedule.

## 8. Quality metrics and release criteria

Use the following as proposed initial targets, then adjust them after the first testing cycle.

| Metric | Proposed target | Meaning |
| --- | --- | --- |
| P0 scenario coverage | 100% | All critical scenarios executed |
| P0 automation coverage | 90% | At least 90% of suitable critical flows |
| P1 automation coverage | 70% | At least 70% of suitable high-priority flows |
| Automated run stability | 98% | Pass reliability in a controlled, healthy environment |

Proposed targets, not measured Rabota.md results. Measure coverage against the agreed detailed case catalog, with automation suitability documented and exclusions justified. Report blocked/not-executed cases separately; they do not count as covered execution. Report stability separately from product pass rate, with an explicit observation window and rerun history. These program targets do not block delivery of the initial web foundation.

Release acceptance should additionally require zero unresolved critical defects, no unaccepted high-severity defects affecting core flows, documented results for Android and iOS, and a completed regression report.

## 9. Final deliverables

At completion of the initial testing program, the QA project should contain:

- Manual test plan and scenario inventory, with priority, preconditions, test steps, expected results, and execution status.
- Requirement-to-test traceability matrix and defect reports.
- Playwright TypeScript web and API automation repository.
- Maestro Android/iOS flows in the same automation repository.
- CI/CD execution configuration and test reports.
- Device/browser compatibility matrix, known issues, and release readiness summary.

### Recommended starting point

First implement the Phase A Playwright web foundation and inspect the Romanian application. Begin with independent homepage, search, and job-detail frontend cases using verified mock files and enforced backend isolation. Test backend behavior separately through APIs. Approved public read-only browser checks that use the real backend are E2E, not isolated UI; assert stable structural behavior and record live-content limitations.

Explore the full candidate journey manually only after disposable accounts, controlled vacancies, and an approved non-production target are available. Later automate frontend behavior using file-backed mocks, backend behavior through APIs, and a small set of independent real E2E scenarios with fixture-owned setup and cleanup. Cross-platform synchronization checks are separate self-contained scenarios; no test depends on another test's execution or shared device authentication.

The next coverage artifact is a detailed case catalog under `docs/specifications/`, with linked Web, API, Android, and iOS cases and separate manual and automation statuses. Application-specific implementation requires verified routes, accessible selectors, expected outcomes, and relevant contracts. Missing access or builds blocks only the affected capability, not tooling and configuration implementation.
