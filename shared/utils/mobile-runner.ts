import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { Environment } from '../config/env.schema.js';
import {
  requireRuntime,
  mobileProcessEnvironment,
} from '../config/load-env.js';
import { MOBILE_SETTINGS } from '../config/mobile-settings.js';
import { validateMobileWorkspace } from './mobile-workspace.js';

export const MobileOptionsSchema = z.strictObject({
  platform: z.literal('android'),
  suite: z.enum(['smoke', 'regression']).default('smoke'),
  flow: z
    .string()
    .regex(/^mobile\/flows\/[a-z0-9-]+\/[a-z0-9-]+\.yaml$/u)
    .optional(),
});
type Options = z.infer<typeof MobileOptionsSchema>;

/** Restore the captured wired display setting after success, failure or partial setup. */
export function withWiredStayAwake<T>(
  previous: string,
  change: (value: string) => void,
  action: () => T,
): T {
  const flags = z.coerce
    .number()
    .int()
    .min(0)
    .max(15)
    .parse(
      z
        .string()
        .regex(/^(?:0|[1-9]\d*)$/u)
        .parse(previous),
    );
  const errors: unknown[] = [];
  let outcome: { value: T } | undefined;
  try {
    change(String(flags | 3));
    outcome = { value: action() };
  } catch (error) {
    errors.push(error);
  }
  try {
    change(previous);
  } catch (error) {
    errors.push(error);
  }
  if (errors.length === 1) throw errors[0];
  if (errors.length > 1)
    throw new AggregateError(
      errors,
      'Mobile execution and display-setting restoration failed.',
    );
  if (!outcome) throw new Error('Mobile execution produced no outcome.');
  return outcome.value;
}

export function assertAndroidUnlocked(policy: string): void {
  const showing = /^\s*showing=(true|false)\s*$/mu.exec(policy)?.[1];
  const restricted = /^\s*inputRestricted=(true|false)\s*$/mu.exec(policy)?.[1];
  if (showing !== 'false' || restricted !== 'false')
    throw new Error(
      'The Android device is locked or its keyguard state is unknown. Unlock it manually; the runner never enters credentials or dismisses a secure lock.',
    );
}

function tool(
  root: string,
  name: 'maestro' | 'adb' | 'git',
  args: string[],
  output: 'pipe' | 'inherit' = 'pipe',
  timeout: number = MOBILE_SETTINGS.timeouts.tooling,
): string {
  // .bat entry points require cmd on Windows. Arguments are generated or
  // validated, never arbitrary CLI passthrough; no account secrets are forwarded.
  if (args.some((value) => !/^[A-Za-z0-9_./:=,{}$-]+$/u.test(value)))
    throw new Error(
      'Unsupported character in generated mobile tooling argument.',
    );
  const windowsBatch = process.platform === 'win32' && name === 'maestro';
  const result = spawnSync(
    windowsBatch ? 'cmd.exe' : name,
    windowsBatch ? ['/d', '/q', '/c', 'maestro', ...args] : args,
    {
      cwd: root,
      env: mobileProcessEnvironment(),
      encoding: 'utf8',
      stdio: output === 'inherit' ? 'inherit' : 'pipe',
      timeout,
      windowsHide: true,
    },
  );
  if (result.error || result.status !== 0)
    throw new Error(
      `${name} failed or timed out (exit ${result.status ?? 'unavailable'}). Check tool installation and selected device; no failure was ignored.`,
    );
  return result.stdout?.trim() ?? '';
}

export function runMobile(
  root: string,
  environment: Environment,
  rawOptions: unknown,
): void {
  const options: Options = MobileOptionsSchema.parse(rawOptions);
  requireRuntime(environment, options.platform);
  const {
    androidAppId: appId,
    androidDeviceId: device,
    androidAppVersion: version,
  } = environment;
  if (!appId || !device || !version)
    throw new Error('Missing verified Android configuration.');
  const available = validateMobileWorkspace(root);
  const flows = available.filter((flow) =>
    options.flow ? flow.path === options.flow : flow.suite === options.suite,
  );
  if (!flows.length)
    throw new Error(
      'No reviewed read-only flows match the requested selection.',
    );
  if (
    flows.some(
      ({ path }) => !MOBILE_SETTINGS.reviewedReadOnlyFlows.includes(path),
    )
  )
    throw new Error(
      'Flow is not in the inspected read-only allowlist; tags alone cannot authorize execution.',
    );
  if (tool(root, 'maestro', ['--version']) !== MOBILE_SETTINGS.maestroVersion)
    throw new Error(
      `Use the verified Maestro ${MOBILE_SETTINGS.maestroVersion} version.`,
    );
  const devices = tool(root, 'adb', ['devices']).split(/\r?\n/u);
  if (
    !devices.some((line) => {
      const [serial, state] = line.trim().split(/\s+/u);
      return serial === device && state === 'device';
    })
  )
    throw new Error(
      'The configured Android device is absent, offline or unauthorized.',
    );
  const installed = tool(root, 'adb', [
    '-s',
    device,
    'shell',
    'pm',
    'path',
    appId,
  ]);
  if (!installed.startsWith('package:'))
    throw new Error('The configured app is not installed on this device.');
  const metadata = tool(root, 'adb', [
    '-s',
    device,
    'shell',
    'dumpsys',
    'package',
    appId,
  ]);
  const actualVersion = /^\s*versionName=(.+)$/mu.exec(metadata)?.[1]?.trim();
  if (actualVersion !== version)
    throw new Error(
      'Installed Android app version differs from the pinned build. Inspect the build before running.',
    );
  const deviceLocale = tool(root, 'adb', [
    '-s',
    device,
    'shell',
    'settings',
    'get',
    'system',
    'system_locales',
  ])
    .split(',')[0]
    ?.replace('_', '-');
  if (deviceLocale?.split('-')[0] !== environment.locale.split('-')[0])
    throw new Error(
      'Configure the dedicated Android device to the validated Romanian locale before running.',
    );
  tool(root, 'adb', [
    '-s',
    device,
    'shell',
    'input',
    'keyevent',
    'KEYCODE_WAKEUP',
  ]);
  assertAndroidUnlocked(
    tool(root, 'adb', ['-s', device, 'shell', 'dumpsys', 'window', 'policy']),
  );
  const runId = `${new Date().toISOString().replace(/[:.]/gu, '-')}-${randomUUID()}`;
  const output = `${MOBILE_SETTINGS.reportRoot}/${runId}`;
  mkdirSync(resolve(root, output), { recursive: true });
  const deviceVersion = tool(root, 'adb', [
    '-s',
    device,
    'shell',
    'getprop',
    'ro.build.version.release',
  ]);
  writeFileSync(
    resolve(root, output, 'run.json'),
    JSON.stringify(
      {
        runId,
        sourceCommit: tool(root, 'git', ['rev-parse', 'HEAD']),
        workingTreeChanges:
          tool(root, 'git', ['status', '--porcelain']).length > 0,
        platform: options.platform,
        appId,
        appVersion: version,
        androidVersion: deviceVersion,
        device,
        locale: environment.locale,
        deviceLocale,
        maestroVersion: MOBILE_SETTINGS.maestroVersion,
        flows: flows.map(({ path }) => path),
        result: 'started',
        cleanup: 'App/device data preserved; no backend setup or writes.',
      },
      null,
      2,
    ),
  );
  console.log(`Mobile run reports: ${output}`);
  try {
    for (const flow of flows)
      tool(root, 'maestro', ['check-syntax', flow.path]);
    const originalDisplaySetting = tool(root, 'adb', [
      '-s',
      device,
      'shell',
      'settings',
      'get',
      'global',
      'stay_on_while_plugged_in',
    ]);
    writeFileSync(
      resolve(root, output, 'display-setting.json'),
      JSON.stringify({ original: originalDisplaySetting }),
    );
    withWiredStayAwake(
      originalDisplaySetting,
      (value) => {
        tool(root, 'adb', [
          '-s',
          device,
          'shell',
          'settings',
          'put',
          'global',
          'stay_on_while_plugged_in',
          value,
        ]);
        if (
          tool(root, 'adb', [
            '-s',
            device,
            'shell',
            'settings',
            'get',
            'global',
            'stay_on_while_plugged_in',
          ]) !== value
        )
          throw new Error(
            'The temporary wired display setting could not be verified or restored.',
          );
      },
      () => {
        tool(root, 'adb', [
          '-s',
          device,
          'shell',
          'input',
          'keyevent',
          'KEYCODE_WAKEUP',
        ]);
        assertAndroidUnlocked(
          tool(root, 'adb', [
            '-s',
            device,
            'shell',
            'dumpsys',
            'window',
            'policy',
          ]),
        );
        return tool(
          root,
          'maestro',
          [
            '--device',
            device,
            '--platform',
            options.platform,
            'test',
            '--config',
            MOBILE_SETTINGS.config,
            '--exclude-tags',
            MOBILE_SETTINGS.excludedTags.join(','),
            '--format',
            'junit',
            '--output',
            `${output}/junit.xml`,
            '--test-output-dir',
            `${output}/artifacts`,
            '--debug-output',
            `${output}/debug`,
            '-e',
            `APP_ID=${appId}`,
            ...flows.map(({ path }) => path),
          ],
          'inherit',
          MOBILE_SETTINGS.timeouts.run,
        );
      },
    );
    writeFileSync(
      resolve(root, output, 'result.json'),
      JSON.stringify({ result: 'passed', displaySetting: 'restored' }),
    );
  } catch (error) {
    writeFileSync(
      resolve(root, output, 'result.json'),
      JSON.stringify({ result: 'failed' }),
    );
    throw error;
  }
}
