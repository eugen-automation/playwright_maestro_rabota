# Repository architecture

This is the target project layout. Verify a path exists before using it; planned
paths are not proof of implemented tests or verified product capability.

```text
automation/
├── AGENTS.md
├── README.md
├── package.json
├── .env.example
├── docs/
│   ├── ARCHITECTURE.md
│   ├── STATUS.md
│   ├── TEST_PLAN.md
│   ├── TEST_CASES.md
│   └── DECISIONS.md
├── shared/
│   ├── config/                 # validated environment configuration
│   ├── api/
│   │   ├── clients/
│   │   └── schemas/
│   ├── data/                   # factories, fixtures, future seeders
│   └── utils/
├── web/
│   ├── AGENTS.md
│   ├── playwright.config.ts
│   ├── fixtures/pom/test-options.ts
│   ├── fixtures/api/schemas/    # re-exports shared schemas
│   ├── pages/
│   ├── constants/
│   ├── test-data/
│   └── tests/
│       ├── api/
│       ├── ui/
│       └── journeys/
├── mobile/
│   ├── AGENTS.md
│   ├── config.yaml
│   ├── flows/
│   ├── subflows/
│   └── scripts/
├── scripts/
│   ├── check-docs.ts
│   └── run-mobile.ts
└── reports/                    # generated and ignored
```

## Runtime boundaries

- Playwright specs use the canonical fixture entry
  `web/fixtures/pom/test-options.ts`; do not create `web/fixtures/pages.ts`.
- Canonical API contracts live in `shared/api/schemas/`; do not create a competing
  `web/schemas/` tree.
- API specs live in `web/tests/api/`, isolated UI specs in `web/tests/ui/`, and
  integrated journeys in `web/tests/journeys/`.
- Maestro top-level flows live in `mobile/flows/`; reusable helpers live in
  `mobile/subflows/`; Maestro-compatible JavaScript lives in `mobile/scripts/`.
- Shared Node/TypeScript setup and cleanup run outside Maestro YAML.
- Reports and authentication state remain ignored. Do not commit secrets, raw
  live captures, session state, or personal-device evidence.

See [AGENTS.md](../AGENTS.md) for engineering rules and
[TEST_PLAN.md](TEST_PLAN.md) for strategy and release governance.
