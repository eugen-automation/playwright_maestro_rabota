import type {
  APIRequest,
  APIRequestContext,
  APIResponse,
} from '@playwright/test';
import { ServiceOriginSchema } from '../../config/env.schema.js';

type QueryParameters = Readonly<Record<string, string | number | boolean>>;

export type ReadOnlyApiTarget<Operation extends string> = Readonly<{
  baseUrl: string;
  // Add paths only after verifying their read-only behavior and access.
  operations: Readonly<Record<Operation, string>>;
  timeout: number;
}>;

/** Send GET requests to the paths supplied by each feature client. */
export class ReadOnlyApiClient<Operation extends string> {
  private constructor(
    private readonly context: APIRequestContext,
    private readonly operations: ReadonlyMap<Operation, string>,
    private readonly timeout: number,
  ) {}

  /** The owning fixture must call dispose() during teardown. */
  static async create<Operation extends string>(
    request: APIRequest,
    target: ReadOnlyApiTarget<Operation>,
  ): Promise<ReadOnlyApiClient<Operation>> {
    const origin = new URL(ServiceOriginSchema.parse(target.baseUrl));
    if (!Number.isFinite(target.timeout) || target.timeout <= 0) {
      throw new Error('API request timeout must be finite and positive.');
    }

    const operations = new Map<Operation, string>();
    for (const operation in target.operations) {
      if (!Object.hasOwn(target.operations, operation)) {
        throw new Error(
          'API operations must be owned by the declared contract.',
        );
      }
      const path = target.operations[operation];
      if (
        !path.startsWith('/') ||
        path.startsWith('//') ||
        /[\\?#\s]/u.test(path)
      ) {
        throw new Error(
          'API operations require relative paths without queries.',
        );
      }
      const url = new URL(path, origin);
      if (url.origin !== origin.origin || url.pathname !== path) {
        throw new Error(
          'API operation must preserve its approved origin/path.',
        );
      }
      operations.set(operation, url.href);
    }
    if (operations.size === 0) {
      throw new Error('No verified read-only API operations are configured.');
    }

    // This context has its own cookies and no browser authentication state.
    const context = await request.newContext({
      baseURL: origin.href,
      ignoreHTTPSErrors: false,
      maxRedirects: 0,
      timeout: target.timeout,
    });
    return new ReadOnlyApiClient(context, operations, target.timeout);
  }

  async get(
    operation: Operation,
    parameters?: QueryParameters,
  ): Promise<APIResponse> {
    const url = this.operations.get(operation);
    if (!url) throw new Error('API operation is not in the approved contract.');
    // Let tests assert error responses. Block redirects to unapproved paths
    // and keep retries off so failures remain visible.
    return this.context.get(url, {
      ...(parameters ? { params: parameters } : {}),
      failOnStatusCode: false,
      maxRedirects: 0,
      maxRetries: 0,
      timeout: this.timeout,
    });
  }

  async dispose(): Promise<void> {
    await this.context.dispose();
  }
}
