// Synthetic local HTTP-service inputs; never application endpoints or targets.
export const API_TRANSPORT_CASES = {
  hostname: '127.0.0.1',
  protocol: 'http:',
  timeout: 5_000,
  paths: {
    read: '/synthetic/read',
    redirect: '/synthetic/redirect',
    outsideContract: '/synthetic/outside-contract',
  },
  cookie: 'synthetic_session=owned_transport_case',
  query: { value: 'diacritice și spații' },
  invalidPaths: [
    '//unapproved.example/path',
    '/synthetic/../outside-contract',
    '/synthetic/%2e%2e/outside-contract',
    '/synthetic/read?hidden=value',
    '/synthetic/read#fragment',
    '/synthetic\\read',
  ],
} as const;
