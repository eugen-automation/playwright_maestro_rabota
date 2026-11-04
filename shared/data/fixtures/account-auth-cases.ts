// Synthetic local-service credentials and markers; never real account data.
export const ACCOUNT_AUTH_CASES = {
  credentials: {
    username: 'synthetic-candidate@configured.example',
    password: 'synthetic-account-secret',
  },
  submitMarker: 'synthetic-submit-marker',
  cookie: 'synthetic_auth=active',
  outsidePath: '/synthetic/unapproved-destination',
} as const;
