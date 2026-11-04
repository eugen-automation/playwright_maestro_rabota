import type {
  APIRequest,
  APIRequestContext,
  APIResponse,
} from '@playwright/test';
import { ServiceOriginSchema } from '../../config/env.schema.js';
import {
  ACCOUNT_AUTH_PATHS,
  ACCOUNT_LOGIN_FIELDS,
} from './test-account-auth-endpoints.js';

type Credentials = Readonly<{ username: string; password: string }>;
type Settings = Readonly<{ baseUrl: string; timeout: number }>;

export type AuthHttpResult = Readonly<{
  status: number;
  isHtml: boolean;
  sameOriginRedirect: boolean;
  redirectPath: string | null;
}>;

export type LoginFormResult = AuthHttpResult &
  Readonly<{
    observedForm: boolean;
    passwordInput: boolean;
  }>;

export type AccountSessionResult = AuthHttpResult &
  Readonly<{
    accountIdentityVisible: boolean;
    logoutLinkVisible: boolean;
  }>;

/** Only the observed sign-in, session-check and sign-out operations are exposed. */
export class TestAccountAuthClient {
  private submitMarker: string | undefined;
  private needsSignOut = false;
  private signOutAttempted = false;

  private constructor(
    private readonly context: APIRequestContext,
    private readonly origin: string,
    private readonly credentials: Credentials,
    private readonly timeout: number,
  ) {}

  static async create(
    request: APIRequest,
    settings: Settings,
    credentials: Credentials,
  ): Promise<TestAccountAuthClient> {
    const origin = new URL(ServiceOriginSchema.parse(settings.baseUrl)).origin;
    if (!Number.isFinite(settings.timeout) || settings.timeout <= 0) {
      throw new Error('Authentication timeout must be finite and positive.');
    }
    if (!credentials.username || !credentials.password) {
      throw new Error('Dedicated test-account credentials are required.');
    }
    const context = await request.newContext({
      baseURL: origin,
      ignoreHTTPSErrors: false,
      maxRedirects: 0,
      timeout: settings.timeout,
      storageState: { cookies: [], origins: [] },
    });
    return new TestAccountAuthClient(
      context,
      origin,
      credentials,
      settings.timeout,
    );
  }

  async loginForm(): Promise<LoginFormResult> {
    const response = await this.get(ACCOUNT_AUTH_PATHS.login);
    const html = await response.text();
    const match =
      /<form\b(?=[^>]*\bid=["']loginForm["'])([^>]*)>([\s\S]*?)<\/form>/iu.exec(
        html,
      );
    const attributes = match?.[1] ?? '';
    const content = match?.[2] ?? '';
    const method = /\bmethod=["']([^"']*)/iu
      .exec(attributes)?.[1]
      ?.toUpperCase();
    const action = /\baction=["']([^"']*)/iu.exec(attributes)?.[1];
    const target = new URL(action || ACCOUNT_AUTH_PATHS.login, this.origin);
    const inputs = [...content.matchAll(/<input\b[^>]*>/giu)].map(
      ([tag]) => tag,
    );
    const names = inputs.map((tag) => /\bname=["']([^"']*)/iu.exec(tag)?.[1]);
    const expectedNames = Object.values(ACCOUNT_LOGIN_FIELDS);
    const observedForm =
      !!match &&
      method === 'POST' &&
      target.origin === this.origin &&
      target.pathname === ACCOUNT_AUTH_PATHS.login &&
      !target.search &&
      !target.hash &&
      names.length === expectedNames.length &&
      expectedNames.every((name) => names.includes(name));
    const submitTag = inputs.find((tag) =>
      /\bname=["']do_login["']/iu.test(tag),
    );
    this.submitMarker =
      observedForm && submitTag
        ? /\bvalue=["']([^"']*)/iu.exec(submitTag)?.[1]
        : undefined;
    const passwordInput = inputs.some(
      (tag) =>
        /\bname=["']password["']/iu.test(tag) &&
        /\btype=["']password["']/iu.test(tag),
    );
    return {
      ...this.summary(response),
      observedForm: observedForm && !!this.submitMarker,
      passwordInput,
    };
  }

  async signIn(): Promise<AuthHttpResult> {
    if (!this.submitMarker) {
      throw new Error(
        'Load and verify the observed login form before sign-in.',
      );
    }
    // Mark before the request: a transport failure may occur after server sign-in.
    this.needsSignOut = true;
    let response: APIResponse;
    try {
      response = await this.context.post(ACCOUNT_AUTH_PATHS.login, {
        form: {
          [ACCOUNT_LOGIN_FIELDS.decoyLogin]: '',
          [ACCOUNT_LOGIN_FIELDS.decoyPassword]: '',
          [ACCOUNT_LOGIN_FIELDS.username]: this.credentials.username,
          [ACCOUNT_LOGIN_FIELDS.password]: this.credentials.password,
          [ACCOUNT_LOGIN_FIELDS.submit]: this.submitMarker,
        },
        failOnStatusCode: false,
        maxRedirects: 0,
        maxRetries: 0,
        timeout: this.timeout,
      });
    } catch {
      // Fail loudly without propagating request headers, cookies or form values.
      throw new Error(
        'Test-account sign-in transport failed; sensitive diagnostics omitted.',
      );
    }
    return this.summary(response);
  }

  async session(): Promise<AccountSessionResult> {
    const response = await this.get(ACCOUNT_AUTH_PATHS.home);
    const html = await response.text();
    const logoutLinkVisible = [
      ...html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/giu),
    ].some(([, href]) => {
      if (!href || !URL.canParse(href, this.origin)) return false;
      const url = new URL(href, this.origin);
      return (
        url.origin === this.origin && url.pathname === ACCOUNT_AUTH_PATHS.logout
      );
    });
    return {
      ...this.summary(response),
      accountIdentityVisible: html.includes(this.credentials.username),
      logoutLinkVisible,
    };
  }

  async accountLanding(): Promise<AuthHttpResult> {
    return this.summary(await this.get(ACCOUNT_AUTH_PATHS.accountLanding));
  }

  async signOut(): Promise<AuthHttpResult> {
    this.signOutAttempted = true;
    const result = this.summary(await this.get(ACCOUNT_AUTH_PATHS.logout));
    if (
      result.status === 302 &&
      result.sameOriginRedirect &&
      result.redirectPath === ACCOUNT_AUTH_PATHS.home
    ) {
      this.needsSignOut = false;
    }
    return result;
  }

  async dispose(): Promise<void> {
    try {
      if (this.needsSignOut) {
        if (this.signOutAttempted) {
          throw new Error(
            'Test-account sign-out was not validated; session cleanup is incomplete.',
          );
        }
        await this.signOut();
        if (this.needsSignOut) {
          throw new Error(
            'Test-account cleanup did not return the observed signed-out redirect.',
          );
        }
      }
    } finally {
      await this.context.dispose();
    }
  }

  private async get(path: string): Promise<APIResponse> {
    try {
      return await this.context.get(path, {
        failOnStatusCode: false,
        maxRedirects: 0,
        maxRetries: 0,
        timeout: this.timeout,
      });
    } catch {
      throw new Error(
        'Test-account GET transport failed; sensitive diagnostics omitted.',
      );
    }
  }

  private summary(response: APIResponse): AuthHttpResult {
    const location = response.headers().location;
    if (location && !URL.canParse(location, this.origin)) {
      throw new Error(
        'Authentication returned an invalid redirect; sensitive details omitted.',
      );
    }
    const redirect = location ? new URL(location, this.origin) : null;
    return {
      status: response.status(),
      isHtml:
        response.headers()['content-type']?.includes('text/html') ?? false,
      sameOriginRedirect: redirect?.origin === this.origin,
      // Never expose query strings, tokens, cookies or response bodies.
      redirectPath: redirect?.origin === this.origin ? redirect.pathname : null,
    };
  }
}
