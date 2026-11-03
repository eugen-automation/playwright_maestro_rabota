// Synthetic security cases; these values must never be used as live targets.
export const NETWORK_POLICY_CASES = {
  blockedMethods: ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  blockedSuffixes: ['?submit=1', '/confirm'],
  unrelatedOrigin: 'https://unrelated.example',
  blockedResourceTypes: [
    'fetch',
    'xhr',
    'script',
    'stylesheet',
    'image',
    'eventsource',
  ],
} as const;
