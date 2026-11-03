# Registration discovery

Inspected 2026-11-02 using public GET requests to
<https://www.rabota.md/ro/registration>. No form submission, registration API
request, or account creation was performed. Source assets referenced version
`2026.10.30.6`; this is an asset query value, not a verified application build ID.

## Verified observations

- HTTP 200; the server returns registration markup and inline validation scripts.
- Heading: `Creează un cont`; placeholders: `E-mail`, `Parola`.
- Submit button: `Finalizare cont`.
- Candidate/employer choices use radio values `resume` and `vacancy`.
- Employer markup includes `Numele companiei` and `Numărul de telefon` fields.
- Consent checkbox has ID `terms_of_service`.
- The form uses POST and `onsubmit="checkForm(); return false;"`.
- Inline `validatePasswordLength` checks 8 through 24 characters. This source
  observation does not establish backend password rules or runtime behavior.
- Inline code references POST `/ro/ajax/phone/available-for-registration`.
  This endpoint was not called; request/response contracts remain unverified.
- The document references jQuery and shared scripts, including
  `/im/js/form_scripts.js`. The page is not a standalone client bundle.

## Delivered coverage

`web/tests/journeys/registration-markup.spec.ts` checks the actual server document
in Chromium: heading, email input, password input type, and submit button. It is
tagged `@e2e`, `@smoke`, `@registration` because it uses the live server.
JavaScript is disabled. Only a GET of the exact registration document is allowed;
all other browser requests and WebSockets are blocked. Styles and assets are
therefore absent. This proves basic markup availability, not visual correctness,
interactive registration, backend registration, or email confirmation.

The exact smoke test passed locally on 2026-11-02 and was reverified on 2026-11-03.
Generated evidence is under `reports/web/` and is ignored. Git tracking was
initialized on `main` on 2026-11-03; the initial baseline includes the existing
npm lockfile. See the [foundation baseline](foundation-baseline.md) for executed
checks and remaining coverage limits.

## Mocked UI prerequisites

No runnable `@ui` registration test is claimed. UI execution remains disabled.
The server supplies the initial document, so routing browser AJAX alone cannot
prove that rendering has no backend access. Obtain a maintained, sanitized
fixture-backed frontend build/server and verify its complete runtime request
inventory before enabling UI execution. Do not commit a raw HTML capture with
session state, or replace the real frontend with a handwritten form.

The registration success/error JSON shapes, email-confirmation state and text,
and full authentication/background transports are not verified. Obtain documented
or authorized observed contracts; model strict schemas under `shared/api/schemas/`
and versioned synthetic responses under `web/test-data/mocks/` before implementing
mocked registration success, validation-error, empty, or failure responses.

Planned independent UI scenarios: required email/password, supported account
type, consent, password visibility and boundaries, employer-field visibility,
and verified server success/error presentation. Each remains unimplemented until
its selectors, behavior, and relevant contracts are verified.

## Execution boundaries

Real registration API and confirmation E2E remain disabled: there is no approved
non-production target, account cleanup, or verified contract. The previous
testmail.app sample evaluation established receiving, retrieval and dummy-link
extraction only. It does not establish rabota.md delivery. No mailbox key was
added to this repository, and no mailbox traffic is part of this smoke test.

## Dependency audit

The initial npm audit reported 11 moderate findings stemming from transitive
`minimatch <11.0.1` used by the lint toolchain (GHSA-g3hv-75wg-m249). No high or
critical findings were reported. Installed direct tools are pinned; do not apply
the suggested downgrade to ESLint 4 or force an unverified major transitive
override. Review an upstream compatible fix when available. No external glob
patterns are accepted by the supplied quality commands.
