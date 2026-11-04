# Android read-only continuation and iOS deferral — 2026-11-04

Scope: user-requested remaining implementation within verified read-only access.
iOS implementation/execution is explicitly deferred because no iOS device or
simulator is available; retain its eight native and two synchronization instances
as deferred backlog outside active release gates. CI remains user-deferred.

The Android target is the previously inspected user-selected physical phone,
installed app **4.6.7**, Android **17**, native Romanian **ro-RO**, Maestro
**2.11.0** and Node.js **24.21.0**. Source: commit `9c6fc2a` plus the uncommitted
working tree. Serial/actual target configuration stays in ignored `.env` and
generated evidence; no account credentials are used or forwarded.

## Added native behavior

| Case                     | Scope and observed result                                                                                                                                      |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AND-MOB-PUBLIC-SEARCH-02 | Observed profession input and case-sensitive suggestion open public results; selected profession and supported current card structure appear                   |
| AND-MOB-PUBLIC-JOBS-01   | Capture title/employer from the topmost card inside the visible results area, open that card, compare its detail identity and return to the profession context |
| AND-MOB-PUBLIC-FILTER-01 | Select the observed city in the region picker, verify the Home form value, reopen and reset to all regions                                                     |
| AND-MOB-PUBLIC-RESUME-01 | Open results independently, background with Home, resume without stopping/clearing the process, verify the same query screen and return Home                   |

All four passed individually and in the final combined smoke/regression runs.
Together with the previous Home and keyword-picker checks, six Android cases
are implemented and passed. No fixed vacancy ID, exact result
count, ranking, relative timestamp, controlled matching or persisted backend
state is assumed. Empty/unavailable live card data fails visibly. These public
instances do not replace the original controlled-data cases.

The shared profession helper owns the known non-secret query in YAML `env`.
Native observation confirmed that choosing its suggestion opens results directly.
Case-sensitive matching distinguishes the capitalized suggestion from the
lowercase editable query. The captured vacancy title/employer are regex-escaped
by one reviewed Maestro-compatible JS script under `mobile/scripts/`; no Node,
TypeScript, Zod, filesystem/network access or arbitrary script execution is used.
The detail accessibility label combines its exact title with later metadata;
the assertion checks that exact first line and the separate employer label.

## Display and execution safety

The phone can sleep during Maestro startup. It reports wired charging as AC,
not USB, so a USB-only stay-awake flag is insufficient. The runner captures
`stay_on_while_plugged_in`, temporarily enables both wired power bits, wakes the
display, rechecks keyguard, runs the suite, then restores and reads back the exact
previous setting. Prior flags are preserved. Cleanup runs after setup/test errors,
and a restoration failure fails the command rather than reporting a pass.
The original setting is retained in ignored `display-setting.json` for each run.
PIN/keyguard, app storage, account state, network and permissions are not reset.

Only reviewed script paths and the Home key are allowed by the read-only validator;
unreviewed scripts, alternate app targets, resets and protected-tag overrides
remain rejected. The standalone title-capture and display-lease checks use
synthetic data and cover punctuation, employer identity, timestamp changes,
action/setup failure and restoration. These are tooling tests, not native cases.

## Observed runs

Passing individual/suite evidence below ignored `reports/mobile/android/`:

| Run ID                                                          | Observed result                                                              |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `2026-11-04T17-58-40-961Z-15918e23-8266-442b-90bd-d905c005ac34` | Three smoke flows passed: Home, picker and new profession results            |
| `2026-11-04T17-59-29-985Z-55c47752-1391-4be0-9024-e603870fdb66` | Background/resume passed                                                     |
| `2026-11-04T18-03-45-961Z-08931e3b-23f6-47e9-a3f4-3ab31d96cdb1` | Exact vacancy-navigation flow passed, including title/employer assertions    |
| `2026-11-04T18-15-49-352Z-66edc66a-8cb9-4f28-a876-9355f4118be0` | Exact city-selection/reset flow passed with corrected wired display handling |
| `2026-11-04T18-21-14-143Z-5421527b-0b32-422c-b54d-854a44b66497` | Final smoke suite: all four flows passed                                     |
| `2026-11-04T18-22-22-730Z-8f37b5b5-2386-498b-b837-6bca5d90d10a` | Final regression suite: both flows passed                                    |

An earlier combined-suite attempt stopped at the locked-device preflight
before executing a flow or changing display policy. It is **not executed**, not
a product failure or a pass. The user unlocked the phone before the final
successful combined runs. The captured original display policy was `0`;
post-run ADB verification confirmed it was restored to `0`.
Earlier discovery failures exposed the ambiguous suggestion selector and sleeping
display; their evidence remains local. No assertion, schema or business check was
removed, weakened, skipped or made optional to hide those failures.

Final verification: TypeScript, ESLint, formatting and all **29 synthetic
foundation tests** passed; six native flows passed workspace validation. Public
API smoke passed **4/4**. The registration-document E2E also passed in Chromium,
branded Chrome, branded Edge and Playwright-managed Firefox (**4/4**), using
isolated contexts and the same GET-only fixture. Browser versions are attached
to each E2E result as annotations and JUnit properties. This is one logical
scenario across four projects, not four new catalog cases or complete browser/
visual certification. Desktop Safari still requires a macOS runner.

The default `test:web:smoke` command now explicitly selects public API plus
Chromium, keeping optional compatibility and unready authentication out of that
default run. It was executed after the command change: **5 passed**. Its checks
overlap the API/Chromium results above and are not additional logical cases.

| Windows project | Observed passing browser version |
| --------------- | -------------------------------- |
| e2e-chromium    | 156.0.8078.4                     |
| e2e-chrome      | 156.0.8078.81                    |
| e2e-edge        | 156.0.4314.58                    |
| e2e-firefox     | 157.0 (Playwright build 1555)    |

## Remaining gates

The user confirmed the frontend/API resources below are unavailable; the
remaining candidates stay gated, with no fabricated contracts or placeholder
passing suites. Browser compatibility evidence is preserved separately under
ignored `reports/web/compatibility/`; native evidence remains per run.

Broader API cases still need verified business-operation contracts and controlled
data; isolated UI needs a maintained real frontend test build/server entirely
backed by fixtures. Authentication, CV/profile writes, applications, favorites
and synchronization need approved non-production targets, disposable identities,
owned data and cleanup. Offline/permission/reset work needs an approved reserved
device setup; this phone's network and account are not modified to manufacture
coverage. iOS and CI remain deferred. The existing API whitespace discrepancy
remains open and is not changed by this increment.
