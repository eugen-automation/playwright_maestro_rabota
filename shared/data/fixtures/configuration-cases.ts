// Synthetic inputs for configuration guard tests; never executable targets.
const valid = {
  WEB_BASE_URL: 'https://configured.example',
  TEST_LOCALE: 'ro-MD',
} as const;

export const CONFIGURATION_CASES = {
  valid,
  optedIn: { ...valid, ALLOW_PRODUCTION_READ_ONLY: 'true' },
  apiConfigured: { ...valid, API_BASE_URL: valid.WEB_BASE_URL },
  apiOptedIn: {
    ...valid,
    API_BASE_URL: valid.WEB_BASE_URL,
    ALLOW_PUBLIC_READ_ONLY_API: 'true',
  },
  apiOptedInWithoutUrl: { ...valid, ALLOW_PUBLIC_READ_ONLY_API: 'true' },
  apiWrongOrigin: {
    ...valid,
    API_BASE_URL: 'https://unverified.example',
    ALLOW_PUBLIC_READ_ONLY_API: 'true',
  },
  invalidApiOptIn: { ...valid, ALLOW_PUBLIC_READ_ONLY_API: 'yes' },
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
  authConfigured: {
    ...valid,
    AUTH_BASE_URL: valid.WEB_BASE_URL,
    TEST_ACCOUNT_USERNAME: 'synthetic-candidate@configured.example',
    TEST_ACCOUNT_PASSWORD: 'synthetic-test-secret',
  },
  authOptedIn: {
    ...valid,
    AUTH_BASE_URL: valid.WEB_BASE_URL,
    TEST_ACCOUNT_USERNAME: 'synthetic-candidate@configured.example',
    TEST_ACCOUNT_PASSWORD: 'synthetic-test-secret',
    ALLOW_TEST_ACCOUNT_AUTH: 'true',
  },
  authWrongOrigin: {
    ...valid,
    AUTH_BASE_URL: 'https://unverified.example',
  },
  invalidAuthOptIn: { ...valid, ALLOW_TEST_ACCOUNT_AUTH: 'yes' },
  disabledRuntimes: ['ui', 'api', 'auth', 'android', 'ios'],
} as const;
