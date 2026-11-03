import assert from 'node:assert/strict';
import { test } from 'node:test';
import { allowsRegistrationDocument } from './read-only-policy.js';
import { readEnvironment } from '../../../shared/config/load-env.js';
import { CONFIGURATION_CASES } from '../../../shared/data/fixtures/configuration-cases.js';
import { NETWORK_POLICY_CASES } from '../../test-data/static/network-policy-cases.js';
import { ROUTES } from '../../constants/routes.js';

const environment = readEnvironment(CONFIGURATION_CASES.valid);
if (!environment.webBaseUrl)
  throw new Error('Missing verified web URL for policy tests.');
const url = new URL(ROUTES.registration, environment.webBaseUrl).href;
const documentRequest = {
  method: 'GET',
  url,
  navigation: true,
  resourceType: 'document',
};

test('only the exact registration document GET can reach the server', () => {
  assert.equal(allowsRegistrationDocument(documentRequest, url), true);
  for (const method of NETWORK_POLICY_CASES.blockedMethods) {
    assert.equal(
      allowsRegistrationDocument({ ...documentRequest, method }, url),
      false,
    );
  }
  const blockedUrls = [
    ...NETWORK_POLICY_CASES.blockedSuffixes.map((suffix) => `${url}${suffix}`),
    new URL(ROUTES.registration, NETWORK_POLICY_CASES.unrelatedOrigin).href,
  ];
  for (const blockedUrl of blockedUrls) {
    assert.equal(
      allowsRegistrationDocument({ ...documentRequest, url: blockedUrl }, url),
      false,
    );
  }
  for (const resourceType of NETWORK_POLICY_CASES.blockedResourceTypes) {
    assert.equal(
      allowsRegistrationDocument({ ...documentRequest, resourceType }, url),
      false,
    );
  }
  assert.equal(
    allowsRegistrationDocument({ ...documentRequest, navigation: false }, url),
    false,
  );
});
