import assert from 'node:assert/strict';
import { test } from 'node:test';
import { selectPublicVipVacancy } from './public-jobs-client.js';
import {
  JobSuggestionsResponseSchema,
  EmptyJobSuggestionsResponseSchema,
  VipVacancyResponseSchema,
  PublicVipVacancyReferenceSchema,
} from '../schemas/public-jobs.schema.js';
import { PUBLIC_JOBS_CONTRACT_CASES as cases } from '../../data/fixtures/public-jobs-contract-cases.js';

test('public JSON contracts reject unknown top-level and nested fields', () => {
  JobSuggestionsResponseSchema.parse(cases.suggestions);
  VipVacancyResponseSchema.parse(cases.vacancy);
  assert.throws(() =>
    JobSuggestionsResponseSchema.parse({
      ...cases.suggestions,
      unexpected: true,
    }),
  );
  assert.throws(() =>
    VipVacancyResponseSchema.parse({
      ...cases.vacancy,
      data: {
        ...cases.vacancy.data,
        company_ad: { ...cases.vacancy.data.company_ad, unexpected: true },
      },
    }),
  );
});

test('empty autocomplete is distinct from populated results and blank labels fail the contract', () => {
  EmptyJobSuggestionsResponseSchema.parse(cases.emptySuggestions);
  assert.throws(() =>
    EmptyJobSuggestionsResponseSchema.parse(cases.suggestions),
  );
  assert.throws(() =>
    JobSuggestionsResponseSchema.parse(cases.blankSuggestion),
  );
});

test('vacancy selection ignores unrelated links and checks route/ID agreement', () => {
  assert.deepEqual(selectPublicVipVacancy(cases.mixedLinks), cases.reference);
  for (const html of [cases.noVacancy, cases.unrelatedLink]) {
    assert.throws(
      () => selectPublicVipVacancy(html),
      /no supported VIP vacancy/,
    );
  }
  assert.throws(() =>
    PublicVipVacancyReferenceSchema.parse({
      ...cases.reference,
      id: cases.reference.id + 1,
    }),
  );
});
