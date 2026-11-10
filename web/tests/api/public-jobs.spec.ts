import { test, expect } from '../../fixtures/pom/test-options.js';
import {
  JobSuggestionsResponseSchema,
  EmptyJobSuggestionsResponseSchema,
  VipVacancyResponseSchema,
} from '../../fixtures/api/schemas/index.js';
import { selectPublicVipVacancy } from '../../../shared/api/clients/public-jobs-client.js';
import {
  JOB_SUGGESTION_CASES,
  JOB_SUGGESTION_EDGE_CASES,
  JOB_SUGGESTION_IDENTITY_CASES,
  JOB_SUGGESTION_CONTRACT_CASES,
} from '../../test-data/static/public-api-cases.js';

for (const item of JOB_SUGGESTION_CASES) {
  test(
    `${item.id}: public autocomplete includes the ${item.title} taxonomy label`,
    { tag: [item.suite, '@api', '@search'] },
    async ({ publicJobsApi }) => {
      const response = await publicJobsApi.suggest(item.query);
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');
      const body: unknown = await response.json();
      expect(JobSuggestionsResponseSchema.parse(body)).toBeTruthy();
      const suggestions = JobSuggestionsResponseSchema.parse(body).suggestions;
      expect(suggestions.map(({ value }) => value)).toContain(
        item.expectedLabel,
      );
    },
  );
}

for (const item of JOB_SUGGESTION_CONTRACT_CASES) {
  test(
    `${item.id}: ${item.title} returns contract-valid suggestions`,
    { tag: ['@regression', '@api', '@search'] },
    async ({ publicJobsApi }) => {
      const response = await publicJobsApi.suggest(item.query);
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');
      const body: unknown = await response.json();
      expect(JobSuggestionsResponseSchema.parse(body)).toBeTruthy();
    },
  );
}

for (const { id, baseline, input } of JOB_SUGGESTION_IDENTITY_CASES) {
  test(
    `${id}: ${input.title} keeps the same taxonomy identity across query casing`,
    { tag: ['@regression', '@api', '@search'] },
    async ({ publicJobsApi }) => {
      const taxonomyId =
        await test.step('GET lowercase query — validate contract and identify the expected label', async () => {
          const response = await publicJobsApi.suggest(baseline.query);
          expect(response.status()).toBe(200);
          expect(response.headers()['content-type']).toContain(
            'application/json',
          );
          const body: unknown = await response.json();
          expect(JobSuggestionsResponseSchema.parse(body)).toBeTruthy();
          const matches = JobSuggestionsResponseSchema.parse(
            body,
          ).suggestions.filter(({ value }) => value === input.expectedLabel);
          expect(matches).toHaveLength(1);
          const [suggestion] = matches;
          if (!suggestion)
            throw new Error('Expected taxonomy label is missing.');
          return suggestion.data;
        });

      await test.step('GET uppercase query — validate contract and compare taxonomy identity', async () => {
        const response = await publicJobsApi.suggest(input.query);
        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toContain(
          'application/json',
        );
        const body: unknown = await response.json();
        expect(JobSuggestionsResponseSchema.parse(body)).toBeTruthy();
        const matches = JobSuggestionsResponseSchema.parse(
          body,
        ).suggestions.filter(({ value }) => value === input.expectedLabel);
        expect(matches).toEqual([
          { value: input.expectedLabel, data: taxonomyId },
        ]);
      });
    },
  );
}

test(
  `${JOB_SUGGESTION_EDGE_CASES.empty.id}: an empty autocomplete query returns no suggestions`,
  { tag: ['@regression', '@api', '@search'] },
  async ({ publicJobsApi }) => {
    const response = await publicJobsApi.suggest(
      JOB_SUGGESTION_EDGE_CASES.empty.query,
    );
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body: unknown = await response.json();
    expect(EmptyJobSuggestionsResponseSchema.parse(body)).toBeTruthy();
    expect(
      EmptyJobSuggestionsResponseSchema.parse(body).suggestions,
    ).toHaveLength(0);
  },
);

test(
  `${JOB_SUGGESTION_EDGE_CASES.whitespace.id}: whitespace autocomplete does not return blank labels`,
  { tag: ['@regression', '@api', '@search'] },
  async ({ publicJobsApi }) => {
    // DEC-API-001 is tracked in docs/DECISIONS.md.
    // Keep this assertion active: the observed blank label violates the contract.
    const response = await publicJobsApi.suggest(
      JOB_SUGGESTION_EDGE_CASES.whitespace.query,
    );
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body: unknown = await response.json();
    expect(JobSuggestionsResponseSchema.parse(body)).toBeTruthy();
    const suggestions = JobSuggestionsResponseSchema.parse(body).suggestions;
    expect(suggestions.every(({ value }) => value.trim().length > 0)).toBe(
      true,
    );
  },
);

test(
  'API-PUBLIC-VACANCY-01: public VIP vacancy JSON identifies the selected current vacancy',
  { tag: ['@smoke', '@api', '@jobs'] },
  async ({ publicJobsApi }) => {
    const reference =
      await test.step('GET current public search — select an observed VIP vacancy', async () => {
        const response = await publicJobsApi.searchResults();
        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toContain('text/html');
        return selectPublicVipVacancy(await response.text());
      });

    await test.step('GET selected vacancy JSON — validate status, strict contract and identity', async () => {
      const response = await publicJobsApi.vacancyDetail(reference);
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');
      const body: unknown = await response.json();
      expect(VipVacancyResponseSchema.parse(body)).toBeTruthy();
      const vacancy = VipVacancyResponseSchema.parse(body);
      expect(vacancy.data.company_ad.company_ad_id).toBe(reference.id);
    });
  },
);
