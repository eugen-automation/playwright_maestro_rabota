import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readEnvironment, requireRuntime } from './load-env.js';
import { CONFIGURATION_CASES as cases } from '../data/fixtures/configuration-cases.js';

test('missing URL and locale fail validation without a default target', () => {
  assert.throws(() => readEnvironment({}), /WEB_BASE_URL|TEST_LOCALE/);
  assert.throws(
    () => readEnvironment({ WEB_BASE_URL: cases.valid.WEB_BASE_URL }),
    /TEST_LOCALE/,
  );
});

test('invalid, credential-bearing, and path-bearing URLs are rejected', () => {
  for (const input of [cases.invalidUrl, cases.credentialUrl, cases.pathUrl]) {
    assert.throws(() => readEnvironment(input), /WEB_BASE_URL/);
  }
});

test('read-only opt-in is false by default and required for execution', () => {
  const environment = readEnvironment(cases.valid);
  assert.equal(environment.allowProductionReadOnly, false);
  assert.throws(
    () => requireRuntime(environment, 'e2e'),
    /ALLOW_PRODUCTION_READ_ONLY/,
  );
  requireRuntime(readEnvironment(cases.optedIn), 'e2e');
});

test('changing configuration cannot enable API, UI, or mobile execution', () => {
  const environment = readEnvironment(cases.optedIn);
  for (const runtime of cases.disabledRuntimes) {
    assert.throws(() => requireRuntime(environment, runtime), /disabled/);
  }
});

test('malformed boolean values fail validation', () => {
  assert.throws(
    () => readEnvironment(cases.invalidProductionOptIn),
    /ALLOW_PRODUCTION_READ_ONLY/,
  );
  assert.equal(readEnvironment(cases.ciEnabled).ci, true);
  assert.equal(readEnvironment(cases.ciDisabled).ci, false);
});

test('obsolete environment selection and URL override are rejected', () => {
  assert.throws(() => readEnvironment(cases.legacySelection), /Legacy/);
  assert.throws(() => readEnvironment(cases.legacyOverride), /Legacy/);
});
