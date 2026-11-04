import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { test } from 'node:test';
import { request } from '@playwright/test';
import { TestAccountAuthClient } from './test-account-auth-client.js';
import {
  ACCOUNT_AUTH_PATHS,
  ACCOUNT_LOGIN_FIELDS,
} from './test-account-auth-endpoints.js';
import { ACCOUNT_AUTH_CASES as cases } from '../../data/fixtures/account-auth-cases.js';
import { API_TRANSPORT_CASES as transport } from '../../data/fixtures/api-transport-cases.js';

type Observed = {
  method: string | undefined;
  path: string | undefined;
  body: string;
};
type Mode = 'normal' | 'redirect' | 'disconnect';

async function withAuthService(
  mode: Mode,
  run: (baseUrl: string, observed: Observed[]) => Promise<void>,
): Promise<void> {
  const observed: Observed[] = [];
  const server = createServer((incoming, response) => {
    let body = '';
    incoming.setEncoding('utf8');
    incoming.on('data', (chunk: string) => {
      body += chunk;
    });
    incoming.on('end', () => {
      observed.push({ method: incoming.method, path: incoming.url, body });
      response.setHeader('Content-Type', 'text/html');
      if (
        incoming.url === ACCOUNT_AUTH_PATHS.login &&
        incoming.method === 'POST'
      ) {
        if (mode === 'disconnect') {
          incoming.socket.destroy();
          return;
        }
        response.writeHead(302, {
          Location:
            mode === 'redirect'
              ? cases.outsidePath
              : ACCOUNT_AUTH_PATHS.accountLanding,
          'Set-Cookie': cases.cookie,
        });
        response.end();
      } else if (incoming.url === ACCOUNT_AUTH_PATHS.login) {
        const fields = Object.values(ACCOUNT_LOGIN_FIELDS).map(
          (name) =>
            `<input name="${name}" type="${name === ACCOUNT_LOGIN_FIELDS.submit ? 'hidden' : name === ACCOUNT_LOGIN_FIELDS.password ? 'password' : 'text'}" value="${name === ACCOUNT_LOGIN_FIELDS.submit ? cases.submitMarker : ''}">`,
        );
        response.end(
          `<form id="loginForm" method="POST">${fields.join('')}</form>`,
        );
      } else if (incoming.url === ACCOUNT_AUTH_PATHS.logout) {
        response.writeHead(302, {
          Location: ACCOUNT_AUTH_PATHS.home,
          'Set-Cookie': 'synthetic_auth=; Max-Age=0',
        });
        response.end();
      } else {
        const signedIn = incoming.headers.cookie?.includes(cases.cookie);
        response.end(
          signedIn
            ? `<p>${cases.credentials.username}</p><a href="${ACCOUNT_AUTH_PATHS.logout}">Sign out</a>`
            : '<p>Anonymous synthetic session</p>',
        );
      }
    });
  });
  server.listen(0, transport.hostname);
  await once(server, 'listening');
  try {
    const address = server.address();
    if (!address || typeof address === 'string')
      throw new Error('Synthetic auth service did not bind.');
    await run(
      `${transport.protocol}//${transport.hostname}:${address.port}`,
      observed,
    );
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
      server.closeAllConnections();
    });
  }
}

test('auth client confines credentials to the login POST, isolates cookies and cleans up failed assertions', async () => {
  await withAuthService('normal', async (baseUrl, observed) => {
    const settings = { baseUrl, timeout: transport.timeout };
    const client = await TestAccountAuthClient.create(
      request,
      settings,
      cases.credentials,
    );
    try {
      const form = await client.loginForm();
      assert.equal(form.observedForm, true);
      assert.equal(form.passwordInput, true);
      const login = await client.signIn();
      assert.equal(login.status, 302);
      assert.equal((await client.session()).accountIdentityVisible, true);
      const anonymous = await TestAccountAuthClient.create(
        request,
        settings,
        cases.credentials,
      );
      try {
        assert.equal((await anonymous.session()).accountIdentityVisible, false);
      } finally {
        await anonymous.dispose();
      }
      // Disposal represents fixture teardown even when a spec assertion stops early.
    } finally {
      await client.dispose();
    }
    const submissions = observed.filter((item) => item.method === 'POST');
    assert.equal(submissions.length, 1);
    const submission = submissions[0];
    assert.ok(submission);
    assert.equal(submission.path, ACCOUNT_AUTH_PATHS.login);
    const fields = new URLSearchParams(submission.body);
    assert.equal(
      fields.get(ACCOUNT_LOGIN_FIELDS.username),
      cases.credentials.username,
    );
    assert.equal(
      fields.get(ACCOUNT_LOGIN_FIELDS.password),
      cases.credentials.password,
    );
    assert.equal(fields.get(ACCOUNT_LOGIN_FIELDS.submit), cases.submitMarker);
    assert.equal(
      observed.filter((item) => item.path === ACCOUNT_AUTH_PATHS.logout).length,
      1,
    );
    assert.ok(observed.every((item) => item.method === 'POST' || !item.body));
  });
});

test('auth client refuses unprepared submission and never follows a login redirect', async () => {
  await withAuthService('redirect', async (baseUrl, observed) => {
    const client = await TestAccountAuthClient.create(
      request,
      { baseUrl, timeout: transport.timeout },
      cases.credentials,
    );
    try {
      await assert.rejects(client.signIn(), /Load and verify/);
      assert.equal(observed.length, 0);
      await client.loginForm();
      const result = await client.signIn();
      assert.equal(result.redirectPath, cases.outsidePath);
      assert.ok(!observed.some((item) => item.path === cases.outsidePath));
    } finally {
      await client.dispose();
    }
  });
});

test('auth transport errors are redacted and still trigger one sign-out cleanup', async () => {
  await withAuthService('disconnect', async (baseUrl, observed) => {
    const client = await TestAccountAuthClient.create(
      request,
      { baseUrl, timeout: transport.timeout },
      cases.credentials,
    );
    try {
      await client.loginForm();
      await assert.rejects(client.signIn(), {
        message:
          'Test-account sign-in transport failed; sensitive diagnostics omitted.',
      });
    } finally {
      await client.dispose();
    }
    assert.equal(
      observed.filter((item) => item.path === ACCOUNT_AUTH_PATHS.logout).length,
      1,
    );
    assert.equal(observed.filter((item) => item.method === 'POST').length, 1);
  });
});
