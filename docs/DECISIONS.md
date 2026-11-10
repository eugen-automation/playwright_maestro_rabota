# Test decisions and verified observations

This document records active decisions, verified observations, and constraints
needed to make safe test choices. It is not a product requirements document.

## Execution authority

- The only verified application target is public production access, restricted to
  specifically approved read-only operations.
- Public API execution requires `ALLOW_PUBLIC_READ_ONLY_API=true`; browser markup
  E2E requires `ALLOW_PRODUCTION_READ_ONLY=true`; Android uses its own opt-in.
  These flags are independent and grant no write capability.
- Authentication, registration, profile/CV changes, applications, favorites,
  messaging, notifications, employer workflows, state reset, and destructive tests
  require approved non-production access, disposable ownership, and cleanup.
- iOS and CI are deferred. Isolated UI is blocked until a maintained frontend test
  build can run entirely from verified fixtures, including server-rendered data.

## API observations

Authorized observation established these public, same-origin GET operations:

| Interaction              | Observation                                                                                           |
| ------------------------ | ----------------------------------------------------------------------------------------------------- |
| Profession autocomplete  | `GET /ro/ajax/tags?query=<input>` returns JSON suggestions with string label and numeric taxonomy ID  |
| Job search               | Entering a profession navigates to a localized HTML results route; no JSON results API is established |
| Narrow VIP vacancy popup | An observed vacancy route with `json=1&viewMode=1` returns the modeled JSON branch                    |

These observations support only the implemented public cases. They do not prove
controlled matching, pagination, filters, missing-record behavior, authentication,
permissions, writes, or a stable provider contract.

## Registration observations

The public Romanian registration document exposed the heading `Creează un cont`,
email and password controls, a `Finalizare cont` submit control, candidate/employer
choices, employer fields, and a consent checkbox. The markup contains inline client
validation references, but that does not establish runtime or backend behavior.

The only approved browser check reads that exact document with JavaScript disabled.
It does not submit a form, create an account, test visual behavior, or establish
email delivery. Any mocked registration UI needs a maintained real frontend build
and verified synthetic contracts before implementation.

## Android observations

Six public read-only flows were observed on one selected Android build/device using
Romanian controls. Their selectors and outcomes are build-specific historical
evidence, not an Android compatibility guarantee. The runner preserves application
storage, account state, permissions, and lock policy; it restores its temporary
wired-display setting after execution.

## DEC-API-001: Whitespace autocomplete labels

**Status:** open oracle/contract discrepancy; not a confirmed product defect.

For an autocomplete request containing three ASCII spaces, the observed response
included an empty suggestion label. The existing strict schema requires a non-empty
usable label, so `API-PUBLIC-SUGGEST-07` fails. Empty input has a separate valid
empty-suggestions contract; that does not define whitespace behavior.

The repository maintainer owns escalation and evidence preservation. A named
product/API owner must decide whether whitespace is rejected, normalized, or may
return blank labels before release use or any change to the test/schema. Do not
weaken the contract merely to make the test pass.

## Evidence policy

Historical runs that used uncommitted source and ignored local artifacts are useful
development evidence but not fully reproducible release evidence. Future formal
records must retain a clean commit or source checksum, build/target, run manifest,
redacted artifact ID/checksum and retention period, plus cleanup outcome.
