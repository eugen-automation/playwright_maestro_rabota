import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { test } from 'node:test';
import { request } from '@playwright/test';
import { ReadOnlyApiClient } from './read-only-api-client.js';
import { API_TRANSPORT_CASES as cases } from '../../data/fixtures/api-transport-cases.js';

type ObservedRequest = Readonly<{
  method: string | undefined;
  url: string | undefined;
  cookie: string | undefined;
}>;

async function withSyntheticService(
  run: (origin: string, observed: ObservedRequest[]) => Promise<void>,
): Promise<void> {
  const observed: ObservedRequest[] = [];
  const server = createServer((incoming, response) => {
    observed.push({
      method: incoming.method,
      url: incoming.url,
      cookie: incoming.headers.cookie,
    });
    if (incoming.url === cases.paths.redirect) {
      response.writeHead(302, { Location: cases.paths.outsideContract });
    } else {
      response.writeHead(200, { 'Set-Cookie': cases.cookie });
    }
    response.end();
  });
  server.listen(0, cases.hostname);
  await once(server, 'listening');
  try {
    const address = server.address();
    if (!address || typeof address === 'string') {
      throw new Error('Synthetic HTTP service did not bind a TCP port.');
    }
    const origin = `${cases.protocol}//${cases.hostname}:${address.port}`;
    await run(origin, observed);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
      server.closeAllConnections();
    });
  }
}

test('transport refuses invalid/empty contracts and unknown operations before traffic', async () => {
  await withSyntheticService(async (baseUrl, observed) => {
    for (const path of cases.invalidPaths) {
      await assert.rejects(
        ReadOnlyApiClient.create(request, {
          baseUrl,
          operations: { read: path },
          timeout: cases.timeout,
        }),
        /relative paths|approved origin\/path/,
      );
    }
    await assert.rejects(
      ReadOnlyApiClient.create(request, {
        baseUrl,
        operations: {},
        timeout: cases.timeout,
      }),
      /No verified/,
    );
    const client = await ReadOnlyApiClient.create<string>(request, {
      baseUrl,
      operations: { read: cases.paths.read },
      timeout: cases.timeout,
    });
    try {
      await assert.rejects(
        client.get('unapproved-operation'),
        /approved contract/,
      );
      assert.equal(observed.length, 0);
    } finally {
      await client.dispose();
    }
  });
});

test('transport exposes a redirect without following it outside the contract', async () => {
  await withSyntheticService(async (baseUrl, observed) => {
    const client = await ReadOnlyApiClient.create(request, {
      baseUrl,
      operations: { redirect: cases.paths.redirect },
      timeout: cases.timeout,
    });
    try {
      const response = await client.get('redirect');
      assert.equal(response.status(), 302);
      assert.deepEqual(
        observed.map(({ method, url }) => ({ method, url })),
        [{ method: 'GET', url: cases.paths.redirect }],
      );
    } finally {
      await client.dispose();
    }
  });
});

test('transport encodes query input and isolates cookies between client contexts', async () => {
  await withSyntheticService(async (baseUrl, observed) => {
    const target = {
      baseUrl,
      operations: { read: cases.paths.read },
      timeout: cases.timeout,
    };
    const client = await ReadOnlyApiClient.create(request, target);
    try {
      await client.get('read', cases.query);
      await client.get('read');
      const isolated = await ReadOnlyApiClient.create(request, target);
      try {
        await isolated.get('read');
        assert.equal(observed.length, 3);
        const [initial, subsequent, separate] = observed;
        assert.ok(initial?.url && subsequent && separate);
        assert.equal(
          new URL(initial.url, baseUrl).searchParams.get('value'),
          cases.query.value,
        );
        assert.equal(initial.cookie, undefined);
        assert.equal(subsequent.cookie, cases.cookie);
        assert.equal(separate.cookie, undefined);
      } finally {
        await isolated.dispose();
      }
    } finally {
      await client.dispose();
    }
  });
});
