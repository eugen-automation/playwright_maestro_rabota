# Repository architecture

This is the target layout; create paths only when their runtime needs them.
Directories in this diagram are not evidence of implemented tests or verified
application contracts. Shared rules: [AGENTS.md](../AGENTS.md).

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
│   ├── ARCHITECTURE.md
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
│   ├── AGENTS.md
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
│   ├── AGENTS.md
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

Playwright specs live in `web/tests/api/`, `web/tests/ui/` and
`web/tests/journeys/`. All specs import `test`/`expect` from the single
`web/fixtures/pom/test-options.ts` entry. Never add `web/fixtures/pages.ts`,
`web/schemas/`, a second root API suite, or `mobile/maestro/`.

Clients, strict response schemas and cross-framework types/factories belong in
`shared/`. Re-export schemas from `web/fixtures/api/schemas/index.ts`; web-only
types can stay with the feature or in `web/types.ts`. Endpoint constants belong
with their owning API service; locale-aware web routes and UI text live in
`web/constants/`.

Maestro test YAML lives in `mobile/flows/`, helpers in `mobile/subflows/`, and
runtime-compatible JS in `mobile/scripts/`. Node/TypeScript seed/cleanup and the
mobile runner live outside Maestro in `shared/`/`scripts/`. Never build a web POM
for Maestro or duplicate shared API contracts to bypass runtime boundaries.

Keep generated reports/authentication state ignored. Framework rules are in
[web/AGENTS.md](../web/AGENTS.md) and [mobile/AGENTS.md](../mobile/AGENTS.md).
