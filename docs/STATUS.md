# Current automation status

Last reviewed: **2026-11-10**. This is the current-state summary; it is not a
release certification or authorization to run gated tests.

| Area                    | Current state                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| Synthetic foundation    | 29 local tooling tests passed on 2026-11-10                                                |
| Public API              | 12 read-only cases implemented; latest recorded run: 11 passed, 1 failed                   |
| Authentication API      | 3 cases implemented but blocked and unexecuted pending approved non-production access/data |
| Isolated web UI         | No application specs or maintained fixture-backed frontend; not ready                      |
| Registration markup E2E | 1 GET-only scenario; historical Windows four-browser pass only                             |
| Android Maestro         | 6 public read-only flows; historical pass only on one selected device/build                |
| iOS                     | Deferred; no supported device/simulator                                                    |
| CI                      | Deferred; workflow templates are inactive                                                  |

## Open risks

- `DEC-API-001`: whitespace autocomplete behavior lacks an approved product oracle.
- No controlled environment, disposable identities, owned data, or cleanup exists
  for state-changing or authentication coverage.
- Public API/vacancy availability and the selected Android device are live
  dependencies; historic passes do not certify the current product.
- Historic product evidence used ignored local artifacts and uncommitted source;
  it is not fully reproducible release evidence.

## Maintained documents

- [Test plan](TEST_PLAN.md): strategy, scope, release governance, and blockers.
- [Test cases](TEST_CASES.md): implemented and planned coverage with gates.
- [Decisions](DECISIONS.md): execution authority, verified observations, and active
  oracle/contract decisions.
- [Architecture](ARCHITECTURE.md): repository layout and runtime boundaries.
