# Android Maestro implementation — 2026-11-04

Historical initial two-flow increment. See the
[continuation](mobile-read-only-continuation-2026-11-04.md) for the current six-flow
scope, display-setting restoration, browser verification and iOS deferral.

User scope: implement Maestro with read-only actions and no CI work. The user
selected a physical Android device after initial emulator discovery; its serial
is kept in ignored configuration/evidence. No account
authentication, saved-job change, application, message, state reset or keychain
cleanup was performed. The two task-started emulators were stopped after switching
to the selected phone; their data was not wiped. Google Play installation was
unnecessary because the selected device already had the official app installed.

## Verified target and selectors

- Samsung SM-S911B, Android 17; installed version name **4.6.7**, version code
  **470**, verified through ADB package metadata. The Google Play
  [official listing](https://play.google.com/store/apps/details?id=md.rabota)
  identifies this app, and the package was verified on the selected device.
- Maestro **2.11.0**, Node.js **24.21.0**, Java **25.0.1** on Windows.
- Native device locale **ro-RO**; shared browser locale **ro-MD**. The runner
  accepts the verified Romanian language and records the actual native locale.
- Maestro hierarchy exposed Romanian accessibility text, with no useful native
  resource IDs for the tested Flutter controls. Home's `Acasă` is scoped
  `leftOf: Aplicări` to exclude Android's separate Home control.
- Observed public controls: `Cuvânt-cheie: jobul căutat`, `Caută job`,
  `Caută job după rubrici`; the keyword picker exposes `Selectează postul`.
  Recent/popular suggestions and account identity are not used as assertions.
- Testability request: expose stable identifiers for the Home tab, keyword
  control and picker heading. These text selectors are documented interim
  contracts, not claimed stable test IDs.

The ignored `.env` now contains only the verified Android package/device/version
additions, with the persistent Android execution flag **false**. Other target,
credential and execution values were not changed. No universal iOS identifier
or guessed native selector was added. iOS remains unimplemented/unexecuted.

## Implementation

The shared TypeScript runner validates runtime opt-in, explicit device, installed
build pin, tool version, Romanian locale and unlocked keyguard before executing.
It wakes the screen without unlocking or changing lock policy. YAML validation
checks tags, header, paths, helper cycles, protected exclusions and the restricted
command set. Only paths in the inspected read-only allowlist can run; tags alone
do not grant execution. Scripts, resets, shared-config overrides and alternate
app targets are rejected, including nested helpers. Empty suites fail visibly.

The shared launch helper uses `clearState: false` and `permissions: {}`. An empty
permissions map avoids Maestro's default grant-all behavior, confirmed in the
[pinned implementation](https://github.com/mobile-dev-inc/Maestro/blob/cli-2.11.0/maestro-orchestra/src/main/java/maestro/orchestra/Orchestra.kt).
Initial discovery used Maestro's default permission behavior before this was
identified; the prior permission state was not captured, so any earlier grants
cannot be assessed or safely restored by guessing. The committed flows now
preserve existing permissions and storage. No permission reset is attempted.

On Windows the runner uses a controlled batch invocation, filtered host-tooling
environment and explicit UTF-8 Java output. Account credentials are not forwarded.
The selected app ID is injected with `-e APP_ID=...`; no secret is placed in CLI
arguments. Each run writes source/build/device/locale metadata, outcome, JUnit
and artifacts below ignored `reports/mobile/android/<run-id>/`.

## Observed execution

Command: `npm.cmd run test:mobile:android -- --suite smoke`, with
`ALLOW_ANDROID_READ_ONLY=true` supplied only for that process. Source:
`9c6fc2abd57fa1c84eec5855f560909cda4209bc` plus the uncommitted working tree.
Run: `2026-11-04T17-25-07-782Z-4677f15f-a1f9-4def-b9a4-bf5d23aa5797`.
Result: **2 passed, 0 failed**, no skipped assertions or configured retries.

| Case                     | Verified outcome                                                                                                           |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| AND-MOB-001-01           | State-preserving launch returns to public Home, restores the search viewport and exposes Romanian search/category controls |
| AND-MOB-PUBLIC-SEARCH-01 | Keyword picker opens, exposes its observed heading, and returns to Home after keyboard dismissal/back navigation           |

Both exact flows ran through the shared runner, including Maestro syntax checks.
The Home flow had also passed independently. Earlier failures were investigated:
Maestro rejected a colon in the Windows artifact directory name (fixed, with
validator coverage), and a later attempt found a sleeping/locked phone (the user
unlocked it; the runner now fails clearly before a flow if keyguard is active).
Assertions were retained and no retry/optional action was added to hide failures.

Evidence remains ignored under the run directory: `run.json`, `result.json`,
`junit.xml`, `artifacts/` and `debug/`. Earlier failure evidence is retained in
its own run directory. No APK, private recent-search list, session state or
raw phone hierarchy is committed.

Local verification passed: `npm.cmd run check` (TypeScript, lint, formatting and
**27 synthetic foundation tests**), `npm.cmd run check:mobile` (two flows),
explicit formatting for the normally ignored test plan, document links and
`git diff --check`. Since the shared environment loader changed, the existing
public API smoke (**4 passed**) and Chromium registration-document smoke
(**1 passed**) also ran. Foundation checks are tooling coverage, not additional
native product cases. An initially stale synthetic path fixture was corrected
without changing its path-containment assertion before the complete check passed.

## Coverage limits

These are selected public native launch/navigation checks. They do not certify
fresh-install/onboarding, logged-out startup, controlled search matches, filters,
vacancy content, account workflows, background behavior, other Android builds or
iOS. Existing controlled-data cases retain their unmet prerequisites. The public
API whitespace discrepancy is outside this increment and remains active. CI is
still deferred and no workflow was activated.
