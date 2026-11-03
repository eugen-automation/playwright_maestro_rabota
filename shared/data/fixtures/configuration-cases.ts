// Synthetic inputs for configuration guard tests; never executable targets.
const valid = {
  WEB_BASE_URL: 'https://configured.example',
  TEST_LOCALE: 'ro-MD',
} as const;

export const CONFIGURATION_CASES = {
  valid,
  optedIn: { ...valid, ALLOW_PRODUCTION_READ_ONLY: 'true' },
  invalidUrl: { ...valid, WEB_BASE_URL: 'invalid-url' },
  credentialUrl: {
    ...valid,
    WEB_BASE_URL: 'https://user:dummy@configured.example',
  },
  pathUrl: { ...valid, WEB_BASE_URL: 'https://configured.example/path' },
  invalidProductionOptIn: { ...valid, ALLOW_PRODUCTION_READ_ONLY: 'yes' },
  legacySelection: { ...valid, TEST_ENV: 'prod' },
  legacyOverride: { ...valid, BASE_URL: 'https://unverified.example' },
  ciEnabled: { ...valid, CI: 'true' },
  ciDisabled: { ...valid, CI: 'false' },
  disabledRuntimes: ['ui', 'api', 'android', 'ios'],
} as const;
