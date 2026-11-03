import { test, expect } from '../../fixtures/pom/test-options.js';
import {
  JobSuggestionsResponseSchema,
  VipVacancyResponseSchema,
} from '../../fixtures/api/schemas/index.js';
import { selectPublicVipVacancy } from '../../../shared/api/clients/public-jobs-client.js';
import { JOB_SUGGESTION_CASES } from '../../test-data/static/public-api-cases.js';

for (const item of JOB_SUGGESTION_CASES) {
  test(
    `${item.id}: public autocomplete includes the ${item.title} taxonomy label`,
    { tag: ['@smoke', '@api', '@search'] },
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
