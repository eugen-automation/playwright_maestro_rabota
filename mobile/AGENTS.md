# Maestro rules

Applies to `mobile/`; [root rules](../AGENTS.md) take priority. Select native risks
and critical integrations at the top of the pyramid; shared backend rules stay API-owned.

## Configuration and lifecycle

- Verify actual Android package and iOS bundle IDs from installed builds before
  configuration. `md.simpals.app999` is only a candidate Android ID, never a
  universal ID. iOS simulator work requires a compatible macOS setup/build.
- The shared TypeScript runner consumes shared validated config, selects the
  platform ID and injects `APP_ID` into Maestro (`-e APP_ID=...` or supported
  equivalent). Every flow/subflow header uses `appId: ${APP_ID}` and `---`.
- Top-level `flows/<feature>/*.yaml` also declares a descriptive `name`, exactly
  one `smoke`/`regression` suite tag and one feature tag matching its folder.
  Add special tags only when relevant; tags never replace safe runner guards.
- Ordinary flows begin `- runFlow: ../../subflows/launch-app.yaml`; adjust paths
  for different folder depth. That helper preserves app state, handles genuinely
  optional onboarding/permissions, and waits for a screen-appropriate stable marker.
  Signed-in bottom navigation must not be required for auth/onboarding tests.
- Clean-install auth/onboarding flows instead begin the `launch-logged-out.yaml`
  helper, which owns `launchApp: { clearState: true }` and platform-specific
  keychain cleanup. Do not require signed-in navigation there.
- Any `clearState: true` or standalone `clearState` anywhere in a subflow chain
  requires `logged-out` and `state-reset` tags and exclusion from default runs.
  Use only dedicated disposable devices/accounts with deliberate opt-in. iOS
  resets may reinstall the app; keychain cleanup is a separate concern.
- Reuse focused launch/onboarding/sign-in/search/navigation helpers in
  `subflows/`. Avoid duplicated sequences, web-style POMs, deep nesting and
  conditional branches that hide failures. Subflow name/tags are optional.

## Selectors, synchronization and inputs

- Inspect hierarchy with Maestro hierarchy/Studio before writing selectors;
  verify Android and iOS separately. Maestro has no `getByRole` API.
- Prefer stable `id` (testID/resource/accessibility ID), then scoped `text`,
  relational selectors, scoped `index`, and finally `point`. Combine criteria.
  `text` includes visible/accessibility labels; text and IDs are regex-based.
  Escape literal metacharacters, use `.*`/`(?i)` only deliberately, and quote YAML
  regex safely (single quotes often help).
- Use supported Romanian copy by default, and label targeted localization cases.
  IDs must not depend on translation. Request missing important test IDs.
- Prefer built-in tap/assert waits. For genuine long operations, use
  `extendedWaitUntil` with a bounded millisecond timeout and a real state marker.
  `waitForAnimationToEnd` is only for genuine bounded transitions, followed by
  state verification; never substitute sleeps/repeated taps for data readiness.
- `point` needs a documented reason semantic selection is impossible and the
  device/layout constraint; `index` needs scope and a stable-order reason.
  Document temporary text selectors while requesting important missing IDs.
- Primary actions/assertions must fail. Conditional/optional handling is only
  for genuinely optional banners, onboarding or system dialogs.
- Put non-secret scenario values in flow `env`, helper inputs in `runFlow.env`,
  and use `${NAME}` placeholders. Never override shared environment values such
  as `APP_ID`/`API_BASE_URL` at flow level. Prefer sensitive `MAESTRO_` shell
  variables over `-e SECRET=value`; never commit or log credentials.
- Maestro JS cannot import Node/TypeScript/Zod. Keep compatible scripts in
  `scripts/`; run shared TS seeders before Maestro, pass only needed IDs and
  non-secret data, and clean up externally in teardown/finally.

## Verification

After changing a flow, normally run that exact flow on a connected verified
device/simulator through the shared runner or correctly parameterized CLI.
Validate YAML/paths/tags and report results/artifacts by platform. If execution
is deferred by the user or unavailable, report **not executed** and the reason;
never infer a platform pass from the other platform.

References: [flow syntax](https://docs.maestro.dev/maestro-flows),
[selectors](https://docs.maestro.dev/reference/selectors/core-selectors),
[discovery and tags](https://docs.maestro.dev/maestro-flows/workspace-management/test-discovery-and-tags),
[environment variables](https://docs.maestro.dev/maestro-flows/flow-control-and-logic/parameters-and-constants),
[waits](https://docs.maestro.dev/maestro-flows/flow-control-and-logic/wait-commands),
[reports](https://docs.maestro.dev/maestro-flows/workspace-management/test-reports-and-artifacts).
