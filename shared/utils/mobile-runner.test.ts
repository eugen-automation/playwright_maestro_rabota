import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
  readFileSync,
} from 'node:fs';
import { runInNewContext } from 'node:vm';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateMobileWorkspace } from './mobile-workspace.js';
import {
  MobileOptionsSchema,
  runMobile,
  assertAndroidUnlocked,
  withWiredStayAwake,
} from './mobile-runner.js';
import { readEnvironment, requireRuntime } from '../config/load-env.js';
import { MOBILE_RUNNER_CASES as cases } from '../data/fixtures/mobile-runner-cases.js';

test('Wired display lease restores prior flags after success, action failure and partial setup failure', () => {
  const seen: string[] = [];
  assert.equal(
    withWiredStayAwake(
      '1',
      (value) => seen.push(value),
      () => true,
    ),
    true,
  );
  assert.deepEqual(seen, ['3', '1']);
  seen.length = 0;
  assert.throws(
    () =>
      withWiredStayAwake(
        '0',
        (value) => seen.push(value),
        () => {
          throw new Error('Synthetic action failure');
        },
      ),
    /Synthetic action failure/,
  );
  assert.deepEqual(seen, ['3', '0']);
  seen.length = 0;
  assert.throws(
    () =>
      withWiredStayAwake(
        '0',
        (value) => {
          seen.push(value);
          if (value === '3') throw new Error('Synthetic setup failure');
        },
        () => true,
      ),
    /Synthetic setup failure/,
  );
  assert.deepEqual(seen, ['3', '0']);
  assert.throws(() =>
    withWiredStayAwake(
      '',
      () => {
        throw new Error('Must not touch the device.');
      },
      () => true,
    ),
  );
  assert.throws(
    () =>
      withWiredStayAwake(
        '0',
        (value) => {
          if (value === '0') throw new Error('Synthetic restoration failure');
        },
        () => true,
      ),
    /Synthetic restoration failure/,
  );
  seen.length = 0;
  withWiredStayAwake(
    '4',
    (value) => seen.push(value),
    () => true,
  );
  assert.deepEqual(seen, ['7', '4']);
});

test('Maestro vacancy capture escapes title metacharacters and preserves employer identity across update timestamps', () => {
  const script = readFileSync(
    new URL('../../mobile/scripts/capture-public-vacancy.js', import.meta.url),
    'utf8',
  );
  const output: Record<string, unknown> = {};
  runInNewContext(script, {
    maestro: { copiedText: cases.vacancy.card },
    output,
  });
  const title = output.publicVacancyTitle;
  const card = output.publicVacancyCard;
  const detail = output.publicVacancyDetailTitle;
  assert.ok(typeof title === 'string' && typeof card === 'string');
  assert.ok(typeof detail === 'string');
  const titlePattern = new RegExp(title.replace('(?-i)', ''), 'u');
  const cardPattern = new RegExp(
    card.replace('(?s)', '').replace('(?-i)', ''),
    'su',
  );
  assert.match(cases.vacancy.title, titlePattern);
  assert.doesNotMatch(`${cases.vacancy.title} extra`, titlePattern);
  assert.match(cases.vacancy.changedTimestamp, cardPattern);
  assert.doesNotMatch(cases.vacancy.otherEmployer, cardPattern);
  assert.match(
    cases.vacancy.card,
    new RegExp(detail.replace('(?s)', '').replace('(?-i)', ''), 'su'),
  );
  assert.throws(
    () => runInNewContext(script, { maestro: {}, output: {} }),
    /not captured/,
  );
});

test('locked, restricted or unknown keyguard states fail before app interaction', () => {
  assertAndroidUnlocked(cases.devicePolicies.unlocked);
  for (const policy of [
    cases.devicePolicies.locked,
    cases.devicePolicies.restricted,
    cases.devicePolicies.unknown,
  ])
    assert.throws(() => assertAndroidUnlocked(policy), /Unlock it manually/);
});

function withWorkspace(run: (root: string) => void): void {
  const parent = fileURLToPath(
    new URL('../../reports/mobile/tooling/', import.meta.url),
  );
  mkdirSync(parent, { recursive: true });
  const root = mkdtempSync(resolve(parent, 'workspace-'));
  try {
    for (const [path, body] of [
      ['mobile/config.yaml', cases.config],
      [cases.paths.flow, cases.top],
      [cases.paths.launch, cases.launch],
    ]) {
      assert.ok(path && body);
      const target = resolve(root, path);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, body);
    }
    run(root);
  } finally {
    // Only the uniquely created fixture directory can be removed, never its parent.
    assert.equal(dirname(root), resolve(parent));
    rmSync(root, { recursive: true, force: false });
  }
}

test('Android requires its own device, installed build pin and explicit opt-in', () => {
  for (const variables of [
    cases.web,
    { ...cases.android, ALLOW_ANDROID_READ_ONLY: 'false' },
  ])
    assert.throws(
      () => requireRuntime(readEnvironment(variables), 'android'),
      /Android capability is disabled/,
    );
  for (const key of [
    'ANDROID_APP_ID',
    'ANDROID_DEVICE_ID',
    'ANDROID_APP_VERSION',
  ] as const)
    assert.throws(
      () =>
        requireRuntime(
          readEnvironment({ ...cases.android, [key]: undefined }),
          'android',
        ),
      /Android capability is disabled/,
    );
  requireRuntime(readEnvironment(cases.android), 'android');
  for (const runtime of ['api', 'e2e', 'auth', 'ui'] as const)
    assert.throws(() =>
      requireRuntime(readEnvironment(cases.android), runtime),
    );
  assert.throws(
    () => readEnvironment({ ...cases.android, ALLOW_ANDROID_READ_ONLY: 'yes' }),
    /ALLOW_ANDROID_READ_ONLY/,
  );
  assert.throws(
    () => requireRuntime(readEnvironment(cases.android), 'ios'),
    /disabled/,
  );
  assert.throws(
    () =>
      readEnvironment({
        ...cases.android,
        ANDROID_DEVICE_ID: 'device-one,device-two',
      }),
    /ANDROID_DEVICE_ID/,
  );
});

test('mobile selection rejects arbitrary paths, extra CLI flags and unsupported platforms', () => {
  assert.equal(
    MobileOptionsSchema.parse({ platform: 'android' }).suite,
    'smoke',
  );
  for (const value of [
    { platform: 'ios' },
    { platform: 'android', flow: cases.traversal },
    { platform: 'android', excludeTags: '' },
  ])
    assert.throws(() => MobileOptionsSchema.parse(value));
});

test('workspace validation accepts the synthetic state-preserving helper chain', () => {
  withWorkspace((root) =>
    assert.deepEqual(validateMobileWorkspace(root), [
      { path: cases.paths.flow, suite: 'smoke' },
    ]),
  );
});

test('resets, alternate app targets and scripts are rejected even inside nested helpers', () => {
  withWorkspace((root) => {
    for (const body of cases.unsafeLaunch) {
      writeFileSync(resolve(root, cases.paths.launch), body);
      assert.throws(
        () => validateMobileWorkspace(root),
        /Unsupported command|preserve app state/,
      );
    }
  });
});

test('workspace requires suite/feature/platform metadata and rejects protected configuration overrides', () => {
  withWorkspace((root) => {
    for (const body of cases.invalidTop) {
      writeFileSync(resolve(root, cases.paths.flow), body);
      assert.throws(() => validateMobileWorkspace(root));
    }
  });
});

test('workspace rejects missing exclusions, cyclic helpers and paths escaping subflows', () => {
  withWorkspace((root) => {
    writeFileSync(
      resolve(root, 'mobile/config.yaml'),
      cases.config.replace('state-reset,', ''),
    );
    assert.throws(() => validateMobileWorkspace(root), /exclusions/);
    writeFileSync(resolve(root, 'mobile/config.yaml'), cases.config);
    writeFileSync(resolve(root, cases.paths.launch), cases.cyclicLaunch);
    assert.throws(() => validateMobileWorkspace(root), /Cyclic/);
    writeFileSync(resolve(root, cases.paths.launch), cases.escapedLaunch);
    assert.throws(
      () => validateMobileWorkspace(root),
      /inside their owning directory/,
    );
  });
});

test('unreviewed flows fail before any Maestro or device process can run', () => {
  withWorkspace((root) =>
    assert.throws(
      () =>
        runMobile(root, readEnvironment(cases.android), {
          platform: 'android',
        }),
      /inspected read-only allowlist/,
    ),
  );
});
