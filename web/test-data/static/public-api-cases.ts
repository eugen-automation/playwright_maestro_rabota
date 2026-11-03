// These labels come from the live site's profession suggestions and may change.
export const JOB_SUGGESTION_CASES = [
  {
    id: 'API-PUBLIC-SUGGEST-01',
    title: 'programmer',
    query: 'programator',
    expectedLabel: 'Programator',
  },
  {
    id: 'API-PUBLIC-SUGGEST-02',
    title: 'accountant',
    query: 'contabil',
    expectedLabel: 'Contabil',
  },
  {
    id: 'API-PUBLIC-SUGGEST-03',
    title: 'Romanian diacritics',
    query: 'șofer',
    expectedLabel: 'Șofer',
  },
] as const;
