import type { APIRequest, APIResponse } from '@playwright/test';
import { ReadOnlyApiClient } from './read-only-api-client.js';
import {
  PUBLIC_JOBS_ENDPOINTS,
  PUBLIC_VACANCY_POPUP_QUERY,
} from './public-jobs-endpoints.js';
import {
  PublicVipVacancyReferenceSchema,
  type PublicVipVacancyReference,
} from '../schemas/public-jobs.schema.js';

type PublicOperations = keyof typeof PUBLIC_JOBS_ENDPOINTS;
type ApiSettings = Readonly<{ baseUrl: string; timeout: number }>;

export class PublicJobsClient {
  private readonly detailClients: ReadOnlyApiClient<'detail'>[] = [];

  private constructor(
    private readonly request: APIRequest,
    private readonly settings: ApiSettings,
    private readonly transport: ReadOnlyApiClient<PublicOperations>,
  ) {}

  static async create(
    request: APIRequest,
    settings: ApiSettings,
  ): Promise<PublicJobsClient> {
    const transport = await ReadOnlyApiClient.create(request, {
      ...settings,
      operations: PUBLIC_JOBS_ENDPOINTS,
    });
    return new PublicJobsClient(request, settings, transport);
  }

  async suggest(query: string): Promise<APIResponse> {
    return this.transport.get('suggestions', { query });
  }

  async searchResults(): Promise<APIResponse> {
    return this.transport.get('searchResults');
  }

  async vacancyDetail(
    reference: PublicVipVacancyReference,
  ): Promise<APIResponse> {
    const verified = PublicVipVacancyReferenceSchema.parse(reference);
    // Allow only this listing's exact path for the detail request.
    const client = await ReadOnlyApiClient.create(this.request, {
      ...this.settings,
      operations: { detail: verified.relativePath },
    });
    this.detailClients.push(client);
    return client.get('detail', PUBLIC_VACANCY_POPUP_QUERY);
  }

  async dispose(): Promise<void> {
    await Promise.all([
      this.transport.dispose(),
      ...this.detailClients.map((client) => client.dispose()),
    ]);
  }
}

/** Pick a current VIP listing because live ads can expire. */
export function selectPublicVipVacancy(
  html: string,
): PublicVipVacancyReference {
  // The site uses vacancyShowPopup for VIP links. Read the anchor tags
  // without executing any of the returned HTML.
  for (const [tag] of html.matchAll(/<a\b[^>]*>/giu)) {
    if (!/\bclass=["'][^"']*\bvacancyShowPopup\b[^"']*["']/u.test(tag))
      continue;
    const path =
      /\bhref=["'](?<path>\/ro\/locuri-de-munca\/[a-z0-9-]+\/(?<id>[1-9]\d*))["']/u.exec(
        tag,
      )?.groups;
    if (path) {
      return PublicVipVacancyReferenceSchema.parse({
        relativePath: path.path,
        id: Number(path.id),
      });
    }
  }
  throw new Error(
    'The live search source contains no supported VIP vacancy link. Public-data availability must be investigated; this is not an empty-data pass.',
  );
}
