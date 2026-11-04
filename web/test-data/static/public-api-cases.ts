// Derived from public endpoint observations on 2026-11-03 and 2026-11-04.
// Taxonomy labels are live and may change; these are not controlled job datasets.
export const JOB_SUGGESTION_CASES = [
  {
    id: 'API-PUBLIC-SUGGEST-01',
    title: 'programmer',
    query: 'programator',
    expectedLabel: 'Programator',
    suite: '@smoke',
  },
  {
    id: 'API-PUBLIC-SUGGEST-02',
    title: 'accountant',
    query: 'contabil',
    expectedLabel: 'Contabil',
    suite: '@smoke',
  },
  {
    id: 'API-PUBLIC-SUGGEST-03',
    title: 'Romanian diacritics',
    query: 'șofer',
    expectedLabel: 'Șofer',
    suite: '@smoke',
  },
  {
    id: 'API-PUBLIC-SUGGEST-05',
    title: 'uppercase programmer',
    query: 'PROGRAMATOR',
    expectedLabel: 'Programator',
    suite: '@regression',
  },
  {
    id: 'API-PUBLIC-SUGGEST-06',
    title: 'uppercase Romanian diacritics',
    query: 'ȘOFER',
    expectedLabel: 'Șofer',
    suite: '@regression',
  },
] as const;

export const JOB_SUGGESTION_EDGE_CASES = {
  empty: { id: 'API-PUBLIC-SUGGEST-04', query: '' },
  whitespace: { id: 'API-PUBLIC-SUGGEST-07', query: '   ' },
} as const;

// Discovery observed these input categories without establishing a normalization
// policy. Assert the response contract, not trimming or accent equivalence.
export const JOB_SUGGESTION_CONTRACT_CASES = [
  {
    id: 'API-PUBLIC-SUGGEST-10',
    title: 'a space-padded profession query',
    query: ` ${JOB_SUGGESTION_CASES[0].query} `,
  },
  {
    id: 'API-PUBLIC-SUGGEST-11',
    title: 'an accentless Romanian profession query',
    query: 'sofer',
  },
] as const;

// Pair the existing observed inputs without introducing normalization rules.
export const JOB_SUGGESTION_IDENTITY_CASES = [
  {
    id: 'API-PUBLIC-SUGGEST-08',
    baseline: JOB_SUGGESTION_CASES[0],
    input: JOB_SUGGESTION_CASES[3],
  },
  {
    id: 'API-PUBLIC-SUGGEST-09',
    baseline: JOB_SUGGESTION_CASES[2],
    input: JOB_SUGGESTION_CASES[4],
  },
] as const;
